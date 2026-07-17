'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Handshake, Info, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

export default function CashCollectionPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'primary' | 'success' | 'danger';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/delivery/cash-collection?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=10&_t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setBookings(data.bookings || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  const executeCollectCash = async (id: string, lrNumber: string) => {
    try {
      const res = await fetch(`/api/admin/delivery/cash-collection/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'collect_cash' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Cash collected for LR #${lrNumber}!`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCollectCash = (id: string, lrNumber: string, amount: number) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    setConfirmDialog({
      isOpen: true,
      title: 'Collect Cash',
      description: `Confirm collecting ${formattedAmount} for LR #${lrNumber}?`,
      variant: 'success',
      onConfirm: () => executeCollectCash(id, lrNumber)
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary flex items-center gap-2">
            <Banknote className="w-8 h-8 text-orange-600" />
            Cash Collection
          </h1>
          <p className="text-brand-text-secondary mt-1">Collect cash for 'To Pay' LRs that have been delivered.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search LR No, Consignee Name..."
              className="pl-9 bg-white border-gray-200 focus-visible:ring-brand-primary h-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">LR Details</th>
                <th className="px-4 py-3">Consignee</th>
                <th className="px-4 py-3">Delivery Date</th>
                <th className="px-4 py-3">Pending Amount</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading pending collections...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-900">No Pending Collections</p>
                    <p className="text-sm mt-1">All 'To Pay' deliveries have been settled.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((bk) => (
                  <tr key={bk._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-md border border-brand-primary/10">
                        #{bk.lrNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{bk.consignee?.name || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {bk.deliveryDate ? new Date(bk.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-lg text-orange-600 bg-orange-50 px-3 py-1 rounded-lg inline-block border border-orange-100 tracking-tight">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bk.charges?.totalAmount || 0)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        onClick={() => handleCollectCash(bk._id, bk.lrNumber, bk.charges?.totalAmount)}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Banknote className="w-4 h-4" />
                        Collect Cash
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm">Prev</Button>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline" size="sm">Next</Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText="Collect Cash"
      />
    </div>
  );
}
