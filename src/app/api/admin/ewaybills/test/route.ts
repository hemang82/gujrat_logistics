import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EwayBillService } from '@/services/ewaybillService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['superadmin', 'admin'];

    if (!session || !allowedRoles.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized access. Admins only.' }, { status: 401 });
    }

    const body = await request.json();
    const { gstin, ewayBillNumber } = body;

    if (!ewayBillNumber || !gstin) {
      return NextResponse.json({ error: 'E-Way Bill Number and GSTIN are required.' }, { status: 400 });
    }

    if (ewayBillNumber.length !== 12 || !/^\d+$/.test(ewayBillNumber)) {
      return NextResponse.json({ error: 'E-Way Bill Number must be a valid 12-digit number.' }, { status: 400 });
    }

    console.log(`E-Way Bill Diagnostics triggered by Admin: EWB=${ewayBillNumber}, GSTIN=${gstin}`);

    // Call E-Way Bill fetch service using provided GSTIN
    const ewbData = await EwayBillService.fetchEwayBillDetails(ewayBillNumber, gstin.trim().toUpperCase());

    return NextResponse.json({ success: true, data: ewbData }, { status: 200 });

  } catch (error: any) {
    console.error('Error in E-Way Bill test route:', error);
    // Return E-Way Bill specific error messages cleanly to the client
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch E-Way Bill details.' 
    }, { status: 400 });
  }
}
