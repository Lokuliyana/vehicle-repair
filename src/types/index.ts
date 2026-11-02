export type DocumentStage =
  | 'QUOTATION'
  | 'ESTIMATE'
  | 'JOB_CARD'
  | 'INVOICE'
  | 'CANCELLED';

export type RepairLineCategory =
  | 'LABOR_REMOVE_REASSEMBLE'
  | 'LABOR_REPAIR'
  | 'REPLACEMENT';

export type WorkshopFloorStatus =
  | 'DRAFT'
  | 'PENDING_INSURANCE_APPROVAL'
  | 'APPROVED_IN_PROGRESS'
  | 'WAITING_FOR_PARTS'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'COMPLETED_DELIVERED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'VOID';

export type UserRole =
  | 'OWNER'
  | 'WORKSHOP_MANAGER'
  | 'SERVICE_ADVISOR'
  | 'CASHIER'
  | 'TECHNICIAN';

export * from './auth';

export interface WorkshopHeaderMetadata {
  date: string;
  jobNumber: string;
  vehicleNumber: string;
  natureOfRepair: string;
  vehicleMake: string;
  chassisNumber: string;
  vehicleModel: string;
  daysForCompletion: string;
  yearOfMake: string;
  vehicleColor: string;
  insuranceName: string;
  customerInfo: string;
}

export interface WorkshopLineItem {
  id: string;
  rowNo: number;
  category: RepairLineCategory;
  catalogItemId?: string;
  description: string;
  sellingPriceRs: number;
  buyingCostRs: number;
  assignedTechnician?: string;
  isCompleted: boolean;
}

export interface WorkshopFinancialSummary {
  subtotalRemoveReassembleRs: number;
  subtotalRepairRs: number;
  subtotalReplacementRs: number;
  discountRs: number;
  taxRs: number;
  grandTotalSalesRs: number;
  totalBuyingCostRs: number;
  grossProfitRs: number;
  grossMarginPct: number;
  insuranceApprovedRs: number;
  customerPayableRs: number;
  advancePaidRs: number;
  balanceDueRs: number;
}

export interface WorkshopJobSheet {
  id: string;
  jobNumber: string;
  docStage: DocumentStage;
  floorStatus: WorkshopFloorStatus;
  paymentStatus: PaymentStatus;
  header: WorkshopHeaderMetadata;
  lines: WorkshopLineItem[];
  financials: WorkshopFinancialSummary;
  originalEstimateSnapshot?: string;
  createdAt: string;
  updatedAt: string;
}

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
