import React, { useState } from 'react';
import {
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
  Inbox,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { globalDesignManager } from '@/design-system/global-manager';
import type { BreadcrumbItem } from './page-header';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-xs text-slate-500', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            {isLast ? (
              <span className="font-semibold text-slate-900 truncate" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="hover:text-slate-900 hover:underline transition-colors font-medium text-slate-600 truncate"
              >
                {item.label}
              </a>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-slate-900 hover:underline transition-colors font-medium text-slate-600 truncate cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-slate-500 truncate">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// 2. AlertBanner
export interface AlertBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: string | React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variantStyles = {
    info: {
      container: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      icon: <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
      icon: <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />,
    },
    danger: {
      container: 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]',
      icon: <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />,
    },
  }[variant];

  return (
    <div
      role="alert"
      className={cn(
        'p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed transition-all shadow-2xs',
        variantStyles.container,
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        {variantStyles.icon}
        <div className="flex flex-col gap-0.5">
          {title && <h5 className="font-bold leading-tight">{title}</h5>}
          <div className="opacity-95">{message}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action}
        {dismissible && (
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// 3. EmptyState
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-12 bg-white rounded-2xl border border-slate-200/80 text-center flex flex-col items-center justify-center gap-3 shadow-2xs',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="max-w-md">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-normal">{description}</p>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};

// 4. LoadingSkeleton
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/80', className)} />;
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3', className)}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
};

export const SkeletonTableRow: React.FC<{ cols?: number; className?: string }> = ({
  cols = 5,
  className,
}) => {
  return (
    <tr className={cn('border-b border-slate-100 h-12', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-2">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};

export interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'text';
  count?: number;
  cols?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 3,
  cols = 5,
  className,
}) => {
  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className={cn('w-full border border-slate-100 rounded-lg overflow-hidden', className)}>
        <table className="w-full">
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonTableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

// 5. Tooltip
export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0F172A] rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in-0 zoom-in-95',
            positionClasses,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// 6. NumericDisplay & CurrencyDisplay
export interface NumericDisplayProps {
  value?: number;
  amountRs?: number;
  isCurrency?: boolean;
  isRedacted?: boolean;
  highlightNegative?: boolean;
  className?: string;
}

export const NumericDisplay: React.FC<NumericDisplayProps> = ({
  value,
  amountRs,
  isCurrency = false,
  isRedacted = false,
  highlightNegative = true,
  className,
}) => {
  const rawValue = value !== undefined ? value : (amountRs !== undefined ? amountRs : 0);
  const numericValue = typeof rawValue === 'number' && !isNaN(rawValue) ? rawValue : 0;

  if (isRedacted) {
    return (
      <span
        title="Sensitive figure redacted"
        className={cn('font-mono text-slate-400 select-none tracking-widest', className)}
      >
        ••••••
      </span>
    );
  }

  const formatted = isCurrency
    ? globalDesignManager.formatRs(numericValue)
    : numericValue.toLocaleString('en-US');

  return (
    <span
      className={cn(
        'font-mono tabular-nums font-semibold',
        highlightNegative && numericValue < 0 ? 'text-red-600' : 'text-slate-900',
        className
      )}
    >
      {formatted}
    </span>
  );
};

export const CurrencyDisplay: React.FC<Omit<NumericDisplayProps, 'isCurrency'>> = (props) => (
  <NumericDisplay {...props} isCurrency={true} />
);

// 7. DocumentActionBar
export interface DocumentActionBarProps {
  documentId: string;
  stageName: string;
  isLocked?: boolean;
  isCostProfitVisible?: boolean;
  onToggleCostProfit?: () => void;
  canViewCosts?: boolean;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
}

export const DocumentActionBar: React.FC<DocumentActionBarProps> = ({
  documentId,
  stageName,
  isLocked = false,
  isCostProfitVisible = false,
  onToggleCostProfit,
  canViewCosts = false,
  leftActions,
  rightActions,
  className,
}) => {
  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg',
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 screen-only no-print',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900">{documentId}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
            {stageName}
          </span>
          {isLocked && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              Read-Only
            </span>
          )}
        </div>

        {canViewCosts && onToggleCostProfit && (
          <button
            type="button"
            onClick={onToggleCostProfit}
            className={cn(
              'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
              isCostProfitVisible
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            {isCostProfitVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Cost Mode {isCostProfitVisible ? 'ON' : 'OFF'}</span>
          </button>
        )}

        {leftActions}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">{rightActions}</div>
    </div>
  );
};
