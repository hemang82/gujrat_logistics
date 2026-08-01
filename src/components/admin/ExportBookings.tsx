'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { format } from 'date-fns';

export default function ExportBookings({ search, date, destBranch }: { search: string, date: string, destBranch?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const fetchExportData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (date) params.set('date', date);
      if (destBranch) params.set('destBranch', destBranch);

      params.set('format', 'json');

      const res = await fetch(`/api/admin/bookings/export?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const data = await res.json();
      if (!data.bookings || data.bookings.length === 0) {
        toast.error('No bookings found for export');
        return null;
      }

      const headers = [
        'LR Number', 'Date', 'Sender Name', 'Sender Phone', 
        'Receiver Name', 'Receiver Phone', 'Pickup', 'Delivery', 
        'Item', 'Qty', 'Weight', 'Freight', 'Hamali', 'SurChg', 'GST', 'Total', 'Payment', 'Status'
      ];
      
      const rows = data.bookings.map((b: any) => [
        b.lrNumber || '',
        new Date(b.bookingDate).toLocaleDateString('en-IN'),
        b.consignor?.name || '',
        b.consignor?.phone || '',
        b.consignee?.name || '',
        b.consignee?.phone || '',
        b.pickupLocation || '',
        b.deliveryLocation || '',
        b.material?.itemName || '',
        b.material?.quantity || 0,
        b.material?.weight || 0,
        b.charges?.freightAmount || 0,
        b.charges?.hamali || 0,
        b.charges?.surCharge || 0,
        b.charges?.gstAmount || 0,
        b.charges?.totalAmount || 0,
        b.paymentCondition || '',
        b.status || 'pending'
      ]);

      return { headers, rows };
    } catch (error) {
      console.error(error);
      toast.error('Export failed');
      return null;
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    const data = await fetchExportData();
    if (data) {
      await exportToStyledExcel('Bookings_Export', data.headers, data.rows);
    }
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const data = await fetchExportData();
    if (data) {
      exportToStyledPDF(
        `Bookings Report - ${date || format(new Date(), 'dd/MM/yyyy')}`, 
        'Bookings_Export', 
        data.headers, 
        data.rows
      );
    }
    setIsExporting(false);
  };

  return (
    <>
      <Button 
        onClick={handleExportPDF}
        disabled={isExporting}
        variant="outline" 
        className="h-12 w-full sm:w-auto px-5 rounded-xl font-semibold shadow-sm border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <Printer className="w-5 h-5 text-red-500" />
        PDF
      </Button>
      
      <Button 
        onClick={handleExportExcel}
        disabled={isExporting}
        variant="outline" 
        className="h-12 w-full sm:w-auto px-5 rounded-xl font-semibold shadow-sm border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5 text-green-600" />
        EXCEL
      </Button>
    </>
  );
}
