'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200/90 hover:bg-yellow-100/70',
    dotClass: 'bg-yellow-500'
  },
  in_transit: {
    label: 'In Transit',
    badgeClass: 'bg-blue-50 text-brand-info border-blue-200/90 hover:bg-blue-100/70',
    dotClass: 'bg-brand-info'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/90 hover:bg-purple-100/70',
    dotClass: 'bg-purple-500'
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-green-50 text-brand-success border-green-200/90 hover:bg-green-100/70',
    dotClass: 'bg-brand-success'
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-red-50 text-red-600 border-red-200/90 hover:bg-red-100/70',
    dotClass: 'bg-red-500'
  }
};

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

  const currentConfig = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
    dotClass: 'bg-gray-400'
  };

  return (
    <Select
      value={status}
      onValueChange={(val: any) => {
        if (val && val !== status) {
          handleStatusChange(val);
        }
      }}
      disabled={isLoading}
    >
      <SelectTrigger
        size="sm"
        className={`h-7 px-3 rounded-full text-xs font-bold capitalize border cursor-pointer shadow-2xs min-w-[140px] max-w-[160px] justify-between gap-2 transition-all ${
          currentConfig.badgeClass
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className={`w-2 h-2 rounded-full shrink-0 my-auto ${currentConfig.dotClass}`} />
          <span className="font-bold text-xs leading-none">{currentConfig.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="min-w-[170px] p-1.5 bg-white border border-slate-200/90 shadow-2xl rounded-xl ring-1 ring-black/5 z-[9999] space-y-0.5">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <SelectItem
            key={key}
            value={key}
            className="flex items-center gap-2.5 pl-2.5 pr-8 py-2 text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 my-auto ${config.dotClass}`} />
            <span className="text-slate-800 font-semibold leading-none">{config.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
