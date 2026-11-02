import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info'
    | 'quotation'
    | 'estimate'
    | 'jobCard'
    | 'invoice';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        {
          'border-transparent bg-slate-900 text-slate-50': variant === 'default',
          'border-transparent bg-slate-100 text-slate-900': variant === 'secondary',
          'border-slate-300 text-slate-800': variant === 'outline',
          'border-transparent bg-red-100 text-red-800': variant === 'destructive',
          'border-transparent bg-emerald-100 text-emerald-800': variant === 'success',
          'border-transparent bg-amber-100 text-amber-800': variant === 'warning',
          'border-transparent bg-blue-100 text-blue-800': variant === 'info',
          'border-blue-300 bg-blue-50 text-blue-700': variant === 'quotation',
          'border-indigo-300 bg-indigo-50 text-indigo-700': variant === 'estimate',
          'border-amber-300 bg-amber-50 text-amber-800': variant === 'jobCard',
          'border-emerald-300 bg-emerald-50 text-emerald-800': variant === 'invoice',
        },
        className
      )}
      {...props}
    />
  );
}
