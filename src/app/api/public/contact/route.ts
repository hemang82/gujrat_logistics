import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactQuery from '@/models/ContactQuery';
import { checkRateLimit } from '@/lib/rateLimit';
import { notifyContactInquiry } from '@/lib/leadNotifications';
import { z } from 'zod';

const contactSchema = z.object({
  inquiryType: z.enum(['sales', 'support']).optional().default('sales'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  workEmail: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    if (result.data.website && result.data.website.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rate = checkRateLimit(`api-contact:${ip}`, 6, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please try again later.' },
        { status: 429 }
      );
    }

    await connectDB();
    const newQuery = await ContactQuery.create({
      inquiryType: result.data.inquiryType,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      workEmail: result.data.workEmail,
      phone: result.data.phone || undefined,
      companyName: result.data.companyName || undefined,
      message: result.data.message,
    });

    await notifyContactInquiry({
      inquiryType: result.data.inquiryType,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      workEmail: result.data.workEmail,
      phone: result.data.phone || undefined,
      companyName: result.data.companyName || undefined,
      message: result.data.message,
    });

    return NextResponse.json(
      { message: 'Message sent successfully', data: newQuery },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
