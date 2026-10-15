'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import { 
  Search, 
  Printer, 
  Download, 
  RefreshCw, 
  Truck, 
  Package, 
  Scale, 
  IndianRupee, 
  FileText, 
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/dateUtils';
import Link from 'next/link';

export default function MemoReportPage() {
  const { user } = useUserStore();
  const role = user?.role;
  const isBranchUser = role === 'branch_user' || role === 'branch';

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalChallans: 0,
    totalLrsCount: 0,
    totalPkgs: 0,
    totalWeight: 0,
    totalLrRevenue: 0,
    totalTruckFreight: 0,
    totalAdvance: 0,
    totalBalancePayable: 0
  });

  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch || '') : 'all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    if (!isBranchUser) {
      fetch('/api/admin/branches?limit=1000')
        .then(res => res.json())
        .then(d => setBranches(d.branches || d || []))
        .catch(() => {});
    }
  }, [isBranchUser]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (branch && branch !== 'all') params.set('branch', branch);
      if (status && status !== 'all') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/reports/memo?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch memo report');

      setData(json.records || []);
      setKpis(json.kpis || {});
    } catch (err: any) {
      toast.error(err.message || 'Error loading memo report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, branch, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        'Memo No', 'Date', 'From Branch', 'To Destination', 'Truck No', 
        'Driver Name', 'Loaded LRs', 'Total Pkgs', 'Weight (kg)', 
        'LR Total (₹)', 'Truck Freight (₹)', 'Advance (₹)', 'Balance (₹)', 'Status'
      ];
      const rows = data.map(r => [
        `CH-${r.challanNumber}`,
        formatDate(r.challanDate),
        r.fromBranch,
        r.toBranch,
        r.truckNo,
        r.driverName,
        r.totalLrs,
        r.totalPkgs,
        r.totalWeight,
        r.lrRevenue,
        r.truckFreight,
        r.advanceAmount,
        r.balancePayable,
        r.status.toUpperCase()
      ]);

      await exportToStyledExcel('Memo_Challan_Report', headers, rows);
      toast.success('Excel exported successfully');
    } catch (err: any) {
      toast.error('Excel export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        'Memo No', 'Date', 'Route', 'Truck No', 'Driver', 
        'LRs', 'Weight', 'LR Total (₹)', 'Freight (₹)', 'Status'
      ];
      const rows = data.map(r => [
        `CH-${r.challanNumber}`,
        formatDate(r.challanDate),
        `${r.fromBranchCode || r.fromBranch} -> ${r.toBranchCode || r.toBranch}`,
        r.truckNo,
        r.driverName.substring(0, 12),
        r.totalLrs,
        `${r.totalWeight} kg`,
        `₹${r.lrRevenue}`,
        `₹${r.truckFreight}`,
        r.status.toUpperCase()
      ]);

      exportToStyledPDF(
        `Lorry Challan / Memo Dispatch Report (${startDate} to ${endDate})`,
        'Memo_Challan_Report',
        headers,
        rows,
        { fontSize: 7.5 }
      );
      toast.success('PDF generated successfully');
    } catch (err: any) {
      toast.error('PDF export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full pb-8 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-4 py-2.5 rounded-xl shadow-xs border border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-primary rounded-full inline-block"></span>
            <h1 className="text-base sm:text-lg font-extrabold text-gray-800 tracking-tight">
              Memo & Challan Dispatch Register
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Truck loading sheets, branch dispatch memos, and trip cargo consolidation ledger
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
            variant="outline"
            className="h-9 w-full sm:w-auto px-3.5 rounded-lg text-xs font-semibold shadow-2xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            PDF
          </Button>

          <Button
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            variant="outline"
            className="h-9 w-full sm:w-auto px-3.5 rounded-lg text-xs font-semibold shadow-2xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Excel
          </Button>

          <Button
            onClick={fetchReport}
            disabled={isLoading}
            variant="outline"
            className="h-9 w-9 p-0 rounded-lg text-gray-600 hover:text-brand-primary border-gray-200 shadow-2xs shrink-0 flex items-center justify-center"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Memos</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {kpis.totalChallans || 0}
              <span className="text-xs font-medium text-gray-400 ml-1 font-sans">
                ({kpis.totalLrsCount || 0} LRs)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dispatched Weight</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {(kpis.totalWeight || 0).toLocaleString('en-IN')} <span className="text-xs font-semibold text-gray-400">kg</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">LR Total Value</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">
              ₹{(kpis.totalLrRevenue || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Truck Freight Cost</p>
            <p className="text-lg font-black text-amber-800 leading-tight">
              ₹{(kpis.totalTruckFreight || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-xs rounded-xl bg-white overflow-visible">
        <div className="border-b border-gray-100 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Header Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Challan & Memo Filters
                </h2>
                <p className="text-[11px] text-gray-500">
                  {data.length} {data.length === 1 ? 'trip memo' : 'trip memos'} found
                </p>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="w-full sm:w-40 relative z-20">
                <DatePicker
                  value={startDate}
                  onChange={(val) => setStartDate(val || '')}
                  placeholder="From Date"
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs"
                />
              </div>

              <div className="w-full sm:w-40 relative z-20">
                <DatePicker
                  value={endDate}
                  onChange={(val) => setEndDate(val || '')}
                  placeholder="To Date"
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs"
                />
              </div>

              {!isBranchUser && (
                <div className="w-full sm:w-48 relative z-[60]">
                  <BranchAutocomplete
                    name="branch"
                    value={branch === 'all' ? '' : branch}
                    onChange={(e) => setBranch(e.target.value || 'all')}
                    options={[
                      { label: 'All Branches', value: '' },
                      ...branches.map(b => ({ label: `${b.name} (${b.code || ''})`, value: b._id }))
                    ]}
                    placeholder="All Branches"
                    className="!rounded-lg !h-9 text-xs shadow-2xs border-gray-200"
                  />
                </div>
              )}

              <div className="w-full sm:w-40 relative z-20">
                <ThemeSelect
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'In Transit', value: 'in_transit' },
                    { label: 'Delivered', value: 'delivered' }
                  ]}
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs w-full"
                  contentClassName="min-w-[180px]"
                />
              </div>

              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Challan No (e.g. 1001)..."
                  className="pl-8.5 pr-8 h-9 bg-white rounded-lg border border-gray-200 focus-visible:ring-2 focus-visible:ring-brand-primary/20 text-xs w-full shadow-2xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Filter
              </Button>

              {(branch !== (isBranchUser ? (user?.branch || '') : 'all') || status !== 'all' || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setBranch(isBranchUser ? (user?.branch || '') : 'all');
                    setStatus('all');
                    setSearch('');
                  }}
                  className="h-9 px-2.5 text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Reset filters"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/90 whitespace-nowrap uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200/90">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Memo No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Route (From ➔ To)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Truck No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Driver</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">LRs</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Pkgs</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Weight (kg)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90 font-bold text-slate-800">LR Total (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90 font-bold text-amber-800">Truck Freight (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Loading Memo Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <FileText className="w-9 h-9 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">No Challans Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((r, idx) => (
                    <tr key={r._id} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                      <td className="py-2 px-3 text-center text-gray-400 font-medium border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-brand-primary border-r border-slate-100">
                        <Link href={`/admin/challans/${r._id}`} className="hover:underline">
                          CH-{r.challanNumber}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-gray-600 border-r border-slate-100">
                        {formatDate(r.challanDate)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 border-r border-slate-100">
                        <span>{r.fromBranchCode || r.fromBranch}</span>
                        <span className="text-gray-400 mx-1.5">➔</span>
                        <span>{r.toBranchCode || r.toBranch}</span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        {r.truckNo}
                      </td>
                      <td className="py-2 px-3 text-gray-700 border-r border-slate-100">
                        {r.driverName}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-brand-primary border-r border-slate-100">
                        {r.totalLrs}
                      </td>
                      <td className="py-2 px-3 text-center font-medium text-slate-700 border-r border-slate-100">
                        {r.totalPkgs}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 border-r border-slate-100">
                        {r.totalWeight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 border-r border-slate-100">
                        ₹{r.lrRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-800 border-r border-slate-100">
                        ₹{r.truckFreight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'delivered' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : r.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase tracking-wider border-r border-slate-200 text-xs">
                      Grand Totals ({data.length} Memos):
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-black text-brand-primary">
                      {kpis.totalLrsCount}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-black text-brand-primary">
                      {kpis.totalPkgs}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-brand-primary">
                      {(kpis.totalWeight || 0).toLocaleString('en-IN')} kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-800 border-r border-slate-200">
                      ₹{(kpis.totalLrRevenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-800 border-r border-slate-200">
                      ₹{(kpis.totalTruckFreight || 0).toLocaleString('en-IN')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
