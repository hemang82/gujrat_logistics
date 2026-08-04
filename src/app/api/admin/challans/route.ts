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

    if ((session.user as any).role === 'branch' && (session.user as any).permissions?.challans?.canView === false) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view Challans' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateStr = searchParams.get('date') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
      if ((session.user as any).role === 'branch' && (session.user as any).branch) {
        query.branch = (session.user as any).branch;
      }
    }

    const bookingCrossing = searchParams.get('bookingCrossing') || '';
    const branch = searchParams.get('branch') || '';

    if (status) {
      query.status = status;
    }

    if (bookingCrossing) {
      query.bookingCrossing = bookingCrossing;
    }

    if (branch && (session.user as any).role !== 'branch') {
      query.branch = branch;
    }

    if (dateStr) {
      const selectedDate = new Date(dateStr);
      if (!isNaN(selectedDate.getTime())) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.challanDate = {
          $gte: selectedDate.toISOString(),
          $lt: nextDay.toISOString()
        };
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Look up matching references
      const matchingVehicles = await Vehicle.find({ vehicleNumber: searchRegex }, '_id').lean();
      const matchingDrivers = await Driver.find({ name: searchRegex }, '_id').lean();
      const matchingBranches = await Branch.find({ name: searchRegex }, '_id').lean();
      
      const vehicleIds = matchingVehicles.map(v => v._id);
      const driverIds = matchingDrivers.map(d => d._id);
      const branchIds = matchingBranches.map(b => b._id);

      query.$or = [
        { challanNumber: searchRegex }
      ];

      if (vehicleIds.length > 0) query.$or.push({ truckNo: { $in: vehicleIds } });
      if (driverIds.length > 0) query.$or.push({ driverName: { $in: driverIds } });
      if (branchIds.length > 0) {
        query.$or.push({ memoDestinationBranch: { $in: branchIds } });
        query.$or.push({ branch: { $in: branchIds } });
      }
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

    if ((session.user as any).role === 'branch' && (session.user as any).permissions?.challans?.canAdd === false) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to add Challans' }, { status: 403 });
    }
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
    
    // Always use logistic scope for numbering
    const logisticId = (session.user as any).role === 'logistic' 
      ? (session.user as any).id 
      : (session.user as any).logisticId;

    if (!challanNumber) {
      // Find the highest existing numeric challan number for this SPECIFIC branch
      const allChallans = await Challan.find({ 
        challanNumber: { $exists: true }, 
        branch: data.branch,
        logisticId,
        isDeleted: false
      }, { challanNumber: 1 });
      
      let maxNum = 800; // So first will be 801
      allChallans.forEach((c: any) => {
        if (c.challanNumber) {
          const num = parseInt(String(c.challanNumber).replace(/\D/g, ''), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      challanNumber = (maxNum + 1).toString();
    } else {
      // If frontend sent a number, verify it's not taken for THIS branch — if taken, auto-increment
      const existingChallan = await Challan.findOne({ 
        challanNumber: String(challanNumber), 
        branch: data.branch,
        logisticId,
        isDeleted: false 
      });
      
      if (existingChallan) {
        // Auto-increment instead of throwing error
        const allChallans = await Challan.find({ 
          challanNumber: { $exists: true }, 
          branch: data.branch,
          logisticId,
          isDeleted: false
        }, { challanNumber: 1 });
        
        let maxNum = 800;
        allChallans.forEach((c: any) => {
          if (c.challanNumber) {
            const num = parseInt(String(c.challanNumber).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        challanNumber = (maxNum + 1).toString();
      }
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
      logisticId,
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
