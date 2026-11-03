import React from 'react';
import { TrendingUp, TrendingDown, Info, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { globalDesignManager } from '@/design-system/global-manager';

export interface KpiCardProps {
  label: string;
  value: string | number;
  deltaPercent?: number;
  deltaType?: 'increase' | 'decrease' | 'neutral';
  subtitle?: string;
  variant?: 'default' | 'obsidian' | 'emerald' | 'amber' | 'cobalt' | 'crimson';
  icon?: React.ReactNode;
  isCurrency?: boolean;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  deltaPercent,
  deltaType,
  subtitle,
  variant = 'default',
  icon,
  isCurrency = true,
  className,
}) => {
  const isObsidian = variant === 'obsidian';
  const displayValue =
    typeof value === 'number'
      ? isCurrency
        ? globalDesignManager.formatRs(value)
        : value.toLocaleString('en-US')
      : value;

  const variantStyles = {
    default: 'bg-white text-slate-900 border-slate-200/80',
    obsidian: 'bg-[#0F172A] text-white border-slate-800 shadow-md',
    emerald: 'bg-emerald-50/50 text-emerald-950 border-emerald-200/80',
    amber: 'bg-amber-50/50 text-amber-950 border-amber-200/80',
    cobalt: 'bg-blue-50/50 text-blue-950 border-blue-200/80',
    crimson: 'bg-red-50/50 text-red-950 border-red-200/80',
  }[variant];

  const resolvedDeltaType =
    deltaType ||
    (deltaPercent !== undefined
      ? deltaPercent > 0
        ? 'increase'
        : deltaPercent < 0
        ? 'decrease'
        : 'neutral'
      : undefined);

  return (
    <div
      className={cn(
        'flex flex-col justify-between p-5 rounded-[16px] border shadow-xs min-h-[128px] transition-all',
        variantStyles,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wider truncate',
            isObsidian ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {deltaPercent !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans tabular-nums font-semibold rounded-full',
                resolvedDeltaType === 'neutral'
                  ? isObsidian
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                  : resolvedDeltaType === 'increase'
                  ? isObsidian
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-100 text-emerald-800'
                  : isObsidian
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-red-100 text-red-800'
              )}
            >
              {resolvedDeltaType === 'increase' ? (
                <TrendingUp className="w-3 h-3" />
              ) : resolvedDeltaType === 'decrease' ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {deltaPercent > 0 ? `+${deltaPercent.toFixed(1)}%` : `${deltaPercent.toFixed(1)}%`}
            </span>
          )}
          {icon && (
            <span className={cn('w-4 h-4 shrink-0', isObsidian ? 'text-slate-400' : 'text-slate-400')}>
              {icon}
            </span>
          )}
        </div>
      </div>

      <div className="my-2">
        <div
          className={cn(
            'text-2xl font-bold font-sans tabular-nums tracking-tight',
            isObsidian ? 'text-white' : 'text-slate-900'
          )}
        >
          {displayValue}
        </div>
        {subtitle && (
          <p className={cn('text-xs mt-1 truncate', isObsidian ? 'text-slate-400' : 'text-slate-500')}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: React.ReactNode;
  status?: 'optimal' | 'warning' | 'deficit' | 'neutral';
  isCurrency?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  status = 'neutral',
  isCurrency = false,
  className,
}) => {
  const dotColor = {
    optimal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    deficit: 'bg-rose-500',
    neutral: 'bg-slate-400',
  }[status];

  const formatted =
    typeof value === 'number'
      ? isCurrency
        ? globalDesignManager.formatRs(value)
        : value.toLocaleString('en-US')
      : value;

  return (
    <div
      className={cn(
        'flex flex-col justify-between p-4 bg-white border border-slate-200/80 rounded-[14px] shadow-xs min-h-[96px]',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
        <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-2">
        <span className="text-xl font-bold font-sans tabular-nums tracking-tight text-slate-900">
          {formatted}
        </span>
        {trend && <span className="text-xs text-slate-500 shrink-0">{trend}</span>}
      </div>
    </div>
  );
};

export interface SummaryCardItem {
  label: string;
  value: React.ReactNode;
  sub?: string;
  highlight?: boolean;
  mono?: boolean;
}

export interface SummaryCardProps {
  title: string;
  items: SummaryCardItem[];
  footer?: React.ReactNode;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  items,
  footer,
  className,
}) => {
  return (
    <div className={cn('bg-white border border-slate-200/80 rounded-[16px] shadow-xs p-5', className)}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
      <dl className="divide-y divide-slate-100">
        {items.map((it, idx) => (
          <div key={idx} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
            <dt className="text-xs font-medium text-slate-600 truncate">{it.label}</dt>
            <dd className="text-right">
              <span
                className={cn(
                  'text-xs',
                  it.mono && 'font-mono tabular-nums',
                  it.highlight ? 'font-bold text-[#F95700]' : 'font-semibold text-slate-900'
                )}
              >
                {it.value}
              </span>
              {it.sub && <p className="text-[10px] text-slate-400 mt-0.5">{it.sub}</p>}
            </dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-4 pt-3 border-t border-slate-100">{footer}</div>}
    </div>
  );
};

export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'danger' | 'neutral';
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'neutral',
  className,
}) => {
  const variantMap = {
    info: {
      bg: 'bg-blue-50/70 border-blue-200 text-blue-900',
      icon: <Info className="w-4 h-4 text-blue-600" />,
    },
    warning: {
      bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    },
    success: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    danger: {
      bg: 'bg-red-50/70 border-red-200 text-red-900',
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    },
    neutral: {
      bg: 'bg-slate-50 border-slate-200 text-slate-900',
      icon: <Info className="w-4 h-4 text-slate-500" />,
    },
  }[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-[14px] border flex items-start justify-between gap-3 shadow-2xs',
        variantMap.bg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icon || variantMap.icon}</span>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-xs font-bold leading-tight">{title}</h4>
          <p className="text-xs opacity-90 leading-relaxed">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
};

export interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  badge,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 bg-white border border-slate-200/80 rounded-[16px] shadow-xs',
        'hover:border-orange-300 hover:shadow-md active:scale-[0.99] transition-all group cursor-pointer flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between w-full gap-2">
        {icon && (
          <div className="p-2.5 rounded-xl bg-orange-50 text-[#F95700] border border-orange-200/50 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#F95700] transition-colors flex items-center justify-between">
          <span>{title}</span>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
      </div>
    </button>
  );
};

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  periodSelector?: React.ReactNode;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  periodSelector,
  legend,
  children,
  className,
}) => {
  return (
    <div className={cn('p-5 bg-white border border-slate-200/80 rounded-[16px] shadow-xs flex flex-col', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {(periodSelector || legend) && (
          <div className="flex items-center gap-3">
            {legend}
            {periodSelector}
          </div>
        )}
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};

export interface EntitySummaryCardProps {
  entityType: 'customer' | 'vehicle' | 'supplier';
  primaryText: string;
  secondaryText?: string;
  badgeText?: string;
  attributes?: Array<{ label: string; value: string }>;
  action?: React.ReactNode;
  className?: string;
}

export const EntitySummaryCard: React.FC<EntitySummaryCardProps> = ({
  entityType,
  primaryText,
  secondaryText,
  badgeText,
  attributes,
  action,
  className,
}) => {
  return (
    <div className={cn('p-4 bg-white border border-slate-200/80 rounded-[14px] shadow-xs flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {entityType}
            </span>
            <h4 className="text-sm font-bold text-slate-900">{primaryText}</h4>
            {badgeText && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {badgeText}
              </span>
            )}
          </div>
          {secondaryText && <p className="text-xs text-slate-500 mt-0.5">{secondaryText}</p>}
        </div>
        {action}
      </div>

      {attributes && attributes.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          {attributes.map((att, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{att.label}</span>
              <span className="font-semibold text-slate-800">{att.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export interface DocumentSummaryCardProps {
  title?: string;
  subtotalRs: number;
  discountRs?: number;
  taxRs?: number;
  totalRs: number;
  paidRs?: number;
  balanceRs?: number;
  isCostRedacted?: boolean;
  className?: string;
}

export const DocumentSummaryCard: React.FC<DocumentSummaryCardProps> = ({
  title = 'Document Financial Summary',
  subtotalRs,
  discountRs = 0,
  taxRs = 0,
  totalRs,
  paidRs,
  balanceRs,
  isCostRedacted = false,
  className,
}) => {
  const renderAmount = (amount: number) => {
    if (isCostRedacted) {
      return <span className="font-mono text-slate-400 select-none">••••••</span>;
    }
    return globalDesignManager.formatRs(amount);
  };
  return (
    <div className={cn('p-5 bg-white border border-slate-200/80 rounded-[16px] shadow-xs flex flex-col gap-3', className)}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>

      <div className="flex flex-col divide-y divide-slate-100 text-xs">
        <div className="py-2 flex justify-between items-center">
          <span className="text-slate-500">Gross Subtotal</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {renderAmount(subtotalRs)}
          </span>
        </div>

        {discountRs > 0 && (
          <div className="py-2 flex justify-between items-center text-emerald-600">
            <span>Special Discount</span>
            <span className="font-mono tabular-nums font-semibold">
              -{renderAmount(discountRs)}
            </span>
          </div>
        )}

        {taxRs > 0 && (
          <div className="py-2 flex justify-between items-center text-slate-500">
            <span>Applicable VAT / Tax</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              +{renderAmount(taxRs)}
            </span>
          </div>
        )}

        <div className="py-3 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-900">Net Payable Amount</span>
          <span className="text-base font-bold font-mono tabular-nums text-slate-900">
            {renderAmount(totalRs)}
          </span>
        </div>

        {paidRs !== undefined && (
          <div className="py-2 flex justify-between items-center">
            <span className="text-slate-500">Tendered / Paid</span>
            <span className="font-mono tabular-nums font-semibold text-emerald-600">
              {renderAmount(paidRs)}
            </span>
          </div>
        )}

        {balanceRs !== undefined && (
          <div className="py-2 flex justify-between items-center">
            <span className="font-bold text-slate-700">Remaining Due</span>
            <span
              className={cn(
                'font-mono tabular-nums font-bold text-sm',
                balanceRs > 0 ? 'text-red-600' : 'text-slate-900'
              )}
            >
              {renderAmount(balanceRs)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
