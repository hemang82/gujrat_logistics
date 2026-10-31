'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  IndianRupee,
  Download,
  Printer,
  Building2,
  Clock,
  CheckCircle2,
  Receipt,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';

export default function BranchLedgerPage() {
  const user = useUserStore(state => state.user);
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'logistic';
  
  const [date, setDate] = useState<Date>(new Date());
  const [selectedBranch, setSelectedBranch] = useState<string>(user?.branch || '');
  const [branches, setBranches] = useState<any[]>([]);
  
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Voucher Modal State
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    type: 'debit',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (user?.branch && !selectedBranch) {
      setSelectedBranch(user.branch);
    }
  }, [user, selectedBranch]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/branches?limit=100')
        .then(res => res.json())
        .then(data => {
          setBranches(data.branches || data || []);
        });
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchLedger();
  }, [date, selectedBranch]);

  const fetchLedger = async () => {
    const branchId = selectedBranch || (!isAdmin ? user?.branch : '');
    if (!branchId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const res = await fetch(`/api/admin/accounts/branch-ledger?branchId=${branchId}&date=${dateStr}`);
      const data = await res.json();
      
      if (res.ok) {
        setLedgerData(data);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.amount || Number(voucherForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (!voucherForm.description.trim()) {
      toast.error('Please enter Description');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/accounts/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString(),
          branchId: selectedBranch || user?.branch,
          ...voucherForm
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Voucher added successfully');
      setIsVoucherOpen(false);
      setVoucherForm({ type: 'debit', amount: '', description: '' });
      fetchLedger(); // Refresh
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getExportData = () => {
    if (!ledgerData || !ledgerData.transactions || ledgerData.transactions.length === 0) {
      return null;
    }
    
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Balance After'];
    const rows = ledgerData.transactions.map((t: any) => [
      format(new Date(t.date), 'dd/MM/yyyy hh:mm a'),
      t.type.toUpperCase(),
      t.amount,
      t.description,
      t.balanceAfter
    ]);
    
    // Add summary row at the bottom
    rows.push(['', '', '', 'Opening Balance', ledgerData.openingBalance]);
    rows.push(['', '', '', 'Total In', ledgerData.totalIn]);
    rows.push(['', '', '', 'Total Out', ledgerData.totalOut]);
    rows.push(['', '', '', 'Closing Balance', ledgerData.closingBalance]);
    
    return { headers, rows };
  };

  const exportToExcel = async () => {
    const data = getExportData();
    if (!data) {
      toast.error('No data available to export');
      return;
    }
    
    const { exportToStyledExcel } = await import('@/lib/exportUtils');
    await exportToStyledExcel('Branch_Ledger', data.headers, data.rows);
  };

  const exportToPDF = async () => {
    const data = getExportData();
    if (!data) {
      toast.error('No data available to export');
      return;
    }
    
    const { exportToStyledPDF } = await import('@/lib/exportUtils');
    exportToStyledPDF(
      `Branch Cash Ledger - ${format(date, 'dd/MM/yyyy')}`, 
      'Branch_Ledger', 
      data.headers, 
      data.rows
    );
  };

  const getReferenceTypeBadge = (type: string) => {
    switch (type) {
      case 'Booking':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Paid LR</span>;
      case 'CashCollection':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Delivery Collection</span>;
      case 'LorryHire':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Lorry Hire</span>;
      case 'Expense':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Expense</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Manual Voucher</span>;
    }
  };

  const activeBranchName = ledgerData?.branchName || user?.branchName || (branches.find(b => b._id === selectedBranch)?.name) || 'Branch';

  return (
    <div className="w-full pb-8 space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Branch Cash Ledger</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-brand-primary border border-emerald-200">
              <Building2 className="w-3.5 h-3.5" />
              {activeBranchName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Daily Day-Book (Rojmel) &amp; Live Cash in Hand Register</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto print:hidden">
          {isAdmin && (
            <div className="w-44 sm:w-52 cursor-pointer">
              <ThemeSelect 
                name="branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                options={branches.map(b => ({ value: b._id, label: `${b.name} (${b.code})` }))}
                placeholder="Select Branch"
                className="h-10 bg-white border-slate-300 rounded-[8px] text-xs sm:text-sm cursor-pointer shadow-xs"
              />
            </div>
          )}
          
          {/* Date Picker with proper width so dd/MM/yyyy is NEVER truncated */}
          <div className="w-44 sm:w-48">
            <DatePicker 
              value={format(date, 'yyyy-MM-dd')}
              onChange={(newDate) => {
                if (newDate) {
                  const parts = newDate.split('-');
                  if (parts.length === 3) {
                    setDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
                  } else {
                    setDate(new Date(newDate));
                  }
                }
              }}
              className="h-10 border-slate-300 rounded-[8px] text-xs sm:text-sm font-semibold shadow-xs"
            />
          </div>
          
          <Button 
            onClick={exportToPDF}
            variant="outline"
            className="h-10 px-3.5 rounded-[8px] border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs whitespace-nowrap"
            title="Download PDF"
          >
            <Printer className="w-4 h-4 mr-1.5 text-rose-500" />
            PDF
          </Button>

          <Button 
            onClick={exportToExcel}
            variant="outline"
            className="h-10 px-3.5 rounded-[8px] border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs whitespace-nowrap"
            title="Export Excel"
          >
            <Download className="w-4 h-4 mr-1.5 text-emerald-600" />
            EXCEL
          </Button>
          
          <Button 
            onClick={() => setIsVoucherOpen(true)}
            className="h-10 px-4 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs whitespace-nowrap transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Voucher
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-primary mb-3"></div>
          <p className="text-xs font-semibold text-slate-500">Loading live cash ledger...</p>
        </div>
      ) : ledgerData ? (
        <>
          {/* 4 Premium Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Opening Balance Card */}
            <Card className="border border-slate-200/80 shadow-xs hover:shadow-sm transition-all bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Opening Balance</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">{formatCurrency(ledgerData.openingBalance)}</h3>
                  <span className="text-[10.5px] font-medium text-slate-400">Previous day closing</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Cash In Card */}
            <Card className="border border-emerald-100/90 shadow-xs hover:shadow-sm transition-all bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Cash In</p>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-600 truncate">+{formatCurrency(ledgerData.totalIn)}</h3>
                  <span className="text-[10.5px] font-medium text-emerald-600/80">Paid LR &amp; Collections</span>
                </div>
              </CardContent>
            </Card>

            {/* Cash Out Card */}
            <Card className="border border-rose-100/90 shadow-xs hover:shadow-sm transition-all bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Total Cash Out</p>
                  <h3 className="text-xl sm:text-2xl font-black text-rose-600 truncate">-{formatCurrency(ledgerData.totalOut)}</h3>
                  <span className="text-[10.5px] font-medium text-rose-600/80">Advances &amp; Expenses</span>
                </div>
              </CardContent>
            </Card>

            {/* Closing Balance (Flagship Highlight Card) */}
            <Card className="border border-emerald-300 shadow-xs hover:shadow-sm transition-all bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">Closing Balance</p>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-primary truncate">{formatCurrency(ledgerData.closingBalance)}</h3>
                  <span className="text-[10.5px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Cash in Hand
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Register Table */}
          <Card className="border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 py-3.5 px-6 flex justify-between items-center flex-row">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-primary" />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-800">
                  Daily Transactions &bull; {format(date, 'dd MMMM yyyy')}
                </CardTitle>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200/80 px-2.5 py-1 rounded-md shadow-2xs">
                {ledgerData.transactions.length} Entry(ies)
              </span>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 whitespace-nowrap">Time</th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Type</th>
                    <th className="px-6 py-3.5">Description (Vigat)</th>
                    <th className="px-6 py-3.5 text-right whitespace-nowrap">Cash In (+)</th>
                    <th className="px-6 py-3.5 text-right whitespace-nowrap">Cash Out (-)</th>
                    <th className="px-6 py-3.5 text-right whitespace-nowrap">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400">
                          <Receipt className="w-10 h-10 text-slate-300 mb-2.5" />
                          <p className="text-sm font-bold text-slate-700">No Transactions Found</p>
                          <p className="text-xs text-slate-500 mt-0.5">There were no cash inflows or outflows recorded on this date.</p>
                          <Button 
                            onClick={() => setIsVoucherOpen(true)}
                            size="sm"
                            className="mt-3.5 h-8 px-3 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Voucher
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ledgerData.transactions.map((txn: any) => (
                      <tr key={txn._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {format(new Date(txn.date), 'hh:mm a')}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          {getReferenceTypeBadge(txn.referenceType)}
                        </td>
                        <td className="px-6 py-3.5 text-slate-800 font-semibold text-xs sm:text-sm">
                          {txn.description}
                        </td>
                        <td className="px-6 py-3.5 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                          {txn.type === 'credit' ? `+${formatCurrency(txn.amount)}` : '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right font-black text-rose-600 text-sm whitespace-nowrap">
                          {txn.type === 'debit' ? `-${formatCurrency(txn.amount)}` : '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right font-black text-slate-900 text-sm whitespace-nowrap bg-slate-50/30">
                          {formatCurrency(txn.balanceAfter)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200/80 p-6">
          <Wallet className="w-12 h-12 text-slate-300 mb-2.5" />
          <h3 className="text-base font-bold text-slate-800">No Branch Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-0.5">Please select a branch from the dropdown above to view its cash ledger and transactions.</p>
        </div>
      )}

      {/* Add Manual Voucher Modal (Theme-Synced) */}
      <Dialog open={isVoucherOpen} onOpenChange={setIsVoucherOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-6 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-brand-primary" />
              Add Manual Cash Voucher
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVoucherSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Voucher Type</Label>
              <select 
                value={voucherForm.type}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full h-10 border border-slate-300 rounded-[8px] px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
              >
                <option value="debit">Cash Out (-) Office Expense / Diesel / Hamali</option>
                <option value="credit">Cash In (+) Deposit / Cash Received</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Amount (₹) <span className="text-red-500">*</span></Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={voucherForm.amount}
                  onChange={(e) => setVoucherForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-9 h-10 border-slate-300 rounded-[8px] focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-slate-800"
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Description (Vigat) <span className="text-red-500">*</span></Label>
              <Textarea 
                required
                value={voucherForm.description}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] border-slate-300 rounded-[8px] focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none text-xs sm:text-sm font-medium"
                placeholder="e.g. Tea & Snacks, Godown Hamali, Driver advance, Stationery..."
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsVoucherOpen(false)}
                className="h-9 px-4 rounded-[8px] border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="h-9 px-5 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Voucher'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
