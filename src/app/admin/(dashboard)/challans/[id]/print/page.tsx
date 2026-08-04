import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Challan from '@/models/Challan';
import { Truck, ArrowLeft, Printer } from 'lucide-react';
import PrintButton from '@/components/admin/PrintButton';
import Link from 'next/link';

export default async function PrintChallanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const challan = await Challan.findById(id)
    .populate({
      path: 'bookings',
      select: 'lrNumber bookingDate consignor consignee pickupLocation deliveryLocation charges items rateType destinationBranch weight pkg freight totalAmount',
      populate: { path: 'destinationBranch', select: 'name code' }
    })
    .populate('truckNo', 'vehicleNumber')
    .populate('driverName', 'name phone')
    .populate('branch', 'name code')
    .populate('lrToBranch', 'name code')
    .populate('memoDestinationBranch', 'name code')
    .lean();

  if (!challan) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Challan not found</h2>
        <Link href="/admin/challans" className="text-brand-primary mt-4 inline-block hover:underline">
          Return to Challans
        </Link>
      </div>
    );
  }

  const ch = challan as any;
  const bookings = ch.bookings || [];
  
  const totalPkg = bookings.reduce((acc: number, curr: any) => acc + (Number(curr.pkg) || 0), 0);
  const totalWeight = bookings.reduce((acc: number, curr: any) => acc + (Number(curr.weight) || 0), 0);
  const totalFreight = bookings.reduce((acc: number, curr: any) => acc + (Number(curr.freight) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white font-sans text-gray-900">
      
      {/* Non-printable Action Bar */}
      <div className="max-w-[21cm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 print:hidden">
        <Link href="/admin/challans">
          <button className="flex items-center gap-2 text-gray-600 hover:text-brand-primary font-medium text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        </Link>
        <div className="flex gap-3">
          <PrintButton />
        </div>
      </div>

      {/* Printable Area - A4 Size */}
      <div className="max-w-[21cm] mx-auto bg-white shadow-lg print:shadow-none min-h-[29.7cm] relative">
        <div className="p-8">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-brand-primary pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 print:border print:border-brand-primary">
                <Truck className="w-8 h-8 text-white print:text-brand-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-brand-text-primary uppercase tracking-wide m-0 leading-tight">TRUST LOGISTIC</h1>
                <p className="text-xs text-gray-500 font-semibold m-0">TRUCK CHALLAN / LORRY MEMO</p>
                <p className="text-[10px] text-gray-400 m-0">H.O: Ahmedabad, Gujarat, India</p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-xl font-bold text-brand-primary m-0">CHALLAN NO: {ch.branch?.code || 'GL'}-{ch.challanNumber}</h2>
              <p className="text-sm text-gray-600 font-medium m-0 mt-1">Date: {new Date(ch.challanDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left Col: Trip Details */}
            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-2 mb-2">Trip Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600 w-1/3">From Branch:</td>
                    <td className="py-1 font-bold">{ch.branch?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">To Branch:</td>
                    <td className="py-1 font-bold">{ch.lrToBranch?.name || ch.memoDestinationBranch?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">Final Dest:</td>
                    <td className="py-1 font-bold">{ch.memoDestinationBranch?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">Status:</td>
                    <td className="py-1 font-bold uppercase">{ch.status.replace('_', ' ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Col: Vehicle & Driver */}
            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-2 mb-2">Vehicle & Driver</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600 w-1/3">Truck No:</td>
                    <td className="py-1 font-bold text-lg">{ch.truckNo?.vehicleNumber || ch.truckNo || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">Driver Name:</td>
                    <td className="py-1 font-bold">{ch.driverName?.name || ch.driverName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">Agent/Broker:</td>
                    <td className="py-1 font-bold">{ch.agent || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* LRs Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Loaded Consignments ({bookings.length})</h3>
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 py-1.5 px-2 text-left w-12 text-center">Sr.</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-left w-24">LR No</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-left">Consignor</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-left">Consignee</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-left">Dest.</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-center w-16">Pkg</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-center w-16">Wt(kg)</th>
                  <th className="border border-gray-400 py-1.5 px-2 text-right w-20">Freight</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? bookings.map((b: any, i: number) => (
                  <tr key={b._id}>
                    <td className="border border-gray-400 py-1.5 px-2 text-center">{i + 1}</td>
                    <td className="border border-gray-400 py-1.5 px-2 font-bold">{b.lrNumber}</td>
                    <td className="border border-gray-400 py-1.5 px-2 truncate max-w-[120px]">{b.consignor?.name || 'N/A'}</td>
                    <td className="border border-gray-400 py-1.5 px-2 truncate max-w-[120px]">{b.consignee?.name || 'N/A'}</td>
                    <td className="border border-gray-400 py-1.5 px-2">{b.destinationBranch?.name || 'N/A'}</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-center">{b.pkg || 0}</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-center">{b.weight || 0}</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-right">₹{b.freight || 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="border border-gray-400 py-4 text-center text-gray-500 italic">No Consignments Loaded</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="font-bold bg-gray-50">
                <tr>
                  <td colSpan={5} className="border border-gray-400 py-1.5 px-2 text-right">TOTAL:</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{totalPkg}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{totalWeight}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-right">₹{totalFreight}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Financials & Remarks */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="border border-gray-300 rounded-lg p-3 h-full">
              <h3 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-2 mb-2">Remarks</h3>
              <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap min-h-[60px]">{ch.remark || 'N/A'}</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-2 mb-2">Truck Fare Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">Truck Freight:</td>
                    <td className="py-1 font-bold text-right">₹{ch.truckFreight || 0}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600">Advance Paid:</td>
                    <td className="py-1 font-bold text-right text-red-600">- ₹{ch.advanceAmount || 0}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-600 border-b border-gray-200 pb-1">Commission:</td>
                    <td className="py-1 font-bold text-right border-b border-gray-200 pb-1">- ₹{ch.commission || 0}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-gray-800">Balance To Pay:</td>
                    <td className="py-2 font-bold text-right text-lg text-brand-primary">₹{(Number(ch.truckFreight || 0) - Number(ch.advanceAmount || 0) - Number(ch.commission || 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-16 px-4">
            <div className="text-center">
              <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
              <p className="text-xs font-bold text-gray-600 uppercase">Driver Signature</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
              <p className="text-xs font-bold text-gray-600 uppercase">Broker Signature</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 w-32 mx-auto mb-1"></div>
              <p className="text-xs font-bold text-brand-primary uppercase">For, TRUST LOGISTIC</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Authorised Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
