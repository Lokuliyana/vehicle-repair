import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { UserRole } from '@/types';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { financeRepository, extractDateString, isDateInFilter } from '@/features/finance-reports/repository/finance.repository.mock';
import { ProfitLedgerPage } from '@/features/finance-reports/pages/ProfitLedgerPage';
import { ExpensesPage } from '@/features/finance-reports/pages/ExpensesPage';

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

    it('verifies Revenue Streams breakdown when workshop job has discounts applied', async () => {
      // Add an invoiced job with discount
      await workshopJobRepository.create({
        docStage: 'INVOICE',
        header: {
          jobNumber: 'JOB-2026-DISC',
          date: '2026-11-02',
          vehicleNumber: 'WP CAR-1111',
          natureOfRepair: 'General Service with Shop Discount',
          vehicleMake: 'Toyota',
          chassisNumber: 'NZ-10022',
          vehicleModel: 'Vitz',
          daysForCompletion: '1 Day',
          yearOfMake: '2019',
          vehicleColor: 'Silver',
          insuranceName: 'Cash',
          customerInfo: 'Discount Customer',
        },
        lines: [
          {
            id: 'disc-l1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Brake Servicing',
            sellingPriceRs: 5000,
            buyingCostRs: 1500,
            isCompleted: true,
          },
          {
            id: 'disc-l2',
            rowNo: 2,
            category: 'REPLACEMENT',
            description: 'Engine Air Filter',
            sellingPriceRs: 5000,
            buyingCostRs: 2500,
            isCompleted: true,
          },
        ],
        discountRs: 2000,
        taxRs: 0,
      });

      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Workshop total revenue must equal the sum of labor and parts streams exactly
      expect(summary.workshopTotalRevenueRs).toBe(
        Math.round((summary.workshopLaborRevenueRs + summary.workshopPartsRevenueRs) * 100) / 100
      );
      // Combined Gross Profit formula must hold true
      expect(summary.combinedGrossProfitRs).toBe(
        summary.totalNetSalesRs - summary.totalDirectCostRs
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

    it('reverses drawer cash-out when an expense paid from POS_DRAWER is deleted while shift is OPEN', async () => {
      const activeShift = posShiftRepository.getActiveShiftSync();
      expect(activeShift).toBeDefined();
      expect(activeShift?.status).toBe('OPEN');
      const drawerBefore = activeShift!.expectedDrawerCashRs;

      // 1. Create drawer expense
      const expense = await financeRepository.createExpense({
        date: '2026-11-02',
        category: 'TEA_ALLOWANCE',
        description: 'Snacks for mechanics',
        amountRs: 1200,
        paidFrom: 'POS_DRAWER',
      });

      const shiftAfterCreate = posShiftRepository.getActiveShiftSync();
      expect(shiftAfterCreate?.expectedDrawerCashRs).toBe(drawerBefore - 1200);

      // 2. Delete the expense
      const deleted = await financeRepository.deleteExpense(expense.id);
      expect(deleted).toBe(true);

      // 3. Drawer cash should be restored
      const shiftAfterDelete = posShiftRepository.getActiveShiftSync();
      expect(shiftAfterDelete?.expectedDrawerCashRs).toBe(drawerBefore);
    });

    it('prevents deleting an expense voucher linked to a CLOSED POS shift drawer', async () => {
      // 1. Create drawer expense
      const expense = await financeRepository.createExpense({
        date: '2026-11-02',
        category: 'OTHER',
        description: 'Temporary hardware store bolts',
        amountRs: 800,
        paidFrom: 'POS_DRAWER',
      });

      // 2. Close the active shift
      const activeShift = posShiftRepository.getActiveShiftSync();
      expect(activeShift).toBeDefined();
      posShiftRepository.closeShiftSync(activeShift!.id, activeShift!.expectedDrawerCashRs);

      const closedShift = posShiftRepository.getShiftByIdSync(activeShift!.id);
      expect(closedShift?.status).toBe('CLOSED');

      // 3. Attempting to delete this finalized expense should throw
      await expect(financeRepository.deleteExpense(expense.id)).rejects.toThrow(
        /Cannot delete expense voucher .* Linked POS shift .* is closed and finalized/
      );
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

      // Inverted Custom Range (auto-normalizes)
      expect(
        isDateInFilter(
          '2026-10-30',
          { range: 'CUSTOM', startDate: '2026-11-01', endDate: '2026-10-29' },
          refDate
        )
      ).toBe(true);
    });

    it('correctly handles leap years and month boundaries', () => {
      // Leap year reference: 2024-03-01
      const marchFirstLeap = new Date('2024-03-01T10:00:00.000Z');
      expect(isDateInFilter('2024-02-29', { range: 'YESTERDAY' }, marchFirstLeap)).toBe(true);
      expect(isDateInFilter('2024-02-28', { range: 'YESTERDAY' }, marchFirstLeap)).toBe(false);

      // Non-leap year reference: 2025-03-01
      const marchFirstNonLeap = new Date('2025-03-01T10:00:00.000Z');
      expect(isDateInFilter('2025-02-28', { range: 'YESTERDAY' }, marchFirstNonLeap)).toBe(true);
      expect(isDateInFilter('2025-02-29', { range: 'YESTERDAY' }, marchFirstNonLeap)).toBe(false);

      // Week crossing month boundary: Sunday March 1, 2026 (week starts Mon Feb 23, 2026)
      const sunMarch1 = new Date('2026-03-01T12:00:00.000Z');
      expect(isDateInFilter('2026-02-23', { range: 'THIS_WEEK' }, sunMarch1)).toBe(true);
      expect(isDateInFilter('2026-02-28', { range: 'THIS_WEEK' }, sunMarch1)).toBe(true);
      expect(isDateInFilter('2026-03-01', { range: 'THIS_WEEK' }, sunMarch1)).toBe(true);
      expect(isDateInFilter('2026-02-22', { range: 'THIS_WEEK' }, sunMarch1)).toBe(false);
      expect(isDateInFilter('2026-03-02', { range: 'THIS_WEEK' }, sunMarch1)).toBe(false);
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

    it('renders Date & Time column header and supports 1-click modal preview directly from Ref # link', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Verify column header
      expect(screen.getByRole('columnheader', { name: /date & time/i })).toBeInTheDocument();

      // Click Ref # for Workshop Invoice
      const refLinkJob = screen.getByTestId('ref-link-JOB-2026-0040');
      act(() => {
        fireEvent.click(refLinkJob);
      });
      expect(screen.getByText(/Workshop Invoice Print Preview — JOB-2026-0040/i)).toBeInTheDocument();

      // Close dialog
      const closeBtn = screen.getByRole('button', { name: /close/i });
      act(() => {
        fireEvent.click(closeBtn);
      });

      // Click Ref # for POS Sale
      const refLinkPos = screen.getByTestId('ref-link-POS-2026-0001');
      act(() => {
        fireEvent.click(refLinkPos);
      });
      expect(screen.getByText(/80mm Thermal Receipt \(POS-2026-0001\)/i)).toBeInTheDocument();
    });

    it('rejects expense entry when date field is empty', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const openBtn = screen.getByTestId('record-expense-btn');
      act(() => {
        fireEvent.click(openBtn);
      });

      const dateInput = screen.getByTestId('expense-date-input');
      const descInput = screen.getByTestId('expense-desc-input');
      const amountInput = screen.getByTestId('expense-amount-input');
      const submitBtn = screen.getByTestId('expense-submit-btn');

      act(() => {
        fireEvent.change(dateInput, { target: { value: '' } });
        fireEvent.change(descInput, { target: { value: 'Test description' } });
        fireEvent.change(amountInput, { target: { value: '500' } });
      });

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(screen.getByTestId('expense-error-alert')).toBeInTheDocument();
      expect(screen.getByText('Please select a valid expense date.')).toBeInTheDocument();
    });
  });

  describe('6. Phase 8 Confidency OS Executive Cockpit & Privacy Bounds', () => {
    it('renders consolidated 5-card financial cockpit and confirms removal of redundant waterfall & banner cards', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Redundant waterfall & banner cards must NOT be rendered
      expect(screen.queryByTestId('daily-cash-flow-waterfall-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('net-shop-profit-summary-card')).not.toBeInTheDocument();

      // Clean 5-card cockpit
      expect(screen.getByTestId('kpi-card-sales')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-direct-cost')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-gross-profit')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-expenses')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-net-profit')).toBeInTheDocument();
    });

    it('verifies that adding an invoiced workshop job immediately cascades through the profit ledger', async () => {
      const summaryBefore = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Create a brand new invoiced job
      await workshopJobRepository.create({
        docStage: 'INVOICE',
        header: {
          jobNumber: 'JOB-2026-PHASE8',
          date: '2026-11-02',
          vehicleNumber: 'WP CAB-9999',
          natureOfRepair: 'Transmission Overhaul & Gearbox Flush',
          vehicleMake: 'Toyota',
          chassisNumber: 'TOY-99991',
          vehicleModel: 'Hilux',
          daysForCompletion: '2 Days',
          yearOfMake: '2022',
          vehicleColor: 'Pearl White',
          insuranceName: 'Cash',
          customerInfo: 'Sunil Weerakkody',
        },
        lines: [
          {
            id: 'line-p8-1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Gearbox Disassembly & Re-machining',
            sellingPriceRs: 20000,
            buyingCostRs: 8000,
            isCompleted: true,
          },
          {
            id: 'line-p8-2',
            rowNo: 2,
            category: 'REPLACEMENT',
            description: 'ATF Oil & Filter Kit',
            sellingPriceRs: 30000,
            buyingCostRs: 18000,
            isCompleted: true,
          },
        ],
        discountRs: 0,
        taxRs: 0,
      });

      const summaryAfter = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Gross and net sales increased by 50,000
      expect(summaryAfter.totalNetSalesRs).toBe(summaryBefore.totalNetSalesRs + 50000);
      // Direct costs increased by 26,000
      expect(summaryAfter.totalDirectCostRs).toBe(summaryBefore.totalDirectCostRs + 26000);
      // Gross profit increased by 24,000 (50,000 - 26,000)
      expect(summaryAfter.combinedGrossProfitRs).toBe(summaryBefore.combinedGrossProfitRs + 24000);
      // Net shop profit increased by 24,000
      expect(summaryAfter.netOperatingProfitRs).toBe(summaryBefore.netOperatingProfitRs + 24000);
    });

    it('verifies that recording a counter POS sale immediately cascades through sales, costs, and gross profit', async () => {
      const summaryBefore = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Create a counter POS sale
      await posSaleRepository.create({
        customerNote: 'Walk-in Spark Plug Customer',
        paymentMethod: 'CASH',
        items: [
          {
            description: 'Denso Iridium Spark Plugs (Set of 4)',
            qty: 1,
            unitSellingPriceRs: 12000,
            unitBuyingCostRs: 8000,
            lineDiscountRs: 0,
          },
        ],
        overallDiscountRs: 1000,
        amountTenderedRs: 11000,
        shiftId: 'SHIFT-2026-001',
        cashierName: 'Kamal Fonseka',
      });

      const summaryAfter = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Net sales increased by 11,000
      expect(summaryAfter.totalNetSalesRs).toBe(summaryBefore.totalNetSalesRs + 11000);
      // POS buying cost increased by 8,000
      expect(summaryAfter.posBuyingCostRs).toBe(summaryBefore.posBuyingCostRs + 8000);
      // Gross profit increased by 3,000
      expect(summaryAfter.combinedGrossProfitRs).toBe(summaryBefore.combinedGrossProfitRs + 3000);
      // Net shop operating profit increased by 3,000
      expect(summaryAfter.netOperatingProfitRs).toBe(summaryBefore.netOperatingProfitRs + 3000);
    });

    it('toggles shared-screen privacy mode and confirms RedactedCipherPlaceholder masks buying costs and margins with Rs. ••••••', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Initially, un-redacted figures are visible
      expect(screen.queryAllByText('Rs. ••••••').length).toBe(0);

      // Click Shared-Screen Privacy button
      const privacyToggle = screen.getByTestId('toggle-privacy-btn');
      act(() => {
        fireEvent.click(privacyToggle);
      });

      // Now confidential cost and profit amounts are masked with cipher placeholder
      expect(screen.getAllByText('Rs. ••••••').length).toBeGreaterThan(0);
      expect(screen.getByText('Reveal Figures')).toBeInTheDocument();

      // Click again to reveal
      act(() => {
        fireEvent.click(privacyToggle);
      });
      expect(screen.queryAllByText('Rs. ••••••').length).toBe(0);
      expect(screen.getByText('Shared-Screen Privacy')).toBeInTheDocument();
    });

    it('verifies Quick Filter Pills ribbon on UnifiedProfitLedgerTable', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Filter pills should be present
      expect(screen.getByTestId('filter-pill-ALL')).toBeInTheDocument();
      expect(screen.getByTestId('filter-pill-WORKSHOP_INVOICE')).toBeInTheDocument();
      expect(screen.getByTestId('filter-pill-POS_SALE')).toBeInTheDocument();
      expect(screen.getByTestId('filter-pill-SHOP_EXPENSE')).toBeInTheDocument();

      // Click Workshop Invoices pill
      act(() => {
        fireEvent.click(screen.getByTestId('filter-pill-WORKSHOP_INVOICE'));
      });
      expect(screen.getAllByText('Workshop Invoice').length).toBeGreaterThan(0);
      expect(screen.queryByText('POS Sale')).not.toBeInTheDocument();

      // Click POS Sale pill
      act(() => {
        fireEvent.click(screen.getByTestId('filter-pill-POS_SALE'));
      });
      expect(screen.getAllByText('POS Sale').length).toBeGreaterThan(0);
      expect(screen.queryByText('Workshop Invoice')).not.toBeInTheDocument();

      // Click All Transactions pill
      act(() => {
        fireEvent.click(screen.getByTestId('filter-pill-ALL'));
      });
      expect(screen.getAllByText('Workshop Invoice').length).toBeGreaterThan(0);
      expect(screen.getAllByText('POS Sale').length).toBeGreaterThan(0);
    });

    it('renders ExpensesPage (/finance/expenses) with RolePermissionGateWrapper protection and overhead register', async () => {
      // 1. OWNER can access ExpensesPage
      render(
        <TestWrapper initialRole="OWNER">
          <ExpensesPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('expenses-page')).toBeInTheDocument();
      expect(screen.getByText('Garage Overhead & Expense Register')).toBeInTheDocument();
      expect(screen.getByText('Total Filtered Overheads')).toBeInTheDocument();
      expect(screen.getByTestId('expenses-table')).toBeInTheDocument();
    });

    it('BLOCKS unauthorized roles (CASHIER, TECHNICIAN, SERVICE_ADVISOR) from ExpensesPage', async () => {
      const { unmount: unmount1 } = render(
        <TestWrapper initialRole="CASHIER">
          <ExpensesPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('restricted-finance-alert')).toBeInTheDocument();
      expect(screen.queryByTestId('expenses-page')).not.toBeInTheDocument();
      unmount1();

      const { unmount: unmount2 } = render(
        <TestWrapper initialRole="TECHNICIAN">
          <ExpensesPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('restricted-finance-alert')).toBeInTheDocument();
      expect(screen.queryByTestId('expenses-page')).not.toBeInTheDocument();
      unmount2();

      render(
        <TestWrapper initialRole="SERVICE_ADVISOR">
          <ExpensesPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('restricted-finance-alert')).toBeInTheDocument();
      expect(screen.queryByTestId('expenses-page')).not.toBeInTheDocument();
    });

    it('confirms Shared-Screen Privacy mode masks KPI cards, Revenue Stream breakdown, TableMarginSparkBarCell, and NetShopProfitSummaryCard subtitle', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Verify unredacted state contains margin badges
      expect(screen.getAllByText(/% Margin/i).length).toBeGreaterThan(0);

      // Toggle Shared-Screen Privacy
      const privacyToggle = screen.getByTestId('toggle-privacy-btn');
      act(() => {
        fireEvent.click(privacyToggle);
      });

      // 1. Waterfall Ribbon masked
      expect(screen.getAllByText('Rs. ••••••').length).toBeGreaterThan(0);

      // 2. KPI Cards & Breakdown margins masked with '••••%'
      expect(screen.getAllByText(/••••%/i).length).toBeGreaterThan(0);

      // 3. TableMarginSparkBarCell rendered in redacted mode
      const redactedCells = screen.getAllByTestId('redacted-margin-cell');
      expect(redactedCells.length).toBeGreaterThan(0);
    });

    it('verifies UnifiedProfitLedgerTable export button strips direct costs and gross profit in customer-facing privacy mode', async () => {
      // Mock document.createElement & link click
      let downloadedCsv = '';
      let downloadedFilename = '';

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName.toLowerCase() === 'a') {
          vi.spyOn(el, 'click').mockImplementation(() => {});
          const originalSetAttribute = el.setAttribute.bind(el);
          vi.spyOn(el, 'setAttribute').mockImplementation((key: string, val: string) => {
            if (key === 'download') {
              downloadedFilename = val;
            }
            originalSetAttribute(key, val);
          });
        }
        return el;
      });

      // Mock URL.createObjectURL and inspect blob
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
        // Blob part in jsdom is accessible via text()
        if (typeof blob.text === 'function') {
          blob.text().then((text) => {
            downloadedCsv = text;
          });
        }
        return 'mock-blob-url';
      });

      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Toggle to privacy mode
      const privacyToggle = screen.getByTestId('toggle-privacy-btn');
      act(() => {
        fireEvent.click(privacyToggle);
      });

      // Click Export button
      const exportBtn = screen.getByTestId('export-ledger-btn');
      expect(exportBtn).toBeInTheDocument();
      expect(screen.getByText('Customer Export')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(exportBtn);
      });

      // Verify filename indicates customer statement
      expect(downloadedFilename).toContain('profit-ledger-customer-statement');
      if (downloadedCsv) {
        expect(downloadedCsv).toContain('Net Selling Price (Rs.)');
        expect(downloadedCsv).not.toContain('Direct Cost (Rs.)');
        expect(downloadedCsv).not.toContain('Gross Profit (Rs.)');
      }

      // Cleanup
      URL.createObjectURL = originalCreateObjectURL;
      vi.restoreAllMocks();
    });

    it('verifies confidential cost columns have cost-column, cost-cell, and print-hidden classes for print privacy', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      // Direct Cost header has print-hidden and cost-column
      const costHeader = screen.getByText('Direct Cost (Rs.)');
      expect(costHeader).toHaveClass('cost-column');
      expect(costHeader).toHaveClass('print-hidden');

      // Gross Profit header has print-hidden and cost-column
      const gpHeader = screen.getByText('Gross Profit (Rs.)');
      expect(gpHeader).toHaveClass('cost-column');
      expect(gpHeader).toHaveClass('print-hidden');

      // Gross Margin header has print-hidden and cost-column
      const marginHeader = screen.getByText('Gross Margin %');
      expect(marginHeader).toHaveClass('cost-column');
      expect(marginHeader).toHaveClass('print-hidden');
    });

    it('verifies embedded Date Range switcher in UnifiedProfitLedgerTable triggers period filtering', async () => {
      render(
        <TestWrapper initialRole="OWNER">
          <ProfitLedgerPage />
        </TestWrapper>
      );

      const tableDateSelect = screen.getByTestId('table-date-range-select');
      expect(tableDateSelect).toBeInTheDocument();

      act(() => {
        fireEvent.change(tableDateSelect, { target: { value: 'TODAY' } });
      });

      expect(screen.getByText(/Showing financial events for/i)).toHaveTextContent('TODAY');
    });
  });
});
