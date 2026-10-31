import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import Challan from '@/models/Challan';
import Expense from '@/models/Expense';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Branch from '@/models/Branch';
import Client from '@/models/Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Truck, 
  Users, 
  IndianRupee, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Boxes, 
  Clock, 
  Navigation,
  Building2,
  CalendarDays,
  ShieldAlert,
  Scale,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { DashboardAnalytics } from '@/components/admin/DashboardAnalytics';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatDate } from '@/lib/dateUtils';
import SuperAdminDashboard from '@/components/admin/SuperAdminDashboard';

export const dynamic = 'force-dynamic';

function formatCompactCurrency(val: number) {
  if (!val || val === 0) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

function formatCompactNumber(val: number) {
  if (!val || val === 0) return '0';
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 10000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString('en-IN');
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (session && (session.user as any).role === 'superadmin') {
    return <SuperAdminDashboard />;
  }

  await connectToDatabase();

  const baseQuery: any = {};
  if (session && (session.user as any).role === 'logistic') {
    baseQuery.logisticId = (session.user as any).id;
  } else if (session && (session.user as any).logisticId) {
    baseQuery.logisticId = (session.user as any).logisticId;
  }

  // Branch Scope Check: If branch user, restrict to their specific branch
  const isBranchUser = session && (session.user as any).role === 'branch';
  let activeBranchDoc: any = null;

  if (isBranchUser) {
    const userBranch = (session.user as any).branch;
    activeBranchDoc = await Branch.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userBranch) ? userBranch : null },
        { code: userBranch }
      ]
    }).lean();
  }

  const bookingScope: any = { ...baseQuery };
  const challanScope: any = { ...baseQuery };
  const deliveryScope: any = { ...baseQuery, status: { $ne: 'delivered' }, isDeleted: { $ne: true } };

  if (activeBranchDoc) {
    bookingScope.$or = [
      { bookingBranch: activeBranchDoc._id },
      { branch: activeBranchDoc._id }
    ];
    challanScope.branch = activeBranchDoc._id;
    deliveryScope.destinationBranch = activeBranchDoc._id;
  }

  // Initialize models
  Booking.init();
  Challan.init();
  Vehicle.init();
  Driver.init();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0);
  const next15Days = new Date(now);
  next15Days.setDate(now.getDate() + 15);

  // Parallelize ALL database queries using Promise.all to eliminate sequential round-trip blocking
  const [
    todayBookingsCount,
    currentMonthBookings,
    todayRevenueAgg,
    currentRevenueAgg,
    todayChallansCount,
    currentMonthChallans,
    todayPackagesAgg,
    pendingDeliveriesCount,
    activeVehicles,
    availableVehicles,
    maintenanceVehicles,
    totalVehicles,
    last7DaysBookingsAgg,
    last7DaysChallansAgg,
    rateTypeAgg,
    topDestAgg,
    topConsignorsAgg,
    currentExpenseAgg,
    sixMonthsBookingsAgg,
    sixMonthsExpenseAgg,
    recentBookings,
    expiringVehicles
  ] = await Promise.all([
    // 1. TODAY BOOKINGS & MONTH BOOKINGS
    Booking.countDocuments({ ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: todayStart, $lte: todayEnd } }),
    Booking.countDocuments({ ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart } }),

    // 2. TODAY REVENUE & MONTH REVENUE
    Booking.aggregate([
      { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
    ]),
    Booking.aggregate([
      { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: "$charges.totalAmount" } } }
    ]),

    // 3. TODAY CHALLANS & MONTH CHALLANS
    Challan.countDocuments({ ...challanScope, isDeleted: { $ne: true }, challanDate: { $gte: todayStart, $lte: todayEnd } }),
    Challan.countDocuments({ ...challanScope, isDeleted: { $ne: true }, challanDate: { $gte: currentMonthStart } }),

    // 4. TODAY PACKAGES & WEIGHT
    Booking.aggregate([
      { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: todayStart, $lte: todayEnd } } },
      {
        $project: {
          itemPackages: { $sum: "$items.packages" },
          materialQty: "$material.quantity",
          itemWeight: { $sum: "$items.weight" },
          materialWt: "$material.weight"
        }
      },
      {
        $group: {
          _id: null,
          totalPackages: { 
            $sum: { 
              $cond: [
                { $gt: ["$itemPackages", 0] }, 
                "$itemPackages", 
                { $ifNull: ["$materialQty", 0] }
              ] 
            } 
          },
          totalWeight: { 
            $sum: { 
              $cond: [
                { $gt: ["$itemWeight", 0] }, 
                "$itemWeight", 
                { $ifNull: ["$materialWt", 0] }
              ] 
            } 
          }
        }
      }
    ]),

    // 5. PENDING DELIVERIES
    Booking.countDocuments(deliveryScope),

    // 6. FLEET COUNTS
    Vehicle.countDocuments({ ...baseQuery, status: 'on-trip', isDeleted: { $ne: true } }),
    Vehicle.countDocuments({ ...baseQuery, status: 'available', isDeleted: { $ne: true } }),
    Vehicle.countDocuments({ ...baseQuery, status: 'maintenance', isDeleted: { $ne: true } }),
    Vehicle.countDocuments({ ...baseQuery, isDeleted: { $ne: true } }),

    // 7. LAST 7 DAYS BOOKINGS (Aggregated in a single query instead of 7 sequential queries)
    Booking.aggregate([
      { 
        $match: { 
          ...bookingScope, 
          isDeleted: { $ne: true }, 
          $or: [
            { bookingDate: { $gte: sevenDaysAgo } },
            { createdAt: { $gte: sevenDaysAgo } }
          ]
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: { $ifNull: ["$bookingDate", "$createdAt"] },
              timezone: "+05:30"
            } 
          },
          count: { $sum: 1 },
          revenue: { $sum: "$charges.totalAmount" }
        }
      }
    ]),

    // 8. LAST 7 DAYS CHALLANS (Aggregated in a single query instead of 7 sequential queries)
    Challan.aggregate([
      { 
        $match: { 
          ...challanScope, 
          isDeleted: { $ne: true }, 
          $or: [
            { challanDate: { $gte: sevenDaysAgo } },
            { createdAt: { $gte: sevenDaysAgo } }
          ]
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: { $ifNull: ["$challanDate", "$createdAt"] },
              timezone: "+05:30"
            } 
          },
          count: { $sum: 1 }
        }
      }
    ]),

    // 9. RATE TYPE SPLIT
    Booking.aggregate([
      { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: todayStart, $lte: todayEnd } } },
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$rateType", "$paymentCondition"] } },
          count: { $sum: 1 },
          amount: { $sum: "$charges.totalAmount" }
        }
      }
    ]),

    // 10. TOP DESTINATIONS
    Booking.aggregate([
      { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart } } },
      { $group: { _id: { $ifNull: ["$destinationBranch", "$deliveryLocation"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),

    // 11. TOP CONSIGNORS
    Booking.aggregate([
      { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: currentMonthStart } } },
      {
        $group: {
          _id: { $toUpper: { $trim: { input: { $ifNull: ["$consignor.name", "Unknown"] } } } },
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ["$charges.totalAmount", 0] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]),

    // 12. CURRENT EXPENSE
    Expense.aggregate([
      { $match: { ...baseQuery, isDeleted: { $ne: true }, date: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),

    // 13. SIX MONTHS REVENUE (Single query instead of 6 loops)
    Booking.aggregate([
      { $match: { ...baseQuery, isDeleted: { $ne: true }, bookingDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$bookingDate" } },
          revenue: { $sum: "$charges.totalAmount" }
        }
      }
    ]),

    // 14. SIX MONTHS EXPENSES (Single query instead of 6 loops)
    Expense.aggregate([
      { $match: { ...baseQuery, isDeleted: { $ne: true }, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          expense: { $sum: "$amount" }
        }
      }
    ]),

    // 15. RECENT BOOKINGS
    Booking.find({ ...bookingScope, isDeleted: { $ne: true } })
      .sort({ bookingDate: -1, createdAt: -1 })
      .limit(5)
      .populate('consignee', 'name')
      .populate('bookingBranch', 'name')
      .populate('branch', 'name')
      .populate('destinationBranch', 'name')
      .lean(),

    // 16. EXPIRING VEHICLES
    Vehicle.find({
      ...baseQuery, 
      isDeleted: { $ne: true }, 
      $or: [
        { rcExpiry: { $lte: next15Days } },
        { insuranceExpiry: { $lte: next15Days } },
        { fitnessExpiry: { $lte: next15Days } },
        { nationalPermitExpiry: { $lte: next15Days } }
      ]
    }).select('vehicleNumber rcExpiry insuranceExpiry fitnessExpiry nationalPermitExpiry').lean()
  ]);

  const todayRevenue = todayRevenueAgg[0]?.total || 0;
  const currentMonthRevenue = currentRevenueAgg[0]?.total || 0;
  const todayPackages = todayPackagesAgg[0]?.totalPackages || 0;
  const todayWeight = todayPackagesAgg[0]?.totalWeight || 0;
  const currentMonthExpense = currentExpenseAgg[0]?.total || 0;
  const currentMonthProfit = currentMonthRevenue - currentMonthExpense;

  // Process Last 7 Days Booking Activity in-memory
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bookingDayMap = new Map((last7DaysBookingsAgg || []).map((b: any) => [b._id, b]));
  const last7DaysData: { day: string; dateStr: string; bookings: number; revenue: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = format(target, 'yyyy-MM-dd');
    const match = bookingDayMap.get(key);
    last7DaysData.push({
      day: i === 0 ? 'Today' : dayNames[target.getDay()],
      dateStr: format(target, 'dd MMM'),
      bookings: match?.count || 0,
      revenue: match?.revenue || 0
    });
  }

  // Process Last 7 Days Challan Dispatch in-memory
  const challanDayMap = new Map((last7DaysChallansAgg || []).map((c: any) => [c._id, c]));
  const challan7DaysData: { day: string; dateStr: string; challans: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = format(target, 'yyyy-MM-dd');
    const match = challanDayMap.get(key);
    challan7DaysData.push({
      day: i === 0 ? 'Today' : `${dayNames[target.getDay()].slice(0, 3)} ${target.getDate()}`,
      dateStr: format(target, 'dd MMM'),
      challans: match?.count || 0
    });
  }

  // Process Rate Type Split in-memory
  let paidCount = 0, paidAmount = 0;
  let toPayCount = 0, toPayAmount = 0;
  let tbbCount = 0, tbbAmount = 0;

  rateTypeAgg.forEach(r => {
    const key = (r._id || '').toLowerCase();
    if (key.includes('paid')) {
      paidCount += r.count;
      paidAmount += r.amount;
    } else if (key.includes('pay') || key.includes('to_pay')) {
      toPayCount += r.count;
      toPayAmount += r.amount;
    } else if (key.includes('tbb') || key.includes('bill')) {
      tbbCount += r.count;
      tbbAmount += r.amount;
    } else {
      toPayCount += r.count;
      toPayAmount += r.amount;
    }
  });

  const totalRateBookings = paidCount + toPayCount + tbbCount;
  const rateTypeSplit = {
    paid: { 
      count: paidCount, 
      amount: paidAmount, 
      pct: totalRateBookings > 0 ? Math.round((paidCount / totalRateBookings) * 100) : 0 
    },
    toPay: { 
      count: toPayCount, 
      amount: toPayAmount, 
      pct: totalRateBookings > 0 ? Math.round((toPayCount / totalRateBookings) * 100) : 0 
    },
    tbb: { 
      count: tbbCount, 
      amount: tbbAmount, 
      pct: totalRateBookings > 0 ? Math.round((tbbCount / totalRateBookings) * 100) : 0 
    },
    total: totalRateBookings
  };

  // Process Top Destinations (Fetch all branch names in a single query)
  const branchIds = topDestAgg
    .map((item: any) => item._id)
    .filter((id: any) => id && mongoose.isValidObjectId(id));
  
  const branchDocs = branchIds.length > 0
    ? await Branch.find({ _id: { $in: branchIds } }).select('name city code').lean() as any[]
    : [];
  const branchNameMap = new Map(branchDocs.map(b => [b._id.toString(), b.city || b.name || b.code]));

  const maxDestCount = topDestAgg[0]?.count || 1;
  const topDestinations = topDestAgg.map((item: any) => {
    let destName = 'Unknown';
    if (item._id) {
      if (branchNameMap.has(String(item._id))) {
        destName = branchNameMap.get(String(item._id));
      } else {
        destName = String(item._id);
      }
    }
    return {
      name: destName.toUpperCase(),
      count: item.count,
      maxCount: maxDestCount
    };
  });

  // Top Consignors
  const topConsignors = topConsignorsAgg.filter((c: any) => c._id && c._id !== 'UNKNOWN');

  // Process 6-Month Chart Data in-memory
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revMap = new Map((sixMonthsBookingsAgg || []).map((r: any) => [r._id, r.revenue]));
  const expMap = new Map((sixMonthsExpenseAgg || []).map((e: any) => [e._id, e.expense]));
  const chartData: { name: string; Revenue: number; Expenses: number; Profit: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = format(d, 'yyyy-MM');
    const rev = revMap.get(key) || 0;
    const exp = expMap.get(key) || 0;
    chartData.push({
      name: `${monthNames[d.getMonth()]}`,
      Revenue: rev,
      Expenses: exp,
      Profit: rev - exp
    });
  }

  const alerts: any[] = [];
  expiringVehicles.forEach((v: any) => {
    const docs = [
      { name: 'RC', date: v.rcExpiry },
      { name: 'Insurance', date: v.insuranceExpiry },
      { name: 'Fitness', date: v.fitnessExpiry },
      { name: 'Permit', date: v.nationalPermitExpiry }
    ];

    docs.forEach(doc => {
      if (doc.date && new Date(doc.date) <= next15Days) {
        const diffDays = Math.ceil((new Date(doc.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          vehicle: v.vehicleNumber,
          document: doc.name,
          daysLeft: diffDays,
          isExpired: diffDays < 0,
          date: doc.date
        });
      }
    });
  });

  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  const formattedHeaderDate = format(now, 'EEEE, dd MMMM yyyy');
  const activeTitle = isBranchUser && activeBranchDoc 
    ? `${activeBranchDoc.name} Branch Dashboard` 
    : 'Logistics Command Center';

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header with Date and Active Scope */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {activeTitle}
            </h1>
            {isBranchUser && activeBranchDoc && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-brand-primary border border-emerald-200 shrink-0">
                <Building2 className="w-3.5 h-3.5" />
                {activeBranchDoc.code || 'BRANCH'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Live operational performance and real-time transit tracking.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs whitespace-nowrap">
          <CalendarDays className="w-4 h-4 text-brand-primary shrink-0" />
          <span>{formattedHeaderDate}</span>
        </div>
      </div>

      {/* 6 High-Performance Operational KPI Cards (Clickable & Light Premium Theme Sync) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* Card 1: TODAY BOOKINGS -> Navigates to Bookings List */}
        <Link 
          href="/admin/bookings"
          className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[148px] group cursor-pointer"
          title="Click to view all Bookings / LRs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
              Today Bookings
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-indigo-500" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{todayBookingsCount}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Month: {currentMonthBookings}</span>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
        </Link>

        {/* Card 2: TODAY REVENUE -> Navigates to Branch Ledger or Billing Invoices */}
        <Link 
          href={isBranchUser ? "/admin/accounts/branch-ledger" : "/admin/billing"}
          className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#007A65] hover:ring-2 hover:ring-[#007A65]/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[148px] group cursor-pointer"
          title={isBranchUser ? "Click to view Branch Cash Ledger" : "Click to view Billing & Invoices"}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-[#007A65] transition-colors flex items-center gap-1">
              Today Revenue
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-[#007A65]" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-primary border border-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <IndianRupee className="w-4 h-4 text-[#007A65]" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#007A65] tracking-tight">{formatCompactCurrency(todayRevenue)}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Month: {formatCompactCurrency(currentMonthRevenue)}</span>
            <span className="text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <TrendingUp className="w-3 h-3 text-[#007A65]" />
              Tracking
            </span>
          </div>
        </Link>

        {/* Card 3: TODAY CHALLANS -> Navigates to Challans List */}
        <Link 
          href="/admin/challans"
          className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[148px] group cursor-pointer"
          title="Click to view all Lorry Challans"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors flex items-center gap-1">
              Today Challans
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-amber-500" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{todayChallansCount}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Month: {currentMonthChallans}</span>
            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <Truck className="w-3 h-3 text-amber-600" />
              Dispatched
            </span>
          </div>
        </Link>

        {/* Card 4: TODAY PACKAGES -> Navigates to Booking Summary Report (Weight & Packages breakdown) */}
        <Link 
          href="/admin/reports/booking-summary"
          className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[148px] group cursor-pointer"
          title="Click to view Packages & Weight Summary Report"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              Today Packages
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-blue-500" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{todayPackages}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 truncate">
              {todayWeight > 0 ? `${todayWeight.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg` : '0 kg'}
            </span>
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <Scale className="w-3 h-3 text-blue-600" />
              Measured
            </span>
          </div>
        </Link>

        {/* Card 5: PENDING DELIVERIES -> Navigates to Delivery Entry List */}
        <Link 
          href="/admin/delivery/delivery-entry"
          className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-500 hover:ring-2 hover:ring-rose-500/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[148px] group cursor-pointer"
          title="Click to view Pending Deliveries"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-rose-600 transition-colors flex items-center gap-1">
              Pending Deliveries
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-rose-500" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{pendingDeliveriesCount}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Requires action</span>
            <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Alert
            </span>
          </div>
        </Link>

        {/* Card 6: ACTIVE TRUCKS -> Navigates to Vehicles List */}
        <Link 
          href="/admin/fleet/vehicles"
          className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-600 hover:ring-2 hover:ring-purple-600/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[148px] group cursor-pointer"
          title="Click to view Fleet & Vehicles"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-purple-600 transition-colors flex items-center gap-1">
              Active Trucks
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-purple-500" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{activeVehicles}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{availableVehicles} available</span>
            <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <Navigation className="w-3 h-3 text-purple-600" />
              In transit
            </span>
          </div>
        </Link>

      </div>

      {/* Middle Analytics: 7-Day Activity Chart + Quick Access + Rate Split + Top Destinations + Challans */}
      <DashboardAnalytics 
        last7DaysData={last7DaysData} 
        rateTypeSplit={rateTypeSplit}
        topDestinations={topDestinations}
        challan7DaysData={challan7DaysData}
      />

      {/* Financial Chart & Fleet Alerts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 bg-slate-50/50">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Monthly Revenue vs Expenses</CardTitle>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Net Profit this month: <span className="font-extrabold text-emerald-600">₹{currentMonthProfit.toLocaleString('en-IN')}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <DashboardCharts data={chartData} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Top Consignors — This Month (Matching Image & Trust Logistic Theme) */}
          <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3.5 px-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <CardTitle className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                  Top Consignors &mdash; This Month
                </CardTitle>
              </div>
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                Top 5
              </span>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2.5">
              {topConsignors.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No Consignor Bookings Recorded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Top revenue consignors will display here this month.</p>
                </div>
              ) : (
                topConsignors.map((c, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-black text-slate-800 text-xs uppercase tracking-wide truncate">
                        {c._id}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {c.bookingsCount} {c.bookingsCount === 1 ? 'booking' : 'bookings'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-xs sm:text-sm text-brand-primary">
                        ₹{Number(c.totalRevenue).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Fleet Document Expiry Alerts */}
          <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-amber-50/60 pb-3 border-b border-amber-100/70">
              <CardTitle className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Action Required (Fleet Compliance)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {alerts.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">All Vehicles Compliant</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No document expiry in the next 15 days.</p>
                </div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className={`p-3.5 flex justify-between items-start hover:bg-slate-50 transition-colors ${alert.isExpired ? 'bg-rose-50/40' : ''}`}>
                      <div>
                        <p className="font-black text-slate-800 text-xs">{alert.vehicle}</p>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">{alert.document} Expiry</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${alert.isExpired ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                          {alert.isExpired ? 'Expired' : `${alert.daysLeft} Days`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(alert.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center py-3.5 px-6 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-sm sm:text-base font-bold text-slate-800">Recent Bookings (LR)</CardTitle>
          <Link href="/admin/bookings" className="text-xs font-bold text-brand-primary hover:underline">
            View All &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                  <th className="p-3.5 pl-6">LR Number</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Consignee</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Freight</th>
                  <th className="p-3.5 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-300 mb-2" />
                        <p>No recent bookings recorded.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking: any) => (
                    <tr key={booking._id.toString()} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                      <td className="p-3.5 pl-6 font-extrabold text-brand-primary">LR-{booking.lrNumber}</td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="p-3.5 text-slate-800 font-bold">{booking.consignee?.name || 'N/A'}</td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {booking.bookingBranch?.name || booking.branch?.name || booking.pickupLocation} &rarr; {booking.destinationBranch?.name || booking.deliveryLocation}
                      </td>
                      <td className="p-3.5 font-black text-slate-900">
                        ₹{booking.charges?.totalAmount?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="p-3.5 pr-6">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase tracking-wider border inline-block ${
                          booking.status === 'delivered' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                          booking.status === 'in_transit' ? 'text-sky-700 bg-sky-50 border-sky-200' :
                          'text-amber-700 bg-amber-50 border-amber-200'
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
