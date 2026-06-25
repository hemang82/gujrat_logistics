'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayoutWrapper({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden w-full max-w-full print:p-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}
