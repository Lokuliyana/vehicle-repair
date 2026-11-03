import React from 'react';
import { PageContainer, PageContainerProps } from './PageContainer';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/utils/cn';

export interface FinanceLayoutProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  periodSelector?: React.ReactNode;
  kpiStrip?: React.ReactNode;
  filterBar?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: PageContainerProps['maxWidth'];
  padding?: PageContainerProps['padding'];
  spacing?: PageContainerProps['spacing'];
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const FinanceLayout: React.FC<FinanceLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  periodSelector,
  kpiStrip,
  filterBar,
  children,
  maxWidth = 'wide', // Wide by default for multi-column financial ledgers
  padding = 'standard',
  spacing = 'standard',
  className,
  dataTestId = 'finance-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;

  return (
    <PageContainer
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      data-testid={resolvedTestId}
      className={cn('finance-layout-wrapper tabular-nums', className)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-slate-200/60 pb-4">
        {(title || breadcrumbs) && (
          <PageHeader
            title={title || ''}
            description={subtitle}
            breadcrumbs={breadcrumbs}
            className="border-none mb-0 pb-0"
          />
        )}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {periodSelector}
          {actions}
        </div>
      </div>

      {kpiStrip && (
        <section aria-label="Financial Key Performance Indicators" className="no-print">
          {kpiStrip}
        </section>
      )}

      {filterBar && (
        <section aria-label="Ledger Filters" className="no-print">
          {filterBar}
        </section>
      )}

      <main className="min-w-0 font-mono text-[13px]">{children}</main>
    </PageContainer>
  );
};
