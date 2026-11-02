# UI, Print & Ergonomic Guidelines (UI_GUIDELINES.md)

## 1. Visual Aesthetics & Design System
- **Tone:** Professional, high-contrast, modern industrial workshop utility.
- **Palette:** Deep slate backgrounds and borders (`slate-900`, `slate-700`, `slate-200`), clean white work surfaces, vibrant functional accents (emerald for completed/approved, amber for pending/margins, sky for quotations, rose for alerts).
- **Typography:** Clear tabular sans fonts (`Inter`, `system-ui`) with monospace digits (`font-mono tabular-nums`) for currency figures and serial codes.
- **Component Primitives:** Built on shadcn/ui patterns (Radix UI accessible primitives + Tailwind utility classes).

## 2. Workshop Sheet Ergonomics
- **Dense Editable Tables:** Compact row heights (`py-1.5 px-2`) to allow viewing all three repair categories simultaneously without tiring vertical scroll.
- **Continuous Enter-to-Add Navigation:**
  - Pressing `Enter` on the `Amount (Rs.)` field of any line item immediately appends a new blank row under the same category and focuses its `Description` input.
  - Up / Down arrow navigation between table cells for rapid quote generation.
- **Cost & Profit Highlight Mode:**
  - When the Owner/Manager toggles *Cost & Profit Mode*, the `Buying Cost (Rs.)` and `Margin (Rs.)` columns appear with a subtle amber/zinc background tint (`bg-amber-50/50 dark:bg-amber-950/20`) and a lock icon header.
  - When toggled off or viewed by Cashiers/Technicians, the internal cost columns are completely removed from the DOM.

## 3. A4 Workshop Print Layout (`@media print`)
- **Page Dimensions:** Standard A4 Portrait (`210mm x 297mm`) with `12mm` margins.
- **Header Fidelity:**
  - Workshop Banner: Top centered bold banner:
    *"ALL KIND OF VEHICLE, ELECTRICAL & MECHANICAL REPAIRS, SCANNING, TINKERING, ACCIDENT REPAIR & AUTO PAINT"*
  - Document Title: Dynamic uppercase title (`ACCIDENT REPAIR QUOTATION`, `ACCIDENT REPAIR ESTIMATE`, `WORKSHOP JOB CARD`, or `FINAL INVOICE`).
  - 12-Field Grid: Sharp `1px solid #1e293b` borders, high-contrast labels, and bold field values.
- **Table Formatting:**
  - Crisp bordered tables matching the uploaded docx templates.
  - Category titles with uppercase headers:
    1. `LABOR - REMOVE & REASSEMBLE`
    2. `LABOR - REPAIR`
    3. `REPLACEMENT`
- **Floor Sheet Mode (Job Card):**
  - All currency columns (`Amount Rs.`) and monetary subtotals are replaced with `Assigned Tech` and `Completed [ ]` checklist boxes.
- **Footer:**
  - Disclaimer: *"Computer generated estimate and does not carry a signature."*
  - Bottom Sign-off: *"T H A N K   Y O U"*
- **Strict Privacy Invariant:**
  - `print:hidden` on all screen toolbars, navigation buttons, tabs, and cost/margin elements.

## 4. 80mm POS Thermal Receipt Layout
- **Dimensions:** Fixed `80mm` width container (`~302px`), formatted for thermal receipt rolls (ESC/POS compatible).
- **Content Flow:**
  - Centered Workshop Name, Address, and Phone.
  - Receipt #, Date & Time, Cashier Name.
  - Customer / Vehicle reference note.
  - Dashed horizontal divider (`--------------------------------`).
  - Itemized lines: `Item Description`, `Qty x Unit Price`, `Total Amount`.
  - Subtotal, Discounts, Net Total.
  - Payment Method, Amount Tendered, Change Due.
  - Footer: Barcode representation and greeting.
