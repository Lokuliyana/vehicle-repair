# UI, Print & Ergonomic Guidelines (UI_GUIDELINES.md)
## 500 Labs — Antigravity Workshop & POS Master System

---

## 1. Global Visual Hierarchy & Aesthetic Mechanics

1. **Color System & Global Management:**
   - Managed centrally via `src/design-system/tokens.ts` and `src/design-system/global-manager.ts`.
   - **Canvas Background:** Atmospheric Cool Chalk (`#F6F8FA`) or Warm Porcelain (`#F9F8F6`).
   - **Surface Elevation:** Crisp White (`#FFFFFF`) with `1px solid rgba(15, 23, 42, 0.08)` micro-hairline borders and ambient multi-layered shadows (`0 2px 10px -2px rgba(15, 23, 42, 0.03), 0 12px 32px -4px rgba(15, 23, 42, 0.02)`).
   - **Brand Terracotta (`#F95700` / `#EA580C`):** Reserved exclusively for primary conversion CTAs, active filters, and peak histogram bars.
   - **Obsidian Anchor (`#0F172A`):** Dark hero KPI cards, stage transitions (`Convert to Job Card`), and executive controls.
   - **Tonal Semantic Pastels:**
     - *Emerald:* `#ECFDF5` bg, `#A7F3D0` border, `#047857` text (Paid, Completed, Optimal Margin > 35%).
     - *Amber:* `#FFFBEB` bg, `#FDE68A` border, `#B45309` text (Waiting Parts, Pending Insurance, Moderate Margin 20–35%).
     - *Cobalt:* `#EFF6FF` bg, `#BFDBFE` border, `#1D4ED8` text (Active Bay, In Progress, Quotation).
     - *Crimson:* `#FEF2F2` bg, `#FECACA` border, `#B91C1C` text (Cancelled, Overdue, Margin Loss < 0%).

2. **Corner Radii & Concentricity:**
   - Controls (buttons, inputs): `10px` (`rounded-control`).
   - Cards, tables, repair sections: `16px` (`rounded-card`).
   - Modals, drawers: `22px` (`rounded-modal`).
   - Status badges & hotkeys: `9999px` (`rounded-full`).
   - Concentric nested formula: $\text{Inner} = \max(0, \text{Outer} - \text{Padding})$.

3. **Typography & Tabular Numerals:**
   - Headings & Labels: Plus Jakarta Sans / Inter Display with proportional negative letter-spacing (`-0.015em`).
   - Financial & Technical Data: Enforce `tabular-nums` and monospace digits (`JetBrains Mono`) for all license plates (`CBA-1234`), chassis numbers, currency values (`Rs. 145,000.00`), and margin percentages.

---

## 2. Screen & Form Ergonomics

1. **Dense Line Tables:**
   - Row padding calibrated to `py-1.5 px-2` to fit all 3 repair sections on standard workshop laptop/tablet viewports without excessive vertical scrolling.
   - Warm Sand (`#FFF7ED`) or Cool Slate (`#F8FAFC`) column header row.

2. **Hands-on-Keyboard Flow:**
   - Pressing `Enter` on `Amount (Rs.)` appends a new blank row in `<16ms` with auto-focus on `Description`.
   - `Tab` moves across cells sequentially.
   - `⌘K` activates universal omni-search for license plates, job numbers, SKUs, and customers.

3. **Admin Margin Mode:**
   - Subtle emerald tint (`bg-emerald-50/70`) with lock glyph for internal `Buying Cost (Rs.)` and `Margin %` columns.
   - Completely unmounted from DOM for Cashier, Service Advisor, and Technician roles.

---

## 3. A4 Workshop Document Print Calibration (`@media print`)

1. **Physical Layout:**
   - A4 Portrait (`210mm × 297mm`) with `10mm` margins.
   - Zero application chrome: navigation rail, top header, status buttons, and admin cost columns carry `print:hidden`.

2. **Document Structure Fidelity:**
   - Service Banner: Top centered bold bar:
     `MECHANICAL | ELECTRICAL | SCANNING | TINKERING | AUTO PAINT | SPARE PARTS`
   - Document Title: Dynamic uppercase title framed in 2px black border (`ACCIDENT REPAIR QUOTATION`, `ACCIDENT REPAIR ESTIMATE`, `WORKSHOP JOB CARD`, `FINAL INVOICE`).
   - 12-Field Matrix: Sharp `1px solid #000` borders matching the source Word template.
   - 3-Section Tables: High-contrast bordered rows with independent 1..N numbering and subtotals.
   - Mandatory Footer: *"This is a computer generated document and does not carry a physical signature."* followed by *"T H A N K   Y O U"*.

3. **Floor Job Card Redaction:**
   - When printing `JOB_CARD`, all `Amount (Rs.)` and monetary sum columns are stripped and replaced with `Assigned Tech` and `Completed [ ]` sign-off checkboxes.

---

## 4. 80mm POS Thermal Receipt Calibration

1. **Dimensions & Flow:**
   - Fixed `80mm` width container (`~302px`), monospace font (`9pt–10pt`), high-contrast black/white.
   - Header: Workshop Name, Maharagama Branch Address, Hotline, Receipt #, Date/Time, Cashier Name.
   - Dashed horizontal dividers (`--------------------------------`).
   - Itemized lines: `Item Description`, `Qty × Unit Price = Line Total`.
   - Totals: Subtotal, Discounts, Net Total, Cash Tendered, Change Due.
   - Footer: Thermal barcode representation and greeting.
