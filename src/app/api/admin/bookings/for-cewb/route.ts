import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Challan from '@/models/Challan';
import Vehicle from '@/models/Vehicle';
import Branch from '@/models/Branch';
import ConsolidatedEwayBill from '@/models/ConsolidatedEwayBill';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const challanNo = searchParams.get('challanNo');
    const branchId = searchParams.get('branch');

    await dbConnect();

    // If searching by Challan Number
    if (challanNo) {
      Challan.init(); Vehicle.init(); Branch.init(); Booking.init();

      const challan = await Challan.findOne({ challanNumber: { $regex: new RegExp(`^${challanNo}$`, 'i') } })
        .populate('truckNo', 'vehicleNumber')
        .populate('branch', 'name code')
        .populate({
          path: 'bookings',
          match: { ewayBillNo: { $exists: true, $ne: '' } }, // only get bookings that have EWB
          select: 'lrNumber bookingDate consignor consignee ewayBillNo material.itemName destinationBranch',
          populate: { path: 'destinationBranch', select: 'name code' }
        });

      if (!challan) {
        return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
      }

      if (challan.status === 'delivered') {
        return NextResponse.json({ error: 'This Challan is already delivered. You cannot generate a Master CEWB for it.' }, { status: 400 });
      }

      // Check if CEWB already exists for this challan
      const existingCEWB = await ConsolidatedEwayBill.findOne({ challanNo: challan.challanNumber });
      if (existingCEWB) {
        return NextResponse.json({ 
          error: 'ALREADY_EXISTS',
          cewbNo: existingCEWB.cEwbNo,
          message: `A Master E-Way Bill (${existingCEWB.cEwbNo}) has already been generated for Challan ${challan.challanNumber}.`
        }, { status: 400 });
      }

      return NextResponse.json({ 
        data: challan.bookings,
        challanDetails: {
          vehicleNo: challan.truckNo?.vehicleNumber || '',
          branchName: challan.branch?.name || '',
          branchCode: challan.branch?.code || ''
        }
      }, { status: 200 });
    }

    // Fallback: search by branch
    const filter: any = { 
      status: 'pending', 
      ewayBillNo: { $exists: true, $ne: '' } 
    };

    if (branchId) {
      filter.bookingBranch = branchId;
    }

    const bookings = await Booking.find(filter)
      .populate('bookingBranch', 'name code')
      .populate('destinationBranch', 'name code')
      .select('lrNumber bookingDate consignor consignee ewayBillNo material.itemName bookingBranch destinationBranch')
      .sort({ bookingDate: -1 });

    return NextResponse.json({ data: bookings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
