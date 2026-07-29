'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, RefreshCcw, Database } from 'lucide-react';

interface ApiLog {
  _id: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
  apiType: string;
  requestData: string;
  responseStatus: 'success' | 'failed' | 'cached';
  errorMessage?: string;
  createdAt: string;
}

import { DatePicker } from '@/components/ui/date-picker';

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, totalPages: 1 });

  useEffect(() => {
    fetchLogs();
  }, [page]); // Re-fetch when page changes

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/api-logs?${params.toString()}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
      
      setLogs(data.logs || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <div className="w-max inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </div>
        );
      case 'cached':
        return (
          <div className="w-max inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Cached</span>
          </div>
        );
      case 'failed':
        return (
          <div className="w-max inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-[11px] font-semibold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </div>
        );
      default:
        return <span className="text-gray-500 text-xs">{status}</span>;
    }
  };

  const formatApiType = (type: string) => {
    if (type === 'EWAY_BILL_FETCH') return 'E-Way Bill Fetch';
    if (type === 'MASTERS_INDIA_TOKEN') return 'Auth Token';
    return type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Usage Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor E-Way bill API fetches and system token requests.</p>
        </div>
      </div>

      <Card className="p-4 bg-white border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search User or Bill No.</label>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <DatePicker 
              value={startDate}
              onChange={(d) => setStartDate(d)}
              placeholder="Select start date"
              className="w-full font-normal font-sans text-gray-700"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <DatePicker 
              value={endDate}
              onChange={(d) => setEndDate(d)}
              placeholder="Select end date"
              className="w-full font-normal font-sans text-gray-700"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="flex-shrink-0 px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
          >
            Apply Filters
          </button>
          <button 
            type="button"
            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setPage(1); }}
            className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </form>
      </Card>

      {error ? (
        <Card className="p-6 bg-red-50 border-red-100">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-gray-200 shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">User / System</th>
                  <th className="px-6 py-4">API Type</th>
                  <th className="px-6 py-4">Searched Data</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Loading API logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No API logs found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{format(new Date(log.createdAt), 'dd MMM yyyy')}</span>
                          <span className="text-gray-500">{format(new Date(log.createdAt), 'hh:mm a')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.userId ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{log.userId.name || 'Unknown User'}</span>
                            <span className="text-xs text-gray-500 capitalize">{log.userId.role || 'Staff'}</span>
                          </div>
                        ) : (
                          <span className="font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs">System Background</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {formatApiType(log.apiType)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {log.requestData}
                        </span>
                        {log.responseStatus === 'failed' && log.errorMessage && (
                          <p className="text-xs text-red-500 mt-1 truncate max-w-xs" title={log.errorMessage}>
                            {log.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.responseStatus)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {!loading && pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{((page - 1) * pagination.limit) + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-gray-900">{pagination.total}</span> entries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
