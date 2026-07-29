'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Truck, 
  ReceiptText, 
  BarChart3,
  LogOut,
  CarFront,
  Contact,
  Wallet,
  BriefcaseBusiness,
  ChevronDown,
  X,
  MapPin,
  FileText,
  Database,
  Box,
  Activity
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminSidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  // Helper to determine if a route is active
  const isRouteActive = (href: string, exact = false, excludePaths: string[] = []) => {
    if (exact) {
      return pathname === href;
    }
    const isActive = pathname.startsWith(href);
    if (isActive && excludePaths.length > 0) {
      for (const exclude of excludePaths) {
        if (pathname.startsWith(exclude)) {
          return false;
        }
      }
    }
    return isActive;
  };

  const isFleetActive = pathname.startsWith('/admin/fleet') || pathname.startsWith('/admin/expenses');
  const isBookingActive = pathname.startsWith('/admin/bookings') || pathname.startsWith('/admin/challans') || pathname.startsWith('/admin/lorry-hire');
  const isMasterActive = pathname.startsWith('/admin/branches') || pathname.startsWith('/admin/clients') || pathname.startsWith('/admin/agents') || pathname.startsWith('/admin/masters');
  const isDeliveryActive = pathname.startsWith('/admin/delivery');
  const isAccountsActive = pathname.startsWith('/admin/accounts');

  const [isFleetOpen, setIsFleetOpen] = React.useState(isFleetActive);
  const [isBookingOpen, setIsBookingOpen] = React.useState(isBookingActive);
  const [isMasterOpen, setIsMasterOpen] = React.useState(isMasterActive);
  const [isDeliveryOpen, setIsDeliveryOpen] = React.useState(isDeliveryActive);
  const [isAccountsOpen, setIsAccountsOpen] = React.useState(isAccountsActive);

  // Auto expand when matching route is loaded/reloaded
  React.useEffect(() => {
    if (isFleetActive) {
      setIsFleetOpen(true);
    }
  }, [pathname, isFleetActive]);

  React.useEffect(() => {
    if (isBookingActive) {
      setIsBookingOpen(true);
    }
  }, [pathname, isBookingActive]);

  React.useEffect(() => {
    if (isMasterActive) {
      setIsMasterOpen(true);
    }
  }, [pathname, isMasterActive]);

  React.useEffect(() => {
    if (isDeliveryActive) {
      setIsDeliveryOpen(true);
    }
  }, [pathname, isDeliveryActive]);

  React.useEffect(() => {
    if (isAccountsActive) {
      setIsAccountsOpen(true);
    }
  }, [pathname, isAccountsActive]);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, isDropdown: false },
    { 
      name: 'Booking', 
      icon: <PackageSearch className="w-5 h-5" />, 
      isDropdown: true,
      isOpen: isBookingOpen,
      setIsOpen: setIsBookingOpen,
      isActive: isBookingActive,
      children: [
        { name: 'Lorry Receipt (LR)', href: '/admin/bookings', exact: false },
        { name: 'Lorry Challan', href: '/admin/challans', exact: false, excludePaths: ['/admin/challans/crossing'] },
        { name: 'Crossing Memo', href: '/admin/challans/crossing', exact: false },
        { name: 'Lorry Hire', href: '/admin/lorry-hire', exact: false },
      ]
    },
    { 
      name: 'Delivery', 
      icon: <Box className="w-5 h-5" />, 
      isDropdown: true,
      isOpen: isDeliveryOpen,
      setIsOpen: setIsDeliveryOpen,
      isActive: isDeliveryActive,
      children: [
        { name: 'Receive Memo', href: '/admin/delivery/receive-memo', exact: false },
        { name: 'Delivery Entry', href: '/admin/delivery/delivery-entry', exact: false },
        { name: 'Cash Collection', href: '/admin/delivery/cash-collection', exact: false },
      ]
    },
    { 
      name: 'Master', 
      icon: <Database className="w-5 h-5" />, 
      isDropdown: true,
      isOpen: isMasterOpen,
      setIsOpen: setIsMasterOpen,
      isActive: isMasterActive,
      children: [
        { name: 'Branches', href: '/admin/branches', exact: false },
        { name: 'Clients', href: '/admin/clients', exact: false },
        { name: 'Agents', href: '/admin/agents', exact: false },
        { name: 'PKG & Items', href: '/admin/masters', exact: false },
      ]
    },
    { 
      name: 'Trucks', 
      icon: <Truck className="w-5 h-5" />, 
      isDropdown: true,
      isOpen: isFleetOpen,
      setIsOpen: setIsFleetOpen,
      isActive: isFleetActive,
      children: [
        { name: 'Dashboard', href: '/admin/fleet', exact: true },
        { name: 'Consolidated EWB', href: '/admin/ewaybills/consolidated', exact: false },
        { name: 'All Trucks', href: '/admin/fleet/vehicles', exact: false },
        { name: 'All Drivers', href: '/admin/fleet/drivers', exact: false },
        { name: 'Truck Expenses', href: '/admin/expenses', exact: false },
      ]
    },
    { 
      name: 'Accounts', 
      icon: <Wallet className="w-5 h-5" />, 
      isDropdown: true,
      isOpen: isAccountsOpen,
      setIsOpen: setIsAccountsOpen,
      isActive: isAccountsActive,
      children: [
        { name: 'Branch Ledger', href: '/admin/accounts/branch-ledger', exact: false },
      ]
    },
    { name: 'Billing', href: '/admin/billing', icon: <ReceiptText className="w-5 h-5" />, isDropdown: false },
    { name: 'Reports', href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, isDropdown: false },
    { name: 'API Logs', href: '/admin/api-logs', icon: <Activity className="w-5 h-5" />, isDropdown: false },
  ];

  return (
    <div className={`w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 print:hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <Link href="/" className="flex items-center" onClick={() => onClose && onClose()}>
          <div className="h-10 w-40 relative flex items-center justify-start">
            <img src="/main_logo.svg" alt="Gujarat Logistic Logo" className="w-full h-full object-contain origin-left" />
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">Menu</div>
        {navItems.map((item, idx) => {
          if (item.isDropdown) {
            return (
              <div key={idx} className="flex flex-col gap-1">
                <button
                  onClick={() => item.setIsOpen?.(!item.isOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm group ${
                    item.isActive
                      ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
                      : 'text-gray-600 hover:bg-brand-primary/5 hover:text-brand-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${item.isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {item.isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden flex flex-col gap-1 pl-9 mt-1"
                    >
                      {item.children?.map((child: any) => {
                        const isChildActive = isRouteActive(child.href, child.exact, child.excludePaths);
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => onClose && onClose()}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              isChildActive 
                                ? 'bg-brand-primary/10 text-brand-primary font-semibold' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          } else {
            const isActive = isRouteActive(item.href || '');
            return (
              <Link 
                key={item.href} 
                href={item.href || ''}
                onClick={() => onClose && onClose()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm group ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20' 
                    : 'text-gray-600 hover:bg-brand-primary/5 hover:text-brand-primary'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          }
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 h-12 rounded-xl font-medium px-4"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
