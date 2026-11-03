import React from 'react';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

export interface DashboardPagePatternProps {
  /**
   * Title and header configuration or a custom header node.
   */
  header:
    | React.ReactNode
    | {
        title: string;
        subtitle?: string;
        periodSelector?: React.ReactNode;
        quickActions?: React.ReactNode;
      };
  /**
   * Primary KPI Metric strip (e.g. 4-column grid of HeroKpiCard & PastelCards).
   */
  kpiSection: React.ReactNode;
  /**
   * Optional alert banners (e.g. Low stock alerts, overdue insurance claims).
   */
  alertBanners?: React.ReactNode;
  /**
   * Primary charts / visual analytics (e.g. 2-column grid of Revenue Bezier & Bar Histogram).
   */
  primaryCharts?: React.ReactNode;
  /**
   * Secondary data section (e.g. Recent activity table, Technician velocity, Top-selling parts).
   */
  secondarySection?: React.ReactNode;
  /**
   * Maximum page width for PageContainer. Default is 'wide' (max-w-[1600px]).
   */
  maxWidth?: 'standard' | 'wide' | 'full';
  className?: string;
  dataTestId?: string;
}

export function DashboardPagePattern({
  header,
  kpiSection,
  alertBanners,
  primaryCharts,
  secondarySection,
  maxWidth = 'wide',
  className,
  dataTestId = 'dashboard-page-pattern',
}: DashboardPagePatternProps) {
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
              {header.periodSelector}
              {header.quickActions}
            </div>
          }
        />
      );
    }
    return null;
  };

  return (
    <PageContainer maxWidth={maxWidth} className={cn('space-y-6', className)} dataTestId={dataTestId}>
      {/* 1. Header with Period Controls */}
      {renderHeader()}

      {/* 2. Urgent / Operational Alerts Banner Strip */}
      {alertBanners && (
        <div className="space-y-3" data-testid="dashboard-alert-banners">
          {alertBanners}
        </div>
      )}

      {/* 3. Primary KPI Metric Grid (Auto-responsive 1/2/4 cols) */}
      <section aria-label="Key Performance Indicators" data-testid="dashboard-kpi-grid">
        {kpiSection}
      </section>

      {/* 4. Primary Visual Analytics / Charts */}
      {primaryCharts && (
        <section aria-label="Visual Analytics" data-testid="dashboard-primary-charts">
          {primaryCharts}
        </section>
      )}

      {/* 5. Secondary Operational Streams */}
      {secondarySection && (
        <section aria-label="Operational Activity" data-testid="dashboard-secondary-section">
          {secondarySection}
        </section>
      )}
    </PageContainer>
  );
}
