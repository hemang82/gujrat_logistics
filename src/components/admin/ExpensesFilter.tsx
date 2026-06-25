'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function ExpensesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSearch = searchParams.get('search') || '';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';

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
    params.delete('page'); // reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    handleUpdate('search', '');
  };

  const handleClearDate = (key: 'startDate' | 'endDate') => {
    handleUpdate(key, '');
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
      
      {/* Search Filter */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search remarks..." 
          className="pl-9 pr-9 h-10 bg-white rounded-xl border-gray-200 shadow-sm focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary text-sm"
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
      
      {/* Start Date Filter */}
      <div className="relative w-full md:w-auto flex items-center">
        <Popover>
          <PopoverTrigger render={
            <Button
              variant={"outline"}
              className={cn(
                "h-10 w-full md:w-[150px] justify-start text-left font-normal bg-white rounded-xl border-gray-200 shadow-sm focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary text-sm",
                !currentStartDate && "text-gray-500"
              )}
            />
          }>
            <CalendarIcon className="mr-2 h-4 w-4 text-brand-primary/80 shrink-0" />
            <span className="truncate">{currentStartDate ? format(new Date(currentStartDate), "dd MMM, yy") : "Start Date"}</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentStartDate ? new Date(currentStartDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  handleUpdate('startDate', dateStr);
                } else {
                  handleClearDate('startDate');
                }
              }}
            />
          </PopoverContent>
        </Popover>
        {currentStartDate && (
          <button 
            onClick={() => handleClearDate('startDate')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors bg-white px-1 z-20"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <span className="text-gray-300 hidden md:block">-</span>

      {/* End Date Filter */}
      <div className="relative w-full md:w-auto flex items-center">
        <Popover>
          <PopoverTrigger render={
            <Button
              variant={"outline"}
              className={cn(
                "h-10 w-full md:w-[150px] justify-start text-left font-normal bg-white rounded-xl border-gray-200 shadow-sm focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary text-sm",
                !currentEndDate && "text-gray-500"
              )}
            />
          }>
            <CalendarIcon className="mr-2 h-4 w-4 text-brand-primary/80 shrink-0" />
            <span className="truncate">{currentEndDate ? format(new Date(currentEndDate), "dd MMM, yy") : "End Date"}</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentEndDate ? new Date(currentEndDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  handleUpdate('endDate', dateStr);
                } else {
                  handleClearDate('endDate');
                }
              }}
            />
          </PopoverContent>
        </Popover>
        {currentEndDate && (
          <button 
            onClick={() => handleClearDate('endDate')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors bg-white px-1 z-20"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
