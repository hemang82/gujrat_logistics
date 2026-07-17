import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';

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
    
    if (body.action !== 'deliver') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'out_for_delivery') {
      return NextResponse.json({ error: 'Only ready-to-deliver LRs can be delivered' }, { status: 400 });
    }

    booking.status = 'delivered';
    booking.deliveryDate = new Date();
    
    booking.trackingHistory.push({
      status: 'Delivered',
      timestamp: new Date(),
      remarks: 'Goods delivered to consignee'
    });

    await booking.save();

    return NextResponse.json({ message: 'LR delivered successfully', booking });
  } catch (error: any) {
    console.error('Error delivering LR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
