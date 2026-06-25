'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Building2, Phone, IndianRupee, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientList({ initialClients }: { initialClients: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    gstin: '',
    address: ''
  });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsAddModalOpen(false);
      setNewClient({ name: '', phone: '', gstin: '', address: '' });
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add client');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredClients = initialClients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const totalOutstanding = initialClients.reduce((acc, curr) => acc + (curr.pendingBalance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">Client Ledger</h1>
          <p className="text-brand-text-secondary mt-1">Manage parties and track outstanding balances.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 font-bold text-lg flex items-center gap-2">
          Total Outstanding: ₹{totalOutstanding.toLocaleString('en-IN')}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-transparent focus:bg-white transition-colors rounded-xl"
            />
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 rounded-xl bg-brand-primary text-white font-bold w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Client
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-semibold p-4">Client Name</th>
                  <th className="font-semibold p-4">Contact</th>
                  <th className="font-semibold p-4 text-center">Invoices</th>
                  <th className="font-semibold p-4 text-right">Total Billed</th>
                  <th className="font-semibold p-4 text-right">Outstanding (Due)</th>
                  <th className="font-semibold p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No clients found.
                    </td>
                  </tr>
                ) : filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{client.name}</div>
                          {client.gstin && <div className="text-xs text-gray-500">GST: {client.gstin}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {client.phone ? <div className="flex items-center gap-1"><Phone className="w-3 h-3"/> {client.phone}</div> : 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">{client.invoiceCount}</span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-600">
                      ₹{client.totalBilled?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-bold ${client.pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{client.pendingBalance?.toLocaleString('en-IN') || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/admin/clients/${client._id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                          View Ledger
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Add New Client</h3>
              <p className="text-sm text-gray-500 mt-1">Create a new ledger account for a party.</p>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-600 font-medium">Client Name (Party Name) *</Label>
                <Input 
                  id="name" 
                  value={newClient.name} 
                  onChange={e => setNewClient({...newClient, name: e.target.value})} 
                  required 
                  placeholder="e.g. Reliance Industries"
                  className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-600 font-medium">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={newClient.phone} 
                    onChange={e => setNewClient({...newClient, phone: e.target.value})} 
                    placeholder="Optional"
                    className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="gstin" className="text-gray-600 font-medium">GSTIN</Label>
                  <Input 
                    id="gstin" 
                    value={newClient.gstin} 
                    onChange={e => setNewClient({...newClient, gstin: e.target.value})} 
                    placeholder="Optional"
                    className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-gray-600 font-medium">Billing Address</Label>
                <Input 
                  id="address" 
                  value={newClient.address} 
                  onChange={e => setNewClient({...newClient, address: e.target.value})} 
                  placeholder="Complete address"
                  className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold shadow-md">
                  {isSubmitting ? 'Saving...' : 'Save Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
