import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import LorryHire from '@/models/LorryHire';
import { Truck } from 'lucide-react';
import PrintButton from '@/components/admin/PrintButton';

export default async function LorryHirePrintPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="w-full mx-auto pb-10 print:p-0 print:m-0 print:max-w-none bg-white">
      
      {/* Top Actions - Hidden in Print */}
      <div className="flex justify-end print:hidden mb-6 p-4">
        <PrintButton />
      </div>

      {/* A4 Paper Format for Print */}
      <div 
        className="bg-white p-8 md:p-12 shadow-sm border border-gray-200 print:shadow-none print:m-0 print:w-full print:border-none mx-auto max-w-4xl" 
        id="print-area"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', minHeight: '29.7cm' }}
      >
        
        {/* Header Section */}
        <div className="flex flex-col border-b-2 border-brand-primary pb-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shrink-0">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary uppercase tracking-wide">GUJARAT LOGISTIC</h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Fast, Safe & Reliable Transport Services</p>
                <p className="text-xs text-gray-400 mt-1">H.O: Ahmedabad, Gujarat, India</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-primary uppercase">LORRY HIRE VOUCHER</h2>
            </div>
          </div>
        </div>

        {/* Voucher Meta details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Voucher No</p>
            <p className="font-bold text-base text-gray-800">{lorryHire.voucherNo}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Date</p>
            <p className="font-bold text-base text-gray-800">{new Date(lorryHire.date).toLocaleDateString('en-IN')}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Truck No</p>
            <p className="font-bold text-base text-gray-800">{lorryHire.truckNo?.vehicleNumber || 'N/A'}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Status</p>
            <p className="font-bold text-base text-gray-800 capitalize">{lorryHire.status || 'Pending'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-wider">From Branch</p>
            <p className="font-bold text-lg text-gray-900">{lorryHire.fromBranch?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{lorryHire.fromBranch?.code || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-wider">To Branch</p>
            <p className="font-bold text-lg text-gray-900">{lorryHire.toBranch?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{lorryHire.toBranch?.code || 'N/A'}</p>
          </div>
        </div>

        {/* Challans List */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-2 mb-4">Assigned Challans</h3>
          <table className="w-full text-sm text-left border-collapse border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wide">
              <tr>
                <th className="py-2.5 px-3 border border-gray-200">Challan No</th>
                <th className="py-2.5 px-3 border border-gray-200">Station</th>
                <th className="py-2.5 px-3 border border-gray-200 text-center">LRs</th>
                <th className="py-2.5 px-3 border border-gray-200 text-center">Articles</th>
                <th className="py-2.5 px-3 border border-gray-200 text-center">Weight</th>
                <th className="py-2.5 px-3 border border-gray-200 text-right">Freight</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c: any, index: number) => {
                const totalPackages = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0;
                const totalWeight = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0;
                return (
                  <tr key={c._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-2.5 px-3 border border-gray-200 font-bold">CH-{c.challanNumber}</td>
                    <td className="py-2.5 px-3 border border-gray-200 font-semibold uppercase">{c.memoDestinationBranch?.name || c.memoDestinationBranch?.code || 'N/A'}</td>
                    <td className="py-2.5 px-3 border border-gray-200 text-center font-medium">{c.bookings?.length || 0}</td>
                    <td className="py-2.5 px-3 border border-gray-200 text-center">{totalPackages}</td>
                    <td className="py-2.5 px-3 border border-gray-200 text-center">{totalWeight}</td>
                    <td className="py-2.5 px-3 border border-gray-200 text-right font-semibold text-gray-800">
                      {c.truckFreight ? `₹${c.truckFreight.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                );
              })}
              {challans.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">No challans found</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-100 font-bold border-t border-gray-300">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 border border-gray-200">TOTAL</td>
                <td className="py-2.5 px-3 border border-gray-200 text-center">
                  {challans.reduce((acc: number, c: any) => acc + (c.bookings?.length || 0), 0)}
                </td>
                <td className="py-2.5 px-3 border border-gray-200 text-center">
                  {challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0), 0)}
                </td>
                <td className="py-2.5 px-3 border border-gray-200 text-center">
                  {challans.reduce((acc: number, c: any) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0), 0)}
                </td>
                <td className="py-2.5 px-3 border border-gray-200 text-right">
                  {(() => {
                    const totalFreight = challans.reduce((acc: number, c: any) => acc + (c.truckFreight || 0), 0);
                    return totalFreight > 0 ? `₹${totalFreight.toLocaleString()}` : '-';
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Financials & Remarks */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="border border-gray-200 rounded-lg p-4 h-full">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">Remarks / Terms</h3>
              <p className="text-sm text-gray-600 italic whitespace-pre-line">
                {lorryHire.remark || '- Ensure safe and timely delivery.\n- Any damages will be recovered from balance payment.\n- Drive safely and follow all traffic rules.'}
              </p>
            </div>
          </div>
          <div>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td className="p-2 border border-gray-300 font-semibold text-gray-600 bg-gray-50 uppercase text-xs">Total Freight Amount</td>
                  <td className="p-2 border border-gray-300 text-right font-bold text-gray-900 text-base">₹ {Number(lorryHire.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-300 font-semibold text-gray-600 bg-gray-50 uppercase text-xs">Advance Paid</td>
                  <td className="p-2 border border-gray-300 text-right font-bold text-gray-900 text-base">₹ {Number(lorryHire.advanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                {Number(lorryHire.commission || 0) > 0 && (
                  <tr>
                    <td className="p-2 border border-gray-300 font-semibold text-gray-600 bg-gray-50 uppercase text-xs">Commission</td>
                    <td className="p-2 border border-gray-300 text-right font-bold text-gray-900 text-base">₹ {Number(lorryHire.commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
                {Number(lorryHire.hamali || 0) > 0 && (
                  <tr>
                    <td className="p-2 border border-gray-300 font-semibold text-gray-600 bg-gray-50 uppercase text-xs">Hamali</td>
                    <td className="p-2 border border-gray-300 text-right font-bold text-gray-900 text-base">₹ {Number(lorryHire.hamali || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
                {Number(lorryHire.tds || 0) > 0 && (
                  <tr>
                    <td className="p-2 border border-gray-300 font-semibold text-gray-600 bg-gray-50 uppercase text-xs">TDS</td>
                    <td className="p-2 border border-gray-300 text-right font-bold text-gray-900 text-base">₹ {Number(lorryHire.tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 border border-gray-300 font-bold text-gray-800 bg-gray-100 uppercase text-xs">Balance Amount</td>
                  <td className="p-2 border border-gray-300 text-right font-bold text-gray-900 text-lg bg-gray-100">₹ {Number(lorryHire.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            {lorryHire.balancePaidBy && (
              <p className="text-right text-xs text-gray-500 mt-2 font-semibold">
                Balance Payable At: <span className="uppercase text-gray-800">{lorryHire.balancePaidBy.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="flex justify-between items-end pt-24 pb-8">
          <div className="text-center w-48">
            <div className="border-b-2 border-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Lorry Owner / Driver Sign</p>
          </div>
          <div className="text-center w-48">
            <div className="border-b-2 border-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Authorized Signatory</p>
            <p className="text-[10px] text-gray-400 mt-1">For GUJARAT LOGISTIC</p>
          </div>
        </div>

      </div>
    </div>
  );
}
