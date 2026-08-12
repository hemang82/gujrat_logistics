import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConsolidatedEwayBill from '@/models/ConsolidatedEwayBill';
import ApiLog from '@/models/ApiLog';
import User from '@/models/User';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).ewbApiAccess) {
      return NextResponse.json({ error: 'Unauthorized: E-Way Bill feature is disabled for your account.' }, { status: 403 });
    }

    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { newValidUpto, reason } = await request.json();

    if (!newValidUpto) {
      return NextResponse.json({ error: 'Please enter New validity date' }, { status: 400 });
    }

    const bill = await ConsolidatedEwayBill.findById(id);
    if (!bill) {
      return NextResponse.json({ error: 'CEWB not found' }, { status: 404 });
    }

    const oldValidUpto = bill.validUpto;

    bill.validUpto = new Date(newValidUpto);
    bill.extensionHistory.push({
      extendedAt: new Date(),
      oldValidUpto: oldValidUpto,
      newValidUpto: new Date(newValidUpto),
      reason: reason || 'Validity extended'
    });

    await bill.save();

    await ApiLog.create({
      userId: dbUser._id,
      apiType: 'CEWB_EXTEND',
      requestData: `CEWB ID: ${id}, New Date: ${newValidUpto}`,
      responseStatus: 'success'
    });

    return NextResponse.json({ success: true, message: 'CEWB validity extended successfully', data: bill });
  } catch (error: any) {
    console.error('Error extending CEWB:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
