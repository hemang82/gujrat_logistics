'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileOutput, Plus, Loader2, Trash2, Eye, CalendarClock, Printer, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';

export default function CEWBListPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

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

  useEffect(() => {
    fetchBills();
  }, [searchQuery, startDate, endDate]);

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
          <p className="text-sm text-gray-500 mt-1">Manage and generate master e-way bills for multiple parcels.</p>
        </div>
        <Link href="/admin/ewaybills/consolidated/new">
          <Button className="flex items-center gap-2 h-10 px-6">
            <Plus className="w-4 h-4" />
            Generate New CEWB
          </Button>
        </Link>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1 w-full xl:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search CEWB No or Vehicle..." 
                className="pl-9 h-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full xl:w-auto">
              <div className="w-full sm:w-auto">
                <DatePicker 
                  className="h-10 w-full sm:w-40" 
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              <span className="text-gray-400 hidden sm:inline-block">to</span>
              <div className="w-full sm:w-auto">
                <DatePicker 
                  className="h-10 w-full sm:w-40" 
                  placeholder="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                />
              </div>
              {(searchQuery || startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchQuery('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="h-10 text-gray-500 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="hidden lg:table-header-group bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
                <tr className="text-xs uppercase tracking-wider text-gray-600 font-semibold">
                  <th className="px-6 py-4">CEWB NO</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">VEHICLE NO</th>
                  <th className="px-6 py-4">VALID UPTO</th>
                  <th className="px-6 py-4">FROM</th>
                  <th className="px-6 py-4">TOTAL EWBS</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="flex flex-col lg:table-row-group divide-y lg:divide-y-0 divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                      Loading master bills...
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FileOutput className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No Consolidated E-Way Bills found.</p>
                      <Link href="/admin/ewaybills/consolidated/new">
                        <Button variant="link" className="text-brand-primary mt-2">Generate your first CEWB</Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill._id} className="flex flex-col lg:table-row hover:bg-gray-50 transition-colors py-2 lg:py-0 border-b lg:border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">CEWB NO</span>
                        <span className="font-mono font-medium text-brand-primary text-right lg:text-left">{bill.cEwbNo}</span>
                      </td>
                      <td className="px-6 py-3 lg:py-4 flex justify-between items-center lg:table-cell border-b border-dashed border-gray-100 lg:border-0 text-gray-600">
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">DATE</span>
                        <span className="text-right lg:text-left">{bill.cEwbDate || new Date(bill.createdAt).toLocaleDateString()}</span>
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
                            {bill.validUpto ? new Date(bill.validUpto).toLocaleDateString() : '-'}
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
                        <span className="lg:hidden font-semibold text-xs uppercase text-gray-500 mr-4 shrink-0">FROM</span>
                        <span className="text-right lg:text-left">{bill.fromPlace ? `${bill.fromPlace} (${bill.fromState})` : '-'}</span>
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
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2 sm:px-3"
                            onClick={() => {
                              setSelectedCEWB(bill);
                              setNewValidUpto('');
                              setExtendReason('');
                              setExtendModalOpen(true);
                            }}
                          >
                            <CalendarClock className="w-4 h-4 mr-1 hidden sm:inline-block" /> Extend
                          </Button>
                          <Link href={`/admin/ewaybills/consolidated/${bill._id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/ewaybills/consolidated/${bill._id}?print=true`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(bill._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
