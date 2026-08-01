import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ApiLog from '@/models/ApiLog';
import ConsolidatedEwayBill from '@/models/ConsolidatedEwayBill';
import { EwayBillService } from '@/services/ewaybillService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branchId = searchParams.get('branchId');

    const query: any = {};
    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
    }

    if ((session.user as any).role === 'branch_user') {
      query.branch = (session.user as any).branch;
    } else if (branchId) {
      query.branch = branchId;
    }

    if (search) {
      query.$or = [
        { cEwbNo: { $regex: search, $options: 'i' } },
        { vehicleNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Fetch all consolidated E-Way bills, sorted by latest
    const bills = await ConsolidatedEwayBill.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ data: bills }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching CEWBs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    
    if (!body || !body.vehicle_number || !body.eway_bill_list || !Array.isArray(body.eway_bill_list)) {
      return NextResponse.json({ error: 'Missing required CEWB fields or eway_bill_list' }, { status: 400 });
    }

    try {
      console.log('CEWB Generation Payload Received:', body);
      console.log('Challan No Extracted:', body.challanNo, body.trip_no);
      const cewbResponse = await EwayBillService.generateConsolidatedEwayBill(body);

      // Create Database Record
      const newBill = await ConsolidatedEwayBill.create({
        cEwbNo: cewbResponse.cEwbNo,
        challanNo: body.challanNo || body.trip_no || '',
        vehicleNo: body.vehicle_number,
        fromPlace: body.from_place,
        fromState: body.from_state,
        transMode: body.transportation_mode,
        ewbNoDetails: body.eway_bill_list.map((item: any) => ({
          ewbNo: parseInt(item.eway_bill_no, 10)
        })),
        cEwbDate: cewbResponse.cEwbDate,
        validUpto: body.validUpto ? new Date(body.validUpto) : null,
        status: 'Active',
        createdBy: dbUser._id,
        logisticId: (session.user as any).role === 'logistic' ? (session.user as any).id : (session.user as any).logisticId,
        branch: (session.user as any).branch || null
      });

      await ApiLog.create({
        userId: dbUser._id,
        apiType: 'CEWB_GENERATE',
        requestData: `Vehicle: ${body.vehicle_number}, EWBs: ${body.eway_bill_list?.length || 0}`,
        responseStatus: 'success',
      });

      return NextResponse.json({ success: true, data: newBill }, { status: 200 });

    } catch (apiError: any) {
      await ApiLog.create({
        userId: dbUser._id,
        apiType: 'CEWB_GENERATE',
        requestData: `Vehicle: ${body.vehicle_number}, EWBs: ${body.eway_bill_list?.length || 0}`,
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
