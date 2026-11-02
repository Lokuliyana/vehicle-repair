import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppShell } from '@/app/layout/AppShell';
import { RoleDashboardPage } from '@/features/dashboard/pages/RoleDashboardPage';
import { WorkshopJobsPage } from '@/features/workshop/pages/WorkshopJobsPage';
import { WorkshopBoardPage } from '@/features/workshop/pages/WorkshopBoardPage';
import { InteractiveBenchPage } from '@/features/workshop/pages/InteractiveBenchPage';
import { PosTerminalPage } from '@/features/pos/pages/PosTerminalPage';
import { CatalogListPage } from '@/features/catalog/pages/CatalogListPage';
import { ProfitLedgerPage } from '@/features/finance-reports/pages/ProfitLedgerPage';
import { ReportsPage } from '@/features/finance-reports/pages/ReportsPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToastProvider } from '@/components/ui/toast';
import { UserRole } from '@/types';

function renderTestApp(initialEntries: string[] = ['/'], initialRole: UserRole = 'OWNER') {
  const testRouter = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <RoleDashboardPage />,
          },
          {
            path: 'workshop/jobs',
            element: <WorkshopJobsPage />,
          },
          {
            path: 'workshop/board',
            element: <WorkshopBoardPage />,
          },
          {
            path: 'workshop/sheet/demo',
            element: <InteractiveBenchPage />,
          },
          {
            path: 'pos',
            element: (
              <ProtectedRoute requiredPermission="canAccessPos">
                <PosTerminalPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'catalog',
            element: (
              <ProtectedRoute requiredPermission="canManageCatalog">
                <CatalogListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'finance/profit-ledger',
            element: (
              <ProtectedRoute requiredPermission="canAccessFinance">
                <ProfitLedgerPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
    { initialEntries }
  );

  return render(
    <ToastProvider>
      <AuthProvider initialRole={initialRole}>
        <RouterProvider router={testRouter} />
      </AuthProvider>
    </ToastProvider>
  );
}

describe('Application Shell & Navigation Layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders persistent desktop sidebar with all primary navigation links', () => {
    renderTestApp(['/'], 'OWNER');

    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('nav-workshop-jobs')).toBeInTheDocument();
    expect(screen.getByTestId('nav-workshop-board')).toBeInTheDocument();
    expect(screen.getByTestId('nav-pos')).toBeInTheDocument();
    expect(screen.getByTestId('nav-catalog')).toBeInTheDocument();
    expect(screen.getByTestId('nav-finance-profit-ledger')).toBeInTheDocument();
    expect(screen.getByTestId('nav-reports')).toBeInTheDocument();
    expect(screen.getByTestId('nav-workshop-sheet-demo')).toBeInTheDocument();
  });

  it('renders header with role switcher select, shift pill, and quick actions', () => {
    renderTestApp(['/'], 'OWNER');

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('role-switcher-select')).toBeInTheDocument();
    expect(screen.getByTestId('active-shift-pill')).toBeInTheDocument();
    expect(screen.getByTestId('quick-new-sheet-btn')).toBeInTheDocument();
    expect(screen.getByTestId('quick-open-pos-btn')).toBeInTheDocument();
  });

  it('shows Cost & Margin mode toggle for OWNER and WORKSHOP_MANAGER', () => {
    renderTestApp(['/'], 'OWNER');
    expect(screen.getByTestId('header-cost-mode-toggle')).toBeInTheDocument();
  });

  it('HIDES Cost & Margin mode toggle for non-management roles (TECHNICIAN, CASHIER, SERVICE_ADVISOR)', () => {
    renderTestApp(['/'], 'TECHNICIAN');
    expect(screen.queryByTestId('header-cost-mode-toggle')).not.toBeInTheDocument();
  });

  it('switches role dynamically and updates UI capabilities', () => {
    renderTestApp(['/'], 'OWNER');

    const select = screen.getByTestId('role-switcher-select');
    expect(screen.getByTestId('header-cost-mode-toggle')).toBeInTheDocument();

    // Switch to SERVICE_ADVISOR
    fireEvent.change(select, { target: { value: 'SERVICE_ADVISOR' } });

    // Cost mode button should disappear immediately
    expect(screen.queryByTestId('header-cost-mode-toggle')).not.toBeInTheDocument();
  });

  it('navigates to Workshop Jobs route and displays repair sheets table', () => {
    renderTestApp(['/workshop/jobs'], 'OWNER');

    expect(screen.getByTestId('workshop-jobs-page')).toBeInTheDocument();
    expect(screen.getByText('WP CAB-4521')).toBeInTheDocument();
  });

  it('navigates to Workshop Floor Board route and displays kanban columns', () => {
    renderTestApp(['/workshop/board'], 'OWNER');

    expect(screen.getByTestId('workshop-board-page')).toBeInTheDocument();
    expect(screen.getByText('Workshop Floor Status Board')).toBeInTheDocument();
  });

  it('navigates to Phase 1 Interactive Bench route and renders 3-section table & print preview', () => {
    renderTestApp(['/workshop/sheet/demo'], 'OWNER');

    expect(screen.getByTestId('interactive-bench-page')).toBeInTheDocument();
    expect(screen.getByText('1. Editable Workshop Tables (Keyboard Ready)')).toBeInTheDocument();
    expect(screen.getByText('2. A4 Workshop Print Preview')).toBeInTheDocument();
  });

  it('navigates to 404 Not Found page on invalid route', () => {
    renderTestApp(['/invalid-unknown-route'], 'OWNER');

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});

describe('Protected Routes & Permission Enforcements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows OWNER to access protected Profit Ledger (/finance/profit-ledger)', () => {
    renderTestApp(['/finance/profit-ledger'], 'OWNER');

    expect(screen.getByTestId('profit-ledger-page')).toBeInTheDocument();
    expect(screen.getByText('Unified Profit & Financial Ledger')).toBeInTheDocument();
  });

  it('BLOCKS TECHNICIAN from accessing Profit Ledger and shows Access Restricted card', () => {
    renderTestApp(['/finance/profit-ledger'], 'TECHNICIAN');

    expect(screen.queryByTestId('profit-ledger-page')).not.toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/Insufficient Permissions for this Section/i)).toBeInTheDocument();
  });

  it('allows CASHIER to access POS (/pos)', () => {
    renderTestApp(['/pos'], 'CASHIER');

    expect(screen.getByTestId('pos-terminal-page')).toBeInTheDocument();
    expect(screen.getByText('Counter POS & Quick Spare Parts Desk')).toBeInTheDocument();
  });

  it('BLOCKS SERVICE_ADVISOR from accessing POS and shows Access Restricted', () => {
    renderTestApp(['/pos'], 'SERVICE_ADVISOR');

    expect(screen.queryByTestId('pos-terminal-page')).not.toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
  });

  it('allows quick role elevation from Access Restricted screen for dev testing', () => {
    renderTestApp(['/finance/profit-ledger'], 'SERVICE_ADVISOR');

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();

    const elevateBtn = screen.getByText('Switch to OWNER');
    fireEvent.click(elevateBtn);

    // After switching to OWNER, Profit Ledger should now render
    expect(screen.getByTestId('profit-ledger-page')).toBeInTheDocument();
  });
});
