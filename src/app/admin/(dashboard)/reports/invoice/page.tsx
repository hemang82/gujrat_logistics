'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import { 
  Search, 
  Printer, 
  Download, 
  RefreshCw, 
  FileText, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Filter,
  X,
  Eye,
  Edit,
  Plus,
  Package,
  Scale
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/dateUtils';
import Link from 'next/link';

export default function InvoiceReportPage() {
  const { user } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalInvoices: 0,
    grandBilledAmount: 0,
    grandPaidAmount: 0,
    grandDueAmount: 0,
    grandGstAmount: 0
  });

  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (status && status !== 'all') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/reports/invoice?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch invoice report');

      setData(json.records || []);
      setKpis(json.kpis || {});
    } catch (err: any) {
      toast.error(err.message || 'Error loading invoice report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, status]);

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
        'Invoice No', 'Date', 'Customer Name', 'Phone', 'GSTIN', 
        'LR Count', 'Basic Freight (₹)', 'GST (₹)', 'Grand Total (₹)', 
        'Amount Paid (₹)', 'Amount Due (₹)', 'Status'
      ];
      const rows = data.map(r => [
        r.invoiceNumber,
        formatDate(r.invoiceDate),
        r.clientName,
        r.clientPhone,
        r.clientGst,
        r.lrCount,
        r.totalFreight,
        r.totalGst,
        r.grandTotal,
        r.amountPaid,
        r.amountDue,
        r.status.toUpperCase()
      ]);

      await exportToStyledExcel('Invoice_Billing_Report', headers, rows);
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
        'Invoice No', 'Date', 'Customer', 'LRs', 'Billed (₹)', 
        'Paid (₹)', 'Due Balance (₹)', 'Status'
      ];
      const rows = data.map(r => [
        r.invoiceNumber,
        formatDate(r.invoiceDate),
        r.clientName.substring(0, 16),
        r.lrCount,
        `₹${r.grandTotal}`,
        `₹${r.amountPaid}`,
        `₹${r.amountDue}`,
        r.status.toUpperCase()
      ]);

      exportToStyledPDF(
        `Invoice & Billing Report (${startDate} to ${endDate})`,
        'Invoice_Billing_Report',
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
              Manage Booking & Invoices (TBB)
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Credit client billing ledger, invoice generator, and party ledger collections
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">

          <Button
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
            variant="outline"
            className="h-9 px-3 rounded-lg text-xs font-semibold shadow-2xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            PDF
          </Button>

          <Button
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            variant="outline"
            className="h-9 px-3 rounded-lg text-xs font-semibold shadow-2xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
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
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Invoices Issued</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {kpis.totalInvoices || 0}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Packages</p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {(kpis.grandPkgs || 0).toLocaleString('en-IN')}
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
              {(kpis.grandWeight || 0).toLocaleString('en-IN')} <span className="text-xs font-semibold text-gray-400">kg</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Billed (₹)</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">
              ₹{(kpis.grandBilledAmount || 0).toLocaleString('en-IN')}
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
                  Invoice & Billing Filters
                </h2>
                <p className="text-[11px] text-gray-500">
                  {data.length} {data.length === 1 ? 'invoice' : 'invoices'} found
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

              <div className="w-full sm:w-48 relative z-20">
                <ThemeSelect
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { label: 'All Invoices', value: 'all' },
                    { label: 'Unpaid / Pending', value: 'unpaid' },
                    { label: 'Partially Paid', value: 'partial' },
                    { label: 'Fully Paid', value: 'paid' }
                  ]}
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs w-full"
                  contentClassName="min-w-[190px]"
                />
              </div>

              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Invoice No, Client Name..."
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

              {(status !== 'all' || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
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
                  <th className="py-2.5 px-3 border-r border-slate-200/90">INVOICE NO.</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">DATE</th>
                  <th className="py-2.5 px-4 border-r border-slate-200/90">PARTY NAME</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">PKGS</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">WEIGHT (KG)</th>
                  <th className="py-2.5 px-4 text-right border-r border-slate-200/90">TOTAL (₹)</th>
                  <th className="py-2.5 px-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Loading Invoice Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <FileText className="w-9 h-9 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">No Invoices Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((r, idx) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                      <td className="py-2.5 px-3 text-center text-gray-400 font-medium border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-brand-primary border-r border-slate-100">
                        <Link href={`/admin/billing/${r._id}/print`} className="hover:underline font-mono">
                          {r.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 border-r border-slate-100">
                        {formatDate(r.invoiceDate)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-100 uppercase">
                        {r.clientName}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 font-medium text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {r.pkgs || r.lrCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700 border-r border-slate-100 font-mono">
                        {(r.weight || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-emerald-700 border-r border-slate-100 font-mono">
                        ₹{r.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/billing/${r._id}/print`}
                            className="p-1 text-slate-500 hover:text-brand-primary hover:bg-teal-50 rounded transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/billing`}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Edit / Update Payment"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/billing/${r._id}/print`}
                            target="_blank"
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Print / PDF Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider border-r border-slate-200 text-xs">
                      PAGE SUMMARY:
                    </td>
                    <td className="py-3 px-3 text-center font-black border-r border-slate-200">
                      {(kpis.grandPkgs || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-black border-r border-slate-200 font-mono">
                      {(kpis.grandWeight || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Kg
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700 border-r border-slate-200 font-mono">
                      ₹{(kpis.grandBilledAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center"></td>
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
