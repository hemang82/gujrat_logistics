'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Zap, 
  PackagePlus, 
  Layers, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Wallet, 
  ArrowUpRight,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

interface DayActivity {
  day: string;
  dateStr: string;
  bookings: number;
  revenue: number;
}

interface RateTypeSplit {
  paid: { count: number; amount: number; pct: number };
  toPay: { count: number; amount: number; pct: number };
  tbb: { count: number; amount: number; pct: number };
  total: number;
}

interface TopDestination {
  name: string;
  count: number;
  maxCount: number;
}

interface ChallanDayActivity {
  day: string;
  dateStr: string;
  challans: number;
}

export function DashboardAnalytics({
  last7DaysData,
  rateTypeSplit,
  topDestinations = [],
  challan7DaysData = []
}: {
  last7DaysData: DayActivity[];
  rateTypeSplit: RateTypeSplit;
  topDestinations?: TopDestination[];
  challan7DaysData?: ChallanDayActivity[];
}) {
  const quickActions = [
    {
      title: 'New Booking',
      subtitle: 'Create LR (Consignment)',
      href: '/admin/bookings/new',
      icon: PackagePlus,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      hoverBorder: 'hover:border-indigo-300 hover:bg-indigo-50/40'
    },
    {
      title: 'Booking List',
      subtitle: 'Manage & Track LRs',
      href: '/admin/bookings',
      icon: Layers,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      hoverBorder: 'hover:border-emerald-300 hover:bg-emerald-50/40'
    },
    {
      title: 'Create Challan',
      subtitle: 'Dispatch Lorry Manifest',
      href: '/admin/challans/new',
      icon: Truck,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      hoverBorder: 'hover:border-amber-300 hover:bg-amber-50/40'
    },
    {
      title: 'Challan List',
      subtitle: 'Transit & Dispatches',
      href: '/admin/challans',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      hoverBorder: 'hover:border-blue-300 hover:bg-blue-50/40'
    },
    {
      title: 'Delivery Entry',
      subtitle: 'Mark Delivered / OTP',
      href: '/admin/delivery/delivery-entry',
      icon: CheckCircle2,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      hoverBorder: 'hover:border-rose-300 hover:bg-rose-50/40'
    },
    {
      title: 'Branch Cash Ledger',
      subtitle: 'Daily Day-Book (Rojmel)',
      href: '/admin/accounts/branch-ledger',
      icon: Wallet,
      iconBg: 'bg-teal-50 text-brand-primary border-teal-100',
      hoverBorder: 'hover:border-teal-300 hover:bg-teal-50/40'
    }
  ];

  const rankColorStyles = [
    { circle: 'bg-amber-100 text-amber-800 border-amber-200', bar: 'bg-amber-500', text: 'text-amber-600' },
    { circle: 'bg-purple-100 text-purple-800 border-purple-200', bar: 'bg-purple-500', text: 'text-purple-600' },
    { circle: 'bg-emerald-100 text-emerald-800 border-emerald-200', bar: 'bg-emerald-500', text: 'text-emerald-600' },
    { circle: 'bg-blue-100 text-blue-800 border-blue-200', bar: 'bg-blue-500', text: 'text-blue-600' },
    { circle: 'bg-rose-100 text-rose-800 border-rose-200', bar: 'bg-rose-500', text: 'text-rose-600' }
  ];

  const totalWeekChallans = challan7DaysData.reduce((acc, curr) => acc + curr.challans, 0);

  return (
    <div className="space-y-6">
      
      {/* ROW 1: 7-Day Activity Chart + Quick Access Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Booking Activity — Last 7 Days (2 Columns) */}
        <Card className="lg:col-span-2 border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/50 px-5 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <CardTitle className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Booking Activity &mdash; Last 7 Days
              </CardTitle>
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand-primary bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
              Live Data
            </span>
          </CardHeader>
          <CardContent className="pt-4 pb-3 px-2 sm:px-6 flex-1 flex flex-col justify-center">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007A65" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#007A65" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    dy={8}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                    formatter={(val: any) => [`${val} LRs Booked`, 'Bookings']}
                    labelFormatter={(lbl, items) => {
                      const itm = items && items[0]?.payload;
                      return itm ? `${itm.day} (${itm.dateStr})` : String(lbl);
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#007A65" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#bookingGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Panel (Matching Reference Style, 1 Column) */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/50 px-5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-primary" />
              <CardTitle className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Quick Access
              </CardTitle>
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              Shortcuts
            </span>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100/80 bg-slate-50/50 ${action.hoverBorder} transition-all duration-200 group cursor-pointer shadow-2xs`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-2xs shrink-0 group-hover:scale-105 transition-transform ${action.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 group-hover:text-slate-900 truncate">
                        {action.title}
                      </p>
                      <p className="text-[10.5px] font-medium text-slate-500 truncate">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

      </div>

      {/* ROW 2: 3 Operational Insights (Rate Type Split, Top Destinations, Challan Dispatch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1: Today — Rate Type Split */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/50 px-5">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-primary" />
              <CardTitle className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Today &mdash; Rate Type Split
              </CardTitle>
            </div>
            <span className="text-[11px] font-black text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
              {rateTypeSplit.total} LRs
            </span>
          </CardHeader>

          <CardContent className="pt-4 pb-4 px-5 space-y-3.5 flex-1 flex flex-col justify-center">
            {rateTypeSplit.total === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center text-slate-400">
                <PieChart className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No Bookings Recorded Today</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Rate breakdown will appear as LRs are created.</p>
              </div>
            ) : (
              <>
                {/* Paid Row */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                      Paid (Advance)
                    </span>
                    <span className="font-black text-slate-900">
                      {rateTypeSplit.paid.count} LRs &bull; {rateTypeSplit.paid.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${rateTypeSplit.paid.pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold text-right">
                    ₹{rateTypeSplit.paid.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* To-Pay Row */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
                      To-Pay (COD)
                    </span>
                    <span className="font-black text-slate-900">
                      {rateTypeSplit.toPay.count} LRs &bull; {rateTypeSplit.toPay.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${rateTypeSplit.toPay.pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold text-right">
                    ₹{rateTypeSplit.toPay.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* TBB Row */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-teal-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-primary inline-block shadow-xs"></span>
                      TBB (Account / Bill)
                    </span>
                    <span className="font-black text-slate-900">
                      {rateTypeSplit.tbb.count} LRs &bull; {rateTypeSplit.tbb.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full transition-all duration-500" 
                      style={{ width: `${rateTypeSplit.tbb.pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold text-right">
                    ₹{rateTypeSplit.tbb.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Top Destinations — This Month (Matching Image 2 Top Card) */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/50 px-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-primary" />
              <CardTitle className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Top Destinations &mdash; This Month
              </CardTitle>
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
              Top 5
            </span>
          </CardHeader>

          <CardContent className="pt-4 pb-4 px-5 space-y-3.5 flex-1 flex flex-col justify-center">
            {topDestinations.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center text-slate-400">
                <MapPin className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No Destination Bookings This Month</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ranked destination volume will show here automatically.</p>
              </div>
            ) : (
              topDestinations.map((dest, idx) => {
                const style = rankColorStyles[idx % rankColorStyles.length];
                const pct = dest.maxCount > 0 ? Math.max(12, Math.round((dest.count / dest.maxCount) * 100)) : 10;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-black border shrink-0 ${style.circle}`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-black text-slate-800 tracking-wide truncate uppercase">
                          {dest.name}
                        </span>
                      </div>
                      <span className={`text-xs font-black shrink-0 ${style.text}`}>
                        {dest.count}
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${style.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Card 3: Challan Dispatch — 7 Days (Matching Image 2 Bottom Card) */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/50 px-5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Challan Dispatch &mdash; 7 Days
              </CardTitle>
            </div>
            <span className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md shadow-2xs">
              {totalWeekChallans} Challans
            </span>
          </CardHeader>

          <CardContent className="pt-4 pb-2 px-2 sm:px-4 flex-1 flex flex-col justify-center">
            <div className="w-full h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={challan7DaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10.5, fontWeight: 700 }}
                    dy={6}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10.5, fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#fef3c7', opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #fde68a',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                    formatter={(val: any) => [`${val} Challans`, 'Dispatched']}
                    labelFormatter={(lbl, items) => {
                      const itm = items && items[0]?.payload;
                      return itm ? `${itm.day} (${itm.dateStr})` : String(lbl);
                    }}
                  />
                  <Bar 
                    dataKey="challans" 
                    fill="#F59E0B" 
                    radius={[5, 5, 0, 0]} 
                    maxBarSize={32} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
