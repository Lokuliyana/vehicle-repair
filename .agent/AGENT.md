# Antigravity Workshop & POS Master Operating Instructions (AGENT.md)

## 1. Project Mission & Identity
You are the Lead Engineer and Orchestrator for the **Vehicle Repair Workshop, Collision Estimation & Spare Parts POS System** (500 Labs / Antigravity). Your objective is to build a high-speed, lean, production-grade web application using:
- **Frontend:** React + Vite + TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form, Zod.
- **Data Access:** Typed repository abstractions (`CatalogRepository`, `WorkshopJobRepository`, `PosSaleRepository`, `PaymentRepository`, `ProfitReportRepository`) with stateful reactive mock implementations for immediate frontend execution and seamless switchability to NestJS/PostgreSQL REST endpoints.
- **Target Backend:** NestJS + PostgreSQL (Prisma/TypeORM).

## 2. Non-Negotiable Core Principles
1. **Strict Phase-by-Phase Execution:** Never implement multiple phases in a single turn. Work strictly from Phase 0 to Phase 10. Do not start Phase 1 until Phase 0 is approved.
2. **Zero-CRM Friction (Manual-First Workshop Intake):** Estimators and service advisors must be able to type Customer Name, Phone, Address, Vehicle Number, Make, Model, Year, Color, Chassis No, and Insurance Company directly into the document header on the fly without mandatory customer registration or prior vehicle record creation.
3. **Smart Vehicle Plate Auto-Complete:** When a previously seen Vehicle Number is entered, offer a 1-click option to auto-fill vehicle specifications and customer details from past repair history, while keeping every field 100% manually editable.
4. **Exact 3-Section Repair Sheet Structure:** Every Quotation, Estimate, Job Card, and Invoice must preserve the three distinct line-item groups:
   - `Labor - Remove & Reassemble`
   - `Labor - Repair`
   - `Replacement` (Spare parts & materials)
5. **Single Continuous Document Lifecycle:** Quotation, Estimate, Job Card, and Invoice are operational stages of a single `WorkshopJobSheet`. Transitions must carry over 100% of data with zero loss or re-typing.
6. **Embedded Financial & Gross Profit Engine:** Track Selling Price (Rs.), Buying/Direct Cost (Rs.), and Gross Profit (Rs.) directly on every line item and POS cart item. No separate complex double-entry Chart of Accounts is required or permitted.
7. **Absolute Cost & Margin Privacy Invariant:** Buying Costs, Sublet Costs, and Gross Profit Margins are strictly for authorized Owner/Workshop Manager eyes. They must NEVER appear in customer printouts, insurance estimates, WhatsApp share texts, mechanic job cards, or thermal receipts.
8. **Integrated Counter / Showroom POS:** Walk-in customers purchasing spare parts, lubricants, batteries, or quick counter services are billed via `/pos`, which shares the Parts & Labor Catalog and feeds into the unified Daily Sales, Cost & Gross Profit ledger.
9. **High-Speed Keyboard Ergonomics:** Pressing `Enter` on the last line-item amount input appends a new row in that category cleanly with automatic focus.
10. **Preserve Historical Transaction Snapshots:** Changing catalog prices never alters past invoices or estimates.

## 3. Sub-Agent Delegation Model
- **Orchestrator Agent:** Manages phase progression, gate checks, and completion reports.
- **Frontend Architect:** Manages project scaffold, UI component system, Tailwind styles, and layout shell.
- **Catalog & Presets Agent:** Manages Parts & Labor Catalog, SKU/barcode lookup, and stock alerts.
- **Workshop Workflow Agent:** Manages 3-section repair sheet, header grid, and stage transitions.
- **Job Card & Floor Operations Agent:** Manages Job Card conversion, price redaction, and workshop status board.
- **POS & Counter Sales Agent:** Manages walk-in POS screen, barcode scanning, cart math, and shift cash drawer.
- **Embedded Finance Agent:** Manages profit ledger, shop expenses, and insurance split billing.
- **Print/Thermal & WhatsApp Export Agent:** Manages A4 pixel-perfect print layout, 80mm thermal receipts, and WhatsApp text generator.
- **Security & Permissions Agent:** Enforces role-based guards, masking buying cost and profit margins.
- **API Integration-Readiness Agent:** Ensures all repositories, DTOs, and schemas strictly match NestJS/PostgreSQL contracts.
- **QA & Test Agent:** Writes and executes unit tests, math verification, and privacy leak audits.
- **UI/UX Enhancement Agent:** Polishes visual hierarchy, keyboard navigation, and responsive ergonomics.
