import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Explicitly reference Branch to prevent Webpack tree shaking
    if (!Branch) console.warn('Branch model not loaded');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // We want Bookings that are Delivered AND 'to_pay' AND isPaid === false
    const query: any = { 
      isDeleted: { $ne: true }, 
      status: 'delivered',
      paymentCondition: 'to_pay',
      isPaid: { $ne: true }
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { lrNumber: searchRegex },
        { 'consignor.name': searchRegex },
        { 'consignee.name': searchRegex }
      ];
    }

    const totalCount = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const bookings = await Booking.find(query)
      .sort({ deliveryDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('destinationBranch', 'name code')
      .lean();

    return NextResponse.json({ bookings, totalPages, totalCount, currentPage: page });
  } catch (error: any) {
    console.error('Error fetching cash collections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
