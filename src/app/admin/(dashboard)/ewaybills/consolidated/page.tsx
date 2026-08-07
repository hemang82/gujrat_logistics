'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileOutput, Plus, Loader2, Trash2, Eye, CalendarClock, Printer, Search, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { SearchSelect } from '@/components/ui/search-select';
import { useUserStore } from '@/store/useUserStore';
import { formatDate } from '@/lib/dateUtils';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';

export default function CEWBListPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  
  // Autocomplete states
  const [branchSearch, setBranchSearch] = useState('');
  const [branchSuggestions, setBranchSuggestions] = useState<any[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchHighlightIndex, setBranchHighlightIndex] = useState(-1);

  const { user } = useUserStore();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'logistic';
  const canEdit = user?.role !== 'logistic';

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedCEWB, setSelectedCEWB] = useState<any>(null);
  const [newValidUpto, setNewValidUpto] = useState('');
  const [extendReason, setExtendReason] = useState('');
  const [isExtending, setIsExtending] = useState(false);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (dateFilter) {
        params.append('startDate', dateFilter);
        params.append('endDate', dateFilter);
      }
      if (selectedBranch) params.append('branchId', selectedBranch);

      const res = await fetch(`/api/admin/ewaybills/consolidate?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBills(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch CEWBs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/admin/branches?limit=100');
      const data = await res.json();
      if (res.ok) {
        setBranches(data.branches || []);
        setBranchSuggestions(data.branches || []);
      }
    } catch (err) {
      console.error('Failed to fetch branches');
    }
  };

  useEffect(() => {
    if (isAdmin) fetchBranches();
  }, [isAdmin]);

  const handleBranchSearchChange = (value: string) => {
    setBranchSearch(value);
    if (!value) {
      setSelectedBranch('');
      setBranchSuggestions(branches);
    } else {
      const filtered = branches.filter(b => 
        b.name.toLowerCase().includes(value.toLowerCase()) || 
        b.code.toLowerCase().includes(value.toLowerCase())
      );
      setBranchSuggestions(filtered);
    }
  };

  const handleBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = branchSuggestions[0];
      if (firstMatch && branchSearch) {
        if (firstMatch.name.toLowerCase().startsWith(branchSearch.toLowerCase())) {
          e.preventDefault();
          setSelectedBranch(firstMatch._id);
          setBranchSearch(`${firstMatch.name} (${firstMatch.code})`);
          setShowBranchDropdown(false);
          setBranchHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showBranchDropdown || branchSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev < branchSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev > 0 ? prev - 1 : branchSuggestions.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (branchHighlightIndex >= 0 && branchHighlightIndex < branchSuggestions.length) {
        const selected = branchSuggestions[branchHighlightIndex];
        setSelectedBranch(selected._id);
        setBranchSearch(`${selected.name} (${selected.code})`);
        setShowBranchDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowBranchDropdown(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [searchQuery, dateFilter, selectedBranch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Master EWB?')) return;
    try {
      const res = await fetch(`/api/admin/ewaybills/consolidate/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted successfully');
      fetchBills();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleExtend = async () => {
    if (!selectedCEWB || !newValidUpto) return toast.error('Please select a new validity date');
    try {
      setIsExtending(true);
      const res = await fetch(`/api/admin/ewaybills/consolidate/${selectedCEWB._id}/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newValidUpto, reason: extendReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('CEWB validity extended successfully');
      setExtendModalOpen(false);
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || 'Failed to extend CEWB');
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consolidated E-Way Bills (CEWB)</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and generate consolidated e-way bills for multiple parcels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {canEdit && (
            <Link href="/admin/ewaybills/consolidated/new" className="w-full sm:w-auto">
              <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full sm:w-auto px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Generate New CEWB
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-xl bg-white overflow-visible">
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Recent CEWBs</h2>
              <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
                Manage your Consolidated E-Way Bills (CEWB) seamlessly. Generate a single master e-way bill for multiple consignments traveling in the same vehicle, extend document validities, and print government-approved PDFs directly from this portal.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100 w-full lg:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search CEWB No or Vehicle..." 
                className="pl-9 h-11 border-white bg-white shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-brand-primary w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[150px]">
              <DatePicker 
                className="h-11 border-white bg-white shadow-sm rounded-xl w-full" 
                placeholder="Filter Date"
                value={dateFilter}
                onChange={(date) => setDateFilter(date)}
              />
            </div>
            {isAdmin && (
              <div className="w-full md:w-[180px] relative z-[60]">
                <BranchAutocomplete
                  name="branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  options={[
                    { label: 'All Branches', value: '' },
                    ...branches.map(b => ({ label: b.name, value: b._id }))
                  ]}
                  placeholder="All Branches"
                  className="!rounded-xl h-11 shadow-sm"
                />
              </div>
            )}
            
            {(searchQuery || dateFilter || selectedBranch) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('');
                  setSelectedBranch('');
                  setBranchSearch('');
                }}
                className="h-11 text-gray-500 hover:bg-gray-200 rounded-xl w-full md:w-auto px-4"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="hidden lg:table-header-group bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
                <tr className="text-xs uppercase tracking-wider text-gray-600 font-semibold">
                  <th className="px-6 py-4">SR NO</th>
                  <th className="px-6 py-4">CEWB NO</th>
                  <th className="px-6 py-4">FROM</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">VEHICLE NO</th>
                  <th className="px-6 py-4">VALID UPTO</th>
                  <th className="px-6 py-4">TOTAL EWBS</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="flex flex-col lg:table-row-group divide-y lg:divide-y-0 divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                      Loading master bills...
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <FileOutput className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No Consolidated E-Way Bills found.</p>
                      {canEdit && (
                        <Link href="/admin/ewaybills/consolidated/new">
                          <Button variant="link" className="text-brand-primary mt-2">Generate your first CEWB</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  bills.map((bill, index) => (
                    <tr key={bill._id} className="flex flex-col lg:table-row hover:bg-gray-50 transition-colors py-2 lg:py-0 border-b lg:border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0 text-gray-600 font-medium">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">SR NO</span>
                        <span className="text-right lg:text-left">{index + 1}</span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">CEWB NO</span>
                        <span className="font-mono font-medium text-brand-primary text-right lg:text-left">{bill.cEwbNo}</span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0 text-gray-600">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">FROM</span>
                        <span className="text-right lg:text-left font-medium">{bill.branch?.name ? `${bill.branch.name} (${bill.branch.code})` : '-'}</span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0 text-gray-600">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">DATE</span>
                        <span className="text-right lg:text-left">{bill.cEwbDate || formatDate(bill.createdAt)}</span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">VEHICLE NO</span>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 font-semibold text-xs uppercase tracking-wider text-right lg:text-left">
                          {bill.vehicleNo}
                        </span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">VALID UPTO</span>
                        <div className="flex items-center gap-2 justify-end lg:justify-start">
                          <span className="text-gray-600 text-right lg:text-left">
                            {formatDate(bill.validUpto)}
                          </span>
                          {bill.validUpto && (() => {
                            const validUpto = new Date(bill.validUpto);
                            validUpto.setHours(0,0,0,0);
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const diffDays = Math.ceil((validUpto.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            
                            if (diffDays < 0) {
                              return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Expired</span>;
                            } else if (diffDays === 0) {
                              return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">Expires Today</span>;
                            } else {
                              return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">{diffDays} Days Left</span>;
                            }
                          })()}
                        </div>
                      </td>

                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0 text-gray-600">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">TOTAL EWBS</span>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs shrink-0">
                          {bill.ewbNoDetails?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">STATUS</span>
                        <div className="flex justify-end lg:justify-start">
                          {bill.status === 'Active' ? (
                            <span className="inline-flex w-max items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex w-max items-center px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-700 text-[11px] font-semibold uppercase">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">ACTIONS</span>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/ewaybills/consolidated/${bill._id}`}>
                            <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          
                          {bill.printUrl ? (
                            <button 
                              className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                              onClick={() => window.open(`/api/proxy-pdf?url=https://${bill.printUrl}`, '_blank')}
                              title="Print CEWB"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          ) : (
                            <Link href={`/admin/ewaybills/consolidated/${bill._id}?print=true`}>
                              <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer" title="Print CEWB">
                                <Printer className="w-4 h-4" />
                              </button>
                            </Link>
                          )}

                          {canEdit && (
                            <button 
                              className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedCEWB(bill);
                                setNewValidUpto('');
                                setExtendReason('');
                                setExtendModalOpen(true);
                              }}
                              title="Extend CEWB"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}


                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Extend Modal */}
      <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Extend CEWB Validity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">CEWB NO</Label>
              <p className="font-mono font-medium text-lg text-brand-primary">{selectedCEWB?.cEwbNo}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">New Validity Date</Label>
              <DatePicker 
                className="h-10 w-full" 
                value={newValidUpto}
                onChange={(date: string) => setNewValidUpto(date)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reason for Extension</Label>
              <Input 
                placeholder="e.g. Vehicle Breakdown" 
                className="h-10"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExtend} disabled={isExtending || !newValidUpto}>
              {isExtending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Extend CEWB
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
