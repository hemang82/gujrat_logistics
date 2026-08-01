import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Branch from '@/models/Branch';
import { resolveBranchId } from '@/lib/resolveBranch';

// GET: Paginated list of challans with search
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
    }

    const bookingCrossing = searchParams.get('bookingCrossing') || '';

    if (status) {
      query.status = status;
    }

    if (bookingCrossing) {
      query.bookingCrossing = bookingCrossing;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { challanNumber: searchRegex },
        { truckNo: searchRegex },
        { driverName: searchRegex },
        { memoDestinationBranch: searchRegex },
        { branch: searchRegex }
      ];
    }

    const totalChallans = await Challan.countDocuments(query);
    const challans = await Challan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('bookings', 'lrNumber consignor consignee charges items material')
      .populate('truckNo', 'vehicleNumber')
      .populate('driverName', 'name')
      .populate('branch', 'name code')
      .populate('memoDestinationBranch', 'name code')
      .populate('lrToBranch', 'name code')
      .lean();

    return NextResponse.json({
      challans,
      totalCount: totalChallans,
      totalPages: Math.ceil(totalChallans / limit),
      currentPage: page
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST: Create a new Challan
export async function POST(request: Request) {
  try {
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

    let resolvedBranch = await resolveBranchId(data.branch);
    if (!resolvedBranch) resolvedBranch = await resolveBranchId('ASL');
    if (!resolvedBranch) {
      await connectToDatabase();
      const fallbackBranch = await Branch.findOne({ isDeleted: { $ne: true } });
      if (fallbackBranch) {
        resolvedBranch = fallbackBranch._id;
      }
    }
    
    if (!resolvedBranch) {
      return NextResponse.json({ error: 'No branch available in the database. Please create a branch first.' }, { status: 400 });
    }
    data.branch = resolvedBranch;

    if (data.lrToBranch) data.lrToBranch = await resolveBranchId(data.lrToBranch);
    if (data.memoDestinationBranch) data.memoDestinationBranch = await resolveBranchId(data.memoDestinationBranch);

    await connectToDatabase();

    // Auto-generate sequential challan number if not provided
    let challanNumber = data.challanNumber;
    if (!challanNumber) {
      const lastChallan = await Challan.findOne().sort({ createdAt: -1 });
      if (lastChallan && !isNaN(Number(lastChallan.challanNumber))) {
        challanNumber = (Number(lastChallan.challanNumber) + 1).toString();
      } else {
        challanNumber = '819'; // Start from mockup default or 819
      }
    }

    // Check unique challanNumber constraint
    const existingChallan = await Challan.findOne({ challanNumber, isDeleted: false });
    if (existingChallan) {
      return NextResponse.json({ error: `Challan number ${challanNumber} already exists.` }, { status: 400 });
    }

    // Check if any of the bookings are already assigned to another active Challan
    if (data.bookings && data.bookings.length > 0) {
      const alreadyAssigned = await Challan.findOne({
        isDeleted: false,
        bookings: { $in: data.bookings }
      });
      if (alreadyAssigned) {
        return NextResponse.json({ 
          error: `One or more selected LRs are already assigned to Challan ${alreadyAssigned.challanNumber}. Please refresh the page and try again.` 
        }, { status: 400 });
      }
    }

    const newChallan = new Challan({
      challanNumber,
      branch: data.branch,
      challanDate: data.challanDate ? new Date(data.challanDate) : new Date(),
      allBranchwise: data.allBranchwise || 'All',
      bookingCrossing: data.bookingCrossing || 'Booking',
      selectiveDefault: data.selectiveDefault || 'Selective',
      lrToBranch: data.lrToBranch,
      bookings: data.bookings || [],
      truckNo: data.truckNo,
      agent: data.agent,
      memoDestinationBranch: data.memoDestinationBranch,
      driverName: data.driverName,
      truckFreight: data.truckFreight || 0,
      advanceAmount: data.advanceAmount || 0,
      commission: data.commission || 0,
      remark: data.remark,
      status: 'pending',
      createdBy: (session.user as any).id
    });

    await newChallan.save();

    // Update loaded bookings status to 'in_transit'
    if (data.bookings && data.bookings.length > 0) {
      await Booking.updateMany(
        { _id: { $in: data.bookings } },
        { 
          $set: { status: 'in_transit' },
          $push: { 
            trackingHistory: { 
              status: 'in_transit', 
              timestamp: new Date(),
              remarks: `Loaded on Challan No: ${challanNumber} with truck ${data.truckNo || 'N/A'}`
            } 
          }
        }
      );
    }

    // Update Truck and Driver status to 'on-trip'
    if (data.truckNo) {
      await Vehicle.findByIdAndUpdate(data.truckNo, { status: 'on-trip' });
    }
    if (data.driverName) {
      await Driver.findByIdAndUpdate(data.driverName, { status: 'on-trip' });
    }

    return NextResponse.json(newChallan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
