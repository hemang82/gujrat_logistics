import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Explicitly reference models
    if (!Branch || !Vehicle || !Driver) console.warn('Models not loaded');
    
    const body = await request.json();
    const { challanIds } = body;
    
    if (!challanIds || !Array.isArray(challanIds) || challanIds.length === 0) {
      return NextResponse.json({ error: 'No challans selected' }, { status: 400 });
    }

    // 1. Find all valid challans
    const challans = await Challan.find({
      _id: { $in: challanIds },
      status: { $in: ['pending', 'in_transit'] }
    });

    if (challans.length === 0) {
      return NextResponse.json({ error: 'No valid challans found to receive' }, { status: 400 });
    }

    const validChallanIds = challans.map(ch => ch._id);
    let allBookingIds: any[] = [];
    
    challans.forEach(ch => {
      if (ch.bookings && ch.bookings.length > 0) {
        allBookingIds = [...allBookingIds, ...ch.bookings];
      }
    });

    // 2. Update Challans to 'delivered'
    await Challan.updateMany(
      { _id: { $in: validChallanIds } },
      { $set: { status: 'delivered' } }
    );

    // 3. Update Bookings to 'out_for_delivery'
    if (allBookingIds.length > 0) {
      await Booking.updateMany(
        { _id: { $in: allBookingIds } },
        { 
          $set: { status: 'out_for_delivery' },
          $push: { 
            trackingHistory: { 
              status: 'Received at Destination Branch',
              timestamp: new Date(),
              remarks: `Memo bulk received at branch`
            }
          }
        }
      );
    }

    return NextResponse.json({ 
      message: `${challans.length} Memos received successfully`
    });
  } catch (error: any) {
    console.error('Error in bulk receive memo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
