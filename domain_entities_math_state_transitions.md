# Domain Model, Embedded Profit Math & State Machines (DOMAIN_MODEL.md)

## 1. Core Enumerations
```typescript
export type DocumentStage = 'QUOTATION' | 'ESTIMATE' | 'JOB_CARD' | 'INVOICE' | 'CANCELLED';

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

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
```

## 2. Core Entities

### 2.1 `CatalogItem` (Shared by Workshop & POS)
- `id`: string
- `sku`: string
- `barcode`: string (optional, indexed for POS scanner)
- `itemType`: `'SPAREPART' | 'LUBRICANT' | 'LABOR_REMOVE_REASSEMBLE' | 'LABOR_REPAIR'`
- `description`: string
- `buyingCostRs`: number (Internal cost price)
- `sellingPriceRs`: number (Default customer rate)
- `stockQty`: number (Tracked for POS parts/lubricants)
- `isActive`: boolean

### 2.2 `WorkshopJobSheet`
- `id`: string
- `jobNumber`: string (e.g., `JOB-2026-0001`)
- `docStage`: `DocumentStage`
- `floorStatus`: `WorkshopFloorStatus`
- `paymentStatus`: `PaymentStatus`
- **Header Metadata (Manual Entry):**
  - `date`: string (ISO date)
  - `vehicleNumber`: string
  - `natureOfRepair`: string
  - `vehicleMake`: string
  - `chassisNumber`: string
  - `vehicleModel`: string
  - `daysForCompletion`: string
  - `yearOfMake`: string
  - `vehicleColor`: string
  - `insuranceName`: string
  - `customerInfo`: string
- **Line Items (`lines: WorkshopLineItem[]`):**
  - `id`: string
  - `rowNo`: number (1..N per category)
  - `category`: `RepairLineCategory`
  - `catalogItemId`?: string
  - `description`: string
  - `sellingPriceRs`: number (`Amount (Rs.)` shown to customer/insurance)
  - `buyingCostRs`: number (Internal part cost or direct sublet/mechanic cost)
  - `assignedTechnician`?: string
  - `isCompleted`: boolean
- **Embedded Financial Summary:**
  - `subtotalRemoveReassembleRs`: number
  - `subtotalRepairRs`: number
  - `subtotalReplacementRs`: number
  - `discountRs`: number
  - `taxRs`: number
  - `grandTotalSalesRs`: number
  - `totalBuyingCostRs`: number
  - `grossProfitRs`: number (`grandTotalSalesRs - taxRs - totalBuyingCostRs`)
  - `grossMarginPct`: number
  - `insuranceApprovedRs`: number
  - `customerPayableRs`: number
  - `advancePaidRs`: number
  - `balanceDueRs`: number
- `originalEstimateSnapshot`?: string (JSON snapshot locked when converting Estimate -> Job Card)

### 2.3 `PosSaleTransaction`
- `id`: string
- `receiptNumber`: string (e.g., `POS-2026-0001`)
- `date`: string
- `customerNote`: string (Default: `"Walk-in Counter Sale"`, optional Vehicle No / Phone)
- `items: PosCartLine[]` (`description`, `qty`, `unitSellingPriceRs`, `unitBuyingCostRs`, `lineDiscountRs`, `lineTotalSalesRs`, `lineTotalCostRs`, `lineGrossProfitRs`)
- `subtotalRs`: number
- `discountRs`: number
- `netTotalSalesRs`: number
- `totalCostRs`: number
- `grossProfitRs`: number
- `paymentMethod`: `'CASH' | 'CARD' | 'BANK_TRANSFER' | 'SPLIT'`
- `amountTenderedRs`: number
- `changeGivenRs`: number

### 2.4 `ShopOperatingExpense`
- `id`: string
- `date`: string
- `category`: `'SUBLET_WORK' | 'CONSUMABLES_PAINT' | 'UTILITIES_RENT' | 'TEA_ALLOWANCE' | 'OTHER'`
- `description`: string
- `amountRs`: number
- `paidFrom`: `'POS_DRAWER' | 'MAIN_CASH_BANK'`

## 3. Master Financial Equations
1. **Workshop Gross Profit:**
   `WorkshopGrossProfit = (subtotalRemoveReassembleRs + subtotalRepairRs + subtotalReplacementRs - discountRs) - sum(line.buyingCostRs)`
2. **POS Gross Profit:**
   `PosGrossProfit = sum(item.lineTotalSalesRs) - discountRs - sum(item.lineTotalCostRs)`
3. **Combined Shop Gross Profit (Period):**
   `TotalGrossProfit = sum(InvoicedWorkshopGrossProfit) + sum(CompletedPosGrossProfit)`
4. **Net Operating Profit (Period):**
   `NetShopProfit = TotalGrossProfit - sum(ShopOperatingExpense.amountRs)`