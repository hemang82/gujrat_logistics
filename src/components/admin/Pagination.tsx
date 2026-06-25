'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Page <span className="font-semibold text-brand-text-primary">{currentPage}</span> of <span className="font-semibold text-brand-text-primary">{totalPages}</span>
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
