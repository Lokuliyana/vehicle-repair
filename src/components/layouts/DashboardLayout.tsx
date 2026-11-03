import React from 'react';
import { PageContainer, PageContainerProps } from './PageContainer';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/utils/cn';

export interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  banner?: React.ReactNode;
  kpiGrid?: React.ReactNode;
  chartGrid?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: PageContainerProps['maxWidth'];
  padding?: PageContainerProps['padding'];
  spacing?: PageContainerProps['spacing'];
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  banner,
  kpiGrid,
  chartGrid,
  children,
  maxWidth = 'wide',
  padding = 'standard',
  spacing = 'standard',
  className,
  dataTestId = 'dashboard-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;

  return (
    <PageContainer
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      data-testid={resolvedTestId}
      className={cn('dashboard-layout-wrapper', className)}
    >
      {(title || actions || breadcrumbs) && (
        <div className="no-print">
          <PageHeader
            title={title || ''}
            description={subtitle}
            breadcrumbs={breadcrumbs}
            primaryAction={actions}
          />
        </div>
      )}

      {banner && (
        <section aria-label="Perspective Banner" className="no-print">
          {banner}
        </section>
      )}

      {kpiGrid && (
        <section aria-label="Executive KPI Metrics" className="no-print">
          {kpiGrid}
        </section>
      )}

      {chartGrid && (
        <section aria-label="Analytics & Charts" className="no-print">
          {chartGrid}
        </section>
      )}

      {children && <main className="min-w-0">{children}</main>}
    </PageContainer>
  );
};
