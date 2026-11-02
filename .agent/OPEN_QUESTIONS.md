# Architecture Decisions & Open Questions (OPEN_QUESTIONS.md)

## 1. Explicit Architectural Decisions Log
1. **Decision 1: Zero-CRM Prerequisite**
   - *Rationale:* Workshop staff intake vehicles under time pressure. Forcing customer account creation or vehicle master record registration creates operational friction.
   - *Resolution:* All customer and vehicle details are stored directly on the job sheet header. An asynchronous non-blocking lookup indexes past vehicle numbers for 1-click auto-fill suggestions.
2. **Decision 2: Unified Document Entity vs. Separate Tables**
   - *Rationale:* A repair often transitions from Quotation to Insurance Estimate, to Workshop Job Card, to Final Invoice.
   - *Resolution:* A single `WorkshopJobSheet` entity stores `docStage: 'QUOTATION' | 'ESTIMATE' | 'JOB_CARD' | 'INVOICE'`. When converting to Job Card, an immutable JSON snapshot of the original estimate is frozen on the record.
3. **Decision 3: Embedded Financial Math without Accounting COA**
   - *Rationale:* Workshop owners care about direct gross profit (`Net Sales - Part Buying Cost - Direct Sublet Cost`) and simple daily shop expenses. Full double-entry ledgers add excessive overhead.
   - *Resolution:* Calculate sales, cost, gross profit, and margin % directly on every line item and POS sale. Track shop expenses in a single daily log.
4. **Decision 4: Absolute Print Privacy Guarantee**
   - *Rationale:* Workshop customers and insurance assessors must never see garage part buying costs, sublet costs, or gross profit margins.
   - *Resolution:* Internal cost and margin columns are conditionally rendered only when the authorized Owner/Manager toggles them on screen. In print views, all internal columns are omitted or strictly hidden via `@media print`.

## 2. Open Questions & Assumptions Tracked for User Feedback
1. **Currency & Localization:**
   - *Default:* Sri Lankan Rupees (`Rs.`) with two decimal formatting (e.g., `Rs. 45,500.00`).
   - *Question:* Are there any specific tax requirements (e.g. VAT/SSCL percentages) that should be pre-configured as defaults? (Currently default is manual tax entry with optional 0% or standard rate).
2. **WhatsApp Sharing Integration:**
   - *Default:* Direct URL builder (`https://wa.me/?text=...` / `api.whatsapp.com/send`) that pre-populates a clean markdown summary and prompts PDF download. This requires zero third-party paid API subscription.
   - *Status:* Assumed and adopted as specified in the master guide.
3. **Barcodes in POS:**
   - *Default:* Standard keyboard-wedge USB / Bluetooth barcode scanners that emit keystrokes followed by `Enter`.
   - *Status:* Handled natively with a high-speed listener.
