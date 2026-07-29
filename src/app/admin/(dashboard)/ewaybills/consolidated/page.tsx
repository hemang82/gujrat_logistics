'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileOutput, Plus, Loader2, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function CEWBListPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/ewaybills/consolidate');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBills(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch CEWBs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Master EWB?')) return;
    try {
      const res = await fetch(`/api/admin/ewaybills/consolidate/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted successfully');
      fetchBills();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consolidated E-Way Bills (CEWB)</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and generate master e-way bills for multiple parcels.</p>
        </div>
        <Link href="/admin/ewaybills/consolidated/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate New CEWB
          </Button>
        </Link>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">CEWB NO</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">VEHICLE NO</th>
                  <th className="px-6 py-4">FROM</th>
                  <th className="px-6 py-4">TOTAL EWBS</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                      Loading master bills...
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <FileOutput className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No Consolidated E-Way Bills found.</p>
                      <Link href="/admin/ewaybills/consolidated/new">
                        <Button variant="link" className="text-brand-primary mt-2">Generate your first CEWB</Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-brand-primary">
                        {bill.cEwbNo}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {bill.cEwbDate || new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 font-semibold text-xs uppercase tracking-wider">
                          {bill.vehicleNo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {bill.fromPlace ? `${bill.fromPlace} (${bill.fromState})` : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                          {bill.ewbNoDetails?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {bill.status === 'Active' ? (
                          <span className="inline-flex w-max items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex w-max items-center px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-700 text-[11px] font-semibold uppercase">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(bill._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
