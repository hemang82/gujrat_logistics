import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Invoice from '@/models/Invoice';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { clientId, clientName, clientAddress, clientPhone, clientGst, bookingIds } = body;

    if ((!clientId && !clientName) || !bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: 'Client details and at least one Booking are required' }, { status: 400 });
    }

    // Fetch all bookings to calculate totals
    const bookings = await Booking.find({ _id: { $in: bookingIds } });
    if (bookings.length !== bookingIds.length) {
      return NextResponse.json({ error: 'Some bookings were not found' }, { status: 400 });
    }

    // Calculate totals
    let totalFreight = 0;
    let totalHamali = 0;
    let totalSurcharge = 0;
    let totalGst = 0;
    let grandTotal = 0;

    bookings.forEach((b) => {
      totalFreight += b.charges.freightAmount || 0;
      totalHamali += b.charges.hamali || 0;
      totalSurcharge += b.charges.surCharge || 0;
      totalGst += b.charges.gstAmount || 0;
      grandTotal += b.charges.totalAmount || 0;
    });

    // Auto-generate invoice number (e.g., INV-20260625-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Invoice.countDocuments({ invoiceNumber: { $regex: `^INV-${dateStr}-` } });
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Set Due Date (e.g. 15 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = new Invoice({
      invoiceNumber,
      client: clientId || null,
      clientName: clientName || 'Unknown',
      clientAddress,
      clientPhone,
      clientGst,
      bookings: bookingIds,
      totalFreight,
      totalHamali,
      totalSurcharge,
      totalGst,
      grandTotal,
      amountPaid: 0,
      status: 'unpaid',
      dueDate,
      createdBy: (session.user as any).id,
    });

    await invoice.save();

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Create Invoice Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
