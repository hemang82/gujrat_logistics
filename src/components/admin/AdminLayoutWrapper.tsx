'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useUserStore } from '@/store/useUserStore';

export function AdminLayoutWrapper({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    // 1. Set initial values from NextAuth session
    if (user) {
      setUser({
        id: user.id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        branch: user.branch || 'ASL',
        bookingBranch: user.bookingBranch || 'ASLALI',
      });
    } else {
      setUser(null);
    }

    // 2. Fetch live data from /api/admin/profile to bypass caching
    fetch('/api/admin/profile')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch live profile');
      })
      .then((liveUser) => {
        if (liveUser) {
          setUser({
            id: liveUser._id || liveUser.id || user?.id || '',
            name: liveUser.name || user?.name || '',
            email: liveUser.email || user?.email || '',
            role: liveUser.role || user?.role || '',
            branch: liveUser.branch || 'ASL',
            bookingBranch: liveUser.bookingBranch || 'ASLALI',
          });
        }
      })
      .catch((err) => console.error('Error syncing live profile:', err));
  }, [user, setUser]);

  return (
    <div className="min-h-screen bg-brand-bg print:bg-white relative">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content wrapper */}
      <div className="flex flex-col min-h-screen lg:ml-64 transition-all duration-300 print:ml-0 min-w-0 w-full lg:w-auto">
        <AdminTopbar 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 xl:p-8 overflow-x-hidden w-full max-w-full print:p-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}
