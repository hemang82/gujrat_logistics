'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight, Phone, Building2, User, HelpCircle, CheckCircle2, Clock, Truck, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/demo-requests?search=${encodeURIComponent(search)}&status=${status}&page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      toast.error('Could not load demo requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, status, page, limit]);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    try {
      const res = await fetch(`/api/admin/demo-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Status updated');
      // Re-fetch to ensure sync
      fetchRequests();
    } catch (error) {
      toast.error('Could not update status');
      fetchRequests(); // Revert on failure
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete demo request from ${name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/demo-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Request deleted successfully.`);
        fetchRequests();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error}`);
      }
    } catch (error) {
      toast.error('Could not delete request.');
    }
  };

  return (
    <div className="w-full pb-8 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Demo Requests / Leads</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage incoming demo requests from the public website</p>
        </div>
      </div>

      {/* Table grid */}
      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="border-b border-gray-100 p-4 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">Requests List</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-9 w-full sm:w-40 rounded-xl border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary/50 shadow-sm bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Search requests..." 
                className="pl-9 h-9 rounded-xl border-gray-200 text-sm focus-visible:ring-brand-primary/50 shadow-sm"
              />
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100 uppercase tracking-wider font-bold">
                  <th className="p-4">Contact Detail</th>
                  <th className="p-4">Business Info</th>
                  <th className="p-4">Pain Point</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">Loading requests...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No demo requests found.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-extrabold text-gray-800">{req.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                          <Phone className="w-3 h-3" />
                          {req.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-primary" />
                          <span className="font-bold text-gray-800">{req.companyName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                          <Truck className="w-3 h-3" />
                          Fleet: {req.fleetSize || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        <div className="flex items-center gap-2 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                          <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="truncate">{req.painPoint}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <Select 
                          value={req.status || 'pending'} 
                          onValueChange={(val) => updateStatus(req._id, val)}
                        >
                          <SelectTrigger className={`h-8 text-xs font-bold border-none w-32 ${req.status === 'contacted' ? 'bg-blue-50 text-blue-700' : req.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending"><span className="flex items-center gap-2"><Clock className="w-3 h-3"/> Pending</span></SelectItem>
                            <SelectItem value="contacted"><span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> Contacted</span></SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => { setSelectedRequest(req); setIsDialogOpen(true); }}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/10 text-xs px-3"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Details
                          </Button>
                          <Button 
                            onClick={() => handleDelete(req._id, req.name)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-3"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 || totalCount > 10 ? (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-white gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">
                  Showing page {page} of {totalPages} ({totalCount} total)
                </span>
                <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                  <span className="text-xs text-gray-500 font-medium">Rows:</span>
                  <select 
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="h-8 rounded-md border-gray-200 text-xs px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
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
                  disabled={page === totalPages || totalPages === 0}
                  variant="outline" 
                  className="h-9 px-3 rounded-lg border-gray-200"
                >
                  Next <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Demo Request Details</DialogTitle>
            <DialogDescription>
              Full details submitted by the prospect.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedRequest.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Company</p>
                  <p className="font-medium text-gray-900">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">City / Location</p>
                  <p className="font-medium text-gray-900">{selectedRequest.city || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Fleet Size</p>
                  <p className="font-medium text-gray-900">{selectedRequest.fleetSize || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${selectedRequest.status === 'contacted' ? 'bg-blue-50 text-blue-700' : selectedRequest.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>
                    {selectedRequest.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Date Submitted</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRequest.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-2">Pain Point / Challenge</p>
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedRequest.painPoint}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
            {selectedRequest?.status === 'pending' && (
              <Button onClick={() => {
                updateStatus(selectedRequest._id, 'contacted');
                setIsDialogOpen(false);
              }} className="bg-brand-primary text-white">
                Mark as Contacted
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
