'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Phone, ArrowLeft, Printer, Download, Mail, ReceiptText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientLedger({ client, invoices }: { client: any, invoices: any[] }) {
  const router = useRouter();

  // Calculate Running Balance
  let runningBalance = 0;
  const ledgerEntries = invoices.map(inv => {
    const debit = inv.grandTotal || 0; // Billed Amount
    const credit = inv.amountPaid || 0; // Paid Amount
    runningBalance += (debit - credit);
    
    return {
      ...inv,
      debit,
      credit,
      runningBalance
    };
  });

  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const currentBalance = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">{client.name} - Ledger</h1>
          <p className="text-brand-text-secondary mt-1">Statement of Account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-white md:col-span-2">
          <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-primary" /> Client Profile
            </CardTitle>
            <div className="flex gap-2 text-gray-500">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" /> Print Statement
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Company Name</span>
                <span className="font-bold text-gray-800">{client.name}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">GSTIN</span>
                <span className="font-medium text-gray-800">{client.gstin || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact</span>
                <span className="font-medium text-gray-800 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" /> {client.phone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Billing Address</span>
                <span className="font-medium text-gray-800">{client.address || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-brand-primary/5 to-brand-primary/10">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Outstanding Due</h3>
            <div className="text-4xl font-black text-brand-primary mb-4">
              ₹{currentBalance.toLocaleString('en-IN')}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Billed:</span>
                <span className="font-bold text-gray-800">₹{totalBilled.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Amount Received:</span>
                <span className="font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white print:shadow-none print:m-0 print:p-0">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-brand-primary" /> Account Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="font-semibold p-4">Date</th>
                  <th className="font-semibold p-4">Particulars</th>
                  <th className="font-semibold p-4 text-right">Debit (₹)</th>
                  <th className="font-semibold p-4 text-right">Credit (₹)</th>
                  <th className="font-semibold p-4 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No transactions recorded for this client.</td>
                  </tr>
                ) : ledgerEntries.map((entry, idx) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {new Date(entry.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-brand-primary">Invoice #{entry.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{entry.bookings?.length || 0} Trips Included</div>
                    </td>
                    <td className="p-4 text-right font-semibold text-gray-800">
                      {entry.debit > 0 ? entry.debit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="p-4 text-right font-semibold text-green-600">
                      {entry.credit > 0 ? entry.credit.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="p-4 text-right font-bold text-brand-primary">
                      {entry.runningBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={2} className="p-4 text-right font-bold text-gray-600">Closing Balance:</td>
                  <td className="p-4 text-right font-bold text-gray-800">{totalBilled.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-right font-bold text-green-600">{totalPaid.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-right font-black text-brand-primary text-lg">₹{currentBalance.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
