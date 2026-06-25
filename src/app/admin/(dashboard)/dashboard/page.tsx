import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Expense from '@/models/Expense';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Users, IndianRupee, FileText } from 'lucide-react';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await getServerSession(authOptions);
  await connectToDatabase();

  // Prevent tree-shaking
  Vehicle.init();
  Driver.init();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // 1. Bookings Count
  const totalBookings = await Booking.countDocuments({ isDeleted: { $ne: true } });
  const currentMonthBookings = await Booking.countDocuments({ isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart } });
  const previousMonthBookings = await Booking.countDocuments({ isDeleted: { $ne: true }, bookingDate: { $gte: previousMonthStart, $lte: previousMonthEnd } });
  
  let bookingTrend = '';
  if (previousMonthBookings > 0) {
    const diff = currentMonthBookings - previousMonthBookings;
    const pct = (diff / previousMonthBookings) * 100;
    bookingTrend = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}% from last month`;
  } else {
    bookingTrend = `${currentMonthBookings} this month`;
  }

  // 2. Fleet Stats
  const activeVehicles = await Vehicle.countDocuments({ status: 'on-trip', isDeleted: { $ne: true } });
  const availableVehicles = await Vehicle.countDocuments({ status: 'available', isDeleted: { $ne: true } });
  const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance', isDeleted: { $ne: true } });
  const totalVehicles = await Vehicle.countDocuments({ isDeleted: { $ne: true } });

  // 3. Drivers
  const totalDrivers = await Driver.countDocuments({ isDeleted: { $ne: true } });

  // 4. Financials (Current Month)
  const currentRevenueAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart } } },
    { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
  ]);
  const currentRevenue = currentRevenueAgg[0]?.total || 0;

  const currentExpenseAgg = await Expense.aggregate([
    { $match: { isDeleted: { $ne: true }, date: { $gte: currentMonthStart } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const currentExpense = currentExpenseAgg[0]?.total || 0;
  const currentProfit = currentRevenue - currentExpense;

  // Previous Month Financials for Trend
  const prevRevenueAgg = await Booking.aggregate([
    { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: previousMonthStart, $lte: previousMonthEnd } } },
    { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
  ]);
  const prevRevenue = prevRevenueAgg[0]?.total || 0;

  let revenueTrend = '';
  if (prevRevenue > 0) {
    const diff = currentRevenue - prevRevenue;
    const pct = (diff / prevRevenue) * 100;
    revenueTrend = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}% from last month`;
  } else {
    revenueTrend = `₹${currentRevenue.toLocaleString('en-IN')} this month`;
  }

  // Generate Chart Data (Last 6 Months)
  const chartData = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Revenue
    const revAgg = await Booking.aggregate([
      { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: mStart, $lte: mEnd } } },
      { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
    ]);
    const rev = revAgg[0]?.total || 0;

    // Expenses
    const expAgg = await Expense.aggregate([
      { $match: { isDeleted: { $ne: true }, date: { $gte: mStart, $lte: mEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const exp = expAgg[0]?.total || 0;

    chartData.push({
      name: `${monthNames[mStart.getMonth()]}`,
      Revenue: rev,
      Expenses: exp,
      Profit: rev - exp
    });
  }

  // Recent Bookings
  const recentBookings = await Booking.find({ isDeleted: { $ne: true } })
    .sort({ bookingDate: -1 })
    .limit(5)
    .populate('consignee', 'name')
    .lean();

  const stats = [
    { title: 'Total Bookings', value: totalBookings.toLocaleString('en-IN'), icon: <Package className="w-6 h-6 text-brand-primary" />, trend: bookingTrend },
    { title: 'Active Vehicles', value: activeVehicles.toString(), icon: <Truck className="w-6 h-6 text-brand-info" />, trend: `${maintenanceVehicles} vehicles in maintenance` },
    { title: 'Total Drivers', value: totalDrivers.toString(), icon: <Users className="w-6 h-6 text-brand-secondary" />, trend: 'Registered drivers' },
    { title: 'Monthly Revenue', value: `₹${currentRevenue.toLocaleString('en-IN')}`, icon: <IndianRupee className="w-6 h-6 text-brand-success" />, trend: revenueTrend },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-primary">Dashboard Overview</h1>
        <p className="text-brand-text-secondary mt-1">Welcome back. Here is your live business overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm rounded-2xl hover:shadow-md transition-shadow bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-gray-50 rounded-xl">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-text-primary mb-2">{stat.value}</div>
              <p className="text-xs text-gray-500 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Chart & Fleet Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold text-brand-text-primary">Revenue vs Expenses</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Net Profit this month: <span className="font-bold text-brand-success">₹{currentProfit.toLocaleString('en-IN')}</span></p>
              </div>
            </CardHeader>
            <CardContent>
              <DashboardCharts data={chartData} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-brand-text-primary">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-brand-success/10 rounded-xl">
                  <span className="font-semibold text-brand-success flex items-center gap-2"><Truck className="w-5 h-5"/> In Transit</span>
                  <span className="font-bold text-xl">{activeVehicles}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-brand-info/10 rounded-xl">
                  <span className="font-semibold text-brand-info flex items-center gap-2"><Truck className="w-5 h-5"/> Available</span>
                  <span className="font-bold text-xl">{availableVehicles}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                  <span className="font-semibold text-red-500 flex items-center gap-2"><Truck className="w-5 h-5"/> Maintenance</span>
                  <span className="font-bold text-xl">{maintenanceVehicles}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white">
            <CardContent className="p-6">
              <h3 className="text-brand-primary-light font-medium text-sm mb-1">Total Net Profit (Last 6 Months)</h3>
              <p className="text-4xl font-bold">
                ₹{chartData.reduce((acc, curr) => acc + curr.Profit, 0).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl font-bold text-brand-text-primary">Recent Bookings (LR)</CardTitle>
          <Link href="/admin/bookings" className="text-sm font-semibold text-brand-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-semibold p-4">LR Number</th>
                  <th className="font-semibold p-4">Date</th>
                  <th className="font-semibold p-4">Consignee</th>
                  <th className="font-semibold p-4">Route</th>
                  <th className="font-semibold p-4">Amount</th>
                  <th className="font-semibold p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-300 mb-2" />
                        <p>No recent bookings.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking: any) => (
                    <tr key={booking._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-brand-primary">{booking.lrNumber}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-sm font-medium">{booking.consignee?.name || 'N/A'}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {booking.pickupLocation} &rarr; {booking.deliveryLocation}
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        ₹{booking.charges?.totalAmount?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border inline-block ${
                          booking.status === 'delivered' ? 'text-green-600 bg-green-50 border-green-200' :
                          booking.status === 'in_transit' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                          'text-orange-600 bg-orange-50 border-orange-200'
                        }`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
