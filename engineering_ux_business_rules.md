# Non-Negotiable Engineering & Business Rules (RULES.md)

## 1. Business & Domain Rules
1. **Exact 3-Section Template Structure:** Every Workshop Quotation, Estimate, Job Card, and Invoice must organize line items into three distinct numbered sections:
   - `LABOR_REMOVE_REASSEMBLE` (*Labor - Remove & Reassemble*)
   - `LABOR_REPAIR` (*Labor - Repair*)
   - `REPLACEMENT` (*Replacement*)
2. **Exact Header Metadata Fields:** Every Workshop Sheet must include:
   - `Date`, `Job Number`
   - `Vehicle Number`, `Nature of Repair`
   - `Vehicle Make`, `Chassis Number`
   - `Vehicle Model`, `No of Days Completion`
   - `Year of Make`, `Vehicle Color`
   - `Name of Insurance` (full-width row)
   - `Customer Information` (full-width row)
3. **Strict Cost & Margin Privacy Invariant:**
   - Every line item stores `sellingPriceRs` (Customer/Insurance rate) and `buyingCostRs` (Internal part cost or direct sublet/technician cost).
   - `buyingCostRs`, `grossProfitRs`, and `grossMarginPct` are visible ONLY on screen when an authorized `OWNER` or `MANAGER` enables the **Cost & Margin Toggle**.
   - These fields must **NEVER** appear in the DOM print tree, PDF exports, WhatsApp share text, or technician Job Cards.
4. **Job Card Redaction Rule:** When printing or viewing a `JOB_CARD` for workshop mechanics, all monetary columns (`Amount Rs.`, subtotals, discounts, totals) must be hidden. Show only `No`, `Description`, `Assigned Technician`, and `Completed [ ]`.
5. **Historical Transaction Snapshots:** Selecting a preset from the Parts & Labor Catalog copies the current `description`, `sellingPriceRs`, and `buyingCostRs` onto the line item. Subsequent edits to the Catalog must never mutate historical Quotations, Estimates, Invoices, or POS receipts.

## 2. Technical & Code Rules
1. **Zero `any` Types:** Strict TypeScript mode must pass with zero warnings.
2. **Currency Precision:** Represent all Sri Lankan Rupee (`Rs.`) amounts using fixed two-decimal rounding helpers (`Math.round(val * 100) / 100` or integer cents) to prevent floating-point drift.
3. **Repository Boundary:** React components must never mutate mock arrays or call `fetch` directly. All data reads/writes must pass through typed repository interfaces (`WorkshopJobRepository`, `PosSaleRepository`, `CatalogRepository`).
4. **High-Speed Keyboard Entry:** Pressing `Enter` inside the final input of any line-item row must automatically append a new row in that section and focus its `Description` input.