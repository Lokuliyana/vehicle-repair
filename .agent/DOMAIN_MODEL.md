# Domain Model, Embedded Profit Math & State Transitions (DOMAIN_MODEL.md)

## 1. Domain Enumerations

```typescript
export type DocumentStage =
  | 'QUOTATION'
  | 'ESTIMATE'
  | 'JOB_CARD'
  | 'INVOICE'
  | 'CANCELLED';

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
  | 'REFUNDED_VOID';

export type RepairLineCategory =
  | 'LABOR_REMOVE_REASSEMBLE'
  | 'LABOR_REPAIR'
  | 'REPLACEMENT';

export type CatalogItemType =
  | 'SPAREPART'
  | 'LUBRICANT'
  | 'LABOR_REMOVE_REASSEMBLE'
  | 'LABOR_REPAIR';

export type UserRole =
  | 'OWNER'
  | 'WORKSHOP_MANAGER'
  | 'SERVICE_ADVISOR'
  | 'CASHIER'
  | 'TECHNICIAN';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'SPLIT';
```

## 2. Core Entities

### 2.1 `CatalogItem` (Shared Master)
```typescript
export interface CatalogItem {
  id: string;
  sku: string;
  barcode?: string;
  itemType: CatalogItemType;
  name: string;
  category: string;
  vehicleCompatibility?: string;
  uom: string; // e.g., 'pcs', 'liters', 'sets', 'hours'
  buyingCostRs: number; // Internal buying cost
  sellingPriceRs: number; // Customer price
  defaultDiscountPct: number;
  stockQty: number; // For tracked parts / lubricants
  lowStockAlertLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 `WorkshopLineItem`
```typescript
export interface WorkshopLineItem {
  id: string;
  category: RepairLineCategory;
  rowNo: number; // 1..N within category
  catalogItemId?: string;
  description: string;
  sellingPriceRs: number; // Customer / Insurance visible
  buyingCostRs: number; // Internal buying/sublet cost (Hidden)
  isCompleted: boolean; // Floor status checkbox
  assignedTechnician?: string; // Optional floor assignment
  notes?: string;
}
```

### 2.3 `WorkshopJobSheet`
```typescript
export interface WorkshopJobSheet {
  id: string;
  jobNumber: string; // Auto-generated: JOB-YYYY-XXXX
  docStage: DocumentStage;
  floorStatus: WorkshopFloorStatus;
  paymentStatus: PaymentStatus;

  // Exact 12-field manual header
  date: string; // YYYY-MM-DD
  vehicleNumber: string; // e.g. CBA-1234
  natureOfRepair: string; // Accident, Mechanical, etc.
  vehicleMake: string;
  chassisNumber: string;
  vehicleModel: string;
  daysForCompletion: string;
  yearOfMake: string;
  vehicleColor: string;
  insuranceName: string;
  customerInfo: string; // Name, Phone, Address

  // 3-Section Line Items
  lines: WorkshopLineItem[];

  // Embedded Financial Summary
  subtotalRemoveReassembleRs: number;
  subtotalRepairRs: number;
  subtotalReplacementRs: number;
  discountRs: number;
  taxRs: number;
  grandTotalSalesRs: number;

  // Embedded Internal Financials (Owner / Manager only)
  totalBuyingCostRs: number;
  grossProfitRs: number;
  grossMarginPct: number;

  // Insurance & Collections Split
  insuranceApprovedRs: number;
  customerPayableRs: number;
  advancePaidRs: number;
  balanceDueRs: number;

  // Snapshots & Auditing
  originalEstimateSnapshot?: string; // Frozen JSON when converted to Job Card
  auditLogs: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  fromState?: string;
  toState?: string;
  comment?: string;
}
```

### 2.4 `PosSaleTransaction` & `PosCartLine`
```typescript
export interface PosCartLine {
  id: string;
  catalogItemId?: string;
  barcode?: string;
  description: string;
  qty: number;
  unitSellingPriceRs: number;
  unitBuyingCostRs: number;
  lineDiscountRs: number;
  lineTotalSalesRs: number;
  lineTotalCostRs: number;
  lineGrossProfitRs: number;
}

export interface PosSaleTransaction {
  id: string;
  receiptNumber: string; // POS-YYYY-XXXX
  shiftId: string;
  cashierName: string;
  date: string; // ISO
  customerNote: string; // Default: 'Walk-in Counter Sale'
  items: PosCartLine[];
  subtotalSalesRs: number;
  overallDiscountRs: number;
  netSalesRs: number;
  totalBuyingCostRs: number;
  grossProfitRs: number;
  grossMarginPct: number;
  paymentMethod: PaymentMethod;
  amountTenderedRs: number;
  changeGivenRs: number;
  createdAt: string;
}
```

### 2.5 `PosShift` & `ShopExpense`
```typescript
export interface PosShift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
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

export interface ShopExpense {
  id: string;
  date: string;
  category: 'RENT' | 'ELECTRICITY_UTILITIES' | 'CONSUMABLES_PAINT' | 'SUBLET_BILLS' | 'TEA_ALLOWANCE' | 'OTHER';
  description: string;
  amountRs: number;
  paidFrom: 'POS_DRAWER' | 'MAIN_CASH';
  recordedBy: string;
  createdAt: string;
}
```

## 3. Mathematical Formulas

### 3.1 Workshop Sheet Math
```typescript
subtotalRemoveReassembleRs = sum(lines.filter(l => l.category === 'LABOR_REMOVE_REASSEMBLE').map(l => l.sellingPriceRs));
subtotalRepairRs           = sum(lines.filter(l => l.category === 'LABOR_REPAIR').map(l => l.sellingPriceRs));
subtotalReplacementRs      = sum(lines.filter(l => l.category === 'REPLACEMENT').map(l => l.sellingPriceRs));

grossSalesRs = subtotalRemoveReassembleRs + subtotalRepairRs + subtotalReplacementRs;
netSalesRs   = grossSalesRs - discountRs;
grandTotalSalesRs = netSalesRs + taxRs;

totalBuyingCostRs = sum(lines.map(l => l.buyingCostRs));
grossProfitRs     = netSalesRs - totalBuyingCostRs;
grossMarginPct    = netSalesRs > 0 ? (grossProfitRs / netSalesRs) * 100 : 0;

customerPayableRs = grandTotalSalesRs - insuranceApprovedRs;
balanceDueRs      = customerPayableRs - advancePaidRs;
```

### 3.2 POS Sale Math
```typescript
lineTotalSalesRs  = (qty * unitSellingPriceRs) - lineDiscountRs;
lineTotalCostRs   = qty * unitBuyingCostRs;
lineGrossProfitRs = lineTotalSalesRs - lineTotalCostRs;

netSalesRs        = sum(items.map(i => i.lineTotalSalesRs)) - overallDiscountRs;
totalBuyingCostRs = sum(items.map(i => i.lineTotalCostRs));
grossProfitRs     = netSalesRs - totalBuyingCostRs;
changeGivenRs     = max(0, amountTenderedRs - netSalesRs);
```

### 3.3 Unified Shop Financial Math
```typescript
combinedSalesRs      = sum(InvoicedWorkshopJobs.netSalesRs) + sum(PosSales.netSalesRs);
combinedDirectCostRs = sum(InvoicedWorkshopJobs.totalBuyingCostRs) + sum(PosSales.totalBuyingCostRs);
combinedGrossProfit  = combinedSalesRs - combinedDirectCostRs;
combinedExpensesRs   = sum(ShopExpenses.amountRs);
netOperatingProfitRs = combinedGrossProfit - combinedExpensesRs;
```
