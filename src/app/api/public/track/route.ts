import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lrNumber = searchParams.get('lrNumber');

    if (!lrNumber) {
      return NextResponse.json({ error: 'LR Number is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find booking by LR number (case-insensitive)
    const booking = await Booking.findOne({ 
      lrNumber: { $regex: new RegExp(`^${lrNumber}$`, 'i') } 
    }).lean();
    
    if (!booking) {
      return NextResponse.json({ error: 'No shipment found with this LR Number' }, { status: 404 });
    }

    // Return only necessary public info (Tracking history, basic status)
    return NextResponse.json({
      lrNumber: booking.lrNumber,
      status: booking.status,
      pickupLocation: booking.pickupLocation,
      deliveryLocation: booking.deliveryLocation,
      trackingHistory: booking.trackingHistory || []
    });

  } catch (error: any) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
