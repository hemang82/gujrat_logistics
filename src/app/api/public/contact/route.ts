import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactQuery from '@/models/ContactQuery';
import { z } from 'zod';

// Define the validation schema
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  workEmail: z.string().email('Invalid email address'),
  companyName: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Connect to DB and save
    await connectDB();
    const newQuery = await ContactQuery.create(result.data);

    return NextResponse.json(
      { message: 'Message sent successfully', data: newQuery },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
