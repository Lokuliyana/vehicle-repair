# Phase 0: Codebase UI Audit & CSS Reset Foundation Report
## 500 Labs — Antigravity Workshop & POS Master System

---

## 1. Governance Alignment & File Location Verification
All core governance files are organized under `.agent/`:
- `.agent/AGENT.md`: Lead Engineer Operating Instructions, 10 Non-Negotiable Principles, and Sub-Agent Delegation Model.
- `.agent/WORKFLOW.md`: 11-Phase Sequence (Phases 0–10) with mandatory step-by-step gate checklists.
- `.agent/UI_GUIDELINES.md`: Visual laws, Chalk & Porcelain layering mechanics, corner radii concentricity, tabular numeral rules, A4 workshop print specs, and 80mm thermal receipt specs.
- `.agent/RULES.md`: Non-negotiable domain & engineering invariants (3-section sheet, 12-field header, cost privacy).
- `.agent/ARCHITECTURE.md`: Feature-sliced frontend folder structure, state models, and NestJS repository contracts.
- `.agent/DOMAIN_MODEL.md`: Full TypeScript domain contracts, financial formulas, and stage transition state machines.
- `.agent/REQUIREMENTS_MATRIX.md`: Field-by-field traceability linking official Word templates to frontend schemas.
- `.agent/INTEGRATION_CONTRACT.md`: NestJS/PostgreSQL DTO endpoints and database schemas.
- `.agent/TESTING_STRATEGY.md`: Test suite architecture across unit, privacy leak, print DOM, and regression testing.

---

## 2. Codebase UI Audit: Screen, Dialog, Table & Print Inventory

### 2.1 Route Screens (11 Screens)
| Route | Component | File Path | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `RoleDashboardPage` | `src/features/dashboard/pages/RoleDashboardPage.tsx` | Executive & operational KPI overview with role perspective tailoring |
| `/workshop/jobs` | `WorkshopJobsPage` | `src/features/workshop/pages/WorkshopJobsPage.tsx` | Master repair job sheet ledger with stage filtering and instant search |
| `/workshop/board` | `WorkshopBoardPage` | `src/features/workshop/pages/WorkshopBoardPage.tsx` | Interactive workshop Kanban floor board by bay & operational stage |
| `/workshop/sheet` | `RepairSheetPage` | `src/features/workshop/pages/RepairSheetPage.tsx` | Single-continuous-lifecycle 3-section repair document intake & editor |
| `/workshop/sheet/:id`| `RepairSheetPage` | `src/features/workshop/pages/RepairSheetPage.tsx` | Active repair sheet editor for existing Quotation/Estimate/JobCard/Invoice |
| `/workshop/sheet/demo`| `InteractiveBenchPage` | `src/features/workshop/pages/InteractiveBenchPage.tsx` | Interactive testing bench for 3-section table editing & live calculations |
| `/pos` | `PosTerminalPage` | `src/features/pos/pages/PosTerminalPage.tsx` | Fast-paced counter/walk-in POS terminal with split cart & barcode scanner |
| `/catalog` | `CatalogListPage` | `src/features/catalog/pages/CatalogListPage.tsx` | Parts, lubricants, and labor catalog management with stock indicators |
| `/finance/profit-ledger`| `ProfitLedgerPage` | `src/features/finance-reports/pages/ProfitLedgerPage.tsx` | Real-time direct cost, sales, expenses, and gross profit accounting ledger |
| `/reports` | `ReportsPage` | `src/features/finance-reports/pages/ReportsPage.tsx` | Comprehensive reports: Date-range profit, insurance aging, technician turnaround |
| `*` | `NotFoundPage` | `src/app/pages/NotFoundPage.tsx` | Porcelain 404 fallback page with return-home trigger |

### 2.2 Modal Dialogs & Sheets (11 Modals)
| Modal Name | File Path | Trigger / Context | Key Capabilities |
| :--- | :--- | :--- | :--- |
| `CatalogItemDialog` | `src/features/catalog/components/CatalogItemDialog.tsx` | New/Edit catalog item | SKU, barcode, buying cost, selling price, margin % calculation |
| `StockAdjustDialog` | `src/features/catalog/components/StockAdjustDialog.tsx` | Restock/adjust stock | Quick inventory increment/decrement with reason notes |
| `DailyExpenseModal` | `src/features/finance-reports/components/DailyExpenseModal.tsx`| Record expense | Workshop rent, electricity, consumables deduction from profit |
| `PosCustomItemModal` | `src/features/pos/components/PosCustomItemModal.tsx` | On-the-fly item in POS | Ad-hoc spare part addition with instant cost and price capture |
| `PosPaymentModal` | `src/features/pos/components/PosPaymentModal.tsx` | Tender POS sale | Cash, card, bank transfer, split-tender, change calculation |
| `PosReceiptModal` | `src/features/pos/components/PosReceiptModal.tsx` | POS completion | 80mm thermal receipt preview and direct printing trigger |
| `PosSalesHistoryModal` | `src/features/pos/components/PosSalesHistoryModal.tsx` | POS header | Audit trail of daily sales, receipt reprinting, voiding |
| `PosShiftDrawerModal` | `src/features/pos/components/PosShiftDrawerModal.tsx` | Shift open/close | Float entry, petty cash payouts, variance reconciliation |
| `PaymentCollectionModal`| `src/features/workshop/components/PaymentCollectionModal.tsx`| Invoice settlement | Insurance split settlement, advance deposit tracking, excess due |
| `Dialog` (Core Primitive)| `src/components/ui/dialog.tsx` | Global overlay primitive | Backdrop blur, escape-key dismissal, animated entry |
| `WizardStepperModal` | `src/design-system/components/overlays-modals.tsx` | Step-by-step intake | Multi-step workflow modal with stage progression |

### 2.3 Tables & Ledgers (10 High-Density Tables)
| Table View | File Path | Density & Structure | Features |
| :--- | :--- | :--- | :--- |
| `WorkshopTable` | `src/components/workshop/WorkshopTable.tsx` | 3 distinct sections (R&R, Repair, Replacement) | Keyboard `Enter` append, inline cell editing, Admin cost mode |
| `CatalogListPage` | `src/features/catalog/pages/CatalogListPage.tsx` | High-density 7-column table | Category filtering, margin sparkline, stock level badges |
| `WorkshopJobsPage` | `src/features/workshop/pages/WorkshopJobsPage.tsx` | High-density jobs list | Stage pill badges, quick stage transition actions, search |
| `ProfitLedgerPage` | `src/features/finance-reports/pages/ProfitLedgerPage.tsx` | Financial transaction ledger | Workshop invoices vs POS sales, margin %, direct costs |
| `DateRangeSalesProfitTab`| `src/features/finance-reports/components/DateRangeSalesProfitTab.tsx`| Grouped financial summary | Period comparison, revenue breakdown |
| `InsuranceAgingTab` | `src/features/finance-reports/components/InsuranceAgingTab.tsx`| Aging claims table | 0-15d, 16-30d, 30+d claim buckets, receivable amounts |
| `TechnicianVelocityTab` | `src/features/finance-reports/components/TechnicianVelocityTab.tsx`| Efficiency table | Mechanic task completion, hours, turnaround rate |
| `FastMovingPartsAlertsTab`| `src/features/finance-reports/components/FastMovingPartsAlertsTab.tsx`| Stock analytics table | Low stock warnings, consumption velocity |
| `PosTerminalPage` Cart | `src/features/pos/pages/PosTerminalPage.tsx` | Right-side cart table | Quantity stepper, discount allocation, inline line removal |
| `Table` (Core Primitive)| `src/components/ui/table.tsx` | Responsive semantic table wrapper | Clean borders, hover states, tabular numerals alignment |

### 2.4 Print Views (4 Dedicated Document Engines)
| Print Container | File Path | Media Query | Target Format | Privacy Redaction |
| :--- | :--- | :--- | :--- | :--- |
| `A4WorkshopPrint` | `src/components/print/A4WorkshopPrint.tsx` | `@media print` | A4 Portrait (210×297mm) | 100% cost/margin redacted; Job Card strips all prices |
| `ThermalReceiptPrint` | `src/components/print/ThermalReceiptPrint.tsx` | `@media print` | 80mm Continuous Monospace | High-contrast thermal POS receipt with tender & change breakdown |
| `WorkshopPaymentThermalReceipt`| `src/components/print/WorkshopPaymentThermalReceipt.tsx` | `@media print` | 80mm Thermal Receipt | Formal payment acknowledgement for advances and customer excess |
| `PrintAbstractions` Suite | `src/design-system/components/print-abstractions.tsx` | `@media print` | A4 & 80mm thermal components | `PrintDomPrivacySanitizer` deep cost-stripping filter |

---

## 3. CSS Reset & Global Style Purge Execution

1. **Vite Boilerplate Removal:**
   - Purged default `/vite.svg` icon link from `index.html`.
   - Purged default Vite style remnants.

2. **Chalk & Porcelain Color Foundation:**
   - Canvas background established at atmospheric cool chalk: `#F6F8FA` (`--bg-canvas`).
   - Cards and elevated surfaces established at crisp white: `#FFFFFF` (`--bg-surface-primary`).
   - Structural text and executive controls anchored at obsidian: `#0F172A` (`--brand-obsidian`).
   - Conversion focus actions aligned with terracotta/burnt coral: `#F95700` (`--brand-terracotta`, hover `#EA580C`).
   - Table headers aligned with warm sand: `#FFF7ED` (`--bg-table-header`).
   - Secret admin cost visibility tint aligned with soft emerald: `#F0FDF4` (`--admin-profit-tint`).

3. **Typography & Tabular Numerals:**
   - Added preconnect links and imported `Plus Jakarta Sans` (weights 300..800) and `JetBrains Mono` (weights 400..700).
   - Enforced `tabular-nums` (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum"`) across monetary and numeric elements.
   - Configured font smoothing (`-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility`).

4. **Scrollbar Purge & Reset:**
   - Purged wide, harsh browser scrollbars.
   - Implemented ultra-thin 6px translucent thumb (`rgba(15, 23, 42, 0.12)`) with rounded pill geometry for WebKit and Firefox (`scrollbar-width: thin`).

5. **App Shell Alignment:**
   - Updated `src/app/layout/AppShell.tsx` outer frame and main scroll viewport from legacy `bg-slate-100` to `bg-canvas text-brand-obsidian`.

6. **Regression Verification:**
   - All 23 test suites and 312 unit/integration tests passing.
   - Zero TypeScript compilation errors (`tsc && vite build` passed cleanly).
