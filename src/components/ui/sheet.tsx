import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  side = 'right',
  className,
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b rounded-b-[22px]',
    bottom: 'inset-x-0 bottom-0 border-t rounded-t-[22px]',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-md rounded-r-[22px]',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-md rounded-l-[22px]',
  }[side];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-md transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Sheet Container */}
      <div
        className={cn(
          'fixed z-50 bg-white border-white/40 shadow-2xl p-6 transition ease-in-out duration-300 overflow-y-auto',
          sideClasses,
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-left mb-4', className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-bold leading-none tracking-tight text-slate-900', className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6',
        className
      )}
      {...props}
    />
  );
}
