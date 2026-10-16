import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Challan from '@/models/Challan';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lrNumber = searchParams.get('lrNumber');

    if (!lrNumber) {
      return NextResponse.json({ error: 'Please enter LR Number' }, { status: 400 });
    }

    await connectToDatabase();
    if (!Vehicle || !Driver) console.log('Init models');
    
    // Find booking by LR number (case-insensitive)
    const booking = await Booking.findOne({ 
      lrNumber: { $regex: new RegExp(`^${lrNumber}$`, 'i') },
      isDeleted: false 
    })
    .populate('branch', 'name code city state')
    .populate('destinationBranch', 'name code city state')
    .populate('vehicle', 'vehicleNumber vehicleType')
    .populate('driver', 'name phone')
    .populate('logisticId', 'name companyLogo')
    .lean() as any;
    
    if (!booking) {
      return NextResponse.json({ error: 'No shipment found with this LR Number' }, { status: 404 });
    }

    // Check if this booking is assigned to an active Challan
    const loadedChallan = await Challan.findOne({
      bookings: booking._id,
      isDeleted: false
    })
    .populate('truckNo', 'vehicleNumber vehicleType')
    .populate('driverName', 'name phone')
    .lean() as any;

    const patchedHistory = booking.trackingHistory?.map((h: any) => {
      let loc = h.location;
      if (loc && typeof loc === 'string' && loc.match(/^[0-9a-fA-F]{24}$/)) {
        if (h.status === 'pending') loc = booking.branch?.name || loc;
        if (h.status === 'out_for_delivery' || h.status === 'delivered') loc = booking.destinationBranch?.name || loc;
      }
      
      let remarks = h.remarks;
      if (remarks && typeof remarks === 'string' && remarks.includes('with truck ')) {
         const match = remarks.match(/with truck ([0-9a-fA-F]{24})/);
         if (match && booking.vehicle?.vehicleNumber) {
             remarks = remarks.replace(match[1], booking.vehicle.vehicleNumber);
         }
      }

      return { ...h, location: loc, remarks };
    }) || [];

    // Return the full booking object with necessary augmentations
    const activeVehicleNumber = loadedChallan?.truckNo?.vehicleNumber || booking.vehicle?.vehicleNumber || null;
    const activeDriverName = loadedChallan?.driverName?.name || booking.driver?.name || null;
    const activeDriverPhone = loadedChallan?.driverName?.phone || booking.driver?.phone || null;

    return NextResponse.json({
      ...booking,
      vehicleNumber: activeVehicleNumber,
      driverName: activeDriverName,
      driverPhone: activeDriverPhone,
      challanNumber: loadedChallan?.challanNumber || null,
      logisticName: booking.logisticId?.name || 'Trust Logistic',
      origin: booking.branch ? booking.branch.name : (booking.pickupLocation || 'Unknown'),
      destination: booking.destinationBranch ? booking.destinationBranch.name : (booking.deliveryLocation || 'Unknown'),
      packages: booking.items?.reduce((sum: number, item: any) => sum + (parseInt(item.packages) || 0), 0) || (booking.material?.quantity || 1),
      description: booking.items && booking.items.length > 0 ? booking.items[0].description : (booking.material?.itemName || 'Goods'),
      weight: booking.items?.reduce((sum: number, item: any) => sum + (parseFloat(item.weight) || 0), 0) || (booking.material?.weight || 0),
      trackingHistory: patchedHistory
    });

  } catch (error: any) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
