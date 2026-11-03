import React from 'react';
import { PageContainer } from './PageContainer';
import { cn } from '@/utils/cn';

export interface BoardLayoutProps {
  boardHeader?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const BoardLayout: React.FC<BoardLayoutProps> = ({
  boardHeader,
  children,
  className,
  dataTestId = 'board-layout',
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
        'board-layout-wrapper h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-50/60',
        className
      )}
    >
      {/* Sticky Top Header (Filters, Lane Counts, View Mode Switcher) */}
      {boardHeader && (
        <header
          className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xs px-4 sm:px-6 py-3 shrink-0 no-print"
          data-testid="board-header-slot"
        >
          {boardHeader}
        </header>
      )}

      {/* Horizontal Swimlane Scrolling Container with Independent Vertical Scroll Per Lane */}
      <main
        className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden p-4 sm:p-6 flex flex-row gap-4 items-start"
        data-testid="board-lanes-container"
      >
        {children}
      </main>
    </PageContainer>
  );
};
