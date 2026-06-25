import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/Expense';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Booking from '@/models/Booking';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Wallet, Calendar as CalendarIcon, Truck, UserCircle, FileText, CheckCircle2, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ViewExpensePage({ params }: { params: Promise<{ id: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const expense = await Expense.findById(id)
    .populate('vehicle', 'vehicleNumber type')
    .populate('driver', 'name phone')
    .populate('booking', 'lrNumber deliveryLocation')
    .lean() as any;

  if (!expense || expense.isDeleted) {
    notFound();
  }

  const getExpenseColor = (type: string) => {
    switch(type) {
      case 'fuel': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'toll': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'maintenance': return 'text-red-600 bg-red-50 border-red-200';
      case 'driver_bhatta': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'rto_challan': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/expenses">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border-gray-200 hover:bg-gray-50 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">Expense Details</h1>
          <p className="text-brand-text-secondary text-sm mt-0.5">View full details of this logged expense.</p>
        </div>
        <div className="ml-auto">
          <Link href={`/admin/expenses/${id}/edit`}>
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl shadow-md flex items-center gap-2 h-10 px-5">
              <Edit className="w-4 h-4" />
              Edit Expense
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-brand-primary" />
                  Primary Info
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getExpenseColor(expense.expenseType)}`}>
                  {expense.expenseType.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Amount</p>
                  <p className="text-3xl font-bold text-gray-800">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> Date</p>
                  <p className="text-lg font-semibold text-brand-text-primary">
                    {new Date(expense.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Payment Method</p>
                  <p className="text-base font-semibold text-gray-800 capitalize">{expense.paymentMethod}</p>
                </div>
                <div className="sm:col-span-2 mt-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Description / Remarks</p>
                  <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {expense.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 px-6">
              <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-primary" />
                Linked Entities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle</p>
                  <Link href={`/admin/fleet/vehicles/${expense.vehicle?._id}`} className="text-base font-bold text-brand-primary hover:underline block mt-0.5">
                    {expense.vehicle?.vehicleNumber || 'Unknown'}
                  </Link>
                  {expense.vehicle?.type && <p className="text-sm text-gray-500">{expense.vehicle.type}</p>}
                </div>
              </div>
              
              {expense.driver && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0">
                    <UserCircle className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Driver</p>
                    <Link href={`/admin/fleet/drivers/${expense.driver._id}`} className="text-base font-bold text-brand-text-primary hover:underline block mt-0.5">
                      {expense.driver.name}
                    </Link>
                    <p className="text-sm text-gray-500">{expense.driver.phone}</p>
                  </div>
                </div>
              )}

              {expense.booking && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trip / LR</p>
                    <Link href={`/admin/bookings/${expense.booking._id}`} className="text-base font-bold text-blue-600 hover:underline block mt-0.5">
                      {expense.booking.lrNumber}
                    </Link>
                    <p className="text-sm text-gray-500">{expense.booking.deliveryLocation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
