import React from 'react';
import { PageContainer, PageContainerProps } from './PageContainer';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/utils/cn';

export interface StandardLayoutProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  filterBar?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: PageContainerProps['maxWidth'];
  padding?: PageContainerProps['padding'];
  spacing?: PageContainerProps['spacing'];
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  stats,
  filterBar,
  children,
  maxWidth = 'standard',
  padding = 'standard',
  spacing = 'standard',
  className,
  dataTestId = 'standard-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;

  return (
    <PageContainer
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      data-testid={resolvedTestId}
      className={cn('standard-layout-wrapper', className)}
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

      {stats && (
        <section aria-label="Summary Statistics" className="no-print">
          {stats}
        </section>
      )}

      {filterBar && (
        <section aria-label="Filters and Search" className="no-print">
          {filterBar}
        </section>
      )}

      <main className="min-w-0">{children}</main>
    </PageContainer>
  );
};
