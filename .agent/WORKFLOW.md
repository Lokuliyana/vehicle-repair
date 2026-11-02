# Phase Workflow & Completion Gate Protocol (WORKFLOW.md)

## 1. Execution Sequence Overview
To guarantee modular stability, testability, and zero regression, the system is executed phase-by-phase across 11 structured phases:

- **Phase 0: Analysis & Planning**
  Repository audit, `.agent/` architecture setup, domain modeling, requirements traceability matrix, and open questions resolution.
- **Phase 1: Design System & Print Abstractions**
  Project initialization (Vite, React, TS, Tailwind, shadcn primitives), color palette, high-contrast editable workshop tables, A4 print wrapper, and 80mm thermal receipt container.
- **Phase 2: App Shell & Role Permissions**
  Centralized routing, navigation sidebar/topbar, quick action shortcuts, Auth & Role context (`OWNER`, `WORKSHOP_MANAGER`, `SERVICE_ADVISOR`, `CASHIER`, `TECHNICIAN`), and cost/margin permission guard.
- **Phase 3: Parts & Labor Catalog + Vehicle History Lookup**
  Unified Parts & Labor catalog with SKU/barcode, Selling Price, and Buying Cost. Non-blocking Vehicle Number lookup helper auto-filling specs from previous jobs while remaining 100% editable.
- **Phase 4: Workshop Quotations & Accident Repair Estimates**
  Unified Repair Sheet (`/workshop/sheet`) with the exact 12-field header, 3 dynamic line-item tables, live subtotals, Admin Buying Cost & Gross Profit mode toggle, exact A4 template print view, and WhatsApp share link builder.
- **Phase 5: Job Card Conversion & Workshop Floor Board**
  One-click conversion from Quotation/Estimate to Job Card, immutable snapshot of original estimate amounts, price-redacted Job Card printout with technician assignment and checkboxes, and Kanban Workshop Status Board (`/workshop/board`).
- **Phase 6: Workshop Invoicing, Split Billing & Collections**
  One-click conversion to Invoice, supplementary line items, Discounts, Taxes, Advance Payments, Insurance Approved vs. Customer Excess split billing, Balance Due tracking, payment collection dialog, and invoice printout.
- **Phase 7: Counter / Showroom POS & Shift Cash Management**
  Dedicated Counter POS interface (`/pos`) for walk-in spare parts, lubricants, and quick services. Barcode/catalog search, custom item entry, cart math with hidden buying costs, tender modal (cash/card/transfer/split), 80mm thermal receipt, POS shift open/close, and petty-cash expense payouts.
- **Phase 8: Embedded Finance, Sales, Cost & Gross Profit Center**
  Unified Financial & Gross Profit ledger (`/finance/profit-ledger`) combining Workshop Invoices and POS Sales. Daily Shop Expense logging, real-time calculation of Gross Sales, Parts Cost, Labor Revenue, Gross Profit, Margin %, and Pending Insurance/Customer Receivables.
- **Phase 9: Reports & Analytics Dashboards**
  Date-Range Sales & Gross Profit Report (Workshop Labor vs. Replacements vs. Counter POS), Pending Insurance Claim Aging Report, Technician Turnaround Report, and Fast-Moving Parts / Low-Stock Alert Report.
- **Phase 10: Full QA, Print Audit & Integration Readiness**
  End-to-end workflow verification, comprehensive print-privacy leak audit, keyboard navigation validation, regression test suite, and NestJS/PostgreSQL API contract verification.

## 2. Mandatory Phase Gate Protocol
For every phase from 0 to 10:
1. **Plan & Declare:** Review phase scope, define exact types, components, hooks, and repositories to build.
2. **Implement Domain Layer First:** Create interfaces, schemas, calculation formulas, and repository methods before assembling UI.
3. **Assemble UI Components & Pages:** Ensure all loading, empty, error, and success states exist.
4. **Execute Verification & Testing:** Run unit tests, visual checks, print audits, and verify business rules.
5. **Issue Formal Completion Report:** Format using the template specified in Section 15 of the Master Guide, and await user approval before advancing to the subsequent phase.
