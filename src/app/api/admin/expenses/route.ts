import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/Expense';
import DriverTransaction from '@/models/DriverTransaction';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Booking from '@/models/Booking';
import { getLogisticQuery, getLogisticIdForCreate } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const query: any = { isDeleted: { $ne: true }, ...(await getLogisticQuery(req)) };
    
    // Branch filtering
    if ((session.user as any).role === 'branch_user' || (session.user as any).role === 'branch') {
      query.branch = (session.user as any).branchId || (session.user as any).branch;
    }
    
    // Populate vehicle, driver, and booking for detailed list
    const expenses = await Expense.find(query)
      .populate('vehicle', 'vehicleNumber type')
      .populate('driver', 'name phone')
      .populate('booking', 'lrNumber status')
      .populate('branch', 'name')
      .sort({ date: -1 })
      .lean();
    
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const data = await req.json();

    const user = session.user as any;
    data.logisticId = await getLogisticIdForCreate();

    if (user.role === 'branch_user' || user.role === 'branch') {
      data.branch = user.branchId || user.branch;
    } else if (!data.branch) {
      delete data.branch;
    }

    const newExpense = new Expense({
      ...data,
      createdBy: user.id
    });
    
    await newExpense.save();
    
    // Auto-create a DriverTransaction if a driver is associated
    if (data.driver) {
      DriverTransaction.init();
      await DriverTransaction.create({
        driver: data.driver,
        date: data.date || new Date(),
        type: 'expense_reported',
        amount: data.amount,
        description: `Expense Reported: ${data.expenseType}`,
        relatedExpense: newExpense._id,
        createdBy: session.user.id
      });
    }
    
    revalidatePath('/admin/expenses');
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
