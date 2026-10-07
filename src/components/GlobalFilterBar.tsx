import React from 'react';
import { Search, Filter } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface GlobalFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
}

export default function GlobalFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions = [],
  activeFilter,
  onFilterChange
}: GlobalFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 p-4 border-b border-slate-200">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
        />
      </div>

      {/* Filter Options */}
      {filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <div className="flex items-center text-slate-500 mr-1">
            <Filter size={16} className="mr-1.5" />
            <span className="text-sm font-bold uppercase tracking-wider">Filter:</span>
          </div>
          <div className="flex gap-1.5">
            {filterOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => onFilterChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === opt.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
