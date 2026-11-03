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
    | 'emerald'
    | 'amber'
    | 'cobalt'
    | 'crimson'
    | 'terracotta'
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
          'border-orange-200/80 bg-[#FFF7ED] text-[#F95700]': variant === 'default' || variant === 'terracotta',
          'border-slate-200/80 bg-slate-100 text-slate-800': variant === 'secondary',
          'border-slate-300 text-slate-800 bg-white': variant === 'outline',
          'border-red-200/80 bg-red-100 text-red-800': variant === 'destructive',
          'border-red-200/80 bg-red-50 text-red-800': variant === 'crimson',
          'border-emerald-200/80 bg-emerald-100 text-emerald-800': variant === 'success',
          'border-emerald-200/80 bg-emerald-50 text-emerald-800': variant === 'emerald',
          'border-amber-200/80 bg-amber-100 text-amber-800': variant === 'warning',
          'border-amber-200/80 bg-amber-50 text-amber-800': variant === 'amber',
          'border-blue-200/80 bg-blue-100 text-blue-800': variant === 'info',
          'border-blue-200/80 bg-blue-50 text-blue-800': variant === 'cobalt',
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

export type SemanticTheme = 'emerald' | 'amber' | 'cobalt' | 'crimson' | 'slate' | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: string;
  theme?: SemanticTheme;
  dot?: boolean;
}

/**
 * Maps known enterprise statuses to their canonical semantic color theme:
 * - Emerald: Completed, Paid, Optimal Margin (> 35%), Approved, Balanced
 * - Amber: Waiting Parts, Pending Insurance, Warning Margin (20-35%), Partially Paid, Draft
 * - Cobalt: In Progress, Active Bay, Quotation, Submitted, Register Open
 * - Crimson: Cancelled, Overdue, Deficit (< 0%), Rejected, Low Stock Alert
 * - Neutral Slate: Unassigned, Inactive, Register Closed
 */
export function resolveSemanticTheme(status?: string, explicitTheme?: SemanticTheme): SemanticTheme {
  if (explicitTheme) return explicitTheme;
  if (!status) return 'slate';

  const normalized = status.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '_');

  // Emerald: Completed, Paid, Optimal Margin (> 35%), Approved, Balanced
  if (
    normalized.includes('OPTIMAL') ||
    normalized.includes('COMPLETED') ||
    (normalized.includes('PAID') && !normalized.includes('PARTIAL') && !normalized.includes('UNPAID')) ||
    normalized.includes('APPROVED') ||
    normalized.includes('BALANCED') ||
    normalized.includes('SETTLED') ||
    normalized.includes('DELIVERED') ||
    normalized === 'ACTIVE'
  ) {
    return 'emerald';
  }

  // Amber: Waiting Parts, Pending Insurance, Warning Margin (20-35%), Partially Paid, Draft
  if (
    normalized.includes('WAITING') ||
    normalized.includes('PENDING') ||
    normalized.includes('WARNING') ||
    normalized.includes('PARTIAL') ||
    normalized.includes('HOLD') ||
    normalized.includes('DRAFT') ||
    normalized === 'ESTIMATE' ||
    normalized === 'JOB_CARD'
  ) {
    return 'amber';
  }

  // Cobalt: In Progress, Active Bay, Quotation, Submitted, Register Open
  if (
    normalized.includes('PROGRESS') ||
    normalized.includes('ACTIVE_BAY') ||
    normalized.includes('BAY') ||
    normalized.includes('QUOTATION') ||
    normalized.includes('SUBMIT') ||
    normalized.includes('REGISTER_OPEN') ||
    normalized.includes('INVOICED') ||
    normalized === 'OPEN'
  ) {
    return 'cobalt';
  }

  // Crimson: Cancelled, Overdue, Deficit (< 0%), Rejected, Low Stock Alert
  if (
    normalized.includes('CANCEL') ||
    normalized.includes('OVERDUE') ||
    normalized.includes('DEFICIT') ||
    normalized.includes('LOSS') ||
    normalized.includes('REJECT') ||
    normalized.includes('LOW_STOCK') ||
    normalized.includes('UNPAID') ||
    normalized.includes('FAILED')
  ) {
    return 'crimson';
  }

  // Neutral Slate: Unassigned, Inactive, Register Closed
  return 'slate';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  theme,
  dot = false,
  className,
  children,
  ...props
}) => {
  const resolvedTheme = resolveSemanticTheme(status, theme);

  const themeClasses: Record<SemanticTheme, { container: string; dot: string }> = {
    emerald: {
      container: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]',
      dot: 'bg-[#059669]',
    },
    amber: {
      container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
      dot: 'bg-[#D97706]',
    },
    cobalt: {
      container: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      dot: 'bg-[#2563EB]',
    },
    crimson: {
      container: 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]',
      dot: 'bg-[#DC2626]',
    },
    slate: {
      container: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]',
      dot: 'bg-[#64748B]',
    },
    neutral: {
      container: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]',
      dot: 'bg-[#64748B]',
    },
  };

  const selected = themeClasses[resolvedTheme] || themeClasses.slate;
  const displayText = children || (status ? status.replace(/_/g, ' ') : '');

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider select-none shrink-0 transition-all',
        selected.container,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', selected.dot)} />}
      <span>{displayText}</span>
    </div>
  );
};
