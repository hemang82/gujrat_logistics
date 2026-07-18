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
  IndianRupee
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';

export default function BranchLedgerPage() {
  const user = useUserStore(state => state.user);
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  
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
    if (!selectedBranch && !user?.branch) return;
    
    setIsLoading(true);
    try {
      const branchId = selectedBranch || user?.branch;
      const dateStr = date.toISOString().split('T')[0];
      
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
      toast.error('Description is required');
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

  return (
    <div className="w-full pb-8 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Branch Cash Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Daily Day-Book (Rojmel) for cash transactions</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                disabled
                className="bg-transparent text-sm font-medium text-gray-700 outline-none w-32 md:w-40 cursor-not-allowed opacity-70"
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="w-36">
            <DatePicker 
              value={date.toISOString()}
              onChange={(newDate) => setDate(new Date(newDate))}
              className="h-10"
            />
          </div>
          
          <Button 
            onClick={() => setIsVoucherOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white shadow-sm h-10 px-4 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Voucher
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : ledgerData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-gray-100 shadow-sm bg-blue-50/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Opening Balance</p>
                  <h3 className="text-xl font-bold text-gray-800">{formatCurrency(ledgerData.openingBalance)}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-100 shadow-sm bg-emerald-50/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Cash In</p>
                  <h3 className="text-xl font-bold text-emerald-600">+{formatCurrency(ledgerData.totalIn)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm bg-rose-50/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Cash Out</p>
                  <h3 className="text-xl font-bold text-rose-600">-{formatCurrency(ledgerData.totalOut)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm bg-indigo-50/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Closing Balance</p>
                  <h3 className="text-xl font-bold text-indigo-700">{formatCurrency(ledgerData.closingBalance)}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-6 flex justify-between items-center flex-row">
              <CardTitle className="text-base font-semibold text-gray-800">
                Transactions for {format(date, 'dd MMM yyyy')}
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 whitespace-nowrap">Time</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Cash In (+)</th>
                    <th className="px-6 py-3 text-right">Cash Out (-)</th>
                    <th className="px-6 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledgerData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No transactions found for this date.
                      </td>
                    </tr>
                  ) : (
                    ledgerData.transactions.map((txn: any) => (
                      <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {format(new Date(txn.date), 'hh:mm a')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                            {txn.referenceType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {txn.description}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                          {txn.type === 'credit' ? formatCurrency(txn.amount) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-rose-600">
                          {txn.type === 'debit' ? formatCurrency(txn.amount) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
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
      ) : null}

      {/* Add Voucher Modal */}
      <Dialog open={isVoucherOpen} onOpenChange={setIsVoucherOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Manual Voucher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVoucherSubmit} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Type</Label>
              <select 
                value={voucherForm.type}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full h-11 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              >
                <option value="debit">Cash Out (-) Expense</option>
                <option value="credit">Cash In (+) Deposit</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={voucherForm.amount}
                  onChange={(e) => setVoucherForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 rounded-lg focus:ring-brand-primary"
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Description (Vigat)</Label>
              <Textarea 
                required
                value={voucherForm.description}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] border-gray-200 rounded-lg focus:ring-brand-primary resize-none"
                placeholder="e.g. Tea & Snacks, Hamali, Owner deposit..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsVoucherOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-brand-primary hover:bg-brand-primary-dark">
                {isSaving ? 'Saving...' : 'Save Voucher'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
