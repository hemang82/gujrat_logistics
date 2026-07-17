import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import { Button } from '@/components/ui/button';
import { Truck, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

import PrintButton from '@/components/admin/PrintButton';
import UpdateStatusDialog from '@/components/admin/UpdateStatusDialog';

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const booking = await Booking.findById(id)
    .populate('branch')
    .populate('bookingBranch')
    .populate('destinationBranch')
    .lean() as any;

  if (!booking) {
    return <div className="p-8 text-center text-red-500">Booking not found.</div>;
  }

  // Handle dynamic items array or fallback to legacy material model fields
  const itemsList = booking.items && booking.items.length > 0 
    ? booking.items 
    : [{
        packages: booking.material?.quantity || 1,
        packaging: booking.material?.packagingType || 'N/A',
        description: booking.material?.itemName || 'N/A',
        weight: booking.material?.weight || 0,
        nw: 'N',
        rate: booking.material?.weight 
          ? (booking.charges?.freightAmount / booking.material.weight).toFixed(2)
          : '0.00',
        amount: booking.charges?.freightAmount || 0
      }];

  return (
    <div className="w-full mx-auto space-y-6 pb-10 print:p-0 print:m-0 print:max-w-none">
      
      {/* Top Actions - Hidden in Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden mb-6">
        <Link href="/admin/bookings">
          <Button variant="outline" className="h-10 rounded-xl flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Bookings
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href={`/admin/bookings/${id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full h-10 rounded-xl bg-white text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Booking
            </Button>
          </Link>
          <div className="flex-1 sm:flex-none flex justify-center">
            <UpdateStatusDialog bookingId={id} currentStatus={booking.status || 'pending'} />
          </div>
          <div className="w-full sm:w-auto flex justify-center mt-2 sm:mt-0">
            <PrintButton />
          </div>
        </div>
      </div>

      {/* LR Bilty Paper Format */}
      <div 
        className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:m-0 print:w-full print:border-none" 
        id="print-area"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        
        {/* Header Section */}
        <div className="flex flex-col border-b-2 border-brand-primary pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shrink-0">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">GUJARAT LOGISTIC</h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Fast, Safe & Reliable Transport Services</p>
                <p className="text-xs sm:text-xs text-gray-400 mt-1">H.O: Ahmedabad, Gujarat, India</p>
              </div>
            </div>
            <div className="text-left sm:text-right flex flex-col items-start sm:items-end w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">LORRY RECEIPT (BILTY)</h2>
              <div className="mt-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize inline-block border
                  ${booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                  ${booking.status === 'in_transit' ? 'bg-blue-50 text-brand-info border-blue-200' : ''}
                  ${booking.status === 'delivered' ? 'bg-green-50 text-brand-success border-green-200' : ''}
                  ${booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                `}>
                  {booking.status?.replace('_', ' ') || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* New branch details meta bar */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full text-left grid grid-cols-2 sm:grid-cols-6 gap-4 mt-6">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Branch Code</p>
              <p className="font-bold text-sm text-gray-700 uppercase">{booking.branch?.code || 'ASL'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">LR No</p>
              <p className="font-extrabold text-base text-brand-primary">LR-{booking.lrNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Booking Date</p>
              <p className="font-bold text-sm text-gray-700">{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Booking Branch</p>
              <p className="font-bold text-sm text-gray-700 uppercase">{booking.bookingBranch?.name || booking.bookingBranch?.code || 'ASLALI'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Destination Branch</p>
              <p className="font-bold text-sm text-gray-700 uppercase">{booking.destinationBranch?.name || booking.destinationBranch?.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Rate Type</p>
              <p className="font-bold text-sm text-emerald-600 uppercase">{booking.rateType?.replace('_', ' ') || 'To Pay'}</p>
            </div>
          </div>
        </div>

        {/* Consignor / Consignee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2 tracking-wider">Consignor (Sender)</h3>
            <p className="font-bold text-base text-gray-800">{booking.consignor?.name || 'N/A'}</p>
            {booking.consignor?.gstNumber && <p className="text-xs mt-1 text-gray-600"><span className="text-gray-400 font-medium">GST:</span> {booking.consignor?.gstNumber}</p>}
            <p className="text-xs mt-1 text-gray-600"><span className="text-gray-400 font-medium">Phone:</span> {booking.consignor?.phone || 'N/A'}</p>
          </div>
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2 tracking-wider">Consignee (Receiver)</h3>
            <p className="font-bold text-base text-gray-800">{booking.consignee?.name || 'N/A'}</p>
            {booking.consignee?.gstNumber && <p className="text-xs mt-1 text-gray-600"><span className="text-gray-400 font-medium">GST:</span> {booking.consignee?.gstNumber}</p>}
            <p className="text-xs mt-1 text-gray-600"><span className="text-gray-400 font-medium">Phone:</span> {booking.consignee?.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Material & Financials Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Material Details Table */}
          <div className="col-span-1 lg:col-span-2 border border-gray-100 rounded-xl overflow-hidden h-fit">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-center">Pkgs</th>
                  <th className="p-3">Packaging</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Weight</th>
                  <th className="p-3 text-center">N / W</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itemsList.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-3 text-center font-bold text-gray-800">{item.packages}</td>
                    <td className="p-3 text-gray-600">{item.packaging || 'Pkg'}</td>
                    <td className="p-3 font-medium text-gray-700">{item.description}</td>
                    <td className="p-3 text-right text-gray-600">{item.weight || 0} Kg</td>
                    <td className="p-3 text-center text-gray-600 font-semibold">{item.nw || 'N'}</td>
                    <td className="p-3 text-right text-gray-600">₹ {parseFloat(item.rate || 0).toFixed(2)}</td>
                    <td className="p-3 text-right font-semibold text-gray-800">₹ {parseFloat(item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financials Details */}
          <div className="border border-gray-100 rounded-xl overflow-hidden h-fit">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">Freight Amount:</td>
                  <td className="p-2 px-3 text-right font-semibold text-gray-700">₹ {parseFloat(booking.charges?.freightAmount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">PF Charges:</td>
                  <td className="p-2 px-3 text-right font-semibold text-gray-700">₹ {parseFloat(booking.charges?.pf || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">Labour (Hamali):</td>
                  <td className="p-2 px-3 text-right font-semibold text-gray-700">₹ {parseFloat(booking.charges?.hamali || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">DD Charge (Door Del.):</td>
                  <td className="p-2 px-3 text-right font-semibold text-gray-700">₹ {parseFloat(booking.charges?.ddCharge || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">Bilty Charge:</td>
                  <td className="p-2 px-3 text-right font-semibold text-gray-700">₹ {parseFloat(booking.charges?.biltyCharge || 10).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">GST ({booking.charges?.gstRate || 0}%):</td>
                  <td className="p-2 px-3 text-right font-semibold text-gray-700">₹ {parseFloat(booking.charges?.gstAmount || 0).toFixed(2)}</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="p-3 px-3 text-gray-700">TOTAL:</td>
                  <td className="p-3 px-3 text-right text-base text-brand-primary">₹ {parseFloat(booking.charges?.totalAmount || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice & Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border border-gray-100 rounded-xl p-4 mb-8 bg-gray-50/50">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">Goods Value</span>
            <span className="font-semibold text-sm text-gray-700">₹ {booking.value || '0.00'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">Del. Type</span>
            <span className="font-semibold text-sm text-gray-700">{booking.deliveryType || 'Godown Delivery'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">Pvt. Marka</span>
            <span className="font-semibold text-sm text-gray-700">{booking.pvtMarka || 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">Invoice No</span>
            <span className="font-semibold text-sm text-gray-700">{booking.invoiceNo || 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">E Way Bill No</span>
            <span className="font-semibold text-sm text-gray-700">{booking.ewayBillNo || 'N/A'}</span>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-10 sm:gap-4 pt-12 border-t border-gray-100 mt-10">
          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Consignor Signature</p>
          </div>
          
          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Driver Signature</p>
          </div>

          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">For Gujarat Logistic</p>
          </div>
        </div>

      </div>

    </div>
  );
}
