# Phase Workflow & Completion Gate Protocol (WORKFLOW.md)
## 500 Labs — Antigravity Workshop & POS Master System

---

## 1. UI Transformation Master Roadmap (Phases 0 to 10)

To guarantee uncompromising luxury UI standards, modular stability, pixel fidelity, and zero regression, the UI transformation roadmap is executed across 11 structured phases:

- **Phase 0: Codebase UI Audit, Governance & CSS Reset Foundation**
  - Verify and organize all `.agent/` governance files (`AGENT.md`, `WORKFLOW.md`, `UI_GUIDELINES.md`, `RULES.md`, etc.).
  - Complete codebase inventory mapping all route screens, modal dialogs, data tables/ledgers, and print engines.
  - Purge legacy Vite/boilerplate CSS, ugly scrollbars, and harsh border defaults.
  - Establish Chalk & Porcelain palette (`#F6F8FA` canvas, `#FFFFFF` cards, `#F95700` terracotta, `#0F172A` obsidian) and Plus Jakarta Sans / JetBrains Mono font declarations.

- **Phase 1: Design Tokens, Global Manager & Atomic UI Primitives**
  - Central tokens (`tokens.ts`), singleton `GlobalDesignManager`, Tailwind configuration, and atomic component suite covering Categories A through K (210 components).
  - High-contrast editable workshop tables, A4 print wrapper, and 80mm thermal receipt container.

- **Phase 2: App Shell, Navigation Rail & Role Guard Integration**
  - Wire `AppShellMasterLayout`, `SidebarNavigationRail`, `GlobalTopHeaderBar`, `RolePerspectiveBadge`, and `RolePermissionGateWrapper` across active application routes.
  - Role switcher allows instant perspective change (`Owner`, `Manager`, `Advisor`, `Cashier`, `Technician`) with strict DOM unmounting of cost/profit data for restricted roles.

- **Phase 3: Catalog Master & Non-Blocking Vehicle History Service**
  - Upgrade `/catalog` with `LuxuryDataTableWrapper`, `TableMarginSparkBarCell`, and slide-over part editor.
  - Connect `SmartPlateAutocompleteInput` to past vehicle job repository for 1-click header auto-fill without blocking manual typing.

- **Phase 4: Workshop Quotation & Accident Estimate Studio**
  - Upgrade `/workshop/sheet/new` with `VehicleHeader12FieldMatrix` and 3-section line tables (`Labor - Remove & Reassemble`, `Labor - Repair`, `Replacement`).
  - Wire `Enter`-to-append row ergonomics and `ToggleLockPrivacyButton`.
  - Integrate `A4PrintCanvasContainer` and `WhatsAppSharePreviewDialog`.

- **Phase 5: Job Card Stage Conversion, Floor Board & Redacted Print**
  - Implement stage transition modal (`Estimate -> Job Card`) with immutable original estimate snapshot.
  - Wire `/workshop/board` with floor status columns and mechanic task checkboxes.
  - Floor view and Job Card print redact 100% of prices and monetary amounts.

- **Phase 6: Workshop Final Invoicing & Insurance Split Billing**
  - Build `/workshop/invoice/:id` with `InsuranceSplitBillingCalculator` and `AdvancePaymentReceiptRecorder`.
  - Calculate Customer Excess vs. Insurance Approved Payable to the cent with formal receipt generation.

- **Phase 7: High-Speed Counter POS Terminal & Register Shift**
  - Upgrade `/pos` with `PosProductTouchCard`, `PosCartItemCard`, and `PosCollectPaymentModal`.
  - Wire hardware scanner listener (`PosBarcodeScannerStatusPill`), quick cash chips, and 80mm thermal receipt.
  - Implement `/pos/shift` with opening float, petty cash payouts, and closing variance reconciliation.

- **Phase 8: Embedded Finance & Unified Gross Profit Center**
  - Build `/finance/profit-ledger` with `DailyCashFlowWaterfallCard` and `UnifiedProfitLedgerTable`.
  - Connect daily garage expenses (rent, electricity, welding consumables).
  - Enforce formula: `Net Shop Profit = Gross Sales - Discounts - Direct Costs - Expenses`.

- **Phase 9: Workshop Intelligence & Executive Analytics**
  - Build `/reports` with `HeroHighlightBarChart`, `MultiSegmentDonutChart`, and insurance aging buckets (`0–15d`, `16–30d`, `30–60d`, `60d+`).
  - Date range filtering and CSV/PDF export.

- **Phase 10: End-to-End QA, Print Privacy Audit & Regression Verification**
  - Execute full Vitest suite.
  - Verify keyboard ergonomics (`Enter` row creation, `⌘K` omnibox, `Esc` dismissal).
  - Execute print DOM privacy audit across all screens.

---

## 2. Mandatory Phase Gate Protocol
For every phase from 0 to 10:
1. **Plan & Declare:** Review phase scope, define exact tokens, components, hooks, and repositories to build or modify.
2. **Implement Domain Layer First:** Create interfaces, schemas, calculation formulas, and repository methods before assembling UI.
3. **Assemble UI Components & Pages:** Ensure all loading, empty, error, and success states exist with Porcelain & Chalk aesthetics.
4. **Execute Verification & Testing:** Run unit tests, visual checks, print audits, and verify business rules.
5. **Issue Formal Completion Report:** Deliver comprehensive Phase Completion Report and await user review before advancing to the subsequent phase.
