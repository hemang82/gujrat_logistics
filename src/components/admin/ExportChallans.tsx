'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { exportToStyledExcel, exportToStyledPDF } from '@/lib/exportUtils';
import { format } from 'date-fns';

export default function ExportChallans({ search = '', status = '', branch = '', date = '' }: { search?: string, status?: string, branch?: string, date?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const fetchExportData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (branch) params.set('branch', branch);
      if (date) params.set('date', date);
      
      // Fetch up to 1000 challans for export to ensure we get most data without paging
      params.set('limit', '1000');

      const res = await fetch(`/api/admin/challans?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const data = await res.json();
      if (!data.challans || data.challans.length === 0) {
        toast.error('No challans found for export');
        return null;
      }

      const headers = [
        'Challan No', 'Date', 'From Branch', 'To Destination', 'Truck No', 
        'Driver Name', 'Total LRs', 'Total Pkgs', 'Total Weight', 'LR Total Amt',
        'Truck Freight', 'Advance', 'Commission', 'Balance Payable', 'Trip Profit', 'Remark', 'Status'
      ];
      
      const rows = data.challans.map((c: any) => {
        // Calculate totals from bookings
        const totalLrs = c.bookings?.length || 0;
        const totalPkgs = c.bookings?.reduce((acc: number, b: any) => {
          return acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 0);
        }, 0) || 0;
        const totalWeight = c.bookings?.reduce((acc: number, b: any) => {
          return acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0);
        }, 0) || 0;
        const lrTotalAmt = c.bookings?.reduce((acc: number, b: any) => {
          return acc + (b.charges?.totalAmount || b.charges?.freightAmount || 0);
        }, 0) || 0;

        const balancePayable = (c.truckFreight || 0) - (c.advanceAmount || 0) - (c.commission || 0);
        
        // Owner Insights
        const tripProfit = lrTotalAmt - (c.truckFreight || 0);

        return [
          `${c.branch?.code || 'GL'}-${c.challanNumber}`,
          new Date(c.challanDate).toLocaleDateString('en-IN'),
          c.branch?.name || '',
          c.memoDestinationBranch?.name || 'All Branches',
          c.truckNo?.vehicleNumber || '',
          c.driverName?.name || '',
          totalLrs,
          totalPkgs,
          totalWeight,
          lrTotalAmt,
          c.truckFreight || 0,
          c.advanceAmount || 0,
          c.commission || 0,
          balancePayable,
          tripProfit,
          c.remark || '',
          c.status || 'pending'
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
      await exportToStyledExcel('Challans_Export', data.headers, data.rows);
    }
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const data = await fetchExportData();
    if (data) {
      // Filter out Remark and Status for PDF so it fits better
      // In headers, Remark is at index 15, Status is 16
      const pdfHeaders = data.headers.slice(0, 15);
      
      const truncate = (str: string, len: number) => {
        if (!str) return '';
        const s = String(str);
        return s.length > len ? s.substring(0, len) + '...' : s;
      };

      const pdfRows = data.rows.map((row: any[]) => {
        const newRow = row.slice(0, 15);
        // Truncate From Branch (index 2)
        newRow[2] = truncate(newRow[2] as string, 12);
        // Truncate To Destination (index 3)
        newRow[3] = truncate(newRow[3] as string, 12);
        // Truncate Driver Name (index 5)
        newRow[5] = truncate(newRow[5] as string, 15);
        return newRow;
      });

      exportToStyledPDF(
        `Challans Report - ${format(new Date(), 'dd/MM/yyyy')}`, 
        'Challans_Export', 
        pdfHeaders, 
        pdfRows,
        { fontSize: 6.5 }
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
