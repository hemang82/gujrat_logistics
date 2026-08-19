import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendLogisticEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const user = await User.findById(id).select('-password').lean();

    if (!user || user.role !== 'logistic') {
      return NextResponse.json({ error: 'Logistic company not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching logistic company:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    
    // First find the user record representing this logistic company
    const user = await User.findById(id);
    if (!user || user.role !== 'logistic') {
      return NextResponse.json({ error: 'Logistic company not found' }, { status: 404 });
    }

    const { name, email, phone, password, settings, companyLogo, gstNumber, transporterId, panNumber, ewbApiAccess, ewbApiQuota, isActive } = await request.json();

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (companyLogo !== undefined) user.companyLogo = companyLogo;
    if (gstNumber !== undefined) user.gstNumber = gstNumber;
    if (transporterId !== undefined) user.transporterId = transporterId;
    if (panNumber !== undefined) user.panNumber = panNumber;
    if (ewbApiAccess !== undefined) user.ewbApiAccess = ewbApiAccess;
    if (ewbApiQuota !== undefined) user.ewbApiQuota = Number(ewbApiQuota) || 0;
    if (isActive !== undefined) user.isActive = !!isActive;
    
    // removed settings assignment

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.plainPassword = password;
    }

    await user.save();

    // Send update email asynchronously (don't block the API response but log result)
    const isProfileUpdate = name || email || phone || password || gstNumber || transporterId || panNumber;
    if (isProfileUpdate) {
      try {
        await sendLogisticEmail({
          to: user.email,
          companyName: user.name,
          email: user.email,
          password: user.plainPassword || undefined, // Send the stored plain password
          phone: user.phone || '',
          transporterId: user.transporterId,
          gstNumber: user.gstNumber,
          action: 'update'
        });
      } catch (mailError) {
        console.error('Failed to send update email:', mailError);
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({ message: 'Logistic company updated successfully', user: userWithoutPassword }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating logistic company:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update logistic company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    
    // Find and soft-delete the logistic user, renaming email to release it
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ error: 'Logistic not found' }, { status: 404 });
    }

    userToDelete.isDeleted = true;
    // Prefix email and phone to bypass constraints and allow reuse
    userToDelete.email = `deleted_${Date.now()}_${userToDelete.email}`;
    if (userToDelete.phone) {
      userToDelete.phone = `del_${userToDelete.phone}`;
    }
    await userToDelete.save();

    return NextResponse.json({ message: 'Logistic deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting logistic:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
