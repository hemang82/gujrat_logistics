import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { resolveBranchId } from '@/lib/resolveBranch';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In Next.js 15, params is a Promise, so we must await it.
    // However, for compatibility with both 14 and 15, we can await it.
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    booking.status = status;
    booking.trackingHistory.push({
      status,
      timestamp: new Date(),
      remarks: `Status updated to ${status}`
    });
    await booking.save();

    // Sync statuses
    if (status === 'delivered' || status === 'cancelled') {
      if (booking.vehicle) await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'available' });
      if (booking.driver) await Driver.findByIdAndUpdate(booking.driver, { status: 'available' });
    } else if (status === 'in_transit' || status === 'out_for_delivery') {
      if (booking.vehicle) await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'on-trip' });
      if (booking.driver) await Driver.findByIdAndUpdate(booking.driver, { status: 'on-trip' });
    }

    revalidatePath('/admin/bookings');
    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    const booking = await Booking.findById(id)
      .populate('branch', 'code name')
      .populate('bookingBranch', 'code name')
      .populate('destinationBranch', 'code name')
      .lean();
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const payload = await request.json();
    await connectToDatabase();

    // Do not allow status to be updated via PUT, use PATCH for that.
    // Ensure we don't accidentally wipe it out if it's not in the payload
    if (payload.status) delete payload.status;
    if (payload.vehicle === "") delete payload.vehicle;
    if (payload.driver === "") delete payload.driver;
    if (payload.branch === "") delete payload.branch;
    if (payload.bookingBranch === "") delete payload.bookingBranch;
    if (payload.destinationBranch === "") delete payload.destinationBranch;

    if (payload.branch) payload.branch = await resolveBranchId(payload.branch);
    if (payload.bookingBranch) payload.bookingBranch = await resolveBranchId(payload.bookingBranch);
    if (payload.destinationBranch) payload.destinationBranch = await resolveBranchId(payload.destinationBranch);

    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (payload.lrNumber && payload.lrNumber !== existingBooking.lrNumber) {
      if (existingBooking.bookingType === 'manual' || payload.bookingType === 'manual') {
        // Validate manual GR No uniqueness
        const duplicate = await Booking.findOne({ lrNumber: payload.lrNumber, _id: { $ne: id } });
        if (duplicate) {
          return NextResponse.json({ error: `GR Number "${payload.lrNumber}" already exists` }, { status: 400 });
        }
      } else {
        // Protect auto-generated LR Number from being changed
        delete payload.lrNumber;
      }
    }

    // Map aggregated items to material field for backwards compatibility
    if (payload.items && payload.items.length > 0) {
      const firstItem = payload.items[0];
      const totalQuantity = payload.items.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0);
      const totalWeight = payload.items.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0);
      const allItemDescriptions = payload.items.map((item: any) => item.description).filter(Boolean).join(', ');
      
      payload.material = {
        itemName: allItemDescriptions || firstItem.description || 'Goods',
        quantity: totalQuantity || 1,
        weight: totalWeight || 0,
        chargedWeight: totalWeight || 0,
        packagingType: firstItem.packaging || 'Pkg'
      };
    }

    if (!payload.pickupLocation && payload.bookingBranch) {
      payload.pickupLocation = payload.bookingBranch;
    }
    if (!payload.deliveryLocation && payload.destinationBranch) {
      payload.deliveryLocation = payload.destinationBranch;
    }

    const oldBooking = await Booking.findById(id);
    if (!oldBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    // If active trip, sync vehicle/driver changes
    if (oldBooking.status !== 'delivered' && oldBooking.status !== 'cancelled') {
      if (payload.vehicle && oldBooking.vehicle?.toString() !== payload.vehicle) {
        if (oldBooking.vehicle) await Vehicle.findByIdAndUpdate(oldBooking.vehicle, { status: 'available' });
        await Vehicle.findByIdAndUpdate(payload.vehicle, { status: 'on-trip' });
      }
      if (payload.driver && oldBooking.driver?.toString() !== payload.driver) {
        if (oldBooking.driver) await Driver.findByIdAndUpdate(oldBooking.driver, { status: 'available' });
        await Driver.findByIdAndUpdate(payload.driver, { status: 'on-trip' });
      }
    }

    revalidatePath('/admin/bookings');
    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const deletedBooking = await Booking.findByIdAndUpdate(id, { 
      isDeleted: true,
      lrNumber: `${booking.lrNumber}_deleted_${Date.now()}`
    }, { new: true });
    
    if (!deletedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    revalidatePath('/admin/bookings');
    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
