import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Challan from '@/models/Challan';
import Branch from '@/models/Branch';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Branch.init();
    Challan.init();

    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    const search = searchParams.get('search');
    const daysOld = searchParams.get('daysOld'); // e.g. 1, 3, 7 days lying in warehouse

    const role = (session.user as any)?.role;
    const userBranch = (session.user as any)?.branch || (session.user as any)?.bookingBranch;
    const userLogisticId = role === 'logistic' ? (session.user as any)?.id : (session.user as any)?.logisticId;

    // 1. Get all LR IDs currently attached to active Challans (in_transit or pending)
    const challanFilter: any = { isDeleted: { $ne: true } };
    if (role === 'logistic' || userLogisticId) {
      challanFilter.logisticId = userLogisticId;
    }
    const activeChallans = await Challan.find(challanFilter).select('bookings').lean();
    const loadedBookingIds: string[] = [];
    activeChallans.forEach((c: any) => {
      if (c.bookings && Array.isArray(c.bookings)) {
        c.bookings.forEach((bid: any) => {
          loadedBookingIds.push(bid.toString());
        });
      }
    });

    // 2. Query for Left Bookings: status is 'pending', not cancelled/delivered, and NOT in any Challan
    const query: any = {
      isDeleted: { $ne: true },
      status: 'pending',
      _id: { $nin: loadedBookingIds }
    };

    if (role === 'logistic' || userLogisticId) {
      query.logisticId = userLogisticId;
    }

    if (role === 'branch_user' || role === 'branch') {
      if (userBranch) {
        let branchId = userBranch;
        try {
          if (typeof userBranch === 'string' && /^[0-9a-fA-F]{24}$/.test(userBranch)) {
            branchId = new mongoose.Types.ObjectId(userBranch);
          }
        } catch (e) {}
        query.$or = [{ bookingBranch: branchId }, { branch: branchId }];
      }
    } else if (branch && branch !== 'all') {
      let branchId: any = branch;
      try {
        if (typeof branch === 'string' && /^[0-9a-fA-F]{24}$/.test(branch)) {
          branchId = new mongoose.Types.ObjectId(branch);
        }
      } catch (e) {}
      query.$or = [{ bookingBranch: branchId }, { branch: branchId }];
    }

    // Days old filter (how long it has been sitting in warehouse)
    if (daysOld) {
      const days = parseInt(daysOld, 10);
      if (!isNaN(days) && days > 0) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - days);
        thresholdDate.setHours(23, 59, 59, 999);
        query.bookingDate = { $lte: thresholdDate };
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      const searchConditions = [
        { lrNumber: { $regex: s, $options: 'i' } },
        { 'consignor.name': { $regex: s, $options: 'i' } },
        { 'consignee.name': { $regex: s, $options: 'i' } },
        { deliveryLocation: { $regex: s, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const bookings = await Booking.find(query)
      .sort({ bookingDate: 1, createdAt: 1 }) // Oldest first so dispatch team prioritizes them
      .populate('bookingBranch', 'name code')
      .populate('branch', 'name code')
      .populate('destinationBranch', 'name code')
      .lean();

    let totalFreight = 0;
    let grandTotal = 0;
    let totalWeight = 0;
    let totalPackages = 0;

    const now = new Date();

    const formattedList = bookings.map((b: any) => {
      const freight = Number(b.charges?.freightAmount) || 0;
      const total = Number(b.charges?.totalAmount) || 0;
      const weight = Number(b.material?.weight) || Number(b.material?.chargedWeight) || 0;
      
      const pkgs = b.items && b.items.length > 0 
        ? b.items.reduce((acc: number, item: any) => acc + (Number(item.packages) || 0), 0)
        : (Number(b.material?.quantity) || 0);

      totalFreight += freight;
      grandTotal += total;
      totalWeight += weight;
      totalPackages += pkgs;

      // Calculate days in warehouse
      const bDate = new Date(b.bookingDate || b.createdAt);
      const diffTime = Math.abs(now.getTime() - bDate.getTime());
      const ageInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: b._id.toString(),
        lrNumber: b.lrNumber,
        bookingDate: b.bookingDate,
        ageInDays,
        fromBranch: b.bookingBranch?.name || b.branch?.name || 'N/A',
        fromBranchCode: b.bookingBranch?.code || b.branch?.code || '',
        toBranch: b.destinationBranch?.name || b.deliveryLocation || 'N/A',
        toBranchCode: b.destinationBranch?.code || '',
        consignorName: b.consignor?.name || 'N/A',
        consignorPhone: b.consignor?.phone || '',
        consigneeName: b.consignee?.name || 'N/A',
        consigneePhone: b.consignee?.phone || '',
        itemName: b.material?.itemName || (b.items?.[0]?.description) || 'General Goods',
        packages: pkgs,
        weight: weight,
        freightAmount: freight,
        totalAmount: total,
        paymentCondition: b.paymentCondition || 'to_pay',
        status: 'Unloaded in Warehouse'
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedList.length,
      kpis: {
        totalLeftBookings: formattedList.length,
        totalPackages,
        totalWeight,
        totalFreight,
        grandTotal
      },
      bookings: formattedList
    });
  } catch (error: any) {
    console.error('Left Booking Report API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
