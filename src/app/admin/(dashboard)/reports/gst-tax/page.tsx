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
  FileCheck2, 
  Receipt, 
  Percent, 
  IndianRupee, 
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/dateUtils';
import Link from 'next/link';

export default function GstTaxRegisterPage() {
  const { user } = useUserStore();
  const role = user?.role;
  const isBranchUser = role === 'branch_user' || role === 'branch';

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalRecords: 0,
    totalTaxableValue: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalGstAmount: 0,
    totalInvoiceAmount: 0
  });

  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch || '') : 'all');
  const [gstType, setGstType] = useState('with_gst');
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
      if (gstType && gstType !== 'all') params.set('gstType', gstType);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/reports/gst-tax?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch GST register');

      setData(json.records || []);
      setKpis(json.kpis || {});
    } catch (err: any) {
      toast.error(err.message || 'Error loading GST report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, branch, gstType]);

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
        'LR No', 'Date', 'Branch', 'Consignor (Sender)', 'Consignor GSTIN',
        'Consignee (Receiver)', 'Consignee GSTIN', 'Taxable Value (₹)',
        'GST Rate (%)', 'CGST (₹)', 'SGST (₹)', 'Total GST (₹)', 'Invoice Total (₹)'
      ];
      const rows = data.map(r => [
        `LR-${r.lrNumber}`,
        formatDate(r.bookingDate),
        r.branch,
        r.consignorName,
        r.consignorGst,
        r.consigneeName,
        r.consigneeGst,
        r.taxableValue,
        `${r.gstRate}%`,
        r.cgst,
        r.sgst,
        r.gstAmount,
        r.totalAmount
      ]);

      await exportToStyledExcel('GST_Tax_Register', headers, rows);
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
        'LR No', 'Date', 'Sender / GSTIN', 'Receiver / GSTIN', 
        'Taxable (₹)', 'Rate', 'CGST (₹)', 'SGST (₹)', 'Total (₹)'
      ];
      const rows = data.map(r => [
        `LR-${r.lrNumber}`,
        formatDate(r.bookingDate),
        `${r.consignorName.substring(0, 12)}\n${r.consignorGst}`,
        `${r.consigneeName.substring(0, 12)}\n${r.consigneeGst}`,
        `₹${r.taxableValue}`,
        `${r.gstRate}%`,
        `₹${r.cgst}`,
        `₹${r.sgst}`,
        `₹${r.totalAmount}`
      ]);

      exportToStyledPDF(
        `GST Tax Register (${startDate} to ${endDate})`,
        'GST_Tax_Register',
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
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-4 py-2.5 rounded-xl shadow-xs border border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-primary rounded-full inline-block"></span>
            <h1 className="text-base sm:text-lg font-extrabold text-gray-800 tracking-tight">
              GST Tax & Compliance Register
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Audit-ready B2B & B2C GST billing breakdown with CGST, SGST & GSTIN validation
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
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Taxable Turnover</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              ₹{(kpis.totalTaxableValue || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">CGST (Intra-state)</p>
            <p className="text-lg font-black text-indigo-700 leading-tight">
              ₹{(kpis.totalCgst || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">SGST (Intra-state)</p>
            <p className="text-lg font-black text-purple-700 leading-tight">
              ₹{(kpis.totalSgst || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total GST Collected</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">
              ₹{(kpis.totalGstAmount || 0).toLocaleString('en-IN')}
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
                  GST & Tax Register Filters
                </h2>
                <p className="text-[11px] text-gray-500">
                  {data.length} {data.length === 1 ? 'record' : 'records'} matching tax criteria
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

              <div className="w-full sm:w-48 relative z-20">
                <ThemeSelect
                  name="gstType"
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value)}
                  options={[
                    { label: 'With GST Only (5%)', value: 'with_gst' },
                    { label: 'Without GST (0%)', value: 'without_gst' },
                    { label: 'All LR Records', value: 'all' }
                  ]}
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs w-full"
                  contentClassName="min-w-[200px]"
                />
              </div>

              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="LR, Party, GSTIN..."
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

              {(branch !== (isBranchUser ? (user?.branch || '') : 'all') || gstType !== 'with_gst' || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setBranch(isBranchUser ? (user?.branch || '') : 'all');
                    setGstType('with_gst');
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
                  <th className="py-2.5 px-3 border-r border-slate-200/90">LR No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignor & GSTIN</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignee & GSTIN</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Taxable Value (₹)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Rate</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90 font-bold text-emerald-800">Total GST (₹)</th>
                  <th className="py-2.5 px-3 text-right font-black">Invoice Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Extracting GST Tax Details...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <FileCheck2 className="w-9 h-9 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">No GST Records Found</p>
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
                      <td className="py-2 px-3 border-r border-slate-100">
                        <p className="font-semibold text-slate-800">{r.consignorName}</p>
                        <p className={`text-[10px] font-mono ${r.consignorGst !== 'Unregistered' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                          {r.consignorGst}
                        </p>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100">
                        <p className="font-semibold text-slate-800">{r.consigneeName}</p>
                        <p className={`text-[10px] font-mono ${r.consigneeGst !== 'Unregistered' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                          {r.consigneeGst}
                        </p>
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-800 border-r border-slate-100">
                        ₹{r.taxableValue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-600 border-r border-slate-100">
                        {r.gstRate}%
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-indigo-700 border-r border-slate-100">
                        ₹{r.cgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-purple-700 border-r border-slate-100">
                        ₹{r.sgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700 border-r border-slate-100">
                        ₹{r.gstAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">
                        ₹{r.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider border-r border-slate-200 text-xs">
                      Total GST Summary:
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-slate-900">
                      ₹{(kpis.totalTaxableValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200"></td>
                    <td className="py-2.5 px-3 text-right font-black text-indigo-800 border-r border-slate-200">
                      ₹{(kpis.totalCgst || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-purple-800 border-r border-slate-200">
                      ₹{(kpis.totalSgst || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-800 border-r border-slate-200">
                      ₹{(kpis.totalGstAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                      ₹{(kpis.totalInvoiceAmount || 0).toLocaleString('en-IN')}
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
