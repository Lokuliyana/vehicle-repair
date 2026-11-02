import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          {
            'bg-slate-900 text-slate-50 hover:bg-slate-800 shadow-sm active:scale-[0.98]':
              variant === 'default',
            'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]':
              variant === 'destructive',
            'border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-xs active:scale-[0.98]':
              variant === 'outline',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]':
              variant === 'secondary',
            'hover:bg-slate-100 text-slate-700 hover:text-slate-900':
              variant === 'ghost',
            'text-blue-600 underline-offset-4 hover:underline p-0 h-auto':
              variant === 'link',
            'bg-amber-500 text-white hover:bg-amber-600 shadow-sm active:scale-[0.98]':
              variant === 'warning',
          },
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8 text-base': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
