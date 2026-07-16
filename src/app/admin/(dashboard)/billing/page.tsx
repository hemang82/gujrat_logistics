import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import BillingManager from '@/components/admin/BillingManager';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();
  Client.init();

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';

  // 1. Fetch Pending Bookings (Delivered but not Invoiced yet)
  // To know if a booking is invoiced, we check if it exists in any Invoice.bookings array.
  // A simpler way: we can fetch ALL Invoices, gather their booking IDs, and exclude them.
  // Or just find Invoices and pull out their booking IDs.
  const invoices = await Invoice.find({ isDeleted: { $ne: true } })
    .populate('bookings', 'lrNumber')
    .sort({ invoiceDate: -1 })
    .lean();

  const invoicedBookingIds = invoices.flatMap((inv: any) => inv.bookings.map((b: any) => b._id.toString()));

  // Query for Bookings that are NOT invoiced yet
  // Usually you only bill "delivered" bookings, or "in_transit".
  // Let's allow billing any active booking that hasn't been billed.
  const bookingQuery: any = {
    isDeleted: { $ne: true },
    _id: { $nin: invoicedBookingIds }
  };

  if (search) {
    bookingQuery.$or = [
      { lrNumber: { $regex: search, $options: 'i' } },
      { 'consignor.name': { $regex: search, $options: 'i' } },
      { 'consignee.name': { $regex: search, $options: 'i' } },
    ];
  }

  const pendingBookings = await Booking.find(bookingQuery)
    .sort({ bookingDate: -1 })
    .lean();

  const clients = await Client.find({ isDeleted: false }).sort({ name: 1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">Billing & Invoices</h1>
          <p className="text-brand-text-secondary mt-1">Generate master invoices and track client payments.</p>
        </div>
      </div>

      <BillingManager
        initialPendingBookings={JSON.parse(JSON.stringify(pendingBookings))}
        initialInvoices={JSON.parse(JSON.stringify(invoices))}
        clients={JSON.parse(JSON.stringify(clients))}
      />
    </div>
  );
}

// Trigger rebuild