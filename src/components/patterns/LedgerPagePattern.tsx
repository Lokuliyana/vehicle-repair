import React from 'react';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

export interface LedgerPagePatternProps {
  /**
   * Title and header configuration or a custom header node.
   */
  header:
    | React.ReactNode
    | {
        title: string;
        subtitle?: string;
        dateSelector?: React.ReactNode;
        exportAction?: React.ReactNode;
      };
  /**
   * Financial waterfall summary ribbon (e.g. Gross Sales -> Cost -> Expenses -> Net Profit).
   */
  waterfallSummary?: React.ReactNode;
  /**
   * Filter controls and search toolbar.
   */
  filterToolbar?: React.ReactNode;
  /**
   * Dense financial table body.
   */
  children?: React.ReactNode;
  /**
   * Pinned bottom summary footer with live column sums.
   */
  pinnedSummaryFooter?: React.ReactNode;
  /**
   * Table pagination element.
   */
  pagination?: React.ReactNode;
  /**
   * Maximum page width for PageContainer. Default is 'wide' (max-w-[1600px]).
   */
  maxWidth?: 'standard' | 'wide' | 'full';
  className?: string;
  dataTestId?: string;
}

export function LedgerPagePattern({
  header,
  waterfallSummary,
  filterToolbar,
  children,
  pinnedSummaryFooter,
  pagination,
  maxWidth = 'wide',
  className,
  dataTestId = 'ledger-page-pattern',
}: LedgerPagePatternProps) {
  const renderHeader = () => {
    if (React.isValidElement(header)) {
      return header;
    }
    if (header && typeof header === 'object' && 'title' in header) {
      return (
        <PageHeader
          title={header.title}
          description={header.subtitle}
          primaryAction={
            <div className="flex items-center gap-3">
              {header.dateSelector}
              {header.exportAction}
            </div>
          }
        />
      );
    }
    return null;
  };

  return (
    <PageContainer maxWidth={maxWidth} className={cn('space-y-6', className)} dataTestId={dataTestId}>
      {/* 1. Header with Period Controls & Export Button */}
      {renderHeader()}

      {/* 2. Waterfall Financial Summary Ribbon */}
      {waterfallSummary && (
        <section aria-label="Cashflow & Margin Summary" data-testid="ledger-waterfall-summary">
          {waterfallSummary}
        </section>
      )}

      {/* 3. High-Density Ledger Card Container */}
      <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Filter Toolbar */}
        {filterToolbar && (
          <div className="border-b border-slate-100" data-testid="ledger-filter-toolbar">
            {filterToolbar}
          </div>
        )}

        {/* Dense Tabular Content */}
        <div className="overflow-x-auto" data-testid="ledger-table-content">
          {children}
        </div>

        {/* Pinned Summary Totals Row */}
        {pinnedSummaryFooter && (
          <div
            className="border-t-2 border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-xs"
            data-testid="ledger-pinned-totals"
          >
            {pinnedSummaryFooter}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && (
          <div className="border-t border-slate-100 bg-white px-4 py-3" data-testid="ledger-pagination">
            {pagination}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
