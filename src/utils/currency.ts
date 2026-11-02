import { WorkshopFinancialSummary, WorkshopLineItem } from '@/types';

export function roundCurrency(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatRs(amount: number): string {
  const rounded = roundCurrency(amount);
  return `Rs. ${rounded.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateProfitAndMargin(netSales: number, totalCost: number): {
  grossProfitRs: number;
  grossMarginPct: number;
} {
  const roundedNet = roundCurrency(netSales);
  const roundedCost = roundCurrency(totalCost);
  const grossProfitRs = roundCurrency(roundedNet - roundedCost);
  const grossMarginPct =
    roundedNet > 0 ? roundCurrency((grossProfitRs / roundedNet) * 100) : 0;
  return { grossProfitRs, grossMarginPct };
}

export function calculateWorkshopFinancials(
  lines: WorkshopLineItem[],
  discountRs: number = 0,
  taxRs: number = 0,
  insuranceApprovedRs: number = 0,
  advancePaidRs: number = 0
): WorkshopFinancialSummary {
  let subtotalRemoveReassembleRs = 0;
  let subtotalRepairRs = 0;
  let subtotalReplacementRs = 0;
  let totalBuyingCostRs = 0;

  for (const line of lines) {
    const selling = Math.max(0, Number(line.sellingPriceRs) || 0);
    const buying = Math.max(0, Number(line.buyingCostRs) || 0);

    totalBuyingCostRs += buying;

    if (line.category === 'LABOR_REMOVE_REASSEMBLE') {
      subtotalRemoveReassembleRs += selling;
    } else if (line.category === 'LABOR_REPAIR') {
      subtotalRepairRs += selling;
    } else if (line.category === 'REPLACEMENT') {
      subtotalReplacementRs += selling;
    }
  }

  subtotalRemoveReassembleRs = roundCurrency(subtotalRemoveReassembleRs);
  subtotalRepairRs = roundCurrency(subtotalRepairRs);
  subtotalReplacementRs = roundCurrency(subtotalReplacementRs);
  totalBuyingCostRs = roundCurrency(totalBuyingCostRs);

  const roundedDiscount = Math.max(0, roundCurrency(discountRs || 0));
  const roundedTax = Math.max(0, roundCurrency(taxRs || 0));
  const roundedInsurance = Math.max(0, roundCurrency(insuranceApprovedRs || 0));
  const roundedAdvance = Math.max(0, roundCurrency(advancePaidRs || 0));

  const grossSalesRs = roundCurrency(
    subtotalRemoveReassembleRs + subtotalRepairRs + subtotalReplacementRs
  );
  const netSalesRevenue = roundCurrency(Math.max(0, grossSalesRs - roundedDiscount));
  const grandTotalSalesRs = roundCurrency(netSalesRevenue + roundedTax);

  const { grossProfitRs, grossMarginPct } = calculateProfitAndMargin(
    netSalesRevenue,
    totalBuyingCostRs
  );

  const customerPayableRs = roundCurrency(
    Math.max(0, grandTotalSalesRs - roundedInsurance)
  );
  const balanceDueRs = roundCurrency(customerPayableRs - roundedAdvance);

  return {
    subtotalRemoveReassembleRs,
    subtotalRepairRs,
    subtotalReplacementRs,
    discountRs: roundedDiscount,
    taxRs: roundedTax,
    grandTotalSalesRs,
    totalBuyingCostRs,
    grossProfitRs,
    grossMarginPct,
    insuranceApprovedRs: roundedInsurance,
    customerPayableRs,
    advancePaidRs: roundedAdvance,
    balanceDueRs,
  };
}

export function calculatePosTotals(
  items: { lineTotalSalesRs: number; lineTotalCostRs: number }[],
  discountRs: number = 0,
  amountTenderedRs: number = 0
): {
  subtotalRs: number;
  discountRs: number;
  netTotalSalesRs: number;
  totalCostRs: number;
  grossProfitRs: number;
  changeGivenRs: number;
} {
  let subtotalRs = 0;
  let totalCostRs = 0;

  for (const item of items) {
    subtotalRs += Number(item.lineTotalSalesRs) || 0;
    totalCostRs += Number(item.lineTotalCostRs) || 0;
  }

  subtotalRs = roundCurrency(subtotalRs);
  totalCostRs = roundCurrency(totalCostRs);
  const roundedDiscount = roundCurrency(discountRs || 0);
  const netTotalSalesRs = roundCurrency(Math.max(0, subtotalRs - roundedDiscount));
  const grossProfitRs = roundCurrency(netTotalSalesRs - totalCostRs);

  const roundedTendered = roundCurrency(amountTenderedRs || 0);
  const changeGivenRs = roundCurrency(Math.max(0, roundedTendered - netTotalSalesRs));

  return {
    subtotalRs,
    discountRs: roundedDiscount,
    netTotalSalesRs,
    totalCostRs,
    grossProfitRs,
    changeGivenRs,
  };
}
