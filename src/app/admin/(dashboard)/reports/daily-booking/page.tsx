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
  Package, 
  Scale, 
  IndianRupee, 
  FileText, 
  TrendingUp, 
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/dateUtils';
import { QuickDatePresets } from '@/components/admin/QuickDatePresets';
import Link from 'next/link';

export default function DailyBookingRegisterPage() {
  const { user } = useUserStore();
  const role = user?.role;
  const isBranchUser = role === 'branch_user' || role === 'branch';

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalBookings: 0,
    totalPackages: 0,
    totalWeight: 0,
    grandTotal: 0,
    paidAmount: 0,
    toPayAmount: 0,
    tbbAmount: 0
  });

  // Filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch || '') : 'all');
  const [paymentCondition, setPaymentCondition] = useState('all');
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);

  // Load branches for filter
  useEffect(() => {
    if (!isBranchUser) {
      fetch('/api/admin/branches?limit=1000')
        .then(res => res.json())
        .then(d => {
          const list = d.branches || d || [];
          setBranches(list);
        })
        .catch(() => {});
    }
  }, [isBranchUser]);

  // Fetch report data
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (branch && branch !== 'all') params.set('branch', branch);
      if (paymentCondition && paymentCondition !== 'all') params.set('paymentCondition', paymentCondition);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/reports/daily-booking?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch report');

      setData(json.bookings || []);
      setKpis(json.kpis || {});
    } catch (err: any) {
      toast.error(err.message || 'Error loading report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, branch, paymentCondition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  // Export to Excel
  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        'LR No', 'Date', 'From Branch', 'To Branch', 'Consignor', 
        'Consignee', 'Goods', 'Pkgs', 'Weight (Kg)', 'Freight', 
        'Hamali', 'GST', 'Total (₹)', 'Payment', 'Status'
      ];
      const rows = data.map(b => [
        `LR-${b.lrNumber}`,
        formatDate(b.bookingDate),
        b.fromBranch,
        b.toBranch,
        b.consignorName,
        b.consigneeName,
        b.itemName,
        b.packages,
        b.weight,
        b.freightAmount,
        b.hamali,
        b.gstAmount,
        b.totalAmount,
        b.paymentCondition.toUpperCase(),
        b.status.toUpperCase()
      ]);

      await exportToStyledExcel('Daily_Booking_Register', headers, rows);
      toast.success('Excel exported successfully');
    } catch (err: any) {
      toast.error('Excel export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (data.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      const headers = [
        'LR No', 'Date', 'Route', 'Consignor', 'Consignee', 
        'Pkgs', 'Weight', 'Total (₹)', 'Payment'
      ];
      const rows = data.map(b => [
        `LR-${b.lrNumber}`,
        formatDate(b.bookingDate),
        `${b.fromBranchCode || b.fromBranch} -> ${b.toBranchCode || b.toBranch}`,
        b.consignorName.substring(0, 15),
        b.consigneeName.substring(0, 15),
        b.packages,
        `${b.weight} kg`,
        `₹${b.totalAmount}`,
        b.paymentCondition.toUpperCase()
      ]);

      exportToStyledPDF(
        `Daily Booking Register (${startDate} to ${endDate})`,
        'Daily_Booking_Register',
        headers,
        rows,
        { fontSize: 7 }
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
      {/* Top Title Bar - Synced with Challan / LR Theme */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-4 py-2.5 rounded-xl shadow-xs border border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-primary rounded-full inline-block"></span>
            <h1 className="text-base sm:text-lg font-extrabold text-gray-800 tracking-tight">
              Daily Booking Register
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Complete day-wise Lorry Receipts (LR) dispatch & financial ledger
          </p>
        </div>

        {/* Action Buttons: Print, PDF, Excel, Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => window.print()}
            disabled={isLoading || data.length === 0}
            variant="outline"
            className="h-9 w-full sm:w-auto px-3.5 rounded-lg text-xs font-semibold shadow-2xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
            title="Direct Browser Print"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Print
          </Button>

          <Button
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
            variant="outline"
            className="h-9 w-full sm:w-auto px-3.5 rounded-lg text-xs font-semibold shadow-2xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-rose-500" />
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

      {/* KPI Summary Cards Bar - 4 High Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Bookings */}
        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total LRs</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {kpis.totalBookings || 0}
              <span className="text-xs font-medium text-gray-400 ml-1.5 font-sans">
                ({kpis.totalPackages || 0} pkgs)
              </span>
            </p>
          </div>
        </div>

        {/* Total Weight */}
        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Weight</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {(kpis.totalWeight || 0).toLocaleString('en-IN')}
              <span className="text-xs font-semibold text-gray-400 ml-1">kg</span>
            </p>
          </div>
        </div>

        {/* Grand Total Revenue */}
        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Freight</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">
              ₹{(kpis.grandTotal || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Payment Condition Breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Breakdown</p>
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

      {/* Main Filter & Table Card Container */}
      <Card className="border-none shadow-xs rounded-xl bg-white overflow-visible">
        {/* Filter Controls Header */}
        <div className="border-b border-gray-100 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            {/* Top Row: Title Badge & Quick Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daily Booking Filters
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {data.length} {data.length === 1 ? 'record' : 'records'} found in selected period
                  </p>
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <QuickDatePresets
                  startDate={startDate}
                  endDate={endDate}
                  onSelect={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                />
              </div>
            </div>

            {/* Filter Inputs Grid / Row */}
            <div className="flex flex-wrap items-center gap-2.5">
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

              {/* Branch Filter (Only for Logistic / Superadmin) */}
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

              {/* Payment Condition Filter */}
              <div className="w-full sm:w-40 relative z-20">
                <ThemeSelect
                  name="paymentCondition"
                  value={paymentCondition}
                  onChange={(e) => setPaymentCondition(e.target.value)}
                  options={[
                    { label: 'All Payments', value: 'all' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'To Pay', value: 'to_pay' },
                    { label: 'TBB (Credit)', value: 'tbb' }
                  ]}
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs w-full"
                  contentClassName="min-w-[180px]"
                />
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="LR No, Consignor, Consignee..."
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

              {/* Search Submit */}
              <Button
                type="submit"
                className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Filter
              </Button>

              {/* Reset Button */}
              {(branch !== (isBranchUser ? (user?.branch || '') : 'all') || paymentCondition !== 'all' || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setBranch(isBranchUser ? (user?.branch || '') : 'all');
                    setPaymentCondition('all');
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

        {/* Data Table View */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/90 whitespace-nowrap uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200/90">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">LR Number</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Route (From ➔ To)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignor (Sender)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignee (Receiver)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Pkgs</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Weight (kg)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Payment</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Total (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Loading Daily Booking Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <FileText className="w-9 h-9 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">No Booking Records Found</p>
                        <p className="text-[11px] text-gray-400">Try adjusting your date range or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((b, idx) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                      <td className="py-2 px-3 text-center text-gray-400 font-medium border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-brand-primary border-r border-slate-100">
                        <Link href={`/admin/bookings/${b._id}`} className="hover:underline flex items-center gap-1">
                          LR-{b.lrNumber}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-gray-600 border-r border-slate-100">
                        {formatDate(b.bookingDate)}
                      </td>
                      <td className="py-2 px-3 text-gray-700 font-medium border-r border-slate-100">
                        <span className="font-semibold text-slate-800">{b.fromBranchCode || b.fromBranch}</span>
                        <span className="text-gray-400 mx-1.5">➔</span>
                        <span className="font-semibold text-slate-800">{b.toBranchCode || b.toBranch}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-800 border-r border-slate-100 font-medium">
                        {b.consignorName}
                      </td>
                      <td className="py-2 px-3 text-gray-800 border-r border-slate-100 font-medium">
                        {b.consigneeName}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-gray-700 border-r border-slate-100">
                        {b.packages}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-700 border-r border-slate-100">
                        {b.weight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-100">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.paymentCondition === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.paymentCondition === 'to_pay'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {b.paymentCondition.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900 border-r border-slate-100">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'delivered' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : b.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.status.replace('_', ' ')}
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
                      Grand Totals ({data.length} LRs):
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-black text-brand-primary">
                      {kpis.totalPackages}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-brand-primary">
                      {(kpis.totalWeight || 0).toLocaleString('en-IN')} kg
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200"></td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-800 text-sm border-r border-slate-200">
                      ₹{(kpis.grandTotal || 0).toLocaleString('en-IN')}
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
