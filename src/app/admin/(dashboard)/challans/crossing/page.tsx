'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Plus, Search,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, XCircle, Loader2, Zap, ExternalLink,
  Truck, X
} from 'lucide-react';
import ListActions from '@/components/admin/ListActions';
import { ThemeSelect } from '@/components/ui/theme-select';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDate } from '@/lib/dateUtils';

export default function CrossingListPage() {
  const router = useRouter();
  
  const [challans, setChallans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingCewbId, setGeneratingCewbId] = useState<string | null>(null);
  const [cewbModalChallan, setCewbModalChallan] = useState<any | null>(null);

  const handleConfirmGenerateCewb = async () => {
    if (!cewbModalChallan) return;
    const challanId = cewbModalChallan._id;
    try {
      setGeneratingCewbId(challanId);
      const res = await fetch(`/api/admin/challans/${challanId}/cewb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate CEWB');
      }
      toast.success(data.message || 'CEWB generated successfully!');
      setCewbModalChallan(null);
      fetchChallans();
    } catch (err: any) {
      toast.error(err.message || 'Error generating CEWB');
    } finally {
      setGeneratingCewbId(null);
    }
  };

  const fetchChallans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/challans?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&date=${encodeURIComponent(dateFilter)}&page=${page}&limit=${limit}&bookingCrossing=Crossing`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setChallans(data.challans || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      toast.error('Could not load crossing challans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, status, dateFilter, page, limit]);

  const handleDelete = async (id: string, challanNumber: string) => {
    if (!confirm(`Are you sure you want to delete Crossing Challan No: ${challanNumber}? This will reset all loaded LRs back to pending.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/challans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Crossing Challan ${challanNumber} deleted successfully.`);
        fetchChallans();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error}`);
      }
    } catch (error) {
      toast.error('Could not delete crossing challan.');
    }
  };

  return (
    <div className="w-full pb-8 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-4 py-2.5 rounded-xl shadow-xs border border-gray-100 gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-gray-800 tracking-tight">Crossing Memos / Challans</h1>
          <p className="text-[11px] text-gray-500">Manage crossing dispatches, agents, and local delivery memos</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/admin/challans/crossing/new" className="w-full sm:w-auto">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-9 px-4 rounded-lg text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all">
              <Plus className="w-4 h-4" />
              Create Crossing Memo
            </Button>
          </Link>
        </div>
      </div>

      {/* Table grid - Slim Filter Header */}
      <Card className="border-none shadow-xs rounded-xl overflow-visible bg-white">
        <div className="border-b border-gray-100 px-4 py-2.5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5">
            <h2 className="text-sm font-bold text-slate-800">Recent Crossing Memos</h2>
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                  placeholder="Search Challan No, Agent..." 
                  className="pl-8 pr-3 h-8 bg-white rounded-[6px] border border-[#64748b59] focus-visible:ring-2 focus-visible:ring-brand-primary/20 text-xs w-full"
                />
              </div>

              <div className="w-full sm:w-36 relative z-10">
                <DatePicker 
                  value={dateFilter} 
                  onChange={(val) => { setDateFilter(val); setPage(1); }} 
                  placeholder="Filter Date"
                  className="!rounded-[6px] !h-8 bg-white !border-[#64748b59] text-xs px-2.5"
                />
              </div>

              <div className="w-full sm:w-32 relative z-20">
                <ThemeSelect
                  name="status"
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Statuses', value: '' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'In Transit', value: 'in_transit' },
                    { label: 'Delivered', value: 'delivered' }
                  ]}
                  placeholder="All Statuses"
                  className="!rounded-[6px] !h-8 bg-white !border-[#64748b59] text-xs px-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 text-slate-700 text-xs border-b border-gray-100 font-semibold">
                  <th className="py-2.5 px-3.5">Challan No</th>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3.5">Agent / Transporter</th>
                  <th className="py-2.5 px-3.5">Destination Branch</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">CEWB (Part-B)</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500 font-medium">Loading crossing memos...</td>
                  </tr>
                ) : challans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500 font-medium">No crossing memos found.</td>
                  </tr>
                ) : (
                  challans.map((ch) => (
                    <tr key={ch._id} className="hover:bg-gray-50/60 transition-colors whitespace-nowrap">
                      <td className="py-2.5 px-3.5 font-bold text-brand-primary uppercase">
                        #{ch.challanNumber}
                      </td>
                      <td className="py-2.5 px-3.5 text-gray-600 font-medium text-xs">
                        {formatDate(ch.challanDate)}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-gray-800 text-xs">
                        {ch.agent || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3.5 text-gray-700 font-bold text-xs">
                        {ch.memoDestinationBranch || 'N/A'}
                        <span className="block text-[11px] text-gray-400 font-normal">To Branch: {ch.lrToBranch || 'All'}</span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase inline-flex items-center gap-1 border
                          ${ch.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                          ${ch.status === 'in_transit' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${ch.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                        `}>
                          {ch.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                          {ch.status === 'in_transit' && <AlertCircle className="w-3 h-3" />}
                          {ch.status === 'pending' && <XCircle className="w-3 h-3" />}
                          {ch.status === 'in_transit' ? 'In Transit' : ch.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        {ch.cewbNo ? (
                          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300/80 rounded-[6px] px-2.5 py-1 shadow-2xs">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-extrabold text-emerald-800 tracking-wider uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                CEWB Active
                              </span>
                              <span className="text-xs font-mono font-extrabold text-slate-950 tracking-normal px-1 py-0.5 bg-white rounded border border-emerald-200/60 shadow-2xs">
                                {ch.cewbNo}
                              </span>
                            </div>
                            <a
                              href={ch.cewbUrl || `https://ewaybillgst.gov.in/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 h-6 px-2 text-[11px] font-bold text-white bg-brand-primary hover:bg-brand-primary-dark rounded inline-flex items-center gap-1 shadow-2xs transition-colors"
                              title="Open CEWB on E-Way Bill Portal"
                            >
                              View <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCewbModalChallan(ch)}
                            disabled={generatingCewbId !== null}
                            className="h-7 text-xs bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-300 font-bold px-2.5 flex items-center gap-1.5 rounded-md shadow-2xs transition-all"
                          >
                            {generatingCewbId === ch._id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-amber-700" /> Generating...
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3 text-amber-600 fill-amber-500" /> Generate CEWB
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <ListActions
                          id={ch._id}
                          moduleName="challans"
                          viewUrl={`/admin/challans/${ch._id}`}
                          viewInNewTab={true}
                          editUrl={`/admin/challans/crossing/${ch._id}/edit`}
                          onDeleted={fetchChallans}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-white">
              <span className="text-xs text-gray-500 font-medium">
                Showing page {page} of {totalPages} ({totalCount} total memos)
              </span>
              <div className="flex gap-1.5">
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  variant="outline" 
                  className="h-9 px-3 rounded-[8px] border border-[#64748b59]"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" /> Previous
                </Button>
                <Button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  variant="outline" 
                  className="h-9 px-3 rounded-[8px] border border-[#64748b59]"
                >
                  Next <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Modal for CEWB Generation */}
          {cewbModalChallan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-amber-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 fill-amber-600 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Generate Consolidated E-Way Bill</h3>
                      <p className="text-[11px] text-slate-500">Government E-Way Bill Portal Integration</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => !generatingCewbId && setCewbModalChallan(null)}
                    disabled={generatingCewbId !== null}
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-3.5">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Are you sure you want to generate Consolidated E-Way Bill (Part-B) for this Crossing Memo?
                  </p>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Memo No:</span>
                      <span className="font-extrabold text-brand-primary uppercase">
                        #{cewbModalChallan.challanNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Assigned Vehicle:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {cewbModalChallan.truckNo?.vehicleNumber || cewbModalChallan.truckNo || 'Not Assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Agent:</span>
                      <span className="font-semibold text-slate-700">
                        {cewbModalChallan.agent || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Loaded Bookings:</span>
                      <span className="font-bold text-slate-800">
                        {cewbModalChallan.bookings?.length || 0} LRs
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/70">
                    ⚠️ <strong>Note:</strong> This will create an official Consolidated E-Way Bill with the assigned vehicle number on the NIC e-Way Bill portal.
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCewbModalChallan(null)}
                    disabled={generatingCewbId !== null}
                    className="h-9 px-4 rounded-[8px] text-xs font-semibold text-slate-600 border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmGenerateCewb}
                    disabled={generatingCewbId !== null}
                    className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-[8px] shadow-sm flex items-center gap-1.5"
                  >
                    {generatingCewbId === cewbModalChallan._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" /> Confirm & Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


