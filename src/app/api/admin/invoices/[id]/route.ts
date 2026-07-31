import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const body = await req.json();
    const { amountPaid } = body;

    if (amountPaid === undefined || amountPaid < 0) {
      return NextResponse.json({ error: 'Please enter Valid amountPaid' }, { status: 400 });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice || invoice.isDeleted) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    invoice.amountPaid = amountPaid;

    if (invoice.amountPaid >= invoice.grandTotal) {
      invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partial';
    } else {
      invoice.status = 'unpaid';
    }

    await invoice.save();

    return NextResponse.json({ success: true, data: invoice }, { status: 200 });
  } catch (error: any) {
    console.error('Update Invoice Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
