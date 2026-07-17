'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const goToPage = (page: number, newLimit?: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    if (newLimit) params.set('limit', newLimit.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentLimit = searchParams.get('limit') || '10';

  if (totalPages <= 1 && currentLimit === '10') return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-100 gap-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500">
          Page <span className="font-semibold text-brand-text-primary">{currentPage}</span> of <span className="font-semibold text-brand-text-primary">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
          <span className="text-xs text-gray-500 font-medium">Rows:</span>
          <select 
            value={currentLimit}
            onChange={(e) => goToPage(1, Number(e.target.value))}
            className="h-8 rounded-md border-gray-200 text-xs px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary bg-white"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 px-3 rounded-xl flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 px-3 rounded-xl flex items-center gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
