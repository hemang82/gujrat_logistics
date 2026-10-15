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
    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
      
      {/* Search Filter */}
      <div className="relative w-full sm:w-[220px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
        <Input 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search LR No or Name..." 
          className="pl-8 pr-7 h-8 bg-white rounded-[6px] border border-[#64748b59] focus-visible:ring-2 focus-visible:ring-brand-primary/20 text-xs w-full"
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
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Booking Branch Filter */}
      <div className="w-full sm:w-36 relative z-[60]">
        <BranchAutocomplete
          name="branch"
          value={selectedBranch}
          onChange={handleBranchChange}
          options={branchOptions.map(b => b.value === '' ? { ...b, label: 'All Branches' } : b)}
          placeholder="All Branches"
          className="!rounded-[6px] !h-8 text-xs"
        />
      </div>
      
      {/* Date Filter (Global DatePicker) */}
      <div className="w-full sm:w-36 relative z-10">
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
          className="!rounded-[6px] !h-8 bg-white !border-[#64748b59] text-xs px-2.5"
        />
      </div>

    </div>
  );
}
