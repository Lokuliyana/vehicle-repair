export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'SPLIT';


export interface PosCartLine {
  id: string;
  catalogItemId?: string;
  barcode?: string;
  sku?: string;
  description: string;
  category?: string;
  qty: number;
  unitSellingPriceRs: number;
  unitBuyingCostRs: number;
  lineDiscountRs: number;
  lineTotalSalesRs: number;
  lineTotalCostRs: number;
  lineGrossProfitRs: number;
}

export interface SplitPaymentDetails {
  cashAmountRs: number;
  cardAmountRs: number;
  bankTransferAmountRs: number;
  cashTenderedRs?: number;
  cashChangeRs?: number;
  cardReference?: string;
  transferReference?: string;
}

export interface PosSaleTransaction {
  id: string;
  receiptNumber: string; // POS-YYYY-XXXX (e.g. POS-2026-0001)
  shiftId: string;
  cashierName: string;
  cashierId?: string;
  date: string; // Formatted date e.g. "2026-11-02 10:15 AM" or ISO
  customerNote: string; // Default: 'Walk-in Counter Sale'
  items: PosCartLine[];
  subtotalSalesRs: number;
  subtotalRs?: number; // Alias for receipt compatibility
  overallDiscountRs: number;
  discountRs?: number; // Alias for receipt compatibility
  netSalesRs: number;
  netTotalSalesRs?: number; // Alias for receipt compatibility
  totalBuyingCostRs: number;
  grossProfitRs: number;
  grossMarginPct: number;
  paymentMethod: PaymentMethod;
  amountTenderedRs: number;
  changeGivenRs: number;
  splitDetails?: SplitPaymentDetails;
  createdAt: string;
}

export interface PosShiftDrawerEntry {
  id: string;
  shiftId: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amountRs: number;
  reason: string;
  timestamp: string;
  recordedBy: string;
}

export interface PosShift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startingCashRs: number; // For compatibility with existing tests
  openingFloatRs: number;
  totalCashSalesRs: number;
  totalCardSalesRs: number;
  totalBankTransferSalesRs: number;
  cashInRs: number;
  cashOutRs: number;
  expectedDrawerCashRs: number;
  actualDrawerCashRs?: number;
  varianceRs?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface CreatePosSaleDto {
  shiftId: string;
  cashierName: string;
  cashierId?: string;
  customerNote?: string;
  items: Array<{
    catalogItemId?: string;
    barcode?: string;
    sku?: string;
    description: string;
    category?: string;
    qty: number;
    unitSellingPriceRs: number;
    unitBuyingCostRs?: number;
    lineDiscountRs?: number;
  }>;
  overallDiscountRs?: number;
  paymentMethod: PaymentMethod;
  amountTenderedRs: number;
  splitDetails?: SplitPaymentDetails;
}

export interface PosSaleFilter {
  shiftId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
