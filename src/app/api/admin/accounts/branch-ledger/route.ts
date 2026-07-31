import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import BranchCashTransaction from '@/models/BranchCashTransaction';
import Branch from '@/models/Branch';
import { resolveBranchId } from '@/lib/resolveBranch';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || (session.user as any).branch;
    const dateStr = searchParams.get('date');

    if (!branchId) {
      return NextResponse.json({ error: 'Please enter Branch ID' }, { status: 400 });
    }

    const resolvedBranchId = await resolveBranchId(branchId);
    if (!resolvedBranchId) {
      return NextResponse.json({ error: 'Invalid Branch ID or Code' }, { status: 400 });
    }

    const query: any = { branch: resolvedBranchId, isDeleted: false };

    // Default to today if no date is provided
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    
    // Set to start of the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of the day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = { $gte: startOfDay, $lte: endOfDay };

    const transactions = await BranchCashTransaction.find(query)
      .populate('createdBy', 'name')
      .populate('referenceId')
      .sort({ date: 1 })
      .lean();

    // Get Branch current balance
    const branch = await Branch.findById(resolvedBranchId).lean();
    
    // Calculate totals for the day
    let totalIn = 0;
    let totalOut = 0;
    
    transactions.forEach(txn => {
      if (txn.type === 'credit') totalIn += txn.amount;
      if (txn.type === 'debit') totalOut += txn.amount;
    });

    // Estimate opening balance
    let openingBalance = 0;
    let closingBalance = branch?.currentCashBalance || 0;

    if (transactions.length > 0) {
      // If there are transactions today, the closing balance of yesterday was the balance before the first transaction today
      const firstTxn = transactions[0];
      if (firstTxn.type === 'credit') {
        openingBalance = firstTxn.balanceAfter - firstTxn.amount;
      } else {
        openingBalance = firstTxn.balanceAfter + firstTxn.amount;
      }
      closingBalance = transactions[transactions.length - 1].balanceAfter;
    } else {
      // If no transactions today, look for the last transaction before today
      const lastTxnBeforeToday = await BranchCashTransaction.findOne({
        branch: resolvedBranchId,
        date: { $lt: startOfDay },
        isDeleted: false
      }).sort({ date: -1 });

      if (lastTxnBeforeToday) {
        openingBalance = lastTxnBeforeToday.balanceAfter;
        closingBalance = openingBalance;
      }
    }

    return NextResponse.json({
      branchName: branch?.name,
      date: startOfDay.toISOString(),
      openingBalance,
      totalIn,
      totalOut,
      closingBalance,
      transactions
    });
  } catch (error: any) {
    console.error('Error fetching ledger:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
