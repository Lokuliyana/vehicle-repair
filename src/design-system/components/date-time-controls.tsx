import React from 'react';
import { clsx } from 'clsx';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerSingleLuxuryProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const DatePickerSingleLuxury: React.FC<DatePickerSingleLuxuryProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-9 pr-3 text-xs font-mono bg-white border border-slate-200/90 rounded-[10px] focus:outline-none focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10"
      />
    </div>
  );
};

export const AgingDurationBadge: React.FC<{
  days: number;
  bucket?: string;
  className?: string;
}> = ({ days, bucket, className }) => {
  const isCritical = days > 60;
  const isAging = days > 30;
  const isDueSoon = days > 15;

  const tierLabel =
    bucket ||
    (isCritical
      ? '60+ Days Overdue'
      : isAging
      ? '31-60 Days'
      : isDueSoon
      ? '16-30 Days'
      : '0-15 Days');

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border',
        isCritical
          ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
          : isAging
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : isDueSoon
          ? 'bg-blue-50 text-blue-800 border-blue-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200',
        className
      )}
      data-testid="aging-duration-badge"
    >
      <Clock className="w-3 h-3" />
      <span>{days} {days === 1 ? 'Day' : 'Days'} ({tierLabel})</span>
    </div>
  );
};

export const ShiftDurationTimer: React.FC<{ openedAt: string }> = ({ openedAt }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-mono font-medium">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      <span>Shift: {openedAt}</span>
    </div>
  );
};

export const DeliveryCountdownBar: React.FC<{
  remainingDays: number;
  totalDays: number;
}> = ({ remainingDays, totalDays }) => {
  const elapsed = Math.max(0, totalDays - remainingDays);
  const percent = totalDays > 0 ? Math.min(100, Math.round((elapsed / totalDays) * 100)) : 100;
  const isOverdue = remainingDays <= 0;

  return (
    <div className="flex flex-col gap-1 w-full max-w-xs">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Turnaround</span>
        <span className={clsx('font-semibold', isOverdue ? 'text-red-600' : 'text-slate-800')}>
          {isOverdue ? 'Delivery Overdue' : `${remainingDays} of ${totalDays} Days Left`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-300',
            isOverdue ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-[#F95700]'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const MonthYearQuickSwitcher: React.FC<{
  currentMonth: string;
  onPrev: () => void;
  onNext: () => void;
}> = ({ currentMonth, onPrev, onNext }) => {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-[10px] p-1 shadow-xs">
      <button
        type="button"
        onClick={onPrev}
        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="px-2 text-xs font-semibold text-slate-800 min-w-[90px] text-center">
        {currentMonth}
      </span>
      <button
        type="button"
        onClick={onNext}
        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface DateRangePickerAnalyticsProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onApply?: () => void;
  className?: string;
  startInputTestId?: string;
  endInputTestId?: string;
  applyTestId?: string;
  dataTestId?: string;
}

export const DateRangePickerAnalytics: React.FC<DateRangePickerAnalyticsProps> = ({
  startDate,
  endDate,
  onChange,
  onApply,
  className = '',
  startInputTestId,
  endInputTestId,
  applyTestId,
  dataTestId,
}) => {
  const presets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'This Month', days: 30 },
  ];

  return (
    <div className={clsx('inline-flex flex-wrap items-center gap-2', className)} data-testid={dataTestId}>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-[10px] text-xs shadow-2xs">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="font-mono text-slate-800 focus:outline-none"
          data-testid={startInputTestId}
        />
        <span className="text-slate-400 font-medium">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="font-mono text-slate-800 focus:outline-none"
          data-testid={endInputTestId}
        />
        {onApply && (
          <button
            type="button"
            onClick={onApply}
            className="ml-2 px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-[6px] transition-colors cursor-pointer"
            data-testid={applyTestId}
          >
            Apply
          </button>
        )}
      </div>
      <div className="inline-flex gap-1">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const past = new Date(Date.now() - p.days * 86400000).toISOString().split('T')[0];
              onChange(past, today);
            }}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[8px] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const CompletionDaysCounterInput: React.FC<{
  days: number;
  onChange: (days: number) => void;
  startDate?: string;
}> = ({ days, onChange, startDate }) => {
  const targetDate = startDate
    ? new Date(new Date(startDate).getTime() + days * 86400000).toLocaleDateString('en-LK', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center border border-slate-200 rounded-[10px] overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, days - 1))}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs"
          >
            -
          </button>
          <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-900 min-w-[50px] text-center">
            {days} Days
          </span>
          <button
            type="button"
            onClick={() => onChange(days + 1)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs"
          >
            +
          </button>
        </div>
        {targetDate && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Due: {targetDate}
          </span>
        )}
      </div>
    </div>
  );
};

export const TimeSlotPickerPopover: React.FC<{
  value: string;
  onChange: (time: string) => void;
  slots?: string[];
}> = ({
  value,
  onChange,
  slots = ['08:30 AM', '09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM'],
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {slots.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={clsx(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-[8px] transition-all',
            value === s
              ? 'bg-[#0F172A] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export const TimestampRelativeCell: React.FC<{
  isoString: string;
  actor?: string;
}> = ({ isoString, actor }) => {
  const date = new Date(isoString);
  const timeFormatted = isNaN(date.getTime())
    ? isoString
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col text-left">
      <span className="text-xs font-medium text-slate-800">{timeFormatted}</span>
      {actor && <span className="text-[10px] text-slate-400">by {actor}</span>}
    </div>
  );
};

export const FiscalQuarterSelector: React.FC<{
  quarter: string;
  onChange: (q: string) => void;
}> = ({ quarter, onChange }) => {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  return (
    <div className="inline-flex rounded-[8px] bg-slate-100 p-0.5 border border-slate-200">
      {quarters.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onChange(q)}
          className={clsx(
            'px-3 py-1 text-xs font-semibold rounded-[6px] transition-all',
            quarter === q
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export const ManufacturingYearPicker: React.FC<{
  value: number;
  onChange: (year: number) => void;
  startYear?: number;
  endYear?: number;
}> = ({ value, onChange, startYear = 1995, endYear = 2026 }) => {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-10 px-3 text-xs font-mono font-medium text-slate-800 bg-white border border-slate-200/90 rounded-[10px] focus:outline-none focus:border-[#F95700]"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
};

export const AuditTimelineDateHeader: React.FC<{ dateLabel: string }> = ({ dateLabel }) => {
  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-xs py-1.5 px-3 border-y border-slate-100 my-2 z-10">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {dateLabel}
      </span>
    </div>
  );
};

