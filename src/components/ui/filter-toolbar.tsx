import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FilterCategory {
  id: string;
  label: string;
  count?: number;
}

export interface FilterPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  count?: number;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  isActive = false,
  count,
  className,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold select-none transition-all cursor-pointer whitespace-nowrap',
        isActive
          ? 'bg-[#0F172A] text-white shadow-2xs'
          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.2 text-[10px] rounded-full font-bold font-sans tabular-nums',
            isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export interface FilterToolbarProps {
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  categories?: FilterCategory[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  dateRangeSlot?: React.ReactNode;
  customFilters?: React.ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  categories,
  selectedCategoryId,
  onSelectCategory,
  dateRangeSlot,
  customFilters,
  activeFilterCount = 0,
  onClearFilters,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-3.5 bg-white border border-slate-200/80 rounded-[14px] shadow-xs',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Search input & Date Range */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          {onSearchChange && (
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200/80 rounded-[10px] focus:bg-white focus:border-[#F95700] focus:ring-2 focus:ring-orange-500/10 focus:outline-none transition-all"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {dateRangeSlot}
        </div>

        {/* Right Side: Custom Filters & Clear Trigger */}
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
          {customFilters}

          {activeFilterCount > 0 && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear filters ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills (if provided) */}
      {categories && categories.length > 0 && onSelectCategory && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {categories.map((cat) => (
            <FilterPill
              key={cat.id}
              isActive={selectedCategoryId === cat.id}
              count={cat.count}
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.label}
            </FilterPill>
          ))}
        </div>
      )}
    </div>
  );
};
