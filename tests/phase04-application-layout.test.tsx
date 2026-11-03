import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { Sidebar } from '@/app/layout/Sidebar';
import { Header } from '@/app/layout/Header';
import {
  PageContainer,
  StandardLayout,
  FinanceLayout,
  DashboardLayout,
  DocumentLayout,
  POSLayout,
  BoardLayout,
  CatalogLayout,
} from '@/components/layouts';

describe('Phase 04 — Global Application Layout Transformation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('4.1 Sidebar Redesign & Collapsed Navigation Mode', () => {
    it('renders expanded sidebar with standard width and section headers', () => {
      render(
        <MemoryRouter initialEntries={['/workshop/jobs']}>
          <AuthProvider initialRole="OWNER">
            <Sidebar isCollapsed={false} />
          </AuthProvider>
        </MemoryRouter>
      );

      const sidebar = screen.getByTestId('desktop-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.className).toContain('w-60');

      // Sections
      expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
      expect(screen.getByText('COUNTER POS')).toBeInTheDocument();
      expect(screen.getByText('CATALOG')).toBeInTheDocument();
      expect(screen.getByText('FINANCE & REPORTS')).toBeInTheDocument();

      // Brand
      expect(screen.getByText('500 Labs — Main Workshop')).toBeInTheDocument();

      // Toggle button
      expect(screen.getByTestId('sidebar-collapse-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-collapse-toggle')).toHaveAttribute('title', 'Collapse sidebar');
    });

    it('renders collapsed sidebar (68px width) with icon tooltips and compact logo', () => {
      render(
        <MemoryRouter initialEntries={['/workshop/jobs']}>
          <AuthProvider initialRole="OWNER">
            <Sidebar isCollapsed={true} />
          </AuthProvider>
        </MemoryRouter>
      );

      const sidebar = screen.getByTestId('desktop-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.className).toContain('w-[68px]');

      // In collapsed mode, compact 500 logo badge is shown
      expect(screen.getByTestId('workshop-bay-switcher-collapsed')).toBeInTheDocument();

      // Links have title attributes for tooltip indicators
      const jobsLink = screen.getByTestId('nav-workshop-jobs');
      expect(jobsLink).toHaveAttribute('title', 'Workshop Jobs');

      const posLink = screen.getByTestId('nav-pos');
      expect(posLink).toHaveAttribute('title', 'Counter POS');

      // Toggle button indicates expand action
      expect(screen.getByTestId('sidebar-collapse-toggle')).toHaveAttribute('title', 'Expand sidebar');
    });

    it('toggles collapsed state on click of the toggle button', () => {
      let isCollapsed = false;
      const toggleFn = () => {
        isCollapsed = !isCollapsed;
      };

      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider initialRole="OWNER">
            <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleFn} />
          </AuthProvider>
        </MemoryRouter>
      );

      const toggleBtn = screen.getByTestId('sidebar-collapse-toggle');
      fireEvent.click(toggleBtn);
      expect(isCollapsed).toBe(true);

      rerender(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider initialRole="OWNER">
            <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleFn} />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByTestId('desktop-sidebar').className).toContain('w-[68px]');
    });

    it('enforces active navigation styling with primary accent and coral background', () => {
      render(
        <MemoryRouter initialEntries={['/workshop/jobs']}>
          <AuthProvider initialRole="OWNER">
            <Sidebar isCollapsed={false} />
          </AuthProvider>
        </MemoryRouter>
      );

      const activeLink = screen.getByTestId('nav-workshop-jobs');
      expect(activeLink.className).toContain('bg-[#FFF3ED]');
      expect(activeLink.className).toContain('text-[#F95700]');

      const inactiveLink = screen.getByTestId('nav-workshop-board');
      expect(inactiveLink.className).not.toContain('bg-[#FFF3ED]');
      expect(inactiveLink.className).toContain('text-slate-600');
    });

    it('displays lock indicators on restricted items for unauthorized roles', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider initialRole="TECHNICIAN">
            <Sidebar isCollapsed={false} />
          </AuthProvider>
        </MemoryRouter>
      );

      // TECHNICIAN cannot access POS or Finance
      const posLink = screen.getByTestId('nav-pos');
      expect(posLink.className).toContain('text-slate-400');
    });
  });

  describe('4.2 Top Navigation Redesign (Header)', () => {
    it('standardizes header to 64px height (h-16) with subtle acrylic blur and bottom border', () => {
      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/workshop/jobs']}>
            <AuthProvider initialRole="OWNER">
              <Header onToggleMobile={() => {}} />
            </AuthProvider>
          </MemoryRouter>
        </ToastProvider>
      );

      const header = screen.getByTestId('app-header');
      expect(header).toBeInTheDocument();
      expect(header.className).toContain('h-16');
      expect(header.className).toContain('border-b');
      expect(header.className).toContain('backdrop-blur-md');
    });

    it('renders dynamic breadcrumbs with parent route link', () => {
      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/workshop/jobs']}>
            <AuthProvider initialRole="OWNER">
              <Header onToggleMobile={() => {}} />
            </AuthProvider>
          </MemoryRouter>
        </ToastProvider>
      );

      const header = screen.getByTestId('app-header');
      expect(header).toHaveTextContent('Workshop');
      expect(header).toHaveTextContent('Job Cards');
    });

    it('provides global search input with ⌘K badge', () => {
      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <AuthProvider initialRole="OWNER">
              <Header onToggleMobile={() => {}} />
            </AuthProvider>
          </MemoryRouter>
        </ToastProvider>
      );

      expect(screen.getByTestId('global-search-input')).toBeInTheDocument();
      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('renders Shift status and Cost Privacy toggle for management roles', () => {
      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <AuthProvider initialRole="OWNER">
              <Header onToggleMobile={() => {}} />
            </AuthProvider>
          </MemoryRouter>
        </ToastProvider>
      );

      expect(screen.getByTestId('active-shift-pill')).toBeInTheDocument();
      expect(screen.getByTestId('header-cost-mode-toggle')).toBeInTheDocument();
    });

    it('renders RolePerspectiveBadge visibly on canvas outside sr-only container', () => {
      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <AuthProvider initialRole="OWNER">
              <Header onToggleMobile={() => {}} />
            </AuthProvider>
          </MemoryRouter>
        </ToastProvider>
      );

      const roleBadge = screen.getByTestId('role-perspective-badge');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge.closest('.sr-only')).toBeNull();
      expect(roleBadge).toHaveTextContent('Owner / Director');
    });
  });

  describe('4.3 PageContainer Foundation', () => {
    it('applies standard horizontal padding and fluid max-width', () => {
      render(
        <PageContainer dataTestId="test-container">
          <div>Page Content</div>
        </PageContainer>
      );

      const container = screen.getByTestId('test-container');
      expect(container.className).toContain('max-w-7xl');
      expect(container.className).toContain('px-4 sm:px-6 lg:px-8');
      expect(container.className).toContain('py-6 sm:py-8');
      expect(container.className).toContain('overflow-x-hidden');
    });

    it('supports wide, full, narrow, and compact max-widths', () => {
      const { rerender } = render(
        <PageContainer maxWidth="wide" dataTestId="test-container">
          <div>Wide Content</div>
        </PageContainer>
      );
      expect(screen.getByTestId('test-container').className).toContain('max-w-[1600px]');

      rerender(
        <PageContainer maxWidth="full" dataTestId="test-container">
          <div>Full Content</div>
        </PageContainer>
      );
      expect(screen.getByTestId('test-container').className).toContain('w-full max-w-full');

      rerender(
        <PageContainer maxWidth="narrow" dataTestId="test-container">
          <div>Narrow Content</div>
        </PageContainer>
      );
      expect(screen.getByTestId('test-container').className).toContain('max-w-4xl');

      rerender(
        <PageContainer maxWidth="compact" dataTestId="test-container">
          <div>Compact Content</div>
        </PageContainer>
      );
      expect(screen.getByTestId('test-container').className).toContain('max-w-5xl');
    });

    it('prevents accidental double padding and margin when nested', () => {
      render(
        <PageContainer dataTestId="outer-container">
          <PageContainer dataTestId="inner-container">
            <div>Nested Content</div>
          </PageContainer>
        </PageContainer>
      );

      const outer = screen.getByTestId('outer-container');
      const inner = screen.getByTestId('inner-container');

      expect(outer.className).toContain('px-4 sm:px-6 lg:px-8');
      // Invariant: Nested container suppresses outer padding to prevent layout blowout
      expect(inner.className).toContain('p-0');
      expect(inner.className).toContain('w-full');
    });
  });

  describe('4.4 Specialized Layout Wrappers', () => {
    it('renders StandardLayout with title, actions, and filter slot', () => {
      render(
        <MemoryRouter>
          <StandardLayout
            title="Operational Jobs"
            subtitle="Manage all active workshop jobs"
            actions={<button>Create Job</button>}
            filterBar={<div>Filter Bar Slot</div>}
            dataTestId="standard-layout-test"
          >
            <div>Table Body</div>
          </StandardLayout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('standard-layout-test')).toBeInTheDocument();
      expect(screen.getByText('Operational Jobs')).toBeInTheDocument();
      expect(screen.getByText('Manage all active workshop jobs')).toBeInTheDocument();
      expect(screen.getByText('Create Job')).toBeInTheDocument();
      expect(screen.getByText('Filter Bar Slot')).toBeInTheDocument();
      expect(screen.getByText('Table Body')).toBeInTheDocument();
    });

    it('renders FinanceLayout with wide layout, KPI ribbon, and tabular-nums enforcement', () => {
      render(
        <MemoryRouter>
          <FinanceLayout
            title="Profit Ledger"
            subtitle="Financial accounting & gross profit analysis"
            kpiStrip={<div data-testid="finance-kpis">Gross Profit: Rs. 450,000</div>}
            periodSelector={<button>This Month</button>}
            dataTestId="finance-layout-test"
          >
            <div>Dense Accounting Table</div>
          </FinanceLayout>
        </MemoryRouter>
      );

      const layout = screen.getByTestId('finance-layout-test');
      expect(layout).toBeInTheDocument();
      expect(layout.className).toContain('tabular-nums');
      expect(layout.className).toContain('max-w-[1600px]');
      expect(screen.getByTestId('finance-kpis')).toBeInTheDocument();
      expect(screen.getByText('Dense Accounting Table')).toBeInTheDocument();
    });

    it('renders DashboardLayout with balanced KPI grid and chart sections', () => {
      render(
        <MemoryRouter>
          <DashboardLayout
            title="Executive Dashboard"
            kpiGrid={<div data-testid="dashboard-kpis">4-KPI Cards</div>}
            chartGrid={<div data-testid="dashboard-charts">Revenue Charts</div>}
            dataTestId="dashboard-layout-test"
          >
            <div>Recent Activity Feed</div>
          </DashboardLayout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard-layout-test')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-kpis')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity Feed')).toBeInTheDocument();
    });

    it('renders DocumentLayout with structured body and sticky action footer', () => {
      render(
        <DocumentLayout
          documentHeader={<div data-testid="doc-header">Repair Estimate #EST-101</div>}
          metaSummary={<div data-testid="doc-meta">Vehicle: WP CAB-4521</div>}
          stickyFooter={<button data-testid="doc-convert-btn">Convert to Job Card</button>}
          dataTestId="document-layout-test"
        >
          <div>3-Section Line Items</div>
        </DocumentLayout>
      );

      expect(screen.getByTestId('document-layout-test')).toBeInTheDocument();
      expect(screen.getByTestId('doc-header')).toBeInTheDocument();
      expect(screen.getByTestId('doc-meta')).toBeInTheDocument();
      expect(screen.getByTestId('document-sticky-footer')).toBeInTheDocument();
      expect(screen.getByTestId('doc-convert-btn')).toBeInTheDocument();
    });

    it('renders POSLayout with 65% catalog workspace and 35% persistent cart drawer', () => {
      render(
        <POSLayout
          topBar={<div data-testid="pos-top">POS Barcode Scanner</div>}
          catalogPane={<div data-testid="pos-catalog">Touch Catalog Grid</div>}
          cartPane={<div data-testid="pos-cart">Persistent Order Cart</div>}
          bottomSummary={<div data-testid="pos-tender">Tender Total: Rs. 15,000</div>}
          dataTestId="pos-layout-test"
        />
      );

      expect(screen.getByTestId('pos-layout-test')).toBeInTheDocument();
      expect(screen.getByTestId('pos-top-bar')).toBeInTheDocument();
      expect(screen.getByTestId('pos-catalog-pane')).toBeInTheDocument();
      expect(screen.getByTestId('pos-cart-pane')).toBeInTheDocument();
      expect(screen.getByTestId('pos-bottom-summary')).toBeInTheDocument();
    });

    it('renders BoardLayout with sticky header and horizontal lanes container', () => {
      render(
        <BoardLayout
          boardHeader={<div data-testid="board-header">Kanban Toolbar & Advisor Filters</div>}
          dataTestId="board-layout-test"
        >
          <div data-testid="lane-1">Draft Column</div>
          <div data-testid="lane-2">In Progress Column</div>
          <div data-testid="lane-3">Completed Column</div>
        </BoardLayout>
      );

      expect(screen.getByTestId('board-layout-test')).toBeInTheDocument();
      expect(screen.getByTestId('board-header-slot')).toBeInTheDocument();
      expect(screen.getByTestId('board-lanes-container')).toBeInTheDocument();
      expect(screen.getByTestId('lane-1')).toBeInTheDocument();
      expect(screen.getByTestId('lane-2')).toBeInTheDocument();
      expect(screen.getByTestId('lane-3')).toBeInTheDocument();
    });

    it('renders CatalogLayout with category ribbons and filter sidebar', () => {
      render(
        <MemoryRouter>
          <CatalogLayout
            title="Parts & Services Catalog"
            categoryRibbon={<div data-testid="cat-ribbon">Fast Categories</div>}
            filterSidebar={<div data-testid="cat-sidebar">Brand & Price Filters</div>}
            dataTestId="catalog-layout-test"
          >
            <div>Inventory SKU Table</div>
          </CatalogLayout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('catalog-layout-test')).toBeInTheDocument();
      expect(screen.getByTestId('cat-ribbon')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-filter-sidebar')).toBeInTheDocument();
      expect(screen.getByText('Inventory SKU Table')).toBeInTheDocument();
    });
  });

  describe('4.5 Integration into Views and Anti-Nesting Verification', () => {
    it('integrates PageContainer across primary application views', async () => {
      const { RoleDashboardPage } = await import('@/features/dashboard/pages/RoleDashboardPage');
      const { WorkshopJobsPage } = await import('@/features/workshop/pages/WorkshopJobsPage');

      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider initialRole="OWNER">
            <RoleDashboardPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const dashboardContainer = screen.getByTestId('role-dashboard');
      expect(dashboardContainer.className).toContain('max-w-[1600px]');
      expect(dashboardContainer.className).toContain('px-4 sm:px-6 lg:px-8');

      unmount();

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/workshop/jobs']}>
            <AuthProvider initialRole="OWNER">
              <WorkshopJobsPage />
            </AuthProvider>
          </MemoryRouter>
        </ToastProvider>
      );

      const jobsContainer = screen.getByTestId('workshop-jobs-page');
      expect(jobsContainer.className).toContain('max-w-7xl');
      expect(jobsContainer.className).toContain('px-4 sm:px-6 lg:px-8');
    });
  });
});
