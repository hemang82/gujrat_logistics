'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Truck, FileText, CheckCircle2, User, Landmark } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { formatDate } from '@/lib/dateUtils';

export default function ViewChallanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [challan, setChallan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useUserStore((state) => state.user);
  const canEdit = user?.role === 'superadmin' || user?.role === 'logistic' || user?.permissions?.challans?.canEdit !== false;
  const sessionLogisticName = user?.logisticName || 'Trust Logistic';

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

  const logisticName = challan?.logisticId?.name || sessionLogisticName;

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
    <div className="w-full h-full space-y-6 print:p-0 print:m-0">
      
      {/* Top Header - Screen Only */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.push('/admin/challans')}
            variant="outline"
            className="h-9 w-9 p-0 rounded-lg shrink-0 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">View Challan</h1>
            <p className="text-xs text-gray-500 mt-0.5">View lorry loading details</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          {canEdit && (
            <Link href={`/admin/challans/${id}/edit`}>
              <Button type="button" className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-1.5 transition-colors">Edit</Button>
            </Link>
          )}
          <Button type="button" onClick={handlePrint} className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium flex items-center gap-2 transition-colors"><Printer className="w-4 h-4" /> Print</Button>
        </div>
      </div>

      {/* Fillup Information - Screen Only */}
      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white print:hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-2.5 px-4">
          <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Fillup Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Branch</Label>
              <Input value={challan.branch?.name || challan.branch || 'ASL'} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Ch No</Label>
              <Input value={challan.challanNumber} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            <div className="space-y-1 sm:col-span-2 md:col-span-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Challan Date</Label>
              <Input value={formatDate(challan.challanDate).replace(/\//g, '-')} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Booking / Crossing</Label>
              <Input value={challan.bookingCrossing} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Destination Branch</Label>
              <Input value={challan.memoDestinationBranch?.name || challan.memoDestinationBranch || 'Select Branch'} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Truck No.</Label>
              <Input value={challan.truckNo?.vehicleNumber || challan.truckNo || 'N/A'} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 uppercase">Driver Name</Label>
              <Input value={challan.driverName?.name || challan.driverName || 'N/A'} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
            </div>
            {challan.agent && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 uppercase">Agent / Broker</Label>
                <Input value={challan.agent} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg font-bold text-slate-700" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Printable Sheet Area */}
      <div 
        className="bg-white print:p-0 print:m-0 print:w-full print:border-none"
        id="challan-print-area"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        
        {/* Header Title Section (Print Only) */}
        <div className="hidden print:block mb-4 border border-[#0F3B8C] bg-[#eef6fc]">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {/* Fallback text if logo image is not available, but styled like the GL logo */}
              <div className="w-14 h-14 rounded-full border-4 border-[#0F3B8C] flex items-center justify-center bg-white text-[#0F3B8C] font-black text-2xl tracking-tighter">
                GL
              </div>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-[#0F3B8C] tracking-wide mb-1 uppercase">{logisticName}</h1>
              <p className="text-[13px] text-[#0F3B8C] font-medium">1977, Gurukrupa Estate, Aslali Gam, Ahmedabad.</p>
            </div>
            <div className="w-16 h-16 shrink-0"></div> {/* Spacer for symmetry */}
          </div>
          <div className="flex justify-between items-center px-4 py-1 text-[#0F3B8C] text-[13px] font-bold">
            <div>GSTIN : 24AAXFG0652R1ZO</div>
            <div>Phone : 97734 82908</div>
          </div>
        </div>

        <div className="hidden print:block text-center mb-4">
          <h2 className="text-lg font-bold text-[#0F3B8C] uppercase tracking-widest">Challan</h2>
        </div>

        {/* Info Grid (Print Only) */}
        <div className="hidden print:grid grid-cols-2 gap-y-2 gap-x-12 px-4 mb-6 text-[14px] text-black">
          <div className="flex">
            <span className="w-24">From</span>
            <span className="mr-2">:</span>
            <span className="uppercase">{challan.branch?.name || challan.branch || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="w-24">Challan No</span>
            <span className="mr-2">:</span>
            <span className="uppercase">{challan.branch?.code || 'ASL'}-{challan.challanNumber}</span>
          </div>
          <div className="flex">
            <span className="w-24">Truck No</span>
            <span className="mr-2">:</span>
            <span className="uppercase">{challan.truckNo?.vehicleNumber || challan.truckNo || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="w-24">To</span>
            <span className="mr-2">:</span>
            <span className="uppercase">{challan.memoDestinationBranch?.name || challan.memoDestinationBranch || 'All Branches'}</span>
          </div>
          <div className="flex">
            <span className="w-24">Driver Name</span>
            <span className="mr-2">:</span>
            <span className="uppercase">{challan.driverName?.name || challan.driverName || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="w-24">Date</span>
            <span className="mr-2">:</span>
            <span>{formatDate(challan.challanDate).replace(/\//g, '-')}</span>
          </div>
        </div>

        {/* Loaded Lorry Receipts Table (Screen & Print) */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white mb-6 p-0 gap-0 print:border-none print:shadow-none print:rounded-none">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-2.5 px-4 print:bg-transparent print:border-none print:p-0 print:mb-2">
            <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Loaded Lorry Receipts (Bilty Details)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <table className="w-full text-left text-xs border-collapse print:border print:border-gray-300">
              <thead>
                <tr className="bg-gray-50 text-slate-700 font-bold uppercase tracking-wider print:bg-[#eef6fc] print:text-[#0F3B8C] print:border-b print:border-gray-300">
                  <th className="p-3 print:p-1.5 w-10 text-center border-r border-gray-200 print:border-gray-300">Sr.</th>
                  <th className="p-3 print:p-1.5 border-r border-gray-200 print:border-gray-300">LR No</th>
                  <th className="p-3 print:p-1.5 border-r border-gray-200 print:border-gray-300">Consignor</th>
                  <th className="p-3 print:p-1.5 border-r border-gray-200 print:border-gray-300">Consignee</th>
                  <th className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300">Pkgs</th>
                  <th className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300">Weight</th>
                  <th className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300">Freight</th>
                  <th className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-orange-600">To Pay</th>
                  <th className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-emerald-600">Paid</th>
                  <th className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-blue-600">T.B.B</th>
                  <th className="p-3 print:p-1.5">Station</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 bg-white print:divide-gray-300 print:text-gray-800">
                {challan.bookings?.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-gray-400 font-medium">No bookings loaded on this challan.</td>
                  </tr>
                ) : (
                  challan.bookings.map((b: any, idx: number) => {
                    const packages = b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
                    const weight = b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
                    const lrTotal = Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0;
                    const lrFreight = Number(b.charges?.freightAmount) || 0;
                    
                    return (
                      <tr key={b._id} className="hover:bg-blue-50/50 transition-colors print:border-b print:border-gray-300">
                        <td className="p-3 print:p-1.5 text-center text-gray-400 print:text-gray-600 border-r border-gray-50 print:border-gray-300">{idx + 1}</td>
                        <td className="p-3 print:p-1.5 font-bold text-brand-primary print:text-[#0F3B8C] border-r border-gray-50 print:border-gray-300">LR- {b.lrNumber}</td>
                        <td className="p-3 print:p-1.5 truncate print:whitespace-normal print:break-words max-w-[140px] print:max-w-none border-r border-gray-50 print:border-gray-300">{b.consignor?.name || 'N/A'}</td>
                        <td className="p-3 print:p-1.5 truncate print:whitespace-normal print:break-words max-w-[140px] print:max-w-none border-r border-gray-50 print:border-gray-300">{b.consignee?.name || 'N/A'}</td>
                        <td className="p-3 print:p-1.5 text-center border-r border-gray-50 print:border-gray-300">{packages}</td>
                        <td className="p-3 print:p-1.5 text-center border-r border-gray-50 print:border-gray-300">{weight} KG</td>
                        <td className="p-3 print:p-1.5 text-center border-r border-gray-50 print:border-gray-300 font-bold">₹{lrFreight}</td>
                        <td className="p-3 print:p-1.5 text-center border-r border-gray-50 print:border-gray-300 font-bold text-orange-600">
                          {b.paymentCondition === 'to_pay' ? `₹${lrTotal}` : '-'}
                        </td>
                        <td className="p-3 print:p-1.5 text-center border-r border-gray-50 print:border-gray-300 font-bold text-emerald-600">
                          {b.paymentCondition === 'paid' ? `₹${lrTotal}` : '-'}
                        </td>
                        <td className="p-3 print:p-1.5 text-center border-r border-gray-50 print:border-gray-300 font-bold text-blue-600">
                          {b.paymentCondition === 'tbb' ? `₹${lrTotal}` : '-'}
                        </td>
                        <td className="p-3 print:p-1.5 uppercase font-bold text-brand-primary">
                          {b.destinationBranch?.name || b.destinationBranch?.code || (b.deliveryLocation?.length !== 24 ? b.deliveryLocation : null) || 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Summary Row */}
                <tr className="bg-brand-primary/5 font-black text-gray-900 border-t-2 border-brand-primary/20 print:bg-[#eef6fc] print:text-[#0F3B8C] print:border-t-2 print:border-[#0F3B8C]">
                  <td colSpan={2} className="p-3 print:p-1.5 text-left uppercase text-xs border-r border-gray-200 print:border-gray-300">
                    Total LRs: <span className="text-brand-primary text-sm font-bold">{totalLrsCount}</span>
                  </td>
                  <td colSpan={2} className="p-3 print:p-1.5 text-right border-r border-gray-200 print:border-gray-300">TOTAL:</td>
                  <td className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-brand-primary font-bold text-sm">{totalPackages}</td>
                  <td className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-brand-primary font-bold text-sm">{totalWeight} KG</td>
                  <td className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-brand-primary font-bold text-sm">
                    ₹{challan.bookings?.reduce((acc: number, b: any) => acc + (Number(b.charges?.freightAmount) || 0), 0)}
                  </td>
                  <td className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-orange-600 font-bold text-sm">
                    ₹{challan.bookings?.reduce((acc: number, b: any) => acc + (b.paymentCondition === 'to_pay' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0)}
                  </td>
                  <td className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-emerald-600 font-bold text-sm">
                    ₹{challan.bookings?.reduce((acc: number, b: any) => acc + (b.paymentCondition === 'paid' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0)}
                  </td>
                  <td className="p-3 print:p-1.5 text-center border-r border-gray-200 print:border-gray-300 text-blue-600 font-bold text-sm">
                    ₹{challan.bookings?.reduce((acc: number, b: any) => acc + (b.paymentCondition === 'tbb' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0)}
                  </td>
                  <td className="p-3 print:p-1.5"></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Remarks Section */}
        {challan.remark && (
          <div className="mt-4">
            <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden bg-white print:border-none print:shadow-none">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-2 px-3 print:hidden">
                <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Remarks / Special Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-gray-700 font-medium italic">{challan.remark}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Signatures block */}
        <div className="grid grid-cols-3 gap-6 pt-16 mt-10 border-t border-gray-100 text-center text-xs font-semibold text-slate-700">
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
            <span className="uppercase text-brand-primary tracking-wider">For {logisticName}</span>
          </div>
        </div>

      </div>
    </div>
  );
}



