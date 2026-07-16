'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Printer, CheckSquare, Square, IndianRupee, CreditCard, Filter, Search } from 'lucide-react';
import { ThemeSelect } from '@/components/ui/theme-select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BillingManager({ 
  initialPendingBookings, 
  initialInvoices,
  clients 
}: { 
  initialPendingBookings: any[];
  initialInvoices: any[];
  clients: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'invoices'>('pending');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  
  // Invoice Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientGst, setClientGst] = useState('');

  // Handle client selection
  const handleClientSelect = (id: string) => {
    setClientId(id);
    setSelectedBookings([]); // Clear checked bookings when client changes
    if (id === 'new') {
      setClientName('');
      setClientAddress('');
      setClientPhone('');
      setClientGst('');
    } else {
      const client = clients.find(c => c._id === id);
      if (client) {
        setClientName(client.name);
        setClientAddress(client.address || '');
        setClientPhone(client.phone || '');
        setClientGst(client.gstin || '');
      }
    }
  };

  // Payment Update State
  const [updatingInvoice, setUpdatingInvoice] = useState<any>(null);
  const [amountToUpdate, setAmountToUpdate] = useState<number | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookings.length === 0) return alert('Select at least one booking');
    
    setIsGenerating(true);
    try {
      const payload: any = {
        bookingIds: selectedBookings,
        clientName,
        clientAddress,
        clientPhone,
        clientGst
      };
      if (clientId && clientId !== 'new') {
        payload.clientId = clientId;
      }

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reset & Refresh
      setSelectedBookings([]);
      setClientId('');
      setClientName('');
      setClientAddress('');
      setClientPhone('');
      setClientGst('');
      setActiveTab('invoices');
      router.refresh();
      
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingInvoice || amountToUpdate === '') return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/invoices/${updatingInvoice._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: Number(amountToUpdate) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUpdatingInvoice(null);
      setAmountToUpdate('');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPendingBookings = initialPendingBookings.filter(b => {
    if (!clientId || clientId === 'new') return true;
    const client = clients.find(c => c._id === clientId);
    if (!client) return true;
    return b.consignor?.name?.toLowerCase() === client.name.toLowerCase();
  });

  const selectedTotal = filteredPendingBookings
    .filter(b => selectedBookings.includes(b._id))
    .reduce((acc, curr) => acc + (curr.charges?.totalAmount || 0), 0);

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 font-bold transition-all text-sm uppercase tracking-wide border-b-2 ${activeTab === 'pending' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Pending Bookings ({initialPendingBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-2 font-bold transition-all text-sm uppercase tracking-wide border-b-2 ${activeTab === 'invoices' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Generated Invoices
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-bold">Unbilled LRs</CardTitle>
                {selectedBookings.length > 0 && (
                  <div className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-sm font-bold animate-in fade-in">
                    {selectedBookings.length} Selected (₹{selectedTotal.toLocaleString('en-IN')})
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <th className="p-4 w-10">
                          <button onClick={() => {
                            if (selectedBookings.length === filteredPendingBookings.length) setSelectedBookings([]);
                            else setSelectedBookings(filteredPendingBookings.map(b => b._id));
                          }}>
                            {selectedBookings.length === filteredPendingBookings.length && filteredPendingBookings.length > 0 ? 
                              <CheckSquare className="w-5 h-5 text-brand-primary" /> : 
                              <Square className="w-5 h-5" />
                            }
                          </button>
                        </th>
                        <th className="font-semibold p-4">LR Number</th>
                        <th className="font-semibold p-4">Date</th>
                        <th className="font-semibold p-4">Client (Consignor)</th>
                        <th className="font-semibold p-4">Route</th>
                        <th className="font-semibold p-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPendingBookings.length === 0 ? (
                         <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">No pending bookings to invoice.</td>
                        </tr>
                      ) : filteredPendingBookings.map((b) => (
                        <tr key={b._id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedBookings.includes(b._id) ? 'bg-brand-primary/5' : ''}`} onClick={() => toggleSelection(b._id)}>
                          <td className="p-4">
                            {selectedBookings.includes(b._id) ? 
                              <CheckSquare className="w-5 h-5 text-brand-primary" /> : 
                              <Square className="w-5 h-5 text-gray-300" />
                            }
                          </td>
                          <td className="p-4 font-bold">{b.lrNumber}</td>
                          <td className="p-4 text-sm text-gray-600">{new Date(b.bookingDate).toLocaleDateString('en-IN')}</td>
                          <td className="p-4 text-sm font-medium">{b.consignor?.name || 'N/A'}</td>
                          <td className="p-4 text-xs text-gray-500">{b.pickupLocation} &rarr; {b.deliveryLocation}</td>
                          <td className="p-4 text-right font-bold">₹{b.charges?.totalAmount?.toLocaleString('en-IN') || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-none shadow-sm rounded-2xl bg-white sticky top-24">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-primary" /> Generate Master Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedBookings.length === 0 ? (
                  <div className="text-center p-6 text-gray-500 border border-dashed rounded-xl bg-gray-50">
                    <p className="text-sm">Select one or more bookings from the list to generate an invoice.</p>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateInvoice} className="space-y-4">
                    <div>
                      <Label htmlFor="clientSelect">Select Client</Label>
                      <ThemeSelect 
                        name="selectedClient"
                        value={clientId} 
                        onChange={(e: any) => handleClientSelect(e.target.value)}
                        options={[
                          ...clients.map(c => ({ value: c._id, label: c.name })),
                          { value: 'new', label: '+ Add New Client (Manual Entry)' }
                        ]}
                        placeholder="-- Choose a Client --"
                        className="mt-1"
                      />
                    </div>

                    {(clientId === 'new' || clients.length === 0) && (
                      <div>
                        <Label htmlFor="clientName">Billed To (Client Name) *</Label>
                        <Input id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} required placeholder="e.g. Reliance Industries" className="mt-1" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientPhone">Phone</Label>
                        <Input id="clientPhone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} disabled={clientId !== 'new' && !!clientId} placeholder="Optional" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="clientGst">GSTIN</Label>
                        <Input id="clientGst" value={clientGst} onChange={e => setClientGst(e.target.value)} disabled={clientId !== 'new' && !!clientId} placeholder="Optional" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="clientAddress">Billing Address</Label>
                      <Input id="clientAddress" value={clientAddress} onChange={e => setClientAddress(e.target.value)} disabled={clientId !== 'new' && !!clientId} placeholder="Complete address" className="mt-1" />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Selected LRs:</span>
                        <span className="font-bold">{selectedBookings.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-800">Total Amount:</span>
                        <span className="font-extrabold text-brand-primary">₹{selectedTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <Button type="submit" disabled={isGenerating} className="w-full font-bold h-12 text-md mt-4">
                      {isGenerating ? 'Generating...' : 'Create Master Invoice'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
            <CardTitle className="text-xl font-bold text-brand-text-primary">Generated Invoices</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Search Invoice No or Client..."
                className="pl-9 h-10 bg-white rounded-xl border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-brand-primary/50 text-sm w-full"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="font-semibold p-4">Invoice No</th>
                    <th className="font-semibold p-4">Date</th>
                    <th className="font-semibold p-4">Client Name</th>
                    <th className="font-semibold p-4">Amount</th>
                    <th className="font-semibold p-4">Status</th>
                    <th className="font-semibold p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(() => {
                    const filtered = initialInvoices.filter(inv => {
                      if (!invoiceSearch) return true;
                      const term = invoiceSearch.toLowerCase();
                      return (
                        inv.invoiceNumber.toLowerCase().includes(term) ||
                        inv.clientName.toLowerCase().includes(term)
                      );
                    });
                    if (filtered.length === 0) {
                      return <tr><td colSpan={6} className="p-8 text-center text-gray-500">No matching invoices found.</td></tr>;
                    }
                    return filtered.map((inv) => (
                      <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-brand-primary">{inv.invoiceNumber}</td>
                        <td className="p-4 text-sm text-gray-600">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                        <td className="p-4 font-medium">
                          {inv.clientName}
                          <span className="block text-xs text-gray-500">{inv.bookings.length} Trips</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">₹{inv.grandTotal.toLocaleString('en-IN')}</div>
                          {inv.amountPaid > 0 && <div className="text-xs text-brand-success font-medium">Paid: ₹{inv.amountPaid.toLocaleString('en-IN')}</div>}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border inline-block
                            ${inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            ${inv.status === 'partial' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                            ${inv.status === 'unpaid' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                          `}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setUpdatingInvoice(inv); setAmountToUpdate(inv.amountPaid); }}
                            className="h-9 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <IndianRupee className="w-4 h-4 mr-1" /> Update Pay
                          </Button>
                          <Link href={`/admin/billing/${inv._id}/print`} target="_blank">
                            <Button variant="default" size="sm" className="h-9 bg-gray-800 hover:bg-black text-white">
                              <Printer className="w-4 h-4 mr-1" /> Print
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Update Modal */}
      {updatingInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Update Payment</h3>
              <p className="text-sm text-gray-500 mt-1">Invoice: {updatingInvoice.invoiceNumber}</p>
            </div>
            <form onSubmit={handleUpdatePayment} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700">Total Invoice Amount:</span>
                <span className="font-bold text-lg">₹{updatingInvoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Total Amount Received So Far (₹)</Label>
                <Input 
                  type="number" 
                  value={amountToUpdate} 
                  onChange={(e) => setAmountToUpdate(e.target.value ? Number(e.target.value) : '')} 
                  required 
                  min="0"
                  max={updatingInvoice.grandTotal}
                  className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary text-lg font-bold transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setUpdatingInvoice(null)} className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium">Cancel</Button>
                <Button type="submit" disabled={isUpdating} className="flex-1 h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold shadow-md">
                  {isUpdating ? 'Saving...' : 'Save Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
