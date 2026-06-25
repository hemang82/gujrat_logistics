'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function UpdateStatusDialog({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      toast.success('Status updated successfully!');
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 rounded-xl bg-white text-brand-primary border-brand-primary hover:bg-brand-primary/10 w-36"
      >
        Update Status
      </Button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white border border-gray-100 shadow-lg rounded-xl p-4 z-50 animate-in fade-in zoom-in duration-200">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Select New Status</h3>
          
          <div className="space-y-2 mb-4">
            {['pending', 'in_transit', 'delivered', 'cancelled'].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                <input 
                  type="radio" 
                  name="status" 
                  value={s}
                  checked={status === s}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="capitalize text-sm font-medium text-gray-700">{s.replace('_', ' ')}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-xs h-8"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 text-xs h-8 bg-brand-primary hover:bg-brand-primary-dark text-white"
              onClick={handleUpdate}
              disabled={isLoading || status === currentStatus}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Backdrop for closing modal when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
