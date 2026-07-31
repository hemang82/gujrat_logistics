import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import { getLogisticQuery, getLogisticIdForCreate } from '@/lib/apiAuth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    Client.init();
    Invoice.init();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    const query: any = { isDeleted: false, ...(await getLogisticQuery(request)) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch all clients
    const clients = await Client.find(query).sort({ name: 1 }).lean();

    // Calculate balances for each client
    const enrichedClients = await Promise.all(clients.map(async (client) => {
      // Find all invoices for this client
      const invoices = await Invoice.find({ client: client._id, isDeleted: { $ne: true } }).lean();
      
      let totalBilled = 0;
      let totalPaid = 0;
      
      invoices.forEach(inv => {
        totalBilled += inv.grandTotal || 0;
        totalPaid += inv.amountPaid || 0;
      });

      return {
        ...client,
        totalBilled,
        totalPaid,
        pendingBalance: Math.max(0, totalBilled - totalPaid),
        invoiceCount: invoices.length
      };
    }));

    return NextResponse.json(enrichedClients);
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
    Client.init();

    const client = await Client.create({
      ...data,
      logisticId: await getLogisticIdForCreate(),
      createdBy: (session.user as any).id
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Client name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
