import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';

// GET: Fetch in_transit challans for receiving
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const query: any = { 
      isDeleted: false, 
      status: { $in: ['pending', 'in_transit'] } 
    };
    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { challanNumber: searchRegex },
      ];
    }

    const totalCount = await Challan.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const challans = await Challan.find(query)
      .sort({ challanDate: 1 }) // oldest first since they need to be received
      .skip(skip)
      .limit(limit)
      .populate('truckNo', 'vehicleNumber')
      .populate('driverName', 'name phone')
      .populate('branch', 'name code')
      .populate('memoDestinationBranch', 'name code')
      .lean();

    return NextResponse.json({ challans, totalPages, totalCount, currentPage: page });
  } catch (error: any) {
    console.error('Error fetching receive-memo challans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
