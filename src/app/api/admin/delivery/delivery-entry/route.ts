import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch'; // Added to register schema

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
    const statusParam = searchParams.get('status') || 'out_for_delivery';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: { $ne: true }, status: statusParam };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { lrNumber: searchRegex },
        { 'consignor.name': searchRegex },
        { 'consignee.name': searchRegex },
        { 'consignee.phone': searchRegex }
      ];
    }

    const totalCount = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Sort: if out_for_delivery sort by oldest first, if delivered sort by newest first
    const sortField = statusParam === 'delivered' ? { deliveryDate: -1, createdAt: -1 } : { createdAt: 1 };

    const bookings = await Booking.find(query)
      .sort(sortField as any)
      .skip(skip)
      .limit(limit)
      .populate('destinationBranch', 'name code')
      .populate('bookingBranch', 'name code')
      .lean();

    return NextResponse.json({ bookings, totalPages, totalCount, currentPage: page });
  } catch (error: any) {
    console.error('Error fetching delivery entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
