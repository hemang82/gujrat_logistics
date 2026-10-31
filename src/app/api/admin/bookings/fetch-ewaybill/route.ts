import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ApiLog from '@/models/ApiLog';
import Client from '@/models/Client';
import Branch from '@/models/Branch';
import { EwayBillService } from '@/services/ewaybillService';

// ---------------------------------------------------------------------------
// Helper: Parse EWB date strings returned by Masters India API
// Handles formats: "28/10/2026 01:00:00 PM"  |  "2026-10-16 16:24:00"
// ---------------------------------------------------------------------------
const parseEwbDate = (dateStr?: string | null): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  if (dateStr.includes('/')) {
    // Format: "DD/MM/YYYY HH:MM:SS AM/PM"
    const parts = dateStr.trim().split(' ');
    const dateParts = parts[0].split('/');
    if (dateParts.length === 3) {
      const day   = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year  = parseInt(dateParts[2], 10);
      if (parts.length > 1) {
        const timeParts = parts[1].split(':');
        let hours       = parseInt(timeParts[0], 10);
        const minutes   = parseInt(timeParts[1] || '0', 10);
        const seconds   = parseInt(timeParts[2] || '0', 10);
        const meridiem  = (parts[2] || '').toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return new Date(year, month, day, hours, minutes, seconds);
      }
      return new Date(year, month, day, 23, 59, 59);
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// ---------------------------------------------------------------------------
// Helper: Evaluate expiry status from MAPPED response object (uses camelCase keys)
// Called on cached data which is already mapped to our frontend format.
// ---------------------------------------------------------------------------
const evaluateExpiryFromMapped = (mapped: { validUpto?: string }) => {
  const validStr = mapped.validUpto || '';
  const parsed   = parseEwbDate(validStr);
  const now      = new Date();
  const isExpired = parsed ? now.getTime() > parsed.getTime() : false;
  const hoursSince = (isExpired && parsed)
    ? Math.max(0, Math.round((now.getTime() - parsed.getTime()) / 3_600_000))
    : 0;
  return { isExpired, hoursSinceExpiry: hoursSince, validUpto: validStr };
};

// ---------------------------------------------------------------------------
// Helper: Map raw Masters India API response → our Frontend UI object
// Field-name reference confirmed from live API JSON:
//   eway_bill_number, eway_bill_date, eway_bill_valid_date, eway_bill_status,
//   number_of_valid_days, transportation_distance,
//   gstin_of_consignor, legal_name_of_consignor, trade_name_of_consignor,
//   address1_of_consignor, address2_of_consignor, place_of_consignor,
//   state_of_consignor, pincode_of_consignor,
//   gstin_of_consignee, legal_name_of_consignee, trade_name_of_consignee,
//   address1_of_consignee, address2_of_consignee, place_of_consignee,
//   state_of_supply (consignee state), pincode_of_consignee,
//   document_number, document_date, document_type,
//   taxable_amount, total_invoice_value,
//   transporter_id, transporter_name,
//   supply_type, sub_supply_type,
//   itemList[].{ product_name, product_description, quantity, unit_of_product, taxable_amount, hsn_code }
//   VehiclListDetails[0].{ vehicle_number, transportation_mode }
// ---------------------------------------------------------------------------
const mapEwbData = (
  ewbData: any,
  ewbNo: string,
  consignorPhone: string,
  consigneePhone: string,
  destinationBranchId: string
) => {
  // ── Date fields ──────────────────────────────────────────────────────────
  const ewayBillDate = ewbData.eway_bill_date || '';
  const validUpto    = ewbData.eway_bill_valid_date || '';   // ✅ Correct field!

  const parsed   = parseEwbDate(validUpto);
  const now      = new Date();
  const isExpired = parsed ? now.getTime() > parsed.getTime() : false;
  const hoursSinceExpiry = (isExpired && parsed)
    ? Math.max(0, Math.round((now.getTime() - parsed.getTime()) / 3_600_000))
    : 0;

  // ── Status ───────────────────────────────────────────────────────────────
  const ewbStatus = ewbData.eway_bill_status || ewbData.status || '';

  // ── Consignor ────────────────────────────────────────────────────────────
  const consignorName = ewbData.legal_name_of_consignor || ewbData.trade_name_of_consignor || '';
  const consignorGst  = ewbData.gstin_of_consignor || '';
  const consignorAddr = [
    ewbData.address1_of_consignor,
    ewbData.address2_of_consignor,
    ewbData.place_of_consignor,
    ewbData.state_of_consignor,
    ewbData.pincode_of_consignor,
  ].filter(Boolean).join(', ');

  // ── Consignee ────────────────────────────────────────────────────────────
  const consigneeName = ewbData.legal_name_of_consignee || ewbData.trade_name_of_consignee || '';
  const consigneeGst  = ewbData.gstin_of_consignee || '';
  // NOTE: API uses "state_of_supply" for consignee state (not state_of_consignee)
  const consigneeAddr = [
    ewbData.address1_of_consignee,
    ewbData.address2_of_consignee,
    ewbData.place_of_consignee,
    ewbData.state_of_supply,
    ewbData.pincode_of_consignee,
  ].filter(Boolean).join(', ');

  // ── Vehicle (first entry from VehiclListDetails) ─────────────────────────
  const vehicleInfo = Array.isArray(ewbData.VehiclListDetails) && ewbData.VehiclListDetails.length > 0
    ? ewbData.VehiclListDetails[0]
    : null;

  // ── Items ─────────────────────────────────────────────────────────────────
  const items = (ewbData.itemList || []).map((item: any) => ({
    packages:    item.quantity     || 1,
    packaging:   item.unit_of_product || 'BOX',
    description: item.product_name || item.product_description || 'Goods',
    hsnCode:     item.hsn_code     || '',
    weight:      0,   // EWB API doesn't provide per-item weight; user fills
    nw:          'N', // Default
    rate:        0,   // EWB only has taxable_amount, not per-unit rate
    amount:      item.taxable_amount || 0,
  }));

  return {
    // ── Core EWB info ──────────────────────────────────────────────────────
    ewayBillNo:           String(ewbData.eway_bill_number || ewbNo),
    ewayBillDate,                      // "28/10/2026 01:00:00 PM"
    validUpto,                         // "30/10/2026 11:59:00 PM"  ← fixed!
    isExpired,
    hoursSinceExpiry,
    ewbStatus,                         // "Active" / "Cancelled" etc.
    numberOfValidDays:    ewbData.number_of_valid_days    || 0,
    transportationDistance: ewbData.transportation_distance || 0,

    // ── Consignor ──────────────────────────────────────────────────────────
    consignor: {
      name:    consignorName,
      gst:     consignorGst,
      phone:   consignorPhone,
      address: consignorAddr,
    },

    // ── Consignee ──────────────────────────────────────────────────────────
    consignee: {
      name:    consigneeName,
      gst:     consigneeGst,
      phone:   consigneePhone,
      address: consigneeAddr,
    },

    // ── Invoice / Document ─────────────────────────────────────────────────
    invoiceNumber:   ewbData.document_number   || '',
    invoiceDate:     ewbData.document_date     || '',
    documentType:    ewbData.document_type     || '',
    totalValue:      ewbData.total_invoice_value || ewbData.taxable_amount || 0,
    taxableAmount:   ewbData.taxable_amount    || 0,

    // ── Supply ────────────────────────────────────────────────────────────
    supplyType:      ewbData.supply_type       || '',
    subSupplyType:   ewbData.sub_supply_type   || '',

    // ── Transporter ───────────────────────────────────────────────────────
    transporterId:   ewbData.transporter_id    || '',
    transporterName: ewbData.transporter_name  || '',

    // ── Vehicle (from Part-B VehiclListDetails[0]) ────────────────────────
    vehicleNumber:   vehicleInfo?.vehicle_number        || '',
    vehicleType:     ewbData.vehicle_type               || vehicleInfo?.transportation_mode || '',

    // ── Branch (auto-matched) ─────────────────────────────────────────────
    destinationBranch: destinationBranchId,

    // ── Items ─────────────────────────────────────────────────────────────
    items,
  };
};

// ===========================================================================
// GET /api/admin/bookings/fetch-ewaybill?number=<12-digit>
// ===========================================================================
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const number      = searchParams.get('number');
    const forceRefresh = searchParams.get('refresh') === 'true'; // ?refresh=true bypasses cache

    if (!number || !/^\d{12}$/.test(number)) {
      return NextResponse.json(
        { error: 'Invalid E-Way Bill Number. Must be exactly 12 digits.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Check User Permission & Logistic Company Access
    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get the parent logistic company for multi-tenant SaaS support
    const activeLogisticId = dbUser.role === 'logistic' ? dbUser._id : dbUser.logisticId;
    const parentLogistic   = await User.findById(activeLogisticId);

    // Live Database Check: Only allow if logistic company has ewbApiAccess === true
    const hasAccess = dbUser.role === 'superadmin' ? true : (dbUser.role === 'logistic' ? !!dbUser.ewbApiAccess : !!parentLogistic?.ewbApiAccess);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'E-Way Bill API Access Denied. Contact Admin to enable this feature.' },
        { status: 403 }
      );
    }
    const tenantGstin      = parentLogistic?.gstNumber;

    if (!tenantGstin) {
      return NextResponse.json(
        { error: 'Logistic Company GSTIN is not configured in settings.' },
        { status: 400 }
      );
    }

    // 2. Smart Caching: return cached data if fetched in last 24 hours
    //    Skip cache if forceRefresh=true (e.g., ?refresh=true)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedLog = forceRefresh ? null : await ApiLog.findOne({
      apiType:        'EWAY_BILL_FETCH',
      requestData:    number,
      responseStatus: 'success',
      createdAt:      { $gte: twentyFourHoursAgo },
    }).sort({ createdAt: -1 });

    if (cachedLog?.errorMessage) {
      try {
        const cachedData = JSON.parse(cachedLog.errorMessage);

        // Re-evaluate expiry freshly (time may have passed since caching)
        const exp = evaluateExpiryFromMapped(cachedData);
        cachedData.isExpired       = exp.isExpired;
        cachedData.hoursSinceExpiry = exp.hoursSinceExpiry;

        await ApiLog.create({
          userId:         dbUser._id,
          apiType:        'EWAY_BILL_FETCH',
          requestData:    number,
          responseStatus: 'cached',
        });

        return NextResponse.json(cachedData, { status: 200 });
      } catch {
        // JSON parse error — fall through to fresh fetch
      }
    }

    // 3. Fresh fetch from Masters India API
    const ewbData = await EwayBillService.fetchEwayBillDetails(number, tenantGstin);

    // 4. Auto-fill phone numbers from Client DB
    const consignorGst  = ewbData.gstin_of_consignor || '';
    const consignorName = ewbData.legal_name_of_consignor || ewbData.trade_name_of_consignor || '';
    let consignorPhone  = '';

    if (consignorGst || consignorName) {
      const c = await Client.findOne({
        $or: [
          ...(consignorGst  ? [{ gstin: consignorGst  }] : []),
          ...(consignorName ? [{ name:  consignorName  }] : []),
        ],
      });
      if (c?.phone) consignorPhone = c.phone;
    }

    const consigneeGst  = ewbData.gstin_of_consignee || '';
    const consigneeName = ewbData.legal_name_of_consignee || ewbData.trade_name_of_consignee || '';
    let consigneePhone  = '';

    if (consigneeGst || consigneeName) {
      const c = await Client.findOne({
        $or: [
          ...(consigneeGst  ? [{ gstin: consigneeGst  }] : []),
          ...(consigneeName ? [{ name:  consigneeName  }] : []),
        ],
      });
      if (c?.phone) consigneePhone = c.phone;
    }

    // 5. Auto-match Destination Branch by Consignee Pincode → City
    let destinationBranchId = '';
    const consigneePincode  = (ewbData.pincode_of_consignee || '').toString().trim();
    const consigneePlace    = (ewbData.place_of_consignee   || '').trim();

    if (activeLogisticId && (consigneePincode || consigneePlace)) {
      if (consigneePincode) {
        const b = await Branch.findOne({
          logisticId: activeLogisticId,
          isDeleted:  { $ne: true },
          pincode:    consigneePincode,
        });
        if (b) destinationBranchId = b._id.toString();
      }

      if (!destinationBranchId && consigneePlace) {
        const re = new RegExp(consigneePlace, 'i');
        const b  = await Branch.findOne({
          logisticId: activeLogisticId,
          isDeleted:  { $ne: true },
          $or: [{ city: re }, { name: re }],
        });
        if (b) destinationBranchId = b._id.toString();
      }
    }

    // 6. Map to frontend format
    const mappedDetails = mapEwbData(
      ewbData,
      number,
      consignorPhone,
      consigneePhone,
      destinationBranchId
    );

    // 7. Cache the mapped result
    await ApiLog.create({
      userId:         dbUser._id,
      apiType:        'EWAY_BILL_FETCH',
      requestData:    number,
      responseStatus: 'success',
      errorMessage:   JSON.stringify(mappedDetails), // used as cache payload
    });

    return NextResponse.json(mappedDetails);

  } catch (error: any) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await ApiLog.create({
          userId:         session.user.id,
          apiType:        'EWAY_BILL_FETCH',
          requestData:    new URL(request.url).searchParams.get('number') || 'Unknown',
          responseStatus: 'failed',
          errorMessage:   error.message,
        });
      }
    } catch { /* ignore logging errors */ }

    return NextResponse.json(
      { error: 'Failed to fetch E-Way Bill details.', details: error.message },
      { status: 500 }
    );
  }
}

// ===========================================================================
// DELETE /api/admin/bookings/fetch-ewaybill?number=<12-digit>
// Clears the 24hr cache for a specific EWB number (or all if no number given)
// Use this when cached data is stale/wrong after a code fix.
// ===========================================================================
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');

    const filter: any = { apiType: 'EWAY_BILL_FETCH', responseStatus: 'success' };
    if (number) filter.requestData = number;

    const result = await ApiLog.deleteMany(filter);

    return NextResponse.json({
      success: true,
      message: number
        ? `Cache cleared for EWB ${number}. ${result.deletedCount} entr(ies) deleted.`
        : `All EWB cache cleared. ${result.deletedCount} entr(ies) deleted.`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to clear cache.', details: error.message },
      { status: 500 }
    );
  }
}
