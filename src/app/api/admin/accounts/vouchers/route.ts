import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addCashTransaction } from '@/lib/ledgerUtils';
import connectToDatabase from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { date, branchId, type, amount, description } = body;

    if (!branchId || !type || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Ledger: Add manual voucher
    const txn = await addCashTransaction({
      branchId: branchId,
      date: date ? new Date(date) : new Date(),
      type: type as 'credit' | 'debit',
      amount: numAmount,
      referenceType: 'Manual',
      description,
      createdBy: session.user.id
    });

    return NextResponse.json({ success: true, message: 'Voucher saved', data: txn }, { status: 201 });
  } catch (error: any) {
    console.error('Voucher POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
