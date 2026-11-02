# Non-Negotiable Engineering & Business Rules (RULES.md)

## 1. Business & Domain Rules
1. **Exact 3-Section Template Structure:**
   Every Workshop Quotation, Estimate, Job Card, and Invoice must organize repair items into:
   - Category 1: `Labor - Remove & Reassemble` (`LABOR_REMOVE_REASSEMBLE`)
   - Category 2: `Labor - Repair` (`LABOR_REPAIR`)
   - Category 3: `Replacement` (`REPLACEMENT`)
   Each section maintains its own independent row counter (1..N) and subtotal.
2. **Exact 12-Field Workshop Header:**
   - Row 1: `Date` | `Job Number` (Auto-generated sequential, e.g. `JOB-2026-0001`)
   - Row 2: `Vehicle Number` (e.g. `CBA-1234`) | `Nature of Repair` (Accident, Mechanical, Electrical, Scanning, Tinkering, Auto Paint)
   - Row 3: `Vehicle Make` | `Chassis Number`
   - Row 4: `Vehicle Model` | `No of Days Completion`
   - Row 5: `Year of Make` | `Vehicle Color`
   - Row 6 (Full Width): `Name of Insurance`
   - Row 7 (Full Width): `Customer Information` (Name, Phone Number, Address typed directly)
3. **Zero Mandatory Master Prerequisites:**
   Users can create a complete Estimate or POS Sale without first registering a Customer record, Vehicle record, or Catalog Item.
4. **Strict Cost & Margin Privacy Invariant:**
   - Line items store `sellingPriceRs` and `buyingCostRs`.
   - `buyingCostRs`, `grossProfitRs`, and `grossMarginPct` are only visible when toggled by `OWNER` or `WORKSHOP_MANAGER`.
   - These fields must be omitted or hidden via `print:hidden` from customer-facing printouts, PDF views, WhatsApp messages, and floor Job Cards.
5. **Job Card Floor Redaction Rule:**
   When printing or viewing a `JOB_CARD` for workshop mechanics:
   - Redact all monetary fields (`sellingPriceRs`, subtotals, grand total, balance due).
   - Display task checkboxes (`isCompleted`), assigned technician, nature of repair, and days for completion.
6. **Historical Transaction Snapshot Rule:**
   When an item is added from the Catalog, clone its `description`, `sellingPriceRs`, and `buyingCostRs` onto the line item. Future changes to catalog prices do NOT alter historical documents.
7. **Insurance Split Billing Rule:**
   - `Grand Total = Subtotal(Remove & Reassemble) + Subtotal(Repair) + Subtotal(Replacement) - Discount + Tax`
   - `Customer Payable = Grand Total - Insurance Approved Amount`
   - `Customer Balance Due = Customer Payable - Advance Paid`
8. **Cash Float & POS Shift Reconciliation:**
   Cashier shifts track Opening Cash Float, Cash In (Petty cash / corrections), Cash Out (Shop consumables / tea / minor sublet), Total Cash Sales, System Expected Cash, and Actual Counted Cash with Over/Short variance.

## 2. Engineering & Architecture Rules
1. **Zero `any` Policy:** Strict TypeScript compilation with `noImplicitAny: true`.
2. **Precision Currency Handling:**
   All amounts are in Sri Lankan Rupees (`Rs.`). Perform arithmetic in cents or round to 2 decimal places using standardized helper `roundCurrency(amount)`.
3. **Repository Pattern Boundary:**
   Components must never access storage or fetch directly. All domain state and I/O are mediated by typed repository interfaces.
4. **Component State Hygiene:**
   Business math, profit equations, and state transitions belong in pure domain calculation hooks and repository services, not embedded inside JSX components.
5. **Universal Action States:**
   Every user action (save, stage change, payment tender, shift open/close) must provide loading, disabled, success toast, and error feedback states. Destructive actions require modal confirmation.
6. **Keyboard Navigation Support:**
   In line tables, pressing `Enter` on the `Amount (Rs.)` input creates a new row with auto-focus on `Description`. Up/Down arrow or Tab allows rapid continuous data entry.
