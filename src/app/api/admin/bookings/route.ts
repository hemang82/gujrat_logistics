import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Booking.init();
    Vehicle.init();
    Driver.init();
    
    // Sort by booking date descending
    const bookings = await Booking.find({ isDeleted: { $ne: true } }).sort({ bookingDate: -1 });
    
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
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
    Booking.init();
    Vehicle.init();
    Driver.init();
    
    const data = await req.json();

    // Prevent Cast to ObjectId failed for empty string
    if (data.vehicle === "") delete data.vehicle;
    if (data.driver === "") delete data.driver;
    
    
    // Auto-generate LR number starting from LR-1000
    const latestBooking = await Booking.findOne({}, { lrNumber: 1 }).sort({ createdAt: -1 });
    let newLrNumber = 'LR-1000';
    
    if (latestBooking && latestBooking.lrNumber && latestBooking.lrNumber.startsWith('LR-')) {
      const lastNumberStr = latestBooking.lrNumber.split('-')[1];
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        newLrNumber = `LR-${lastNumber + 1}`;
      }
    }
    
    // Initialize tracking history
    const trackingHistory = [
      {
        status: 'pending',
        timestamp: new Date(),
        remarks: 'Booking created (LR Generated)',
        location: data.pickupLocation || 'Origin'
      }
    ];

    const newBooking = new Booking({
      ...data,
      lrNumber: newLrNumber,
      createdBy: session?.user?.id,
      status: 'pending',
      trackingHistory
    });
    
    await newBooking.save();

    // Mark Vehicle and Driver as on-trip
    if (data.vehicle) {
      await Vehicle.findByIdAndUpdate(data.vehicle, { status: 'on-trip' });
    }
    if (data.driver) {
      await Driver.findByIdAndUpdate(data.driver, { status: 'on-trip' });
    }
    
    revalidatePath('/admin/bookings');
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
