import { describe, it, expect } from 'vitest';
import {
  roundCurrency,
  formatRs,
  calculateWorkshopFinancials,
  calculatePosTotals,
} from '@/utils/currency';
import { WorkshopLineItem } from '@/types';

describe('Currency & Profit Arithmetic (currency-math skill)', () => {
  it('prevents IEEE 754 floating-point drift with roundCurrency', () => {
    // 0.1 + 0.2 = 0.30000000000000004
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    expect(roundCurrency(1234.567)).toBe(1234.57);
    expect(roundCurrency(1234.564)).toBe(1234.56);
  });

  it('formats Sri Lankan Rupees correctly with formatRs', () => {
    expect(formatRs(5000)).toBe('Rs. 5,000.00');
    expect(formatRs(1234567.89)).toBe('Rs. 1,234,567.89');
    expect(formatRs(0)).toBe('Rs. 0.00');
  });

  it('calculates 3-Section Subtotals, Gross Profit, and Gross Margin matching Master Guide specification', () => {
    // Master Guide test case:
    // Labor Sales = Rs. 25,000 (Cost = Rs. 5,000)
    // Replacement Sales = Rs. 60,000 (Buying Cost = Rs. 42,000)
    // Discount = Rs. 2,000
    // Net Sales = Rs. 83,000, Total Cost = Rs. 47,000, Gross Profit = Rs. 36,000, Gross Margin = 43.37%
    const lines: WorkshopLineItem[] = [
      {
        id: '1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Bumper Remove',
        sellingPriceRs: 10000,
        buyingCostRs: 2000,
        isCompleted: true,
      },
      {
        id: '2',
        rowNo: 1,
        category: 'LABOR_REPAIR',
        description: 'Fender Repair',
        sellingPriceRs: 15000,
        buyingCostRs: 3000,
        isCompleted: true,
      },
      {
        id: '3',
        rowNo: 1,
        category: 'REPLACEMENT',
        description: 'Headlamp OEM',
        sellingPriceRs: 60000,
        buyingCostRs: 42000,
        isCompleted: true,
      },
    ];

    const financials = calculateWorkshopFinancials(lines, 2000, 0, 0, 0);

    expect(financials.subtotalRemoveReassembleRs).toBe(10000);
    expect(financials.subtotalRepairRs).toBe(15000);
    expect(financials.subtotalReplacementRs).toBe(60000);
    expect(financials.grandTotalSalesRs).toBe(83000);
    expect(financials.totalBuyingCostRs).toBe(47000);
    expect(financials.grossProfitRs).toBe(36000);
    expect(financials.grossMarginPct).toBe(43.37);
  });

  it('calculates Insurance Split Billing and Customer Balance Due accurately', () => {
    // Invoice Grand Total = Rs. 83,000
    // Insurance Approved = Rs. 70,000
    // Advance Paid = Rs. 5,000
    // Customer Balance Due = Rs. 8,000
    const lines: WorkshopLineItem[] = [
      {
        id: '1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Labor',
        sellingPriceRs: 25000,
        buyingCostRs: 5000,
        isCompleted: true,
      },
      {
        id: '2',
        rowNo: 1,
        category: 'REPLACEMENT',
        description: 'Parts',
        sellingPriceRs: 60000,
        buyingCostRs: 42000,
        isCompleted: true,
      },
    ];

    const financials = calculateWorkshopFinancials(
      lines,
      2000, // discount
      0, // tax
      70000, // insurance approved
      5000 // advance paid
    );

    expect(financials.grandTotalSalesRs).toBe(83000);
    expect(financials.customerPayableRs).toBe(13000); // 83000 - 70000
    expect(financials.advancePaidRs).toBe(5000);
    expect(financials.balanceDueRs).toBe(8000); // 13000 - 5000
  });

  it('calculates POS cart totals, tender, and change correctly', () => {
    const items = [
      { lineTotalSalesRs: 14500, lineTotalCostRs: 11200 },
      { lineTotalSalesRs: 2200, lineTotalCostRs: 1400 },
      { lineTotalSalesRs: 1200, lineTotalCostRs: 800 },
    ];

    const totals = calculatePosTotals(items, 100, 20000);

    expect(totals.subtotalRs).toBe(17900);
    expect(totals.discountRs).toBe(100);
    expect(totals.netTotalSalesRs).toBe(17800);
    expect(totals.totalCostRs).toBe(13400);
    expect(totals.grossProfitRs).toBe(4400);
    expect(totals.changeGivenRs).toBe(2200); // 20000 - 17800
  });
});
