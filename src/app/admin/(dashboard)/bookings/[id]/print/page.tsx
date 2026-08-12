import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import { Truck, Scissors, ArrowLeft } from 'lucide-react';
import PrintButton from '@/components/admin/PrintButton';
import QRCodeDisplay from '@/components/admin/QRCodeDisplay';
import Link from 'next/link';
import { formatDate } from '@/lib/dateUtils';
import { getWhatsAppShareLink } from '@/lib/whatsappShare';

// Reusable component for a single half-page LR Copy
const LRCopy = ({ booking, copyType, trackingUrl, logisticName }: { booking: any, copyType: string, trackingUrl: string, logisticName: string }) => {
  return (
    <div className="w-full flex flex-col h-[14.5cm] p-2 bg-white relative overflow-hidden">
      
      {/* Top Header - Company & LR Details */}
      <div className="flex justify-between items-start border-b-2 border-brand-primary pb-2 mb-2">
        {/* Left: Logo & Company Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 print:border print:border-brand-primary">
            <Truck className="w-7 h-7 text-white print:text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-text-primary uppercase tracking-wide m-0 leading-tight">{logisticName}</h1>
            <p className="text-[10px] text-gray-500 font-medium m-0">Fast, Safe & Reliable Transport Services</p>
            <p className="text-[10px] text-gray-400 m-0">H.O: Ahmedabad, Gujarat, India</p>
          </div>
        </div>

        {/* Right: LR Number & Date */}
        <div className="flex gap-4 items-start">
          <div className="flex flex-col items-center">
            <QRCodeDisplay value={trackingUrl} size={50} />
            <span className="text-[7px] text-gray-500 font-bold mt-0.5 tracking-wider uppercase">Scan to Track</span>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="border border-brand-primary rounded px-3 py-1 mb-1">
              <h2 className="text-xs font-bold text-brand-primary uppercase m-0 leading-tight">CONSIGNMENT NOTE</h2>
              <p className="text-[9px] text-gray-500 font-bold m-0 uppercase tracking-widest text-center">({copyType})</p>
            </div>
            <div className="flex gap-4 text-xs font-bold text-gray-800">
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-normal">LR No</span>
              <span className="text-brand-primary text-sm">{booking.lrNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-normal">Date</span>
              <span className="text-sm">{formatDate(booking.bookingDate)}</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 border-x border-t border-gray-400 text-[11px] leading-tight flex flex-col">
        
        {/* Row 1: Branches */}
        <div className="flex border-b border-gray-400">
          <div className="flex-1 p-1.5 border-r border-gray-400">
            <span className="font-bold text-gray-500 uppercase mr-2">From:</span>
            <span className="font-bold text-gray-900 text-xs">{booking.bookingBranch?.name || booking.branch?.name} ({booking.bookingBranch?.code || booking.branch?.code})</span>
          </div>
          <div className="flex-1 p-1.5 border-r border-gray-400">
            <span className="font-bold text-gray-500 uppercase mr-2">To:</span>
            <span className="font-bold text-gray-900 text-xs">{booking.destinationBranch?.name} ({booking.destinationBranch?.code})</span>
          </div>
          <div className="w-[100px] p-1.5 text-center bg-gray-50">
            <span className="font-bold text-gray-500 uppercase block text-[9px] mb-0.5">Pay Basis</span>
            <span className="font-bold text-brand-primary uppercase text-xs">{booking.paymentCondition?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Row 2: Consignor & Consignee */}
        <div className="flex border-b border-gray-400 flex-1">
          {/* Consignor */}
          <div className="flex-1 p-1.5 border-r border-gray-400">
            <p className="font-bold text-gray-600 border-b border-gray-200 pb-1 mb-1 uppercase text-[10px]">Consignor (Sender)</p>
            <p className="font-bold text-gray-900 text-xs">{booking.consignor.name}</p>
            {booking.consignor.address && <p className="text-gray-600 line-clamp-2">{booking.consignor.address}</p>}
            <p className="text-gray-600">Ph: {booking.consignor.phone}</p>
            {booking.consignor.gstNumber && <p className="text-gray-600">GST: <span className="font-semibold">{booking.consignor.gstNumber}</span></p>}
          </div>
          {/* Consignee */}
          <div className="flex-1 p-1.5">
            <p className="font-bold text-gray-600 border-b border-gray-200 pb-1 mb-1 uppercase text-[10px]">Consignee (Receiver)</p>
            <p className="font-bold text-gray-900 text-xs">{booking.consignee.name}</p>
            {booking.consignee.address && <p className="text-gray-600 line-clamp-2">{booking.consignee.address}</p>}
            <p className="text-gray-600">Ph: {booking.consignee.phone}</p>
            {booking.consignee.gstNumber && <p className="text-gray-600">GST: <span className="font-semibold">{booking.consignee.gstNumber}</span></p>}
          </div>
        </div>

        {/* Row 3: Items Table & Amount Grid */}
        <div className="flex flex-1 min-h-0">
          {/* Left side: Items */}
          <div className="flex-[3] border-r border-gray-400 flex flex-col min-h-0">
            <div className="overflow-hidden flex-1">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="p-0.5 font-bold text-gray-700 text-[9px] uppercase border-r border-gray-400">Pkg</th>
                  <th className="p-0.5 font-bold text-gray-700 text-[9px] uppercase border-r border-gray-400">Method</th>
                  <th className="p-0.5 font-bold text-gray-700 text-[9px] uppercase border-r border-gray-400">Description (Said to Contain)</th>
                  <th className="p-0.5 font-bold text-gray-700 text-[9px] uppercase text-right">Actual Wt.</th>
                </tr>
              </thead>
              <tbody className="text-[9px]">
                {booking.items?.length > 0 ? (
                  booking.items.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200 last:border-b-0 leading-tight">
                      <td className="p-0.5 border-r border-gray-400 font-semibold text-center">{item.packages || 0}</td>
                      <td className="p-0.5 border-r border-gray-400 text-center">{item.packaging || '-'}</td>
                      <td className="p-0.5 border-r border-gray-400 uppercase">{item.description || booking.material?.itemName || '-'}</td>
                      <td className="p-0.5 text-right font-semibold">{item.weight || 0} kg</td>
                    </tr>
                  ))
                ) : (
                  <tr className="leading-tight">
                    <td className="p-0.5 border-r border-gray-400 font-semibold text-center">{booking.material?.quantity || 0}</td>
                    <td className="p-0.5 border-r border-gray-400 text-center">{booking.material?.packagingType || '-'}</td>
                    <td className="p-0.5 border-r border-gray-400 uppercase">{booking.material?.itemName || '-'}</td>
                    <td className="p-0.5 text-right font-semibold">{booking.material?.weight || 0} kg</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            
            {/* Invoice & Eway Bill Info */}
            <div className="mt-auto p-1 border-t border-gray-400 bg-gray-50/50 flex flex-wrap gap-2 text-[10px]">
               <div><span className="font-semibold text-gray-500 mr-1">Invoice No:</span> <span className="font-bold">{booking.invoiceNo || 'N/A'}</span></div>
               <div><span className="font-semibold text-gray-500 mr-1">E-Way Bill:</span> <span className="font-bold">{booking.ewayBillNo || 'N/A'}</span></div>
               <div><span className="font-semibold text-gray-500 mr-1">Vehicle:</span> <span className="font-bold">{booking.vehicle?.vehicleNumber || 'N/A'}</span></div>
            </div>
          </div>

          {/* Right side: Charges */}
          <div className="flex-[1.5] flex flex-col">
            <div className="flex border-b border-gray-200 p-1">
              <span className="flex-1 text-gray-600">Freight</span>
              <span className="font-bold text-right">₹{booking.charges?.freightAmount || 0}</span>
            </div>
            <div className="flex border-b border-gray-200 p-1">
              <span className="flex-1 text-gray-600">Sur Charge</span>
              <span className="font-bold text-right">₹{booking.charges?.surCharge || 0}</span>
            </div>
            <div className="flex border-b border-gray-200 p-1">
              <span className="flex-1 text-gray-600">Hamali / L.C.</span>
              <span className="font-bold text-right">₹{booking.charges?.hamali || 0}</span>
            </div>
            <div className="flex border-b border-gray-200 p-1">
              <span className="flex-1 text-gray-600">Bilty Chg.</span>
              <span className="font-bold text-right">₹{booking.charges?.biltyCharge || 0}</span>
            </div>
            {booking.charges?.gstAmount > 0 && (
              <div className="flex border-b border-gray-200 p-1">
                <span className="flex-1 text-gray-600">GST ({booking.charges?.gstRate}%)</span>
                <span className="font-bold text-right">₹{booking.charges?.gstAmount || 0}</span>
              </div>
            )}
            <div className="mt-auto flex border-t-2 border-gray-400 p-1.5 bg-gray-100">
              <span className="flex-1 font-bold text-[12px] uppercase">Grand Total</span>
              <span className="font-extrabold text-[12px] text-right">₹{booking.charges?.totalAmount || 0}</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Footer - Terms & Signatures */}
      <div className="border-x border-b border-gray-400 p-2 flex justify-between items-end bg-gray-50/30">
        <div className="text-[8px] text-gray-500 leading-tight flex-1">
          <p className="font-bold text-gray-700 uppercase mb-0.5">Terms & Conditions:</p>
          <ul className="list-disc pl-3 m-0">
            <li>Subject to Ahmedabad Jurisdiction only.</li>
            <li>Carrier is not responsible for leakage or breakage.</li>
            <li>Demurrage will be charged after 48 hours of arrival.</li>
          </ul>
        </div>
        
        <div className="flex gap-12 text-[10px] font-bold text-gray-700 uppercase text-center pr-4 pb-1">
          <div className="border-t border-gray-400 pt-1 w-24">Receiver Sign</div>
          <div className="border-t border-gray-400 pt-1 w-24">Driver Sign</div>
          <div className="border-t border-gray-400 pt-1 w-32">For, {logisticName || 'Trust Logistic'}</div>
        </div>
      </div>
    </div>
  );
};

export default async function LRPrintPage({ params }: { params: Promise<{ id: string }> }) {
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
  const booking = await Booking.findById(id)
    .populate('branch', 'name code')
    .populate('bookingBranch', 'name code')
    .populate('destinationBranch', 'name code')
    .populate('vehicle', 'vehicleNumber vehicleType')
    .populate('logisticId', 'name companyLogo')
    .lean() as any;

  if (!booking) {
    return <div className="p-8 text-center text-red-500 font-semibold text-lg">Booking/LR not found.</div>;
  }

  const logisticName = booking.logisticId?.name || sessionLogisticName;

  const trackingUrl = `${appUrl}/track?lr=${booking.lrNumber}`;

  return (
    <div className="w-full mx-auto print:p-0 print:m-0 print:max-w-none bg-gray-100 print:bg-white min-h-screen py-8">
      
      {/* Top Actions - Hidden in Print */}
      <div className="flex items-center justify-center gap-4 print:hidden mb-6 max-w-[21cm] mx-auto">
        <Link 
          href="/admin/bookings" 
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-brand-primary font-bold rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>
        <PrintButton />
      </div>

      {/* A4 Paper Format for Print */}
      <div 
        className="bg-white mx-auto shadow-lg border border-gray-300 print:shadow-none print:m-0 print:w-full print:border-none relative" 
        style={{ width: '21cm', height: '29.7cm', overflow: 'hidden', padding: '0.2cm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}
      >
        
        {/* Consignor Copy (Top Half) */}
        <LRCopy booking={booking} copyType="Consignor Copy" trackingUrl={trackingUrl} logisticName={logisticName} />

        {/* Cut Line */}
        <div className="flex items-center justify-center m-0 p-0 text-gray-300 overflow-hidden opacity-50 h-[0.5cm]">
          <Scissors className="w-3 h-3 mr-2 shrink-0" />
          <div className="h-[1px] w-full border-t border-dashed border-gray-400 flex-1"></div>
        </div>

        {/* Driver / Office Copy (Bottom Half) */}
        <LRCopy booking={booking} copyType="Driver / Office Copy" trackingUrl={trackingUrl} logisticName={logisticName} />

      </div>
    </div>
  );
}
