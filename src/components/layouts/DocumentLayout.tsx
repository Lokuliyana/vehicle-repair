import React from 'react';
import { PageContainer, PageContainerProps } from './PageContainer';
import { cn } from '@/utils/cn';

export interface DocumentLayoutProps {
  documentHeader?: React.ReactNode;
  metaSummary?: React.ReactNode;
  children: React.ReactNode;
  stickyFooter?: React.ReactNode;
  maxWidth?: PageContainerProps['maxWidth'];
  padding?: PageContainerProps['padding'];
  spacing?: PageContainerProps['spacing'];
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const DocumentLayout: React.FC<DocumentLayoutProps> = ({
  documentHeader,
  metaSummary,
  children,
  stickyFooter,
  maxWidth = 'standard',
  padding = 'standard',
  spacing = 'standard',
  className,
  dataTestId = 'document-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;

  return (
    <PageContainer
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      data-testid={resolvedTestId}
      className={cn(
        'document-layout-wrapper relative',
        stickyFooter && 'pb-28', // Reserve space for sticky footer bar
        className
      )}
    >
      {documentHeader && (
        <header className="document-header-slot no-print">{documentHeader}</header>
      )}

      {metaSummary && (
        <section aria-label="Document Metadata" className="document-meta-slot">
          {metaSummary}
        </section>
      )}

      <main className="document-body-slot min-w-0">{children}</main>

      {stickyFooter && (
        <footer
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl py-3 px-4 sm:px-6 no-print screen-only"
          data-testid="document-sticky-footer"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {stickyFooter}
          </div>
        </footer>
      )}
    </PageContainer>
  );
};
