# UI, Print & Ergonomic Guidelines (UI_GUIDELINES.md)

## 1. Screen Ergonomics
- **High-Contrast Industrial Utility:** Use clean slate/zinc neutrals (`#0f172a`, `#334155`, `#f8fafc`) with clear status badges.
- **Dense Editable Tables:** Line-item tables in the Workshop Sheet and POS Cart must use compact padding (`py-1.5 px-2`) so all 3 repair sections are easily scannable without excessive scrolling.
- **Admin Margin Highlight:** When the *Cost & Profit Mode* toggle is active, render `Buying Cost (Rs.)` and `Line Profit (Rs.)` columns with a subtle amber/slate background tint (`bg-amber-50/60`) and a lock icon so staff immediately recognize they are internal-only columns.

## 2. A4 Workshop Print Calibration (`@media print`)
- **Paper Size:** A4 Portrait (`210mm x 297mm`).
- **Strict Redaction:** All navigation bars, buttons, status pills, and internal cost/profit columns must carry `print:hidden`.
- **Header & Footer Fidelity:** Must match the uploaded Word templates (`Vehicle Repair Quotation 1.docx` and `Vehicle Repair Estimate 1(1).docx`) with crisp `1px solid #000` table borders for maximum legibility when printed on laser/inkjet paper or photographed by insurance assessors.

## 3. 80mm POS Thermal Receipt Calibration
- Provide a dedicated thermal print container (`width: 80mm`, monospace/clean sans font, `9pt–10pt`) displaying Shop Name, Receipt #, Date/Time, Vehicle/Customer note, itemized Qty x Price, Total, Cash Tendered, Change, and footer thank-you line.