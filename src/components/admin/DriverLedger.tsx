'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeSelect } from '@/components/ui/theme-select';
import { ReceiptText, IndianRupee, ArrowDownUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DriverLedger({ driverId, transactions }: { driverId: string, transactions: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'advance_given',
    amount: '',
    description: ''
  });

  // Calculate Running Balance
  // Balance > 0 means Driver owes us. Balance < 0 means We owe driver.
  let runningBalance = 0;
  const ledgerEntries = transactions.map(txn => {
    let debit = 0; // We gave money to driver (Advance) OR driver returned money (Settled)
    let credit = 0; // Driver spent money (Expense) OR Driver earned (Salary)

    if (txn.type === 'advance_given') {
      debit = txn.amount;
      runningBalance += debit;
    } else if (txn.type === 'expense_reported' || txn.type === 'salary_paid') {
      credit = txn.amount;
      runningBalance -= credit;
    } else if (txn.type === 'settled') {
      credit = txn.amount; // Driver gives us back the balance, so it credits his account
      runningBalance -= credit;
    }

    return {
      ...txn,
      debit,
      credit,
      runningBalance
    };
  });

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });
      if (!res.ok) throw new Error('Failed to add transaction');
      
      setIsModalOpen(false);
      setFormData({ type: 'advance_given', amount: '', description: '' });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Driver Balance</h3>
          <div className={`text-4xl font-black ${runningBalance > 0 ? 'text-red-500' : 'text-green-600'}`}>
            ₹{Math.abs(runningBalance).toLocaleString('en-IN')}
          </div>
          <p className="text-sm font-medium mt-1 text-gray-500">
            {runningBalance > 0 ? 'Driver holds company money' : runningBalance < 0 ? 'Company owes driver money' : 'Account Settled'}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-xl bg-brand-primary text-white font-bold text-md">
          <ArrowDownUp className="w-5 h-5 mr-2" /> Add Transaction
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-brand-primary" /> Settlement Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="font-semibold p-4">Date</th>
                  <th className="font-semibold p-4">Particulars</th>
                  <th className="font-semibold p-4 text-center">Type</th>
                  <th className="font-semibold p-4 text-right">Debit (Given)</th>
                  <th className="font-semibold p-4 text-right">Credit (Spent)</th>
                  <th className="font-semibold p-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No transactions recorded.</td>
                  </tr>
                ) : ledgerEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {entry.description}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold uppercase">
                        {entry.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-red-500">
                      {entry.debit > 0 ? entry.debit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="p-4 text-right font-semibold text-green-600">
                      {entry.credit > 0 ? entry.credit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900">
                      {entry.runningBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Add Ledger Entry</h3>
            </div>
            <form onSubmit={handleTransaction} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Transaction Type</Label>
                <ThemeSelect 
                  name="type"
                  value={formData.type} 
                  onChange={(e: any) => setFormData({...formData, type: e.target.value})}
                  options={[
                    { value: 'advance_given', label: 'Advance Given to Driver (Debit)' },
                    { value: 'settled', label: 'Balance Returned by Driver (Credit)' },
                    { value: 'salary_paid', label: 'Salary Paid (Credit)' }
                  ]}
                  className="flex w-full h-12 bg-white rounded-xl border border-gray-200 px-3 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Amount (₹)</Label>
                <Input 
                  type="number" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                  required 
                  min="1"
                  className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary font-bold text-lg transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Description / Particulars</Label>
                <Input 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required 
                  placeholder="e.g. Trip advance for Mumbai"
                  className="mt-1 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold shadow-md">
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
