# Reusable Skill: WhatsApp Share Link Generator (whatsapp-message-builder)

## Purpose
Builds a 1-click WhatsApp share link (`https://wa.me/?text=...`) without requiring any paid WhatsApp Business API, allowing estimators to share a concise summary with vehicle owners or insurance agents.

## Structure
```typescript
export function buildWhatsAppShareUrl(sheet: WorkshopJobSheet): string {
  const text = [
    `*${sheet.docStage} - 500 LABS WORKSHOP*`,
    `*Job No:* ${sheet.jobNumber}`,
    `*Vehicle No:* ${sheet.vehicleNumber} (${sheet.vehicleMake} ${sheet.vehicleModel})`,
    `*Nature of Repair:* ${sheet.natureOfRepair}`,
    `--------------------------------`,
    `*Remove & Reassemble:* ${formatRs(sheet.subtotalRemoveReassembleRs)}`,
    `*Repair Labor:* ${formatRs(sheet.subtotalRepairRs)}`,
    `*Parts Replacement:* ${formatRs(sheet.subtotalReplacementRs)}`,
    `*Grand Total:* ${formatRs(sheet.grandTotalSalesRs)}`,
    ...(sheet.insuranceApprovedRs > 0 ? [`*Insurance Approved:* ${formatRs(sheet.insuranceApprovedRs)}`] : []),
    `*Customer Balance Due:* ${formatRs(sheet.balanceDueRs)}`,
    `--------------------------------`,
    `_Thank you for choosing our workshop._`
  ].join('\n');

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
```
