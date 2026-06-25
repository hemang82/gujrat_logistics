'use client';

import { Bell, Search, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AdminTopbar({ user, onMenuClick }: { user: any, onMenuClick?: () => void }) {
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
        <div className="w-64 sm:w-96 relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          placeholder="Search LR Number, Driver, Vehicle..." 
          className="pl-10 h-12 bg-gray-50 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-brand-primary/50"
        />
      </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-brand-primary transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-brand-text-primary">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
        </div>
      </div>
    </div>
  );
}
