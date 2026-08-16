import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendLogisticEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['superadmin', 'admin', 'manager'];
    if (!session || !allowedRoles.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admins can access this.' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const query: any = { role: 'logistic', isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const logistics = await User.find(query)
      .select('-password') // Don't return hashed password, but return plainPassword
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalLogistics = await User.countDocuments(query);
    const totalPages = Math.ceil(totalLogistics / limit);

    return NextResponse.json({
      data: logistics,
      pagination: {
        total: totalLogistics,
        pages: totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching logistics:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['superadmin', 'admin', 'manager'];
    if (!session || !allowedRoles.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admins can create logistics.' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Name, Email, and Password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: body.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newLogistic = new User({
      name: body.name,
      email: body.email.toLowerCase(),
      password: hashedPassword,
      plainPassword: body.password,
      phone: body.phone,
      role: 'logistic',
      companyLogo: body.companyLogo,
      gstNumber: body.gstNumber,
      transporterId: body.transporterId,
      panNumber: body.panNumber,
      ewbApiAccess: body.ewbApiAccess || false,
      ewbApiQuota: Number(body.ewbApiQuota) || 0,
    });

    await newLogistic.save();

    // Send welcome email asynchronously (don't block the API response but log result)
    try {
      await sendLogisticEmail({
        to: newLogistic.email,
        companyName: newLogistic.name,
        email: newLogistic.email,
        password: body.password, // Plain password entered by user
        phone: newLogistic.phone || '',
        transporterId: newLogistic.transporterId,
        gstNumber: newLogistic.gstNumber,
        action: 'create'
      });
    } catch (mailError) {
      console.error('Failed to send welcome email:', mailError);
    }
    
    // Remove password from response
    const logisticObj = newLogistic.toObject();
    delete logisticObj.password;

    return NextResponse.json({ data: logisticObj }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating logistic:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
