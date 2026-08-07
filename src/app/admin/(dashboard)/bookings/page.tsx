import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Download, Calendar as CalendarIcon, ChevronRight, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';

import Link from 'next/link';
import BookingsFilter from '@/components/admin/BookingsFilter';
import Pagination from '@/components/admin/Pagination';
import ListActions from '@/components/admin/ListActions';
import BookingStatusDropdown from '@/components/admin/BookingStatusDropdown';
import ExportBookings from '@/components/admin/ExportBookings';
import Branch from '@/models/Branch';
import User from '@/models/User';
import { formatDate } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ search?: string, date?: string, page?: string, limit?: string, destBranch?: string, branch?: string }> }) {
  const session = await getServerSession(authOptions);
  await connectToDatabase();
  const role = (session?.user as any)?.role;
  const logisticName = (session?.user as any)?.logisticName || 'Trust Logistic';
  
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const dateStr = resolvedParams?.date || '';
  const filterBranch = resolvedParams?.branch || '';
  const page = parseInt(resolvedParams?.page || '1', 10);
  const limit = parseInt(resolvedParams?.limit || '15', 10);

  // Fetch branches for filter (scoped to the logistic company)
  const branchQuery: any = { isDeleted: { $ne: true } };
  const userLogisticId = role === 'logistic' ? (session?.user as any)?.id : (session?.user as any)?.logisticId;
  if (userLogisticId) {
    branchQuery.logisticId = userLogisticId;
  }
  const branchesDoc = await Branch.find(branchQuery).select('_id name code').lean();
  const branches = branchesDoc.map((b: any) => ({ ...b, _id: b._id.toString() }));

  // Build query
  const query: any = { isDeleted: { $ne: true } };

  if (session && (session.user as any).role === 'logistic') {
    query.logisticId = (session.user as any).id;
  } else if (session && (session.user as any).logisticId) {
    query.logisticId = (session.user as any).logisticId;
  }

  if (session && ((session.user as any).role === 'branch_user' || (session.user as any).role === 'branch')) {
    const userBranchStr = (session.user as any).branch || (session.user as any).bookingBranch;
    if (userBranchStr) {
      let userBranchObj = userBranchStr;
      try {
        if (typeof userBranchStr === 'string' && /^[0-9a-fA-F]{24}$/.test(userBranchStr)) {
          const mongoose = require('mongoose');
          userBranchObj = new mongoose.Types.ObjectId(userBranchStr);
        }
      } catch (e) { }

      // Branch user should see bookings where they are the origin
      query.$or = [
        { bookingBranch: userBranchObj },
        { branch: userBranchObj }
      ];
    }
  }

  if (search) {
    const searchOr = [
      { lrNumber: { $regex: search, $options: 'i' } },
      { 'consignor.name': { $regex: search, $options: 'i' } },
      { 'consignee.name': { $regex: search, $options: 'i' } },
      { deliveryLocation: { $regex: search, $options: 'i' } }
    ];

    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchOr }];
      delete query.$or;
    } else {
      query.$or = searchOr;
    }
  }

  if (dateStr) {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    query.bookingDate = { $gte: startOfDay, $lte: endOfDay };
  }

  if (filterBranch) {
    // Branch filter applied from the Logistic panel
    query.$or = (query.$or || []).concat([
      { branch: filterBranch },
      { bookingBranch: filterBranch }
    ]);
  }

  const skip = (page - 1) * limit;

  let bookings: any[] = [];
  let totalBookings = 0;
  let totalPages = 0;

  const isLogisticAdmin = role === 'logistic' || role === 'superadmin';

  let canViewBooking = true;
  let canAddBooking = true;
  let canEditBooking = true;
  let canDeleteBooking = true;

  if (isLogisticAdmin && !filterBranch) {
    // Return empty list if no branch is selected by admin
    bookings = [];
    totalBookings = 0;
    totalPages = 0;
  } else {
    // Fetch paginated bookings
    bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('destinationBranch', 'name')
      .populate('bookingBranch', 'name')
      .lean();

    totalBookings = await Booking.countDocuments(query);
    totalPages = Math.ceil(totalBookings / limit);

    // Fetch permissions for branch users
    if (session && (role === 'branch_user' || role === 'branch')) {
      try {
        const userDoc = await User.findById((session.user as any).id).select('permissions').lean();
        if (userDoc && userDoc.permissions?.bookings) {
          canViewBooking = userDoc.permissions.bookings.canView !== false;
          canAddBooking = userDoc.permissions.bookings.canAdd !== false;
          canEditBooking = userDoc.permissions.bookings.canEdit !== false;
          canDeleteBooking = userDoc.permissions.bookings.canDelete === true;
        } else {
          canViewBooking = true;
          canAddBooking = true;
          canEditBooking = true;
          canDeleteBooking = false; // default for older users
        }
      } catch (e) {
        console.error("Error fetching user permissions", e);
      }
    }
  }

  if (!canViewBooking) {
    return (
      <div className="p-8 mt-10 max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-700">Access Denied</h2>
        <p className="text-sm text-red-600 mt-1">You do not have permission to view Bookings. Please contact your Logistic Admin.</p>
      </div>
    );
  }

  const canCreate = !isLogisticAdmin && canAddBooking;

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">Bookings & LR </h1>
          <p className="text-brand-text-secondary mt-1">Manage Lorry Receipts (LR) and track parcels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto print:hidden">
          <ExportBookings search={search} date={dateStr} branch={filterBranch} />

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

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-visible">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-xl font-bold text-brand-text-primary">Recent Bookings</CardTitle>
            <BookingsFilter branches={branches} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop View: Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100 whitespace-nowrap">
                  <th className="font-semibold p-3 w-20 whitespace-nowrap text-center">Sr. No.</th>
                  <th className="font-semibold p-3">LR Number</th>
                  <th className="font-semibold p-3">Date</th>
                  <th className="font-semibold p-3">Consignor (Sender)</th>
                  <th className="font-semibold p-3">Consignee (Receiver)</th>
                  <th className="font-semibold p-3">Route (Origin ➔ Destination)</th>
                  <th className="font-semibold p-3 text-center">Status</th>
                  <th className="font-semibold p-3 text-right pr-8">Amount</th>
                  <th className="font-semibold p-3 text-center w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        {isLogisticAdmin && !filterBranch ? (
                          <p>Please select a Booking Branch to view LRs.</p>
                        ) : (
                          <p>No bookings found. Create a new LR to get started.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any, index: number) => (
                    <tr key={booking._id.toString()} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="p-3 text-sm text-gray-500 font-medium text-center">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="p-3 font-bold text-brand-primary">LR-{booking.lrNumber}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="p-3 text-sm font-medium text-brand-text-primary max-w-[200px] truncate" title={booking.consignor?.name}>
                        {booking.consignor?.name || <span className="text-gray-300 font-normal">N/A</span>}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-700 max-w-[200px] truncate" title={booking.consignee?.name}>
                        {booking.consignee?.name || <span className="text-gray-300 font-normal">N/A</span>}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {booking.bookingBranch?.name || booking.branch?.name || <span className="text-gray-300 font-normal">N/A</span>}
                        <span className="mx-2 text-gray-400">➔</span>
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
                            printUrl={`/admin/bookings/${booking._id}/print?print=true`}
                            hideEdit={!canEditBooking}
                            hideDelete={!canDeleteBooking}
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
                {isLogisticAdmin && !filterBranch ? (
                  <p className="text-sm font-medium">Please select a Booking Branch to view LRs.</p>
                ) : (
                  <p className="text-sm font-medium">No bookings found.</p>
                )}
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
                        {formatDate(booking.bookingDate)}
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
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-50/50">
                      <span className="text-xs text-gray-500 block mb-1">Route</span>
                      <p className="text-sm text-gray-700">
                        {booking.bookingBranch?.name || booking.branch?.name || 'N/A'} <span className="mx-1 text-gray-400">➔</span> {booking.destinationBranch?.name || booking.deliveryLocation || 'N/A'}
                      </p>
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
                        printUrl={`/admin/bookings/${booking._id}/print?print=true`}
                        hideEdit={!canEditBooking}
                        hideDelete={!canDeleteBooking}
                        whatsappPhone={booking.consignor?.phone}
                        whatsappMessage={`Hello ${booking.consignor?.name || 'Customer'},\nYour Booking (LR No: ${booking.lrNumber}) via ${logisticName} is confirmed. Track it here: ${appUrl}/track?lr=${booking.lrNumber}`}
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
