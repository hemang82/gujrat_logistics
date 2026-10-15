'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  AlertCircle,
  Clock,
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/dateUtils';
import Link from 'next/link';

export default function LeftBookingReportPage() {
  const { user } = useUserStore();
  const role = user?.role;
  const isBranchUser = role === 'branch_user' || role === 'branch';

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    totalLeftBookings: 0,
    totalPackages: 0,
    totalWeight: 0,
    grandTotal: 0
  });

  // Filters
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch || '') : 'all');
  const [daysOld, setDaysOld] = useState('all');
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);

  // Load branches
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

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (branch && branch !== 'all') params.set('branch', branch);
      if (daysOld && daysOld !== 'all') params.set('daysOld', daysOld);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/reports/left-booking?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch left bookings');

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
  }, [branch, daysOld]);

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
        'LR No', 'Booking Date', 'Age (Days in Warehouse)', 'From Branch', 'To Branch', 
        'Consignor', 'Consignee', 'Goods', 'Pkgs', 'Weight (kg)', 'Amount (₹)', 'Payment'
      ];
      const rows = data.map(b => [
        `LR-${b.lrNumber}`,
        formatDate(b.bookingDate),
        `${b.ageInDays} Days`,
        b.fromBranch,
        b.toBranch,
        b.consignorName,
        b.consigneeName,
        b.itemName,
        b.packages,
        b.weight,
        b.totalAmount,
        b.paymentCondition.toUpperCase()
      ]);

      await exportToStyledExcel('Left_Bookings_Report', headers, rows);
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
        'LR No', 'Date', 'Age', 'Route', 'Consignor', 'Consignee', 
        'Pkgs', 'Weight', 'Amount (₹)'
      ];
      const rows = data.map(b => [
        `LR-${b.lrNumber}`,
        formatDate(b.bookingDate),
        `${b.ageInDays}d`,
        `${b.fromBranchCode || b.fromBranch} -> ${b.toBranchCode || b.toBranch}`,
        b.consignorName.substring(0, 15),
        b.consigneeName.substring(0, 15),
        b.packages,
        `${b.weight} kg`,
        `₹${b.totalAmount}`
      ]);

      exportToStyledPDF(
        'Left Bookings in Warehouse (Pending Dispatch)',
        'Left_Bookings_Report',
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
            <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
            <h1 className="text-base sm:text-lg font-extrabold text-gray-800 tracking-tight">
              Left Booking (Pending Warehouse Stock)
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 pl-3.5">
            Bookings sitting in warehouse awaiting Challan dispatch & truck assignment
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unloaded LRs</p>
            <p className="text-lg font-black text-amber-700 leading-tight">
              {kpis.totalLeftBookings || 0}
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
              {kpis.totalPackages || 0}
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
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unloaded Value</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">
              ₹{(kpis.grandTotal || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-xs rounded-xl bg-white overflow-visible">
        <div className="border-b border-gray-100 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Filter Section Title & Active Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-primary">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pending Stock Filters
                </h2>
                <p className="text-[11px] text-gray-500">
                  {data.length} {data.length === 1 ? 'consignment' : 'consignments'} found
                </p>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Branch Filter */}
              {!isBranchUser && (
                <div className="w-full sm:w-52 relative z-[60]">
                  <BranchAutocomplete
                    name="branch"
                    value={branch === 'all' ? '' : branch}
                    onChange={(e) => setBranch(e.target.value || 'all')}
                    options={[
                      { label: 'All Warehouse Branches', value: '' },
                      ...branches.map(b => ({ label: `${b.name} (${b.code || ''})`, value: b._id }))
                    ]}
                    placeholder="All Warehouse Branches"
                    className="!rounded-lg !h-9 text-xs shadow-2xs border-gray-200"
                  />
                </div>
              )}

              {/* Sitting in Warehouse Days Filter */}
              <div className="w-full sm:w-56 relative z-20">
                <ThemeSelect
                  name="daysOld"
                  value={daysOld}
                  onChange={(e) => setDaysOld(e.target.value)}
                  options={[
                    { label: 'All Pending LR', value: 'all' },
                    { label: 'Older than 1 Day', value: '1' },
                    { label: 'Older than 2 Days', value: '2' },
                    { label: 'Older than 3 Days (Urgent)', value: '3' },
                    { label: 'Older than 7 Days (Critical)', value: '7' }
                  ]}
                  className="!rounded-lg !h-9 bg-white !border-gray-200 text-xs px-3 shadow-2xs w-full"
                  contentClassName="min-w-[230px]"
                />
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search LR, Party, Destination..."
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

              {(branch !== (isBranchUser ? (user?.branch || '') : 'all') || daysOld !== 'all' || search) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setBranch(isBranchUser ? (user?.branch || '') : 'all');
                    setDaysOld('all');
                    setSearch('');
                  }}
                  className="h-9 px-2.5 text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Reset all filters"
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
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Booking Date</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Warehouse Age</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Warehouse Location</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Destination</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignor</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/90">Consignee</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200/90">Pkgs</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Weight (kg)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200/90">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-xs font-medium">Scanning warehouse pending stock...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-emerald-600 bg-emerald-50/30">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                          ✓
                        </div>
                        <p className="text-xs font-bold text-emerald-800">Warehouse Cleared! No Left Bookings</p>
                        <p className="text-[11px] text-gray-500">All booked parcels have been loaded into Challans</p>
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
                        <Link href={`/admin/bookings/${b._id}`} className="hover:underline">
                          LR-{b.lrNumber}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-gray-600 border-r border-slate-100">
                        {formatDate(b.bookingDate)}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-100">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.ageInDays >= 3 
                            ? 'bg-rose-100 text-rose-800 animate-pulse' 
                            : b.ageInDays >= 1
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {b.ageInDays === 0 ? 'Today' : `${b.ageInDays}d sitting`}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-100">
                        {b.fromBranchCode ? `${b.fromBranch} (${b.fromBranchCode})` : b.fromBranch}
                      </td>
                      <td className="py-2 px-3 font-semibold text-brand-primary border-r border-slate-100">
                        {b.toBranchCode ? `${b.toBranch} (${b.toBranchCode})` : b.toBranch}
                      </td>
                      <td className="py-2 px-3 text-gray-800 border-r border-slate-100">
                        {b.consignorName}
                      </td>
                      <td className="py-2 px-3 text-gray-800 border-r border-slate-100">
                        {b.consigneeName}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                        {b.packages}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 border-r border-slate-100">
                        {b.weight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900 border-r border-slate-100">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Link href="/admin/challans/new">
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] font-bold text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10">
                            Load in Challan
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={8} className="py-2.5 px-3 text-right uppercase tracking-wider border-r border-slate-200 text-xs">
                      Total Left in Stock ({data.length} LRs):
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 font-black text-brand-primary">
                      {kpis.totalPackages}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-black text-brand-primary">
                      {(kpis.totalWeight || 0).toLocaleString('en-IN')} kg
                    </td>
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
