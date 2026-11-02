import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { UserRole } from '@/types';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { financeRepository, extractDateString, isDateInFilter } from '@/features/finance-reports/repository/finance.repository.mock';
import { ProfitLedgerPage } from '@/features/finance-reports/pages/ProfitLedgerPage';

function TestWrapper({
  initialRole = 'OWNER',
  children,
}: {
  initialRole?: UserRole;
  children: React.ReactNode;
}) {
  return (
    <MemoryRouter>
      <AuthProvider initialRole={initialRole}>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Phase 8: Embedded Finance, Sales, Cost & Gross Profit Center', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await posSaleRepository.resetToDefaults();
    await posShiftRepository.resetToDefaults();
    await financeRepository.resetToDefaults();
  });

  describe('1. Financial Mathematical Formulas & Aggregations', () => {
    it('verifies Combined Gross Profit formula: (Invoiced Workshop Sales - Workshop Buying Costs) + (POS Sales - POS Buying Costs)', async () => {
      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Workshop Invoiced:
      // Job 3 (JOB-2026-0040) is in docStage 'INVOICE'
      // Job 3 netSalesRs = 42500, totalBuyingCostRs = 24100 (Struts 2500 + Skim 1500 + Shocks 17500 + Pads 2600)
      const workshopGrossProfit = summary.workshopTotalRevenueRs - summary.workshopTotalCostRs;
      expect(summary.workshopGrossProfitRs).toBe(workshopGrossProfit);

      // POS Sales:
      // Seed POS Sale (POS-2026-0001): netSalesRs = 16700, totalBuyingCostRs = 12600, grossProfitRs = 4100
      const posGrossProfit = summary.posSalesRevenueRs - summary.posBuyingCostRs;
      expect(summary.posGrossProfitRs).toBe(posGrossProfit);

      // Combined Gross Profit
      const expectedCombinedGrossProfit = workshopGrossProfit + posGrossProfit;
      expect(summary.combinedGrossProfitRs).toBe(expectedCombinedGrossProfit);
      expect(summary.totalNetSalesRs).toBe(summary.workshopTotalRevenueRs + summary.posSalesRevenueRs);
      expect(summary.totalDirectCostRs).toBe(summary.workshopTotalCostRs + summary.posBuyingCostRs);
    });

    it('verifies Net Operating Profit formula: Net Profit = Combined Gross Profit - Shop Operating Expenses', async () => {
      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      const expectedNetProfit = summary.combinedGrossProfitRs - summary.dailyOperatingExpensesRs;
      expect(summary.netOperatingProfitRs).toBe(expectedNetProfit);
    });

    it('verifies Gross Margin Percentage formula: (Combined Gross Profit / Total Net Sales) * 100', async () => {
      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      const expectedMarginPct =
        summary.totalNetSalesRs > 0
          ? Math.round(((summary.combinedGrossProfitRs / summary.totalNetSalesRs) * 100 + Number.EPSILON) * 100) / 100
          : 0;

      expect(summary.grossMarginPct).toBeCloseTo(expectedMarginPct, 1);
    });

    it('verifies Receivables calculation: Pending Insurance Claims vs Customer Balances Due', async () => {
      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Pending insurance claims + Customer balances due = Total Outstanding Receivables
      expect(summary.totalOutstandingReceivablesRs).toBe(
        summary.pendingInsuranceClaimsRs + summary.customerBalancesDueRs
      );
      expect(summary.totalOutstandingReceivablesRs).toBeGreaterThan(0);
      expect(summary.pendingInsuranceClaimsRs).toBeGreaterThanOrEqual(0);
      expect(summary.customerBalancesDueRs).toBeGreaterThanOrEqual(0);
    });

    it('verifies Revenue Streams breakdown (Labor vs Replacement Parts vs POS)', async () => {
      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Workshop Labor Profit = Labor Revenue - Labor Cost
      expect(summary.workshopLaborProfitRs).toBe(
        summary.workshopLaborRevenueRs - summary.workshopLaborCostRs
      );

      // Workshop Parts Profit = Parts Revenue - Parts Cost
      expect(summary.workshopPartsProfitRs).toBe(
        summary.workshopPartsRevenueRs - summary.workshopPartsCostRs
      );

      // Total Workshop Revenue = Labor Revenue + Parts Revenue
      expect(summary.workshopTotalRevenueRs).toBe(
        summary.workshopLaborRevenueRs + summary.workshopPartsRevenueRs
      );
    });
  });

  describe('2. Shop Expenses Domain & Repository CRUD', () => {
    it('creates a new shop expense with validation and retrieves it', async () => {
      const newExp = await financeRepository.createExpense({
        date: '2026-11-02',
        category: 'TEA_ALLOWANCE',
        description: 'Afternoon snacks & ginger tea for garage team',
        amountRs: 950,
        paidFrom: 'MAIN_CASH',
        recordedBy: 'Jagath Perera',
      });

      expect(newExp.id).toMatch(/^exp-\d{4}-\d{4}$/);
      expect(newExp.amountRs).toBe(950);
      expect(newExp.category).toBe('TEA_ALLOWANCE');

      const all = await financeRepository.getExpenses();
      const found = all.find((e) => e.id === newExp.id);
      expect(found).toBeDefined();
      expect(found?.description).toBe('Afternoon snacks & ginger tea for garage team');
    });

    it('rejects expense creation when amount is 0 or negative', async () => {
      await expect(
        financeRepository.createExpense({
          date: '2026-11-02',
          category: 'OTHER',
          description: 'Invalid zero expense',
          amountRs: 0,
          paidFrom: 'MAIN_CASH',
        })
      ).rejects.toThrow('Expense amount must be greater than zero.');

      await expect(
        financeRepository.createExpense({
          date: '2026-11-02',
          category: 'OTHER',
          description: 'Invalid negative expense',
          amountRs: -500,
          paidFrom: 'MAIN_CASH',
        })
      ).rejects.toThrow('Expense amount must be greater than zero.');
    });

    it('rejects expense creation when description is empty', async () => {
      await expect(
        financeRepository.createExpense({
          date: '2026-11-02',
          category: 'RENT',
          description: '   ',
          amountRs: 5000,
          paidFrom: 'MAIN_CASH',
        })
      ).rejects.toThrow('Expense description is required.');
    });

    it('auto-links to active POS shift and records cash-out when paidFrom = POS_DRAWER', async () => {
      // Ensure an active shift exists
      const activeShiftBefore = posShiftRepository.getActiveShiftSync();
      expect(activeShiftBefore).toBeDefined();
      expect(activeShiftBefore?.status).toBe('OPEN');
      const drawerBefore = activeShiftBefore!.expectedDrawerCashRs;

      const expense = await financeRepository.createExpense({
        date: '2026-11-02',
        category: 'CONSUMABLES_PAINT',
        description: 'Auto Paint masking paper from shop',
        amountRs: 1500,
        paidFrom: 'POS_DRAWER',
        recordedBy: 'Kamal Fonseka',
      });

      expect(expense.paidFrom).toBe('POS_DRAWER');
      expect(expense.shiftId).toBe(activeShiftBefore!.id);

      // Verify POS Shift drawer cash-out was recorded
      const activeShiftAfter = posShiftRepository.getActiveShiftSync();
      expect(activeShiftAfter?.expectedDrawerCashRs).toBe(drawerBefore - 1500);
      expect(activeShiftAfter?.cashOutRs).toBeGreaterThanOrEqual(1500);
    });

    it('filters expenses by category and payment source', async () => {
      const teaExpenses = await financeRepository.getExpenses({ category: 'TEA_ALLOWANCE' });
      expect(teaExpenses.length).toBeGreaterThan(0);
      teaExpenses.forEach((e) => expect(e.category).toBe('TEA_ALLOWANCE'));

      const drawerExpenses = await financeRepository.getExpenses({ paidFrom: 'POS_DRAWER' });
      expect(drawerExpenses.length).toBeGreaterThan(0);
      drawerExpenses.forEach((e) => expect(e.paidFrom).toBe('POS_DRAWER'));
    });

    it('deletes an existing expense', async () => {
      const all = await financeRepository.getExpenses();
      const target = all[0];

      const deleted = await financeRepository.deleteExpense(target.id);
      expect(deleted).toBe(true);

      const remaining = await financeRepository.getExpenses();
      expect(remaining.find((e) => e.id === target.id)).toBeUndefined();
    });
  });

  describe('3. Date Range Filtering Logic', () => {
    it('correctly matches TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, ALL_TIME, and CUSTOM ranges', () => {
      const refDate = new Date('2026-11-02T10:00:00.000Z');

      expect(extractDateString('2026-11-02')).toBe('2026-11-02');
      expect(extractDateString('2026-11-02 09:30 AM')).toBe('2026-11-02');
      expect(extractDateString('2026-11-02T04:00:00.000Z')).toBe('2026-11-02');

      // Today
      expect(isDateInFilter('2026-11-02', { range: 'TODAY' }, refDate)).toBe(true);
      expect(isDateInFilter('2026-11-01', { range: 'TODAY' }, refDate)).toBe(false);

      // Yesterday
      expect(isDateInFilter('2026-11-01', { range: 'YESTERDAY' }, refDate)).toBe(true);
      expect(isDateInFilter('2026-11-02', { range: 'YESTERDAY' }, refDate)).toBe(false);

      // This Month (November 2026)
      expect(isDateInFilter('2026-11-01', { range: 'THIS_MONTH' }, refDate)).toBe(true);
      expect(isDateInFilter('2026-11-02', { range: 'THIS_MONTH' }, refDate)).toBe(true);
      expect(isDateInFilter('2026-10-31', { range: 'THIS_MONTH' }, refDate)).toBe(false);

      // All Time
      expect(isDateInFilter('2026-10-28', { range: 'ALL_TIME' }, refDate)).toBe(true);

      // Custom Range
      expect(
        isDateInFilter(
          '2026-10-30',
          { range: 'CUSTOM', startDate: '2026-10-29', endDate: '2026-11-01' },
          refDate
        )
      ).toBe(true);
      expect(
        isDateInFilter(
          '2026-10-28',
          { range: 'CUSTOM', startDate: '2026-10-29', endDate: '2026-11-01' },
          refDate
        )
      ).toBe(false);
    });
  });

  describe('4. Strict Role Permission Guard on /finance/profit-ledger', () => {
    it('allows OWNER to access profit ledger page', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('profit-ledger-page')).toBeInTheDocument();
      expect(screen.getByText('Unified Profit & Financial Ledger')).toBeInTheDocument();
      expect(screen.queryByTestId('restricted-finance-alert')).not.toBeInTheDocument();
    });

    it('allows WORKSHOP_MANAGER to access profit ledger page', async () => {
      render(
        <TestWrapper initialRole="WORKSHOP_MANAGER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('profit-ledger-page')).toBeInTheDocument();
      expect(screen.queryByTestId('restricted-finance-alert')).not.toBeInTheDocument();
    });

    it('BLOCKS SERVICE_ADVISOR from accessing profit ledger page', async () => {
      render(
        <TestWrapper initialRole="SERVICE_ADVISOR">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('restricted-finance-alert')).toBeInTheDocument();
      expect(screen.getByText('Confidential Profit & Finance Ledger')).toBeInTheDocument();
      expect(screen.queryByTestId('profit-ledger-page')).not.toBeInTheDocument();
    });

    it('BLOCKS CASHIER from accessing profit ledger page', async () => {
      render(
        <TestWrapper initialRole="CASHIER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('restricted-finance-alert')).toBeInTheDocument();
      expect(screen.queryByTestId('profit-ledger-page')).not.toBeInTheDocument();
    });

    it('BLOCKS TECHNICIAN from accessing profit ledger page', async () => {
      render(
        <TestWrapper initialRole="TECHNICIAN">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('restricted-finance-alert')).toBeInTheDocument();
      expect(screen.queryByTestId('profit-ledger-page')).not.toBeInTheDocument();
    });
  });

  describe('5. Unified Profit Ledger UI & Journal Operations', () => {
    it('renders all 6 high-level KPI summary cards and revenue stream breakdown', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('kpi-card-sales')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-direct-cost')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-gross-profit')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-expenses')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-net-profit')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-receivables')).toBeInTheDocument();
      expect(screen.getByTestId('revenue-stream-breakdown')).toBeInTheDocument();
    });

    it('renders interleaved chronological financial ledger table with workshop invoice, pos sale, and shop expenses', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const table = screen.getByTestId('ledger-table');
      expect(table).toBeInTheDocument();

      // Check presence of badges for different event types
      expect(screen.getAllByText('Workshop Invoice').length).toBeGreaterThan(0);
      expect(screen.getAllByText('POS Sale').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Shop Expense').length).toBeGreaterThan(0);
    });

    it('opens DailyExpenseModal, validates inputs, records expense, and refreshes the ledger', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Click Record Shop Expense button
      const openBtn = screen.getByTestId('record-expense-btn');
      act(() => {
        fireEvent.click(openBtn);
      });

      expect(screen.getByTestId('daily-expense-form')).toBeInTheDocument();

      // Attempt submit without description & amount -> triggers validation
      const submitBtn = screen.getByTestId('expense-submit-btn');
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(screen.getByTestId('expense-error-alert')).toBeInTheDocument();

      // Fill in valid details
      const descInput = screen.getByTestId('expense-desc-input');
      const amountInput = screen.getByTestId('expense-amount-input');
      const categorySelect = screen.getByTestId('expense-category-select');

      act(() => {
        fireEvent.change(categorySelect, { target: { value: 'TEA_ALLOWANCE' } });
        fireEvent.change(descInput, { target: { value: 'Team Tea and Shorties' } });
        fireEvent.change(amountInput, { target: { value: '650' } });
      });

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      // Verify expense added to table
      expect(screen.getByText('Team Tea and Shorties')).toBeInTheDocument();
    });

    it('filters ledger rows by type (Workshop Invoices only, POS Sales only, Shop Expenses only)', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const typeFilter = screen.getByTestId('type-filter-select');

      // Filter by Workshop Invoices
      act(() => {
        fireEvent.change(typeFilter, { target: { value: 'WORKSHOP_INVOICE' } });
      });
      expect(screen.getAllByText('Workshop Invoice').length).toBeGreaterThan(0);
      expect(screen.queryByText('POS Sale')).not.toBeInTheDocument();

      // Filter by POS Sales
      act(() => {
        fireEvent.change(typeFilter, { target: { value: 'POS_SALE' } });
      });
      expect(screen.getAllByText('POS Sale').length).toBeGreaterThan(0);
      expect(screen.queryByText('Workshop Invoice')).not.toBeInTheDocument();

      // Filter by Shop Expenses
      act(() => {
        fireEvent.change(typeFilter, { target: { value: 'SHOP_EXPENSE' } });
      });
      expect(screen.getAllByText('Shop Expense').length).toBeGreaterThan(0);
      expect(screen.queryByText('Workshop Invoice')).not.toBeInTheDocument();
    });

    it('filters ledger rows by search text query', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('search-input');

      // Search for specific reference
      act(() => {
        fireEvent.change(searchInput, { target: { value: 'JOB-2026-0040' } });
      });

      expect(screen.getByText('JOB-2026-0040')).toBeInTheDocument();
      expect(screen.queryByText('POS-2026-0001')).not.toBeInTheDocument();
    });

    it('opens 80mm thermal receipt modal when clicking Receipt on POS sale row', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const receiptBtn = screen.getByTestId('view-receipt-btn-POS-2026-0001');
      act(() => {
        fireEvent.click(receiptBtn);
      });

      // Receipt modal should open with thermal receipt header
      expect(screen.getByText(/80mm Thermal Receipt \(POS-2026-0001\)/i)).toBeInTheDocument();
    });

    it('opens A4 workshop invoice preview modal when clicking Print on Workshop Invoice row', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const invoiceBtn = screen.getByTestId('view-invoice-btn-JOB-2026-0040');
      act(() => {
        fireEvent.click(invoiceBtn);
      });

      // A4 invoice print preview modal should open
      expect(
        screen.getByText(/Workshop Invoice Print Preview — JOB-2026-0040/i)
      ).toBeInTheDocument();
    });
  });
});
