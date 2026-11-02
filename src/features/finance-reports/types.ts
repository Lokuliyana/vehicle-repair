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
  | 'THIS_QUARTER'
  | 'ALL_TIME'
  | 'CUSTOM';

export interface DateRangeFilter {
  range: DateRangeOption;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

// -------------------------------------------------------------------------
// Phase 9: Reports & Analytics Domain Types
// -------------------------------------------------------------------------

export interface RevenueStreamMetric {
  name: string;
  revenueRs: number;
  costRs: number;
  grossProfitRs: number;
  grossMarginPct: number;
  percentageOfTotalRevenue: number;
}

export interface SalesGrossProfitReportData {
  dateRange: DateRangeFilter;
  totalNetSalesRs: number;
  totalDirectCostRs: number;
  combinedGrossProfitRs: number;
  grossMarginPct: number;
  streams: {
    workshopLabor: RevenueStreamMetric;
    workshopParts: RevenueStreamMetric;
    counterPosSales: RevenueStreamMetric;
  };
  invoicedJobsCount: number;
  posSalesCount: number;
}

export type InsuranceAgingBucketKey = '0_30' | '31_60' | '61_90' | '90_PLUS';

export interface InsuranceAgingBucketSummary {
  bucketKey: InsuranceAgingBucketKey;
  label: string;
  claimCount: number;
  totalApprovedRs: number;
  totalSettledRs: number;
  outstandingBalanceRs: number;
}

export interface InsuranceCompanyAgingSummary {
  insuranceCompany: string;
  totalApprovedClaimsRs: number;
  settledAmountRs: number;
  outstandingBalanceRs: number;
  oldestClaimDays: number;
  claimCount: number;
}

export interface ItemizedInsuranceClaim {
  jobId: string;
  jobNumber: string;
  vehiclePlate: string;
  vehicleMakeModel: string;
  insuranceCompany: string;
  invoiceDate: string;
  agingDays: number;
  agingBucket: InsuranceAgingBucketKey;
  bucketLabel: string;
  approvedClaimRs: number;
  settledAmountRs: number;
  balanceDueRs: number;
  docStage: import('@/features/workshop/types').DocumentStage;
}

export interface InsuranceAgingReportData {
  referenceDate: string;
  totalApprovedClaimsRs: number;
  totalSettledAmountRs: number;
  totalOutstandingClaimsRs: number;
  buckets: Record<InsuranceAgingBucketKey, InsuranceAgingBucketSummary>;
  companySummaries: InsuranceCompanyAgingSummary[];
  itemizedClaims: ItemizedInsuranceClaim[];
}

export type TechnicianVelocityStatus = 'AHEAD' | 'ON_TRACK' | 'BEHIND';

export interface TechnicianTurnaroundMetric {
  technicianName: string;
  totalAssignedTasks: number;
  completedTasks: number;
  taskCompletionRatePct: number;
  completedJobsCount: number;
  activeInProgressJobsCount: number;
  avgEstimatedTargetDays: number;
  avgTurnaroundDays: number;
  velocityStatus: TechnicianVelocityStatus;
}

export interface TechnicianVelocityReportData {
  totalActiveTechnicians: number;
  totalAssignedTasks: number;
  totalCompletedTasks: number;
  overallCompletionRatePct: number;
  overallAvgTargetDays: number;
  overallAvgTurnaroundDays: number;
  technicians: TechnicianTurnaroundMetric[];
}

export interface FastMovingPartMetric {
  catalogItemId?: string;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  uom: string;
  workshopQtyUsed: number;
  posQtySold: number;
  totalQtyConsumed: number;
  totalRevenueRs: number;
  totalCostRs: number;
  grossProfitRs: number;
  grossMarginPct: number;
}

export type StockAlertSeverity = 'OUT_OF_STOCK' | 'LOW_STOCK';

export interface LowStockAlertItem {
  catalogItemId: string;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  uom: string;
  stockQty: number;
  lowStockAlertLevel: number;
  deficitQty: number;
  status: StockAlertSeverity;
  buyingCostRs: number;
  sellingPriceRs: number;
}

export interface InventoryVelocityAndAlertsReportData {
  fastMovingParts: FastMovingPartMetric[];
  lowStockAlerts: LowStockAlertItem[];
  totalLowStockItemsCount: number;
  totalOutOfStockItemsCount: number;
  totalInventoryDeficitQty: number;
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
