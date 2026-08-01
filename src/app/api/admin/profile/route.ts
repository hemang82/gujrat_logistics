import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const activeUser = session.user as any;
    const user = await User.findById(activeUser.id)
      .populate('branch', 'name code')
      .populate('bookingBranch', 'name code')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If branch user, inherit ewbApiAccess and statutory details from parent logistic
    if (user.role === 'branch_user' || user.role === 'branch') {
      if (user.logisticId) {
        const parentLogistic = await User.findById(user.logisticId).lean();
        if (parentLogistic) {
          user.ewbApiAccess = parentLogistic.ewbApiAccess;
        }
      }
    }

    // Don't send password hash back
    const { password, ...userWithoutPassword } = user as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const activeUser = session.user as any;
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and Email are required fields' }, { status: 400 });
    }

    // Check unique email (excluding current user)
    const existingUser = await User.findOne({ email: body.email.toLowerCase(), _id: { $ne: activeUser.id } });
    if (existingUser) {
      return NextResponse.json({ error: `Email "${body.email}" is already in use` }, { status: 400 });
    }

    const updateData: any = {
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone || '',
    };

    if (activeUser.role === 'logistic') {
      if (body.companyLogo !== undefined) updateData.companyLogo = body.companyLogo;
      if (body.gstNumber !== undefined) updateData.gstNumber = body.gstNumber;
      if (body.transporterId !== undefined) updateData.transporterId = body.transporterId;
      if (body.panNumber !== undefined) updateData.panNumber = body.panNumber;
    }

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      activeUser.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
