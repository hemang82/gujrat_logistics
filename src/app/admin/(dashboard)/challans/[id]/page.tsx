'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Truck, FileText, CheckCircle2, User, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function ViewChallanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [challan, setChallan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChallan() {
      try {
        const res = await fetch(`/api/admin/challans/${id}`);
        if (!res.ok) throw new Error('Challan not found');
        const data = await res.json();
        setChallan(data);
      } catch (error) {
        toast.error('Could not load Challan details');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchChallan();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Challan details...</div>;
  }

  if (!challan) {
    return (
      <div className="p-8 text-center text-gray-500 space-y-4">
        <p>Challan not found.</p>
        <Button onClick={() => router.push('/admin/challans')}>Back to Challans</Button>
      </div>
    );
  }

  // Calculate totals
  const totalLrsCount = challan.bookings?.length || 0;
  const totalPackages = challan.bookings?.reduce((acc: number, b: any) => {
    return acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 0);
  }, 0) || 0;
  const totalWeight = challan.bookings?.reduce((acc: number, b: any) => {
    return acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0);
  }, 0) || 0;

  return (
    <div className="w-full pb-8 max-w-5xl mx-auto space-y-5 print:p-0 print:m-0 print:max-w-none">
      
      {/* Top action controls - Hidden on Print */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/admin/challans')} 
            className="h-9 px-3 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/challans/${id}/edit`}>
            <Button 
              variant="outline"
              className="h-9 px-3.5 rounded-lg border-gray-200 hover:text-brand-primary"
            >
              Edit Challan
            </Button>
          </Link>
          <Button 
            type="button" 
            onClick={handlePrint}
            className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Challan
          </Button>
        </div>
      </div>

      {/* Printable Sheet Area */}
      <div 
        className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:m-0 print:w-full print:border-none"
        id="challan-print-area"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        
        {/* Header Title Section */}
        <div className="flex flex-col border-b-2 border-brand-primary pb-5 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase">GUJARAT LOGISTICS</h1>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Lorry Loading challan / manifest</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-lg font-black text-brand-primary uppercase">Challan No: #{challan.challanNumber}</h2>
              <p className="text-xs text-gray-500 font-bold mt-0.5">Date: {new Date(challan.challanDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6 text-sm border border-gray-100">
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Origin Branch</span>
            <span className="font-bold text-gray-800 uppercase">{challan.branch}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Memo Destination</span>
            <span className="font-bold text-gray-800 uppercase">{challan.memoDestinationBranch || 'All Branches'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Truck No</span>
            <span className="font-extrabold text-brand-primary uppercase">{challan.truckNo?.vehicleNumber || challan.truckNo || 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Driver Name</span>
            <span className="font-bold text-gray-800 uppercase">{challan.driverName?.name || challan.driverName || 'N/A'}</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">All / Branchwise</span>
            <span className="font-semibold text-gray-700">{challan.allBranchwise}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Booking / Crossing</span>
            <span className="font-semibold text-gray-700">{challan.bookingCrossing}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Selective / Default</span>
            <span className="font-semibold text-gray-700">{challan.selectiveDefault}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-extrabold block">Agent Link</span>
            <span className="font-semibold text-gray-700">{challan.agent || 'Direct Dispatch'}</span>
          </div>
        </div>

        {/* Loaded Lorry Receipts Table */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider pl-1">
            Loaded Lorry Receipts (Bilty Details)
          </h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-3 w-10 text-center">Sr.</th>
                  <th className="p-3">LR Number</th>
                  <th className="p-3">Consignor</th>
                  <th className="p-3">Consignee</th>
                  <th className="p-3 text-center">Packages</th>
                  <th className="p-3 text-center">Weight</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3 text-right">Freight Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {challan.bookings?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">No bookings loaded on this challan.</td>
                  </tr>
                ) : (
                  challan.bookings.map((b: any, idx: number) => {
                    const packages = b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
                    const weight = b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
                    return (
                      <tr key={b._id} className="hover:bg-gray-50/30">
                        <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-brand-primary">#{b.lrNumber}</td>
                        <td className="p-3 truncate max-w-[140px]">{b.consignor?.name || 'N/A'}</td>
                        <td className="p-3 truncate max-w-[140px]">{b.consignee?.name || 'N/A'}</td>
                        <td className="p-3 text-center">{packages}</td>
                        <td className="p-3 text-center">{weight} KG</td>
                        <td className="p-3 uppercase">{b.deliveryLocation || b.destinationBranch || 'N/A'}</td>
                        <td className="p-3 text-right font-bold">₹{(b.charges?.freightAmount || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}

                {/* Summary Row */}
                <tr className="bg-gray-50 font-black text-gray-800 border-t-2 border-gray-200">
                  <td colSpan={4} className="p-3 text-right">TOTAL LOAD:</td>
                  <td className="p-3 text-center">{totalPackages}</td>
                  <td className="p-3 text-center">{totalWeight} KG</td>
                  <td></td>
                  <td className="p-3 text-right font-extrabold text-brand-primary">
                    ₹{challan.bookings?.reduce((acc: number, b: any) => acc + (b.charges?.freightAmount || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial manifest and summary block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Remarks Card */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-1">
            <span className="text-xs text-gray-400 uppercase font-extrabold">Remarks / Special Instructions</span>
            <p className="text-xs text-gray-700 font-semibold italic">{challan.remark || 'No special remarks recorded.'}</p>
          </div>

          {/* Money Breakdown table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden h-fit">
            <table className="w-full text-xs font-semibold">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500">Truck Freight:</td>
                  <td className="p-3 text-right font-bold text-gray-800">₹{challan.truckFreight?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500">Commission Charges (-):</td>
                  <td className="p-3 text-right font-bold text-red-600">₹{challan.commission?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500 font-bold">Advance Paid To Driver (-):</td>
                  <td className="p-3 text-right font-bold text-emerald-600">₹{challan.advanceAmount?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="bg-brand-primary text-white font-extrabold">
                  <td className="p-3.5 text-sm uppercase">Balance Payable:</td>
                  <td className="p-3.5 text-right text-base">
                    ₹{Math.max(0, (challan.truckFreight - challan.commission - challan.advanceAmount)).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures block */}
        <div className="grid grid-cols-3 gap-6 pt-16 mt-10 border-t border-gray-100 text-center text-xs font-bold text-gray-500">
          <div className="space-y-8">
            <div className="w-40 mx-auto border-b border-gray-300"></div>
            <span className="uppercase tracking-wider">Driver's Signature</span>
          </div>
          <div className="space-y-8">
            <div className="w-40 mx-auto border-b border-gray-300"></div>
            <span className="uppercase tracking-wider">Loaded By</span>
          </div>
          <div className="space-y-8">
            <div className="w-40 mx-auto border-b border-gray-300"></div>
            <span className="uppercase text-brand-primary tracking-wider">For Gujarat Logistics</span>
          </div>
        </div>

      </div>
    </div>
  );
}
