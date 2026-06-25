import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import { notFound } from 'next/navigation';
import ClientLedger from '@/components/admin/ClientLedger';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await getServerSession(authOptions);
  
  const { id } = await params;
  await connectToDatabase();
  Client.init();
  Invoice.init();

  const client = await Client.findById(id).lean();
  if (!client || client.isDeleted) {
    notFound();
  }

  // Fetch all invoices for this client
  const invoices = await Invoice.find({ client: id, isDeleted: { $ne: true } })
    .populate('bookings', 'lrNumber bookingDate pickupLocation deliveryLocation')
    .sort({ invoiceDate: 1 }) // Chronological
    .lean();

  return <ClientLedger client={JSON.parse(JSON.stringify(client))} invoices={JSON.parse(JSON.stringify(invoices))} />;
}
