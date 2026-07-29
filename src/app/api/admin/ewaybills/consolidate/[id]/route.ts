import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConsolidatedEwayBill from '@/models/ConsolidatedEwayBill';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const bill = await ConsolidatedEwayBill.findById(id);
    if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data: bill }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await dbConnect();
    
    const updated = await ConsolidatedEwayBill.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const deleted = await ConsolidatedEwayBill.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
