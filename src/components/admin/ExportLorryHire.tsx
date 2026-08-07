'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { format } from 'date-fns';

export default function ExportLorryHire({ search = '', status = '', date = '' }: { search?: string, status?: string, date?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const fetchExportData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (date) params.set('date', date);
      
      params.set('limit', '1000');

      const res = await fetch(`/api/admin/lorry-hire?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const data = await res.json();
      if (!data.lorryHires || data.lorryHires.length === 0) {
        toast.error('No lorry hires found for export');
        return null;
      }

      const headers = [
        'Date', 'Voucher No', 'Truck No', 'From Branch', 'To Branch', 
        'Lorry Hire Amt', 'Advance', 'Balance', 'Paid By', 'Status'
      ];
      
      const rows = data.lorryHires.map((v: any) => {
        let destinationName = '';
        if (v.challans && v.challans.length > 0) {
          const uniqueDestinations = [...new Set(v.challans.map((ch: any) => ch.memoDestinationBranch?.name).filter(Boolean))];
          if (uniqueDestinations.length > 0) {
            destinationName = uniqueDestinations.join(', ');
          }
        }
        if (!destinationName) {
          destinationName = v.toBranch?.name || '';
        }

        return [
          new Date(v.date).toLocaleDateString('en-IN'),
          v.voucherNo,
          v.truckNo?.vehicleNumber || '',
          v.fromBranch?.name || '',
          destinationName || '',
          v.hireAmount || 0,
          v.advanceAmount || 0,
          v.balanceAmount || 0,
          v.balancePaidBy?.name || '',
          v.status || 'pending'
        ];
      });

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
      await exportToStyledExcel('LorryHire_Export', data.headers, data.rows);
    }
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const data = await fetchExportData();
    if (data) {
      const truncate = (str: string, len: number) => {
        if (!str) return '';
        const s = String(str);
        return s.length > len ? s.substring(0, len) + '...' : s;
      };

      const pdfRows = data.rows.map((row: any[]) => {
        const newRow = [...row];
        newRow[3] = truncate(newRow[3] as string, 12);
        newRow[4] = truncate(newRow[4] as string, 12);
        return newRow;
      });

      exportToStyledPDF(
        `Lorry Hire Report - ${format(new Date(), 'dd/MM/yyyy')}`, 
        'LorryHire_Export', 
        data.headers, 
        pdfRows,
        { fontSize: 7 }
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
        Excel
      </Button>
    </>
  );
}
