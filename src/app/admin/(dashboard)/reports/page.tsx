import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Expense from '@/models/Expense';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Invoice from '@/models/Invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, TrendingDown, Truck, Package, Users, FileText, BarChart3 } from 'lucide-react';
import { ReportCharts } from '@/components/admin/ReportCharts';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await getServerSession(authOptions);
  await connectToDatabase();

  // Prevent tree-shaking
  Vehicle.init();
  Driver.init();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const financialYearStart = now.getMonth() >= 3 
    ? new Date(now.getFullYear(), 3, 1) 
    : new Date(now.getFullYear() - 1, 3, 1);

  // ---- Summary Stats ----
  const totalBookings = await Booking.countDocuments({ isDeleted: { $ne: true } });
  const totalVehicles = await Vehicle.countDocuments({ isDeleted: { $ne: true } });
  const totalDrivers = await Driver.countDocuments({ isDeleted: { $ne: true } });

  // Current month revenue
  const currentRevenueAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
    { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
  ]);
  const currentRevenue = currentRevenueAgg[0]?.total || 0;

  // Previous month revenue
  const prevRevenueAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
    { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
  ]);
  const prevRevenue = prevRevenueAgg[0]?.total || 0;

  // Current month expenses
  const currentExpenseAgg = await Expense.aggregate([
    { $match: { isDeleted: { $ne: true }, date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const currentExpense = currentExpenseAgg[0]?.total || 0;

  // Previous month expenses
  const prevExpenseAgg = await Expense.aggregate([
    { $match: { isDeleted: { $ne: true }, date: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const prevExpense = prevExpenseAgg[0]?.total || 0;

  const currentProfit = currentRevenue - currentExpense;
  const prevProfit = prevRevenue - prevExpense;

  // Financial Year totals
  const fyRevenueAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: financialYearStart } } },
    { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
  ]);
  const fyRevenue = fyRevenueAgg[0]?.total || 0;

  const fyExpenseAgg = await Expense.aggregate([
    { $match: { isDeleted: { $ne: true }, date: { $gte: financialYearStart } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const fyExpense = fyExpenseAgg[0]?.total || 0;

  // Total outstanding (invoices)
  const outstandingAgg = await Invoice.aggregate([
    { $group: { _id: null, totalBilled: { $sum: "$grandTotal" }, totalPaid: { $sum: "$amountPaid" } } }
  ]);
  const totalOutstanding = (outstandingAgg[0]?.totalBilled || 0) - (outstandingAgg[0]?.totalPaid || 0);

  // ---- Monthly Chart Data (Last 12 Months) ----
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = [];
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const revAgg = await Booking.aggregate([
      { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: mStart, $lte: mEnd } } },
      { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
    ]);
    const rev = revAgg[0]?.total || 0;

    const expAgg = await Expense.aggregate([
      { $match: { isDeleted: { $ne: true }, date: { $gte: mStart, $lte: mEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const exp = expAgg[0]?.total || 0;

    monthlyData.push({
      name: `${monthNames[mStart.getMonth()]} ${mStart.getFullYear().toString().slice(2)}`,
      Revenue: rev,
      Expenses: exp,
      Profit: rev - exp
    });
  }

  // ---- Booking Status Distribution ----
  const statusAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statusData = statusAgg.map(s => ({ name: s._id, value: s.count }));

  // ---- Top Routes ----
  const routesAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { 
      _id: { from: "$pickupLocation", to: "$deliveryLocation" }, 
      count: { $sum: 1 }, 
      revenue: { $sum: "$charges.totalAmount" } 
    }},
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  const topRoutes = routesAgg.map(r => ({ 
    route: `${r._id.from} → ${r._id.to}`, 
    count: r.count, 
    revenue: r.revenue 
  }));

  // ---- Expense Breakdown by Category ----
  const expBreakdownAgg = await Expense.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: "$expenseType", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ]);
  const expenseLabels: Record<string, string> = {
    fuel: 'Fuel / Diesel',
    toll: 'Toll Tax',
    maintenance: 'Maintenance',
    driver_bhatta: 'Driver Bhatta',
    rto_challan: 'RTO / Challan',
    other: 'Other'
  };
  const expenseBreakdown = expBreakdownAgg.map(e => ({ 
    name: expenseLabels[e._id] || e._id, 
    value: e.total 
  }));

  // ---- Vehicle Utilization ----
  const vehicleStatusAgg = await Vehicle.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const vehicleStatusMap: Record<string, number> = {};
  vehicleStatusAgg.forEach(v => { vehicleStatusMap[v._id] = v.count; });

  // ---- Helper ----
  function trendPct(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = ((current - previous) / previous) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-primary" />
            Reports & Analytics
          </h1>
          <p className="text-brand-text-secondary mt-1">
            Business performance overview — FY {financialYearStart.getFullYear()}-{financialYearStart.getFullYear() + 1}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">This Month Revenue</span>
              <div className="p-2 bg-blue-50 rounded-xl"><IndianRupee className="w-5 h-5 text-brand-primary" /></div>
            </div>
            <div className="text-2xl font-bold text-brand-text-primary">₹{currentRevenue.toLocaleString('en-IN')}</div>
            <p className={`text-xs font-semibold mt-1 ${currentRevenue >= prevRevenue ? 'text-green-600' : 'text-red-500'}`}>
              {trendPct(currentRevenue, prevRevenue)} vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">This Month Expenses</span>
              <div className="p-2 bg-red-50 rounded-xl"><TrendingDown className="w-5 h-5 text-red-500" /></div>
            </div>
            <div className="text-2xl font-bold text-brand-text-primary">₹{currentExpense.toLocaleString('en-IN')}</div>
            <p className={`text-xs font-semibold mt-1 ${currentExpense <= prevExpense ? 'text-green-600' : 'text-red-500'}`}>
              {trendPct(currentExpense, prevExpense)} vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Net Profit</span>
              <div className="p-2 bg-green-50 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            </div>
            <div className={`text-2xl font-bold ${currentProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              ₹{currentProfit.toLocaleString('en-IN')}
            </div>
            <p className={`text-xs font-semibold mt-1 ${currentProfit >= prevProfit ? 'text-green-600' : 'text-red-500'}`}>
              {trendPct(currentProfit, prevProfit)} vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Outstanding Dues</span>
              <div className="p-2 bg-orange-50 rounded-xl"><FileText className="w-5 h-5 text-orange-500" /></div>
            </div>
            <div className="text-2xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString('en-IN')}</div>
            <p className="text-xs font-semibold mt-1 text-gray-500">
              Total unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Year Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-200 uppercase tracking-wide">FY Total Revenue</p>
            <p className="text-3xl font-bold mt-2">₹{fyRevenue.toLocaleString('en-IN')}</p>
            <p className="text-sm text-blue-200 mt-1">{totalBookings} total bookings</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-200 uppercase tracking-wide">FY Total Expenses</p>
            <p className="text-3xl font-bold mt-2">₹{fyExpense.toLocaleString('en-IN')}</p>
            <p className="text-sm text-red-200 mt-1">{totalVehicles} vehicles, {totalDrivers} drivers</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-green-200 uppercase tracking-wide">FY Net Profit</p>
            <p className="text-3xl font-bold mt-2">₹{(fyRevenue - fyExpense).toLocaleString('en-IN')}</p>
            <p className="text-sm text-green-200 mt-1">
              Margin: {fyRevenue > 0 ? (((fyRevenue - fyExpense) / fyRevenue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ReportCharts 
        monthlyData={monthlyData} 
        statusData={statusData} 
        topRoutes={topRoutes}
        expenseBreakdown={expenseBreakdown}
      />

      {/* Vehicle Utilization + Business Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-primary" /> Vehicle Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="font-semibold text-green-700">Available</span>
                <span className="text-2xl font-bold text-green-700">{vehicleStatusMap['available'] || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="font-semibold text-blue-700">On Trip</span>
                <span className="text-2xl font-bold text-blue-700">{vehicleStatusMap['on-trip'] || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <span className="font-semibold text-orange-700">Maintenance</span>
                <span className="text-2xl font-bold text-orange-700">{vehicleStatusMap['maintenance'] || 0}</span>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Utilization Rate</span>
                  <span className="text-lg font-bold text-brand-primary">
                    {totalVehicles > 0 ? (((vehicleStatusMap['on-trip'] || 0) / totalVehicles) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-brand-primary h-2.5 rounded-full transition-all" 
                    style={{ width: `${totalVehicles > 0 ? ((vehicleStatusMap['on-trip'] || 0) / totalVehicles) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-primary" /> Key Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">Avg Revenue per Booking</span>
                <span className="text-lg font-bold text-brand-text-primary">
                  ₹{totalBookings > 0 ? Math.round(fyRevenue / totalBookings).toLocaleString('en-IN') : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">Avg Expense per Vehicle</span>
                <span className="text-lg font-bold text-brand-text-primary">
                  ₹{totalVehicles > 0 ? Math.round(fyExpense / totalVehicles).toLocaleString('en-IN') : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">Revenue per Vehicle</span>
                <span className="text-lg font-bold text-brand-text-primary">
                  ₹{totalVehicles > 0 ? Math.round(fyRevenue / totalVehicles).toLocaleString('en-IN') : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">Delivery Success Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {totalBookings > 0 ? ((statusData.find(s => s.name === 'delivered')?.value || 0) / totalBookings * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes Table */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Top Routes — Detailed View</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-semibold p-4">#</th>
                  <th className="font-semibold p-4">Route</th>
                  <th className="font-semibold p-4 text-center">Total Trips</th>
                  <th className="font-semibold p-4 text-right">Total Revenue</th>
                  <th className="font-semibold p-4 text-right">Avg per Trip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topRoutes.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No route data available.</td></tr>
                ) : topRoutes.map((route, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-400">{idx + 1}</td>
                    <td className="p-4 font-semibold text-brand-text-primary">{route.route}</td>
                    <td className="p-4 text-center">{route.count}</td>
                    <td className="p-4 text-right font-bold text-brand-primary">₹{route.revenue.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right text-sm text-gray-600">₹{Math.round(route.revenue / route.count).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
