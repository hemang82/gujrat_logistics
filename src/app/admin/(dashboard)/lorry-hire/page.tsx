'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ListActions from '@/components/admin/ListActions';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Basic Dialog components to avoid adding huge dependencies if not present. We can just build a simple modal.
function PaymentModal({ isOpen, onClose, onSubmit, voucher }: any) {
  const defaultAmount = voucher ? Math.max(0, (Number(voucher.totalAmount) || 0) - (Number(voucher.advanceAmount) || 0)) : '';
  const [amount, setAmount] = useState<string | number>('');
  
  useEffect(() => {
    setAmount(defaultAmount);
  }, [defaultAmount, isOpen]);

  if (!isOpen || !voucher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Settle Balance Payment</h2>
          <p className="text-xs text-gray-500 mt-1">Lorry Hire Memo: <span className="font-bold text-gray-700">{voucher.voucherNo}</span></p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Freight:</span>
            <span className="font-semibold text-gray-800">₹{Number(voucher.totalAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Advance Paid:</span>
            <span className="font-semibold text-emerald-600">₹{Number(voucher.advanceAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="font-bold text-gray-800">Balance Remaining:</span>
            <span className="font-bold text-orange-600">₹{defaultAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Amount Paying Now (₹)</Label>
          <Input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00" 
            className="h-12 text-lg font-bold"
            autoFocus
          />
          <p className="text-[11px] text-gray-400">By default, the full balance amount is auto-filled.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="h-10 px-4">Cancel</Button>
          <Button onClick={() => onSubmit(amount)} className="bg-brand-primary h-10 px-6 font-bold shadow-sm hover:shadow">Pay & Settle</Button>
        </div>
      </div>
    </div>
  );
}

export default function LorryHireList() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/lorry-hire?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setVouchers(data.lorryHires || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVouchers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page, limit]);

  const handleDelete = async (id: string, voucherNo: string) => {
    if (!confirm(`Are you sure you want to delete this Lorry Hire voucher: ${voucherNo}?`)) return;
    try {
      const res = await fetch(`/api/admin/lorry-hire/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Voucher deleted successfully');
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleOpenPayment = (voucher: any) => {
    setSelectedVoucher(voucher);
    setPayModalOpen(true);
  };

  const handleSettlePayment = async (amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/lorry-hire/${selectedVoucher._id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Payment recorded successfully!');
      setPayModalOpen(false);
      setSelectedVoucher(null);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full pb-8 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Lorry Hire Vouchers</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage truck hire and freight payments</p>
        </div>
        <Link href="/admin/lorry-hire/new">
          <Button className="h-10 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg flex items-center gap-1.5 font-bold shadow-sm px-4">
            <Plus className="w-4 h-4" /> Create Voucher
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by Voucher No..." 
            className="pl-9 h-10 rounded-lg border-gray-200 text-sm focus-visible:ring-brand-primary/50 shadow-sm"
          />
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold">Voucher No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Truck No</th>
                <th className="py-3 px-4 font-semibold">Route</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Advance</th>
                <th className="py-3 px-4 font-semibold">Balance</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading vouchers...</span>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-900">No Vouchers Found</p>
                    <p className="text-sm mt-1 text-gray-500">Create a new lorry hire voucher to get started.</p>
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-md border border-brand-primary/10">
                        {v.voucherNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {new Date(v.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {v.truckNo?.vehicleNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{v.fromBranch?.code || 'N/A'}</span>
                        <span className="text-gray-300">→</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{v.toBranch?.code || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ₹{v.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      ₹{v.advanceAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-orange-600">
                      ₹{v.balanceAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${v.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {v.status || 'pending'}
                      </span>
                    </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status !== 'completed' && (
                            <Button 
                              onClick={() => handleOpenPayment(v)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold" 
                              title="Settle Payment"
                            >
                              Pay Balance
                            </Button>
                          )}
                          <ListActions
                            id={v._id}
                            moduleName="lorry-hire"
                            viewUrl={`/admin/lorry-hire/${v._id}`}
                            editUrl={`/admin/lorry-hire/${v._id}/edit`}
                            printUrl={`/admin/lorry-hire/${v._id}/print`}
                            onDeleted={fetchVouchers}
                          />
                        </div>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 || totalCount > 10 ? (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-white gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                Showing page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                <span className="text-xs text-gray-500 font-medium">Rows:</span>
                <select 
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="h-8 rounded-md border-gray-200 text-xs px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-1.5">
              <Button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                variant="outline" 
                className="h-9 px-3 rounded-lg border-gray-200"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" /> Previous
              </Button>
              <Button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages || totalPages === 0}
                variant="outline" 
                className="h-9 px-3 rounded-lg border-gray-200"
              >
                Next <ChevronRight className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
      
      <PaymentModal 
        isOpen={payModalOpen} 
        onClose={() => { setPayModalOpen(false); setSelectedVoucher(null); }} 
        onSubmit={handleSettlePayment} 
        voucher={selectedVoucher}
      />
    </div>
  );
}
