import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ApiLog from '@/models/ApiLog';
import Client from '@/models/Client';
import { EwayBillService } from '@/services/ewaybillService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');

    if (!number || !/^\d{12}$/.test(number)) {
      return NextResponse.json({ error: 'Invalid E-Way Bill Number. Must be exactly 12 digits.' }, { status: 400 });
    }

    await dbConnect();

    // 1. Check User Permission
    const dbUser = await User.findById(session.user.id);
    const hasAccess = (session.user as any).ewbApiAccess;
    if (!dbUser || !hasAccess) {
      return NextResponse.json({ error: 'E-Way Bill API Access Denied. Contact Admin to enable this feature.' }, { status: 403 });
    }

    // 2. Smart Caching System (Check if fetched in last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedLog = await ApiLog.findOne({
      apiType: 'EWAY_BILL_FETCH',
      requestData: number,
      responseStatus: 'success',
      createdAt: { $gte: twentyFourHoursAgo }
    }).sort({ createdAt: -1 });

    if (cachedLog && cachedLog.errorMessage) {
      // If we saved the parsed JSON inside errorMessage string (hacky but works for mock cache)
      try {
        const cachedData = JSON.parse(cachedLog.errorMessage);
        
        // Log this cache hit
        await ApiLog.create({
          userId: dbUser._id,
          apiType: 'EWAY_BILL_FETCH',
          requestData: number,
          responseStatus: 'cached'
        });

        return NextResponse.json(cachedData, { status: 200 });
      } catch (e) {
        // Ignore JSON parse error and proceed to fresh fetch
      }
    }

    // Call Masters India API via Service Layer
    const ewbData = await EwayBillService.fetchEwayBillDetails(number);

    // Look up Clients to auto-fill Phone numbers if they exist
    const consignorGst = ewbData.gstin_of_consignor || '';
    const consignorName = ewbData.legal_name_of_consignor || ewbData.trade_name_of_consignor || '';
    let consignorPhone = '';
    
    if (consignorGst || consignorName) {
      const consignorClient = await Client.findOne({
        $or: [
          ...(consignorGst ? [{ gstin: consignorGst }] : []),
          ...(consignorName ? [{ name: consignorName }] : [])
        ]
      });
      if (consignorClient && consignorClient.phone) consignorPhone = consignorClient.phone;
    }

    const consigneeGst = ewbData.gstin_of_consignee || '';
    const consigneeName = ewbData.legal_name_of_consignee || ewbData.trade_name_of_consignee || '';
    let consigneePhone = '';

    if (consigneeGst || consigneeName) {
      const consigneeClient = await Client.findOne({
        $or: [
          ...(consigneeGst ? [{ gstin: consigneeGst }] : []),
          ...(consigneeName ? [{ name: consigneeName }] : [])
        ]
      });
      if (consigneeClient && consigneeClient.phone) consigneePhone = consigneeClient.phone;
    }

    // Map Masters India response to our Frontend UI format
    const mappedDetails = {
      ewayBillNo: ewbData.eway_bill_number || number,
      ewayBillDate: ewbData.eway_bill_date || '',
      consignor: {
        name: consignorName,
        gst: consignorGst,
        phone: consignorPhone, // Populated from Client DB!
        address: [ewbData.address1_of_consignor, ewbData.address2_of_consignor, ewbData.place_of_consignor, ewbData.state_of_consignor, ewbData.pincode_of_consignor].filter(Boolean).join(', ')
      },
      consignee: {
        name: consigneeName,
        gst: consigneeGst,
        phone: consigneePhone, // Populated from Client DB!
        address: [ewbData.address1_of_consignee, ewbData.address2_of_consignee, ewbData.place_of_consignee, ewbData.state_of_consignee, ewbData.pincode_of_consignee].filter(Boolean).join(', ')
      },
      destinationBranch: '', // Requires manual selection by user
      invoiceNumber: ewbData.document_number || '',
      invoiceDate: ewbData.document_date || '',
      totalValue: ewbData.total_invoice_value || ewbData.taxable_amount || 0,
      items: (ewbData.itemList || []).map((item: any) => ({
        packages: item.quantity || 1,
        packaging: item.unit_of_product || 'BOX',
        description: item.product_name || item.product_description || 'Goods',
        weight: 0, // EWB API doesn't always provide weight per item, user can fill
        nw: 'N', // Default to number of packages
        rate: 0, // Rate per kg/pkg usually isn't in EWB, only taxable value
        amount: item.taxable_amount || 0
      }))
    };

    // Log this fresh hit
    await ApiLog.create({
      userId: dbUser._id,
      apiType: 'EWAY_BILL_FETCH',
      requestData: number,
      responseStatus: 'success',
      errorMessage: JSON.stringify(mappedDetails) // Saving data to use as cache later
    });

    return NextResponse.json(mappedDetails);
  } catch (error: any) {
    // Log failure
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await ApiLog.create({
          userId: session.user.id,
          apiType: 'EWAY_BILL_FETCH',
          requestData: new URL(request.url).searchParams.get('number') || 'Unknown',
          responseStatus: 'failed',
          errorMessage: error.message
        });
      }
    } catch (e) {}

    return NextResponse.json({ error: 'Failed to fetch E-Way Bill details.', details: error.message }, { status: 500 });
  }
}
