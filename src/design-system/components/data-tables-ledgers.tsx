import React, { useState } from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Inbox, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, GripVertical, Download, AlertCircle, X, Check } from 'lucide-react';
import { globalDesignManager } from '../global-manager';

export const LuxuryDataTableWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'w-full bg-white rounded-[16px] border border-slate-200/80 shadow-xs overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

export const DataTableWarmHeaderRow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <tr
      className={clsx(
        'bg-slate-50/70 border-b border-slate-100 text-[11px] font-medium text-slate-500',
        className
      )}
    >
      {children}
    </tr>
  );
};

export interface TableStatusFilterPillsProps {
  filters: { label: string; count?: number; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
  testIdPrefix?: string;
}

export const TableStatusFilterPills: React.FC<TableStatusFilterPillsProps> = ({
  filters,
  activeValue,
  onChange,
  testIdPrefix,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {filters.map((f) => {
        const isActive = f.value === activeValue;
        return (
          <button
            key={f.value}
            type="button"
            data-testid={testIdPrefix ? `${testIdPrefix}-${f.value}` : undefined}
            onClick={() => onChange(f.value)}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer',
              isActive
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            )}
          >
            <span>{f.label}</span>
            {f.count !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.2 text-[10px] rounded-full',
                  isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
                )}
              >
                {f.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const TableVehicleBadgeCell: React.FC<{
  plateNumber: string;
  makeModel?: string;
}> = ({ plateNumber, makeModel }) => {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="inline-flex items-center self-start px-2 py-0.5 bg-slate-100 text-slate-900 border border-slate-300 rounded font-mono font-bold text-xs tracking-wide">
        {plateNumber}
      </div>
      {makeModel && <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{makeModel}</span>}
    </div>
  );
};

export const TableMarginSparkBarCell: React.FC<{ marginPercent: number; isRedacted?: boolean }> = ({ marginPercent, isRedacted = false }) => {
  if (isRedacted) {
    return (
      <div className="flex items-center justify-center gap-1.5" data-testid="redacted-margin-cell">
        <span className="font-mono text-xs text-slate-400 select-none tracking-wider">••••%</span>
      </div>
    );
  }

  const health = globalDesignManager.getMarginHealth(marginPercent);
  const clamped = Math.max(0, Math.min(100, marginPercent));

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: health.dotColor }} />
      </div>
      <span className={clsx('text-xs font-sans tabular-nums font-bold', health.textColor)}>
        {marginPercent.toFixed(1)}%
      </span>
    </div>
  );
};

export const TableDeltaTrendChip: React.FC<{ deltaPercent: number }> = ({ deltaPercent }) => {
  const isPositive = deltaPercent >= 0;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded',
        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      )}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{isPositive ? `+${deltaPercent.toFixed(1)}%` : `${deltaPercent.toFixed(1)}%`}</span>
    </div>
  );
};

export const EmptyTableStateCard: React.FC<{
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[16px] border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-[#F95700] hover:bg-[#EA580C] rounded-[10px] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const PinnedSummaryFooterRow: React.FC<{
  label: string;
  totalAmountRs: number;
  colSpan?: number;
}> = ({ label, totalAmountRs, colSpan = 3 }) => {
  return (
    <tr className="bg-slate-50/80 border-t-2 border-slate-200 font-bold text-xs text-slate-900">
      <td colSpan={colSpan} className="py-2.5 px-4 text-right">
        {label}:
      </td>
      <td className="py-2.5 px-4 text-right font-sans tabular-nums text-sm text-[#0F172A]">
        {globalDesignManager.formatRs(totalAmountRs)}
      </td>
    </tr>
  );
};

export const SortableColumnHeader: React.FC<{
  label: string;
  isSorted?: boolean;
  sortDirection?: 'asc' | 'desc';
  onSort?: () => void;
  className?: string;
}> = ({ label, isSorted = false, sortDirection = 'asc', onSort, className = '' }) => {
  return (
    <th
      onClick={onSort}
      className={clsx(
        'py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none hover:bg-orange-50/50 transition-colors',
        className
      )}
    >
      <div className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        {isSorted ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-[#F95700]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#F95700]" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </div>
    </th>
  );
};

export const DataTableInteractiveRow: React.FC<{
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ children, isSelected = false, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'h-[52px] border-b border-slate-100 transition-colors cursor-pointer',
        isSelected ? 'bg-orange-50/40' : 'hover:bg-slate-50/80 bg-white',
        className
      )}
    >
      {children}
    </tr>
  );
};

export const TableRowSelectionCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={clsx(
        'w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer',
        checked ? 'bg-[#0F172A] border-[#0F172A] text-white' : 'bg-white border-slate-300 hover:border-slate-400'
      )}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </div>
  );
};

export const FloatingBulkActionBar: React.FC<{
  selectedCount: number;
  actions: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'destructive' | 'default' }>;
  onClear: () => void;
}> = ({ selectedCount, actions, onClear }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <span className="text-xs font-semibold">{selectedCount} items selected</span>
      <div className="h-4 w-px bg-slate-700" />
      <div className="flex items-center gap-2">
        {actions.map((act, idx) => (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            className={clsx(
              'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
              act.variant === 'primary'
                ? 'bg-[#F95700] hover:bg-[#EA580C] text-white'
                : act.variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            )}
          >
            {act.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-white ml-1"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export const MultiFacetFilterDropdownBar: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-[12px] mb-4">
      {children}
    </div>
  );
};

export const ActiveFilterDismissibleChip: React.FC<{
  label: string;
  value: string;
  onDismiss: () => void;
}> = ({ label, value, onDismiss }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-full shadow-2xs">
      <span className="text-slate-400 font-semibold">{label}:</span>
      <span className="font-bold text-slate-800">{value}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
};

export const TablePrimaryIdentityCell: React.FC<{
  id: string;
  timestamp?: string;
  subtitle?: string;
}> = ({ id, timestamp, subtitle }) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-mono font-bold text-slate-900">{id}</span>
      {(timestamp || subtitle) && (
        <span className="text-[10px] text-slate-400">{timestamp || subtitle}</span>
      )}
    </div>
  );
};

export const TableFinancialAmountCell: React.FC<{
  amountRs: number;
  subLabel?: string;
}> = ({ amountRs, subLabel }) => {
  return (
    <div className="flex flex-col text-right">
      <span className="text-xs font-sans tabular-nums font-bold text-slate-900">
        {globalDesignManager.formatRs(amountRs)}
      </span>
      {subLabel && <span className="text-[10px] text-slate-400">{subLabel}</span>}
    </div>
  );
};

export const TableRowQuickActionsMenu: React.FC<{
  actions: Array<{ label: string; onClick: () => void; isDestructive?: boolean }>;
}> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[6px] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-[10px] shadow-lg py-1 z-50">
          {actions.map((act, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                act.onClick();
                setIsOpen(false);
              }}
              className={clsx(
                'w-full px-3 py-1.5 text-left text-xs transition-colors',
                act.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ExpandableSubRowLedger: React.FC<{
  isExpanded: boolean;
  children: React.ReactNode;
  colSpan?: number;
}> = ({ isExpanded, children, colSpan = 10 }) => {
  if (!isExpanded) return null;
  return (
    <tr className="bg-slate-50/70 border-b border-slate-200">
      <td colSpan={colSpan} className="p-4">
        {children}
      </td>
    </tr>
  );
};

export const DraggableLineItemHandle: React.FC = () => {
  return (
    <div className="cursor-grab text-slate-400 hover:text-slate-600 p-1">
      <GripVertical className="w-4 h-4" />
    </div>
  );
};

export const DataTableFooterPagination: React.FC<{
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ totalRecords, currentPage, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600">
      <span>
        Showing <strong className="text-slate-900">{start}–{end}</strong> of <strong className="text-slate-900">{totalRecords}</strong> records
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={clsx(
                'w-7 h-7 rounded-[6px] text-xs font-semibold transition-colors',
                currentPage === pageNum
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ColumnVisibilityTogglePopover: React.FC<{
  columns: Array<{ id: string; label: string; isVisible: boolean }>;
  onToggle: (id: string) => void;
}> = ({ columns, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors"
      >
        Columns
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-[10px] shadow-lg p-2 z-50 flex flex-col gap-1.5">
          {columns.map((col) => (
            <label key={col.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={col.isVisible}
                onChange={() => onToggle(col.id)}
                className="rounded text-[#F95700] focus:ring-orange-500"
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const CsvExcelExportButton: React.FC<{ onExport: () => void; label?: string }> = ({
  onExport,
  label = 'Export CSV',
}) => {
  return (
    <button
      type="button"
      onClick={onExport}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors shadow-2xs"
    >
      <Download className="w-3.5 h-3.5 text-slate-500" />
      <span>{label}</span>
    </button>
  );
};

export const TableSkeletonLoaderRows: React.FC<{ rowsCount?: number; columnsCount?: number }> = ({
  rowsCount = 5,
  columnsCount = 5,
}) => {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, rIdx) => (
        <tr key={rIdx} className="h-12 border-b border-slate-100 animate-pulse">
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <td key={cIdx} className="p-3">
              <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const AttentionAlertBannerStrip: React.FC<{
  message: string;
  count?: number;
  onAction?: () => void;
}> = ({ message, count, onAction }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-[12px] mb-4 text-xs text-amber-900">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span className="font-semibold">Needs Attention:</span>
        <span>{message}</span>
        {count !== undefined && (
          <span className="px-1.5 py-0.5 rounded-full bg-amber-200 font-bold text-[10px]">
            {count}
          </span>
        )}
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="font-bold underline hover:text-amber-950"
        >
          Review Now
        </button>
      )}
    </div>
  );
};

export const InlineRowQuickEditPopover: React.FC<{
  currentValue: number | string;
  onSave: (val: string) => void;
  label?: string;
}> = ({ currentValue, onSave, label = 'Edit Value' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [val, setVal] = useState(String(currentValue));

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-mono font-medium text-slate-800 hover:text-orange-600 underline underline-offset-2"
      >
        {currentValue}
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-[10px] shadow-lg p-2.5 z-50 flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">{label}</span>
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full h-8 px-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#F95700]"
            autoFocus
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(val);
                setIsOpen(false);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#F95700] rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

