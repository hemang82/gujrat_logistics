import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Agent from '@/models/Agent';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    Agent.init();

    const agent = await Agent.findOne({ _id: id, isDeleted: false }).lean();
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    const userRole = (session.user as any).role;
    const userBranch = (session.user as any).branch;
    if ((userRole === 'branch' || userRole === 'branch_user') && agent.branch?.toString() !== userBranch) {
      return NextResponse.json({ error: 'Unauthorized branch access' }, { status: 403 });
    }

    return NextResponse.json(agent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();
    Agent.init();

    const userRole = (session.user as any).role;
    const userBranch = (session.user as any).branch;

    const existingAgent = await Agent.findById(id);
    if (!existingAgent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    
    if ((userRole === 'branch' || userRole === 'branch_user')) {
      if (existingAgent.branch?.toString() !== userBranch) {
        return NextResponse.json({ error: 'Unauthorized branch access' }, { status: 403 });
      }
      delete data.branch; // Branch users cannot change the branch
    }

    const agent = await Agent.findByIdAndUpdate(id, data, { new: true });

    return NextResponse.json(agent);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Agent name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    Agent.init();

    const userRole = (session.user as any).role;
    const userBranch = (session.user as any).branch;

    const existingAgent = await Agent.findById(id);
    if (!existingAgent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    
    if ((userRole === 'branch' || userRole === 'branch_user') && existingAgent.branch?.toString() !== userBranch) {
      return NextResponse.json({ error: 'Unauthorized branch access' }, { status: 403 });
    }

    const agent = await Agent.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
