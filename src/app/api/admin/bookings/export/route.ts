import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const dateStr = searchParams.get('date') || '';

    await connectToDatabase();

    // Build query (Same as the list page)
    const query: any = {};
    if (search) {
      query.$or = [
        { lrNumber: { $regex: search, $options: 'i' } },
        { 'consignor.name': { $regex: search, $options: 'i' } },
        { 'consignee.name': { $regex: search, $options: 'i' } },
        { deliveryLocation: { $regex: search, $options: 'i' } }
      ];
    }

    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      query.bookingDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch all matching records (No limit for export)
    const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();

    // Generate CSV
    const header = [
      'LR Number',
      'Date',
      'Sender Name',
      'Sender Phone',
      'Receiver Name',
      'Receiver Phone',
      'Pickup Location',
      'Delivery Location',
      'Item Description',
      'Quantity',
      'Weight (KG)',
      'Freight Amount',
      'Hamali',
      'Surcharge',
      'GST %',
      'GST Amount',
      'Total Amount',
      'Payment Condition',
      'Status'
    ];

    const rows = bookings.map((b: any) => [
      b.lrNumber || '',
      new Date(b.bookingDate).toLocaleDateString('en-IN'),
      `"${(b.consignor?.name || '').replace(/"/g, '""')}"`,
      b.consignor?.phone || '',
      `"${(b.consignee?.name || '').replace(/"/g, '""')}"`,
      b.consignee?.phone || '',
      `"${(b.pickupLocation || '').replace(/"/g, '""')}"`,
      `"${(b.deliveryLocation || '').replace(/"/g, '""')}"`,
      `"${(b.material?.itemName || '').replace(/"/g, '""')}"`,
      b.material?.quantity || 0,
      b.material?.weight || 0,
      b.charges?.freightAmount || 0,
      b.charges?.hamali || 0,
      b.charges?.surCharge || 0,
      b.charges?.gstRate || 0,
      b.charges?.gstAmount || 0,
      b.charges?.totalAmount || 0,
      b.paymentCondition || '',
      b.status || 'pending'
    ]);

    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bookings_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
