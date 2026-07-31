import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Ensure params is fully resolved in Next.js 15+
    const { id } = await params;

    const user = await User.findById(id).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Security check: Only allow access if user belongs to this logistic company
    const activeUser = session.user as any;
    const activeLogisticId = activeUser.role === 'logistic' ? activeUser.id : activeUser.logisticId;
    
    if (activeUser.role !== 'superadmin' && user.logisticId?.toString() !== activeLogisticId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Don't send password hash to client
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();

    const activeUser = session.user as any;
    if (activeUser.role !== 'logistic' && activeUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Security check
    const activeLogisticId = activeUser.role === 'logistic' ? activeUser.id : activeUser.logisticId;
    if (activeUser.role !== 'superadmin' && existingUser.logisticId?.toString() !== activeLogisticId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Check unique email if email is being updated
    if (body.email && body.email.toLowerCase() !== existingUser.email) {
      const emailTaken = await User.findOne({ email: body.email.toLowerCase() });
      if (emailTaken) {
        return NextResponse.json({ error: `Email "${body.email}" is already in use` }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email.toLowerCase();
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role) updateData.role = body.role;
    if (body.branch !== undefined) updateData.branch = body.branch || null;
    
    // Update password if provided
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { id } = await params;

    const activeUser = session.user as any;
    if (activeUser.role !== 'logistic' && activeUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Security check
    const activeLogisticId = activeUser.role === 'logistic' ? activeUser.id : activeUser.logisticId;
    if (activeUser.role !== 'superadmin' && existingUser.logisticId?.toString() !== activeLogisticId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await User.findByIdAndUpdate(id, { isDeleted: true });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
