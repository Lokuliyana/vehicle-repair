# NestJS & PostgreSQL Integration Contract (INTEGRATION_CONTRACT.md)

## 1. REST API Endpoints

### 1.1 Parts & Labor Catalog (`/api/v1/catalog`)
- `GET /api/v1/catalog?q=&type=` — Search presets, parts, and lubricants by name, SKU, or barcode.
- `POST /api/v1/catalog` — Create a new catalog item/preset with Selling Price and Buying Cost.
- `PATCH /api/v1/catalog/:id` — Update pricing or stock quantity.

### 1.2 Workshop Sheets (`/api/v1/workshop/jobs`)
- `GET /api/v1/workshop/jobs?q=&stage=&floorStatus=` — Paginated job list searchable by Vehicle Number, Job Number, Insurance Name, or Customer Info.
- `GET /api/v1/workshop/jobs/vehicle-lookup/:vehicleNumber` — Returns the most recent header metadata for a vehicle plate to support one-click auto-fill.
- `POST /api/v1/workshop/jobs` — Create a new Quotation or Estimate with manual header and 3-section line items.
- `PUT /api/v1/workshop/jobs/:id` — Update header, 3-section line items, buying costs, and split-billing figures.
- `PATCH /api/v1/workshop/jobs/:id/stage` — Transition stage (`QUOTATION | ESTIMATE | JOB_CARD | INVOICE`) and record audit log + snapshot.
- `POST /api/v1/workshop/jobs/:id/payments` — Record advance payment, customer excess payment, or insurance cheque settlement.

### 1.3 Counter POS (`/api/v1/pos`)
- `POST /api/v1/pos/sales` — Complete a walk-in POS sale, deduct stock for tracked parts, and record sales revenue, buying cost, and gross profit.
- `GET /api/v1/pos/sales` — List POS receipts by date/shift.
- `POST /api/v1/pos/shifts/open` & `POST /api/v1/pos/shifts/close` — Manage cashier shift float and cash reconciliation.

### 1.4 Embedded Finance & Profit Reports (`/api/v1/reports`)
- `GET /api/v1/reports/profit-summary?from=&to=` — Returns aggregated Workshop Sales, POS Sales, Total Buying/Sublet Cost, Gross Profit, Margin %, Shop Expenses, and Net Profit.
- `GET /api/v1/reports/receivables-aging` — Returns unpaid/partially paid Workshop Invoices grouped by Insurance Company and Customer.
- `POST /api/v1/reports/expenses` — Record a daily shop operating expense.