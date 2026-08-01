import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/Expense';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Booking from '@/models/Booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Download, Calendar as CalendarIcon, Wallet } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/admin/Pagination';
import ListActions from '@/components/admin/ListActions';
import ExpensesFilter from '@/components/admin/ExpensesFilter';
import StatusFilter from '@/components/admin/StatusFilter';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ search?: string, type?: string, page?: string, startDate?: string, endDate?: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();
  
  // Prevent Next.js/Turbopack from tree-shaking the models used in populate
  Vehicle.init();
  Driver.init();
  Booking.init();
  
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const type = resolvedParams?.type || '';
  const startDate = resolvedParams?.startDate || '';
  const endDate = resolvedParams?.endDate || '';
  const page = parseInt(resolvedParams?.page || '1', 10);
  const limit = 15;
  
  // Build query
  const query: any = { isDeleted: { $ne: true } };
  const session = await getServerSession(authOptions);
  if (session && (session.user as any).role === 'logistic') {
    query.logisticId = (session.user as any).id;
  } else if (session && (session.user as any).logisticId) {
    query.logisticId = (session.user as any).logisticId;
  }
  
  if (session && ((session.user as any).role === 'branch_user' || (session.user as any).role === 'branch')) {
    query.branch = (session.user as any).branchId || (session.user as any).branch;
  }
  
  if (type) {
    query.expenseType = type;
  }
  
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const skip = (page - 1) * limit;

  // Fetch paginated expenses
  const expenses = await Expense.find(query)
    .populate('vehicle', 'vehicleNumber type')
    .populate('driver', 'name')
    .populate('booking', 'lrNumber')
    .populate('branch', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalExpenses = await Expense.countDocuments(query);
  const totalPages = Math.ceil(totalExpenses / limit);

  // Calculate totals for quick stats
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0,0,0,0);

  const monthExpenses = await Expense.aggregate([
    { $match: { isDeleted: { $ne: true }, date: { $gte: currentMonthStart } } },
    { $group: { _id: "$expenseType", total: { $sum: "$amount" } } }
  ]);

  let totalMonthAmount = 0;
  let totalFuel = 0;
  let totalMaintenance = 0;

  monthExpenses.forEach(exp => {
    totalMonthAmount += exp.total;
    if (exp._id === 'fuel') totalFuel += exp.total;
    if (exp._id === 'maintenance') totalMaintenance += exp.total;
  });

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">Expenses & Maintenance</h1>
          <p className="text-brand-text-secondary mt-1">Track fuel, tolls, repairs, and trip expenses.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/expenses/new">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 px-6 rounded-xl font-semibold shadow-md flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Log Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-primary-light font-medium text-sm mb-1">Total Expenses (This Month)</p>
                <h3 className="text-3xl font-bold">₹{totalMonthAmount.toLocaleString('en-IN')}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white border border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium text-sm mb-1">Fuel Expenses</p>
                <h3 className="text-3xl font-bold text-gray-800">₹{totalFuel.toLocaleString('en-IN')}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white border border-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium text-sm mb-1">Maintenance / Repair</p>
                <h3 className="text-3xl font-bold text-gray-800">₹{totalMaintenance.toLocaleString('en-IN')}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <CardTitle className="text-xl font-bold text-brand-text-primary whitespace-nowrap">Recent Expenses</CardTitle>
            <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center w-full xl:w-auto">
              <StatusFilter
                paramName="type"
                placeholder="All Types"
                options={[
                  { value: 'fuel', label: 'Fuel / Diesel' },
                  { value: 'toll', label: 'Toll Tax' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'driver_bhatta', label: 'Driver Bhatta' },
                  { value: 'rto_challan', label: 'RTO / Challan' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <ExpensesFilter />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100 whitespace-nowrap">
                  <th className="font-semibold p-4">Date</th>
                  <th className="font-semibold p-4">Type</th>
                  <th className="font-semibold p-4">Vehicle</th>
                  {(session?.user as any)?.role === 'logistic' && (
                    <th className="font-semibold p-4">Branch</th>
                  )}
                  <th className="font-semibold p-4">Driver / LR</th>
                  <th className="font-semibold p-4">Amount</th>
                  <th className="font-semibold p-4">Payment</th>
                  <th className="font-semibold p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p>No expenses logged yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense: any) => (
                    <tr key={expense._id.toString()} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border inline-block ${getExpenseColor(expense.expenseType)}`}>
                          {expense.expenseType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-brand-text-primary">
                        {expense.vehicle?.vehicleNumber || 'N/A'}
                      </td>
                      {(session?.user as any)?.role === 'logistic' && (
                        <td className="p-4">
                          {expense.branch ? (
                            <span className="font-semibold text-gray-800 text-sm">{expense.branch.name}</span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md border border-gray-200">Unassigned</span>
                          )}
                        </td>
                      )}
                      <td className="p-4 text-sm text-gray-600">
                        {expense.driver && <span className="block">{expense.driver.name}</span>}
                        {expense.booking && <span className="block text-xs text-brand-primary">{expense.booking.lrNumber}</span>}
                        {!expense.driver && !expense.booking && '-'}
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-sm capitalize text-gray-600">
                        {expense.paymentMethod}
                      </td>
                      <td className="p-4 text-right">
                        <ListActions 
                          id={expense._id.toString()} 
                          moduleName="expenses" 
                          viewUrl={`/admin/expenses/${expense._id}`} 
                          editUrl={`/admin/expenses/${expense._id}/edit`} 
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                <FileText className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
                <p className="text-sm font-medium">No expenses logged yet.</p>
              </div>
            ) : (
              expenses.map((expense: any) => (
                <div key={expense._id.toString()} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getExpenseColor(expense.expenseType)}`}>
                      {expense.expenseType.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-gray-800 text-sm">₹{expense.amount.toLocaleString('en-IN')}</span>
                  </div>
                  {(session?.user as any)?.role === 'logistic' && (
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-500 mb-0.5 uppercase font-bold tracking-wider">Branch</p>
                      <p className="text-sm font-semibold text-gray-800">{expense.branch?.name || <span className="text-gray-400 font-medium text-xs">Unassigned</span>}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-brand-text-primary text-sm">{expense.vehicle?.vehicleNumber || 'N/A'}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-gray-50">
                    <ListActions 
                      id={expense._id.toString()} 
                      moduleName="expenses" 
                      viewUrl={`/admin/expenses/${expense._id}`} 
                      editUrl={`/admin/expenses/${expense._id}/edit`} 
                    />
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
