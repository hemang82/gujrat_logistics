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

    if (!body.name || !body.code || !body.state) {
      return NextResponse.json({ error: 'Name, Code, and State are required fields' }, { status: 400 });
    }

    // Check unique branch code
    const existingBranch = await Branch.findOne({ code: body.code.toUpperCase() });
    if (existingBranch) {
      return NextResponse.json({ error: `Branch Code "${body.code.toUpperCase()}" already exists` }, { status: 400 });
    }

    if (body.agent === "") delete body.agent;

    const newBranch = new Branch({
      ...body,
      code: body.code.toUpperCase()
    });

    await newBranch.save();
    return NextResponse.json(newBranch, { status: 201 });
  } catch (error: any) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
