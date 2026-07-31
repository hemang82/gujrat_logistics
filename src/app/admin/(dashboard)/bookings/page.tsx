import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Download, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

import Link from 'next/link';
import BookingsFilter from '@/components/admin/BookingsFilter';
import Pagination from '@/components/admin/Pagination';
import ListActions from '@/components/admin/ListActions';
import BookingStatusDropdown from '@/components/admin/BookingStatusDropdown';

export const dynamic = 'force-dynamic';

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ search?: string, date?: string, page?: string, limit?: string }> }) {
  const session = await getServerSession(authOptions);
  await connectToDatabase();
  const role = (session?.user as any)?.role;
  const canCreate = role !== 'superadmin' && role !== 'logistic';

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const dateStr = resolvedParams?.date || '';
  const page = parseInt(resolvedParams?.page || '1', 10);
  const limit = parseInt(resolvedParams?.limit || '15', 10);

  // Build query
  const query: any = { isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { lrNumber: { $regex: search, $options: 'i' } },
      { 'consignor.name': { $regex: search, $options: 'i' } },
      { 'consignee.name': { $regex: search, $options: 'i' } },
      { deliveryLocation: { $regex: search, $options: 'i' } }
    ];
  }

  if (dateStr) {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    query.bookingDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const skip = (page - 1) * limit;

  // Fetch paginated bookings
  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('destinationBranch', 'name')
    .populate('bookingBranch', 'name')
    .lean();

  const totalBookings = await Booking.countDocuments(query);
  const totalPages = Math.ceil(totalBookings / limit);

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">Bookings & LR </h1>
          <p className="text-brand-text-secondary mt-1">Manage Lorry Receipts (LR) and track parcels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <a href={`/api/admin/bookings/export?search=${encodeURIComponent(search)}&date=${encodeURIComponent(dateStr)}`} download className="w-full sm:w-auto">
            <Button variant="outline" className="h-12 w-full px-5 rounded-xl font-semibold shadow-sm border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Export Excel
            </Button>
          </a>
          {canCreate && (
            <div className="flex gap-3 w-full sm:w-auto">
              <Link href="/admin/bookings/new" className="flex-1 sm:flex-none">
                <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full px-6 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-5 h-5" />
                  CREATE
                </Button>
              </Link>
              <Link href="/admin/bookings/new?type=manual" className="flex-1 sm:flex-none">
                <Button className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 h-12 w-full px-6 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-5 h-5" />
                  Manual
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-xl font-bold text-brand-text-primary">Recent Bookings</CardTitle>
            <BookingsFilter />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop View: Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100 whitespace-nowrap">
                  <th className="font-semibold p-3">LR Number</th>
                  <th className="font-semibold p-3">Date</th>
                  <th className="font-semibold p-3">Consignor (Sender)</th>
                  <th className="font-semibold p-3">Consignee (Receiver)</th>
                  <th className="font-semibold p-3">Destination</th>
                  <th className="font-semibold p-3 text-center">Status</th>
                  <th className="font-semibold p-3 text-right pr-8">Amount</th>
                  <th className="font-semibold p-3 text-center w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p>No bookings found. Create a new LR to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any) => (
                    <tr key={booking._id.toString()} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="p-3 font-bold text-brand-primary">LR-{booking.lrNumber}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-sm font-medium text-brand-text-primary max-w-[200px] truncate" title={booking.consignor?.name}>
                        {booking.consignor?.name || <span className="text-gray-300 font-normal">N/A</span>}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-700 max-w-[200px] truncate" title={booking.consignee?.name}>
                        {booking.consignee?.name || <span className="text-gray-300 font-normal">N/A</span>}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {booking.destinationBranch?.name || booking.deliveryLocation || <span className="text-gray-300 font-normal">N/A</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <BookingStatusDropdown bookingId={booking._id.toString()} currentStatus={booking.status || 'pending'} />
                        </div>
                      </td>
                      <td className="p-3 text-sm font-bold text-brand-text-primary text-right pr-8">
                        ₹{booking.charges?.totalAmount || 0}
                      </td>
                      <td className="p-3 text-center w-48">
                        <div className="flex justify-center gap-3">
                          <ListActions
                            id={booking._id.toString()}
                            moduleName="bookings"
                            viewUrl={`/admin/bookings/${booking._id}`}
                            editUrl={`/admin/bookings/${booking._id}/edit`}
                            printUrl={`/admin/bookings/${booking._id}/print`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Compact Premium Cards */}
          <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                <FileText className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
                <p className="text-sm font-medium">No bookings found.</p>
              </div>
            ) : (
              bookings.map((booking: any) => (
                <div key={booking._id.toString()} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-brand-primary/20 transition-all flex flex-col">
                  {/* Left accented border indicating status */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 
                    ${booking.status === 'delivered' ? 'bg-brand-success' :
                      booking.status === 'cancelled' ? 'bg-red-500' :
                        booking.status === 'in_transit' ? 'bg-brand-info' : 'bg-yellow-400'
                    }`}
                  />

                  {/* Header: LR No, Date, Amount */}
                  <div className="flex justify-between items-center mb-3 pl-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-extrabold text-brand-text-primary text-sm tracking-tight">LR-{booking.lrNumber}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-bold text-brand-primary text-xs bg-brand-primary/5 px-2 py-0.5 rounded-md">
                      ₹{booking.charges?.totalAmount || 0}
                    </div>
                  </div>

                  {/* Body: Route details (Sender -> Receiver) */}
                  <div className="pl-2 space-y-2 text-xs mb-3 border-t border-gray-50/50 pt-2.5 flex-1">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-2 h-2 rounded-full bg-brand-primary mt-1 ring-[2px] ring-brand-primary/20 shrink-0" />
                      <div>
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">From (Consignor)</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{booking.consignor?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-2 h-2 rounded-full bg-brand-secondary mt-1 ring-[2px] ring-brand-secondary/20 shrink-0" />
                      <div>
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">To (Consignee)</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{booking.consignee?.name || 'N/A'}</p>
                        <p className="text-gray-500 mt-0.5 text-xs">{booking.deliveryLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Dropdown & Actions side by side */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 pl-2">
                    <div className="w-[140px] shrink-0">
                      <BookingStatusDropdown bookingId={booking._id.toString()} currentStatus={booking.status || 'pending'} />
                    </div>
                    <div className="shrink-0">
                      <ListActions
                        id={booking._id.toString()}
                        moduleName="bookings"
                        viewUrl={`/admin/bookings/${booking._id}`}
                        editUrl={`/admin/bookings/${booking._id}/edit`}
                        printUrl={`/admin/bookings/${booking._id}/print`}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination totalPages={totalPages} currentPage={page} />
        </CardContent>
      </Card>

    </div>
  );
}
