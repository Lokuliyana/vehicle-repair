# NestJS & PostgreSQL Integration Contracts (INTEGRATION_CONTRACT.md)

## 1. Overview
The frontend data layer uses typed repository interfaces (`*Repository`). Mock implementations store data in reactive LocalStorage. When transitioning to the NestJS backend, swapping the mock repository for an `Axios` / `Fetch` implementation requires zero component changes.

## 2. API Endpoints Specification

### 2.1 Catalog Endpoints (`/api/v1/catalog`)
- `GET /api/v1/catalog`
  - Query: `search?: string`, `itemType?: string`, `page?: number`, `limit?: number`
  - Returns: `{ items: CatalogItemDto[], total: number }`
- `POST /api/v1/catalog`
  - Body: `CreateCatalogItemDto`
  - Returns: `CatalogItemDto`
- `PATCH /api/v1/catalog/:id`
  - Body: `UpdateCatalogItemDto`
  - Returns: `CatalogItemDto`

### 2.2 Workshop Job Sheets (`/api/v1/workshop/jobs`)
- `GET /api/v1/workshop/jobs`
  - Query: `search?: string`, `stage?: DocumentStage`, `floorStatus?: WorkshopFloorStatus`, `vehicleNumber?: string`
  - Returns: `{ jobs: WorkshopJobSheetDto[], total: number }`
- `GET /api/v1/workshop/jobs/:id`
  - Returns: `WorkshopJobSheetDto`
- `GET /api/v1/workshop/jobs/lookup/:vehicleNumber`
  - Returns: `LatestVehicleHistoryDto | null` (last known specs & customer data)
- `POST /api/v1/workshop/jobs`
  - Body: `CreateWorkshopJobDto`
  - Returns: `WorkshopJobSheetDto`
- `PUT /api/v1/workshop/jobs/:id`
  - Body: `UpdateWorkshopJobDto`
  - Returns: `WorkshopJobSheetDto`
- `POST /api/v1/workshop/jobs/:id/convert-stage`
  - Body: `{ targetStage: DocumentStage, reason?: string }`
  - Returns: `WorkshopJobSheetDto`
- `POST /api/v1/workshop/jobs/:id/payments`
  - Body: `RecordPaymentDto`
  - Returns: `WorkshopJobSheetDto`

### 2.3 Counter POS (`/api/v1/pos`)
- `POST /api/v1/pos/sales`
  - Body: `CreatePosSaleDto`
  - Returns: `PosSaleTransactionDto`
- `GET /api/v1/pos/sales`
  - Query: `shiftId?: string`, `date?: string`
  - Returns: `{ sales: PosSaleTransactionDto[], total: number }`
- `POST /api/v1/pos/shifts/open`
  - Body: `{ cashierId: string, openingFloatRs: number }`
  - Returns: `PosShiftDto`
- `POST /api/v1/pos/shifts/:id/close`
  - Body: `{ actualDrawerCashRs: number, note?: string }`
  - Returns: `PosShiftDto`

### 2.4 Finance & Reports (`/api/v1/finance`)
- `GET /api/v1/finance/profit-ledger`
  - Query: `startDate: string`, `endDate: string`
  - Returns: `ProfitLedgerSummaryDto`
- `POST /api/v1/finance/expenses`
  - Body: `CreateShopExpenseDto`
  - Returns: `ShopExpenseDto`
- `GET /api/v1/finance/receivables-aging`
  - Returns: `ReceivablesAgingDto[]`
