import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userRole = (session.user as any).role;
    
    let query: any = {};
    if (userRole === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if (userRole === 'branch_user' || userRole === 'branch') {
      query.logisticId = (session.user as any).logisticId;
      query.branchId = (session.user as any).branch;
    } else if (userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate('logisticId', 'name companyName')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: tickets });
  } catch (error) {
    console.error('Tickets GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole === 'superadmin') {
      return NextResponse.json({ error: 'Superadmin cannot create tickets.' }, { status: 400 });
    }

    await connectToDatabase();
    const body = await request.json();

    const logisticId = userRole === 'logistic' ? (session.user as any).id : (session.user as any).logisticId;
    const branchId = userRole === 'logistic' ? null : (session.user as any).branch;

    const newTicket = new Ticket({
      logisticId,
      branchId,
      subject: body.subject,
      description: body.description,
      priority: body.priority || 'medium',
      status: 'open',
      replies: [
        {
          message: body.description,
          sender: userRole === 'logistic' ? 'logistic' : 'branch'
        }
      ]
    });

    await newTicket.save();

    return NextResponse.json({ success: true, data: newTicket }, { status: 201 });
  } catch (error) {
    console.error('Tickets POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
