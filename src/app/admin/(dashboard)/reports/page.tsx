'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PackageSearch, 
  Layers, 
  Receipt, 
  FileSpreadsheet, 
  Truck, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Scale,
  Percent,
  Download
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function ReportsHubPage() {
  const { user } = useUserStore();
  const isBranch = user?.role === 'branch_user' || user?.role === 'branch';

  const reportModules = [
    {
      title: 'Daily Booking Register',
      description: 'Day-to-day LR records with consignor, consignee, package count, weight, and freight amounts.',
      href: '/admin/reports/daily-booking',
      icon: <FileText className="w-6 h-6 text-brand-primary" />,
      colorBg: 'bg-teal-50',
      colorBorder: 'border-teal-100',
      badge: 'Core Daily',
      badgeColor: 'bg-teal-100/70 text-teal-800'
    },
    {
      title: 'Left Booking (Warehouse)',
      description: 'Monitor untransited parcels sitting in warehouse awaiting Challan dispatch & truck loading.',
      href: '/admin/reports/left-booking',
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      colorBg: 'bg-amber-50',
      colorBorder: 'border-amber-200',
      badge: 'Stock Alert',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'Booking Summary',
      description: 'Consolidated volume, weight, and revenue totals grouped by branch, destination, or date.',
      href: '/admin/reports/booking-summary',
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      colorBg: 'bg-blue-50',
      colorBorder: 'border-blue-100',
      badge: 'Analytics',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'GST Tax Register',
      description: 'Audit-ready GST ledger showing Taxable Value, CGST, SGST, and GSTINs for tax filing.',
      href: '/admin/reports/gst-tax',
      icon: <Percent className="w-6 h-6 text-indigo-600" />,
      colorBg: 'bg-indigo-50',
      colorBorder: 'border-indigo-100',
      badge: 'Compliance',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Charges Register',
      description: 'Itemized revenue split: Basic Freight, Hamali (Labour), Door Delivery, and Surcharges.',
      href: '/admin/reports/charges',
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
      colorBg: 'bg-emerald-50',
      colorBorder: 'border-emerald-100',
      badge: 'Revenue Split',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: 'Memo Report (Challans)',
      description: 'Truck loading dispatch sheets, loaded LRs, cargo weight, and trip consolidation memos.',
      href: '/admin/reports/memo',
      icon: <Truck className="w-6 h-6 text-cyan-600" />,
      colorBg: 'bg-cyan-50',
      colorBorder: 'border-cyan-100',
      badge: 'Dispatch',
      badgeColor: 'bg-cyan-100 text-cyan-800'
    },
    {
      title: 'Lorry Hire Report',
      description: 'Truck hire agreements, advance payments, commission deductions, and pending balance ledger.',
      href: '/admin/reports/lorry-hire',
      icon: <Wallet className="w-6 h-6 text-rose-600" />,
      colorBg: 'bg-rose-50',
      colorBorder: 'border-rose-100',
      badge: 'Vehicle Ledger',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      title: 'Invoice & Billing (TBB)',
      description: 'Customer credit billing ledger, TBB party invoices, and outstanding payment collection dues.',
      href: '/admin/reports/invoice',
      icon: <Receipt className="w-6 h-6 text-violet-600" />,
      colorBg: 'bg-violet-50',
      colorBorder: 'border-violet-100',
      badge: 'TBB Billing',
      badgeColor: 'bg-violet-100 text-violet-800'
    }
  ];

  return (
    <div className="w-full pb-8 space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-5 py-4 rounded-xl shadow-xs border border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-brand-primary rounded-full inline-block"></span>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-tight">
              Reports & Business Intelligence Hub
            </h1>
          </div>
          <p className="text-xs text-gray-500 pl-3.5 mt-0.5">
            Centralized analytics, financial audit registers, and operational dispatch ledgers
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <span>Active Role:</span>
          <span className="font-bold text-brand-primary uppercase">{user?.role || 'User'}</span>
        </div>
      </div>

      {/* Reports Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportModules.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className="group bg-white rounded-xl p-4 border border-gray-100 shadow-xs hover:shadow-md hover:border-brand-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-lg ${item.colorBg} ${item.colorBorder} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-sm group-hover:text-brand-primary transition-colors mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-brand-primary">
              <span>View Report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
