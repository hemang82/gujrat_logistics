'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';

interface Branch {
  _id: string;
  name: string;
  code: string;
}

export default function BookingsFilter({ branches = [] }: { branches?: Branch[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSearch = searchParams.get('search') || '';
  const currentDate = searchParams.get('date') || '';
  const currentBranch = searchParams.get('branch') || '';

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [selectedBranch, setSelectedBranch] = useState(currentBranch);
  
  const branchOptions = [
    { label: 'All Destinations', value: '' },
    ...branches.map(b => ({ label: b.name, value: b._id }))
  ];

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchValue(currentSearch);
    setSelectedBranch(currentBranch);
  }, [currentSearch, currentBranch]);

  const handleUpdate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBranchChange = (e: { target: { name: string; value: string; } }) => {
    const val = e.target.value;
    setSelectedBranch(val);
    handleUpdate('branch', val);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    handleUpdate('search', '');
  };

  const handleClearDate = () => {
    handleUpdate('date', '');
  };

  return (
      <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100 w-full md:w-auto">
      
      {/* Search Filter */}
      <div className="relative w-full md:w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search LR Number or Name..." 
          className="pl-9 pr-9 h-10 bg-white rounded-lg border-gray-200 focus-visible:ring-1 focus-visible:ring-brand-primary/50 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUpdate('search', searchValue);
            }
          }}
          onBlur={() => {
            if (searchValue !== currentSearch) {
              handleUpdate('search', searchValue);
            }
          }}
        />
        {searchValue && (
          <button 
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Booking Branch Filter */}
      <div className="w-full md:w-44 relative z-[60]">
        <BranchAutocomplete
          name="branch"
          value={selectedBranch}
          onChange={handleBranchChange}
          options={branchOptions.map(b => b.value === '' ? { ...b, label: 'All Branches' } : b)}
          placeholder="Booking Branch"
          className="!rounded-lg"
        />
      </div>
      
      {/* Date Filter (Global DatePicker) */}
      <div className="relative w-full md:w-44 z-50">
        <DatePicker 
          value={currentDate}
          onChange={(val) => {
            if (val) {
              handleUpdate('date', val);
            } else {
              handleClearDate();
            }
          }}
          placeholder="Filter Date"
          className="!rounded-lg !h-10 bg-white !border-gray-200"
        />
      </div>

    </div>
  );
}
