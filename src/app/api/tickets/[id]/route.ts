import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Ticket from '@/models/Ticket';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const userRole = (session.user as any).role;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Add a new reply
    if (body.message) {
      let sender = 'branch';
      if (userRole === 'superadmin') sender = 'superadmin';
      else if (userRole === 'logistic') sender = 'logistic';

      ticket.replies.push({
        message: body.message,
        sender: sender as any,
        createdAt: new Date()
      });
      
      // If superadmin replies, status can change to in-progress or stay open
      if (userRole === 'superadmin' && ticket.status === 'open') {
        ticket.status = 'in-progress';
      }
    }

    // Change status
    if (body.status && userRole === 'superadmin') {
      ticket.status = body.status;
    } else if (body.status === 'resolved') {
      // Allow user to close their own ticket
      ticket.status = 'resolved';
    }

    await ticket.save();

    return NextResponse.json({ success: true, data: ticket }, { status: 200 });
  } catch (error) {
    console.error('Ticket PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
