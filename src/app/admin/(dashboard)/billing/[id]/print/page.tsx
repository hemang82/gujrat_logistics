import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Invoice from '@/models/Invoice';
import Booking from '@/models/Booking';
import { Button } from '@/components/ui/button';
import { Truck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PrintButton from '@/components/admin/PrintButton';

export const dynamic = 'force-dynamic';

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  Booking.init(); // Prevent tree shaking

  const invoice = await Invoice.findById(id).populate('bookings').lean() as any;

  if (!invoice || invoice.isDeleted) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 print:p-0 print:m-0 print:max-w-none">
      
      {/* Top Actions - Hidden in Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden mb-6">
        <Link href="/admin/billing">
          <Button variant="outline" className="h-10 rounded-xl flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Billing
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto flex justify-center mt-2 sm:mt-0">
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Master Invoice Paper Format */}
      <div 
        className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:m-0 print:w-full print:border-none" 
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
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">TRUST LOGISTIC</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Fast, Safe & Reliable Transport Services</p>
              <p className="text-xs sm:text-xs text-gray-400 mt-1">H.O: Ahmedabad, Gujarat, India</p>
              <p className="text-xs font-bold text-gray-700 mt-1">GSTIN: 24AAAAA1234A1Z5</p>
            </div>
          </div>
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-primary uppercase tracking-widest">TAX INVOICE</h2>
            <div className="mt-1 mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              Master Bill
            </div>
            
            <div className="mt-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block border
                ${invoice.status === 'paid' ? 'bg-green-50 text-brand-success border-green-200' : ''}
                ${invoice.status === 'partial' ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}
                ${invoice.status === 'unpaid' ? 'bg-red-50 text-red-600 border-red-200' : ''}
              `}>
                {invoice.status}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full sm:w-auto text-left">
              <p className="text-sm"><span className="text-gray-500 font-medium">Invoice No:</span> <strong className="text-lg">{invoice.invoiceNumber}</strong></p>
              <p className="text-sm"><span className="text-gray-500 font-medium">Date:</span> <strong>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</strong></p>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 border-b pb-2">Billed To (Client Details)</h3>
          <p className="font-bold text-xl text-gray-800">{invoice.clientName}</p>
          {invoice.clientAddress && <p className="text-sm text-gray-600 mt-1">{invoice.clientAddress}</p>}
          {invoice.clientPhone && <p className="text-sm text-gray-600 mt-1"><span className="text-gray-500">Phone:</span> {invoice.clientPhone}</p>}
          {invoice.clientGst && <p className="text-sm mt-2"><span className="text-gray-500">GSTIN:</span> <span className="font-bold">{invoice.clientGst}</span></p>}
        </div>

        {/* Trips Table */}
        <div className="mb-8 border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-primary text-white">
              <tr>
                <th className="p-3 font-semibold">LR Number</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Route</th>
                <th className="p-3 font-semibold text-center">Qty</th>
                <th className="p-3 font-semibold text-center">Weight</th>
                <th className="p-3 font-semibold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.bookings.map((booking: any) => (
                <tr key={booking._id.toString()} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-bold text-gray-800 border-r border-gray-100">{booking.lrNumber}</td>
                  <td className="p-3 text-gray-600 border-r border-gray-100">{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3 text-gray-600 border-r border-gray-100">{booking.pickupLocation} &rarr; {booking.deliveryLocation}</td>
                  <td className="p-3 text-center text-gray-700 border-r border-gray-100">{booking.material?.quantity || 1} {booking.material?.packagingType || 'Pkg'}</td>
                  <td className="p-3 text-center text-gray-700 border-r border-gray-100">{booking.material?.weight || 0} Kg</td>
                  <td className="p-3 text-right font-bold text-gray-800">
                    {booking.charges?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 0}
                  </td>
                </tr>
              ))}
              
              {/* Empty Rows to stretch table if few bookings */}
              {invoice.bookings.length < 3 && Array(3 - invoice.bookings.length).fill(0).map((_, i) => (
                <tr key={`empty-${i}`} className="h-10">
                  <td className="border-r border-gray-100"></td><td className="border-r border-gray-100"></td>
                  <td className="border-r border-gray-100"></td><td className="border-r border-gray-100"></td>
                  <td className="border-r border-gray-100"></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section (Terms & Totals) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <div className="border border-gray-100 rounded-xl p-5 bg-gray-50 h-fit">
             <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Terms & Conditions</h4>
             <ul className="text-xs text-gray-600 list-decimal pl-4 space-y-1 mb-4">
               <li>All disputes are subject to Ahmedabad jurisdiction only.</li>
               <li>Payment is due within 15 days of invoice date.</li>
               <li>Interest at 18% p.a. will be charged on delayed payments.</li>
             </ul>
             
             <h4 className="font-bold text-xs uppercase text-gray-500 mb-2 mt-4 border-t border-gray-200 pt-4">Bank Details</h4>
             <p className="text-xs text-gray-700"><span className="font-semibold text-gray-500">Bank:</span> HDFC Bank</p>
             <p className="text-xs text-gray-700"><span className="font-semibold text-gray-500">A/C Name:</span> Trust Logistic</p>
             <p className="text-xs text-gray-700"><span className="font-semibold text-gray-500">A/C No:</span> 50200012345678</p>
             <p className="text-xs text-gray-700"><span className="font-semibold text-gray-500">IFSC:</span> HDFC0001234</p>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden h-fit">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500">Total Freight:</td>
                  <td className="p-3 text-right font-medium">₹ {invoice.totalFreight.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500">Total Hamali:</td>
                  <td className="p-3 text-right font-medium">₹ {invoice.totalHamali.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500">Total Surcharge:</td>
                  <td className="p-3 text-right font-medium">₹ {invoice.totalSurcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 text-gray-500">Total GST:</td>
                  <td className="p-3 text-right font-medium">₹ {invoice.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-brand-primary text-white">
                  <td className="p-4 font-bold text-lg">GRAND TOTAL:</td>
                  <td className="p-4 text-right font-bold text-xl">₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 text-gray-500 font-bold border-b border-gray-100">Amount Received:</td>
                  <td className="p-3 text-right font-bold text-brand-success border-b border-gray-100">₹ {invoice.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700 font-bold text-lg">BALANCE DUE:</td>
                  <td className="p-3 text-right font-extrabold text-red-600 text-xl">₹ {Math.max(0, invoice.grandTotal - invoice.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="flex justify-end pt-12 border-t border-gray-100 mt-10">
          <div className="text-center w-64">
            <div className="w-full mx-auto border-b border-gray-400 mb-2"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">For Trust Logistic</p>
            <p className="text-xs text-gray-400 mt-1">Authorized Signatory</p>
          </div>
        </div>

      </div>

    </div>
  );
}
