import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import { addCashTransaction } from '@/lib/ledgerUtils';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { amount, date } = await request.json();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Please enter Valid payment amount' }, { status: 400 });
    }

    const { id } = await params;
    const lorryHire = await LorryHire.findById(id);
    
    if (!lorryHire) {
      return NextResponse.json({ error: 'Lorry Hire not found' }, { status: 404 });
    }

    const payAmount = Number(amount);
    const newAdvance = (lorryHire.advanceAmount || 0) + payAmount;
    const total = lorryHire.totalAmount || 0;
    
    // Determine new status
    let newStatus = lorryHire.status;
    if (total > 0 && newAdvance >= total) {
      newStatus = 'completed';
    }

    // Update Lorry Hire
    lorryHire.advanceAmount = newAdvance;
    lorryHire.balanceAmount = total - newAdvance;
    lorryHire.status = newStatus;
    await lorryHire.save();

    // Add Ledger Transaction
    await addCashTransaction({
      branchId: lorryHire.fromBranch.toString(),
      type: 'debit',
      amount: payAmount,
      referenceType: 'LorryHire',
      referenceId: lorryHire._id.toString(),
      description: `Balance settlement paid for LH Memo: ${lorryHire.voucherNo}`,
      createdBy: session.user.id
    });

    return NextResponse.json({ success: true, message: 'Payment settled successfully', data: lorryHire });
  } catch (error: any) {
    console.error('LorryHire Settle Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
