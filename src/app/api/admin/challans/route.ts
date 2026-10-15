import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Branch from '@/models/Branch';
import { resolveBranchId } from '@/lib/resolveBranch';
import User from '@/models/User';
import { EwayBillService } from '@/services/ewaybillService';

export const dynamic = 'force-dynamic';

// GET: Paginated list of challans with search
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if ((session.user as any).role === 'branch' && (session.user as any).permissions?.challans?.canView === false) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view Challans' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateStr = searchParams.get('date') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
      if ((session.user as any).role === 'branch' && (session.user as any).branch) {
        query.branch = (session.user as any).branch;
      }
    }

    const bookingCrossing = searchParams.get('bookingCrossing') || '';
    const branch = searchParams.get('branch') || '';

    if (status) {
      query.status = status;
    }

    if (bookingCrossing) {
      query.bookingCrossing = bookingCrossing;
    }

    if (branch && (session.user as any).role !== 'branch') {
      query.branch = branch;
    }

    if (dateStr) {
      const selectedDate = new Date(dateStr);
      if (!isNaN(selectedDate.getTime())) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.challanDate = {
          $gte: selectedDate.toISOString(),
          $lt: nextDay.toISOString()
        };
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Look up matching references
      const matchingVehicles = await Vehicle.find({ vehicleNumber: searchRegex }, '_id').lean();
      const matchingDrivers = await Driver.find({ name: searchRegex }, '_id').lean();
      const matchingBranches = await Branch.find({ name: searchRegex }, '_id').lean();
      
      const vehicleIds = matchingVehicles.map(v => v._id);
      const driverIds = matchingDrivers.map(d => d._id);
      const branchIds = matchingBranches.map(b => b._id);

      query.$or = [
        { challanNumber: searchRegex }
      ];

      if (vehicleIds.length > 0) query.$or.push({ truckNo: { $in: vehicleIds } });
      if (driverIds.length > 0) query.$or.push({ driverName: { $in: driverIds } });
      if (branchIds.length > 0) {
        query.$or.push({ memoDestinationBranch: { $in: branchIds } });
        query.$or.push({ branch: { $in: branchIds } });
      }
    }

    const totalChallans = await Challan.countDocuments(query);
    const challans = await Challan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('bookings', 'lrNumber bookingDate consignor consignee charges items material paymentCondition ewayBillNo')
      .populate('truckNo', 'vehicleNumber')
      .populate('driverName', 'name')
      .populate('branch', 'name code')
      .populate('memoDestinationBranch', 'name code')
      .populate('lrToBranch', 'name code')
      .lean();

    return NextResponse.json({
      challans,
      totalCount: totalChallans,
      totalPages: Math.ceil(totalChallans / limit),
      currentPage: page
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST: Create a new Challan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if ((session.user as any).role === 'branch' && (session.user as any).permissions?.challans?.canAdd === false) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to add Challans' }, { status: 403 });
    }
    if (data.branch === "") delete data.branch;
    if (data.lrToBranch === "") delete data.lrToBranch;
    if (data.memoDestinationBranch === "") delete data.memoDestinationBranch;
    if (data.truckNo === "") delete data.truckNo;
    if (data.driverName === "") delete data.driverName;

    let resolvedBranch = await resolveBranchId(data.branch);
    if (!resolvedBranch) resolvedBranch = await resolveBranchId('ASL');
    if (!resolvedBranch) {
      await connectToDatabase();
      const fallbackBranch = await Branch.findOne({ isDeleted: { $ne: true } });
      if (fallbackBranch) {
        resolvedBranch = fallbackBranch._id;
      }
    }
    
    if (!resolvedBranch) {
      return NextResponse.json({ error: 'No branch available in the database. Please create a branch first.' }, { status: 400 });
    }
    data.branch = resolvedBranch;

    if (data.lrToBranch) data.lrToBranch = await resolveBranchId(data.lrToBranch);
    if (data.memoDestinationBranch) data.memoDestinationBranch = await resolveBranchId(data.memoDestinationBranch);

    await connectToDatabase();

    // Auto-generate sequential challan number if not provided
    let challanNumber = data.challanNumber;
    
    // Always use logistic scope for numbering
    const logisticId = (session.user as any).role === 'logistic' 
      ? (session.user as any).id 
      : (session.user as any).logisticId;

    if (!challanNumber) {
      // Find the highest existing numeric challan number for this SPECIFIC branch
      const allChallans = await Challan.find({ 
        challanNumber: { $exists: true }, 
        branch: data.branch,
        logisticId,
        isDeleted: false
      }, { challanNumber: 1 });
      
      let maxNum = 800; // So first will be 801
      allChallans.forEach((c: any) => {
        if (c.challanNumber) {
          const num = parseInt(String(c.challanNumber).replace(/\D/g, ''), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      challanNumber = (maxNum + 1).toString();
    } else {
      // If frontend sent a number, verify it's not taken for THIS branch — if taken, auto-increment
      const existingChallan = await Challan.findOne({ 
        challanNumber: String(challanNumber), 
        branch: data.branch,
        logisticId,
        isDeleted: false 
      });
      
      if (existingChallan) {
        // Auto-increment instead of throwing error
        const allChallans = await Challan.find({ 
          challanNumber: { $exists: true }, 
          branch: data.branch,
          logisticId,
          isDeleted: false
        }, { challanNumber: 1 });
        
        let maxNum = 800;
        allChallans.forEach((c: any) => {
          if (c.challanNumber) {
            const num = parseInt(String(c.challanNumber).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        challanNumber = (maxNum + 1).toString();
      }
    }

    // Check if any of the bookings are already assigned to another active Challan
    if (data.bookings && data.bookings.length > 0) {
      const alreadyAssigned = await Challan.findOne({
        isDeleted: false,
        bookings: { $in: data.bookings }
      });
      if (alreadyAssigned) {
        return NextResponse.json({ 
          error: `One or more selected LRs are already assigned to Challan ${alreadyAssigned.challanNumber}. Please refresh the page and try again.` 
        }, { status: 400 });
      }
    }

    const newChallan = new Challan({
      challanNumber,
      branch: data.branch,
      logisticId,
      challanDate: data.challanDate ? new Date(data.challanDate) : new Date(),
      allBranchwise: data.allBranchwise || 'All',
      bookingCrossing: data.bookingCrossing || 'Booking',
      selectiveDefault: data.selectiveDefault || 'Selective',
      lrToBranch: data.lrToBranch,
      bookings: data.bookings || [],
      truckNo: data.truckNo,
      agent: data.agent,
      memoDestinationBranch: data.memoDestinationBranch,
      driverName: data.driverName,
      truckFreight: data.truckFreight || 0,
      advanceAmount: data.advanceAmount || 0,
      commission: data.commission || 0,
      remark: data.remark,
      status: 'pending',
      createdBy: (session.user as any).id
    });

    await newChallan.save();

    // ---------------------------------------------------------
    // E-WAY BILL: Auto Update Vehicle (Part B) & Auto Generate CEWB
    // ---------------------------------------------------------
    let generatedCewbNo: string | undefined = undefined;
    let generatedCewbUrl: string | undefined = undefined;

    try {
      const hasEwbAccess = (session.user as any).ewbApiAccess === true;
      if (hasEwbAccess && data.bookings && data.bookings.length > 0 && data.truckNo) {
        const vehicleDoc = await Vehicle.findById(data.truckNo);
        const truckString = vehicleDoc ? vehicleDoc.vehicleNumber.replace(/\s+/g, '').toUpperCase() : '';

        const logisticUser = await User.findById(logisticId);
        const userGstin = (logisticUser as any)?.gstNo || process.env.MASTERS_INDIA_GSTIN;

        if (truckString && userGstin) {
          // Find all bookings loaded in this Challan that have an EWB Number
          const ewbBookings = await Booking.find({
            _id: { $in: data.bookings },
            ewayBillNo: { $exists: true, $type: 'string', $ne: '' }
          });

          if (ewbBookings.length > 0) {
            // Fetch origin branch details for city/state
            const branchDoc = await Branch.findById(data.branch);
            const fromCity = (branchDoc as any)?.city || 'AHMEDABAD';
            const fromState = (branchDoc as any)?.state || 'GUJARAT';

            const cDate = new Date(data.challanDate || new Date());
            const formattedChallanDate = `${cDate.getDate().toString().padStart(2, '0')}/${(cDate.getMonth() + 1).toString().padStart(2, '0')}/${cDate.getFullYear()}`;

            // Step A: Update Part-B Vehicle Number for each individual EWB
            const updatePromises = ewbBookings.map(b => {
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

            // Step B: Automatically generate Consolidated E-Way Bill (CEWB)
            const listOfEwayBills = ewbBookings.map(b => ({
              eway_bill_number: Number(b.ewayBillNo)
            }));

            const cewbPayload = {
              userGstin: userGstin,
              place_of_consignor: fromCity,
              state_of_consignor: fromState,
              vehicle_number: truckString,
              mode_of_transport: 1,
              transporter_document_number: challanNumber,
              transporter_document_date: formattedChallanDate,
              data_source: 'erp',
              list_of_eway_bills: listOfEwayBills
            };

            const cewbResponse = await EwayBillService.generateConsolidatedEwayBill(cewbPayload);
            if (cewbResponse && cewbResponse.cEwbNo) {
              generatedCewbNo = cewbResponse.cEwbNo.toString();
              let finalUrl = cewbResponse.url || cewbResponse.printUrl || cewbResponse.print_url || 'https://ewaybillgst.gov.in/';
              if (finalUrl && !finalUrl.startsWith('http')) {
                finalUrl = `https://${finalUrl}`;
              }
              generatedCewbUrl = finalUrl;

              // Save CEWB details onto the newly created Challan
              newChallan.cewbNo = generatedCewbNo;
              newChallan.cewbUrl = generatedCewbUrl;
              await newChallan.save();
            }
          }
        }
      }
    } catch (ewbErr: any) {
      console.error('Error during auto EWB Vehicle Update / CEWB on Challan create:', ewbErr);
      // We NEVER fail challan creation if government API is slow or temporarily throws an error
    }
    // ---------------------------------------------------------

    // Update loaded bookings status to 'in_transit'
    if (data.bookings && data.bookings.length > 0) {
      await Booking.updateMany(
        { _id: { $in: data.bookings } },
        { 
          $set: { status: 'in_transit' },
          $push: { 
            trackingHistory: { 
               status: 'in_transit', 
               timestamp: new Date(),
               remarks: `Loaded on Challan No: ${challanNumber}`
            } 
          }
        }
      );
    }

    return NextResponse.json(newChallan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
