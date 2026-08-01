import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/Expense';
import { getLogisticQuery } from '@/lib/apiAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    
    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
    }

    const expense = await Expense.findOne(query).lean();
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const payload = await request.json();
    await connectToDatabase();

    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
      delete payload.branch; // prevent manual changes
    } else if (payload.branch === "") {
      payload.branch = null;
    }

    const oldExpense = await Expense.findOne(query);
    if (!oldExpense) return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });

    // Handle unset for empty strings
    const updatePayload: any = { ...payload };
    if (payload.branch === null) {
      delete updatePayload.branch;
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      query,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (payload.branch === null) {
      await Expense.findByIdAndUpdate(id, { $unset: { branch: 1 } });
    }

    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    revalidatePath('/admin/expenses');
    return NextResponse.json({ success: true, expense: updatedExpense });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    
    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
    }

    // Soft delete
    const deletedExpense = await Expense.findOneAndUpdate(query, { isDeleted: true }, { new: true });
    
    if (!deletedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    revalidatePath('/admin/expenses');
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
