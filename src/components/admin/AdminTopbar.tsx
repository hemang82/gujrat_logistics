'use client';

import { Search, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/useUserStore';

export function AdminTopbar({ user, onMenuClick }: { user: any, onMenuClick?: () => void }) {
  const storeUser = useUserStore((state) => state.user);
  const activeUser = storeUser || user;

  return (
    <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 print:hidden">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-brand-primary transition-colors rounded-lg hover:bg-gray-50"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        {/* Mobile Panel Indicator */}
        <div className="lg:hidden">
          <div className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm
            ${activeUser?.role === 'superadmin' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
              activeUser?.role === 'logistic' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
              'bg-green-50 border-green-200 text-green-700'}
          `}>
            {activeUser?.role === 'superadmin' && <span>👑 Super Admin</span>}
            {activeUser?.role === 'logistic' && <span>🏢 Logistic</span>}
            {(activeUser?.role === 'branch_user' || activeUser?.role === 'branch') && <span>📍 Branch</span>}
          </div>
        </div>

        <div className="w-64 sm:w-96 relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search LR Number, Driver, Vehicle..." 
            className="pl-10 h-12 bg-gray-50 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-brand-primary/50"
          />
        </div>
      </div>

      {/* Center: Empty to maintain spacing */}
      <div className="flex-1"></div>

      <div className="flex items-center gap-6">
        <Link href="/admin/profile" className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-brand-text-primary">{activeUser?.name || 'Admin User'}</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              {(activeUser?.bookingBranchName || activeUser?.branchName || activeUser?.bookingBranch) && (
                <span className="text-xs bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {activeUser.bookingBranchName || activeUser.branchName || activeUser.bookingBranch}
                </span>
              )}
              <span className="text-xs text-gray-400 font-semibold uppercase">
                {activeUser?.role || 'Admin'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
            {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
        </Link>
      </div>
    </div>
  );
}
