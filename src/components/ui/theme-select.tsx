'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface ThemeSelectProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  error?: boolean;
}

export function ThemeSelect({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  error = false
}: ThemeSelectProps) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial value label to input
  useEffect(() => {
    if (value !== undefined) {
      const selectedOpt = options.find(o => o.value === value);
      if (selectedOpt && search !== selectedOpt.label) {
        if (search === '' && value === '') return;
        setSearch(selectedOpt.label);
      } else if (!selectedOpt && !value) {
        setSearch('');
      }
    } else {
      setSearch('');
    }
  }, [value, options]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSelectedOpt = options.find(o => o.value === value);
  const isSearchMatchingSelected = currentSelectedOpt && search.trim().toLowerCase() === currentSelectedOpt.label.trim().toLowerCase();
  
  // If search matches the current selected value or is empty, show ALL options so the user sees the full list!
  const filteredOptions = (!search.trim() || isSearchMatchingSelected)
    ? options
    : options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setShowDropdown(true);
    setHighlightIndex(-1);
  };

  const handleSelect = (val: string, lbl: string) => {
    onChange({ target: { name, value: val } });
    setSearch(lbl);
    setShowDropdown(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        setShowDropdown(true);
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (showDropdown && filteredOptions.length > 0) {
        const targetIdx = highlightIndex >= 0 && highlightIndex < filteredOptions.length ? highlightIndex : 0;
        const selected = filteredOptions[targetIdx];
        handleSelect(selected.value, selected.label);
      }
    } else if (e.key === 'Tab') {
      if (search && filteredOptions.length > 0 && filteredOptions[0].label.toLowerCase().startsWith(search.toLowerCase())) {
        const selected = filteredOptions[0];
        handleSelect(selected.value, selected.label);
      }
      setShowDropdown(false);
      setHighlightIndex(-1);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  const handleBlur = () => {
    const currentSelectedOpt = options.find(o => o.value === value);
    if (search && (!value || (currentSelectedOpt && currentSelectedOpt.label !== search))) {
      if (filteredOptions.length > 0) {
        const selected = filteredOptions[0];
        handleSelect(selected.value, selected.label);
      } else if (currentSelectedOpt) {
        setSearch(currentSelectedOpt.label);
      } else {
        setSearch('');
        onChange({ target: { name, value: '' } });
      }
    } else if (!search) {
      if (currentSelectedOpt) {
        setSearch(currentSelectedOpt.label);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          name={name}
          value={search}
          onChange={handleSearchChange}
          onFocus={() => {
            setShowDropdown(true);
            inputRef.current?.select();
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-9 w-full rounded-[8px] border border-[#64748b59] font-medium text-slate-800 px-3 pr-8 text-sm bg-white focus-visible:outline-none transition-all",
            error ? 'border-red-500' : 'border-[#64748b59] focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 focus:bg-teal-50/20',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-70',
            className
          )}
          autoComplete="off"
          disabled={disabled}
        />

        {/* Dropdown Chevron */}
        <div
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer pointer-events-auto"
          onClick={() => {
            if (!disabled) {
              setShowDropdown(!showDropdown);
              if (!showDropdown) {
                inputRef.current?.focus();
              }
            }
          }}
        >
          <ChevronDown className={cn("w-4 h-4 opacity-70 transition-transform duration-200", showDropdown && "rotate-180")} />
        </div>
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-[9999] mt-1 w-full bg-white rounded-xl border border-brand-primary shadow-md p-1.5 max-h-[300px] overflow-y-auto space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-150">
          {filteredOptions.map((opt, index) => {
            const isSelected = value === opt.value;
            const isHighlighted = index === highlightIndex;

            return (
              <div
                key={opt.value}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input onBlur
                  handleSelect(opt.value, opt.label);
                }}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 text-sm font-medium rounded-lg cursor-pointer transition-all border-b border-transparent",
                  isHighlighted
                    ? "bg-brand-primary/10 text-brand-primary"
                    : isSelected
                    ? "bg-brand-primary/5 text-brand-primary font-bold"
                    : "hover:bg-gray-50 text-gray-700",
                  index !== filteredOptions.length - 1 && "!border-b-gray-100 pb-2 mb-0.5"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-brand-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
