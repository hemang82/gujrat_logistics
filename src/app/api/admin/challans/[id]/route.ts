import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import { resolveBranchId } from '@/lib/resolveBranch';

// GET: Single Challan by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const challan = await Challan.findOne({ _id: id, isDeleted: false })
      .populate({
        path: 'bookings',
        select: 'lrNumber bookingDate consignor consignee pickupLocation deliveryLocation charges items rateType deliveryLocation'
      })
      .populate('truckNo', 'vehicleNumber')
      .populate('driverName', 'name')
      .lean();

    if (!challan) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    return NextResponse.json(challan);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT: Update Challan details
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (data.branch === "") delete data.branch;
    if (data.lrToBranch === "") delete data.lrToBranch;
    if (data.memoDestinationBranch === "") delete data.memoDestinationBranch;
    if (data.truckNo === "") delete data.truckNo;
    if (data.driverName === "") delete data.driverName;

    if (data.branch) data.branch = await resolveBranchId(data.branch);
    if (data.lrToBranch) data.lrToBranch = await resolveBranchId(data.lrToBranch);
    if (data.memoDestinationBranch) data.memoDestinationBranch = await resolveBranchId(data.memoDestinationBranch);

    await connectToDatabase();

    const oldChallan = await Challan.findById(id);
    if (!oldChallan || oldChallan.isDeleted) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    const oldBookings = oldChallan.bookings.map(b => b.toString());
    const newBookings = (data.bookings || []).map((b: string) => b.toString());

    // Identify added and removed bookings
    const addedBookings = newBookings.filter((b: string) => !oldBookings.includes(b));
    const removedBookings = oldBookings.filter((b: string) => !newBookings.includes(b));

    // Update fields
    oldChallan.branch = data.branch || oldChallan.branch;
    oldChallan.challanDate = data.challanDate ? new Date(data.challanDate) : oldChallan.challanDate;
    oldChallan.allBranchwise = data.allBranchwise || oldChallan.allBranchwise;
    oldChallan.bookingCrossing = data.bookingCrossing || oldChallan.bookingCrossing;
    oldChallan.selectiveDefault = data.selectiveDefault || oldChallan.selectiveDefault;
    oldChallan.lrToBranch = data.lrToBranch;
    oldChallan.bookings = data.bookings || [];
    oldChallan.truckNo = data.truckNo;
    oldChallan.agent = data.agent;
    oldChallan.memoDestinationBranch = data.memoDestinationBranch;
    oldChallan.driverName = data.driverName;
    oldChallan.truckFreight = data.truckFreight || 0;
    oldChallan.advanceAmount = data.advanceAmount || 0;
    oldChallan.commission = data.commission || 0;
    oldChallan.remark = data.remark;
    oldChallan.status = data.status || oldChallan.status;

    await oldChallan.save();

    // Mark added bookings as 'in_transit'
    if (addedBookings.length > 0) {
      await Booking.updateMany(
        { _id: { $in: addedBookings } },
        { 
          $set: { status: 'in_transit' },
          $push: { 
            trackingHistory: { 
              status: 'in_transit', 
              timestamp: new Date(),
              remarks: `Added to Challan No: ${oldChallan.challanNumber} with truck ${data.truckNo || 'N/A'}`
            } 
          }
        }
      );
    }

    // Reset removed bookings status to 'pending'
    if (removedBookings.length > 0) {
      await Booking.updateMany(
        { _id: { $in: removedBookings } },
        { 
          $set: { status: 'pending' },
          $push: { 
            trackingHistory: { 
              status: 'pending', 
              timestamp: new Date(),
              remarks: `Removed from Challan No: ${oldChallan.challanNumber}`
            } 
          }
        }
      );
    }

    return NextResponse.json(oldChallan);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE: Soft delete Challan
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const challan = await Challan.findById(id);
    if (!challan || challan.isDeleted) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    challan.isDeleted = true;
    await challan.save();

    // Reset all associated bookings status back to 'pending'
    if (challan.bookings && challan.bookings.length > 0) {
      await Booking.updateMany(
        { _id: { $in: challan.bookings } },
        { 
          $set: { status: 'pending' },
          $push: { 
            trackingHistory: { 
              status: 'pending', 
              timestamp: new Date(),
              remarks: `Reset due to deletion of Challan No: ${challan.challanNumber}`
            } 
          }
        }
      );
    }

    return NextResponse.json({ success: true, message: 'Challan deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
