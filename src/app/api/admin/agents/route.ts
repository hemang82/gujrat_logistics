import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Agent from '@/models/Agent';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    Agent.init();
    
    // We need to require Branch model to populate it
    require('@/models/Branch');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    const query: any = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) {
      query.agentType = type;
    }
    
    const userRole = (session.user as any).role;
    const userBranch = (session.user as any).branch;
    
    // For branch users, only show their own agents
    if (userRole === 'branch' || userRole === 'branch_user') {
      if (userBranch) {
        query.branch = userBranch;
      }
    }

    const agents = await Agent.find(query).populate('branch', 'name').sort({ name: 1 }).lean();
    return NextResponse.json(agents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    await connectToDatabase();
    Agent.init();

    const userRole = (session.user as any).role;
    const userBranch = (session.user as any).branch;
    
    // Auto-assign branch for branch users
    if (userRole === 'branch' || userRole === 'branch_user') {
      data.branch = userBranch;
    }

    const agent = await Agent.create({
      ...data,
      createdBy: (session.user as any).id
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Agent name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
