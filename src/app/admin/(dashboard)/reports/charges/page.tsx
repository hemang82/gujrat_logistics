'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import { 
  Search, 
  Printer, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  IndianRupee, 
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/dateUtils';
import Link from 'next/link';

export default function ChargesRegisterPage() {
  const { user } = useUserStore();
  const role = user?.role;
  const isBranchUser = role === 'branch_user' || role === 'branch';

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalRecords: 0,
    grandFreight: 0,
    grandHamali: 0,
    grandSurcharge: 0,
    grandPf: 0,
    grandDd: 0,
    grandBilty: 0,
    grandGst: 0,
    grandTotal: 0
  });

  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch || '') : 'all');
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
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/reports/charges?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch charges register');

      setData(json.records || []);
      setKpis(json.kpis || {});
    } catch (err: any) {
      toast.error(err.message || 'Error loading charges report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, branch]);

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
        'LR No', 'Date', 'Branch', 'Consignor', 'Consignee', 
        'Freight (₹)', 'Hamali (₹)', 'SurChg (₹)', 'Door Del (₹)', 
        'Bilty Chg (₹)', 'GST (₹)', 'Total (₹)'
      ];
      const rows = data.map(r => [
        `LR-${r.lrNumber}`,
        formatDate(r.bookingDate),
        r.branch,
        r.consignorName,
        r.consigneeName,
        r.freight,
        r.hamali,
        r.surcharge,
        r.dd,
        r.bilty,
        r.gst,
        r.total
      ]);

      await exportToStyledExcel('Charges_Register', headers, rows);
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
        'LR No', 'Date', 'Consignor', 'Freight', 'Hamali', 'SurChg', 'GST', 'Total (₹)'
      ];
      const rows = data.map(r => [
        `LR-${r.lrNumber}`,
        formatDate(r.bookingDate),
        r.consignorName.substring(0, 15),
        `₹${r.freight}`,
        `₹${r.hamali}`,
        `₹${r.surcharge}`,
        `₹${r.gst}`,
        `₹${r.total}`
      ]);

      exportToStyledPDF(
        `Charges Register (${startDate} to ${endDate})`,
        'Charges_Register',
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
              Charges & Revenue Breakdown Register
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Transparent split of Basic Freight, Hamali (Labour), Door Delivery, and Surcharges
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
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Basic Freight</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              ₹{(kpis.grandFreight || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Hamali Collected</p>
            <p className="text-lg font-black text-amber-800 leading-tight">
              ₹{(kpis.grandHamali || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">SurCharge & Extra</p>
            <p className="text-lg font-black text-blue-800 leading-tight">
              ₹{(kpis.grandSurcharge + kpis.grandDd + kpis.grandBilty || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Grand Total</p>
            <p className="text-lg font-black text-emerald-800 leading-tight">
              ₹{(kpis.grandTotal || 0).toLocaleString('en-IN')}
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
                  Charges Register Filters
                </h2>
                <p className="text-[11px] text-gray-500">
                  {data.length} {data.length === 1 ? 'consignment' : 'consignments'} breakdown
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

              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="LR No, Party Name..."
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

              {(branch !== (isBranchUser ? (user?.branch || '') : 'all') || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setBranch(isBranchUser ? (user?.branch || '') : 'all');
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
                  <th className="py-2.5 px-3 border-r border-slate-200/90">LR Number</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Branch</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignor</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Freight (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Hamali (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">SurChg (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Door Del (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Bilty Chg (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">GST (₹)</th>
                  <th className="py-2.5 px-3 text-right font-black">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Loading Charges Breakdown...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <FileSpreadsheet className="w-9 h-9 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">No Charges Found</p>
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
                        <Link href={`/admin/bookings/${r._id}`} className="hover:underline">
                          LR-{r.lrNumber}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-gray-600 border-r border-slate-100">
                        {formatDate(r.bookingDate)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 border-r border-slate-100">
                        {r.branch}
                      </td>
                      <td className="py-2 px-3 text-gray-800 border-r border-slate-100">
                        {r.consignorName}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-800 border-r border-slate-100">
                        ₹{r.freight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-amber-800 border-r border-slate-100">
                        ₹{r.hamali.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 border-r border-slate-100">
                        ₹{r.surcharge.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 border-r border-slate-100">
                        ₹{r.dd.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 border-r border-slate-100">
                        ₹{r.bilty.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-indigo-700 border-r border-slate-100">
                        ₹{r.gst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">
                        ₹{r.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider border-r border-slate-200 text-xs">
                      Grand Totals:
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-slate-900">
                      ₹{(kpis.grandFreight || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-amber-800">
                      ₹{(kpis.grandHamali || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-slate-800">
                      ₹{(kpis.grandSurcharge || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-slate-800">
                      ₹{(kpis.grandDd || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-slate-800">
                      ₹{(kpis.grandBilty || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-indigo-800">
                      ₹{(kpis.grandGst || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-800 text-sm">
                      ₹{(kpis.grandTotal || 0).toLocaleString('en-IN')}
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
