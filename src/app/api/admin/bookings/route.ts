import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { resolveBranchId } from '@/lib/resolveBranch';

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
    
    // Sort by creation time descending (newest created first)
    const bookings = await Booking.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    
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
    if (data.branch === "") delete data.branch;
    if (data.bookingBranch === "") delete data.bookingBranch;
    if (data.destinationBranch === "") delete data.destinationBranch;

    if (data.branch) data.branch = await resolveBranchId(data.branch);
    if (data.bookingBranch) data.bookingBranch = await resolveBranchId(data.bookingBranch);
    if (data.destinationBranch) data.destinationBranch = await resolveBranchId(data.destinationBranch);
    
    // Check if GR number already exists
    if (data.lrNumber) {
      const existingBooking = await Booking.findOne({ lrNumber: data.lrNumber });
      if (existingBooking) {
        return NextResponse.json({ error: `GR Number "${data.lrNumber}" already exists` }, { status: 400 });
      }
    }
    
    
    // Map aggregated items to material field for backwards compatibility
    if (data.items && data.items.length > 0) {
      const firstItem = data.items[0];
      const totalQuantity = data.items.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0);
      const totalWeight = data.items.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0);
      const allItemDescriptions = data.items.map((item: any) => item.description).filter(Boolean).join(', ');
      
      data.material = {
        itemName: allItemDescriptions || firstItem.description || 'Goods',
        quantity: totalQuantity || 1,
        weight: totalWeight || 0,
        chargedWeight: totalWeight || 0,
        packagingType: firstItem.packaging || 'Pkg'
      };
    }

    if (!data.pickupLocation && data.bookingBranch) {
      data.pickupLocation = data.bookingBranch;
    }
    if (!data.deliveryLocation && data.destinationBranch) {
      data.deliveryLocation = data.destinationBranch;
    }

    // Auto-generate LR number starting from LR-1000 if not provided
    let finalLrNumber = data.lrNumber;
    if (!finalLrNumber) {
      const latestBooking = await Booking.findOne({}, { lrNumber: 1 }).sort({ createdAt: -1 });
      let newLrNumber = 'LR-1000';
      
      if (latestBooking && latestBooking.lrNumber) {
        if (latestBooking.lrNumber.startsWith('LR-')) {
          const lastNumberStr = latestBooking.lrNumber.split('-')[1];
          const lastNumber = parseInt(lastNumberStr, 10);
          if (!isNaN(lastNumber)) {
            newLrNumber = `LR-${lastNumber + 1}`;
          }
        } else {
          const lastNumber = parseInt(latestBooking.lrNumber, 10);
          if (!isNaN(lastNumber)) {
            newLrNumber = (lastNumber + 1).toString();
          } else {
            newLrNumber = '10001';
          }
        }
      }
      finalLrNumber = newLrNumber;
    }
    
    // Initialize tracking history
    const trackingHistory = [
      {
        status: 'pending',
        timestamp: new Date(),
        remarks: 'Booking created (LR Generated)',
        location: data.pickupLocation || data.bookingBranch || 'Origin'
      }
    ];

    const newBooking = new Booking({
      ...data,
      lrNumber: finalLrNumber,
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
