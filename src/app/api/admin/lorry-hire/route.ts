import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import Challan from '@/models/Challan';
import { addCashTransaction } from '@/lib/ledgerUtils';
import Booking from '@/models/Booking'; // Required to populate nested LRs in Challan
import Branch from '@/models/Branch';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import { EwayBillService } from '@/services/ewaybillService';

// Helper to generate next Lorry Hire Voucher No
async function generateNextVoucherNo() {
  const lastDoc = await LorryHire.findOne().sort({ createdAt: -1 });
  if (!lastDoc || !lastDoc.voucherNo) return 'LH-1001';
  
  const lastNo = lastDoc.voucherNo;
  const match = lastNo.match(/LH-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return `LH-${nextNum}`;
  }
  return 'LH-1001';
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateStr = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    let query: any = { isDeleted: { $ne: true } };

    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
      if ((session.user as any).role === 'branch' && (session.user as any).branch) {
        const userBranchId = new mongoose.Types.ObjectId((session.user as any).branch);
        query.$or = [
          { fromBranch: userBranchId },
          { toBranch: userBranchId }
        ];
      }
    }

    if (status) {
      query.status = status;
    }

    if (dateStr) {
      const selectedDate = new Date(dateStr);
      if (!isNaN(selectedDate.getTime())) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = {
          $gte: selectedDate.toISOString(),
          $lt: nextDay.toISOString()
        };
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      const matchingVehicles = await Vehicle.find({ vehicleNumber: searchRegex }, '_id').lean();
      const matchingBranches = await Branch.find({ 
        $or: [ { name: searchRegex }, { code: searchRegex } ] 
      }, '_id').lean();

      const vehicleIds = matchingVehicles.map(v => v._id);
      const branchIds = matchingBranches.map(b => b._id);

      const searchConditions: any[] = [
        { voucherNo: searchRegex }
      ];

      if (vehicleIds.length > 0) searchConditions.push({ truckNo: { $in: vehicleIds } });
      if (branchIds.length > 0) searchConditions.push({ fromBranch: { $in: branchIds } });
      if (branchIds.length > 0) searchConditions.push({ toBranch: { $in: branchIds } });

      if (query.$or) {
        // If $or already exists (from branch filter), use $and
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const totalCount = await LorryHire.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const list = await LorryHire.find(query)
      .populate('fromBranch', 'name code')
      .populate('toBranch', 'name code')
      .populate('truckNo', 'vehicleNumber')
      .populate('balancePaidBy', 'name code')
      .populate({
        path: 'challans',
        populate: [
          { path: 'bookings', model: 'Booking' },
          { path: 'memoDestinationBranch', model: 'Branch', select: 'name code' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ lorryHires: list, totalPages, totalCount, currentPage: page });
  } catch (error: any) {
    console.error('LorryHire GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    // Generate voucher no
    const voucherNo = await generateNextVoucherNo();

    // Auto-calculate status based on balance
    const total = Number(body.totalAmount) || 0;
    const advance = Number(body.advanceAmount) || 0;
    const comm = Number(body.commission) || 0;
    const tds = Number(body.tds) || 0;
    const hamali = Number(body.hamali) || 0;
    body.balanceAmount = total - advance - comm - tds + hamali; // Force strict backend calculation
    
    let finalStatus = body.status || 'pending';
    
    // If balance is 0 or less (and there is a total amount), mark as completed
    if (total > 0 && advance >= total) {
      finalStatus = 'completed';
    }

    const logisticId = (session.user as any).role === 'logistic' ? session.user.id : (session.user as any).logisticId;
    const userDoc = await User.findById(logisticId);
    const hasEwbAccess = userDoc?.ewbApiAccess || false;

    const newDoc = new LorryHire({
      ...body,
      logisticId,
      status: finalStatus,
      voucherNo,
      hasEwbAccess,
      createdBy: session.user.id
    });

    await newDoc.save();

    let allBookingIds: string[] = [];
    
    // Cascade truck and driver to Challans and Bookings
    if (body.challans && body.challans.length > 0) {
      // 1. Update Challan with truck and driver, and set status to 'in_transit'
      await Challan.updateMany(
        { _id: { $in: body.challans } },
        { 
          $set: { 
            status: 'in_transit',
            truckNo: body.truckNo,
            driverName: body.driver
          } 
        }
      );

      // 2. Fetch all bookings inside these challans to update them
      const challansData = await Challan.find({ _id: { $in: body.challans } }).select('bookings');
      challansData.forEach(c => {
        if (c.bookings) {
          allBookingIds = allBookingIds.concat(c.bookings.map((b: any) => b.toString()));
        }
      });

      // 3. Update Bookings with truck and driver
      if (allBookingIds.length > 0) {
        await Booking.updateMany(
          { _id: { $in: allBookingIds } },
          { 
            $set: { 
              vehicle: body.truckNo,
              driver: body.driver 
            }
          }
        );
      }
    }

    // 4. Update Truck and Driver status to 'on-trip'
    if (body.truckNo) {
      const Vehicle = require('@/models/Vehicle').default;
      await Vehicle.findByIdAndUpdate(body.truckNo, { status: 'on-trip' });
    }
    if (body.driver) {
      const Driver = require('@/models/Driver').default;
      await Driver.findByIdAndUpdate(body.driver, { status: 'on-trip' });
    }

    // Ledger: If advance is paid, debit from origin branch
    if (newDoc.advanceAmount && newDoc.advanceAmount > 0) {
      await addCashTransaction({
        branchId: newDoc.fromBranch.toString(),
        type: 'debit',
        amount: newDoc.advanceAmount,
        referenceType: 'LorryHire',
        referenceId: newDoc._id.toString(),
        description: `Advance paid for LH Memo: ${newDoc.voucherNo}`,
        createdBy: session.user.id
      });
    }

    return NextResponse.json({ success: true, message: 'Lorry Hire created successfully', data: newDoc }, { status: 201 });
  } catch (error: any) {
    console.error('LorryHire POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
