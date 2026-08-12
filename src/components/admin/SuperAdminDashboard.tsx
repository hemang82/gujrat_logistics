import React from 'react';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Booking from '@/models/Booking';
import ApiLog from '@/models/ApiLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { Activity, Database, TrendingUp, Building2, Server } from 'lucide-react';

export default async function SuperAdminDashboard() {
  await connectToDatabase();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // 1. Logistic Companies Activity (Most active this month)
  const logistics = await User.find({ role: 'logistic', isDeleted: { $ne: true } })
    .select('name email ewbApiQuota')
    .lean();

  const logisticStats = await Promise.all(
    logistics.map(async (logistic: any) => {
      // Bookings this month
      const bookingsCount = await Booking.countDocuments({
        logisticId: logistic._id,
        isDeleted: { $ne: true },
        bookingDate: { $gte: currentMonthStart }
      });

      // API Usage all time or this month (Let's do total for quota calculation)
      const apiUsed = await ApiLog.countDocuments({
        userId: logistic._id,
        responseStatus: 'success'
      });

      return {
        id: logistic._id,
        name: logistic.name,
        email: logistic.email,
        bookingsThisMonth: bookingsCount,
        ewbQuota: logistic.ewbApiQuota || 0,
        ewbUsed: apiUsed
      };
    })
  );

  // Sort by bookings descending
  logisticStats.sort((a, b) => b.bookingsThisMonth - a.bookingsThisMonth);

  // 2. System Wide Chart Data (Last 6 Months)
  const chartData = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let totalSystemBookings = 0;
  let totalSystemRevenue = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const revAgg = await Booking.aggregate([
      { $match: { isDeleted: { $ne: true }, bookingDate: { $gte: mStart, $lte: mEnd } } },
      { $group: { _id: null, totalRev: { $sum: "$charges.totalAmount" }, count: { $sum: 1 } } }
    ]);
    
    const rev = revAgg[0]?.totalRev || 0;
    const count = revAgg[0]?.count || 0;

    totalSystemBookings += count;
    totalSystemRevenue += rev;

    chartData.push({
      name: `${monthNames[mStart.getMonth()]}`,
      Revenue: rev,
      Bookings: count
    });
  }

  const activeLogisticsCount = logisticStats.filter(l => l.bookingsThisMonth > 0).length;
  const totalApiUsedSystem = logisticStats.reduce((acc, curr) => acc + curr.ewbUsed, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-primary">Super Admin Analytics</h1>
        <p className="text-brand-text-secondary mt-1">Platform-wide overview of logistic companies and system growth.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Total Logistics</CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl"><Building2 className="w-5 h-5 text-blue-600"/></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{logistics.length}</div>
            <p className="text-xs text-gray-500 mt-1">{activeLogisticsCount} active this month</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">System Bookings (6M)</CardTitle>
            <div className="p-2 bg-brand-primary/10 rounded-xl"><Activity className="w-5 h-5 text-brand-primary"/></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalSystemBookings.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">Total LRs generated</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Platform Value (6M)</CardTitle>
            <div className="p-2 bg-green-50 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600"/></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₹{totalSystemRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">Total booking value</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">E-Way Bills Fetched</CardTitle>
            <div className="p-2 bg-purple-50 rounded-xl"><Server className="w-5 h-5 text-purple-600"/></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalApiUsedSystem.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500 mt-1">Total API calls made</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* System Growth Chart */}
        <div className="xl:col-span-2">
          <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-brand-text-primary">Platform Growth (6 Months)</CardTitle>
              <p className="text-sm text-gray-500">Total revenue generated across all logistic companies</p>
            </CardHeader>
            <CardContent>
              <DashboardCharts data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* EWB API Usage */}
        <div>
          <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-brand-text-primary">EWB API Usage</CardTitle>
              <p className="text-sm text-gray-500">Quota consumption by active logistics</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
                {logisticStats.filter(l => l.ewbQuota > 0 || l.ewbUsed > 0).map(logistic => {
                  const percent = logistic.ewbQuota > 0 ? Math.min(100, Math.round((logistic.ewbUsed / logistic.ewbQuota) * 100)) : (logistic.ewbUsed > 0 ? 100 : 0);
                  const isHigh = percent >= 80;
                  return (
                    <div key={logistic.id.toString()} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-800 truncate pr-2">{logistic.name}</span>
                        <span className={`font-semibold ${isHigh ? 'text-red-500' : 'text-gray-500'}`}>
                          {logistic.ewbUsed} / {logistic.ewbQuota}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : 'bg-brand-primary'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {logisticStats.filter(l => l.ewbQuota > 0 || l.ewbUsed > 0).length === 0 && (
                  <p className="text-center text-gray-500 text-sm mt-4">No API usage recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logistic Activity Table */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-brand-text-primary">Logistic Companies Activity</CardTitle>
          <p className="text-sm text-gray-500">Sorted by most bookings generated this month</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100 uppercase tracking-wider font-bold">
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Bookings (This Month)</th>
                  <th className="p-4">API Usage</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {logisticStats.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No logistic companies found.</td></tr>
                ) : (
                  logisticStats.map((logistic) => (
                    <tr key={logistic.id.toString()} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-primary" />
                          {logistic.name}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{logistic.email}</td>
                      <td className="p-4">
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                          {logistic.bookingsThisMonth} LRs
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-semibold text-gray-500">
                          {logistic.ewbUsed} calls
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${logistic.bookingsThisMonth > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {logistic.bookingsThisMonth > 0 ? 'ACTIVE' : 'IDLE'}
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
