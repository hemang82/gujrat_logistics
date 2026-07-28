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
    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const total = await ApiLog.countDocuments();

    // Fetch logs with populated user details
    const logs = await ApiLog.find()
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
