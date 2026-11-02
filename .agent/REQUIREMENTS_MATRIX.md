# Requirements Traceability Matrix (REQUIREMENTS_MATRIX.md)

| Req ID | Category | Requirement Description | Source Baseline | Target Phase | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | UI / Print | Top Service Banner: *"ALL KIND OF VEHICLE, ELECTRICAL & MECHANICAL REPAIRS, SCANNING, TINKERING, ACCIDENT REPAIR & AUTO PAINT"* | Uploaded Word doc templates | Phase 4 | Planned |
| **REQ-02** | Form Intake | 12-field exact header grid (Date, Job No, Vehicle No, Nature of Repair, Make, Chassis, Model, Days Completion, Year, Color, Insurance Name, Customer Info) | Uploaded Word doc templates | Phase 4 | Planned |
| **REQ-03** | Workshop Sheet | 3 distinct line-item tables: *Labor - Remove & Reassemble*, *Labor - Repair*, and *Replacement* with `No`, `Description`, `Amount (Rs.)` | Uploaded Word doc templates | Phase 4 | Planned |
| **REQ-04** | UI / Print | Bottom disclaimer: *"Computer generated estimate and does not carry a signature."* + *"T H A N K  Y O U"* | Uploaded Word doc templates | Phase 4 | Planned |
| **REQ-05** | Workflow | Zero-CRM friction: direct manual typing of customer, vehicle, insurance details on the sheet without mandatory registration | Explicit Project Rule | Phase 3 & 4 | Planned |
| **REQ-06** | Workflow | Smart Vehicle Plate Auto-Complete from previous repair history without blocking manual editing | Explicit Project Rule | Phase 3 & 4 | Planned |
| **REQ-07** | Workflow | 4-Stage Single Document Lifecycle: Quotation -> Estimate -> Job Card -> Invoice with 100% data preservation | Explicit Project Rule | Phase 4, 5, 6 | Planned |
| **REQ-08** | Floor Ops | Job Card price redaction: all monetary amounts hidden on technician floor views and printed work sheets | Explicit Project Rule | Phase 5 | Planned |
| **REQ-09** | Floor Ops | Workshop Floor Kanban Board filtering jobs by operational stage (`DRAFT`, `WAITING_FOR_PARTS`, `IN_PROGRESS`, etc.) | Explicit Project Rule | Phase 5 | Planned |
| **REQ-10** | Billing | Insurance Split Billing: Grand Total - Insurance Approved Amount = Customer Excess; Customer Excess - Advance Paid = Balance Due | Explicit Project Rule | Phase 6 | Planned |
| **REQ-11** | Shared Catalog | Parts & Labor Catalog Master supporting SKU, Barcode, Selling Price, Buying Cost, and Stock Level | Explicit Project Rule | Phase 3 | Planned |
| **REQ-12** | POS | Counter POS for walk-in spare parts, lubricants, batteries, and quick services with barcode scanning & cart math | Explicit Project Rule | Phase 7 | Planned |
| **REQ-13** | POS | POS Cash Shift Open/Close with float tracking, cash in/out, and end-of-day reconciliation | Explicit Project Rule | Phase 7 | Planned |
| **REQ-14** | POS / Print | 80mm Thermal Receipt printing for POS sales and workshop payment receipts | Explicit Project Rule | Phase 1 & 7 | Planned |
| **REQ-15** | Export | One-click WhatsApp share navigation with structured summary text and PDF download link | Explicit Project Rule | Phase 4 | Planned |
| **REQ-16** | Finance | Embedded Financial Engine: live Gross Profit = Net Sales - Total Buying Cost; Net Profit = Gross Profit - Daily Expenses | Explicit Project Rule | Phase 4, 7, 8 | Planned |
| **REQ-17** | Security | Privacy Invariant: Buying Costs and Gross Profit visible ONLY to Owner/Manager on screen, NEVER rendered in customer printouts | Explicit Project Rule | Phase 2, 4, 10 | Planned |
| **REQ-18** | Analytics | Date-Range Sales & Gross Profit breakdown, Insurance Aging Receivables, and Low Stock Alerts | Explicit Project Rule | Phase 9 | Planned |
| **REQ-19** | Integration | NestJS / PostgreSQL API contracts and repository boundary ready for full backend handover | Explicit Project Rule | Phase 10 | Planned |
