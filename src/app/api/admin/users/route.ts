import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Branch from '@/models/Branch';
import { sendBranchUserEmail } from '@/lib/mail';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const checkEmail = searchParams.get('checkEmail');
    if (checkEmail) {
      const excludeId = searchParams.get('excludeId');
      const query: any = { email: checkEmail.toLowerCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const emailExists = await User.findOne(query);
      return NextResponse.json({ exists: !!emailExists });
    }

    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const role = searchParams.get('role') || '';

    const query: any = { 
      logisticId: (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId,
      isDeleted: { $ne: true }
    };

    // Filter out superadmins and the logistic admin themselves, we only want staff users
    query.role = { $nin: ['superadmin', 'logistic'] };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .populate('branch', 'name code state city pincode address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        pages: totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Validate role
    const activeUser = session.user as any;
    if (activeUser.role !== 'logistic' && activeUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Name, Email, and Password are required fields' }, { status: 400 });
    }

    // Check unique email
    const existingUser = await User.findOne({ email: body.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: `Email "${body.email}" is already in use` }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newUser = new User({
      name: body.name,
      email: body.email.toLowerCase(),
      password: hashedPassword,
      plainPassword: body.password,
      phone: body.phone,
      role: body.role || 'branch',
      branch: body.branch || null,
      permissions: body.permissions,
      logisticId: activeUser.role === 'logistic' ? activeUser.id : body.logisticId
    });

    await newUser.save();

    // Send welcome email to the newly created branch user
    try {
      let branchName = 'N/A';
      if (newUser.branch) {
        const branchObj = await Branch.findById(newUser.branch);
        if (branchObj) {
          branchName = branchObj.name;
        }
      }

      await sendBranchUserEmail({
        to: newUser.email,
        userName: newUser.name,
        email: newUser.email,
        password: body.password, // Plain text password entered
        phone: newUser.phone || '',
        branchName,
        role: newUser.role,
        action: 'create',
      });
    } catch (mailError) {
      console.error('Failed to send welcome email to branch user:', mailError);
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
