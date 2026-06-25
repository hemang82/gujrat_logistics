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
  X
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminSidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  // Helper to determine if a route is active
  const isRouteActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Fleet routes include /admin/fleet and /admin/expenses
  const isFleetActive = pathname.startsWith('/admin/fleet') || pathname.startsWith('/admin/expenses');

  const [isFleetOpen, setIsFleetOpen] = React.useState(isFleetActive);

  // Auto expand when matching route is loaded/reloaded
  React.useEffect(() => {
    if (isFleetActive) {
      setIsFleetOpen(true);
    }
  }, [pathname, isFleetActive]);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, isDropdown: false },
    { name: 'Bookings & LR', href: '/admin/bookings', icon: <PackageSearch className="w-5 h-5" />, isDropdown: false },
    { name: 'Clients', href: '/admin/clients', icon: <BriefcaseBusiness className="w-5 h-5" />, isDropdown: false },
    { name: 'Billing', href: '/admin/billing', icon: <ReceiptText className="w-5 h-5" />, isDropdown: false },
    { 
      name: 'Fleet Management', 
      icon: <Truck className="w-5 h-5" />, 
      isDropdown: true,
      children: [
        { name: 'Overview', href: '/admin/fleet', exact: true },
        { name: 'Vehicles', href: '/admin/fleet/vehicles', exact: false },
        { name: 'Drivers', href: '/admin/fleet/drivers', exact: false },
        { name: 'Expenses', href: '/admin/expenses', exact: false },
      ]
    },
    { name: 'Reports', href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, isDropdown: false },
  ];

  return (
    <div className={`w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 print:hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" onClick={() => onClose && onClose()}>
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-brand-text-primary">
            Gujarat <span className="text-brand-primary">Logistic</span>
          </span>
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
                  onClick={() => setIsFleetOpen(!isFleetOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
                    isFleetActive 
                      ? 'bg-brand-primary/10 text-brand-primary' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-brand-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${isFleetOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isFleetOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden flex flex-col gap-1 pl-9 mt-1"
                    >
                      {item.children?.map((child) => {
                        const isChildActive = isRouteActive(child.href, child.exact);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => onClose && onClose()}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                              isChildActive
                                ? 'text-brand-primary bg-brand-primary/5'
                                : 'text-gray-500 hover:text-brand-text-primary hover:bg-gray-50'
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-text-primary'
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
