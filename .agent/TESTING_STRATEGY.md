# Testing & Quality Assurance Strategy (TESTING_STRATEGY.md)

## 1. QA Objectives
1. Verify exact mathematical correctness across all document stages and POS sales (down to the exact cent).
2. Guarantee absolute privacy: ensure zero leakage of Buying Cost or Gross Profit in customer-facing views, printouts, exports, and technician views.
3. Validate state machine integrity: seamless 4-stage document conversion (`QUOTATION -> ESTIMATE -> JOB_CARD -> INVOICE`) with zero data loss.
4. Ensure frictionless zero-CRM intake: creating documents and sales without mandatory prior record setup.
5. Confirm high-speed keyboard ergonomics: Enter-to-add row navigation and arrow navigation.

## 2. Core Test Suites

### 2.1 Math & Calculation Tests
- **Workshop Subtotals:** Summing rows in `LABOR_REMOVE_REASSEMBLE`, `LABOR_REPAIR`, and `REPLACEMENT` matches section subtotals and Grand Total.
- **Gross Profit & Margin Formula:**
  - `Net Sales = Gross Sales - Discount`
  - `Total Cost = Sum(Line Buying Costs)`
  - `Gross Profit = Net Sales - Total Cost`
  - `Gross Margin % = (Gross Profit / Net Sales) * 100`
- **Insurance Split Billing:**
  - `Customer Payable = Grand Total - Insurance Approved Amount`
  - `Balance Due = Customer Payable - Advance Paid`
- **POS Tender & Change Math:**
  - `Change = max(0, Tendered - Net Total)`
- **Shift Reconciliation Math:**
  - `Expected Cash = Opening Float + Cash Sales + Cash In - Cash Out`
  - `Variance = Actual Cash - Expected Cash`

### 2.2 Security & Print Privacy Tests
- **Print Layout Audit:** Inspect compiled print markup; confirm no element with `buyingCostRs` or `grossProfitRs` is rendered without `print:hidden` or present in printable DOM.
- **Role Permission Guard:** Confirm `TECHNICIAN`, `CASHIER`, and `SERVICE_ADVISOR` cannot toggle or view cost/margin data.
- **Job Card Price Redaction:** In `JOB_CARD` stage, confirm all monetary figures are hidden on screen and print.

### 2.3 Workflow & State Transition Tests
- **Stage Progression:** Create a Quotation, transition to Estimate, convert to Job Card (verify snapshot creation), convert to Invoice (verify split billing and payment logging).
- **Auto-Complete Lookup:** Entering an existing vehicle number populates previous make, model, year, and customer info without overwriting manual edits.

### 2.4 Testing Execution Command
Use Vitest + Testing Library for automated unit/integration tests:
```bash
npm run test
```
