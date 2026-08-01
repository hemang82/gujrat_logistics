'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PrintPageButton() {
  return (
    <Button 
      onClick={() => window.print()}
      variant="outline" 
      className="h-12 w-full sm:w-auto px-5 rounded-xl font-semibold shadow-sm border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
    >
      <Printer className="w-5 h-5 text-red-500" />
      PDF
    </Button>
  );
}
