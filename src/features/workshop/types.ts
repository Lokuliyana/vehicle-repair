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
  | 'REFUNDED_VOID'
  | 'VOID';

export type WorkshopPaymentType =
  | 'ADVANCE'
  | 'CUSTOMER_EXCESS'
  | 'INSURANCE_SETTLEMENT'
  | 'FULL_PAYMENT';

export type WorkshopPaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'CHEQUE';

export interface WorkshopPaymentRecord {
  id: string;
  receiptNumber: string;
  date: string;
  amountRs: number;
  paymentType: WorkshopPaymentType;
  paymentMethod: WorkshopPaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  balanceAfterRs: number;
  createdAt: string;
}

export interface RecordPaymentDto {
  amountRs: number;
  paymentType: WorkshopPaymentType;
  paymentMethod: WorkshopPaymentMethod;
  referenceNumber?: string;
  notes?: string;
  date?: string;
  recordedBy?: string;
}

export interface VehicleHistoricalRecord {
  vehicleNumber: string; // e.g. 'WP CBA-1234'
  vehicleMake: string;
  vehicleModel: string;
  yearOfMake: string;
  vehicleColor: string;
  chassisNumber: string;
  insuranceName: string;
  customerInfo: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  lastJobNumber?: string;
  lastServiceDate?: string;
}

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
  isSupplementary?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'STAGE_CONVERSION' | 'STATUS_ADVANCEMENT' | 'TASK_COMPLETION' | 'LINE_ITEM_ADDED' | string;
  fromState?: string;
  toState?: string;
  comment?: string;
}

export interface OriginalEstimateSnapshotData {
  lines: WorkshopLineItem[];
  financials: WorkshopFinancialSummary;
  grandTotalSalesRs: number;
  subtotalRemoveReassembleRs: number;
  subtotalRepairRs: number;
  subtotalReplacementRs: number;
  discountRs: number;
  taxRs: number;
  frozenAt: string;
  stage: DocumentStage;
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
  payments?: WorkshopPaymentRecord[];
  auditLogs?: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkshopJobSheetDto {
  jobNumber?: string;
  docStage?: DocumentStage;
  floorStatus?: WorkshopFloorStatus;
  paymentStatus?: PaymentStatus;
  header: WorkshopHeaderMetadata;
  lines: WorkshopLineItem[];
  discountRs?: number;
  taxRs?: number;
  insuranceApprovedRs?: number;
  advancePaidRs?: number;
  originalEstimateSnapshot?: string;
  payments?: WorkshopPaymentRecord[];
  auditLogs?: AuditLogEntry[];
}

export interface UpdateWorkshopJobSheetDto {
  jobNumber?: string;
  docStage?: DocumentStage;
  floorStatus?: WorkshopFloorStatus;
  paymentStatus?: PaymentStatus;
  header?: Partial<WorkshopHeaderMetadata>;
  lines?: WorkshopLineItem[];
  discountRs?: number;
  taxRs?: number;
  insuranceApprovedRs?: number;
  advancePaidRs?: number;
  originalEstimateSnapshot?: string;
  payments?: WorkshopPaymentRecord[];
  auditLogs?: AuditLogEntry[];
}

export interface WorkshopJobFilter {
  search?: string;
  stage?: DocumentStage | 'ALL';
  status?: WorkshopFloorStatus | 'ALL';
  vehicleNumber?: string;
}
