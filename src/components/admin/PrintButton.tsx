'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrintButton() {
  return (
    <Button 
      className="h-10 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center gap-2"
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4" /> Print Bilty
    </Button>
  );
}
