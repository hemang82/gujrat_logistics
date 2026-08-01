'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Plus, Search,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, XCircle 
} from 'lucide-react';
import ListActions from '@/components/admin/ListActions';

export default function CrossingListPage() {
  const router = useRouter();
  
  const [challans, setChallans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/challans?search=${encodeURIComponent(search)}&status=${status}&page=${page}&limit=10&bookingCrossing=Crossing`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setChallans(data.challans || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      toast.error('Could not load crossing challans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, status, page]);

  const handleDelete = async (id: string, challanNumber: string) => {
    if (!confirm(`Are you sure you want to delete Crossing Challan No: ${challanNumber}? This will reset all loaded LRs back to pending.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/challans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Crossing Challan ${challanNumber} deleted successfully.`);
        fetchChallans();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error}`);
      }
    } catch (error) {
      toast.error('Could not delete crossing challan.');
    }
  };

  return (
    <div className="w-full pb-8 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Crossing Memos / Challans</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage crossing dispatches, agents, and local delivery memos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/admin/challans/crossing/new" className="w-full sm:w-auto">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full sm:w-auto px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Create Crossing Memo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Search Challan No, Agent, Destination Branch..." 
            className="pl-9 h-10 rounded-lg border-gray-200 text-sm focus-visible:ring-brand-primary/50 shadow-sm"
          />
        </div>
        <select 
          value={status} 
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary/50 shadow-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Table grid */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100 uppercase tracking-wider font-bold">
                  <th className="p-4">Challan No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Agent / Transporter</th>
                  <th className="p-4">Destination Branch</th>
                  <th className="p-4">Loaded LRs</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">Loading crossing memos...</td>
                  </tr>
                ) : challans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">No crossing memos found.</td>
                  </tr>
                ) : (
                  challans.map((ch) => (
                    <tr key={ch._id} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="p-4 font-extrabold text-brand-primary uppercase">
                        #{ch.challanNumber}
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">Branch: {ch.branch}</span>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">
                        {new Date(ch.challanDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {ch.agent || 'N/A'}
                      </td>
                      <td className="p-4 text-gray-700 font-bold">
                        {ch.memoDestinationBranch || 'N/A'}
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">To Branch: {ch.lrToBranch || 'All'}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
                          {ch.bookings?.length || 0} LRs loaded
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 border
                          ${ch.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                          ${ch.status === 'in_transit' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${ch.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                        `}>
                          {ch.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                          {ch.status === 'in_transit' && <AlertCircle className="w-3 h-3" />}
                          {ch.status === 'pending' && <XCircle className="w-3 h-3" />}
                          {ch.status === 'in_transit' ? 'In Transit' : ch.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ListActions
                          id={ch._id}
                          moduleName="challans"
                          viewUrl={`/admin/challans/${ch._id}`}
                          editUrl={`/admin/challans/crossing/${ch._id}/edit`}
                          onDeleted={fetchChallans}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-white">
              <span className="text-xs text-gray-500 font-medium">
                Showing page {page} of {totalPages} ({totalCount} total memos)
              </span>
              <div className="flex gap-1.5">
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  variant="outline" 
                  className="h-9 px-3 rounded-lg border-gray-200"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" /> Previous
                </Button>
                <Button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  variant="outline" 
                  className="h-9 px-3 rounded-lg border-gray-200"
                >
                  Next <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
