import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DemoRequest from '@/models/DemoRequest';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.companyName || !body.phone || !body.painPoint) {
      return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 });
    }

    const newRequest = new DemoRequest({
      name: body.name,
      companyName: body.companyName,
      phone: body.phone,
      fleetSize: body.fleetSize || '1-10',
      painPoint: body.painPoint
    });

    await newRequest.save();

    return NextResponse.json({ success: true, message: 'Demo request submitted successfully' });
  } catch (error: any) {
    console.error('DemoRequest POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
