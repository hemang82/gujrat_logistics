import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ApiLog from '@/models/ApiLog';
import { EwayBillService } from '@/services/ewaybillService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Validate request payload
    if (!body || !body.vehicleNo || !body.ewbNoDetails || !Array.isArray(body.ewbNoDetails)) {
      return NextResponse.json({ error: 'Missing required CEWB fields or ewbNoDetails' }, { status: 400 });
    }

    // Call the service
    try {
      const cewbResponse = await EwayBillService.generateConsolidatedEwayBill(body);

      // Log success
      await ApiLog.create({
        userId: dbUser._id,
        apiType: 'CEWB_GENERATE',
        requestData: `Vehicle: ${body.vehicleNo}, EWBs: ${body.ewbNoDetails.length}`,
        responseStatus: 'success',
      });

      return NextResponse.json({ success: true, data: cewbResponse }, { status: 200 });

    } catch (apiError: any) {
      // Log failure
      await ApiLog.create({
        userId: dbUser._id,
        apiType: 'CEWB_GENERATE',
        requestData: `Vehicle: ${body.vehicleNo}, EWBs: ${body.ewbNoDetails.length}`,
        responseStatus: 'failed',
        errorMessage: apiError.message,
      });

      return NextResponse.json({ error: apiError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('CEWB Generation Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
