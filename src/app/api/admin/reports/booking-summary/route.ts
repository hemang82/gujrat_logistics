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
    const groupBy = searchParams.get('groupBy') || 'branch'; // 'branch' | 'date' | 'payment'

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

    const bookings = await Booking.find(query)
      .populate('bookingBranch', 'name code')
      .populate('branch', 'name code')
      .populate('destinationBranch', 'name code')
      .lean();

    // Grouping dictionary
    const summaryMap: Record<string, {
      key: string;
      title: string;
      code?: string;
      lrCount: number;
      totalPackages: number;
      totalWeight: number;
      paidAmount: number;
      toPayAmount: number;
      tbbAmount: number;
      grandTotal: number;
    }> = {};

    let grandLrs = 0;
    let grandPkgs = 0;
    let grandWeight = 0;
    let grandPaid = 0;
    let grandToPay = 0;
    let grandTbb = 0;
    let grandTotalRevenue = 0;

    bookings.forEach((b: any) => {
      let groupKey = 'All';
      let title = 'All';
      let code = '';

      if (groupBy === 'branch') {
        groupKey = (b.bookingBranch?._id || b.branch?._id || 'unknown').toString();
        title = b.bookingBranch?.name || b.branch?.name || 'Main Office';
        code = b.bookingBranch?.code || b.branch?.code || '';
      } else if (groupBy === 'destination') {
        groupKey = (b.destinationBranch?._id || b.deliveryLocation || 'unknown').toString();
        title = b.destinationBranch?.name || b.deliveryLocation || 'General Destination';
        code = b.destinationBranch?.code || '';
      } else if (groupBy === 'date') {
        const d = new Date(b.bookingDate || b.createdAt);
        groupKey = d.toISOString().split('T')[0];
        title = groupKey;
      }

      if (!summaryMap[groupKey]) {
        summaryMap[groupKey] = {
          key: groupKey,
          title,
          code,
          lrCount: 0,
          totalPackages: 0,
          totalWeight: 0,
          paidAmount: 0,
          toPayAmount: 0,
          tbbAmount: 0,
          grandTotal: 0
        };
      }

      const total = Number(b.charges?.totalAmount) || 0;
      const weight = Number(b.material?.weight) || Number(b.material?.chargedWeight) || 0;
      const pkgs = b.items && b.items.length > 0 
        ? b.items.reduce((acc: number, item: any) => acc + (Number(item.packages) || 0), 0)
        : (Number(b.material?.quantity) || 0);

      summaryMap[groupKey].lrCount += 1;
      summaryMap[groupKey].totalPackages += pkgs;
      summaryMap[groupKey].totalWeight += weight;
      summaryMap[groupKey].grandTotal += total;

      grandLrs += 1;
      grandPkgs += pkgs;
      grandWeight += weight;
      grandTotalRevenue += total;

      if (b.paymentCondition === 'paid') {
        summaryMap[groupKey].paidAmount += total;
        grandPaid += total;
      } else if (b.paymentCondition === 'to_pay') {
        summaryMap[groupKey].toPayAmount += total;
        grandToPay += total;
      } else if (b.paymentCondition === 'tbb') {
        summaryMap[groupKey].tbbAmount += total;
        grandTbb += total;
      }
    });

    const summaryList = Object.values(summaryMap).sort((a, b) => b.grandTotal - a.grandTotal);

    return NextResponse.json({
      success: true,
      groupBy,
      kpis: {
        totalLrs: grandLrs,
        totalPkgs: grandPkgs,
        totalWeight: grandWeight,
        paidAmount: grandPaid,
        toPayAmount: grandToPay,
        tbbAmount: grandTbb,
        grandTotalRevenue
      },
      summary: summaryList
    });
  } catch (error: any) {
    console.error('Booking Summary Report API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
