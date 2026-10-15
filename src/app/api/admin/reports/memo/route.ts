import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
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
    Booking.init();
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
        query.$or = [{ branch: branchId }, { memoDestinationBranch: branchId }];
      }
    } else if (branch && branch !== 'all') {
      let branchId: any = branch;
      try {
        if (typeof branch === 'string' && /^[0-9a-fA-F]{24}$/.test(branch)) {
          branchId = new mongoose.Types.ObjectId(branch);
        }
      } catch (e) {}
      query.$or = [{ branch: branchId }, { memoDestinationBranch: branchId }];
    }

    if (startDate || endDate) {
      query.challanDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.challanDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.challanDate.$lte = end;
      }
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      const numOnly = s.replace(/^CH-/i, '');
      query.$or = [
        { challanNumber: { $regex: s, $options: 'i' } },
        { challanNumber: { $regex: numOnly, $options: 'i' } }
      ];
    }

    const challans = await Challan.find(query)
      .sort({ challanDate: -1, createdAt: -1 })
      .populate('branch', 'name code')
      .populate('memoDestinationBranch', 'name code')
      .populate('truckNo', 'vehicleNumber')
      .populate('driverName', 'name phone')
      .populate('bookings')
      .lean();

    let totalChallans = 0;
    let totalLrsCount = 0;
    let totalPkgs = 0;
    let totalWeight = 0;
    let totalLrRevenue = 0;
    let totalTruckFreight = 0;
    let totalAdvance = 0;
    let totalBalancePayable = 0;

    const formatted = challans.map((c: any) => {
      totalChallans += 1;
      const lrCount = c.bookings?.length || 0;
      totalLrsCount += lrCount;

      let pkgs = 0;
      let weight = 0;
      let lrTotal = 0;

      if (c.bookings && Array.isArray(c.bookings)) {
        c.bookings.forEach((b: any) => {
          const w = Number(b.material?.weight) || Number(b.material?.chargedWeight) || 0;
          const p = b.items && b.items.length > 0 
            ? b.items.reduce((acc: number, item: any) => acc + (Number(item.packages) || 0), 0)
            : (Number(b.material?.quantity) || 0);
          const t = Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0;

          weight += w;
          pkgs += p;
          lrTotal += t;
        });
      }

      totalPkgs += pkgs;
      totalWeight += weight;
      totalLrRevenue += lrTotal;

      const freight = Number(c.truckFreight) || 0;
      const advance = Number(c.advanceAmount) || 0;
      const commission = Number(c.commission) || 0;
      const balance = freight - advance - commission;

      totalTruckFreight += freight;
      totalAdvance += advance;
      totalBalancePayable += balance;

      return {
        _id: c._id.toString(),
        challanNumber: c.challanNumber,
        challanDate: c.challanDate,
        fromBranch: c.branch?.name || 'N/A',
        fromBranchCode: c.branch?.code || '',
        toBranch: c.memoDestinationBranch?.name || 'All Destinations',
        toBranchCode: c.memoDestinationBranch?.code || '',
        truckNo: c.truckNo?.vehicleNumber || 'N/A',
        driverName: c.driverName?.name || 'N/A',
        driverPhone: c.driverName?.phone || '',
        totalLrs: lrCount,
        totalPkgs: pkgs,
        totalWeight: weight,
        lrRevenue: lrTotal,
        truckFreight: freight,
        advanceAmount: advance,
        commission: commission,
        balancePayable: balance,
        status: c.status || 'pending',
        cewbNo: c.cewbNo || ''
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalChallans,
        totalLrsCount,
        totalPkgs,
        totalWeight,
        totalLrRevenue,
        totalTruckFreight,
        totalAdvance,
        totalBalancePayable
      },
      records: formatted
    });
  } catch (error: any) {
    console.error('Memo Report API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
