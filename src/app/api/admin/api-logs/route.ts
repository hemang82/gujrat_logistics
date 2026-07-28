import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ApiLog from '@/models/ApiLog';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify Admin permission if needed (only admins should see logs)
    const dbUser = await User.findById(session.user.id);
    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access Denied. Only admins can view API logs.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;

    const query: any = {};

    // Date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Include the entire end date by setting it to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search filtering (request data or user lookup)
    if (search) {
      // 1. Check if the search term matches a User name
      const matchingUsers = await User.find({ 
        name: { $regex: search, $options: 'i' } 
      }).select('_id');
      
      const userIds = matchingUsers.map(u => u._id);

      // 2. Build OR query: matches requestData OR matches one of the userIds
      if (userIds.length > 0) {
        query.$or = [
          { requestData: { $regex: search, $options: 'i' } },
          { userId: { $in: userIds } }
        ];
      } else {
        // No matching user, just search requestData
        query.requestData = { $regex: search, $options: 'i' };
      }
    }

    // Fetch total count for pagination
    const total = await ApiLog.countDocuments(query);

    // Fetch logs with populated user details
    const logs = await ApiLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role')
      .lean();

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching API logs:', error);
    return NextResponse.json({ error: 'Failed to fetch API logs', details: error.message }, { status: 500 });
  }
}
