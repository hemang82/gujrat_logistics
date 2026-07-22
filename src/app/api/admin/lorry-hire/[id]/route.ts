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
    
    // Get old doc to compare challans
    const oldDoc = await LorryHire.findById(id);
    if (!oldDoc) {
      return NextResponse.json({ error: 'Lorry Hire not found' }, { status: 404 });
    }

    const oldChallanIds = (oldDoc.challans || []).map((c: any) => c.toString());
    const newChallanIds = (body.challans || []).map((c: string) => c.toString());

    // Find added and removed challans
    const addedChallans = newChallanIds.filter((c: string) => !oldChallanIds.includes(c));
    const removedChallans = oldChallanIds.filter((c: string) => !newChallanIds.includes(c));

    // Update the document
    const doc = await LorryHire.findByIdAndUpdate(id, body, { new: true });

    // Mark newly added challans as in_transit
    if (addedChallans.length > 0) {
      await Challan.updateMany(
        { _id: { $in: addedChallans } },
        { $set: { status: 'in_transit' } }
      );
    }

    // Reset removed challans back to pending
    if (removedChallans.length > 0) {
      await Challan.updateMany(
        { _id: { $in: removedChallans } },
        { $set: { status: 'pending' } }
      );
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

    // Reset all challans back to pending
    if (doc.challans && doc.challans.length > 0) {
      await Challan.updateMany(
        { _id: { $in: doc.challans } },
        { $set: { status: 'pending' } }
      );
    }

    return NextResponse.json({ success: true, message: 'Lorry Hire deleted successfully' });
  } catch (error: any) {
    console.error('LorryHire DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
