import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Protected setup endpoint — requires a secret token
export async function POST(request: Request) {
  try {
    const { secret, email, password } = await request.json();

    // Only allow setup with the correct secret from environment
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret || secret !== setupSecret) {
      return NextResponse.json({ error: 'Unauthorized — invalid setup secret' }, { status: 403 });
    }

    await connectToDatabase();

    const adminExists = await User.findOne({ email: email || 'admin@gujaratlogistic.com' });
    if (adminExists) {
      return NextResponse.json({ message: 'Admin already exists' }, { status: 200 });
    }

    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: email || 'admin@gujaratlogistic.com',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();

    return NextResponse.json({ message: 'Admin user created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
