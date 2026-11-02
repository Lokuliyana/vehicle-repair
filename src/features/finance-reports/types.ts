import { WorkshopJobSheet } from '@/features/workshop/types';
import { PosSaleTransaction } from '@/features/pos/types';

export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY_UTILITIES'
  | 'CONSUMABLES_PAINT'
  | 'SUBLET_BILLS'
  | 'TEA_ALLOWANCE'
  | 'OTHER';

export type ExpensePaidFrom = 'POS_DRAWER' | 'MAIN_CASH';

export interface ShopExpense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amountRs: number;
  paidFrom: ExpensePaidFrom;
  shiftId?: string;
  recordedBy: string;
  createdAt: string;
}

export interface CreateShopExpenseDto {
  date: string;
  category: ExpenseCategory;
  description: string;
  amountRs: number;
  paidFrom: ExpensePaidFrom;
  shiftId?: string;
  recordedBy?: string;
}

export interface UpdateShopExpenseDto {
  date?: string;
  category?: ExpenseCategory;
  description?: string;
  amountRs?: number;
  paidFrom?: ExpensePaidFrom;
  shiftId?: string;
}

export interface ShopExpenseFilter {
  category?: ExpenseCategory | 'ALL';
  paidFrom?: ExpensePaidFrom | 'ALL';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export type DateRangeOption =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'ALL_TIME'
  | 'CUSTOM';

export interface DateRangeFilter {
  range: DateRangeOption;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface ProfitLedgerSummary {
  // High-level combined KPI
  totalNetSalesRs: number;
  totalDirectCostRs: number;
  combinedGrossProfitRs: number;
  grossMarginPct: number;
  dailyOperatingExpensesRs: number;
  netOperatingProfitRs: number;

  // Receivables
  pendingInsuranceClaimsRs: number;
  customerBalancesDueRs: number;
  totalOutstandingReceivablesRs: number;

  // Revenue Streams Breakdown
  workshopLaborRevenueRs: number;
  workshopLaborCostRs: number;
  workshopLaborProfitRs: number;

  workshopPartsRevenueRs: number;
  workshopPartsCostRs: number;
  workshopPartsProfitRs: number;

  workshopTotalRevenueRs: number;
  workshopTotalCostRs: number;
  workshopGrossProfitRs: number;

  posSalesRevenueRs: number;
  posBuyingCostRs: number;
  posGrossProfitRs: number;
}

export type FinanceLedgerItemType = 'WORKSHOP_INVOICE' | 'POS_SALE' | 'SHOP_EXPENSE';

export interface FinanceLedgerItem {
  id: string;
  date: string;
  timestamp: number;
  reference: string;
  type: FinanceLedgerItemType;
  categoryBadge: string;
  entityOrPayee: string;
  description: string;
  salesRevenueRs: number;
  directCostRs: number;
  operatingExpenseRs: number;
  netProfitContributionRs: number;
  sourceId: string;
  job?: WorkshopJobSheet;
  posSale?: PosSaleTransaction;
  expense?: ShopExpense;
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent & Premises',
  ELECTRICITY_UTILITIES: 'Electricity & Utilities',
  CONSUMABLES_PAINT: 'Consumables & Paint',
  SUBLET_BILLS: 'Sublet Bills',
  TEA_ALLOWANCE: 'Tea & Refreshments',
  OTHER: 'Other Operating Expenses',
};
