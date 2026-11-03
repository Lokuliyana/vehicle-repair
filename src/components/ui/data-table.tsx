import React, { createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { globalDesignManager } from '@/design-system/global-manager';

export type TableDensity = 'compact' | 'default' | 'comfortable';

interface DataTableContextValue {
  density: TableDensity;
}

const DataTableContext = createContext<DataTableContextValue>({ density: 'default' });

export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: TableDensity;
}

export const DataTable: React.FC<DataTableProps> = ({
  density = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <DataTableContext.Provider value={{ density }}>
      <div
        className={cn(
          'w-full bg-white rounded-[16px] border border-slate-200/80 shadow-xs overflow-hidden',
          className
        )}
        {...props}
      >
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm border-collapse">{children}</table>
        </div>
      </div>
    </DataTableContext.Provider>
  );
};

export interface DataTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  variant?: 'warm' | 'cool';
}

export const DataTableHeader = React.forwardRef<HTMLTableSectionElement, DataTableHeaderProps>(
  ({ className, variant = 'cool', ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          'border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600',
          variant === 'warm' ? 'bg-[#FFF7ED]/70' : 'bg-slate-50/80',
          className
        )}
        {...props}
      />
    );
  }
);
DataTableHeader.displayName = 'DataTableHeader';

export const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
DataTableBody.displayName = 'DataTableBody';

export interface DataTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
}

export const DataTableRow = React.forwardRef<HTMLTableRowElement, DataTableRowProps>(
  ({ className, isSelected = false, ...props }, ref) => {
    const { density } = useContext(DataTableContext);

    const heightClasses = {
      compact: 'h-10 min-h-[40px]',
      default: 'h-12 min-h-[48px]',
      comfortable: 'h-14 min-h-[56px]',
    }[density];

    return (
      <tr
        ref={ref}
        data-state={isSelected ? 'selected' : undefined}
        className={cn(
          'border-b border-slate-100 transition-colors hover:bg-slate-50/70',
          isSelected && 'bg-orange-50/50 hover:bg-orange-50/70',
          heightClasses,
          className
        )}
        {...props}
      />
    );
  }
);
DataTableRow.displayName = 'DataTableRow';

export interface DataTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  isFinancial?: boolean;
}

export const DataTableCell = React.forwardRef<HTMLTableCellElement, DataTableCellProps>(
  ({ className, align = 'left', isFinancial = false, children, ...props }, ref) => {
    const { density } = useContext(DataTableContext);

    const paddingClasses = {
      compact: 'px-3 py-1.5',
      default: 'px-4 py-2.5',
      comfortable: 'px-5 py-3.5',
    }[density];

    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[align];

    return (
      <td
        ref={ref}
        className={cn(
          'align-middle text-xs text-slate-800',
          isFinancial && 'text-right font-mono tabular-nums font-semibold',
          alignClass,
          paddingClasses,
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
DataTableCell.displayName = 'DataTableCell';

export const DataTableActions = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => {
  return (
    <td
      ref={ref}
      className={cn('px-4 py-2 text-right align-middle shrink-0 whitespace-nowrap', className)}
      {...props}
    >
      <div className="inline-flex items-center justify-end gap-1.5">{children}</div>
    </td>
  );
});
DataTableActions.displayName = 'DataTableActions';

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200/80 text-xs text-slate-600',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {totalItems !== undefined && (
          <span className="font-sans tabular-nums">
            Showing <strong className="text-slate-900">{startItem}</strong> to{' '}
            <strong className="text-slate-900">{endItem}</strong> of{' '}
            <strong className="text-slate-900">{totalItems}</strong> entries
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-medium font-sans tabular-nums">
          Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
          <strong className="text-slate-900">{Math.max(1, totalPages)}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const DataTableEmptyState: React.FC<DataTableEmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search filters or create a new entry.',
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('p-12 text-center flex flex-col items-center justify-center gap-3', className)}>
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5 max-w-sm">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-3.5 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 max-w-md">
        {onSearchChange && (
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200/80 rounded-[10px] focus:bg-white focus:border-[#F95700] focus:ring-2 focus:ring-orange-500/10 focus:outline-none transition-all"
            />
          </div>
        )}
        {filters}
      </div>

      {actions && <div className="flex items-center gap-2 self-end sm:self-center">{actions}</div>}
    </div>
  );
};

// Specialized Cell Helpers
export const CodeCell: React.FC<{ code: string; className?: string }> = ({ code, className }) => (
  <span
    className={cn(
      'font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/60 inline-block',
      className
    )}
  >
    {code}
  </span>
);

export const LicensePlateCell: React.FC<{
  plateNumber: string;
  sub?: string;
  className?: string;
}> = ({ plateNumber, sub, className }) => (
  <div className={cn('flex flex-col gap-0.5', className)}>
    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-900 border border-slate-300 rounded self-start tracking-wide">
      {plateNumber}
    </span>
    {sub && <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{sub}</span>}
  </div>
);

export const CurrencyCell: React.FC<{
  amountRs: number;
  highlightNegative?: boolean;
  className?: string;
}> = ({ amountRs, highlightNegative = true, className }) => (
  <span
    className={cn(
      'font-mono tabular-nums text-xs font-semibold block text-right',
      highlightNegative && amountRs < 0 ? 'text-red-600' : 'text-slate-900',
      className
    )}
  >
    {globalDesignManager.formatRs(amountRs)}
  </span>
);
