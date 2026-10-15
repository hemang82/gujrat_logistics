import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, FileText, User, MapPin, Calendar, CheckCircle2, Clock, Printer, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/dateUtils';

export default async function LorryHireDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const lorryHire = await LorryHire.findById(id)
    .populate('fromBranch', 'name code')
    .populate('toBranch', 'name code')
    .populate('truckNo', 'vehicleNumber vehicleType')
    .populate('driver', 'name phone')
    .populate('balancePaidBy', 'name code')
    .populate({
      path: 'challans',
      populate: [
        { path: 'bookings', model: 'Booking' },
        { path: 'memoDestinationBranch', model: 'Branch', select: 'name code' }
      ]
    })
    .lean() as any;

  if (!lorryHire) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-xs border border-red-100 max-w-md mx-auto mt-10">
        <p className="text-red-500 font-bold text-base mb-3">Lorry Hire Voucher not found</p>
        <Link href="/admin/lorry-hire">
          <Button variant="outline" size="sm">Back to List</Button>
        </Link>
      </div>
    );
  }

  const challans = lorryHire.challans || [];

  return (
    <div className="w-full mx-auto space-y-4 pb-12">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white py-3 px-4 rounded-xl shadow-xs border border-slate-200/90 gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/lorry-hire">
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0 rounded-lg shrink-0 text-slate-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors border border-slate-200"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">View Lorry Hire Voucher</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Voucher details, assigned challans & financials</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/lorry-hire/${id}/edit`}>
            <Button variant="outline" className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              Edit Voucher
            </Button>
          </Link>
          <Link href={`/admin/lorry-hire/${id}/print`} target="_blank">
            <Button className="h-8 px-3.5 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Printer className="w-3.5 h-3.5" />
              Print Voucher
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Single Sheet Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200/90 space-y-6">
        
        {/* Banner / Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-brand-primary/20 text-brand-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">Voucher No:</h2>
                <span className="text-base font-black text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-md border border-brand-primary/20">
                  {lorryHire.voucherNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date: <span className="font-bold text-slate-700">{formatDate(lorryHire.date)}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right sm:block flex items-center justify-between w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize inline-flex items-center gap-1 border mt-0.5
                ${lorryHire.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'}
              `}>
                {lorryHire.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                {lorryHire.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. TOP SECTION: Assigned Challans & Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Challans List (Takes 2 Columns) */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  Assigned Challans ({challans.length})
                </span>
              </div>
            </div>

            {challans.length > 0 ? (
              <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/90">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200/90 font-bold">Challan No</th>
                      <th className="py-2.5 px-3 border-r border-slate-200/90 font-bold">Station</th>
                      <th className="py-2.5 px-3 border-r border-slate-200/90 text-center font-bold">LRs</th>
                      <th className="py-2.5 px-3 border-r border-slate-200/90 text-center font-bold">Articles</th>
                      <th className="py-2.5 px-3 border-r border-slate-200/90 text-center font-bold">Weight</th>
                      <th className="py-2.5 px-3 text-right font-bold">Freight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {challans.map((c: any) => {
                      const totalPackages = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0;
                      const totalWeight = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0;
                      const totalLRFreight = c.bookings?.reduce((acc: number, b: any) => acc + (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0), 0) || 0;
                      return (
                        <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3 font-bold text-brand-primary border-r border-slate-100">CH-{c.challanNumber}</td>
                          <td className="py-2 px-3 font-bold text-slate-700 capitalize border-r border-slate-100">{c.memoDestinationBranch?.name || c.memoDestinationBranch?.code || 'N/A'}</td>
                          <td className="py-2 px-3 font-bold text-slate-800 text-center border-r border-slate-100">{c.bookings?.length || 0}</td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 font-semibold text-slate-700">{totalPackages}</td>
                          <td className="py-2 px-3 text-center border-r border-slate-100 font-semibold text-slate-700">{totalWeight}</td>
                          <td className="py-2 px-3 font-bold text-slate-800 text-right">₹{totalLRFreight.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 font-bold text-slate-600 border-r border-slate-200/90 text-[11px]">Total:</td>
                      <td className="py-2 px-3 font-black text-slate-900 text-center border-r border-slate-200/90">
                        {challans.reduce((acc: number, c: any) => acc + (c.bookings?.length || 0), 0)}
                      </td>
                      <td className="py-2 px-3 font-black text-slate-900 text-center border-r border-slate-200/90">
                        {challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0), 0)}
                      </td>
                      <td className="py-2 px-3 font-black text-brand-primary text-center border-r border-slate-200/90">
                        {challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0), 0)}
                      </td>
                      <td className="py-2 px-3 font-black text-brand-primary text-right">
                        ₹{challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0), 0) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No Challans attached to this Lorry Hire.
              </div>
            )}
          </div>

          {/* Financials Summary (Right Side Box) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  Financial Summary
                </span>
              </div>
            </div>

            <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="py-2.5 px-3.5 text-slate-600 font-semibold">Total Amount</td>
                    <td className="py-2.5 px-3.5 text-right font-black text-slate-900">
                      ₹ {Number(lorryHire.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-3.5 text-slate-600 font-semibold">Advance Amount</td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-emerald-600">
                      ₹ {Number(lorryHire.advanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {Number(lorryHire.commission || 0) > 0 && (
                    <tr className="bg-white">
                      <td className="py-2.5 px-3.5 text-slate-600 font-semibold">Commission</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-rose-600">
                        - ₹ {Number(lorryHire.commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {Number(lorryHire.hamali || 0) > 0 && (
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-semibold">Hamali</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-800">
                        + ₹ {Number(lorryHire.hamali || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {Number(lorryHire.tds || 0) > 0 && (
                    <tr className="bg-white">
                      <td className="py-2.5 px-3.5 text-slate-600 font-semibold">TDS</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-800">
                        ₹ {Number(lorryHire.tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/80 border-t-2 border-emerald-300">
                    <td className="py-3 px-3.5 text-slate-800 font-black text-xs uppercase">Balance Amount</td>
                    <td className="py-3 px-3.5 text-right font-black text-emerald-800 text-sm">
                      ₹ {Number(lorryHire.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {lorryHire.balancePaidBy && (
                    <tr className="bg-white">
                      <td className="py-2 px-3.5 text-slate-500 font-semibold text-[11px]">Balance Payable At</td>
                      <td className="py-2 px-3.5 text-right font-bold text-slate-700 text-[11px] uppercase">
                        {lorryHire.balancePaidBy.name} ({lorryHire.balancePaidBy.code})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 2. BOTTOM SECTION: Clean Document Meta Table */}
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-4 space-y-3">
            {/* 5 Primary Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs pb-3 border-b border-slate-200/60">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From Branch</span>
                <p className="font-bold text-slate-800 text-xs">{lorryHire.fromBranch?.name || 'N/A'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To Branch</span>
                <p className="font-bold text-slate-800 text-xs">{lorryHire.toBranch?.name || 'N/A'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Truck / Vehicle</span>
                <p className="font-black text-slate-900 text-xs tracking-wide">{lorryHire.truckNo?.vehicleNumber || 'N/A'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Driver</span>
                <p className="font-bold text-slate-800 text-xs">{lorryHire.driver?.name || 'Not Specified'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Balance Paid By</span>
                <p className="font-bold text-slate-800 text-xs">{lorryHire.balancePaidBy?.name || 'Not Specified'}</p>
              </div>
            </div>

            {/* Remark / Notes Full Width - Never Truncates */}
            <div className="text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Remark / Notes</span>
              <p className="font-medium text-slate-700 text-xs italic whitespace-pre-wrap leading-relaxed">
                {lorryHire.remark || 'None'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
