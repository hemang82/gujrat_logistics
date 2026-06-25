import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import ClientList from '@/components/admin/ClientList';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  await getServerSession(authOptions);
  await connectToDatabase();
  Client.init();
  Invoice.init();

  // Fetch all clients
  const clients = await Client.find({ isDeleted: false }).sort({ name: 1 }).lean();

  // Enrich clients with balances
  const enrichedClients = await Promise.all(clients.map(async (client: any) => {
    // Find all invoices for this client
    const invoices = await Invoice.find({ client: client._id, isDeleted: { $ne: true } }).lean();
    
    let totalBilled = 0;
    let totalPaid = 0;
    
    invoices.forEach((inv: any) => {
      totalBilled += inv.grandTotal || 0;
      totalPaid += inv.amountPaid || 0;
    });

    return {
      ...client,
      totalBilled,
      totalPaid,
      pendingBalance: Math.max(0, totalBilled - totalPaid),
      invoiceCount: invoices.length,
      _id: client._id.toString()
    };
  }));

  return <ClientList initialClients={enrichedClients} />;
}
