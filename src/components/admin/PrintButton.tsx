'use client';

import { useEffect } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrintButton() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = () => {
    window.print();
  };

  return (
    <Button 
      className="h-10 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white flex items-center gap-2"
      onClick={handleAction}
    >
      <Printer className="w-4 h-4" /> 
      Print Bilty
    </Button>
  );
}
