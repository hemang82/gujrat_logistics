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
    Branch.init();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branch = searchParams.get('branch');
    const gstType = searchParams.get('gstType'); // 'all' | 'with_gst' | 'without_gst'
    const search = searchParams.get('search');

    const role = (session.user as any)?.role;
    const userBranch = (session.user as any)?.branch || (session.user as any)?.bookingBranch;
    const userLogisticId = role === 'logistic' ? (session.user as any)?.id : (session.user as any)?.logisticId;

    const query: any = { isDeleted: { $ne: true } };

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

    if (gstType === 'with_gst') {
      query['charges.gstAmount'] = { $gt: 0 };
    } else if (gstType === 'without_gst') {
      query.$or = [
        { 'charges.gstAmount': { $lte: 0 } },
        { 'charges.gstAmount': { $exists: false } }
      ];
    }

    if (search && search.trim()) {
      const s = search.trim();
      const searchConditions = [
        { lrNumber: { $regex: s, $options: 'i' } },
        { 'consignor.name': { $regex: s, $options: 'i' } },
        { 'consignor.gstNumber': { $regex: s, $options: 'i' } },
        { 'consignee.name': { $regex: s, $options: 'i' } },
        { 'consignee.gstNumber': { $regex: s, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1, createdAt: -1 })
      .populate('bookingBranch', 'name code')
      .populate('branch', 'name code')
      .lean();

    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalGstAmount = 0;
    let totalInvoiceAmount = 0;

    const formatted = bookings.map((b: any) => {
      const freight = Number(b.charges?.freightAmount) || 0;
      const hamali = Number(b.charges?.hamali) || 0;
      const sur = Number(b.charges?.surCharge) || 0;
      const taxable = freight + hamali + sur;
      const gstRate = Number(b.charges?.gstRate) || (b.charges?.gstAmount > 0 ? 5 : 0);
      const gstAmount = Number(b.charges?.gstAmount) || 0;
      const total = Number(b.charges?.totalAmount) || (taxable + gstAmount);

      // Half CGST, Half SGST for intra-state by default
      const cgst = Math.round((gstAmount / 2) * 100) / 100;
      const sgst = Math.round((gstAmount / 2) * 100) / 100;

      totalTaxableValue += taxable;
      totalCgst += cgst;
      totalSgst += sgst;
      totalGstAmount += gstAmount;
      totalInvoiceAmount += total;

      return {
        _id: b._id.toString(),
        lrNumber: b.lrNumber,
        bookingDate: b.bookingDate,
        branch: b.bookingBranch?.name || b.branch?.name || 'N/A',
        consignorName: b.consignor?.name || 'N/A',
        consignorGst: b.consignor?.gstNumber || 'Unregistered',
        consigneeName: b.consignee?.name || 'N/A',
        consigneeGst: b.consignee?.gstNumber || 'Unregistered',
        taxableValue: taxable,
        gstRate,
        cgst,
        sgst,
        gstAmount,
        totalAmount: total,
        paymentCondition: b.paymentCondition || 'to_pay'
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalRecords: formatted.length,
        totalTaxableValue,
        totalCgst,
        totalSgst,
        totalGstAmount,
        totalInvoiceAmount
      },
      records: formatted
    });
  } catch (error: any) {
    console.error('GST Tax Register API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
