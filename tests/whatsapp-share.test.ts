import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  extractPhoneFromCustomerInfo,
  formatWhatsAppSummary,
  buildWhatsAppShareUrl,
} from '@/utils/whatsapp';
import { WorkshopJobSheet } from '@/types';

const MOCK_JOB: WorkshopJobSheet = {
  id: 'job-test-1',
  jobNumber: 'JOB-2026-0042',
  docStage: 'ESTIMATE',
  floorStatus: 'APPROVED_IN_PROGRESS',
  paymentStatus: 'UNPAID',
  header: {
    date: '2026-11-02',
    jobNumber: 'JOB-2026-0042',
    vehicleNumber: 'WP CAB-4521',
    natureOfRepair: 'Accident Damage Front Left Side & Bumper Replacement',
    vehicleMake: 'Toyota',
    chassisNumber: 'NZE141-9034821',
    vehicleModel: 'Corolla Axio',
    daysForCompletion: '4 Days',
    yearOfMake: '2018',
    vehicleColor: 'Pearl White (070)',
    insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
    customerInfo: 'Kasun Perera - 077 889 1234 / No 45, Galle Road, Colombo 03',
  },
  lines: [
    {
      id: 'l1',
      rowNo: 1,
      category: 'LABOR_REMOVE_REASSEMBLE',
      description: 'Front bumper & lower grill removal',
      sellingPriceRs: 7000,
      buyingCostRs: 2000, // SENSITIVE INTERNAL COST
      isCompleted: true,
    },
    {
      id: 'l2',
      rowNo: 1,
      category: 'LABOR_REPAIR',
      description: 'Front left fender beating & alignment',
      sellingPriceRs: 18000,
      buyingCostRs: 4500, // SENSITIVE INTERNAL COST
      isCompleted: true,
    },
    {
      id: 'l3',
      rowNo: 1,
      category: 'REPLACEMENT',
      description: 'Axio Front Bumper Shell OEM Genuine',
      sellingPriceRs: 60000,
      buyingCostRs: 42000, // SENSITIVE INTERNAL COST
      isCompleted: true,
    },
  ],
  financials: {
    subtotalRemoveReassembleRs: 7000,
    subtotalRepairRs: 18000,
    subtotalReplacementRs: 60000,
    discountRs: 2000,
    taxRs: 0,
    grandTotalSalesRs: 83000,
    totalBuyingCostRs: 48500, // SENSITIVE INTERNAL COST
    grossProfitRs: 34500, // SENSITIVE INTERNAL PROFIT
    grossMarginPct: 41.57, // SENSITIVE INTERNAL MARGIN
    insuranceApprovedRs: 70000,
    customerPayableRs: 13000,
    advancePaidRs: 5000,
    balanceDueRs: 8000,
  },
  createdAt: '2026-11-02T08:00:00Z',
  updatedAt: '2026-11-02T09:00:00Z',
};

describe('WhatsApp Share Link Builder & Privacy Verification (Phase 4)', () => {
  it('normalizes various Sri Lankan phone number formats to international digits', () => {
    expect(normalizePhoneNumber('0771234567')).toBe('94771234567');
    expect(normalizePhoneNumber('077 123 4567')).toBe('94771234567');
    expect(normalizePhoneNumber('+94 77 123 4567')).toBe('94771234567');
    expect(normalizePhoneNumber('+94 077 123 4567')).toBe('94771234567'); // Redundant zero stripped
    expect(normalizePhoneNumber('071-555-1234')).toBe('94715551234');
    expect(normalizePhoneNumber('011 234 5678')).toBe('94112345678');
    expect(normalizePhoneNumber('94771234567')).toBe('94771234567');
    expect(normalizePhoneNumber('')).toBe('');
    expect(normalizePhoneNumber(undefined)).toBe('');
  });

  it('extracts customer phone number automatically from customerInfo string', () => {
    expect(
      extractPhoneFromCustomerInfo('Kasun Perera - 077 889 1234 / No 45, Galle Road')
    ).toBe('94778891234');

    expect(
      extractPhoneFromCustomerInfo('Sunil Silva (+94 71 234 5678), Kandy')
    ).toBe('94712345678');

    expect(
      extractPhoneFromCustomerInfo('Nimal - +94 077 123 4567 - Matara')
    ).toBe('94771234567');

    expect(
      extractPhoneFromCustomerInfo('Kamal 94778891234 Colombo')
    ).toBe('94778891234');

    expect(extractPhoneFromCustomerInfo('Walk-in Customer without phone')).toBe('');
  });

  it('formats structured text summary for WhatsApp without paid API', () => {
    const summary = formatWhatsAppSummary(MOCK_JOB);

    expect(summary).toContain('ANTIGRAVITY AUTO CARE');
    expect(summary).toContain('REPAIR ESTIMATE');
    expect(summary).toContain('Job No:* JOB-2026-0042');
    expect(summary).toContain('Vehicle:* WP CAB-4521 (Toyota Corolla Axio)');
    expect(summary).toContain('Repair Nature:* Accident Damage Front Left Side');
    expect(summary).toContain('1. Remove & Reassemble:* Rs. 7,000.00');
    expect(summary).toContain('2. Labor - Repair:* Rs. 18,000.00');
    expect(summary).toContain('3. Replacement (Parts):* Rs. 60,000.00');
    expect(summary).toContain('Gross Total:* Rs. 85,000.00');
    expect(summary).toContain('Discount:* -Rs. 2,000.00');
    expect(summary).toContain('Grand Total:* Rs. 83,000.00');
    expect(summary).toContain('Insurance Approved:* Rs. 70,000.00');
    expect(summary).toContain('Customer Payable:* Rs. 13,000.00');
    expect(summary).toContain('Advance Paid:* Rs. 5,000.00');
    expect(summary).toContain('Balance Due:* Rs. 8,000.00');
    expect(summary).toContain('Computer generated estimate and does not carry a signature.');
    expect(summary).toContain('THANK YOU');
  });

  it('STRICT PRIVACY GUARANTEE: Never leaks buying costs or gross profit margins in WhatsApp summary or URL', () => {
    const summary = formatWhatsAppSummary(MOCK_JOB);
    const url = buildWhatsAppShareUrl(MOCK_JOB);

    // Internal sensitive cost numbers
    expect(summary).not.toContain('48500');
    expect(summary).not.toContain('48,500');
    expect(summary).not.toContain('34500');
    expect(summary).not.toContain('34,500');
    expect(summary).not.toContain('41.57');
    expect(summary).not.toContain('2000.00'); // buying cost of line 1
    expect(summary).not.toContain('4500.00'); // buying cost of line 2
    expect(summary).not.toContain('42000'); // buying cost of line 3
    expect(summary.toLowerCase()).not.toContain('buying cost');
    expect(summary.toLowerCase()).not.toContain('profit');
    expect(summary.toLowerCase()).not.toContain('margin');

    // URL must not contain sensitive info
    expect(url).not.toContain('48500');
    expect(url).not.toContain('34500');
    expect(url.toLowerCase()).not.toContain('profit');
    expect(url.toLowerCase()).not.toContain('cost');
  });

  it('builds valid WhatsApp URL targeting customer phone', () => {
    const url = buildWhatsAppShareUrl(MOCK_JOB);
    expect(url.startsWith('https://wa.me/94778891234?text=')).toBe(true);

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('WP CAB-4521');
    expect(decoded).toContain('Grand Total:* Rs. 83,000.00');
  });

  it('falls back to generic wa.me link when no phone is available', () => {
    const jobWithoutPhone: WorkshopJobSheet = {
      ...MOCK_JOB,
      header: {
        ...MOCK_JOB.header,
        customerInfo: 'Direct Walk-in customer with no contact',
      },
    };

    const url = buildWhatsAppShareUrl(jobWithoutPhone);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
  });
});
