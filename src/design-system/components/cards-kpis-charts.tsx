import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, Shield, AlertTriangle, Info } from 'lucide-react';
import { globalDesignManager } from '../global-manager';

export const HeroKpiCardObsidian: React.FC<{
  title: string;
  amountRs: number;
  deltaPercent?: number;
  subtitle?: string;
}> = ({ title, amountRs, deltaPercent, subtitle }) => {
  return (
    <div className="flex flex-col justify-between p-5 bg-[#0F172A] text-white rounded-[16px] border border-slate-800 shadow-sm min-h-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {deltaPercent !== undefined && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans tabular-nums font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +{deltaPercent.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="my-2">
        <h2 className="text-2xl font-bold font-sans tabular-nums tracking-tight text-white">
          {globalDesignManager.formatRs(amountRs)}
        </h2>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export const PastelTintedKpiCard: React.FC<{
  title: string;
  value: string | number;
  tint?: 'emerald' | 'amber' | 'cobalt' | 'rose';
  subtitle?: string;
  isCurrency?: boolean;
}> = ({ title, value, tint = 'cobalt', subtitle, isCurrency = true }) => {
  const microDotClasses = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    cobalt: 'bg-blue-500',
    rose: 'bg-rose-500',
  }[tint];

  return (
    <div className="flex flex-col justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[110px] transition-all">
      <div className="flex items-center gap-1.5">
        <span className={clsx('w-2 h-2 rounded-full shrink-0', microDotClasses)} />
        <span className="text-xs font-medium text-slate-600 truncate">{title}</span>
      </div>
      <div className="my-1">
        <span className="text-2xl font-bold font-sans tabular-nums tracking-tight text-slate-900">
          {typeof value === 'number'
            ? (isCurrency ? globalDesignManager.formatRs(value) : value.toLocaleString('en-US'))
            : value}
        </span>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export const MinimalistHairlineKpiStrip: React.FC<{
  items: { label: string; value: string | number; sub?: string }[];
}> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl border border-slate-200/80 divide-x divide-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {items.map((item, idx) => (
        <div key={idx} className="p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">{item.label}</span>
          <span className="text-lg font-bold font-sans tabular-nums text-slate-900">
            {typeof item.value === 'number' ? globalDesignManager.formatRs(item.value) : item.value}
          </span>
          {item.sub && <span className="text-[11px] text-slate-400">{item.sub}</span>}
        </div>
      ))}
    </div>
  );
};

export const KpiCardWithStatusDot: React.FC<{
  label: string;
  count: number;
  statusDotColor: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ label, count, statusDotColor, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center justify-between p-3.5 bg-white rounded-xl border text-left transition-all',
        isActive
          ? 'border-[#F95700] ring-2 ring-orange-500/10 shadow-xs'
          : 'border-slate-200/80 hover:bg-slate-50/50'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusDotColor }} />
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-bold font-sans tabular-nums text-slate-900">{count}</span>
    </button>
  );
};

export const HeroHighlightBarChart: React.FC<{
  title?: string;
  data: { label: string; value: number; isPeak?: boolean; subLabel?: string }[];
  className?: string;
}> = ({ title = 'Daily Revenue Performance', data, className }) => {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const values = data.map((d) => (Number.isFinite(d.value) ? d.value : 0));
  const max = Math.max(...values, 1);
  const maxIdx = values.length > 0 ? values.indexOf(Math.max(...values)) : -1;

  return (
    <div
      className={clsx(
        'p-5 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-3 relative',
        className
      )}
      data-testid="hero-highlight-bar-chart"
    >
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>{title}</span>
        <span className="text-[11px] font-sans tabular-nums font-medium text-slate-500">
          Peak: {data[maxIdx] ? globalDesignManager.formatRs(data[maxIdx].value) : 'Rs. 0'}
        </span>
      </div>

      <div className="flex items-end gap-2.5 h-44 pt-6 pb-1">
        {data.map((d, i) => {
          const isPeak = d.isPeak ?? (i === maxIdx && d.value > 0);
          const safeVal = Number.isFinite(d.value) ? Math.max(0, d.value) : 0;
          const heightPct = Math.max(8, Math.min(100, Math.round((safeVal / max) * 100)));
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Floating dark tooltip on hover or peak */}
              {(isHovered || (hoveredIdx === null && isPeak)) && (
                <div className="absolute -top-12 z-20 pointer-events-none whitespace-nowrap bg-slate-900 text-white text-xs font-sans tabular-nums px-2.5 py-1 rounded-lg shadow-xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <span className="font-bold">{d.label}: </span>
                  <span className={isPeak ? 'text-[#F95700] font-black' : 'text-slate-200'}>
                    {globalDesignManager.formatRs(safeVal)}
                  </span>
                  {isPeak && <span className="ml-1 text-[10px] text-amber-300 font-bold uppercase">★ Peak</span>}
                </div>
              )}

              <div className="w-full flex items-end justify-center h-full">
                <div
                  className={clsx(
                    'w-full max-w-[48px] rounded-t-md transition-all duration-300 relative',
                    isPeak
                      ? 'bg-[#F95700] shadow-sm'
                      : 'bg-[#FFE8DF] hover:bg-[#FFD4C2]'
                  )}
                  style={{ height: `${heightPct}%` }}
                  title={`${d.label}: ${globalDesignManager.formatRs(safeVal)}`}
                >
                  {isPeak && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F95700] rounded-full ring-2 ring-white" />
                  )}
                </div>
              </div>

              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MultiSegmentDonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
  totalLabel?: string;
  className?: string;
}> = ({ segments, totalLabel = 'Total Sales', className }) => {
  const total = segments.reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0);
  const radius = 54;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius; // ~339.29

  let accumulatedPercent = 0;

  return (
    <div
      className={clsx(
        'p-5 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-4',
        className
      )}
      data-testid="multi-segment-donut-chart"
    >
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>Revenue Allocation</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Circular Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background track circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Segment Arcs */}
            {total > 0 &&
              segments.map((seg, idx) => {
                const safeVal = Math.max(0, seg.value || 0);
                const percent = total > 0 ? safeVal / total : 0;
                const dashLength = percent * circumference;
                const dashOffset = (1 - accumulatedPercent) * circumference;
                accumulatedPercent += percent;

                return (
                  <circle
                    key={idx}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap={percent > 0.98 ? 'butt' : 'round'}
                    className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                  >
                    <title>{`${seg.label}: ${globalDesignManager.formatRs(safeVal)} (${(percent * 100).toFixed(1)}%)`}</title>
                  </circle>
                );
              })}
          </svg>

          {/* Centered Total Figure in Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[80px]">
              {totalLabel}
            </span>
            <span className="text-xs font-sans tabular-nums font-bold text-slate-900 leading-tight">
              {globalDesignManager.formatRs(total)}
            </span>
          </div>
        </div>

        {/* Legend Chips with Clean 3-Column Grid Layout: Label | Amount | % */}
        <div className="flex-1 flex flex-col gap-1.5 w-full">
          {segments.map((seg, i) => {
            const safeVal = Math.max(0, seg.value || 0);
            const pct = total > 0 ? ((safeVal / total) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-slate-700 font-medium truncate" title={seg.label}>
                    {seg.label}
                  </span>
                </div>
                <span className="font-sans tabular-nums font-bold text-slate-900 whitespace-nowrap text-right">
                  {globalDesignManager.formatRs(safeVal)}
                </span>
                <span className="font-sans tabular-nums text-[11px] text-slate-400 w-11 text-right whitespace-nowrap">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PopularPartsRankedListCard: React.FC<{
  title?: string;
  items: Array<{
    sku: string;
    name: string;
    soldCount?: number;
    totalQtyConsumed?: number;
    revenueRs: number;
    turnoverRate?: string;
    category?: string;
  }>;
  className?: string;
}> = ({ title = 'Fast-Moving Inventory', items, className }) => {
  return (
    <div
      className={clsx(
        'p-5 bg-white rounded-[16px] border border-slate-200/80 shadow-xs flex flex-col gap-3',
        className
      )}
      data-testid="popular-parts-ranked-list-card"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        <span className="text-[11px] text-slate-400 font-mono">{items.length} Ranked Items</span>
      </div>

      <div className="flex flex-col divide-y divide-slate-100">
        {items.slice(0, 5).map((it, idx) => {
          const units = it.soldCount ?? it.totalQtyConsumed ?? 0;
          return (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    idx === 0
                      ? 'bg-amber-100 text-amber-900 font-black'
                      : idx === 1
                      ? 'bg-slate-200 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-slate-400 bg-slate-50'
                  )}
                >
                  {idx + 1}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-800 truncate">{it.name}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span>{it.sku}</span>
                    {it.turnoverRate && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-sans font-medium">{it.turnoverRate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-sans tabular-nums font-bold text-slate-900">
                  {globalDesignManager.formatRs(it.revenueRs)}
                </span>
                <span className="block text-[10px] text-slate-500 font-sans tabular-nums">
                  {units} units consumed
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const InsuranceReceivablesAgingCard: React.FC<{
  agingBuckets: { bucket: string; amountRs: number; count: number }[];
}> = ({ agingBuckets }) => {
  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200/80 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
        <span>Insurance Claims Aging</span>
        <Shield className="w-4 h-4 text-slate-400" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {agingBuckets.map((b, i) => (
          <div key={i} className="p-2.5 bg-slate-50 rounded-[10px] border border-slate-200/60 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">{b.bucket}</span>
            <span className="text-sm font-bold font-sans tabular-nums text-slate-900">{globalDesignManager.formatRs(b.amountRs)}</span>
            <span className="text-[10px] text-slate-400">{b.count} pending claims</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TechnicianEfficiencyScorecard: React.FC<{
  mechanicName?: string;
  technicianName?: string;
  jobsCompleted?: number;
  completedJobsCount?: number;
  avgDays?: number;
  avgTurnaroundDays?: number;
  avgPromisedDays?: number;
  efficiencyPercent?: number;
  onTimePercentage?: number;
  laborEfficiencyIndex?: number | string;
  velocityStatus?: 'AHEAD' | 'ON_TRACK' | 'BEHIND';
  className?: string;
}> = ({
  mechanicName,
  technicianName,
  jobsCompleted,
  completedJobsCount,
  avgDays,
  avgTurnaroundDays,
  avgPromisedDays = 3,
  efficiencyPercent,
  onTimePercentage,
  laborEfficiencyIndex,
  velocityStatus = 'ON_TRACK',
  className,
}) => {
  const name = technicianName || mechanicName || 'Technician';
  const completed = completedJobsCount ?? jobsCompleted ?? 0;
  const actualDays = avgTurnaroundDays ?? avgDays ?? 0;
  const onTimePct = onTimePercentage ?? efficiencyPercent ?? 90;

  return (
    <div
      className={clsx(
        'p-4 bg-white rounded-[14px] border border-slate-200/80 shadow-xs flex flex-col gap-3',
        className
      )}
      data-testid={`tech-scorecard-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs uppercase border border-slate-200">
            {name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs">{name}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {completed} jobs completed • Turnaround: {actualDays}d vs {avgPromisedDays}d target
            </span>
          </div>
        </div>

        <span
          className={clsx(
            'font-mono font-bold text-xs px-2.5 py-1 rounded-[8px] border',
            velocityStatus === 'AHEAD'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : velocityStatus === 'BEHIND'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          )}
        >
          {onTimePct}% On-time
        </span>
      </div>

      {/* On-Time Completion Percentage Bar & Labor Efficiency Index */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-500 font-medium">On-Time Completion</span>
          <span className="font-sans tabular-nums font-bold text-slate-800">{onTimePct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              onTimePct >= 90 ? 'bg-emerald-500' : onTimePct >= 75 ? 'bg-amber-500' : 'bg-rose-500'
            )}
            style={{ width: `${Math.min(100, Math.max(0, onTimePct))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500">
          <span>Labor Efficiency Index:</span>
          <span className="font-sans tabular-nums font-bold text-slate-900">
            {laborEfficiencyIndex !== undefined ? `${laborEfficiencyIndex}%` : `${Math.round(onTimePct)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

export const SmoothedBezierAreaChart: React.FC<{
  title: string;
  data: Array<{ label: string; revenue: number; profit: number }>;
  className?: string;
}> = ({ title, data, className }) => {
  const safeData = data.length > 0 ? data : [{ label: 'Period', revenue: 0, profit: 0 }];
  const maxVal = Math.max(...safeData.flatMap((d) => [d.revenue, d.profit]), 1);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;
  const drawWidth = svgWidth - paddingX * 2;
  const drawHeight = svgHeight - paddingY * 2;

  const getPoints = (key: 'revenue' | 'profit') => {
    return safeData.map((d, i) => {
      const x =
        safeData.length > 1
          ? paddingX + (i / (safeData.length - 1)) * drawWidth
          : paddingX + drawWidth / 2;
      const val = Number.isFinite(d[key]) ? Math.max(0, d[key]) : 0;
      const y = paddingY + drawHeight - (val / maxVal) * drawHeight;
      return { x, y, val, label: d.label };
    });
  };

  const revenuePoints = getPoints('revenue');
  const profitPoints = getPoints('profit');

  // Generate cubic bezier curve command
  const makeBezierPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${paddingX} ${points[0].y} L ${svgWidth - paddingX} ${points[0].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) / 2;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) / 2;
      const cpy2 = p1.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const revenueLine = makeBezierPath(revenuePoints);
  const profitLine = makeBezierPath(profitPoints);

  const revenueArea = `${revenueLine} L ${revenuePoints[revenuePoints.length - 1].x} ${
    paddingY + drawHeight
  } L ${revenuePoints[0].x} ${paddingY + drawHeight} Z`;

  const profitArea = `${profitLine} L ${profitPoints[profitPoints.length - 1].x} ${
    paddingY + drawHeight
  } L ${profitPoints[0].x} ${paddingY + drawHeight} Z`;

  return (
    <div
      className={clsx(
        'p-5 bg-white rounded-[16px] border border-slate-200/80 shadow-xs flex flex-col gap-3',
        className
      )}
      data-testid="smoothed-bezier-area-chart"
    >
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>{title}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F95700]" /> Revenue Trend
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Gross Profit Trend
          </span>
        </div>
      </div>

      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenue-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F95700" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F95700" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="profit-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="#F1F5F9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + drawHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingY + drawHeight / 2}
            stroke="#F1F5F9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + drawHeight}
            x2={svgWidth - paddingX}
            y2={paddingY + drawHeight}
            stroke="#E2E8F0"
          />

          {/* Zero-state subtle watermark message */}
          {safeData.every((d) => d.revenue === 0 && d.profit === 0) && (
            <text
              x={svgWidth / 2}
              y={paddingY + drawHeight / 2 - 4}
              textAnchor="middle"
              className="fill-slate-400 text-xs font-sans font-medium"
              data-testid="bezier-empty-state"
            >
              No revenue or profit activity recorded for this period
            </text>
          )}

          {/* Area fills */}
          <path d={revenueArea} fill="url(#revenue-area-grad)" />
          <path d={profitArea} fill="url(#profit-area-grad)" />

          {/* Line strokes */}
          <path d={revenueLine} fill="none" stroke="#F95700" strokeWidth="2.5" strokeLinecap="round" />
          <path d={profitLine} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Revenue Data Points */}
          {revenuePoints.map((p, i) => (
            <circle
              key={`rev-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-white stroke-[#F95700] stroke-2 hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${p.label} Revenue: ${globalDesignManager.formatRs(p.val)}`}</title>
            </circle>
          ))}

          {/* Profit Data Points */}
          {profitPoints.map((p, i) => (
            <circle
              key={`prof-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-white stroke-[#10B981] stroke-2 hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${p.label} Profit: ${globalDesignManager.formatRs(p.val)}`}</title>
            </circle>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between items-center px-10 text-[10px] text-slate-400 font-mono -mt-1">
          {safeData.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GroupedComparisonBarChart: React.FC<{
  title: string;
  data: Array<{ month: string; workshopSales: number; posSales: number }>;
}> = ({ title, data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.workshopSales, d.posSales]), 1);

  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200/80 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>{title}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded bg-[#0F172A]" /> Workshop
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded bg-[#F95700]" /> Counter POS
          </span>
        </div>
      </div>
      <div className="h-40 flex items-end gap-3 pt-4">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <div
                className="w-1/2 bg-[#0F172A] rounded-t-[4px]"
                style={{ height: `${(d.workshopSales / maxVal) * 100}%` }}
                title={`Workshop: ${globalDesignManager.formatRs(d.workshopSales)}`}
              />
              <div
                className="w-1/2 bg-[#F95700] rounded-t-[4px]"
                style={{ height: `${(d.posSales / maxVal) * 100}%` }}
                title={`POS: ${globalDesignManager.formatRs(d.posSales)}`}
              />
            </div>
            <span className="text-[10px] text-slate-500">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DarkFloatingChartTooltip: React.FC<{
  dateHeader: string;
  items: Array<{ label: string; valueRs: number; colorHex: string }>;
  deltaText?: string;
}> = ({ dateHeader, items, deltaText }) => {
  return (
    <div className="p-3 bg-[#0F172A] text-white rounded-[10px] shadow-xl border border-slate-800 min-w-[160px] text-xs flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-semibold text-slate-400">{dateHeader}</span>
        {deltaText && (
          <span className="text-[10px] font-bold text-emerald-400 font-sans tabular-nums">{deltaText}</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.colorHex }} />
              {it.label}
            </span>
            <span className="font-sans tabular-nums font-bold">{globalDesignManager.formatRs(it.valueRs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LowStockAlertTickerCard: React.FC<{
  alerts: Array<{
    name: string;
    sku: string;
    stockQty: number;
    minQty?: number;
    lowStockAlertLevel?: number;
    deficitQty?: number;
    turnoverRate?: string;
    reorderNotes?: string;
    status?: string;
  }>;
  onQuickRestock?: (sku: string) => void;
  className?: string;
}> = ({ alerts, onQuickRestock, className }) => {
  return (
    <div
      className={clsx(
        'p-5 bg-white rounded-[16px] border border-amber-200/80 bg-amber-50/20 shadow-xs flex flex-col gap-3',
        className
      )}
      data-testid="low-stock-alert-ticker-card"
    >
      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Low Stock Alerts ({alerts.length})</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
          Immediate Replenishment
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {alerts.slice(0, 4).map((a, i) => {
          const min = a.minQty ?? a.lowStockAlertLevel ?? 5;
          const deficit = a.deficitQty ?? Math.max(0, min - a.stockQty);
          const isOut = a.stockQty <= 0;

          return (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-[10px] border border-amber-100 shadow-2xs"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-xs">{a.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{a.sku}</span>
                </div>
                {a.reorderNotes && (
                  <span className="text-[10px] text-amber-800 mt-0.5">{a.reorderNotes}</span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span
                  className={clsx(
                    'font-mono font-bold text-xs px-2 py-0.5 rounded border',
                    isOut
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  )}
                >
                  {a.stockQty} left (min: {min})
                </span>

                {onQuickRestock ? (
                  <button
                    type="button"
                    onClick={() => onQuickRestock(a.sku)}
                    className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                    data-testid={`quick-restock-btn-${a.sku.toLowerCase()}`}
                  >
                    Quick Restock (+{deficit})
                  </button>
                ) : (
                  <span
                    className="text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded"
                    data-testid={`quick-restock-tag-${a.sku.toLowerCase()}`}
                  >
                    Quick Restock (+{deficit})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WorkshopBayUtilizationGauge: React.FC<{
  occupiedBays: number;
  totalBays: number;
}> = ({ occupiedBays, totalBays }) => {
  const percent = Math.round((occupiedBays / totalBays) * 100);

  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200/80 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">Bay Utilization</span>
        <span className="font-sans tabular-nums font-bold text-[#F95700]">{percent}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#F95700] rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-[11px] text-slate-500">
        {occupiedBays} of {totalBays} physical bays active
      </span>
    </div>
  );
};

export const ChartPeriodDropdownSelector: React.FC<{
  currentPeriod: string;
  options?: string[];
  onChange: (period: string) => void;
}> = ({ currentPeriod, options = ['2026', '2025', 'Monthly', 'Quarterly'], onChange }) => {
  return (
    <select
      value={currentPeriod}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[8px] px-2.5 py-1 focus:outline-none focus:border-[#F95700]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

export const SparklineMicroTrend: React.FC<{
  data: number[];
  isPositive?: boolean;
}> = ({ data, isPositive = true }) => {
  const min = Math.min(...data);
  const max = Math.max(...data, 1);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 64;
      const y = 24 - ((val - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-16 h-6 overflow-visible">
      <polyline
        fill="none"
        stroke={isPositive ? '#10B981' : '#EF4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const ConversionFunnelMetricBar: React.FC<{
  quotationCount: number;
  jobCardCount: number;
  invoicedCount: number;
}> = ({ quotationCount, jobCardCount, invoicedCount }) => {
  const total = Math.max(quotationCount, 1);
  const jobRatio = Math.round((jobCardCount / total) * 100);
  const invoiceRatio = Math.round((invoicedCount / total) * 100);

  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200/80 flex flex-col gap-2.5">
      <span className="text-xs font-bold text-slate-800">Job Conversion Funnel</span>
      <div className="flex items-center gap-2 text-xs font-sans tabular-nums">
        <span className="p-2 bg-blue-50 text-blue-700 rounded-md font-bold flex-1 text-center">
          {quotationCount} Quotes
        </span>
        <span>→</span>
        <span className="p-2 bg-amber-50 text-amber-800 rounded-md font-bold flex-1 text-center">
          {jobCardCount} Jobs ({jobRatio}%)
        </span>
        <span>→</span>
        <span className="p-2 bg-emerald-50 text-emerald-800 rounded-md font-bold flex-1 text-center">
          {invoicedCount} Invoiced ({invoiceRatio}%)
        </span>
      </div>
    </div>
  );
};

export const AverageTicketValueCard: React.FC<{
  workshopAvgRs: number;
  posAvgRs: number;
}> = ({ workshopAvgRs, posAvgRs }) => {
  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200/80 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Workshop Ticket</span>
        <span className="block text-lg font-bold font-sans tabular-nums text-slate-900">
          {globalDesignManager.formatRs(workshopAvgRs)}
        </span>
      </div>
      <div className="h-8 w-px bg-slate-200" />
      <div className="text-right">
        <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg POS Basket</span>
        <span className="block text-lg font-bold font-sans tabular-nums text-slate-900">
          {globalDesignManager.formatRs(posAvgRs)}
        </span>
      </div>
    </div>
  );
};

export const LaborVsPartsRatioBar: React.FC<{
  laborRevenueRs: number;
  partsRevenueRs: number;
}> = ({ laborRevenueRs, partsRevenueRs }) => {
  const total = laborRevenueRs + partsRevenueRs || 1;
  const laborPct = Math.round((laborRevenueRs / total) * 100);
  const partsPct = 100 - laborPct;

  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200/80 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">Labor vs. Parts Ratio</span>
        <span className="text-slate-500 font-sans tabular-nums text-[11px]">
          Labor {laborPct}% / Parts {partsPct}%
        </span>
      </div>
      <div className="h-3 w-full flex rounded-full overflow-hidden">
        <div className="bg-[#0F172A]" style={{ width: `${laborPct}%` }} title={`Labor: ${globalDesignManager.formatRs(laborRevenueRs)}`} />
        <div className="bg-[#F95700]" style={{ width: `${partsPct}%` }} title={`Parts: ${globalDesignManager.formatRs(partsRevenueRs)}`} />
      </div>
    </div>
  );
};

export const InteractiveChartLegend: React.FC<{
  series: Array<{ id: string; label: string; color: string; isVisible: boolean }>;
  onToggle: (id: string) => void;
}> = ({ series, onToggle }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {series.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onToggle(s.id)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all',
            s.isVisible
              ? 'bg-slate-50 border-slate-300 text-slate-800'
              : 'bg-white border-dashed border-slate-200 text-slate-400 opacity-60'
          )}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
};

export const MetricComparisonTooltip: React.FC<{
  formulaText: string;
  label?: string;
}> = ({ formulaText, label = 'Formula' }) => {
  return (
    <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-help" title={formulaText}>
      <Info className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

