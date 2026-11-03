import React from 'react';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

export interface BoardLane {
  id: string;
  title: string;
  count: number;
  colorClass?: string;
  dotColorClass?: string;
  children: React.ReactNode;
}

export interface BoardPagePatternProps {
  /**
   * Title and header configuration or a custom header node.
   */
  header:
    | React.ReactNode
    | {
        title: string;
        subtitle?: string;
        search?: React.ReactNode;
        bayFilter?: React.ReactNode;
        actions?: React.ReactNode;
      };
  /**
   * Status Kanban lanes.
   */
  lanes: BoardLane[];
  /**
   * Optional summary or telemetry footer bar.
   */
  footerSummary?: React.ReactNode;
  className?: string;
  dataTestId?: string;
}

export function BoardPagePattern({
  header,
  lanes,
  footerSummary,
  className,
  dataTestId = 'board-page-pattern',
}: BoardPagePatternProps) {
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
              {header.search}
              {header.bayFilter}
              {header.actions}
            </div>
          }
        />
      );
    }
    return null;
  };

  return (
    <PageContainer maxWidth="full" className={cn('space-y-5 flex flex-col h-[calc(100vh-4.5rem)]', className)} dataTestId={dataTestId}>
      {/* 1. Board Header */}
      <div className="shrink-0">{renderHeader()}</div>

      {/* 2. Fluid Horizontal Scrolling Kanban Lanes */}
      <div
        className="flex-1 overflow-x-auto pb-4 flex gap-4 items-start min-h-0"
        data-testid="board-lanes-container"
      >
        {lanes.map((lane) => (
          <div
            key={lane.id}
            className="w-80 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-[16px] flex flex-col max-h-full overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.02)]"
            data-testid={`board-lane-${lane.id}`}
          >
            {/* Lane Header */}
            <div className="p-3.5 border-b border-slate-200/70 flex items-center justify-between bg-white/70">
              <div className="flex items-center gap-2">
                {lane.dotColorClass && (
                  <span className={cn('w-2.5 h-2.5 rounded-full', lane.dotColorClass)} />
                )}
                <h3 className="text-xs font-bold text-slate-800 tracking-tight">{lane.title}</h3>
              </div>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                {lane.count}
              </span>
            </div>

            {/* Lane Card Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3" data-testid={`board-lane-items-${lane.id}`}>
              {lane.children}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Optional Footer Summary */}
      {footerSummary && (
        <div className="shrink-0 bg-white border border-slate-200/80 rounded-[12px] p-3 shadow-xs" data-testid="board-footer-summary">
          {footerSummary}
        </div>
      )}
    </PageContainer>
  );
}
