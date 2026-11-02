# System Architecture & Directory Structure (ARCHITECTURE.md)

## 1. Tech Stack
- **Frontend:** React 18+, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form, Zod.
- **State & Data Access:** Custom hooks wrapping typed Repository Services (in-memory/LocalStorage stateful mock adapter for dev; REST adapter for NestJS).
- **Backend Target:** NestJS + PostgreSQL (Prisma/TypeORM).

## 2. Feature-Oriented Folder Structure
```text
src/
├── app/
│   ├── router.tsx                     # Centralized route definitions
│   ├── layout/AppShell.tsx            # Sidebar, Topbar, Quick-Actions (+ Sheet, POS)
│   └── providers/AuthProvider.tsx     # Role switching & Margin Privacy permission context
├── features/
│   ├── catalog/                       # Shared Parts, Lubricants & Labor Presets
│   │   ├── catalog.types.ts
│   │   ├── catalog.repository.ts
│   │   ├── components/CatalogCombobox.tsx
│   │   └── pages/CatalogListPage.tsx
│   ├── workshop/                      # Quotation, Estimate, Job Card & Invoice Engine
│   │   ├── workshop.types.ts
│   │   ├── workshop.repository.ts
│   │   ├── hooks/useSheetMath.ts
│   │   ├── components/
│   │   │   ├── SheetHeaderGrid.tsx    # 12-field vehicle/insurance/customer manual form
│   │   │   ├── StageActionToolbar.tsx # Quotation -> Estimate -> Job Card -> Invoice
│   │   │   ├── ThreeSectionTables.tsx # Remove & Reassemble, Repair, Replacement
│   │   │   ├── SplitBillingCard.tsx   # Insurance vs. Customer Excess calculator
│   │   │   └── A4WorkshopPrint.tsx    # Exact template printout with zero cost leakage
│   │   └── pages/
│   │       ├── RepairSheetPage.tsx
│   │       ├── JobHistoryPage.tsx
│   │       └── WorkshopBoardPage.tsx
│   ├── pos/                           # Counter / Showroom Spare Parts & Quick Service POS
│   │   ├── pos.types.ts
│   │   ├── pos.repository.ts
│   │   ├── components/
│   │   │   ├── PosProductGrid.tsx
│   │   │   ├── PosCartSidebar.tsx
│   │   │   ├── PosPaymentModal.tsx
│   │   │   ├── ShiftDrawerModal.tsx
│   │   │   └── ThermalReceiptPrint.tsx
│   │   └── pages/PosTerminalPage.tsx
│   └── finance-reports/               # Embedded Sales, Cost, Expense & Gross Profit
│       ├── profit.types.ts
│       ├── profit.repository.ts
│       └── pages/
│           ├── ProfitLedgerPage.tsx   # Unified Sales, Cost, Expenses & Gross Profit
│           └── InsuranceAgingPage.tsx # Pending insurance & customer balances
└── shared/
    ├── utils/currency.ts              # Fixed Rs. formatting & cent-safe arithmetic
    └── utils/whatsapp.ts              # WhatsApp web/mobile share link generator
```