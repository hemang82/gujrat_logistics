import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Branch from '@/models/Branch';
import User from '@/models/User';
import { EwayBillService } from '@/services/ewaybillService';

export const dynamic = 'force-dynamic';

// POST: Generate CEWB for a specific Challan
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const sessionUser = session.user as any;
    const isSuperAdmin = sessionUser.role === 'superadmin';
    const isLogistic = sessionUser.role === 'logistic';
    const hasEwbApiAccess = isSuperAdmin || sessionUser.ewbApiAccess === true;

    if (!hasEwbApiAccess) {
      return NextResponse.json({ error: 'Access Denied: E-Way Bill API permission is not enabled for your account.' }, { status: 403 });
    }

    const logisticId = isLogistic ? sessionUser.id : sessionUser.logisticId;
    const branchFilter = sessionUser.role === 'branch' ? { branch: sessionUser.branch } : {};

    const challan = await Challan.findOne({ _id: id, logisticId, ...branchFilter, isDeleted: false })
      .populate('bookings', 'lrNumber bookingDate ewayBillNo')
      .populate('truckNo', 'vehicleNumber')
      .populate('branch', 'name code city state');

    if (!challan) {
      return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
    }

    // Check if CEWB already exists
    if (challan.cewbNo) {
      return NextResponse.json({
        success: true,
        message: 'CEWB already generated for this challan',
        cewbNo: challan.cewbNo,
        cewbUrl: challan.cewbUrl
      });
    }

    const truckString = challan.truckNo?.vehicleNumber
      ? challan.truckNo.vehicleNumber.replace(/\s+/g, '').toUpperCase()
      : '';

    if (!truckString) {
      return NextResponse.json({ error: 'No Vehicle Number (Truck) assigned to this challan. Please assign a truck first.' }, { status: 400 });
    }

    // Get logistic user GSTIN
    const logisticUser = await User.findById(challan.logisticId);
    const userGstin = (logisticUser as any)?.gstNo || process.env.MASTERS_INDIA_GSTIN;

    if (!userGstin) {
      return NextResponse.json({ error: 'Logistic GSTIN not found. Please check company settings.' }, { status: 400 });
    }

    // Filter loaded bookings that have ewayBillNo
    const ewbBookings = (challan.bookings || []).filter((b: any) => b.ewayBillNo && b.ewayBillNo.trim() !== '');

    if (ewbBookings.length === 0) {
      return NextResponse.json({ error: 'None of the loaded LRs have an E-Way Bill Number. CEWB cannot be generated.' }, { status: 400 });
    }

    const fromCity = (challan.branch as any)?.city || 'AHMEDABAD';
    const fromState = (challan.branch as any)?.state || 'GUJARAT';

    const cDate = new Date(challan.challanDate || new Date());
    const formattedChallanDate = `${cDate.getDate().toString().padStart(2, '0')}/${(cDate.getMonth() + 1).toString().padStart(2, '0')}/${cDate.getFullYear()}`;

    // Step 1: Update Part-B Vehicle Number for each individual EWB
    const updatePromises = ewbBookings.map((b: any) => {
      const bDate = new Date(b.bookingDate || new Date());
      const formattedDate = `${bDate.getDate().toString().padStart(2, '0')}/${(bDate.getMonth() + 1).toString().padStart(2, '0')}/${bDate.getFullYear()}`;

      const payload = {
        userGstin: userGstin,
        eway_bill_number: Number(b.ewayBillNo),
        vehicle_number: truckString,
        vehicle_type: 'r',
        place_of_consignor: fromCity,
        state_of_consignor: fromState,
        reason_code_for_vehicle_updation: 'First time',
        reason_for_vehicle_updation: '',
        transporter_document_number: b.lrNumber || '',
        transporter_document_date: formattedDate,
        mode_of_transport: 1,
        data_source: ''
      };

      return EwayBillService.updateVehicleNumber(payload);
    });

    await Promise.allSettled(updatePromises);

    // Step 2: Generate Consolidated E-Way Bill (CEWB)
    const listOfEwayBills = ewbBookings.map((b: any) => ({
      eway_bill_number: Number(b.ewayBillNo)
    }));

    const cewbPayload = {
      userGstin: userGstin,
      place_of_consignor: fromCity,
      state_of_consignor: fromState,
      vehicle_number: truckString,
      mode_of_transport: 1,
      transporter_document_number: challan.challanNumber,
      transporter_document_date: formattedChallanDate,
      data_source: 'erp',
      list_of_eway_bills: listOfEwayBills
    };

    const cewbResponse = await EwayBillService.generateConsolidatedEwayBill(cewbPayload);

    if (!cewbResponse || !cewbResponse.cEwbNo) {
      const errMsg = cewbResponse?.message || cewbResponse?.error || 'Government EWB Portal rejected the request.';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const newCewbNo = cewbResponse.cEwbNo.toString();
    let finalUrl = cewbResponse.url || cewbResponse.printUrl || cewbResponse.print_url || 'https://ewaybillgst.gov.in/';
    if (finalUrl && !finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }

    await Challan.findByIdAndUpdate(challan._id, {
      $set: { cewbNo: newCewbNo, cewbUrl: finalUrl }
    });

    return NextResponse.json({
      success: true,
      message: 'CEWB generated successfully!',
      cewbNo: newCewbNo,
      cewbUrl: finalUrl
    });
  } catch (error: any) {
    console.error('Error generating CEWB for challan:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate CEWB' }, { status: 500 });
  }
}
