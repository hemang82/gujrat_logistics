'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickDatePresetsProps {
  startDate: string;
  endDate: string;
  onSelect: (start: string, end: string) => void;
}

export function QuickDatePresets({ startDate, endDate, onSelect }: QuickDatePresetsProps) {
  const getToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return { start: today, end: today };
  };

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split('T')[0];
    return { start: yesterday, end: yesterday };
  };

  const getThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff)).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return { start: monday, end: today };
  };

  const getThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    return { start: firstDay, end: today };
  };

  const today = getToday();
  const yesterday = getYesterday();
  const thisWeek = getThisWeek();
  const thisMonth = getThisMonth();

  const isTodayActive = startDate === today.start && endDate === today.end;
  const isYesterdayActive = startDate === yesterday.start && endDate === yesterday.end;
  const isThisWeekActive = startDate === thisWeek.start && endDate === thisWeek.end;
  const isThisMonthActive = startDate === thisMonth.start && endDate === thisMonth.end;

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[7px] text-[11px] font-semibold">
      <button
        type="button"
        onClick={() => onSelect(today.start, today.end)}
        className={`px-2.5 py-1 rounded-[5px] transition-colors cursor-pointer select-none ${
          isTodayActive ? 'bg-white text-brand-primary shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Today
      </button>

      <button
        type="button"
        onClick={() => onSelect(yesterday.start, yesterday.end)}
        className={`px-2.5 py-1 rounded-[5px] transition-colors cursor-pointer select-none ${
          isYesterdayActive ? 'bg-white text-brand-primary shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Yesterday
      </button>

      <button
        type="button"
        onClick={() => onSelect(thisWeek.start, thisWeek.end)}
        className={`px-2.5 py-1 rounded-[5px] transition-colors cursor-pointer select-none ${
          isThisWeekActive ? 'bg-white text-brand-primary shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        This Week
      </button>

      <button
        type="button"
        onClick={() => onSelect(thisMonth.start, thisMonth.end)}
        className={`px-2.5 py-1 rounded-[5px] transition-colors cursor-pointer select-none ${
          isThisMonthActive ? 'bg-white text-brand-primary shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        This Month
      </button>
    </div>
  );
}
