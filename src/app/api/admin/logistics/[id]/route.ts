import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

    const { name, email, phone, password, settings, companyLogo, gstNumber, transporterId, panNumber, ewbApiAccess, ewbApiQuota } = await request.json();

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
    
    // removed settings assignment

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

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
    
    // Soft-delete the logistic user
    const deletedUser = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!deletedUser) {
      return NextResponse.json({ error: 'Logistic not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Logistic deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting logistic:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
