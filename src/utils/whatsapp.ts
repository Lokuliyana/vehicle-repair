import { WorkshopJobSheet } from '@/types';
import { formatRs } from './currency';

/**
 * Normalizes Sri Lankan phone numbers:
 * Converts `0771234567` or `077 123 4567` to `94771234567`.
 * Removes all dashes, spaces, and punctuation.
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('940') && cleaned.length >= 12) {
    cleaned = '94' + cleaned.substring(3);
  } else if (cleaned.startsWith('0') && cleaned.length >= 10) {
    cleaned = '94' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Extracts a likely phone number from a customerInfo string like:
 * "Kasun Perera - 077 889 1234 / No 45, Galle Road"
 */
export function extractPhoneFromCustomerInfo(customerInfo?: string): string {
  if (!customerInfo) return '';
  // Look for mobile pattern e.g. 07x xxx xxxx or +947x xxx xxxx or 947x xxx xxxx
  const match = customerInfo.match(
    /(?:\+?94\s*0?|0)\s*(?:7[0-9]|11|2[1-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|8[1-9])\s*[\d\s-]{6,9}/
  );
  if (match) {
    return normalizePhoneNumber(match[0]);
  }
  return '';
}

/**
 * Formats a clean, readable text summary of a Workshop Job Sheet for WhatsApp.
 * PRIVACY GUARANTEE: Never leaks buying costs or gross profit margins!
 */
export function formatWhatsAppSummary(job: WorkshopJobSheet): string {
  const { header, financials, docStage } = job;
  const stageTitle =
    docStage === 'QUOTATION'
      ? 'REPAIR QUOTATION'
      : docStage === 'INVOICE'
      ? 'REPAIR INVOICE'
      : docStage === 'JOB_CARD'
      ? 'WORKSHOP JOB CARD'
      : 'REPAIR ESTIMATE';

  const lines = [
    `*ANTIGRAVITY AUTO CARE*`,
    `*${stageTitle}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `*Job No:* ${header.jobNumber || 'DRAFT'}`,
    `*Date:* ${header.date || '-'}`,
    `*Vehicle:* ${header.vehicleNumber || '-'}${header.vehicleMake || header.vehicleModel ? ` (${[header.vehicleMake, header.vehicleModel].filter(Boolean).join(' ')})` : ''}`,
    `*Repair Nature:* ${header.natureOfRepair || 'General Repairs'}`,
    `*Insurance:* ${header.insuranceName || 'Direct / Cash Customer'}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `*1. Remove & Reassemble:* ${formatRs(financials.subtotalRemoveReassembleRs)}`,
    `*2. Labor - Repair:* ${formatRs(financials.subtotalRepairRs)}`,
    `*3. Replacement (Parts):* ${formatRs(financials.subtotalReplacementRs)}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
  ];

  const gross =
    financials.subtotalRemoveReassembleRs +
    financials.subtotalRepairRs +
    financials.subtotalReplacementRs;

  lines.push(`*Gross Total:* ${formatRs(gross)}`);

  if (financials.discountRs > 0) {
    lines.push(`*Discount:* -${formatRs(financials.discountRs)}`);
  }
  if (financials.taxRs > 0) {
    lines.push(`*Tax:* +${formatRs(financials.taxRs)}`);
  }

  lines.push(`*Grand Total:* ${formatRs(financials.grandTotalSalesRs)}`);

  if (financials.insuranceApprovedRs > 0) {
    lines.push(`*Insurance Approved:* ${formatRs(financials.insuranceApprovedRs)}`);
    lines.push(`*Customer Payable:* ${formatRs(financials.customerPayableRs)}`);
  }
  if (financials.advancePaidRs > 0) {
    lines.push(`*Advance Paid:* ${formatRs(financials.advancePaidRs)}`);
  }
  if (
    financials.balanceDueRs !== undefined &&
    (financials.insuranceApprovedRs > 0 || financials.advancePaidRs > 0 || docStage === 'INVOICE')
  ) {
    lines.push(`*Balance Due:* ${formatRs(financials.balanceDueRs)}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Computer generated estimate and does not carry a signature._`);
  lines.push(`*THANK YOU*`);

  return lines.join('\n');
}

/**
 * Builds a direct web/mobile link to share via WhatsApp.
 * Opens `https://wa.me/${phone}?text=...` if phone is given,
 * or `https://wa.me/?text=...` to let the user pick their chat.
 */
export function buildWhatsAppShareUrl(job: WorkshopJobSheet, explicitPhone?: string): string {
  const phone = normalizePhoneNumber(explicitPhone) || extractPhoneFromCustomerInfo(job.header?.customerInfo);
  const text = formatWhatsAppSummary(job);
  const encodedText = encodeURIComponent(text);

  if (phone) {
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
