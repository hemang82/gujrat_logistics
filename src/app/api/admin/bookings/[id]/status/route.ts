import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();
    Booking.init();
    
    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    booking.status = status;
    booking.trackingHistory.push({
      status: status,
      timestamp: new Date(),
      remarks: `Status updated to ${status.replace('_', ' ')}`
    });

    if (status === 'delivered') {
      booking.deliveryDate = new Date();
    }

    await booking.save();

    // Sync Vehicle & Driver status
    if (status === 'delivered' || status === 'cancelled') {
      if (booking.vehicle) await (await import('@/models/Vehicle')).default.findByIdAndUpdate(booking.vehicle, { status: 'available' });
      if (booking.driver) await (await import('@/models/Driver')).default.findByIdAndUpdate(booking.driver, { status: 'available' });
    } else if (status === 'in_transit' || status === 'out_for_delivery') {
      if (booking.vehicle) await (await import('@/models/Vehicle')).default.findByIdAndUpdate(booking.vehicle, { status: 'on-trip' });
      if (booking.driver) await (await import('@/models/Driver')).default.findByIdAndUpdate(booking.driver, { status: 'on-trip' });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
