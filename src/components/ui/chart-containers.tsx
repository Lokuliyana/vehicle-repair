import React from 'react';
import { cn } from '@/utils/cn';

export interface ChartLegendItem {
  label: string;
  color: string;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ items, className }) => {
  return (
    <div className={cn('flex items-center gap-3 text-xs text-slate-600', className)}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <span className="font-medium text-slate-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  filterSlot?: React.ReactNode;
  legend?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  filterSlot,
  legend,
  children,
  height = 280,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-5 bg-white border border-slate-200/80 rounded-[16px] shadow-xs flex flex-col',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {(legend || filterSlot) && (
          <div className="flex items-center gap-3 flex-wrap">
            {legend}
            {filterSlot}
          </div>
        )}
      </div>

      <div
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
        className="w-full flex-1 relative flex items-center justify-center"
      >
        {children}
      </div>
    </div>
  );
};

export interface ChartTooltipProps {
  label?: string;
  items: Array<{ label: string; value: string | number; color?: string }>;
  className?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ label, items, className }) => {
  return (
    <div
      className={cn(
        'bg-[#0F172A] text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs pointer-events-none select-none z-50 flex flex-col gap-1.5 min-w-[140px]',
        className
      )}
    >
      {label && <div className="text-[11px] font-semibold text-slate-400 border-b border-slate-800 pb-1">{label}</div>}
      <div className="flex flex-col gap-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 truncate">
              {it.color && (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
              )}
              <span className="text-slate-300 truncate">{it.label}</span>
            </div>
            <span className="font-mono tabular-nums font-bold text-white shrink-0">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BarChartContainer: React.FC<ChartContainerProps> = (props) => (
  <ChartContainer {...props} />
);

export const LineChartContainer: React.FC<ChartContainerProps> = (props) => (
  <ChartContainer {...props} />
);

export const AreaChartContainer: React.FC<ChartContainerProps> = (props) => (
  <ChartContainer {...props} />
);

export const DonutChartContainer: React.FC<ChartContainerProps> = (props) => (
  <ChartContainer {...props} />
);
