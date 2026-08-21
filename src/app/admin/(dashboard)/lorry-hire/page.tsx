'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ListActions from '@/components/admin/ListActions';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeSelect } from '@/components/ui/theme-select';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/store/useUserStore';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';
import { DatePicker } from '@/components/ui/date-picker';
import ExportLorryHire from '@/components/admin/ExportLorryHire';
import { formatDate } from '@/lib/dateUtils';
import { Loader2, Zap, X } from 'lucide-react';

function CewbModal({ isOpen, onClose, voucher }: any) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  if (!isOpen || !voucher) return null;

  const generateCewb = async (challanId: string) => {
    try {
      if (challanId === 'ALL') {
        setGeneratingId('ALL');
      } else {
        setGeneratingId(challanId);
      }
      
      const res = await fetch('/api/admin/lorry-hire/cewb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challanId, lorryHireId: voucher._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate CEWB');
      
      toast.success(data.message || 'CEWB Generated successfully');
      
      // Refresh the voucher's challan list locally to update the UI
      if (challanId === 'ALL' && data.results) {
        data.results.forEach((resItem: any) => {
          const cIndex = voucher.challans.findIndex((c: any) => c._id === resItem.challanId);
          if (cIndex !== -1) {
            voucher.challans[cIndex].cewbNo = resItem.cewbNo;
            voucher.challans[cIndex].cewbUrl = resItem.cewbUrl;
          }
        });
      } else {
        const challanIndex = voucher.challans.findIndex((c: any) => c._id === challanId);
        if (challanIndex !== -1) {
          voucher.challans[challanIndex].cewbNo = data.cewbNo;
          voucher.challans[challanIndex].cewbUrl = data.cewbUrl;
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate CEWB');
    } finally {
      setGeneratingId(null);
    }
  };

  const pendingChallansCount = voucher?.challans?.filter((c: any) => !c.cewbNo).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Generate Consolidated E-Way Bill
            </h3>
            <p className="text-sm text-gray-500 mt-1">Lorry Hire Memo: <span className="font-semibold text-gray-700">{voucher.voucherNo}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {(!voucher.challans || voucher.challans.length === 0) ? (
            <div className="text-center p-4 text-sm text-gray-500 bg-gray-50 rounded-lg">No Challans attached to this Lorry Hire.</div>
          ) : (
            <div className="space-y-3">
              {pendingChallansCount > 1 && voucher.hasEwbAccess !== false && (
                <div className="flex justify-end mb-2">
                  <Button 
                    onClick={() => generateCewb('ALL')} 
                    disabled={generatingId !== null}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 shadow-sm px-4"
                  >
                    {generatingId === 'ALL' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    {generatingId === 'ALL' ? 'Generating All...' : `Generate ALL (${pendingChallansCount})`}
                  </Button>
                </div>
              )}
              {voucher.challans.map((challan: any) => (
                <div key={challan._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 border border-gray-100 rounded-lg gap-3">
                  <div>
                    <div className="font-bold text-gray-800">{challan.challanNumber}</div>
                    <div className="text-xs text-gray-500">{challan.memoDestinationBranch?.name || 'Unknown Dest'}</div>
                  </div>
                  <div>
                    {challan.cewbNo ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mb-1">CEWB GENERATED</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">{challan.cewbNo}</span>
                          {(challan.cewbUrl || challan.cewbNo) && (
                             <a 
                               href={challan.cewbUrl || `https://ewaybillgst.gov.in/`} 
                               target="_blank" 
                               rel="noreferrer"
                               className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors font-semibold"
                             >
                               View
                             </a>
                          )}
                        </div>
                      </div>
                    ) : voucher.hasEwbAccess === false ? (
                      <a 
                        href="https://ewaybillgst.gov.in/" 
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs font-bold px-3 shadow-sm rounded-md"
                      >
                        Govt Portal
                      </a>
                    ) : (
                      <Button 
                        onClick={() => generateCewb(challan._id)}
                        disabled={generatingId !== null}
                        className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs font-bold px-3 shadow-sm"
                      >
                        {generatingId === challan._id ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                        Generate CEWB
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const user = useUserStore((state) => state.user);
  
  const canView = user?.role === 'superadmin' || user?.permissions?.challans?.canView !== false;
  const canCreate = user?.role !== 'superadmin' && user?.role !== 'logistic' && user?.permissions?.challans?.canAdd !== false;
  const canEdit = user?.role === 'superadmin' || user?.permissions?.challans?.canEdit !== false;
  const canDelete = user?.role === 'superadmin' || user?.permissions?.challans?.canDelete !== false;
  const isLogisticAdmin = user?.role === 'superadmin' || user?.role === 'logistic';

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [branches, setBranches] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [cewbModalOpen, setCewbModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const handleOpenCewb = (voucher: any) => {
    setSelectedVoucher(voucher);
    setCewbModalOpen(true);
  };

  const handleOpenPayment = (voucher: any) => {
    setSelectedVoucher(voucher);
    setPayModalOpen(true);
  };

  // Fetch branches for logistic admin filter
  useEffect(() => {
    if (user && (user.role === 'logistic' || user.role === 'superadmin')) {
      fetch('/api/admin/branches?limit=1000')
        .then(res => res.json())
        .then(data => setBranches(data.branches || []))
        .catch(err => console.error('Failed to fetch branches', err));
    }
  }, [user]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/lorry-hire?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter)}&date=${encodeURIComponent(dateFilter)}&branch=${encodeURIComponent(branchFilter)}&page=${page}&limit=${limit}`);
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
  }, [searchTerm, statusFilter, dateFilter, page, limit]);

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
      <PaymentModal 
        isOpen={payModalOpen} 
        onClose={() => { setPayModalOpen(false); setSelectedVoucher(null); }} 
        onSubmit={handleSettlePayment}
        voucher={selectedVoucher}
      />
      <CewbModal 
        isOpen={cewbModalOpen}
        onClose={() => { setCewbModalOpen(false); setSelectedVoucher(null); }}
        voucher={selectedVoucher}
      />
      
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Lorry Hire Vouchers</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage truck hire and freight payments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <ExportLorryHire search={searchTerm} status={statusFilter} date={dateFilter} />
          {canCreate && (
            <Link href="/admin/lorry-hire/new" className="w-full sm:w-auto">
              <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full sm:w-auto px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Create Voucher
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4 bg-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-xl font-bold text-brand-text-primary">Recent Vouchers</h2>
            
            <div className="flex flex-col md:flex-row gap-3 items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100 w-full lg:w-auto">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search Voucher No..." 
                  className="pl-9 pr-9 h-10 bg-white rounded-lg border-gray-200 focus-visible:ring-1 focus-visible:ring-brand-primary/50 text-sm w-full"
                />
              </div>
              {isLogisticAdmin && (
                <div className="w-full md:w-44 relative z-10">
                  <BranchAutocomplete
                    name="branch"
                    value={branchFilter}
                    onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                    options={[
                      { label: 'All Branches', value: '' },
                      ...branches.map(b => ({ label: b.name, value: b._id }))
                    ]}
                    placeholder="All Branches"
                    className="!rounded-lg !h-10 bg-white !border-gray-200"
                  />
                </div>
              )}
              <div className="w-full md:w-44 relative z-20">
                <DatePicker 
                  value={dateFilter} 
                  onChange={(val) => { setDateFilter(val); setPage(1); }} 
                  placeholder="Filter Date"
                  className="!rounded-lg !h-10 bg-white !border-gray-200"
                />
              </div>
              <div className="w-full md:w-44 relative z-30">
                <ThemeSelect
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Statuses', value: '' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Completed', value: 'completed' }
                  ]}
                  placeholder="All Statuses"
                  className="!rounded-lg !h-10 bg-white !border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold w-20 text-center">Sr. No.</th>
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
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading vouchers...</span>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-16 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-900">No Vouchers Found</p>
                    <p className="text-sm mt-1 text-gray-500">Create a new lorry hire voucher to get started.</p>
                  </td>
                </tr>
              ) : (
                vouchers.map((v: any, index: number) => (
                  <tr key={v._id} className="hover:bg-brand-primary/5 transition-colors group">
                    <td className="p-4 text-center font-bold text-gray-500">{(page - 1) * limit + index + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-md border border-brand-primary/10">
                        {v.voucherNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {formatDate(v.date)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {v.truckNo?.vehicleNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold whitespace-normal">{v.fromBranch?.name || 'N/A'}</span>
                        <span className="text-gray-300">→</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold whitespace-normal">
                          {(() => {
                            if (v.challans && v.challans.length > 0) {
                              const dests = v.challans.map((c: any) => c.memoDestinationBranch?.name).filter(Boolean);
                              const uniqueDests = Array.from(new Set(dests));
                              if (uniqueDests.length > 0) return uniqueDests.join(', ');
                            }
                            return v.toBranch?.name || 'N/A';
                          })()}
                        </span>
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
                          {user?.ewbApiAccess ? (
                            <Button 
                              onClick={() => handleOpenCewb(v)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 text-xs font-bold flex items-center gap-1"
                              title="Generate Consolidated E-Way Bill"
                            >
                              <Zap className="w-3.5 h-3.5" /> CEWB
                            </Button>
                          ) : (
                            <a href="https://ewaybillgst.gov.in/" target="_blank" rel="noopener noreferrer">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 text-xs font-bold flex items-center gap-1"
                                title="Go to E-Way Bill Portal"
                              >
                                <Zap className="w-3.5 h-3.5" /> CEWB
                              </Button>
                            </a>
                          )}
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
                            hideEdit={!canEdit}
                            hideDelete={!canDelete}
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
      
    </div>
  );
}
