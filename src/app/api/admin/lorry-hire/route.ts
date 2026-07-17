import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking'; // Required to populate nested LRs in Challan
import Branch from '@/models/Branch';
import Vehicle from '@/models/Vehicle';

// Helper to generate next Lorry Hire Voucher No
async function generateNextVoucherNo() {
  const lastDoc = await LorryHire.findOne().sort({ createdAt: -1 });
  if (!lastDoc || !lastDoc.voucherNo) return 'LH-1001';
  
  const lastNo = lastDoc.voucherNo;
  const match = lastNo.match(/LH-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return `LH-${nextNum}`;
  }
  return 'LH-1001';
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    let query: any = { isDeleted: { $ne: true } };

    if (search) {
      query.voucherNo = { $regex: search, $options: 'i' };
    }

    const totalCount = await LorryHire.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const list = await LorryHire.find(query)
      .populate('fromBranch', 'name code')
      .populate('toBranch', 'name code')
      .populate('truckNo', 'vehicleNumber')
      .populate('balancePaidBy', 'name code')
      .populate({
        path: 'challans',
        populate: {
          path: 'bookings',
          model: 'Booking'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ lorryHires: list, totalPages, totalCount, currentPage: page });
  } catch (error: any) {
    console.error('LorryHire GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    // Generate voucher no
    const voucherNo = await generateNextVoucherNo();

    const newDoc = new LorryHire({
      ...body,
      voucherNo,
      createdBy: session.user.id
    });

    await newDoc.save();

    // Mark the selected challans as in_transit
    if (body.challans && body.challans.length > 0) {
      await Challan.updateMany(
        { _id: { $in: body.challans } },
        { $set: { status: 'in_transit' } }
      );
    }

    return NextResponse.json({ success: true, message: 'Lorry Hire created successfully', data: newDoc }, { status: 201 });
  } catch (error: any) {
    console.error('LorryHire POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
