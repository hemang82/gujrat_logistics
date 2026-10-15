'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import { 
  Printer, 
  Download, 
  RefreshCw, 
  Package, 
  Scale, 
  IndianRupee, 
  Layers, 
  Loader2,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';

export default function BookingSummaryReportPage() {
  const { user } = useUserStore();
  const role = user?.role;
  const isBranchUser = role === 'branch_user' || role === 'branch';

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalLrs: 0,
    totalPkgs: 0,
    totalWeight: 0,
    paidAmount: 0,
    toPayAmount: 0,
    tbbAmount: 0,
    grandTotalRevenue: 0
  });

  // Filters (Default to this month)
  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch || '') : 'all');
  const [groupBy, setGroupBy] = useState('branch'); // 'branch' | 'destination' | 'date'
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
      params.set('groupBy', groupBy);

      const res = await fetch(`/api/admin/reports/booking-summary?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch summary');

      setData(json.summary || []);
      setKpis(json.kpis || {});
    } catch (err: any) {
      toast.error(err.message || 'Error loading summary report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, branch, groupBy]);

  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      const groupLabel = groupBy === 'branch' ? 'Origin Branch' : groupBy === 'destination' ? 'Destination' : 'Date';
      const headers = [
        groupLabel, 'Total LRs', 'Total Pkgs', 'Total Weight (kg)', 
        'Paid (₹)', 'To Pay (₹)', 'TBB (Credit ₹)', 'Total Revenue (₹)'
      ];
      const rows = data.map(r => [
        r.code ? `${r.title} (${r.code})` : r.title,
        r.lrCount,
        r.totalPackages,
        r.totalWeight,
        r.paidAmount,
        r.toPayAmount,
        r.tbbAmount,
        r.grandTotal
      ]);

      await exportToStyledExcel('Booking_Summary_Report', headers, rows);
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
      const groupLabel = groupBy === 'branch' ? 'Origin Branch' : groupBy === 'destination' ? 'Destination' : 'Date';
      const headers = [
        groupLabel, 'LRs', 'Pkgs', 'Weight (kg)', 'Paid (₹)', 'To-Pay (₹)', 'TBB (₹)', 'Total (₹)'
      ];
      const rows = data.map(r => [
        r.code ? `${r.title} (${r.code})` : r.title,
        r.lrCount,
        r.totalPackages,
        `${r.totalWeight} kg`,
        `₹${r.paidAmount}`,
        `₹${r.toPayAmount}`,
        `₹${r.tbbAmount}`,
        `₹${r.grandTotal}`
      ]);

      exportToStyledPDF(
        `Booking Summary Report (${startDate} to ${endDate})`,
        'Booking_Summary_Report',
        headers,
        rows,
        { fontSize: 8 }
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
              Booking Summary & Revenue Ledger
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Aggregated booking volume, weight, and financial performance breakdown
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
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Volume</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {kpis.totalLrs || 0} LRs
              <span className="text-xs font-medium text-gray-400 ml-1 font-sans">
                ({kpis.totalPkgs || 0} pkgs)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Weight</p>
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
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Freight</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">
              ₹{(kpis.grandTotalRevenue || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Shares</p>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              Paid: ₹{(kpis.paidAmount || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
              To-Pay: ₹{(kpis.toPayAmount || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
              TBB: ₹{(kpis.tbbAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-xs rounded-xl bg-white overflow-visible">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Header / Group By Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Summary & Ledger Filters
                </h2>
                <p className="text-[11px] text-gray-500">
                  {data.length} summary {data.length === 1 ? 'group' : 'groups'} calculated
                </p>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Group By Selector */}
              <div className="w-full sm:w-56 relative z-30">
                <ThemeSelect
                  name="groupBy"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  options={[
                    { label: 'Group by Origin Branch', value: 'branch' },
                    { label: 'Group by Destination', value: 'destination' },
                    { label: 'Group by Day / Date', value: 'date' }
                  ]}
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 font-semibold shadow-2xs w-full"
                  contentClassName="min-w-[220px]"
                />
              </div>

              {/* Date From */}
              <div className="w-full sm:w-40 relative z-20">
                <DatePicker
                  value={startDate}
                  onChange={(val) => setStartDate(val || '')}
                  placeholder="From Date"
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs"
                />
              </div>

              {/* Date To */}
              <div className="w-full sm:w-40 relative z-20">
                <DatePicker
                  value={endDate}
                  onChange={(val) => setEndDate(val || '')}
                  placeholder="To Date"
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs"
                />
              </div>

              {/* Branch Filter */}
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
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/90 whitespace-nowrap uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200/90">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">
                    {groupBy === 'branch' ? 'Origin Branch' : groupBy === 'destination' ? 'Destination Location' : 'Booking Date'}
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Total LRs</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Packages</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Weight (kg)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90 text-emerald-800">Paid (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90 text-amber-800">To-Pay (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90 text-blue-800">TBB Credit (₹)</th>
                  <th className="py-2.5 px-3 text-right font-black">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Calculating Summary Breakdown...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Layers className="w-9 h-9 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">No Data in Selected Period</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((r, idx) => (
                    <tr key={r.key} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                      <td className="py-2 px-3 text-center text-gray-400 font-medium border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800 border-r border-slate-100">
                        {r.code ? `${r.title} (${r.code})` : r.title}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-brand-primary border-r border-slate-100">
                        {r.lrCount}
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-700 border-r border-slate-100">
                        {r.totalPackages}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 border-r border-slate-100">
                        {r.totalWeight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700 border-r border-slate-100">
                        ₹{r.paidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-700 border-r border-slate-100">
                        ₹{r.toPayAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-700 border-r border-slate-100">
                        ₹{r.tbbAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">
                        ₹{r.grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase tracking-wider border-r border-slate-200 text-xs">
                      Total Summary:
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-black text-brand-primary">
                      {kpis.totalLrs}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-black text-brand-primary">
                      {kpis.totalPkgs}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-brand-primary">
                      {(kpis.totalWeight || 0).toLocaleString('en-IN')} kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-800 border-r border-slate-200">
                      ₹{(kpis.paidAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-800 border-r border-slate-200">
                      ₹{(kpis.toPayAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-800 border-r border-slate-200">
                      ₹{(kpis.tbbAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                      ₹{(kpis.grandTotalRevenue || 0).toLocaleString('en-IN')}
                    </td>
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
