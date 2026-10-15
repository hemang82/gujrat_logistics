import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Ensure Branch model is registered for population
    Branch.init();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branch = searchParams.get('branch');
    const paymentCondition = searchParams.get('paymentCondition'); // paid | to_pay | tbb
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const role = (session.user as any)?.role;
    const userBranch = (session.user as any)?.branch || (session.user as any)?.bookingBranch;
    const userLogisticId = role === 'logistic' ? (session.user as any)?.id : (session.user as any)?.logisticId;

    const query: any = { isDeleted: { $ne: true } };

    // Tenant Scoping
    if (role === 'logistic' || userLogisticId) {
      query.logisticId = userLogisticId;
    }

    // Role Scoping: Branch users can only view their own branch
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

    // Date Range Filter (Default: Today if not specified)
    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.bookingDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.bookingDate.$lte = end;
      }
    }

    if (paymentCondition && paymentCondition !== 'all') {
      query.paymentCondition = paymentCondition;
    }

    if (status && status !== 'all') {
      query.status = status;
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

    // Fetch records sorted newest to oldest
    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1, createdAt: -1 })
      .populate('bookingBranch', 'name code')
      .populate('branch', 'name code')
      .populate('destinationBranch', 'name code')
      .lean();

    // Calculate aggregated KPIs
    let totalFreight = 0;
    let totalHamali = 0;
    let totalSurCharge = 0;
    let totalGst = 0;
    let grandTotal = 0;
    let totalWeight = 0;
    let totalPackages = 0;

    let paidAmount = 0;
    let toPayAmount = 0;
    let tbbAmount = 0;

    const formattedList = bookings.map((b: any) => {
      const freight = Number(b.charges?.freightAmount) || 0;
      const hamali = Number(b.charges?.hamali) || 0;
      const sur = Number(b.charges?.surCharge) || 0;
      const gst = Number(b.charges?.gstAmount) || 0;
      const total = Number(b.charges?.totalAmount) || 0;
      const weight = Number(b.material?.weight) || Number(b.material?.chargedWeight) || 0;
      
      const pkgs = b.items && b.items.length > 0 
        ? b.items.reduce((acc: number, item: any) => acc + (Number(item.packages) || 0), 0)
        : (Number(b.material?.quantity) || 0);

      totalFreight += freight;
      totalHamali += hamali;
      totalSurCharge += sur;
      totalGst += gst;
      grandTotal += total;
      totalWeight += weight;
      totalPackages += pkgs;

      if (b.paymentCondition === 'paid') paidAmount += total;
      else if (b.paymentCondition === 'to_pay') toPayAmount += total;
      else if (b.paymentCondition === 'tbb') tbbAmount += total;

      return {
        _id: b._id.toString(),
        lrNumber: b.lrNumber,
        bookingDate: b.bookingDate,
        fromBranch: b.bookingBranch?.name || b.branch?.name || 'N/A',
        fromBranchCode: b.bookingBranch?.code || b.branch?.code || '',
        toBranch: b.destinationBranch?.name || b.deliveryLocation || 'N/A',
        toBranchCode: b.destinationBranch?.code || '',
        consignorName: b.consignor?.name || 'N/A',
        consignorPhone: b.consignor?.phone || '',
        consignorGst: b.consignor?.gstNumber || '',
        consigneeName: b.consignee?.name || 'N/A',
        consigneePhone: b.consignee?.phone || '',
        consigneeGst: b.consignee?.gstNumber || '',
        itemName: b.material?.itemName || (b.items?.[0]?.description) || 'General Goods',
        packages: pkgs,
        weight: weight,
        freightAmount: freight,
        hamali: hamali,
        surCharge: sur,
        gstAmount: gst,
        totalAmount: total,
        paymentCondition: b.paymentCondition || 'to_pay',
        status: b.status || 'pending',
        invoiceNo: b.invoiceNo || '',
        ewayBillNo: b.ewayBillNo || ''
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedList.length,
      kpis: {
        totalBookings: formattedList.length,
        totalPackages,
        totalWeight,
        totalFreight,
        totalHamali,
        totalSurCharge,
        totalGst,
        grandTotal,
        paidAmount,
        toPayAmount,
        tbbAmount
      },
      bookings: formattedList
    });
  } catch (error: any) {
    console.error('Daily Booking Register API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
