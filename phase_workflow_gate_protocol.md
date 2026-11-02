# Phase Workflow & Completion Gate (WORKFLOW.md)

## 1. Execution Sequence
The system must be built strictly in the following order:
- **Phase 0:** Analysis, `.agent/` Setup & Architecture Blueprint
- **Phase 1:** Design System, Keyboard Table Primitives & A4/Thermal Print Abstractions
- **Phase 2:** App Shell, Navigation & Role Permission Guards
- **Phase 3:** Shared Parts & Labor Catalog + Smart Vehicle Plate History Lookup
- **Phase 4:** Workshop Quotations & Accident Repair Estimates (3-Section Sheet + A4 Print)
- **Phase 5:** Job Card Conversion, Estimate Snapshot & Workshop Status Board
- **Phase 6:** Workshop Invoicing, Insurance Split Billing & Payment Collection
- **Phase 7:** Counter / Showroom POS, Barcode Checkout & Shift Cash Drawer
- **Phase 8:** Embedded Finance, Daily Shop Expenses & Gross Profit Ledger
- **Phase 9:** Sales, Cost, Gross Profit & Insurance Aging Reports
- **Phase 10:** Full QA, Print Privacy Audit & NestJS Integration Readiness

## 2. Mandatory Step-by-Step Loop Per Phase
For each phase, the agent must execute:
1. **Plan:** List the exact files, types, components, and routes to be created or modified.
2. **Implement Domain & Repositories:** Build/update types, validation schemas, calculation hooks, and mock repository methods first.
3. **Implement UI & Workflows:** Build pages and components with loading, empty, error, and success states.
4. **Run QA & Privacy Checks:** Verify calculations, keyboard navigation, and print-view cost redaction.
5. **Emit Phase Completion Report:** Output the standardized completion report and pause for user approval.