import {
  SalesGrossProfitReportData,
  InsuranceAgingReportData,
  TechnicianVelocityReportData,
  InventoryVelocityAndAlertsReportData,
} from '../types';

export type ReportExportDomain =
  | 'sales-profit'
  | 'insurance-aging'
  | 'tech-velocity'
  | 'inventory-alerts';

export interface ExportResult {
  filename: string;
  csvContent: string;
}

/**
 * Strictly sanitizes internal cost / margin fields for customer-facing distribution.
 * Under customer mode, ALL internal buying costs, cost of goods, gross profits, and profit margins
 * are strictly scrubbed and replaced with customer-safe descriptions and prices.
 */
export function sanitizeReportDataForCustomer<T extends Record<string, any>>(
  rows: T[]
): Record<string, any>[] {
  const SENSITIVE_KEYS = [
    'cost',
    'costs',
    'costrs',
    'buyingcost',
    'buyingcostrs',
    'totalcostrs',
    'directcostrs',
    'totaldirectcostrs',
    'grossprofit',
    'grossprofitrs',
    'combinedgrossprofitrs',
    'margin',
    'grossmarginpct',
    'marginpct',
    'profit',
    'profitrs',
  ];

  return rows.map((row) => {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
      if (SENSITIVE_KEYS.some((sensitive) => normalizedKey.includes(sensitive))) {
        continue; // Exclude internal financial leak!
      }
      sanitized[key] = val;
    }
    return sanitized;
  });
}

/**
 * Builds CSV for Sales & Gross Profit Breakdown
 */
export function buildSalesProfitCsv(
  data: SalesGrossProfitReportData,
  customerFacing = false
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customerFacing
    ? `Customer_Revenue_Summary_${data.dateRange.range}_${timestamp}.csv`
    : `Executive_Sales_Gross_Profit_${data.dateRange.range}_${timestamp}.csv`;

  let headers: string[];
  let rows: string[][];

  const streams = [
    data.streams.workshopLaborRR || {
      name: 'Workshop Labor R&R',
      revenueRs: data.streams.workshopLabor.revenueRs * 0.4,
      costRs: data.streams.workshopLabor.costRs * 0.4,
      grossProfitRs: data.streams.workshopLabor.grossProfitRs * 0.4,
      grossMarginPct: data.streams.workshopLabor.grossMarginPct,
      percentageOfTotalRevenue: data.streams.workshopLabor.percentageOfTotalRevenue * 0.4,
    },
    data.streams.workshopLaborRepair || {
      name: 'Workshop Labor Repair',
      revenueRs: data.streams.workshopLabor.revenueRs * 0.6,
      costRs: data.streams.workshopLabor.costRs * 0.6,
      grossProfitRs: data.streams.workshopLabor.grossProfitRs * 0.6,
      grossMarginPct: data.streams.workshopLabor.grossMarginPct,
      percentageOfTotalRevenue: data.streams.workshopLabor.percentageOfTotalRevenue * 0.6,
    },
    data.streams.workshopParts,
    data.streams.counterPosSales,
  ];

  if (customerFacing) {
    // Sanitized: ONLY revenue and share visible
    headers = ['Revenue Stream', 'Gross Sales (LKR)', 'Revenue Share %'];
    rows = streams.map((s) => [
      `"${s.name}"`,
      s.revenueRs.toFixed(2),
      `${s.percentageOfTotalRevenue.toFixed(1)}%`,
    ]);
    rows.push([
      '"Total Combined Portfolio"',
      data.totalNetSalesRs.toFixed(2),
      '100.0%',
    ]);
  } else {
    // Executive Management: Full internal costs, gross profit and margin %
    headers = [
      'Revenue Stream',
      'Gross Sales (LKR)',
      'Direct Cost (LKR)',
      'Gross Profit (LKR)',
      'Gross Margin %',
      'Revenue Share %',
    ];
    rows = streams.map((s) => [
      `"${s.name}"`,
      s.revenueRs.toFixed(2),
      s.costRs.toFixed(2),
      s.grossProfitRs.toFixed(2),
      `${s.grossMarginPct.toFixed(1)}%`,
      `${s.percentageOfTotalRevenue.toFixed(1)}%`,
    ]);
    rows.push([
      '"Total Combined Portfolio"',
      data.totalNetSalesRs.toFixed(2),
      data.totalDirectCostRs.toFixed(2),
      data.combinedGrossProfitRs.toFixed(2),
      `${data.grossMarginPct.toFixed(1)}%`,
      '100.0%',
    ]);
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return { filename, csvContent };
}

/**
 * Builds CSV for Insurance Claims Aging Report
 */
export function buildInsuranceAgingCsv(
  data: InsuranceAgingReportData,
  customerFacing = false
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customerFacing
    ? `Insurance_Claim_Aging_Public_${timestamp}.csv`
    : `Executive_Insurance_Claim_Aging_${timestamp}.csv`;

  const headers = [
    'Job Number',
    'Vehicle Plate',
    'Vehicle Make / Model',
    'Insurance Company',
    'Claim Date',
    'Aging Days',
    'Aging Bucket',
    'Approved Claim (LKR)',
    'Settled Amount (LKR)',
    'Outstanding Balance (LKR)',
  ];

  const rows = data.itemizedClaims.map((claim) => [
    `"${claim.jobNumber}"`,
    `"${claim.vehiclePlate}"`,
    `"${claim.vehicleMakeModel}"`,
    `"${claim.insuranceCompany}"`,
    `"${claim.invoiceDate}"`,
    `${claim.agingDays}`,
    `"${claim.bucketLabel}"`,
    claim.approvedClaimRs.toFixed(2),
    claim.settledAmountRs.toFixed(2),
    claim.balanceDueRs.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return { filename, csvContent };
}

/**
 * Builds CSV for Technician Turnaround & Floor Productivity Report
 */
export function buildTechnicianVelocityCsv(
  data: TechnicianVelocityReportData,
  customerFacing = false
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customerFacing
    ? `Technician_Productivity_Public_${timestamp}.csv`
    : `Executive_Technician_Productivity_${timestamp}.csv`;

  let headers: string[];
  let rows: string[][];

  if (customerFacing) {
    headers = [
      'Technician Name',
      'Completed Tasks',
      'Completion Rate %',
      'Completed Jobs',
      'On-Time Status',
    ];
    rows = data.technicians.map((t) => [
      `"${t.technicianName}"`,
      `${t.completedTasks}`,
      `${t.taskCompletionRatePct.toFixed(1)}%`,
      `${t.completedJobsCount}`,
      `"${t.velocityStatus === 'AHEAD' ? 'Ahead of Schedule' : t.velocityStatus === 'BEHIND' ? 'In Progress' : 'On Track'}"`,
    ]);
  } else {
    headers = [
      'Technician Name',
      'Assigned Tasks',
      'Completed Tasks',
      'Task Completion %',
      'Completed Jobs',
      'Active Floor Jobs',
      'Target Days',
      'Actual Turnaround Days',
      'Velocity Status',
      'Labor Efficiency Index',
    ];
    rows = data.technicians.map((t) => [
      `"${t.technicianName}"`,
      `${t.totalAssignedTasks}`,
      `${t.completedTasks}`,
      `${t.taskCompletionRatePct.toFixed(1)}%`,
      `${t.completedJobsCount}`,
      `${t.activeInProgressJobsCount}`,
      `${t.avgEstimatedTargetDays}`,
      `${t.avgTurnaroundDays}`,
      `"${t.velocityStatus}"`,
      `${t.laborEfficiencyIndex ?? 100}%`,
    ]);
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return { filename, csvContent };
}

/**
 * Builds CSV for Fast-Moving Parts & Low-Stock Alerts
 */
export function buildInventoryAlertsCsv(
  data: InventoryVelocityAndAlertsReportData,
  customerFacing = false
): ExportResult {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customerFacing
    ? `Catalog_Replenishment_Customer_${timestamp}.csv`
    : `Executive_Inventory_Velocity_Alerts_${timestamp}.csv`;

  let headers: string[];
  let rows: string[][];

  if (customerFacing) {
    // Sanitized: No internal buying costs or profit margins!
    headers = [
      'SKU',
      'Item Name',
      'Category',
      'Total Consumed Qty',
      'Unit Selling Price (LKR)',
      'Total Selling Revenue (LKR)',
      'Turnover Rate',
      'Stock Status',
    ];
    rows = data.fastMovingParts.map((p) => {
      const alert = data.lowStockAlerts.find((a) => a.sku === p.sku);
      const unitPrice = p.totalQtyConsumed > 0 ? (p.totalRevenueRs / p.totalQtyConsumed).toFixed(2) : '0.00';
      return [
        `"${p.sku}"`,
        `"${p.name}"`,
        `"${p.category}"`,
        `${p.totalQtyConsumed} ${p.uom}`,
        unitPrice,
        p.totalRevenueRs.toFixed(2),
        `"${p.turnoverRate || 'High'}"`,
        `"${alert ? alert.status : 'HEALTHY'}"`,
      ];
    });
  } else {
    // Executive management view: includes buying costs, gross profit, and margin %
    headers = [
      'SKU',
      'Item Name',
      'Category',
      'Workshop Qty',
      'POS Qty',
      'Total Consumed',
      'Selling Revenue (LKR)',
      'Buying Cost (LKR)',
      'Gross Profit (LKR)',
      'Gross Margin %',
      'Stock Alert Status',
      'Deficit Qty',
    ];
    rows = data.fastMovingParts.map((p) => {
      const alert = data.lowStockAlerts.find((a) => a.sku === p.sku);
      return [
        `"${p.sku}"`,
        `"${p.name}"`,
        `"${p.category}"`,
        `${p.workshopQtyUsed}`,
        `${p.posQtySold}`,
        `${p.totalQtyConsumed} ${p.uom}`,
        p.totalRevenueRs.toFixed(2),
        p.totalCostRs.toFixed(2),
        p.grossProfitRs.toFixed(2),
        `${p.grossMarginPct.toFixed(1)}%`,
        `"${alert ? alert.status : 'HEALTHY'}"`,
        `${alert ? alert.deficitQty : 0}`,
      ];
    });
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return { filename, csvContent };
}

/**
 * Downloads a CSV string in browser environment
 */
export function triggerCsvDownload(filename: string, csvContent: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean PDF print for reports
 */
export function triggerReportPdfPrint(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
