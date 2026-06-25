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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Populate vehicle, driver, and booking for detailed list
    const expenses = await Expense.find({ isDeleted: { $ne: true } })
      .populate('vehicle', 'vehicleNumber type')
      .populate('driver', 'name phone')
      .populate('booking', 'lrNumber status')
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

    const newExpense = new Expense({
      ...data,
      createdBy: session.user.id
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
