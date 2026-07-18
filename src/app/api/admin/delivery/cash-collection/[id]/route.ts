import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';
import { addCashTransaction } from '@/lib/ledgerUtils';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Explicitly reference Branch
    if (!Branch) console.warn('Branch model not loaded');
    
    const body = await request.json();
    
    if (body.action !== 'collect_cash') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'delivered' || booking.paymentCondition !== 'to_pay') {
      return NextResponse.json({ error: 'Cannot collect cash for this booking' }, { status: 400 });
    }

    booking.isPaid = true;
    
    booking.trackingHistory.push({
      status: 'Cash Collected',
      timestamp: new Date(),
      remarks: `Collected ₹${booking.charges?.totalAmount} at branch`
    });

    await booking.save();

    // Ledger: Credit Cash Collection amount to Destination Branch
    if (booking.charges?.totalAmount && booking.charges.totalAmount > 0) {
      const destBranch = booking.destinationBranch || session.user.branch;
      if (destBranch) {
        await addCashTransaction({
          branchId: destBranch.toString(),
          type: 'credit',
          amount: booking.charges.totalAmount,
          referenceType: 'CashCollection',
          referenceId: booking._id.toString(),
          description: `Cash Collected for LR: ${booking.lrNumber}`,
          createdBy: session.user.id
        });
      }
    }

    return NextResponse.json({ message: 'Cash collected successfully', booking });
  } catch (error: any) {
    console.error('Error collecting cash:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
