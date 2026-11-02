export type UserRole =
  | 'OWNER'
  | 'WORKSHOP_MANAGER'
  | 'SERVICE_ADVISOR'
  | 'CASHIER'
  | 'TECHNICIAN';

export * from './auth';
export * from '@/features/catalog/types';
export * from '@/features/workshop/types';
export * from '@/features/finance-reports/types';
export type {
  PaymentMethod,
  PosCartLine,
  SplitPaymentDetails,
  PosSaleTransaction,
  PosShiftDrawerEntry,
  CreatePosSaleDto,
  PosSaleFilter,
} from '@/features/pos/types';


export interface PosReceiptLine {
  id: string;
  catalogItemId?: string;
  barcode?: string;
  sku?: string;
  description: string;
  qty: number;
  unitSellingPriceRs: number;
  unitBuyingCostRs: number;
  lineDiscountRs: number;
  lineTotalSalesRs: number;
  lineTotalCostRs: number;
  lineGrossProfitRs: number;
}

export interface PosSaleReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  customerNote: string;
  items: PosReceiptLine[];
  subtotalRs: number;
  subtotalSalesRs?: number;
  discountRs: number;
  overallDiscountRs?: number;
  netTotalSalesRs: number;
  netSalesRs?: number;
  totalCostRs: number;
  totalBuyingCostRs?: number;
  grossProfitRs: number;
  grossMarginPct?: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'SPLIT';
  amountTenderedRs: number;
  changeGivenRs: number;
  cashierName?: string;
  splitDetails?: import('@/features/pos/types').SplitPaymentDetails;
}

