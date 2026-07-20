'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, CheckCircle, Truck, PackageCheck, Check } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

export default function ReceiveMemoPage() {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/delivery/receive-memo?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=10&_t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setChallans(data.challans || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setSelectedIds([]); // Reset selection on page change
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChallans();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  const executeReceive = async (id: string, challanNumber: string) => {
    try {
      const res = await fetch(`/api/admin/delivery/receive-memo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receive' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Memo ${challanNumber} received successfully!`);
      fetchChallans();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReceive = (id: string, challanNumber: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Receive Memo',
      description: `Are you sure you want to Receive Memo: CH-${challanNumber}? This will mark all its LRs as ready for delivery.`,
      variant: 'success',
      onConfirm: () => executeReceive(id, challanNumber)
    });
  };

  const executeBulkReceive = async () => {
    try {
      const res = await fetch(`/api/admin/delivery/receive-memo/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challanIds: selectedIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message || 'Memos received successfully!');
      fetchChallans();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkReceive = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Receive Memos',
      description: `Are you sure you want to receive ${selectedIds.length} selected memos?`,
      variant: 'success',
      onConfirm: () => executeBulkReceive()
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === challans.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(challans.map(ch => ch._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary flex items-center gap-2">
            <PackageCheck className="w-8 h-8 text-brand-primary" />
            Receive Memo
          </h1>
          <p className="text-brand-text-secondary mt-1">Accept incoming trucks and mark their LRs as ready for delivery.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search Memo No, Truck No, or Driver..."
              className="pl-9 bg-white border-gray-200 focus-visible:ring-brand-primary h-10"
            />
          </div>
          {selectedIds.length > 0 && (
            <Button 
              onClick={handleBulkReceive}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold h-10 px-6 rounded-lg flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
            >
              <CheckCircle className="w-5 h-5" />
              Receive Selected ({selectedIds.length})
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-12 text-center">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 mx-auto rounded flex items-center justify-center cursor-pointer transition-colors border ${challans.length > 0 && selectedIds.length === challans.length ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300 hover:border-brand-primary'}`}
                  >
                    {challans.length > 0 && selectedIds.length === challans.length && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                </th>
                <th className="px-4 py-3">Memo No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Truck Details</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3 text-center">LRs</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading incoming memos...</span>
                    </div>
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-500">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-900">No Incoming Memos</p>
                    <p className="text-sm mt-1">All dispatched trucks have been received.</p>
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch._id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(ch._id) ? 'bg-brand-primary/5' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      <div 
                        onClick={() => toggleSelect(ch._id)}
                        className={`w-5 h-5 mx-auto rounded flex items-center justify-center cursor-pointer transition-colors border ${selectedIds.includes(ch._id) ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300 hover:border-brand-primary'}`}
                      >
                        {selectedIds.includes(ch._id) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-md border border-brand-primary/10">
                        CH-{ch.challanNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(ch.challanDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{ch.truckNo?.vehicleNumber || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{ch.driverName?.name || 'Unknown Driver'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <span className="truncate max-w-[100px]">{ch.branch?.name || 'N/A'}</span>
                        <span className="text-gray-300">→</span>
                        <span className="truncate max-w-[100px] text-brand-primary">{ch.memoDestinationBranch?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full text-xs">
                        {ch.bookings?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        onClick={() => handleReceive(ch._id, ch.challanNumber)}
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white shadow-sm font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Receive
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Pagination */}
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
        confirmText="Confirm Receive"
      />
    </div>
  );
}
