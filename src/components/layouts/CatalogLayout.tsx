import React from 'react';
import { PageContainer, PageContainerProps } from './PageContainer';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/utils/cn';

export interface CatalogLayoutProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  categoryRibbon?: React.ReactNode;
  filterSidebar?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: PageContainerProps['maxWidth'];
  padding?: PageContainerProps['padding'];
  spacing?: PageContainerProps['spacing'];
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  categoryRibbon,
  filterSidebar,
  children,
  maxWidth = 'wide',
  padding = 'standard',
  spacing = 'standard',
  className,
  dataTestId = 'catalog-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;

  return (
    <PageContainer
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      data-testid={resolvedTestId}
      className={cn('catalog-layout-wrapper', className)}
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

      {categoryRibbon && (
        <section aria-label="Catalog Categories" className="no-print">
          {categoryRibbon}
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {filterSidebar && (
          <aside
            aria-label="Catalog Filters"
            className="w-full lg:w-64 shrink-0 rounded-xl bg-white border border-slate-200/80 p-4 shadow-2xs no-print"
            data-testid="catalog-filter-sidebar"
          >
            {filterSidebar}
          </aside>
        )}

        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </PageContainer>
  );
};
