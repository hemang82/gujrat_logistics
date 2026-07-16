'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useState, useEffect } from 'react';

export default function BranchesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSearch = searchParams.get('search') || '';
  const currentState = searchParams.get('state') || '';

  const [searchValue, setSearchValue] = useState(currentSearch);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

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

  const handleClearSearch = () => {
    setSearchValue('');
    handleUpdate('search', '');
  };

  const states = [
    { value: '', label: 'All States' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
      {/* Search Filter */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by Code or Name..." 
          className="pl-9 pr-9 h-10 bg-white rounded-xl border-gray-200 shadow-sm focus-visible:ring-1 focus-visible:ring-brand-primary/50 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUpdate('search', searchValue);
            }
          }}
        />
        {searchValue && (
          <button 
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* State Filter */}
      <div className="w-full sm:w-44">
        <ThemeSelect
          name="state"
          value={currentState}
          onChange={(e) => handleUpdate('state', e.target.value)}
          options={states}
          className="flex h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus-visible:outline-none"
        />
      </div>

      {(currentSearch || currentState) && (
        <Button 
          variant="ghost" 
          onClick={() => {
            setSearchValue('');
            const params = new URLSearchParams();
            router.push(pathname);
          }}
          className="h-10 text-xs text-gray-500 hover:text-gray-700"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
}
