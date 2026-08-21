import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { resolveBranchId } from '@/lib/resolveBranch';

export const dynamic = 'force-dynamic';

// GET: Single Challan by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if ((session.user as any).role === 'branch' && (session.user as any).permissions?.challans?.canView === false) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view Challans' }, { status: 403 });
    }

    const logisticId = (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId;
    const branchFilter = (session.user as any).role === 'branch' ? { branch: (session.user as any).branch } : {};

    const challan = await Challan.findOne({ _id: id, logisticId, ...branchFilter, isDeleted: false })
      .populate({
        path: 'bookings',
        select: 'lrNumber bookingDate consignor consignee pickupLocation deliveryLocation charges items rateType destinationBranch paymentCondition',
        populate: { path: 'destinationBranch', select: 'name code' }
      })
      .populate('truckNo', 'vehicleNumber')
      .populate('driverName', 'name')
      .populate('branch', 'name code')
      .populate('lrToBranch', 'name code')
      .populate('memoDestinationBranch', 'name code')
      .populate('logisticId', 'name companyLogo')
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

    if ((session.user as any).role === 'branch' && (session.user as any).permissions?.challans?.canEdit === false) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to edit Challans' }, { status: 403 });
    }
    if (data.branch === "") delete data.branch;
    if (data.lrToBranch === "") delete data.lrToBranch;
    if (data.memoDestinationBranch === "") delete data.memoDestinationBranch;
    if (data.truckNo === "") delete data.truckNo;
    if (data.driverName === "") delete data.driverName;

    if (data.branch) data.branch = await resolveBranchId(data.branch);
    if (data.lrToBranch) data.lrToBranch = await resolveBranchId(data.lrToBranch);
    if (data.memoDestinationBranch) data.memoDestinationBranch = await resolveBranchId(data.memoDestinationBranch);

    await connectToDatabase();

    const logisticId = (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId;
    const branchFilter = (session.user as any).role === 'branch' ? { branch: (session.user as any).branch } : {};

    const oldChallan = await Challan.findOne({ _id: id, logisticId, ...branchFilter });
    if (!oldChallan || oldChallan.isDeleted) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    const oldBookings = oldChallan.bookings.map(b => b.toString());
    const newBookings = (data.bookings || []).map((b: string) => b.toString());

    // Identify added and removed bookings
    const addedBookings = newBookings.filter((b: string) => !oldBookings.includes(b));
    const removedBookings = oldBookings.filter((b: string) => !newBookings.includes(b));

    const oldTruck = oldChallan.truckNo?.toString();
    const oldDriver = oldChallan.driverName?.toString();

    // Check if any of the added bookings are already assigned to another active Challan
    if (addedBookings.length > 0) {
      const alreadyAssigned = await Challan.findOne({
        _id: { $ne: id }, // Exclude current challan
        isDeleted: false,
        bookings: { $in: addedBookings }
      });
      if (alreadyAssigned) {
        return NextResponse.json({ 
          error: `One or more selected LRs are already assigned to Challan ${alreadyAssigned.challanNumber}. Please refresh the page and try again.` 
        }, { status: 400 });
      }
    }

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
              remarks: `Added to Challan No: ${oldChallan.challanNumber}`
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

    // Handle Vehicle and Driver status updates
    const newTruck = oldChallan.truckNo?.toString();
    const newDriver = oldChallan.driverName?.toString();
    const newStatus = oldChallan.status;

    if (newStatus === 'delivered') {
      if (oldTruck) await Vehicle.findByIdAndUpdate(oldTruck, { status: 'available' });
      if (oldDriver) await Driver.findByIdAndUpdate(oldDriver, { status: 'available' });
    } else {
      // Free old truck if changed
      if (oldTruck && oldTruck !== newTruck) {
        await Vehicle.findByIdAndUpdate(oldTruck, { status: 'available' });
      }
      // Set new truck to on-trip
      if (newTruck && oldTruck !== newTruck) {
        await Vehicle.findByIdAndUpdate(newTruck, { status: 'on-trip' });
      }

      // Free old driver if changed
      if (oldDriver && oldDriver !== newDriver) {
        await Driver.findByIdAndUpdate(oldDriver, { status: 'available' });
      }
      // Set new driver to on-trip
      if (newDriver && oldDriver !== newDriver) {
        await Driver.findByIdAndUpdate(newDriver, { status: 'on-trip' });
      }
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

    const logisticId = (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId;
    const branchFilter = (session.user as any).role === 'branch' ? { branch: (session.user as any).branch } : {};

    const challan = await Challan.findOne({ _id: id, logisticId, ...branchFilter });
    if (!challan || challan.isDeleted) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    challan.isDeleted = true;
    challan.challanNumber = `${challan.challanNumber}_deleted_${Date.now()}`;
    await challan.save();

    // Reset truck and driver to available if challan is deleted before delivery
    if (challan.status !== 'delivered') {
      if (challan.truckNo) {
        await Vehicle.findByIdAndUpdate(challan.truckNo, { status: 'available' });
      }
      if (challan.driverName) {
        await Driver.findByIdAndUpdate(challan.driverName, { status: 'available' });
      }
    }

    // Unmark bookings in this challan associated bookings status back to 'pending'
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
