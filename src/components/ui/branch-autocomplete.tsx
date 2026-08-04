'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Input } from './input';

interface Option {
  value: string;
  label: string;
}

interface BranchAutocompleteProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export function BranchAutocomplete({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select branch...',
  error = false,
  className = '',
  disabled = false
}: BranchAutocompleteProps) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial value label to search input
  useEffect(() => {
    if (value !== undefined) {
      const selectedOpt = options.find(o => o.value === value);
      // Only sync if search doesn't already match and the user isn't actively clearing it to search
      if (selectedOpt && search !== selectedOpt.label) {
        // If the user just cleared the input, don't force it back to "All Destinations"
        if (search === '' && value === '') return;
        setSearch(selectedOpt.label);
      } else if (!selectedOpt) {
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

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (!val) {
      onChange({ target: { name, value: '' } });
    } else if (value) {
      // If user types after selecting, clear the actual value so it forces re-selection
      onChange({ target: { name, value: '' } });
    }
    setShowDropdown(true);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) setShowDropdown(true);

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
      if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
        const selected = filteredOptions[highlightIndex];
        onChange({ target: { name, value: selected.value } });
        setSearch(selected.label);
        setShowDropdown(false);
        setHighlightIndex(-1);
      }
    } else if (e.key === 'Tab') {
      if (search && filteredOptions.length > 0 && filteredOptions[0].label.toLowerCase().startsWith(search.toLowerCase())) {
        const selected = filteredOptions[0];
        onChange({ target: { name, value: selected.value } });
        setSearch(selected.label);
      }
      setShowDropdown(false);
      setHighlightIndex(-1);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  const handleSelect = (val: string, lbl: string) => {
    onChange({ target: { name, value: val } });
    setSearch(lbl);
    setShowDropdown(false);
    setHighlightIndex(-1);
  };

  const handleBlur = () => {
    // If we have a search term but haven't selected a valid option
    // we auto-select the best match, or clear it if no match.
    // We check if value is empty or if search doesn't match the selected value's label.
    const currentSelectedOpt = options.find(o => o.value === value);
    if (search && (!value || (currentSelectedOpt && currentSelectedOpt.label !== search))) {
      if (filteredOptions.length > 0) {
        const selected = filteredOptions[0];
        onChange({ target: { name, value: selected.value } });
        setSearch(selected.label);
      } else {
        setSearch('');
        onChange({ target: { name, value: '' } });
      }
    } else if (!search) {
      onChange({ target: { name, value: '' } });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          name={`${name}_search`}
          value={search}
          onChange={handleSearchChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`h-10 w-full rounded-lg border px-3 pr-10 text-sm bg-white focus-visible:outline-none ${
            error ? 'border-red-500' : 'border-gray-200 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50'
          } ${className} ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
          autoComplete="off"
          disabled={disabled}
        />
        
        {/* Backdrop autocomplete text */}
        {search && filteredOptions.length > 0 && filteredOptions[0].label.toLowerCase().startsWith(search.toLowerCase()) && !value && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
            <span className="opacity-0">{filteredOptions[0].label.slice(0, search.length)}</span>
            <span>{filteredOptions[0].label.slice(search.length)}</span>
          </div>
        )}

        {/* Dropdown Chevron */}
        <div 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <ChevronDown className="w-4 h-4 opacity-70" />
        </div>
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-gray-100 shadow-2xl shadow-black/10 p-1.5 max-h-[350px] overflow-y-auto space-y-0.5">
          {filteredOptions.map((suggestion, index) => (
            <div
              key={suggestion.value}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input onBlur
                handleSelect(suggestion.value, suggestion.label);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium rounded-lg cursor-pointer transition-all border-b border-transparent ${
                index === highlightIndex
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10'
                  : 'hover:bg-gray-50 text-gray-700 hover:border-gray-200'
              } ${index !== filteredOptions.length - 1 ? '!border-b-gray-100 pb-2 mb-0.5' : ''}`}
            >
              {suggestion.value !== '' && (
                <MapPin className={`w-4 h-4 ${index === highlightIndex ? 'text-brand-primary' : 'text-gray-400'}`} />
              )}
              <span className="flex-1">{suggestion.label}</span>
              {value === suggestion.value && (
                <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_0_3px_rgba(var(--brand-primary),0.2)]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
