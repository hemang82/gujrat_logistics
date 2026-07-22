import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, FileText } from 'lucide-react';
import Link from 'next/link';

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
    return <div className="p-8 text-center text-red-500 font-semibold text-lg">Lorry Hire Voucher not found.</div>;
  }

  const challans = lorryHire.challans || [];

  return (
    <div className="w-full mx-auto space-y-6 pb-10">
      
      {/* Top Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/lorry-hire">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 p-0 rounded-lg shrink-0 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">View Lorry Hire</h1>
            <p className="text-xs text-gray-500 mt-0.5">View Lorry Hire Memo details</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href={`/admin/lorry-hire/${id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full h-10 rounded-xl bg-white text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Voucher
            </Button>
          </Link>
          <Link href={`/admin/lorry-hire/${id}/print`} className="flex-1 sm:flex-none">
            <Button className="w-full h-10 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center justify-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Voucher
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-brand-primary/20">
              <FileText className="w-7 h-7 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Lorry Hire Voucher</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Voucher No: <span className="text-brand-primary font-bold">{lorryHire.voucherNo}</span></p>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize inline-block border
              ${lorryHire.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
              ${lorryHire.status === 'completed' ? 'bg-green-50 text-emerald-700 border-green-200' : ''}
            `}>
              {lorryHire.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Date</p>
            <p className="font-semibold text-gray-800">{new Date(lorryHire.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Truck No</p>
            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-gray-400" />
              {lorryHire.truckNo?.vehicleNumber || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">From Branch</p>
            <p className="font-semibold text-gray-800">{lorryHire.fromBranch?.name || lorryHire.fromBranch?.code || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">To Branch</p>
            <p className="font-semibold text-gray-800">{lorryHire.toBranch?.name || lorryHire.toBranch?.code || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Challans List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Assigned Challans</h3>
            {challans.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wide border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Challan No</th>
                      <th className="py-3 px-4">Station</th>
                      <th className="py-3 px-4 text-center">LRs</th>
                      <th className="py-3 px-4 text-center">Articles</th>
                      <th className="py-3 px-4 text-center">Weight</th>
                      <th className="py-3 px-4 text-right">Freight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {challans.map((c: any) => {
                      const totalPackages = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0;
                      const totalWeight = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0;
                      return (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-brand-primary">CH-{c.challanNumber}</td>
                          <td className="py-3 px-4 font-semibold text-gray-700 uppercase">{c.memoDestinationBranch?.name || c.memoDestinationBranch?.code || 'N/A'}</td>
                          <td className="py-3 px-4 font-semibold text-gray-800 text-center">{c.bookings?.length || 0}</td>
                          <td className="py-3 px-4 text-center text-gray-700">{totalPackages}</td>
                          <td className="py-3 px-4 text-center text-gray-700">{totalWeight}</td>
                          <td className="py-3 px-4 font-semibold text-gray-800 text-right">₹{c.truckFreight?.toLocaleString() || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100/80 border-t border-gray-200">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 font-bold text-gray-800 uppercase tracking-wide">TOTAL</td>
                      <td className="py-3 px-4 font-bold text-gray-800 text-center">
                        {challans.reduce((acc: number, c: any) => acc + (c.bookings?.length || 0), 0)}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800 text-center">
                        {challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0), 0)}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800 text-center">
                        {challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0), 0)}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-primary text-right">
                        ₹{challans.reduce((acc: number, c: any) => acc + (c.truckFreight || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm">
                No Challans attached to this Lorry Hire.
              </div>
            )}
          </div>

          {/* Financials Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Financial Summary</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="p-3 px-4 text-gray-500 font-medium">Total Freight Amount</td>
                    <td className="p-3 px-4 text-right font-bold text-gray-800">₹ {Number(lorryHire.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="bg-emerald-50/30">
                    <td className="p-3 px-4 text-gray-600 font-medium">Advance Paid</td>
                    <td className="p-3 px-4 text-right font-bold text-emerald-600">₹ {Number(lorryHire.advanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="bg-orange-50/30">
                    <td className="p-3 px-4 text-gray-600 font-medium">Balance Amount</td>
                    <td className="p-3 px-4 text-right font-bold text-orange-600">₹ {Number(lorryHire.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  {lorryHire.balancePaidBy && (
                    <tr className="bg-white">
                      <td className="p-3 px-4 text-gray-500 font-medium text-xs">Balance Payable At</td>
                      <td className="p-3 px-4 text-right font-semibold text-gray-700 text-xs uppercase">{lorryHire.balancePaidBy.name}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
