import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const branchId = searchParams.get('branch');

    const filter: any = { 
      status: 'pending', 
      ewayBillNo: { $exists: true, $ne: '' } 
    };

    if (dateStr) {
      // Assuming dateStr is in ISO format YYYY-MM-DD
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);
      
      filter.bookingDate = { $gte: start, $lte: end };
    }

    if (branchId) {
      filter.bookingBranch = branchId;
    }

    await dbConnect();

    const bookings = await Booking.find(filter)
      .populate('bookingBranch', 'branchName')
      .populate('destinationBranch', 'branchName')
      .select('lrNumber bookingDate consignor consignee ewayBillNo material.itemName bookingBranch destinationBranch')
      .sort({ bookingDate: -1 });

    return NextResponse.json({ data: bookings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
