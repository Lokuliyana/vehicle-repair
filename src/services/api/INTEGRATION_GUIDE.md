# NestJS & PostgreSQL Integration Configuration Guide

## 1. Architectural Philosophy: Interface-Driven Repositories

The vehicle repair workshop frontend was engineered using the **Repository Pattern** and **Dependency Inversion Principle**. Every data access operation is mediated through clean, typed TypeScript interfaces:

- `ICatalogRepository` (`src/features/catalog/repository/catalog.repository.interface.ts`)
- `IWorkshopJobRepository` (`src/features/workshop/repository/workshop-job.repository.interface.ts`)
- `IPosSaleRepository` (`src/features/pos/repository/pos-sale.repository.interface.ts`)
- `IPosShiftRepository` (`src/features/pos/repository/pos-shift.repository.interface.ts`)
- `IFinanceRepository` (`src/features/finance-reports/repository/finance.repository.interface.ts`)
- `IAnalyticsRepository` (`src/features/finance-reports/repository/analytics.repository.interface.ts`)

### Why Swapping Requires Zero Component Changes
React UI components (such as `RepairSheetPage`, `WorkshopBoardPage`, `PosTerminalPage`, `ProfitLedgerPage`) depend strictly on the repository contracts rather than concrete storage mechanisms. Because the REST API adapters in `src/services/api/` implement the exact same TypeScript repository interfaces:

1. **Zero Component Refactoring**: All UI logic, state management, form submissions, and error handling remain 100% unchanged.
2. **Deterministic DTOs**: DTO interfaces match `.agent/INTEGRATION_CONTRACT.md` and NestJS controller parameter shapes.
3. **Seamless Toggle**: Swapping from LocalStorage mock to live NestJS backend is controlled via a single environment variable:
   ```env
   VITE_USE_API=true
   VITE_API_BASE_URL=https://api.yourworkshop.lk/api/v1
   ```

---

## 2. NestJS Endpoint Mapping & Contract Verification

| Module | Repository Method | HTTP Verb & Path | Request Body / Query | Expected Response DTO |
|---|---|---|---|---|
| **Catalog** | `getAll()` | `GET /api/v1/catalog` | - | `{ items: CatalogItemDto[], total: number }` |
| **Catalog** | `getById(id)` | `GET /api/v1/catalog/:id` | - | `CatalogItemDto` |
| **Catalog** | `getBySku(sku)` | `GET /api/v1/catalog/sku/:sku` | - | `CatalogItemDto` |
| **Catalog** | `create(dto)` | `POST /api/v1/catalog` | `CreateCatalogItemDto` | `CatalogItemDto` |
| **Catalog** | `update(id, dto)` | `PATCH /api/v1/catalog/:id` | `UpdateCatalogItemDto` | `CatalogItemDto` |
| **Catalog** | `adjustStock(id, qty)` | `POST /api/v1/catalog/:id/adjust-stock` | `{ deltaQty, reason }` | `CatalogItemDto` |
| **Workshop** | `getAll()` | `GET /api/v1/workshop/jobs` | - | `{ jobs: WorkshopJobSheetDto[], total: number }` |
| **Workshop** | `getById(id)` | `GET /api/v1/workshop/jobs/:id` | - | `WorkshopJobSheetDto` |
| **Workshop** | `create(dto)` | `POST /api/v1/workshop/jobs` | `CreateWorkshopJobSheetDto` | `WorkshopJobSheetDto` |
| **Workshop** | `update(id, dto)` | `PUT /api/v1/workshop/jobs/:id` | `UpdateWorkshopJobSheetDto` | `WorkshopJobSheetDto` |
| **Workshop** | `recordPayment(id, dto)` | `POST /api/v1/workshop/jobs/:id/payments` | `RecordPaymentDto` | `WorkshopJobSheetDto` |
| **POS** | `create(dto)` | `POST /api/v1/pos/sales` | `CreatePosSaleDto` | `PosSaleTransactionDto` |
| **POS** | `openShift(dto)` | `POST /api/v1/pos/shifts/open` | `{ cashierId, cashierName, openingFloatRs }` | `PosShiftDto` |
| **POS** | `closeShift(id, dto)` | `POST /api/v1/pos/shifts/:id/close` | `{ actualDrawerCashRs }` | `PosShiftDto` |
| **Finance** | `getProfitLedgerSummary()` | `GET /api/v1/finance/profit-ledger` | `?range=THIS_MONTH` | `ProfitLedgerSummaryDto` |
| **Finance** | `createExpense(dto)` | `POST /api/v1/finance/expenses` | `CreateShopExpenseDto` | `ShopExpenseDto` |
| **Analytics** | `getInsuranceAgingReport()` | `GET /api/v1/analytics/insurance-aging` | - | `InsuranceAgingReportData` |
| **Analytics** | `getSalesGrossProfitReport()` | `GET /api/v1/analytics/sales-profit` | `?range=THIS_MONTH` | `SalesGrossProfitReportData` |

---

## 3. Step-by-Step Transitioning to Production NestJS

### Step 1: Configure Environment Variables
Create `.env.production` or set system environment variables:
```env
VITE_USE_API=true
VITE_API_BASE_URL=https://api.yourworkshop.lk/api/v1
```

### Step 2: JWT Bearer Token Injection
The `ApiClient` class in `src/services/api/api-client.ts` automatically attaches the active JWT from `localStorage.getItem('antigravity_auth_token')`:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Example NestJS Controller Implementation
Below is an example of the NestJS controller that pairs directly with `WorkshopJobApiAdapter`:

```typescript
@Controller('api/v1/workshop/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkshopJobsController {
  constructor(private readonly jobsService: WorkshopJobsService) {}

  @Get()
  async findAll(@Query() filter: WorkshopJobFilterDto) {
    return this.jobsService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateWorkshopJobSheetDto, @Req() req: AuthenticatedRequest) {
    return this.jobsService.create(dto, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWorkshopJobSheetDto) {
    return this.jobsService.update(id, dto);
  }

  @Post(':id/payments')
  async recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.jobsService.recordPayment(id, dto);
  }
}
```

---

## 4. Cost Privacy Security Verification on Backend

The NestJS backend must enforce the exact same privacy invariant as the client UI:
1. `ClassSerializerInterceptor` or custom serializer stripping `buyingCostRs`, `grossProfitRs`, and `grossMarginPct` on public endpoints (`/quotation/print`, `/estimate/print`, `/invoices/print`).
2. Role-based DTO filtering (`@Roles('OWNER', 'WORKSHOP_MANAGER')`) preventing unauthorized transmission of margin data over the wire.
