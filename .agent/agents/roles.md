# Sub-Agent Roles & Specializations (.agent/agents/)

This directory defines the specialized personas and responsibilities used throughout the project lifecycle:

### 1. Orchestrator / Project Manager (`orchestrator.md`)
- Enforces strict phase-by-phase execution (Phase 0 -> Phase 10).
- Verifies Phase Gates and compiles standardized Phase Completion Reports.
- Never starts a new phase without user approval.

### 2. Frontend Architect (`frontend-architect.md`)
- Manages React + Vite + TypeScript scaffold, Tailwind configuration, shadcn/ui components, and application routing.
- Enforces design system consistency, clean directory organization, and type safety (`noImplicitAny`).

### 3. Catalog & Presets Specialist (`catalog-presets.md`)
- Designs and maintains the shared Parts & Labor Catalog (`/catalog`).
- Ensures seamless SKU, Barcode, Selling Price, and Buying Cost capture.
- Maintains low-stock alerts and quick-preset comboboxes.

### 4. Workshop Document Workflow Specialist (`workshop-workflow.md`)
- Builds the 12-field header grid and 3 dynamic line-item tables (`LABOR_REMOVE_REASSEMBLE`, `LABOR_REPAIR`, `REPLACEMENT`).
- Implements Enter-to-add row keyboard ergonomics.
- Ensures zero CRM friction for customer/vehicle data entry.

### 5. Job Card & Floor Operations Specialist (`job-card-floor.md`)
- Manages 1-click stage transition to `JOB_CARD` and immutable snapshot freezing.
- Implements price-redacted technician floor sheets.
- Manages the Workshop Floor Kanban Board (`/workshop/board`).

### 6. POS & Counter Sales Specialist (`pos-counter.md`)
- Implements the high-speed `/pos` screen for walk-in spare parts and lubricants.
- Manages USB/Bluetooth barcode scanner input, cart math, and tender modal.
- Implements POS shift open/close and petty cash drawer tracking.

### 7. Embedded Finance & Gross Profit Specialist (`embedded-finance.md`)
- Implements live Gross Profit and Gross Margin % formulas on repair sheets and POS sales.
- Implements Insurance Approved vs. Customer Excess split billing and advance payment deductions.
- Manages daily shop operating expense logging.

### 8. Print/Thermal & WhatsApp Export Specialist (`print-thermal-export.md`)
- Builds the exact A4 print layout matching uploaded Word templates.
- Formats 80mm ESC/POS thermal receipts.
- Implements the 1-click WhatsApp share navigation.

### 9. Reporting Specialist (`reporting.md`)
- Implements the unified Profit Ledger (`/finance/profit-ledger`).
- Builds Insurance Aging Receivables reports and Technician Turnaround analytics.

### 10. Security & Permissions Specialist (`security-permissions.md`)
- Centralizes user roles (`OWNER`, `WORKSHOP_MANAGER`, `SERVICE_ADVISOR`, `CASHIER`, `TECHNICIAN`).
- Guarantees the Cost Privacy Invariant: Buying Costs and Gross Profits are strictly hidden from non-manager roles and all print views.

### 11. API Integration-Readiness Specialist (`api-readiness.md`)
- Keeps repository contracts, DTOs, and schemas 100% compatible with NestJS and PostgreSQL.

### 12. QA & Test Specialist (`qa-test.md`)
- Writes and executes automated tests for math accuracy, state transitions, and print privacy.

### 13. UI/UX Enhancement Specialist (`ui-ux-enhancement.md`)
- Reviews visual hierarchy, typography, high-contrast readability, loading/error states, and mobile/tablet responsiveness.
