import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Client from '@/models/Client';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    Client.init();
    
    const client = await Client.findOne({ _id: id, isDeleted: false }).lean();
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    return NextResponse.json(client);
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
    Client.init();

    const client = await Client.findByIdAndUpdate(id, data, { new: true });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    return NextResponse.json(client);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Client name already exists' }, { status: 400 });
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
    Client.init();

    const client = await Client.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
