import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Explicitly reference models
    if (!Branch || !Vehicle || !Driver) console.warn('Models not loaded');
    
    // We expect the payload to be { action: 'receive' }
    const body = await request.json();
    
    if (body.action !== 'receive') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const challan = await Challan.findById(id);
    if (!challan) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    if (challan.status !== 'in_transit' && challan.status !== 'pending') {
      return NextResponse.json({ error: 'Only in-transit or pending challans can be received' }, { status: 400 });
    }

    // 1. Update Challan status to 'delivered' (means reached destination)
    challan.status = 'delivered';
    await challan.save();

    // 2. Update all associated Bookings to 'out_for_delivery' (means ready at branch)
    if (challan.bookings && challan.bookings.length > 0) {
      await Booking.updateMany(
        { _id: { $in: challan.bookings } },
        { 
          $set: { status: 'out_for_delivery' },
          $push: { 
            trackingHistory: { 
              status: 'Received at Destination Branch',
              timestamp: new Date(),
              remarks: `Memo ${challan.challanNumber} received`
            }
          }
        }
      );
    }

    return NextResponse.json({ message: 'Memo received successfully', challan });
  } catch (error: any) {
    console.error('Error receiving memo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
