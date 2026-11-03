# Antigravity Workshop & POS Master Operating Instructions (AGENT.md)
## 500 Labs — Antigravity Workshop & POS Master System

---

## 1. Project Mission & Identity
You are the Lead Engineer and Orchestrator for the **Vehicle Repair Workshop, Collision Estimation & Spare Parts POS System** (500 Labs / Antigravity). Your objective is to build a high-speed, lean, production-grade web application elevated to ultra-luxury enterprise ERP standards (benchmarked against **Confidency OS**, **CommerceOS**, **Bonfol/Velvet**, and **RestroBit**) using:
- **Frontend:** React 19 + TypeScript + Vite, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form, Zod.
- **Design Paradigm:** Swiss Editorial Precision, Porcelain & Chalk Surface Layering, Single-Chroma Focal Allocation, Zero-Latency Keyboard Ergonomics, and Absolute Cost Privacy.
- **Data Access:** Typed repository abstractions (`CatalogRepository`, `WorkshopJobRepository`, `PosSaleRepository`, `PaymentRepository`, `ProfitReportRepository`) with stateful reactive mock implementations for immediate frontend execution and seamless switchability to NestJS/PostgreSQL REST endpoints.
- **Target Backend:** NestJS + PostgreSQL (Prisma/TypeORM).

---

## 2. Non-Negotiable Core Principles & Invariants
1. **Strict Phase-by-Phase Execution:** Never implement multiple phases in a single turn. Work strictly from Phase 0 to Phase 10. Do not start Phase 1 until Phase 0 is approved.
2. **Zero-CRM Friction (Manual-First Workshop Intake):** Estimators and service advisors must be able to type Customer Name, Phone, Address, Vehicle Number, Make, Model, Year, Color, Chassis No, and Insurance Company directly into the document header on the fly without mandatory customer registration or prior vehicle record creation.
3. **Smart Vehicle Plate Auto-Complete:** When a previously seen Vehicle Number is entered, offer a 1-click option to auto-fill vehicle specifications and customer details from past repair history, while keeping every field 100% manually editable.
4. **Exact 3-Section Repair Sheet Structure:** Every Quotation, Estimate, Job Card, and Invoice must preserve the three distinct line-item groups:
   - Category 1: `Labor - Remove & Reassemble` (`LABOR_REMOVE_REASSEMBLE`)
   - Category 2: `Labor - Repair` (`LABOR_REPAIR`)
   - Category 3: `Replacement` (`REPLACEMENT` - Spare parts & materials)
5. **Single Continuous Document Lifecycle:** Quotation, Estimate, Job Card, and Invoice are operational stages of a single `WorkshopJobSheet`. Transitions must carry over 100% of data with zero loss or re-typing.
6. **Embedded Financial & Gross Profit Engine:** Track Selling Price (Rs.), Buying/Direct Cost (Rs.), and Gross Profit (Rs.) directly on every line item and POS cart item. No separate complex double-entry Chart of Accounts is required or permitted.
7. **Absolute Cost & Margin Privacy Invariant:** Buying Costs, Sublet Costs, and Gross Profit Margins are strictly for authorized Owner/Workshop Manager eyes. They must NEVER appear in customer printouts, insurance estimates, WhatsApp share texts, mechanic job cards, or thermal receipts.
8. **Integrated Counter / Showroom POS:** Walk-in customers purchasing spare parts, lubricants, batteries, or quick counter services are billed via `/pos`, which shares the Parts & Labor Catalog and feeds into the unified Daily Sales, Cost & Gross Profit ledger.
9. **High-Speed Keyboard Ergonomics:** Pressing `Enter` on the last line-item amount input appends a new row in that category cleanly in `<16ms` with automatic focus traversal.
10. **Preserve Historical Transaction Snapshots:** Changing catalog prices never alters past invoices or estimates.

---

## 3. Luxury UI & Design Management System
All styling, tokens, and formatters follow the centralized global architecture:
- **Central Tokens:** `src/design-system/tokens.ts` (`DESIGN_TOKENS`)
- **Global Manager API:** `src/design-system/global-manager.ts` (`globalDesignManager`)
- **Color Palette:**
  - Base Canvas: Atmospheric cool chalk (`#F6F8FA`) or warm porcelain (`#F9F8F6`)
  - Elevated Surfaces: Crisp white (`#FFFFFF`) with micro-hairline borders (`rgba(15, 23, 42, 0.08)`)
  - Primary Action Focus: Vibrant Terracotta (`#F95700`, hover `#EA580C`)
  - Structural Anchor: Obsidian Charcoal (`#0F172A`)
  - Tonal Semantic Pastels: Emerald (Paid/High Margin), Amber (Warning/Parts), Cobalt (Active/Bay), Crimson (Loss/Overdue)
- **Mathematical Corner Radii:** Controls `10px`, Cards `16px`, Modals `22px`, Pills `9999px`. Concentricity formula: $\text{Inner} = \max(0, \text{Outer} - \text{Padding})$.
- **Typography:** Plus Jakarta Sans for UI copy; JetBrains Mono with enforced `tabular-nums` for all license plates, chassis numbers, currency figures (`Rs.`), and margins.
- **Component Catalog:** 210 luxury components across Categories A through K.

---

## 4. Sub-Agent Delegation Model
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
