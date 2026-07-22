'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  status?: string;
}

interface SearchSelectProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
}

export function SearchSelect({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  allowCustom = false
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasCustomOption = allowCustom && searchQuery.trim() && !options.some(opt => opt.value.toLowerCase() === searchQuery.trim().toLowerCase());

  // Reset highlighted index when isOpen or searchQuery changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [isOpen, searchQuery]);

  // Find currently selected option label
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val: string) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalCount = filteredOptions.length + (hasCustomOption ? 1 : 0);
    if (totalCount === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < totalCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hasCustomOption) {
        if (highlightedIndex === 0) {
          handleSelect(searchQuery.trim());
        } else {
          const optIndex = highlightedIndex - 1;
          if (optIndex >= 0 && optIndex < filteredOptions.length) {
            handleSelect(filteredOptions[optIndex].value);
          }
        }
      } else {
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Select trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer hover:bg-gray-50/50 transition-all ${className} ${isOpen ? 'ring-1 ring-brand-primary border-brand-primary' : ''}`}
      >
        <span className={`truncate ${!selectedOption && !value ? 'text-gray-400' : 'text-gray-800 font-bold'}`}>
          {selectedOption ? selectedOption.label : (allowCustom && value ? value : placeholder)}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <X
              onClick={handleClear}
              className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 transition-colors"
            />
          )}
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-100 bg-white p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Input */}
          <div className="relative mb-1 flex items-center border-b border-gray-100 pb-1.5 px-1 pt-0.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-gray-50/50 rounded-lg border border-gray-100 focus:outline-none focus:border-brand-primary/50 text-gray-800"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {hasCustomOption && (
              <div
                onClick={() => handleSelect(searchQuery.trim())}
                className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors mb-1.5 ${
                  highlightedIndex === 0
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10'
                }`}
              >
                <span className="truncate">Use custom: "{searchQuery.trim()}"</span>
              </div>
            )}
            
            {filteredOptions.length === 0 ? (
              (!allowCustom || !searchQuery.trim()) && (
                <div className="p-3 text-center text-xs text-gray-400 font-medium">No results found.</div>
              )
            ) : (
              filteredOptions.map((opt, idx) => {
                const actualIdx = hasCustomOption ? idx + 1 : idx;
                const isHighlighted = highlightedIndex === actualIdx;
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : isHighlighted
                          ? 'bg-brand-primary/5 text-brand-primary ring-1 ring-brand-primary/30'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.status && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize shrink-0 ml-2 ${opt.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {opt.status.replace('-', ' ')}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
