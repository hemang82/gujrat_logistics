import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import LorryHire from '@/models/LorryHire';
import User from '@/models/User';
import { EwayBillService } from '@/services/ewaybillService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).ewbApiAccess !== true) {
      return NextResponse.json({ error: 'Unauthorized or missing EWB API Access' }, { status: 401 });
    }

    await connectDB();
    const { challanId, lorryHireId } = await request.json();

    if (!lorryHireId) {
      return NextResponse.json({ error: 'LorryHire ID is required' }, { status: 400 });
    }

    const lorryHire = await LorryHire.findById(lorryHireId).populate({
      path: 'challans',
      populate: { path: 'bookings', model: 'Booking' }
    });

    if (!lorryHire) {
      return NextResponse.json({ error: 'LorryHire not found' }, { status: 404 });
    }

    let targetChallans: any[] = [];
    if (challanId && challanId !== 'ALL') {
      const specific = (lorryHire.challans as any[]).find(c => c._id.toString() === challanId);
      if (!specific) return NextResponse.json({ error: 'Challan not found in this LorryHire' }, { status: 404 });
      if (specific.cewbNo) return NextResponse.json({ error: 'CEWB already generated for this Challan' }, { status: 400 });
      targetChallans.push(specific);
    } else {
      targetChallans = (lorryHire.challans as any[]).filter(c => !c.cewbNo);
      if (targetChallans.length === 0) return NextResponse.json({ error: 'All challans already have CEWB or no challans exist' }, { status: 400 });
    }

    // Fetch vehicle string
    const vehicleDoc = await Vehicle.findById(lorryHire.truckNo);
    const truckString = vehicleDoc ? vehicleDoc.vehicleNumber.replace(/\s+/g, '') : '';

    if (!truckString) {
      return NextResponse.json({ error: 'Vehicle number is required for CEWB' }, { status: 400 });
    }

    // Fetch user GSTIN
    const logisticUser = await User.findById(lorryHire.logisticId);
    const userGstin = logisticUser?.gstNo || process.env.MASTERS_INDIA_GSTIN;

    if (!userGstin) {
      return NextResponse.json({ error: 'Logistic GSTIN not found' }, { status: 400 });
    }

    const results = [];
    
    for (const challan of targetChallans) {
      // Prepare list of eway bills for THIS challan ONLY
      const listOfEwayBills: any[] = [];
      if (challan.bookings && challan.bookings.length > 0) {
        challan.bookings.forEach((b: any) => {
          if (b.ewayBillNo && b.ewayBillNo.trim() !== '') {
            listOfEwayBills.push({
              eway_bill_number: Number(b.ewayBillNo)
            });
          }
        });
      }

      if (listOfEwayBills.length === 0) {
        // Skip challans with no valid LRs
        continue;
      }

      const cDate = new Date(challan.challanDate || new Date());
      const formattedDate = `${cDate.getDate().toString().padStart(2, '0')}/${(cDate.getMonth() + 1).toString().padStart(2, '0')}/${cDate.getFullYear()}`;

      const fromCity = lorryHire.fromCity || (challan.branch as any)?.city || challan.fromCity || "UNKNOWN";
      const fromState = lorryHire.fromState || (challan.branch as any)?.state || challan.fromState || "UNKNOWN";

      const payload = {
        userGstin: userGstin,
        place_of_consignor: fromCity,
        state_of_consignor: fromState,
        vehicle_number: truckString,
        mode_of_transport: Number(lorryHire.modeOfTransport) || 1,
        transporter_document_number: challan.challanNumber,
        transporter_document_date: formattedDate,
        data_source: "erp",
        list_of_eway_bills: listOfEwayBills
      };

      try {
        const apiResponse = await EwayBillService.generateConsolidatedEwayBill(payload);
        
        if (apiResponse && apiResponse.cEwbNo) {
          const newCewbNo = apiResponse.cEwbNo.toString();
          let finalUrl = apiResponse.url || apiResponse.printUrl || apiResponse.print_url || `https://ewaybillgst.gov.in/`;
          if (finalUrl && !finalUrl.startsWith('http')) {
            finalUrl = `https://${finalUrl}`;
          }

          await Challan.findByIdAndUpdate(challan._id, {
            $set: { cewbNo: newCewbNo, cewbUrl: finalUrl }
          });
          
          results.push({
            challanId: challan._id,
            cewbNo: newCewbNo,
            cewbUrl: finalUrl
          });
        }
      } catch (err: any) {
        console.error(`Error generating CEWB for challan ${challan.challanNumber}:`, err);
        // If it's a single request, throw. If ALL, just skip and maybe they generate individually later.
        if (challanId && challanId !== 'ALL') {
          throw err;
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'Failed to generate CEWB for any challan, or no LRs available' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `CEWB generated successfully for ${results.length} challan(s)`, 
      cewbNo: results[0].cewbNo, // For backwards compatibility with single generate
      cewbUrl: results[0].cewbUrl,
      results
    }, { status: 200 });

  } catch (error: any) {
    console.error('CEWB Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
