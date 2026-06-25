import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Truck, ArrowLeft, MapPin, Package, FileText, IndianRupee } from 'lucide-react';
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
  const booking = await Booking.findById(id).lean() as any;

  if (!booking) {
    return <div className="p-8 text-center text-red-500">Booking not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 print:p-0 print:m-0 print:max-w-none">
      
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
        className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:m-0 print:w-full" 
        id="print-area"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-brand-primary pb-6 mb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shrink-0">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">GUJARAT LOGISTIC</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Fast, Safe & Reliable Transport Services</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">H.O: Ahmedabad, Gujarat, India</p>
            </div>
          </div>
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">LORRY RECEIPT</h2>
            
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

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full sm:w-auto text-left">
              <p className="text-sm"><span className="text-gray-500 font-medium">LR No:</span> <strong className="text-lg">{booking.lrNumber}</strong></p>
              <p className="text-sm"><span className="text-gray-500 font-medium">Date:</span> <strong>{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</strong></p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 mb-8 text-center sm:text-left">
          <div className="flex-1 w-full">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">From (Origin)</p>
            <p className="font-bold text-base sm:text-lg">{booking.pickupLocation}</p>
          </div>
          <div className="text-gray-400 rotate-90 sm:rotate-0 my-2 sm:my-0">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 sm:rotate-180" />
          </div>
          <div className="flex-1 w-full sm:text-right">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">To (Destination)</p>
            <p className="font-bold text-base sm:text-lg">{booking.deliveryLocation}</p>
          </div>
        </div>

        {/* Consignor / Consignee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 border-b pb-2">Consignor (Sender)</h3>
            <p className="font-bold text-lg">{booking.consignor?.name || 'N/A'}</p>
            <p className="text-sm mt-1">{booking.consignor?.address || 'N/A'}</p>
            <p className="text-sm mt-2"><span className="text-gray-500">Phone:</span> {booking.consignor?.phone || 'N/A'}</p>
            {booking.consignor?.gstNumber && <p className="text-sm"><span className="text-gray-500">GST:</span> {booking.consignor?.gstNumber}</p>}
          </div>
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 border-b pb-2">Consignee (Receiver)</h3>
            <p className="font-bold text-lg">{booking.consignee?.name || 'N/A'}</p>
            <p className="text-sm mt-1">{booking.consignee?.address || 'N/A'}</p>
            <p className="text-sm mt-2"><span className="text-gray-500">Phone:</span> {booking.consignee?.phone || 'N/A'}</p>
            {booking.consignee?.gstNumber && <p className="text-sm"><span className="text-gray-500">GST:</span> {booking.consignee?.gstNumber}</p>}
          </div>
        </div>

        {/* Material & Financials Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Material Details */}
          <div className="col-span-1 lg:col-span-2 border border-gray-100 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-3 font-semibold whitespace-nowrap">No. of Articles</th>
                  <th className="p-3 font-semibold">Description (Item Name)</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Actual Wt.</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Charged Wt.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 font-bold text-lg text-center border-r border-gray-100">{booking.material?.quantity || 1} <span className="text-sm font-normal text-gray-500 block">{booking.material?.packagingType || 'N/A'}</span></td>
                  <td className="p-4 font-medium border-r border-gray-100 min-w-[150px]">{booking.material?.itemName || 'N/A'}</td>
                  <td className="p-4 border-r border-gray-100 whitespace-nowrap">{booking.material?.weight || 0} Kg</td>
                  <td className="p-4 font-bold whitespace-nowrap">{booking.material?.chargedWeight || 0} Kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financials Details */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-2 text-gray-500">Freight:</td>
                  <td className="p-2 text-right font-medium">₹ {booking.charges?.freightAmount || 0}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 text-gray-500">Hamali:</td>
                  <td className="p-2 text-right font-medium">₹ {booking.charges?.hamali || 0}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 text-gray-500">Sur Charge:</td>
                  <td className="p-2 text-right font-medium">₹ {booking.charges?.surCharge || 0}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 text-gray-500">GST ({booking.charges?.gstRate || 0}%):</td>
                  <td className="p-2 text-right font-medium">₹ {booking.charges?.gstAmount || 0}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-bold text-lg">TOTAL:</td>
                  <td className="p-3 text-right font-bold text-lg text-brand-primary">₹ {booking.charges?.totalAmount || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-10 sm:gap-4 pt-12 border-t border-gray-100 mt-10">
          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Consignor Signature</p>
          </div>
          
          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Driver Signature</p>
          </div>

          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">For Gujarat Logistic</p>
          </div>
        </div>

      </div>

    </div>
  );
}
