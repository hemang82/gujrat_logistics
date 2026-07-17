import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking'; // Required to populate nested LRs in Challan
import Branch from '@/models/Branch';
import Vehicle from '@/models/Vehicle';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await params;
    const doc = await LorryHire.findById(id)
      .populate('fromBranch', 'name code')
      .populate('toBranch', 'name code')
      .populate('truckNo', 'vehicleNumber')
      .populate('balancePaidBy', 'name code')
      .populate({
        path: 'challans',
        populate: [
          { path: 'bookings', model: 'Booking' },
          { path: 'memoDestinationBranch', model: 'Branch', select: 'name code' }
        ]
      })
      .lean();

    if (!doc) {
      return NextResponse.json({ error: 'Lorry Hire not found' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error: any) {
    console.error('LorryHire GET [id] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const { id } = await params;
    const doc = await LorryHire.findByIdAndUpdate(id, body, { new: true });
    if (!doc) {
      return NextResponse.json({ error: 'Lorry Hire not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lorry Hire updated successfully', data: doc });
  } catch (error: any) {
    console.error('LorryHire PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await params;
    const doc = await LorryHire.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!doc) {
      return NextResponse.json({ error: 'Lorry Hire not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lorry Hire deleted successfully' });
  } catch (error: any) {
    console.error('LorryHire DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
