'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportBookingsButton({ search, date }: { search: string, date: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (date) params.set('date', date);

      const res = await fetch(`/api/admin/bookings/export?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data for export');
      
      const data = await res.json();
      if (!data.bookings || data.bookings.length === 0) {
        toast.error('No bookings found for export');
        setIsExporting(false);
        return;
      }

      const headers = ['Date', 'LR Number', 'Consignor', 'Consignee', 'From', 'To', 'Total Amount', 'Status'];
      const rows = data.bookings.map((b: any) => [
        new Date(b.bookingDate).toLocaleDateString('en-IN'),
        b.lrNumber,
        `"${(b.consignor?.name || '').replace(/"/g, '""')}"`,
        `"${(b.consignee?.name || '').replace(/"/g, '""')}"`,
        `"${(b.bookingBranch?.name || '').replace(/"/g, '""')}"`,
        `"${(b.deliveryLocation || '').replace(/"/g, '""')}"`,
        b.totalAmount || 0,
        b.status || 'Pending'
      ]);

      const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bookings_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export successful');
    } catch (error) {
      console.error(error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="text-gray-700 shadow-sm h-10 px-4 whitespace-nowrap border-gray-200 bg-white"
    >
      <Download className="w-4 h-4 mr-2 text-gray-500" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}
