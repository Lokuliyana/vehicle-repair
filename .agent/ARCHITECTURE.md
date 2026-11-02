# System Architecture & Directory Structure (ARCHITECTURE.md)

## 1. Technical Stack
- **Framework:** React 18 / 19 with Vite + TypeScript
- **Styling & Components:** Tailwind CSS, shadcn/ui pattern primitives, Lucide React icons
- **Form Management & Validation:** React Hook Form, Zod
- **Routing:** React Router v6
- **Date & Math:** `date-fns`, custom precision currency math utilities
- **Backend Ready:** NestJS + PostgreSQL REST API contracts and DTOs

## 2. Source Tree Layout
```text
src/
├── app/
│   ├── router.tsx                         # Centralized application routes
│   ├── layout/
│   │   ├── AppShell.tsx                   # Main layout: Sidebar, Header, Quick Action bar
│   │   ├── Sidebar.tsx                    # Primary module navigation
│   │   └── Header.tsx                     # Active user role switcher, shift status, search
│   └── providers/
│       ├── AuthProvider.tsx               # Current active role, permissions, margin visibility
│       ├── ToastProvider.tsx              # Application toast notifications
│       └── ShiftProvider.tsx              # Active POS register shift context
├── features/
│   ├── catalog/                           # Shared Parts & Labor Catalog
│   │   ├── types.ts                       # CatalogItem, CatalogFilter, StockAlert
│   │   ├── schema.ts                      # Zod validation schemas
│   │   ├── repository/
│   │   │   ├── catalog.repository.interface.ts
│   │   │   └── catalog.repository.mock.ts
│   │   ├── components/
│   │   │   ├── CatalogItemCombobox.tsx    # Fast search & pick in Repair Sheets
│   │   │   ├── CatalogItemDialog.tsx      # Create/edit part or labor preset
│   │   │   └── LowStockAlertBadge.tsx
│   │   └── pages/
│   │       └── CatalogPage.tsx            # Searchable, filterable parts & labor list
│   ├── workshop/                          # Unified Repair Sheet & Floor Board
│   │   ├── types.ts                       # WorkshopJobSheet, LineItem, DocumentStage, etc.
│   │   ├── schema.ts                      # Header & line item validation
│   │   ├── repository/
│   │   │   ├── workshop.repository.interface.ts
│   │   │   └── workshop.repository.mock.ts
│   │   ├── hooks/
│   │   │   ├── useSheetMath.ts            # Subtotals, Gross Profit, Split Billing math
│   │   │   └── useVehicleLookup.ts        # Instant plate history auto-fill hook
│   │   ├── components/
│   │   │   ├── SheetHeaderGrid.tsx        # Exact 12-field manual intake grid
│   │   │   ├── StageActionToolbar.tsx     # Stage conversion buttons & audit logs
│   │   │   ├── RepairLineTable.tsx        # High-speed table for 1 category with Enter-to-add
│   │   │   ├── MarginSummaryBar.tsx       # Live selling total, cost, profit, margin %
│   │   │   ├── SplitBillingCard.tsx       # Insurance Approved vs Customer Excess
│   │   │   ├── PaymentCollectionModal.tsx # Advance, excess, or final payment capture
│   │   │   ├── A4PrintLayout.tsx          # Pixel-perfect A4 invoice/estimate print
│   │   │   └── JobCardPrintLayout.tsx     # Price-redacted floor sheet print
│   │   └── pages/
│   │       ├── RepairSheetPage.tsx        # Active sheet editor (/workshop/sheet/:id)
│   │       ├── WorkshopBoardPage.tsx      # Floor status Kanban (/workshop/board)
│   │       └── JobHistoryPage.tsx         # Searchable repair history (/workshop/jobs)
│   ├── pos/                               # Walk-in Counter / Showroom POS
│   │   ├── types.ts                       # PosSaleTransaction, PosCartLine, PosShift
│   │   ├── schema.ts                      # Tender validation, shift float schema
│   │   ├── repository/
│   │   │   ├── pos.repository.interface.ts
│   │   │   └── pos.repository.mock.ts
│   │   ├── hooks/
│   │   │   └── usePosCart.ts              # Cart items, discount, cost, profit, tender math
│   │   ├── components/
│   │   │   ├── PosBarcodeScannerInput.tsx # Barcode listener & instant catalog match
│   │   │   ├── PosProductCatalogGrid.tsx  # Quick category & item grid
│   │   │   ├── PosCartTable.tsx           # Cart lines, qty adjustments, line discounts
│   │   │   ├── PosPaymentModal.tsx        # Cash, Card, Bank Transfer, Split modal
│   │   │   ├── ShiftDrawerModal.tsx       # Open/Close float, cash in/out modal
│   │   │   └── ThermalReceiptLayout.tsx   # 80mm thermal receipt container
│   │   └── pages/
│   │       ├── PosTerminalPage.tsx        # Counter POS screen (/pos)
│   │       └── PosHistoryPage.tsx         # Daily POS sales receipts (/pos/history)
│   └── finance-reports/                   # Embedded Profit Ledger & Dashboards
│       ├── types.ts                       # ProfitSummary, DailyExpense, ReceivablesAging
│       ├── repository/
│       │   ├── finance.repository.interface.ts
│       │   └── finance.repository.mock.ts
│       ├── components/
│       │   ├── DailyExpenseModal.tsx      # Fast shop expense entry
│       │   └── ProfitKpiCards.tsx         # Revenue, Parts Cost, Labor, Gross Profit, Net
│       └── pages/
│           ├── ProfitLedgerPage.tsx       # Combined sales/cost ledger (/finance/profit-ledger)
│           ├── InsuranceAgingPage.tsx     # Unpaid insurance claims (/finance/receivables)
│           └── AnalyticsDashboardPage.tsx # Turnaround, parts velocity (/reports)
└── shared/
    ├── components/
    │   ├── ui/                            # shadcn/ui atoms (button, input, dialog, table...)
    │   ├── PrintContainer.tsx             # Dedicated print wrapper handling @media print
    │   └── PermissionGate.tsx             # Role-based element guard
    ├── utils/
    │   ├── currency.ts                    # Rs. formatting & safe two-decimal arithmetic
    │   ├── whatsapp.ts                    # Dynamic WhatsApp share URL generator
    │   └── date.ts                        # Date formatting utilities
    └── types/
        └── common.ts                      # Pagination, Result, AuditLog, UserRole
```

## 3. Data Flow & Integration Readiness
1. **Mock Repositories:** Implemented with LocalStorage persistence, seed data from real workshop scenarios, and full async API emulation (`Promise<T>`).
2. **REST Contract Parity:** All Repository methods accept and return DTOs designed 1-to-1 for NestJS controllers and Prisma entities.
3. **No Direct State Bleed:** Pages interact only with repositories via custom hooks; changing from mock to NestJS requires switching only the provider implementation.
