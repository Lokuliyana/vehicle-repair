# Reusable Skill: Currency & Profit Arithmetic (currency-math)

## Purpose
Ensure all monetary calculations for Sri Lankan Rupees (`Rs.`) avoid IEEE 754 floating-point drift and accurately compute Sales, Buying Costs, Gross Profit, and Gross Margin %.

## Implementation Standard
```typescript
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatRs(amount: number): string {
  return `Rs. ${roundCurrency(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateProfitAndMargin(netSales: number, totalCost: number): {
  grossProfitRs: number;
  grossMarginPct: number;
} {
  const grossProfitRs = roundCurrency(netSales - totalCost);
  const grossMarginPct = netSales > 0 ? roundCurrency((grossProfitRs / netSales) * 100) : 0;
  return { grossProfitRs, grossMarginPct };
}
```
