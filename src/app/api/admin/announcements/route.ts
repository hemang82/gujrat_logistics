import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const userRole = (session.user as any).role;
    
    // Super admin sees all announcements, others only see active ones matching the date criteria
    if (userRole === 'superadmin') {
      const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ data: announcements });
    } else {
      const now = new Date();
      const announcements = await Announcement.find({
        isActive: true,
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: now } }
        ],
        $and: [
          { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
        ]
      }).sort({ createdAt: -1 }).lean();
      
      return NextResponse.json({ data: announcements });
    }
  } catch (error) {
    console.error('Announcements GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const newAnnouncement = new Announcement({
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      isActive: body.isActive ?? true,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });

    await newAnnouncement.save();

    return NextResponse.json({ success: true, data: newAnnouncement }, { status: 201 });
  } catch (error) {
    console.error('Announcements POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
