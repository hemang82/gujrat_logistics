'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';

export default function BookingStatusDropdown({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      toast.success('Status updated successfully');
      router.refresh(); // Refresh the page to reflect any server-side changes (like counts)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
      setStatus(currentStatus); // Revert on failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeSelect
      name="status"
      value={status} 
      onChange={(e: any) => handleStatusChange(e.target.value)}
      disabled={isLoading}
      options={[
        { value: 'pending', label: 'Pending' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]}
      className={`px-3 py-1 rounded-full text-xs font-bold capitalize border outline-none cursor-pointer appearance-none text-center shadow-sm min-w-[140px]
        ${status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
        ${status === 'in_transit' ? 'bg-blue-50 text-brand-info border-blue-200' : ''}
        ${status === 'out_for_delivery' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
        ${status === 'delivered' ? 'bg-green-50 text-brand-success border-green-200' : ''}
        ${status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    />
  );
}
