import React from 'react';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';
import { FilterToolbar, FilterToolbarProps } from '@/components/ui/filter-toolbar';
import { LoadingSkeleton } from '@/components/ui/feedback-empty-skeleton';

export type FilterToolbarConfig =
  | FilterToolbarProps
  | {
      search?: string;
      searchValue?: string;
      onSearchChange?: (query: string) => void;
      placeholder?: string;
      searchPlaceholder?: string;
      [key: string]: any;
    };

export interface ListPagePatternProps {
  /**
   * Title and header configuration or a custom header node.
   */
  header:
    | React.ReactNode
    | {
        title: string;
        subtitle?: string;
        breadcrumbs?: Array<{ label: string; href?: string }>;
        actions?: React.ReactNode;
      };
  /**
   * Optional KPI or metric summary cards row displayed above filters.
   */
  kpiStrip?: React.ReactNode;
  /**
   * Optional preconfigured FilterToolbar props or custom filter bar node.
   */
  filterToolbar?: React.ReactNode | FilterToolbarConfig;
  /**
   * Main table content.
   */
  children?: React.ReactNode;
  /**
   * Table pagination element.
   */
  pagination?: React.ReactNode;
  /**
   * Floating bulk action bar when records are checked.
   */
  bulkActions?: React.ReactNode;
  /**
   * Empty state props or component to render when items are empty.
   */
  emptyState?: React.ReactNode;
  /**
   * Whether the list is currently loading data.
   */
  isLoading?: boolean;
  /**
   * Loading row count placeholder.
   */
  loadingRows?: number;
  /**
   * Maximum page width for PageContainer. Default is 'wide' (max-w-[1600px]).
   */
  maxWidth?: 'standard' | 'wide' | 'full';
  className?: string;
  dataTestId?: string;
}

export function ListPagePattern({
  header,
  kpiStrip,
  filterToolbar,
  children,
  pagination,
  bulkActions,
  emptyState,
  isLoading = false,
  loadingRows = 5,
  maxWidth = 'wide',
  className,
  dataTestId = 'list-page-pattern',
}: ListPagePatternProps) {
  const renderHeader = () => {
    if (React.isValidElement(header)) {
      return header;
    }
    if (header && typeof header === 'object' && 'title' in header) {
      return (
        <PageHeader
          title={header.title}
          description={header.subtitle}
          breadcrumbs={header.breadcrumbs}
          primaryAction={header.actions}
        />
      );
    }
    return null;
  };

  const renderFilterToolbar = () => {
    if (React.isValidElement(filterToolbar)) {
      return filterToolbar;
    }
    if (filterToolbar && typeof filterToolbar === 'object') {
      const ft = filterToolbar as any;
      const props: FilterToolbarProps = {
        ...ft,
        searchValue: ft.searchValue ?? ft.search,
        searchPlaceholder: ft.searchPlaceholder ?? ft.placeholder,
        onSearchChange: ft.onSearchChange,
      };
      return <FilterToolbar {...props} />;
    }
    return null;
  };

  return (
    <PageContainer maxWidth={maxWidth} className={cn('space-y-6', className)} dataTestId={dataTestId}>
      {/* 1. Page Header Block */}
      {renderHeader()}

      {/* 2. Optional KPI Summary Strip */}
      {kpiStrip && <div className="space-y-4" data-testid="list-page-kpi-strip">{kpiStrip}</div>}

      {/* 3. Surface Card Container (White container with hairline border & subtle shadow) */}
      <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Filter & Toolbar Area */}
        {renderFilterToolbar()}

        {/* Content / Table Area */}
        <div className="relative">
          {isLoading ? (
            <div className="p-6 space-y-4" data-testid="list-page-loading">
              <LoadingSkeleton variant="table" count={loadingRows} />
            </div>
          ) : emptyState ? (
            <div className="p-8" data-testid="list-page-empty-state">
              {emptyState}
            </div>
          ) : (
            <div className="overflow-x-auto" data-testid="list-page-content">
              {children}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3" data-testid="list-page-pagination">
            {pagination}
          </div>
        )}
      </div>

      {/* 4. Floating Bulk Actions Bar (Obsidian Pill) */}
      {bulkActions && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200"
          data-testid="list-page-bulk-actions"
        >
          <div className="bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-slate-800">
            {bulkActions}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
