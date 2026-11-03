import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { RoleDashboardPage } from '@/features/dashboard/pages/RoleDashboardPage';
import { WorkshopJobsPage } from '@/features/workshop/pages/WorkshopJobsPage';
import { WorkshopBoardPage } from '@/features/workshop/pages/WorkshopBoardPage';
import { RepairSheetPage } from '@/features/workshop/pages/RepairSheetPage';
import { InteractiveBenchPage } from '@/features/workshop/pages/InteractiveBenchPage';
import { WorkshopInvoicePage } from '@/features/workshop/pages/WorkshopInvoicePage';
import { PosTerminalPage } from '@/features/pos/pages/PosTerminalPage';
import { PosShiftManagementPage } from '@/features/pos/pages/PosShiftManagementPage';
import { CatalogListPage } from '@/features/catalog/pages/CatalogListPage';
import { ProfitLedgerPage } from '@/features/finance-reports/pages/ProfitLedgerPage';
import { ExpensesPage } from '@/features/finance-reports/pages/ExpensesPage';
import { ReportsPage } from '@/features/finance-reports/pages/ReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <RoleDashboardPage />,
      },
      {
        path: 'dashboard',
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
        path: 'workshop/sheet',
        element: <RepairSheetPage />,
      },
      {
        path: 'workshop/new',
        element: <RepairSheetPage />,
      },
      {
        path: 'workshop/sheet/:id',
        element: <RepairSheetPage />,
      },
      {
        path: 'workshop/sheet/demo',
        element: <InteractiveBenchPage />,
      },
      {
        path: 'workshop/invoice/:id',
        element: <WorkshopInvoicePage />,
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
        path: 'pos/shift',
        element: (
          <ProtectedRoute requiredPermission="canAccessPos">
            <PosShiftManagementPage />
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
        path: 'finance/expenses',
        element: (
          <ProtectedRoute requiredPermission="canAccessFinance">
            <ExpensesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredPermission="canAccessReports" allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
