# Non-Negotiable Engineering, Business & Design Rules (RULES.md)
## 500 Labs — Antigravity Workshop & POS Master System

---

## 1. Non-Negotiable Domain & Business Rules

1. **Exact 3-Section Repair Document Architecture:**
   - Every Workshop Quotation, Estimate, Job Card, and Invoice MUST organize line items into three distinct numbered categories:
     - Section 1: `Labor - Remove & Reassemble` (`LABOR_REMOVE_REASSEMBLE`)
     - Section 2: `Labor - Repair` (`LABOR_REPAIR`)
     - Section 3: `Replacement` (`REPLACEMENT` - Spare parts & materials)
   - Each section maintains its own independent 1-indexed line counter and independent subtotal.

2. **Exact 12-Field Vehicle & Intake Header Matrix:**
   - Every Workshop Sheet enforces the exact 7-row, 12-field layout matching the official source templates:
     - Row 1: `Date` | `Job Number` (Auto-generated sequential, e.g. `JOB-2026-0001`)
     - Row 2: `Vehicle Number` (e.g. `CBA-1234`) | `Nature of Repair` (Accident, Mechanical, Electrical, Scanning, Tinkering, Auto Paint)
     - Row 3: `Vehicle Make` | `Chassis Number`
     - Row 4: `Vehicle Model` | `No of Days Completion`
     - Row 5: `Year of Make` | `Vehicle Color`
     - Row 6 (Full Width): `Name of Insurance`
     - Row 7 (Full Width): `Customer Information` (Name, Phone Number, Address typed directly)

3. **Zero Mandatory Master Prerequisites (Zero-CRM & Frictionless Intake):**
   - Users MUST be able to create a complete Accident Estimate, Quotation, or POS Counter Sale by typing directly into header and row fields without first creating separate Customer, Vehicle, or Catalog records.
   - Non-blocking autocomplete suggests past vehicles or catalog items, but never blocks freeform entry.

4. **Strict Cost & Margin Privacy Invariant:**
   - Line items store `sellingPriceRs` and `buyingCostRs`.
   - `buyingCostRs`, `grossProfitRs`, and `grossMarginPct` are confidential executive telemetry.
   - They are visible ONLY when explicitly toggled by `OWNER` or `WORKSHOP_MANAGER`.
   - For all other roles (`SERVICE_ADVISOR`, `CASHIER`, `TECHNICIAN`), these fields are completely stripped from state and DOM.
   - In all export channels (A4 print, PDF, 80mm thermal receipt, WhatsApp text payload), cost and margin data is 100% redacted.

5. **Floor Job Card Monetary Redaction Rule:**
   - When printing or viewing a `JOB_CARD` for workshop mechanics:
     - All monetary fields (`sellingPriceRs`, subtotals, grand total, balance due) MUST be completely redacted.
     - Replaced with task checkboxes (`isCompleted`), `Assigned Technician`, and `Waiting for Parts` flags.

6. **Historical Transaction Snapshot Immutability:**
   - When an item is added from the Parts & Labor Catalog, its `description`, `sellingPriceRs`, and `buyingCostRs` are cloned as a frozen snapshot onto the transaction line item. Subsequent edits to the Catalog MUST NEVER mutate historical Quotations, Estimates, Job Cards, Invoices, or POS receipts.

7. **Insurance & Split Settlement Formula:**
   $$\text{Grand Total} = \sum \text{Subtotals} - \text{Discounts} + \text{Taxes}$$
   $$\text{Customer Liability} = \text{Grand Total} - \text{Insurance Approved Payable}$$
   $$\text{Customer Balance Due} = \text{Customer Liability} - \text{Advance Paid}$$

8. **POS Cash Float & Shift Reconciliation:**
   - Every cashier shift tracks `Opening Cash Float`, `Cash In`, `Cash Out` (petty cash for garage tea, consumables, sublet), `Total Cash Sales`, `Expected Drawer Cash`, and `Actual Counted Cash` with strict variance auditing.

---

## 2. Centralized Global Design & Aesthetics Rules ("Under One Global Manage")

1. **Single Source of Truth for Tokens (`src/design-system/`):**
   - All colors, surfaces, borders, radii, shadows, and typography MUST be imported from `src/design-system/tokens.ts` and managed via `globalDesignManager`.
   - Hardcoded arbitrary hex values (e.g. random `#ff4400` or `#e2e8f0` scattered in components) are strictly prohibited.

2. **Porcelain & Chalk Layering:**
   - Application canvas uses cool chalk (`#F6F8FA`) or warm porcelain (`#F9F8F6`). Cards, tables, and sheets use pure white (`#FFFFFF`) with micro-hairline borders (`rgba(15, 23, 42, 0.08)`).

3. **Single-Chroma Focal Allocation:**
   - Structural Anchor: Obsidian (`#0F172A`) for dark KPI cards and secondary executive stage conversions.
   - High-Conversion CTA: Terracotta / Burnt Coral (`#F95700` hover `#EA580C`) reserved exclusively for primary actions.
   - Tonal Semantic Pastels: Status badges never use harsh solid fills. They pair a 10% pastel background with a 1px 20% border and saturated typography.

4. **Concentric Radii Formula (modern-ui-specialist):**
   $$\text{Inner Radius} = \max(0, \text{Outer Radius} - \text{Padding})$$
   - Viewport-docked edges must use `0px` radius to eliminate light leaks.

5. **Tabular Numerals & Swiss Editorial Typography:**
   - Monospace digits (`font-mono tabular-nums`) enforced across all currency figures (`Rs. 145,000.00`), license plates (`CBA-1234`), chassis numbers, quantities, and margin percentages.

---

## 3. High-Velocity Ergonomics & Engineering Rules

1. **Zero-Latency Keyboard Entry:**
   - Pressing `Enter` on the final column (`Amount Rs.`) of any repair section immediately appends a new row and focuses its description input in `<16ms`.
   - Tab and arrow keys allow continuous hands-on-keyboard data entry without mouse usage.

2. **Zero `any` TypeScript Policy:**
   - Strict TypeScript compilation with `noImplicitAny: true`. All models, props, and repository interfaces must be explicitly typed.

3. **Repository Pattern Boundary:**
   - Components MUST NOT mutate raw mock state or call storage/fetch directly. All I/O passes through typed repository interfaces (`WorkshopJobRepository`, `PosSaleRepository`, `CatalogRepository`).

4. **Universal State Hygiene:**
   - All asynchronous or user actions (save, convert stage, tender payment, open/close shift) must provide loading, disabled, success toast, and error feedback states. Destructive actions require modal confirmation.
