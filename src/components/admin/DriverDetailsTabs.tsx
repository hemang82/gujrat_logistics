'use client';

import { useState } from 'react';
import DriverLedger from './DriverLedger';

export default function DriverDetailsTabs({ 
  driverId, 
  transactions, 
  profileContent 
}: { 
  driverId: string, 
  transactions: any[], 
  profileContent: React.ReactNode 
}) {
  
  const [activeTab, setActiveTab] = useState<'profile' | 'ledger'>('profile');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-2 font-bold transition-all text-sm uppercase tracking-wide border-b-2 ${activeTab === 'profile' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Driver Profile
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-2 font-bold transition-all text-sm uppercase tracking-wide border-b-2 ${activeTab === 'ledger' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          Settlement Ledger
        </button>
      </div>

      {activeTab === 'profile' && profileContent}
      
      {activeTab === 'ledger' && (
        <DriverLedger driverId={driverId} transactions={transactions} />
      )}
    </div>
  );

}
 