# Reusable Skill: A4 Print Engine & Privacy Redaction (a4-print-engine)

## Purpose
Renders an exact, high-contrast, laser-printable A4 document matching the uploaded workshop templates (`Vehicle Repair Quotation 1.docx` and `Vehicle Repair Estimate 1(1).docx`), while guaranteeing zero leakage of internal buying costs or profit margins.

## Key Rules
1. Wrap all screen UI (navigation, edit controls, buttons, margin toggles) in `print:hidden`.
2. Format printable root with standard A4 dimensions (`210mm` width, high-contrast `#1e293b` borders).
3. Include required headers:
   - Centered service banner: `"ALL KIND OF VEHICLE, ELECTRICAL & MECHANICAL REPAIRS, SCANNING, TINKERING, ACCIDENT REPAIR & AUTO PAINT"`
   - Exact 12-field grid.
   - 3 separate tables: `LABOR - REMOVE & REASSEMBLE`, `LABOR - REPAIR`, `REPLACEMENT`.
4. Include required footers:
   - Disclaimer: `"Computer generated estimate and does not carry a signature."`
   - Sign-off: `"T H A N K   Y O U"`
5. Job Card Mode: If printing in `JOB_CARD` stage, hide `Amount (Rs.)` column and show technician checklist checkboxes.
