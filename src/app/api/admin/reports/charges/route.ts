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

    if (search && search.trim()) {
      const s = search.trim();
      const searchConditions = [
        { lrNumber: { $regex: s, $options: 'i' } },
        { 'consignor.name': { $regex: s, $options: 'i' } },
        { 'consignee.name': { $regex: s, $options: 'i' } }
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

    let grandFreight = 0;
    let grandHamali = 0;
    let grandSurcharge = 0;
    let grandPf = 0;
    let grandDd = 0;
    let grandBilty = 0;
    let grandGst = 0;
    let grandTotal = 0;

    const formatted = bookings.map((b: any) => {
      const freight = Number(b.charges?.freightAmount) || 0;
      const hamali = Number(b.charges?.hamali) || 0;
      const surcharge = Number(b.charges?.surCharge) || 0;
      const pf = Number(b.charges?.pf) || 0;
      const dd = Number(b.charges?.ddCharge) || 0;
      const bilty = Number(b.charges?.biltyCharge) || 0;
      const gst = Number(b.charges?.gstAmount) || 0;
      const total = Number(b.charges?.totalAmount) || 0;

      grandFreight += freight;
      grandHamali += hamali;
      grandSurcharge += surcharge;
      grandPf += pf;
      grandDd += dd;
      grandBilty += bilty;
      grandGst += gst;
      grandTotal += total;

      return {
        _id: b._id.toString(),
        lrNumber: b.lrNumber,
        bookingDate: b.bookingDate,
        branch: b.bookingBranch?.name || b.branch?.name || 'N/A',
        consignorName: b.consignor?.name || 'N/A',
        consigneeName: b.consignee?.name || 'N/A',
        freight,
        hamali,
        surcharge,
        pf,
        dd,
        bilty,
        gst,
        total,
        paymentCondition: b.paymentCondition || 'to_pay'
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalRecords: formatted.length,
        grandFreight,
        grandHamali,
        grandSurcharge,
        grandPf,
        grandDd,
        grandBilty,
        grandGst,
        grandTotal
      },
      records: formatted
    });
  } catch (error: any) {
    console.error('Charges Register API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
