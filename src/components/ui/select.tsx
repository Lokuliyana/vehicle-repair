import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full appearance-none rounded-[10px] border border-slate-200/80 bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 shadow-xs transition-colors focus-visible:outline-none focus-visible:border-[#F95700] focus-visible:ring-4 focus-visible:ring-[#F95700]/15 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    );
  }
);
Select.displayName = 'Select';
