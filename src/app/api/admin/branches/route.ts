import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Branch from '@/models/Branch';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const query: any = { isDeleted: { $ne: true } };
    
    // Multi-tenant: If the user is a logistic admin, only show their branches
    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      // If branch user somehow hits this, limit to their logistic company
      query.logisticId = (session.user as any).logisticId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (state) {
      query.state = state;
    }

    const skip = (page - 1) * limit;

    const branches = await Branch.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBranches = await Branch.countDocuments(query);
    const totalPages = Math.ceil(totalBranches / limit);

    return NextResponse.json({
      branches,
      pagination: {
        total: totalBranches,
        pages: totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Branch.init();

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is a required field' }, { status: 400 });
    }
    
    // Auto generate code if not provided
    const code = body.code || body.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

    const logisticId = (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId;

    // Check unique branch code FOR THIS LOGISTIC COMPANY
    const existingBranch = await Branch.findOne({ code: code, logisticId: logisticId });
    if (existingBranch) {
      return NextResponse.json({ error: `Branch Code "${code}" already exists in your company` }, { status: 400 });
    }

    if (body.agent === "") delete body.agent;

    const newBranch = new Branch({
      ...body,
      state: body.state || 'Gujarat',
      code: code,
      logisticId: (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId
    });

    await newBranch.save();



    return NextResponse.json(newBranch, { status: 201 });
  } catch (error: any) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
