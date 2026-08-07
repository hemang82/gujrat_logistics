import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lrNumber = searchParams.get('lrNumber');

    if (!lrNumber) {
      return NextResponse.json({ error: 'Please enter LR Number' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find booking by LR number (case-insensitive)
    const booking = await Booking.findOne({ 
      lrNumber: { $regex: new RegExp(`^${lrNumber}$`, 'i') },
      isDeleted: false 
    })
    .populate('branch', 'name code city state')
    .populate('destinationBranch', 'name code city state')
    .populate('vehicle', 'vehicleNumber')
    .populate('logisticId', 'name companyLogo')
    .lean() as any;
    
    if (!booking) {
      return NextResponse.json({ error: 'No shipment found with this LR Number' }, { status: 404 });
    }

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
    return NextResponse.json({
      ...booking,
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
