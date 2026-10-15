import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import Branch from '@/models/Branch';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Branch.init();
    Vehicle.init();
    Driver.init();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branch = searchParams.get('branch');
    const status = searchParams.get('status');
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
        query.$or = [{ fromBranch: branchId }, { toBranch: branchId }];
      }
    } else if (branch && branch !== 'all') {
      let branchId: any = branch;
      try {
        if (typeof branch === 'string' && /^[0-9a-fA-F]{24}$/.test(branch)) {
          branchId = new mongoose.Types.ObjectId(branch);
        }
      } catch (e) {}
      query.$or = [{ fromBranch: branchId }, { toBranch: branchId }];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { voucherNo: { $regex: s, $options: 'i' } }
      ];
    }

    const records = await LorryHire.find(query)
      .sort({ date: -1, createdAt: -1 })
      .populate('fromBranch', 'name code')
      .populate('toBranch', 'name code')
      .populate('truckNo', 'vehicleNumber')
      .populate('driver', 'name phone')
      .populate('balancePaidBy', 'name code')
      .lean();

    let grandTotalAmount = 0;
    let grandAdvanceAmount = 0;
    let grandCommission = 0;
    let grandHamali = 0;
    let grandBalanceAmount = 0;

    const formatted = records.map((lh: any) => {
      const total = Number(lh.totalAmount) || 0;
      const advance = Number(lh.advanceAmount) || 0;
      const commission = Number(lh.commission) || 0;
      const hamali = Number(lh.hamali) || 0;
      const balance = Number(lh.balanceAmount) || (total - advance - commission + hamali);

      grandTotalAmount += total;
      grandAdvanceAmount += advance;
      grandCommission += commission;
      grandHamali += hamali;
      grandBalanceAmount += balance;

      return {
        _id: lh._id.toString(),
        voucherNo: lh.voucherNo,
        date: lh.date,
        fromBranch: lh.fromBranch?.name || 'N/A',
        fromBranchCode: lh.fromBranch?.code || '',
        toBranch: lh.toBranch?.name || 'N/A',
        toBranchCode: lh.toBranch?.code || '',
        truckNo: lh.truckNo?.vehicleNumber || 'N/A',
        driverName: lh.driver?.name || 'N/A',
        driverPhone: lh.driver?.phone || '',
        challansCount: lh.challans?.length || 0,
        totalAmount: total,
        advanceAmount: advance,
        commission,
        hamali,
        balanceAmount: balance,
        balancePaidBy: lh.balancePaidBy?.name || '',
        status: lh.status || 'pending',
        remark: lh.remark || ''
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalVouchers: formatted.length,
        grandTotalAmount,
        grandAdvanceAmount,
        grandCommission,
        grandHamali,
        grandBalanceAmount
      },
      records: formatted
    });
  } catch (error: any) {
    console.error('Lorry Hire Report API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
