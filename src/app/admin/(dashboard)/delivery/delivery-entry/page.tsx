'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Handshake, Info, CreditCard, PackageCheck, CheckCircle, MessageCircle } from 'lucide-react';
import { getWhatsAppShareLink } from '@/lib/whatsappShare';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { formatDate } from '@/lib/dateUtils';
import { useUserStore } from '@/store/useUserStore';

export default function DeliveryEntryPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'pending' | 'delivered'>('pending');

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
      const statusParam = activeTab === 'pending' ? 'out_for_delivery' : 'delivered';
      const res = await fetch(`/api/admin/delivery/delivery-entry?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=10&status=${statusParam}&_t=${Date.now()}`);
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
  }, [searchTerm, page, activeTab]);

  const executeDeliver = async (id: string, lrNumber: string) => {
    try {
      const res = await fetch(`/api/admin/delivery/delivery-entry/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deliver' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`LR #${lrNumber} delivered successfully!`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeliver = (id: string, lrNumber: string, paymentCondition: string, amountToCollect: number) => {
    let description = `Are you sure you want to mark LR #${lrNumber} as Delivered?`;
    let variant: 'primary' | 'success' | 'danger' = 'primary';
    
    if (paymentCondition === 'to_pay') {
      const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amountToCollect || 0);
      description = `This is a "To Pay" booking. Please ensure you have collected ${formattedAmount} before marking as Delivered.`;
      variant = 'danger';
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Delivery',
      description,
      variant,
      onConfirm: () => executeDeliver(id, lrNumber)
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary flex items-center gap-2">
            <PackageCheck className="w-8 h-8 text-brand-primary" />
            Delivery Entry
          </h1>
          <p className="text-brand-text-secondary mt-1">Manage parcels ready for delivery and view delivery history.</p>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setBookings([]); setActiveTab('pending'); setPage(1); }}
          className={`cursor-pointer px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'pending' 
              ? 'bg-white text-brand-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Deliveries
        </button>
        <button
          onClick={() => { setBookings([]); setActiveTab('delivered'); setPage(1); }}
          className={`cursor-pointer px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'delivered' 
              ? 'bg-white text-brand-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Delivered History
        </button>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search LR No, Consignee Name, or Phone..."
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
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Amount</th>
                {activeTab === 'delivered' && (
                  <th className="px-4 py-3">Delivered On</th>
                )}
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'delivered' ? 6 : 5} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'delivered' ? 6 : 5} className="p-16 text-center text-gray-500">
                    <PackageCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-900">
                      {activeTab === 'pending' ? 'No Pending Deliveries' : 'No Delivery History'}
                    </p>
                    <p className="text-sm mt-1">
                      {activeTab === 'pending' ? 'All received parcels have been delivered.' : 'No parcels have been delivered yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                bookings.map((bk) => {
                  const isToPay = bk.paymentCondition === 'to_pay';
                  return (
                    <tr key={bk._id} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="px-4 py-3">
                        <span className="font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-md border border-brand-primary/10">
                          #{bk.lrNumber}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(bk.bookingDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{bk.consignee?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Info className="w-3 h-3" /> {bk.consignee?.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {bk.originBranch?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                          isToPay ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          <CreditCard className="w-3.5 h-3.5" />
                          {isToPay ? 'TO PAY' : bk.paymentCondition?.toUpperCase()}
                        </div>
                        {isToPay && (
                          <div className="mt-1 font-semibold text-gray-800 tracking-tight">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bk.charges?.totalAmount || 0)}
                          </div>
                        )}
                      </td>
                      {activeTab === 'delivered' && (
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          {formatDate(bk.deliveryDate)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        {activeTab === 'pending' ? (
                          <Button 
                            onClick={() => handleDeliver(bk._id, bk.lrNumber, bk.paymentCondition, bk.charges?.totalAmount)}
                            className="bg-brand-primary hover:bg-brand-primary-dark text-white shadow-sm font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <Handshake className="w-4 h-4" />
                            Deliver Goods
                          </Button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {bk.consignee?.phone && bk.consignee.phone !== '0000000000' && bk.consignee.phone.length >= 10 && (
                              <a 
                                href={(() => {
                                  const logisticNameStr = user?.logisticName || 'Trust Logistic';
                                  return getWhatsAppShareLink(
                                    bk.consignee.phone, 
                                    `Hello ${bk.consignee?.name || 'Customer'},\nYour goods for LR No: ${bk.lrNumber} have been successfully delivered by ${logisticNameStr}. Thank you for using our services!`
                                  );
                                })()}
                                target="whatsapp_share_tab"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                                title="Share status on WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100">
                              <CheckCircle className="w-4 h-4" />
                              Delivered
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
        confirmText="Confirm Delivery"
      />
    </div>
  );
}
