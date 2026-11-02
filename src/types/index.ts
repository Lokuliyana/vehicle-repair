export type UserRole =
  | 'OWNER'
  | 'WORKSHOP_MANAGER'
  | 'SERVICE_ADVISOR'
  | 'CASHIER'
  | 'TECHNICIAN';

export * from './auth';
export * from '@/features/catalog/types';
export * from '@/features/workshop/types';

export interface PosReceiptLine {
  id: string;
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
  discountRs: number;
  netTotalSalesRs: number;
  totalCostRs: number;
  grossProfitRs: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'SPLIT';
  amountTenderedRs: number;
  changeGivenRs: number;
  cashierName?: string;
}
