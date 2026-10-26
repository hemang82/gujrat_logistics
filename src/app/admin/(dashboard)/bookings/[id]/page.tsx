import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Challan from '@/models/Challan';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Truck, MessageCircle, User as DriverIcon } from 'lucide-react';
import { getWhatsAppShareLink } from '@/lib/whatsappShare';
import QRCodeDisplay from '@/components/admin/QRCodeDisplay';
import Link from 'next/link';

import PrintButton from '@/components/admin/PrintButton';
import UpdateStatusDialog from '@/components/admin/UpdateStatusDialog';
import { formatDate } from '@/lib/dateUtils';

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  const sessionLogisticName = (session?.user as any)?.logisticName || 'Trust Logistic';

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  await connectToDatabase();
  // Ensure models are registered for populate
  if (!Vehicle || !Driver) console.log('Init models');

  const booking = await Booking.findById(id)
    .populate('branch')
    .populate('bookingBranch')
    .populate('destinationBranch', 'name code')
    .populate('vehicle', 'vehicleNumber vehicleType')
    .populate('driver', 'name phone')
    .populate('logisticId', 'name companyLogo')
    .lean() as any;

  if (!booking) {
    return <div className="p-8 text-center text-red-500">Booking not found.</div>;
  }

  // Find if this booking is assigned to any active Challan
  const loadedChallan = await Challan.findOne({
    bookings: booking._id,
    isDeleted: false
  })
    .populate('truckNo', 'vehicleNumber vehicleType')
    .populate('driverName', 'name phone')
    .populate('memoDestinationBranch', 'name code')
    .lean() as any;

  // Resolved vehicle and driver from Challan or directly from Booking
  const activeTruckNumber = loadedChallan?.truckNo?.vehicleNumber || booking.vehicle?.vehicleNumber || null;
  const activeDriverName = loadedChallan?.driverName?.name || booking.driver?.name || null;
  const activeDriverPhone = loadedChallan?.driverName?.phone || booking.driver?.phone || null;

  const rawLogisticName = booking.logisticId?.name || sessionLogisticName || 'Trust Logistic';
  // Format to Proper Capitalized Title Case (e.g. "Hemang Logistics")
  const logisticName = rawLogisticName
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w+/g, (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
  const companyLogo = booking.logisticId?.companyLogo || (session?.user as any)?.companyLogo || null;

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
    <div className="w-full mx-auto space-y-3 pb-8 print:p-0 print:m-0 print:max-w-none">
      
      {/* Top Compact Action Bar - Synced with New Bookings Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white py-2 px-3.5 rounded-xl shadow-xs border border-slate-200/90 gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/bookings">
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0 rounded-lg shrink-0 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors border border-gray-200"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">View Booking</h1>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Lorry Receipt (Bilty) details & dispatch status</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {booking.consignor?.phone && booking.consignor.phone !== '0000000000' && booking.consignor.phone.length >= 10 ? (
            <a 
              href={getWhatsAppShareLink(
                booking.consignor?.phone, 
                `Hello ${booking.consignor?.name || 'Customer'},\nYour Booking (LR No: ${booking.lrNumber}) via ${logisticName} is confirmed. Track it here: ${appUrl}/track?lr=${booking.lrNumber}`
              )}
              target="whatsapp_share_tab"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button variant="outline" className="w-full sm:w-auto h-8.5 px-3 rounded-[8px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs">
                <MessageCircle className="w-3.5 h-3.5" />
                Share
              </Button>
            </a>
          ) : null}
          {!loadedChallan ? (
            <Link href={`/admin/bookings/${id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto h-8.5 px-3 rounded-[8px] bg-white text-slate-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Edit
              </Button>
            </Link>
          ) : (
            <div className="flex-1 sm:flex-none" title={`Cannot edit: Loaded on Challan ${loadedChallan.challanNumber}`}>
              <Button variant="outline" disabled className="w-full sm:w-auto h-8.5 px-3 rounded-[8px] bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed flex items-center justify-center gap-1.5 text-xs font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Edit (Locked)
              </Button>
            </div>
          )}
          <div className="flex-1 sm:flex-none">
            <UpdateStatusDialog bookingId={id} currentStatus={booking.status || 'pending'} />
          </div>
          <div className="w-full sm:w-auto">
            <Link href={`/admin/bookings/${id}/print?print=true`}>
              <Button className="w-full sm:w-auto h-8.5 px-4 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print Bilty
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* LR Bilty Paper Format - Compact & Clean ERP Layout */}
      <div 
        className="bg-white p-5 sm:p-7 rounded-xl shadow-xs border border-slate-200/90 print:shadow-none print:m-0 print:w-full print:border-none" 
        id="print-area"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        
        {/* Header Section */}
        <div className="flex flex-col border-b border-slate-200 pb-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/90 flex items-center justify-center bg-white shadow-xs p-1">
                  <img src={companyLogo} alt={logisticName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-11 h-11 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">
                  {logisticName}
                </h1>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Fast, Safe & Reliable Transport Services</p>
                <p className="text-[10px] text-gray-400 mt-0.5">H.O: Ahmedabad, Gujarat, India</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
              {/* LORRY RECEIPT (BILTY) Title & Status */}
              <div className="text-left sm:text-right">
                <h2 className="text-base sm:text-lg font-extrabold text-brand-primary tracking-wide leading-tight">
                  LORRY RECEIPT (BILTY)
                </h2>
                <div className="mt-1 flex sm:justify-end">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize inline-block border
                    ${booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                    ${booking.status === 'in_transit' ? 'bg-blue-50 text-brand-info border-blue-200' : ''}
                    ${booking.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                    ${booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                  `}>
                    {booking.status?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>
              </div>

              {/* QR Code Placed At The End with stylish frame */}
              <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs shrink-0">
                <QRCodeDisplay value={`${appUrl}/track?lr=${booking.lrNumber}`} size={52} />
                <span className="text-[7.5px] text-gray-500 font-bold mt-1 tracking-wider uppercase">Scan to Track</span>
              </div>
            </div>
          </div>

          {/* Branch & Route Details Meta Bar */}
          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 w-full text-left grid grid-cols-2 sm:grid-cols-6 gap-3 mt-3.5">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Branch Code</p>
              <p className="font-bold text-xs text-slate-700">{booking.branch?.code || 'ASL'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">LR No</p>
              <p className="font-black text-sm text-brand-primary">LR-{booking.lrNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Booking Date</p>
              <p className="font-bold text-xs text-slate-700">{formatDate(booking.bookingDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Booking Branch</p>
              <p className="font-bold text-xs text-slate-700">{booking.bookingBranch?.name || booking.bookingBranch?.code || 'Aslali'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Destination Branch</p>
              <p className="font-bold text-xs text-slate-700">{booking.destinationBranch?.name || booking.destinationBranch?.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Rate Type</p>
              <p className="font-bold text-xs text-emerald-600 capitalize">{booking.rateType?.replace('_', ' ') || 'To Pay'}</p>
            </div>
          </div>
        </div>

        {/* Consignor / Consignee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-500 mb-3 border-b pb-2 tracking-wide">Consignor (Sender)</h3>
            <p className="font-bold text-base text-gray-800">{booking.consignor?.name || 'N/A'}</p>
            {booking.consignor?.gstNumber && <p className="text-xs mt-1 text-gray-600"><span className="text-gray-400 font-medium">GST:</span> {booking.consignor?.gstNumber}</p>}
            <p className="text-xs mt-1 text-gray-600"><span className="text-gray-400 font-medium">Phone:</span> {booking.consignor?.phone || 'N/A'}</p>
          </div>
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-500 mb-3 border-b pb-2 tracking-wide">Consignee (Receiver)</h3>
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
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-slate-700">
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
                  <td className="p-2 px-3 text-right font-semibold text-slate-700">₹ {parseFloat(booking.charges?.freightAmount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">PF Charges:</td>
                  <td className="p-2 px-3 text-right font-semibold text-slate-700">₹ {parseFloat(booking.charges?.pf || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">Labour (Hamali):</td>
                  <td className="p-2 px-3 text-right font-semibold text-slate-700">₹ {parseFloat(booking.charges?.hamali || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">DD Charge (Door Del.):</td>
                  <td className="p-2 px-3 text-right font-semibold text-slate-700">₹ {parseFloat(booking.charges?.ddCharge || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">Bilty Charge:</td>
                  <td className="p-2 px-3 text-right font-semibold text-slate-700">₹ {parseFloat(booking.charges?.biltyCharge || 10).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 px-3 text-gray-500 font-medium">GST ({booking.charges?.gstRate || 0}%):</td>
                  <td className="p-2 px-3 text-right font-semibold text-slate-700">₹ {parseFloat(booking.charges?.gstAmount || 0).toFixed(2)}</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="p-3 px-3 text-gray-700">Total:</td>
                  <td className="p-3 px-3 text-right text-base text-brand-primary">₹ {parseFloat(booking.charges?.totalAmount || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice & Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border border-gray-100 rounded-xl p-4 mb-4 bg-gray-50/50">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-0.5">Goods Value</span>
            <span className="font-semibold text-sm text-gray-700">₹ {booking.value || '0.00'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-0.5">Del. Type</span>
            <span className="font-semibold text-sm text-gray-700">{booking.deliveryType || 'Godown Delivery'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-0.5">Pvt. Marka</span>
            <span className="font-semibold text-sm text-gray-700">{booking.pvtMarka || 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-0.5">Invoice No</span>
            <span className="font-semibold text-sm text-gray-700">{booking.invoiceNo || 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-0.5">E-Way Bill No</span>
            <span className="font-semibold text-sm text-gray-700">{booking.ewayBillNo || 'N/A'}</span>
          </div>
        </div>

        {/* Dispatch & Vehicle Transport Information Banner */}
        <div className="border border-brand-primary/20 bg-brand-primary/[0.03] rounded-xl p-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-primary/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                <Truck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-brand-text-primary">Dispatch & Transit Information</span>
            </div>
            {loadedChallan ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Loaded on Challan: <span className="font-black">CH-{loadedChallan.challanNumber}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Pending Challan Dispatch
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/80 p-3 rounded-lg border border-gray-100 shadow-2xs">
              <span className="text-gray-400 font-semibold block text-[10px] mb-1">Truck / Vehicle No</span>
              <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                {activeTruckNumber || <span className="text-gray-400 font-medium italic">Not Assigned</span>}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-gray-100 shadow-2xs">
              <span className="text-gray-400 font-semibold block text-[10px] mb-1">Driver Name</span>
              <span className="text-sm font-bold text-slate-800">
                {activeDriverName || <span className="text-gray-400 font-medium italic">Not Assigned</span>}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-gray-100 shadow-2xs">
              <span className="text-gray-400 font-semibold block text-[10px] mb-1">Transit Destination</span>
              <span className="text-sm font-bold text-slate-800">
                {loadedChallan?.memoDestinationBranch?.name || booking.destinationBranch?.name || booking.deliveryLocation || 'In Transit'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-10 sm:gap-4 pt-12 border-t border-gray-100 mt-10">
          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-slate-700 font-semibold tracking-wide">Consignor Signature</p>
          </div>
          
          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-slate-700 font-semibold tracking-wide">Driver Signature</p>
          </div>

          <div className="text-center w-full sm:w-auto">
            <div className="w-40 mx-auto border-b border-gray-300 mb-2"></div>
            <p className="text-xs text-slate-700 font-semibold tracking-wide">For {logisticName}</p>
          </div>
        </div>

      </div>

    </div>
  );
}



