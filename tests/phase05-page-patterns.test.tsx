import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  ListPagePattern,
  DashboardPagePattern,
  DocumentPagePattern,
  RecordDetailDrawerPattern,
  LedgerPagePattern,
  POSPagePattern,
  BoardPagePattern,
} from '@/components/patterns';
import { KpiCard } from '@/components/ui/card-system';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

describe('Phase 05 — Canonical Page Composition & Interaction Patterns', () => {
  describe('5.1 List & Register Page Pattern', () => {
    it('renders list header, filter toolbar, content, and pagination correctly', () => {
      render(
        <MemoryRouter>
          <ListPagePattern
            header={{
              title: 'Workshop Job Sheets',
              subtitle: 'Active collision and mechanical repair jobs',
              breadcrumbs: [{ label: 'Workshop', href: '/workshop' }, { label: 'Jobs' }],
              actions: <Button size="sm">+ New Sheet</Button>,
            }}
            kpiStrip={
              <div className="grid grid-cols-2 gap-4">
                <KpiCard label="Active Jobs" value="24" isCurrency={false} />
                <KpiCard label="Completed Today" value="8" isCurrency={false} />
              </div>
            }
            filterToolbar={{
              search: 'Toyota',
              onSearchChange: vi.fn(),
              placeholder: 'Search plate...',
            }}
            pagination={<div>Page 1 of 5</div>}
          >
            <div data-testid="test-table-rows">Mock Table Rows</div>
          </ListPagePattern>
        </MemoryRouter>
      );

      expect(screen.getByText('Workshop Job Sheets')).toBeInTheDocument();
      expect(screen.getByText('Active collision and mechanical repair jobs')).toBeInTheDocument();
      expect(screen.getByText('+ New Sheet')).toBeInTheDocument();
      expect(screen.getByTestId('list-page-kpi-strip')).toBeInTheDocument();
      expect(screen.getByText('Active Jobs')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument();
      expect(screen.getByTestId('test-table-rows')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });

    it('renders loading skeleton when isLoading is true', () => {
      render(
        <MemoryRouter>
          <ListPagePattern
            header={{ title: 'Catalog Items' }}
            isLoading={true}
          >
            <div>Should not show</div>
          </ListPagePattern>
        </MemoryRouter>
      );

      expect(screen.getByTestId('list-page-loading')).toBeInTheDocument();
      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });

    it('renders empty state when emptyState prop is provided and not loading', () => {
      render(
        <MemoryRouter>
          <ListPagePattern
            header={{ title: 'Catalog Items' }}
            emptyState={<div data-testid="custom-empty-state">No products found</div>}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId('custom-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('renders floating bulk actions bar when bulkActions prop is provided', () => {
      render(
        <MemoryRouter>
          <ListPagePattern
            header={{ title: 'Catalog Items' }}
            bulkActions={<button>Delete Selected (3)</button>}
          >
            <div>Items</div>
          </ListPagePattern>
        </MemoryRouter>
      );

      expect(screen.getByTestId('list-page-bulk-actions')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected (3)')).toBeInTheDocument();
    });
  });

  describe('5.2 Dashboard Page Pattern', () => {
    it('renders executive dashboard layout with KPI grid, charts, and secondary sections', () => {
      render(
        <MemoryRouter>
          <DashboardPagePattern
            header={{
              title: 'Executive Dashboard',
              subtitle: 'Multi-bay workshop telemetry',
              periodSelector: <select aria-label="Period"><option>Today</option></select>,
              quickActions: <Button size="sm">+ Quick Intake</Button>,
            }}
            alertBanners={<div data-testid="test-alert">Parts delayed for 3 jobs</div>}
            kpiSection={
              <div className="grid grid-cols-4 gap-4">
                <KpiCard label="Gross Sales" value="Rs. 450,000" />
              </div>
            }
            primaryCharts={<div data-testid="revenue-chart">Revenue Bezier Chart</div>}
            secondarySection={<div data-testid="recent-activity">Recent Workshop Intake</div>}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
      expect(screen.getByText('+ Quick Intake')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-alert-banners')).toBeInTheDocument();
      expect(screen.getByText('Parts delayed for 3 jobs')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-kpi-grid')).toBeInTheDocument();
      expect(screen.getByText('Gross Sales')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-primary-charts')).toBeInTheDocument();
      expect(screen.getByText('Revenue Bezier Chart')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-secondary-section')).toBeInTheDocument();
      expect(screen.getByText('Recent Workshop Intake')).toBeInTheDocument();
    });
  });

  describe('5.3 Document Creation Page Pattern', () => {
    it('renders document stage banner, 12-field matrix, repair sections, and sticky footer', () => {
      render(
        <MemoryRouter>
          <DocumentPagePattern
            stageBanner={<div data-testid="stage-stepper">{'Stage: ESTIMATE -> JOB_CARD'}</div>}
            headerMatrix={<div data-testid="matrix-12-fields">CBA-1234 Toyota Prius</div>}
            repairSections={<div data-testid="sections-3">Sections: R&R, Repair, Replacement</div>}
            financialSummary={<div data-testid="summary-split">Grand Total: Rs. 145,000</div>}
            stickyFooter={
              <div className="flex justify-between w-full">
                <span>Total: Rs. 145,000</span>
                <Button size="sm">Save Estimate</Button>
              </div>
            }
            supplementaryBanner={<div>Supplementary Part Added</div>}
            costPrivacyAlert={<div>Internal Costs Visible</div>}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId('document-stage-banner')).toBeInTheDocument();
      expect(screen.getByText('Stage: ESTIMATE -> JOB_CARD')).toBeInTheDocument();
      expect(screen.getByTestId('document-header-matrix')).toBeInTheDocument();
      expect(screen.getByText('CBA-1234 Toyota Prius')).toBeInTheDocument();
      expect(screen.getByTestId('document-repair-sections')).toBeInTheDocument();
      expect(screen.getByTestId('document-financial-summary')).toBeInTheDocument();
      expect(screen.getByTestId('document-sticky-footer')).toBeInTheDocument();
      expect(screen.getByText('Save Estimate')).toBeInTheDocument();
      expect(screen.getByTestId('document-supplementary-banner')).toBeInTheDocument();
      expect(screen.getByTestId('document-privacy-alert')).toBeInTheDocument();
    });
  });

  describe('5.4 Record Inspection & Detail Drawer Pattern', () => {
    it('renders drawer, tab switcher, audit timeline, and footer actions', () => {
      const handleClose = vi.fn();
      const handleTabChange = vi.fn();

      render(
        <RecordDetailDrawerPattern
          isOpen={true}
          onClose={handleClose}
          title="Job #JOB-2026-0042"
          subtitle="Toyota Land Cruiser CBA-5678"
          badge={<StatusBadge status="IN_PROGRESS" />}
          tabs={[
            { id: 'details', label: 'Details' },
            { id: 'history', label: 'History', count: 2 },
          ]}
          activeTab="history"
          onTabChange={handleTabChange}
          auditTimeline={[
            {
              id: '1',
              timestamp: '2026-11-04 10:15',
              actor: 'Sunil Advisor',
              action: 'STAGE_CONVERT',
              fromState: 'ESTIMATE',
              toState: 'JOB_CARD',
              note: 'Approved by Sri Lanka Insurance',
            },
          ]}
          footerActions={<Button size="sm">Print Job Card</Button>}
        >
          <div data-testid="drawer-children">Vehicle repair details body</div>
        </RecordDetailDrawerPattern>
      );

      expect(screen.getByText('Job #JOB-2026-0042')).toBeInTheDocument();
      expect(screen.getByText('Toyota Land Cruiser CBA-5678')).toBeInTheDocument();
      expect(screen.getByTestId('drawer-children')).toBeInTheDocument();
      expect(screen.getByTestId('drawer-audit-timeline')).toBeInTheDocument();
      expect(screen.getByText('Sunil Advisor')).toBeInTheDocument();
      expect(screen.getByText('Approved by Sri Lanka Insurance')).toBeInTheDocument();
      expect(screen.getByText('Print Job Card')).toBeInTheDocument();

      // Click tab
      fireEvent.click(screen.getByTestId('drawer-tab-details'));
      expect(handleTabChange).toHaveBeenCalledWith('details');

      // Click close button
      fireEvent.click(screen.getByTestId('detail-drawer-close'));
      expect(handleClose).toHaveBeenCalled();
    });

    it('dismisses when Escape key is pressed', () => {
      const handleClose = vi.fn();

      render(
        <RecordDetailDrawerPattern
          isOpen={true}
          onClose={handleClose}
          title="Quick Inspection"
        >
          <div>Body</div>
        </RecordDetailDrawerPattern>
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render anything when isOpen is false', () => {
      render(
        <RecordDetailDrawerPattern
          isOpen={false}
          onClose={vi.fn()}
          title="Hidden Drawer"
        >
          <div>Body</div>
        </RecordDetailDrawerPattern>
      );

      expect(screen.queryByText('Hidden Drawer')).not.toBeInTheDocument();
    });
  });

  describe('5.5 Financial Ledger Page Pattern', () => {
    it('renders ledger header, waterfall summary, dense table content, and pinned totals', () => {
      render(
        <MemoryRouter>
          <LedgerPagePattern
            header={{
              title: 'Profit & Loss Ledger',
              subtitle: 'Daily realized workshop and POS margins',
              dateSelector: <button>Nov 2026</button>,
              exportAction: <Button size="sm">Export CSV</Button>,
            }}
            waterfallSummary={
              <div className="grid grid-cols-3 gap-4">
                <div>Revenue: Rs. 1,200,000</div>
                <div>Expenses: Rs. 150,000</div>
                <div>Net Margin: 34.5%</div>
              </div>
            }
            filterToolbar={<div>Date Filter Toolbar</div>}
            pinnedSummaryFooter={<div className="flex justify-between"><span>Total Net Profit:</span><span>Rs. 320,000.00</span></div>}
            pagination={<div>Page 1 of 3</div>}
          >
            <table data-testid="mock-ledger-table">
              <tbody>
                <tr><td>JOB-001</td><td>Rs. 45,000</td></tr>
              </tbody>
            </table>
          </LedgerPagePattern>
        </MemoryRouter>
      );

      expect(screen.getByText('Profit & Loss Ledger')).toBeInTheDocument();
      expect(screen.getByText('Daily realized workshop and POS margins')).toBeInTheDocument();
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
      expect(screen.getByTestId('ledger-waterfall-summary')).toBeInTheDocument();
      expect(screen.getByText('Net Margin: 34.5%')).toBeInTheDocument();
      expect(screen.getByTestId('ledger-filter-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('mock-ledger-table')).toBeInTheDocument();
      expect(screen.getByTestId('ledger-pinned-totals')).toBeInTheDocument();
      expect(screen.getByText('Total Net Profit:')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
  });

  describe('5.6 Counter / Showroom POS Page Pattern', () => {
    it('renders split workspace with top bar, catalog touch pane, and persistent cart panel', () => {
      const handleToggleMobile = vi.fn();

      render(
        <POSPagePattern
          headerBar={
            <div className="flex justify-between w-full">
              <span>🟢 Scanner Ready</span>
              <span>Cashier: Kamal</span>
            </div>
          }
          catalogPane={<div data-testid="mock-catalog-grid">Product Cards Grid</div>}
          cartPane={<div data-testid="mock-cart-items">Cart Lines (3)</div>}
          cartItemCount={3}
          onToggleMobileCart={handleToggleMobile}
        />
      );

      expect(screen.getByTestId('pos-top-bar')).toBeInTheDocument();
      expect(screen.getByText('🟢 Scanner Ready')).toBeInTheDocument();
      expect(screen.getByTestId('pos-catalog-pane')).toBeInTheDocument();
      expect(screen.getByTestId('mock-catalog-grid')).toBeInTheDocument();
      expect(screen.getByTestId('pos-cart-panel')).toBeInTheDocument();
      expect(screen.getByTestId('mock-cart-items')).toBeInTheDocument();

      // Mobile button trigger
      const mobileToggle = screen.getByTestId('pos-mobile-cart-toggle');
      expect(mobileToggle).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      fireEvent.click(mobileToggle);
      expect(handleToggleMobile).toHaveBeenCalledTimes(1);
    });
  });

  describe('5.7 Workshop Board Page Pattern', () => {
    it('renders fluid horizontal Kanban lanes with counter badges and job cards', () => {
      render(
        <MemoryRouter>
          <BoardPagePattern
            header={{
              title: 'Workshop Floor Board',
              subtitle: 'Active bay allocations & mechanic assignments',
              actions: <Button size="sm">+ New Repair</Button>,
            }}
            lanes={[
              {
                id: 'draft',
                title: 'Draft & Intake',
                count: 3,
                dotColorClass: 'bg-slate-400',
                children: <div>Job Card #001</div>,
              },
              {
                id: 'in_progress',
                title: 'In Progress (Bay 1-4)',
                count: 5,
                dotColorClass: 'bg-blue-500',
                children: <div>Job Card #002</div>,
              },
            ]}
            footerSummary={<div>8 vehicles currently on garage floor</div>}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Workshop Floor Board')).toBeInTheDocument();
      expect(screen.getByText('Active bay allocations & mechanic assignments')).toBeInTheDocument();
      expect(screen.getByTestId('board-lanes-container')).toBeInTheDocument();
      expect(screen.getByTestId('board-lane-draft')).toBeInTheDocument();
      expect(screen.getByText('Draft & Intake')).toBeInTheDocument();
      expect(screen.getByText('Job Card #001')).toBeInTheDocument();
      expect(screen.getByTestId('board-lane-in_progress')).toBeInTheDocument();
      expect(screen.getByText('In Progress (Bay 1-4)')).toBeInTheDocument();
      expect(screen.getByText('Job Card #002')).toBeInTheDocument();
      expect(screen.getByTestId('board-footer-summary')).toBeInTheDocument();
      expect(screen.getByText('8 vehicles currently on garage floor')).toBeInTheDocument();
    });
  });
});
