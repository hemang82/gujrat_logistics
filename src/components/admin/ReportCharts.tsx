'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#42A5F5', '#64B5F6'];
const STATUS_COLORS: Record<string, string> = {
  delivered: '#22c55e',
  in_transit: '#3b82f6',
  pending: '#f59e0b',
  out_for_delivery: '#8b5cf6',
  cancelled: '#ef4444'
};

interface ReportChartsProps {
  monthlyData: { name: string; Revenue: number; Expenses: number; Profit: number }[];
  statusData: { name: string; value: number }[];
  topRoutes: { route: string; count: number; revenue: number }[];
  expenseBreakdown: { name: string; value: number }[];
}

export function ReportCharts({ monthlyData, statusData, topRoutes, expenseBreakdown }: ReportChartsProps) {
  return (
    <div className="space-y-8">
      {/* Revenue vs Expenses Area Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Revenue vs Expenses Trend</h3>
        <p className="text-sm text-gray-500 mb-4">Last 12 months comparison</p>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} dx={-10} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0 / 0.1)'}}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              <Area type="monotone" dataKey="Revenue" stroke="#0D47A1" fill="url(#colorRevenue)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="Expenses" stroke="#EF4444" fill="url(#colorExpenses)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column: Booking Status Pie + Expense Breakdown Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Booking Status Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">All time overview</p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Bookings']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Expense Category Breakdown</h3>
          <p className="text-sm text-gray-500 mb-4">Where your money goes</p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Routes Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Top 10 Routes by Revenue</h3>
        <p className="text-sm text-gray-500 mb-4">Most profitable routes</p>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topRoutes} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="route" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 11}} width={90} />
              <Tooltip
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0 / 0.1)'}}
                formatter={(value: any, name: any) => [name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value, name === 'revenue' ? 'Revenue' : 'Trips']}
              />
              <Bar dataKey="revenue" fill="#0D47A1" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
