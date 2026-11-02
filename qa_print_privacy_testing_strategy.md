# Testing & Quality Assurance Strategy (TESTING_STRATEGY.md)

## 1. Unit & Math Invariant Tests
1. **3-Section Subtotal Test:** Verify that adding/editing/deleting rows in `LABOR_REMOVE_REASSEMBLE`, `LABOR_REPAIR`, and `REPLACEMENT` updates section subtotals and `grandTotalSalesRs` accurately.
2. **Gross Profit & Margin Test:**
   - Given Labor Sales = `Rs. 25,000` (Cost = `Rs. 5,000`), Replacement Sales = `Rs. 60,000` (Buying Cost = `Rs. 42,000`), and Discount = `Rs. 2,000`:
   - Net Sales = `Rs. 83,000`, Total Cost = `Rs. 47,000`, Gross Profit = `Rs. 36,000`, Gross Margin = `43.37%`.
3. **Insurance Split Billing Test:** Verify that setting `Insurance Approved = Rs. 70,000` and `Advance Paid = Rs. 5,000` on an `Rs. 83,000` invoice computes `Customer Balance Due = Rs. 8,000`.

## 2. Workflow & State Transition Tests
1. **Zero-CRM Entry Test:** Create and save a Quotation with completely new Vehicle Number and Customer Info without touching any master setup screen.
2. **4-Stage Conversion Pipeline:** Transition a record through `QUOTATION -> ESTIMATE -> JOB_CARD -> INVOICE` and verify all 12 header fields and all line items remain intact.
3. **Estimate Snapshot Integrity:** Modify a Replacement part price in `INVOICE` stage and verify `originalEstimateSnapshot` still reflects the initial `ESTIMATE` amount.

## 3. Print & Security Leak Audit
1. **Customer Print Leak Check:** Enable Admin Margin Toggle on screen, trigger Print Preview for Quotation, Estimate, and Invoice, and assert that `buyingCostRs` and `grossProfitRs` nodes are completely absent/hidden from the print layout.
2. **Job Card Price Redaction Check:** Trigger Print Preview in `JOB_CARD` stage and assert that `sellingPriceRs` and subtotals are hidden from mechanics.