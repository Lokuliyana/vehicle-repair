import React from 'react';
import { PageContainer } from './PageContainer';
import { cn } from '@/utils/cn';

export interface POSLayoutProps {
  topBar?: React.ReactNode;
  catalogPane: React.ReactNode;
  cartPane: React.ReactNode;
  bottomSummary?: React.ReactNode;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const POSLayout: React.FC<POSLayoutProps> = ({
  topBar,
  catalogPane,
  cartPane,
  bottomSummary,
  className,
  dataTestId = 'pos-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;

  return (
    <PageContainer
      maxWidth="full"
      padding="none"
      spacing="none"
      fullHeight={true}
      data-testid={resolvedTestId}
      className={cn(
        'pos-layout-wrapper h-[calc(100vh-4rem)] flex flex-col overflow-hidden select-none bg-slate-50',
        className
      )}
    >
      {/* Top Quick Bar (Search, Barcode Scanner, Shift & Cashier Pill) */}
      {topBar && (
        <header
          className="h-12 border-b border-slate-200/80 bg-white px-4 flex items-center justify-between shrink-0 no-print"
          data-testid="pos-top-bar"
        >
          {topBar}
        </header>
      )}

      {/* Main Split-Pane Workspace: 65% Catalog / 35% Persistent Cart Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Pane: Touch Grid / Catalog Browser (~65%) */}
        <main
          className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4 bg-slate-100/50 flex flex-col"
          data-testid="pos-catalog-pane"
        >
          {catalogPane}
        </main>

        {/* Right Pane: Persistent Cart Drawer (~35%, min 340px, max 440px) */}
        <aside
          className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/90 bg-white flex flex-col h-full shadow-md z-10"
          data-testid="pos-cart-pane"
        >
          <div className="flex-1 overflow-y-auto min-h-0">{cartPane}</div>
          {bottomSummary && (
            <div
              className="border-t border-slate-200 bg-slate-50/70 p-3 shrink-0"
              data-testid="pos-bottom-summary"
            >
              {bottomSummary}
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
};
