import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DemoRequest from '@/models/DemoRequest';
import { checkRateLimit } from '@/lib/rateLimit';
import { notifyDemoLead } from '@/lib/leadNotifications';
import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(10),
  companyName: z.string().trim().min(2),
  city: z.string().trim().min(2),
  fleetSize: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  painPoint: z.string().trim().min(2),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please fill all required fields accurately.' },
        { status: 400 }
      );
    }

    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rate = checkRateLimit(`api-demo:${ip}`, 5, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    await connectDB();

    await DemoRequest.create({
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      companyName: parsed.data.companyName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      fleetSize: parsed.data.fleetSize || '1-5',
      painPoint: parsed.data.painPoint,
    });

    await notifyDemoLead({
      name: parsed.data.name,
      phone: parsed.data.phone,
      companyName: parsed.data.companyName,
      city: parsed.data.city,
      fleetSize: parsed.data.fleetSize || '1-5',
      email: parsed.data.email || undefined,
      painPoint: parsed.data.painPoint,
    });

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully',
    });
  } catch (error) {
    console.error('DemoRequest POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
