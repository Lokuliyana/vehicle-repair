import {
  WorkshopJobSheet,
  CatalogItem,
  PosSaleTransaction,
  DateRangeFilter,
  SalesGrossProfitReportData,
  InsuranceAgingBucketKey,
  InsuranceAgingBucketSummary,
  InsuranceCompanyAgingSummary,
  ItemizedInsuranceClaim,
  InsuranceAgingReportData,
  TechnicianTurnaroundMetric,
  TechnicianVelocityReportData,
  FastMovingPartMetric,
  LowStockAlertItem,
} from '@/types';
import { roundCurrency } from '@/utils/currency';
import { extractDateString, isDateInFilter } from '../repository/finance.repository.mock';

// -------------------------------------------------------------------------
// 1. Insurance Aging Pure Calculations
// -------------------------------------------------------------------------

export const AGING_BUCKET_LABELS: Record<InsuranceAgingBucketKey, string> = {
  '0_30': '0 - 30 Days (Current)',
  '31_60': '31 - 60 Days (Aging)',
  '61_90': '61 - 90 Days (Attention Required)',
  '90_PLUS': '90+ Days (Critical Overdue)',
};

export const GRANULAR_AGING_BUCKET_LABELS: Record<'0_15' | '16_30' | '31_60' | '60_PLUS', string> = {
  '0_15': '0 - 15 Days (Current)',
  '16_30': '16 - 30 Days (Due Soon)',
  '31_60': '31 - 60 Days (Aging)',
  '60_PLUS': '60+ Days (Overdue)',
};

export function calculateInsuranceAgingBucket(days: number): InsuranceAgingBucketKey {
  if (days <= 30) return '0_30';
  if (days <= 60) return '31_60';
  if (days <= 90) return '61_90';
  return '90_PLUS';
}

export function calculateGranularAgingBucket(days: number): '0_15' | '16_30' | '31_60' | '60_PLUS' {
  if (days <= 15) return '0_15';
  if (days <= 30) return '16_30';
  if (days <= 60) return '31_60';
  return '60_PLUS';
}

export function calculateAgingDays(
  claimDateInput: string | Date | undefined,
  referenceNow: Date = new Date()
): number {
  const claimDateStr = extractDateString(claimDateInput);
  if (!claimDateStr) return 0;

  const [cYear, cMonth, cDay] = claimDateStr.split('-').map(Number);
  const claimMidnight = new Date(cYear, cMonth - 1, cDay).getTime();

  const nowMidnight = new Date(
    referenceNow.getFullYear(),
    referenceNow.getMonth(),
    referenceNow.getDate()
  ).getTime();

  const diffMs = nowMidnight - claimMidnight;
  if (diffMs <= 0) return 0;

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function aggregateInsuranceAging(
  jobs: WorkshopJobSheet[],
  referenceNow: Date = new Date()
): InsuranceAgingReportData {
  const referenceDateStr = extractDateString(referenceNow);

  const buckets: Record<InsuranceAgingBucketKey, InsuranceAgingBucketSummary> = {
    '0_30': {
      bucketKey: '0_30',
      label: AGING_BUCKET_LABELS['0_30'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
    '31_60': {
      bucketKey: '31_60',
      label: AGING_BUCKET_LABELS['31_60'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
    '61_90': {
      bucketKey: '61_90',
      label: AGING_BUCKET_LABELS['61_90'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
    '90_PLUS': {
      bucketKey: '90_PLUS',
      label: AGING_BUCKET_LABELS['90_PLUS'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
  };

  const granularBuckets: Record<'0_15' | '16_30' | '31_60' | '60_PLUS', InsuranceAgingBucketSummary> = {
    '0_15': {
      bucketKey: '0_15',
      label: GRANULAR_AGING_BUCKET_LABELS['0_15'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
    '16_30': {
      bucketKey: '16_30',
      label: GRANULAR_AGING_BUCKET_LABELS['16_30'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
    '31_60': {
      bucketKey: '31_60',
      label: GRANULAR_AGING_BUCKET_LABELS['31_60'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
    '60_PLUS': {
      bucketKey: '60_PLUS',
      label: GRANULAR_AGING_BUCKET_LABELS['60_PLUS'],
      claimCount: 0,
      totalApprovedRs: 0,
      totalSettledRs: 0,
      outstandingBalanceRs: 0,
    },
  };

  const itemizedClaims: ItemizedInsuranceClaim[] = [];
  const companyMap = new Map<
    string,
    {
      totalApproved: number;
      settled: number;
      outstanding: number;
      oldestDays: number;
      count: number;
    }
  >();

  for (const job of jobs) {
    const approvedRs = Math.max(0, Number(job.financials?.insuranceApprovedRs) || 0);
    let insuranceName = (job.header?.insuranceName || '').trim();

    // Include if approved insurance is > 0
    if (approvedRs > 0) {
      if (!insuranceName || insuranceName.toLowerCase() === 'direct cash customer') {
        insuranceName = 'Unspecified Insurance Company';
      }

      const settledRs = (job.payments || [])
        .filter((p) => p.paymentType === 'INSURANCE_SETTLEMENT')
        .reduce((sum, p) => sum + (Number(p.amountRs) || 0), 0);

      const balanceDueRs = roundCurrency(Math.max(0, approvedRs - settledRs));

      // Active outstanding claim
      if (balanceDueRs > 0) {
        const claimDate = job.header?.date || job.createdAt;
        const agingDays = calculateAgingDays(claimDate, referenceNow);
        const bucketKey = calculateInsuranceAgingBucket(agingDays);
        const granularBucketKey = calculateGranularAgingBucket(agingDays);

        // Update bucket summary
        buckets[bucketKey].claimCount += 1;
        buckets[bucketKey].totalApprovedRs = roundCurrency(
          buckets[bucketKey].totalApprovedRs + approvedRs
        );
        buckets[bucketKey].totalSettledRs = roundCurrency(
          buckets[bucketKey].totalSettledRs + settledRs
        );
        buckets[bucketKey].outstandingBalanceRs = roundCurrency(
          buckets[bucketKey].outstandingBalanceRs + balanceDueRs
        );

        // Update granular bucket summary
        granularBuckets[granularBucketKey].claimCount += 1;
        granularBuckets[granularBucketKey].totalApprovedRs = roundCurrency(
          granularBuckets[granularBucketKey].totalApprovedRs + approvedRs
        );
        granularBuckets[granularBucketKey].totalSettledRs = roundCurrency(
          granularBuckets[granularBucketKey].totalSettledRs + settledRs
        );
        granularBuckets[granularBucketKey].outstandingBalanceRs = roundCurrency(
          granularBuckets[granularBucketKey].outstandingBalanceRs + balanceDueRs
        );

        // Add to itemized claims
        itemizedClaims.push({
          jobId: job.id,
          jobNumber: job.jobNumber,
          vehiclePlate: job.header?.vehicleNumber || 'Unknown Plate',
          vehicleMakeModel: `${job.header?.vehicleMake || ''} ${job.header?.vehicleModel || ''}`.trim(),
          insuranceCompany: insuranceName,
          invoiceDate: extractDateString(claimDate),
          agingDays,
          agingBucket: bucketKey,
          bucketLabel: AGING_BUCKET_LABELS[bucketKey],
          granularBucket: granularBucketKey,
          approvedClaimRs: approvedRs,
          settledAmountRs: settledRs,
          balanceDueRs,
          docStage: job.docStage,
        });

        // Update company map
        const currentCompany = companyMap.get(insuranceName) || {
          totalApproved: 0,
          settled: 0,
          outstanding: 0,
          oldestDays: 0,
          count: 0,
        };

        currentCompany.totalApproved = roundCurrency(currentCompany.totalApproved + approvedRs);
        currentCompany.settled = roundCurrency(currentCompany.settled + settledRs);
        currentCompany.outstanding = roundCurrency(currentCompany.outstanding + balanceDueRs);
        currentCompany.oldestDays = Math.max(currentCompany.oldestDays, agingDays);
        currentCompany.count += 1;

        companyMap.set(insuranceName, currentCompany);
      }
    }
  }

  // Format company summaries
  const companySummaries: InsuranceCompanyAgingSummary[] = Array.from(
    companyMap.entries()
  ).map(([name, data]) => ({
    insuranceCompany: name,
    totalApprovedClaimsRs: data.totalApproved,
    settledAmountRs: data.settled,
    outstandingBalanceRs: data.outstanding,
    oldestClaimDays: data.oldestDays,
    claimCount: data.count,
  }));

  // Sort companies by outstanding balance descending
  companySummaries.sort((a, b) => b.outstandingBalanceRs - a.outstandingBalanceRs);

  // Sort itemized claims by aging days descending
  itemizedClaims.sort((a, b) => b.agingDays - a.agingDays);

  const totalApprovedClaimsRs = roundCurrency(
    Object.values(buckets).reduce((sum, b) => sum + b.totalApprovedRs, 0)
  );
  const totalSettledAmountRs = roundCurrency(
    Object.values(buckets).reduce((sum, b) => sum + b.totalSettledRs, 0)
  );
  const totalOutstandingClaimsRs = roundCurrency(
    Object.values(buckets).reduce((sum, b) => sum + b.outstandingBalanceRs, 0)
  );

  return {
    referenceDate: referenceDateStr,
    totalApprovedClaimsRs,
    totalSettledAmountRs,
    totalOutstandingClaimsRs,
    buckets,
    granularBuckets,
    companySummaries,
    itemizedClaims,
  };
}

// -------------------------------------------------------------------------
// 2. Technician Turnaround & Velocity Pure Calculations
// -------------------------------------------------------------------------

export function parseTargetDays(daysString?: string): number {
  if (!daysString) return 3;
  const match = daysString.match(/(\d+)/);
  if (!match) return 3;
  const parsed = parseInt(match[1], 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 3 : parsed;
}

export function calculateTechnicianTurnaround(
  jobs: WorkshopJobSheet[],
  referenceNow: Date = new Date()
): TechnicianVelocityReportData {
  interface TechAccumulator {
    name: string;
    totalTasks: number;
    completedTasks: number;
    completedJobIds: Set<string>;
    inProgressJobIds: Set<string>;
    targetDaysList: number[];
    actualTurnaroundDaysList: number[];
  }

  const techMap = new Map<string, TechAccumulator>();

  const getOrCreate = (name: string): TechAccumulator => {
    const trimmed = name.trim();
    if (!techMap.has(trimmed)) {
      techMap.set(trimmed, {
        name: trimmed,
        totalTasks: 0,
        completedTasks: 0,
        completedJobIds: new Set<string>(),
        inProgressJobIds: new Set<string>(),
        targetDaysList: [],
        actualTurnaroundDaysList: [],
      });
    }
    return techMap.get(trimmed)!;
  };

  for (const job of jobs) {
    const isCompleted =
      job.floorStatus === 'READY_FOR_DELIVERY' ||
      job.floorStatus === 'COMPLETED_DELIVERED' ||
      job.docStage === 'INVOICE';

    const isInProgress =
      job.floorStatus === 'APPROVED_IN_PROGRESS' ||
      job.floorStatus === 'WAITING_FOR_PARTS' ||
      job.floorStatus === 'QUALITY_CHECK';

    const targetDays = parseTargetDays(job.header?.daysForCompletion);

    // Calculate actual elapsed days for job
    let actualDays = 1;
    const startStr = job.createdAt || job.header?.date;
    if (startStr) {
      const createdTime = new Date(startStr).getTime();
      if (!Number.isNaN(createdTime)) {
        const endStr = isCompleted ? (job.updatedAt || job.createdAt || job.header?.date) : undefined;
        const endTime = endStr ? new Date(endStr).getTime() : referenceNow.getTime();
        const validEndTime = !Number.isNaN(endTime) ? endTime : referenceNow.getTime();
        const diffDays = Math.round((validEndTime - createdTime) / (1000 * 60 * 60 * 24));
        actualDays = Math.max(1, Number.isNaN(diffDays) ? 1 : diffDays);
      }
    }

    const assignedTechsInJob = new Set<string>();

    for (const line of job.lines) {
      const techName = (line.assignedTechnician || '').trim();
      if (!techName || techName.toLowerCase() === 'unassigned') {
        continue;
      }

      const acc = getOrCreate(techName);
      acc.totalTasks += 1;
      if (line.isCompleted) {
        acc.completedTasks += 1;
      }

      assignedTechsInJob.add(techName);
    }

    // Attribute job metrics to assigned technicians
    for (const techName of assignedTechsInJob) {
      const acc = getOrCreate(techName);
      if (isCompleted) {
        acc.completedJobIds.add(job.id);
        acc.targetDaysList.push(targetDays);
        acc.actualTurnaroundDaysList.push(actualDays);
      } else if (isInProgress) {
        acc.inProgressJobIds.add(job.id);
      }
    }
  }

  const technicians: TechnicianTurnaroundMetric[] = [];
  let sumAllTargetDays = 0;
  let sumAllActualDays = 0;
  let totalCompletedJobDataPoints = 0;
  let totalAssignedTasks = 0;
  let totalCompletedTasks = 0;

  for (const acc of techMap.values()) {
    totalAssignedTasks += acc.totalTasks;
    totalCompletedTasks += acc.completedTasks;

    const taskCompletionRatePct =
      acc.totalTasks > 0
        ? roundCurrency((acc.completedTasks / acc.totalTasks) * 100)
        : 0;

    const completedJobsCount = acc.completedJobIds.size;
    const activeInProgressJobsCount = acc.inProgressJobIds.size;

    const validTargetList = acc.targetDaysList.filter((d) => !Number.isNaN(d) && d > 0);
    const avgEstimatedTargetDays =
      validTargetList.length > 0
        ? Math.round(
            (validTargetList.reduce((a, b) => a + b, 0) / validTargetList.length) * 10
          ) / 10
        : 0;

    const validTurnaroundList = acc.actualTurnaroundDaysList.filter((d) => !Number.isNaN(d) && d > 0);
    const avgTurnaroundDays =
      validTurnaroundList.length > 0
        ? Math.round(
            (validTurnaroundList.reduce((a, b) => a + b, 0) /
              validTurnaroundList.length) *
              10
          ) / 10
        : 0;

    if (validTargetList.length > 0) {
      sumAllTargetDays += validTargetList.reduce((a, b) => a + b, 0);
      sumAllActualDays += validTurnaroundList.reduce((a, b) => a + b, 0);
      totalCompletedJobDataPoints += validTargetList.length;
    }

    let velocityStatus: TechnicianTurnaroundMetric['velocityStatus'] = 'ON_TRACK';
    if (completedJobsCount > 0 && avgEstimatedTargetDays > 0) {
      if (avgTurnaroundDays < avgEstimatedTargetDays) {
        velocityStatus = 'AHEAD';
      } else if (avgTurnaroundDays > avgEstimatedTargetDays) {
        velocityStatus = 'BEHIND';
      } else {
        velocityStatus = 'ON_TRACK';
      }
    } else {
      velocityStatus = taskCompletionRatePct >= 80 ? 'AHEAD' : 'ON_TRACK';
    }

    const laborEfficiencyIndex =
      avgEstimatedTargetDays > 0 && avgTurnaroundDays > 0
        ? Math.round((avgEstimatedTargetDays / avgTurnaroundDays) * 100)
        : taskCompletionRatePct > 0
        ? Math.round(taskCompletionRatePct)
        : 100;

    const onTimePercentage =
      velocityStatus === 'AHEAD'
        ? 100
        : velocityStatus === 'ON_TRACK'
        ? Math.max(85, taskCompletionRatePct)
        : Math.min(65, taskCompletionRatePct);

    technicians.push({
      technicianName: acc.name,
      totalAssignedTasks: acc.totalTasks,
      completedTasks: acc.completedTasks,
      taskCompletionRatePct,
      completedJobsCount,
      activeInProgressJobsCount,
      avgEstimatedTargetDays,
      avgTurnaroundDays,
      velocityStatus,
      laborEfficiencyIndex,
      onTimePercentage,
    });
  }

  // Sort technicians by task count and completed jobs
  technicians.sort((a, b) => {
    if (b.completedTasks !== a.completedTasks) {
      return b.completedTasks - a.completedTasks;
    }
    return b.completedJobsCount - a.completedJobsCount;
  });

  const overallAvgTargetDays =
    totalCompletedJobDataPoints > 0
      ? Math.round((sumAllTargetDays / totalCompletedJobDataPoints) * 10) / 10
      : 0;

  const overallAvgTurnaroundDays =
    totalCompletedJobDataPoints > 0
      ? Math.round((sumAllActualDays / totalCompletedJobDataPoints) * 10) / 10
      : 0;

  const overallCompletionRatePct =
    totalAssignedTasks > 0
      ? roundCurrency((totalCompletedTasks / totalAssignedTasks) * 100)
      : 0;

  return {
    totalActiveTechnicians: technicians.length,
    totalAssignedTasks,
    totalCompletedTasks,
    overallCompletionRatePct,
    overallAvgTargetDays,
    overallAvgTurnaroundDays,
    technicians,
  };
}

// -------------------------------------------------------------------------
// 3. Fast-Moving Parts & Low-Stock Alerts Pure Calculations
// -------------------------------------------------------------------------

export function calculateFastMovingParts(
  jobs: WorkshopJobSheet[],
  posSales: PosSaleTransaction[],
  catalogItems: CatalogItem[],
  filter?: DateRangeFilter,
  referenceNow: Date = new Date()
): FastMovingPartMetric[] {
  interface PartAccumulator {
    catalogItemId?: string;
    sku: string;
    barcode?: string;
    name: string;
    category: string;
    uom: string;
    workshopQtyUsed: number;
    posQtySold: number;
    totalRevenueRs: number;
    totalCostRs: number;
  }

  const partsMap = new Map<string, PartAccumulator>();

  const catalogLookup = new Map<string, CatalogItem>();
  for (const item of catalogItems) {
    if (item.id) catalogLookup.set(item.id.toLowerCase(), item);
    if (item.sku) catalogLookup.set(item.sku.trim().toLowerCase(), item);
    if (item.barcode) catalogLookup.set(item.barcode.trim().toLowerCase(), item);
    if (item.name) catalogLookup.set(item.name.trim().toLowerCase(), item);
  }

  const getKey = (name: string, sku?: string, catalogId?: string): string => {
    if (catalogId) return `cat:${catalogId.toLowerCase()}`;
    if (sku) return `sku:${sku.trim().toLowerCase()}`;
    return `name:${name.trim().toLowerCase()}`;
  };

  // 1. Accumulate from Workshop Invoiced Jobs
  for (const job of jobs) {
    if (job.docStage !== 'INVOICE') continue;
    if (!isDateInFilter(job.header?.date || job.createdAt, filter, referenceNow)) {
      continue;
    }

    for (const line of job.lines) {
      if (line.category !== 'REPLACEMENT') continue;

      const desc = (line.description || 'Workshop Replacement Part').trim();

      let matchedCat = line.catalogItemId ? catalogLookup.get(line.catalogItemId.toLowerCase()) : undefined;
      if (!matchedCat) {
        matchedCat = catalogLookup.get(desc.toLowerCase());
      }

      const finalCatId = line.catalogItemId || matchedCat?.id;
      const finalSku = matchedCat?.sku;
      const key = getKey(desc, finalSku, finalCatId);

      const acc = partsMap.get(key) || {
        catalogItemId: finalCatId,
        sku: finalSku || 'WORKSHOP-PRT',
        barcode: matchedCat?.barcode,
        name: matchedCat?.name || desc,
        category: matchedCat?.category || 'Replacement Parts',
        uom: matchedCat?.uom || 'pcs',
        workshopQtyUsed: 0,
        posQtySold: 0,
        totalRevenueRs: 0,
        totalCostRs: 0,
      };

      const lineQty = Number((line as any).qty) || Number((line as any).quantity) || 1;
      acc.workshopQtyUsed += lineQty;
      acc.totalRevenueRs = roundCurrency(acc.totalRevenueRs + (Number(line.sellingPriceRs) || 0));
      acc.totalCostRs = roundCurrency(acc.totalCostRs + (Number(line.buyingCostRs) || 0));
      partsMap.set(key, acc);
    }
  }

  // 2. Accumulate from Counter POS Sales
  for (const sale of posSales) {
    if (!isDateInFilter(sale.date || sale.createdAt, filter, referenceNow)) {
      continue;
    }

    for (const item of sale.items) {
      const desc = (item.description || 'POS Counter Item').trim();

      let matchedCat = item.catalogItemId ? catalogLookup.get(item.catalogItemId.toLowerCase()) : undefined;
      if (!matchedCat && item.barcode) {
        matchedCat = catalogLookup.get(item.barcode.trim().toLowerCase());
      }
      if (!matchedCat && item.sku) {
        matchedCat = catalogLookup.get(item.sku.trim().toLowerCase());
      }
      if (!matchedCat) {
        matchedCat = catalogLookup.get(desc.toLowerCase());
      }

      const finalCatId = item.catalogItemId || matchedCat?.id;
      const finalSku = item.sku || matchedCat?.sku;
      const key = getKey(desc, finalSku, finalCatId);

      const acc = partsMap.get(key) || {
        catalogItemId: finalCatId,
        sku: finalSku || 'POS-ITEM',
        barcode: item.barcode || matchedCat?.barcode,
        name: matchedCat?.name || desc,
        category: item.category || matchedCat?.category || 'Counter Retail',
        uom: matchedCat?.uom || 'pcs',
        workshopQtyUsed: 0,
        posQtySold: 0,
        totalRevenueRs: 0,
        totalCostRs: 0,
      };

      const qty = Number(item.qty) || 0;
      acc.posQtySold += qty;
      acc.totalRevenueRs = roundCurrency(
        acc.totalRevenueRs + (Number(item.lineTotalSalesRs) || 0)
      );
      acc.totalCostRs = roundCurrency(
        acc.totalCostRs + (Number(item.lineTotalCostRs) || 0)
      );
      partsMap.set(key, acc);
    }
  }

  const results: FastMovingPartMetric[] = [];
  for (const acc of partsMap.values()) {
    const totalQtyConsumed = acc.workshopQtyUsed + acc.posQtySold;
    const grossProfitRs = roundCurrency(acc.totalRevenueRs - acc.totalCostRs);
    const grossMarginPct =
      acc.totalRevenueRs > 0
        ? roundCurrency((grossProfitRs / acc.totalRevenueRs) * 100)
        : 0;

    results.push({
      catalogItemId: acc.catalogItemId,
      sku: acc.sku,
      barcode: acc.barcode,
      name: acc.name,
      category: acc.category,
      uom: acc.uom,
      workshopQtyUsed: acc.workshopQtyUsed,
      posQtySold: acc.posQtySold,
      totalQtyConsumed,
      totalRevenueRs: acc.totalRevenueRs,
      totalCostRs: acc.totalCostRs,
      grossProfitRs,
      grossMarginPct,
      turnoverRate: `${totalQtyConsumed} ${acc.uom} / period`,
    });
  }

  // Sort descending by total consumed quantity, then revenue
  results.sort((a, b) => {
    if (b.totalQtyConsumed !== a.totalQtyConsumed) {
      return b.totalQtyConsumed - a.totalQtyConsumed;
    }
    return b.totalRevenueRs - a.totalRevenueRs;
  });

  return results;
}

export function calculateLowStockAlerts(catalogItems: CatalogItem[]): LowStockAlertItem[] {
  const alerts: LowStockAlertItem[] = [];

  for (const item of catalogItems) {
    // Only physical inventory (spare parts and lubricants)
    if (item.itemType !== 'SPAREPART' && item.itemType !== 'LUBRICANT') {
      continue;
    }

    const currentStock = Number(item.stockQty) || 0;
    const alertLevel = Number(item.lowStockAlertLevel) || 0;

    if (currentStock <= alertLevel) {
      const isOutOfStock = currentStock <= 0;
      const deficitQty = Math.max(0, alertLevel - currentStock);
      const reorderNotes = isOutOfStock
        ? 'URGENT: Stock depleted to 0! Immediate replenishment PO required.'
        : `Low safety stock (${currentStock}/${alertLevel} ${item.uom}). Recommended reorder: +${deficitQty} ${item.uom}.`;

      alerts.push({
        catalogItemId: item.id,
        sku: item.sku,
        barcode: item.barcode,
        name: item.name,
        category: item.category,
        uom: item.uom,
        stockQty: currentStock,
        lowStockAlertLevel: alertLevel,
        deficitQty,
        status: isOutOfStock ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        buyingCostRs: item.buyingCostRs,
        sellingPriceRs: item.sellingPriceRs,
        turnoverRate: 'High Demand',
        reorderNotes,
      });
    }
  }

  // Sort: Out of stock first, then by deficit descending
  alerts.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'OUT_OF_STOCK' ? -1 : 1;
    }
    return b.deficitQty - a.deficitQty;
  });

  return alerts;
}

// -------------------------------------------------------------------------
// 4. Date-Range Sales & Gross Profit Pure Calculations
// -------------------------------------------------------------------------

export function aggregateSalesGrossProfit(
  jobs: WorkshopJobSheet[],
  posSales: PosSaleTransaction[],
  filter: DateRangeFilter = { range: 'THIS_MONTH' },
  referenceNow: Date = new Date()
): SalesGrossProfitReportData {
  // 1. Invoiced Workshop Jobs matching date filter
  const invoicedJobs = jobs.filter((job) => {
    if (job.docStage !== 'INVOICE') return false;
    return isDateInFilter(job.header?.date || job.createdAt, filter, referenceNow);
  });

  let workshopLaborRRRevenueRs = 0;
  let workshopLaborRRCostRs = 0;
  let workshopLaborRepairRevenueRs = 0;
  let workshopLaborRepairCostRs = 0;
  let workshopPartsRevenueRs = 0;
  let workshopPartsCostRs = 0;

  for (const job of invoicedJobs) {
    let jobLaborRRSelling = 0;
    let jobLaborRRCost = 0;
    let jobLaborRepairSelling = 0;
    let jobLaborRepairCost = 0;
    let jobPartsSelling = 0;
    let jobPartsCost = 0;

    for (const line of job.lines) {
      const selling = Math.max(0, Number(line.sellingPriceRs) || 0);
      const buying = Math.max(0, Number(line.buyingCostRs) || 0);

      if (line.category === 'LABOR_REMOVE_REASSEMBLE') {
        jobLaborRRSelling += selling;
        jobLaborRRCost += buying;
      } else if (line.category === 'LABOR_REPAIR') {
        jobLaborRepairSelling += selling;
        jobLaborRepairCost += buying;
      } else if (line.category === 'REPLACEMENT') {
        jobPartsSelling += selling;
        jobPartsCost += buying;
      }
    }

    // Allocate job discount proportionally
    const discount = job.financials?.discountRs || 0;
    const grossSales = jobLaborRRSelling + jobLaborRepairSelling + jobPartsSelling;
    if (discount > 0 && grossSales > 0) {
      const rrShare = (jobLaborRRSelling / grossSales) * discount;
      const repairShare = (jobLaborRepairSelling / grossSales) * discount;
      const partsShare = (jobPartsSelling / grossSales) * discount;
      jobLaborRRSelling = Math.max(0, jobLaborRRSelling - rrShare);
      jobLaborRepairSelling = Math.max(0, jobLaborRepairSelling - repairShare);
      jobPartsSelling = Math.max(0, jobPartsSelling - partsShare);
    }

    workshopLaborRRRevenueRs += jobLaborRRSelling;
    workshopLaborRRCostRs += jobLaborRRCost;
    workshopLaborRepairRevenueRs += jobLaborRepairSelling;
    workshopLaborRepairCostRs += jobLaborRepairCost;
    workshopPartsRevenueRs += jobPartsSelling;
    workshopPartsCostRs += jobPartsCost;
  }

  workshopLaborRRRevenueRs = roundCurrency(workshopLaborRRRevenueRs);
  workshopLaborRRCostRs = roundCurrency(workshopLaborRRCostRs);
  const workshopLaborRRProfitRs = roundCurrency(workshopLaborRRRevenueRs - workshopLaborRRCostRs);
  const workshopLaborRRMarginPct =
    workshopLaborRRRevenueRs > 0
      ? roundCurrency((workshopLaborRRProfitRs / workshopLaborRRRevenueRs) * 100)
      : 0;

  workshopLaborRepairRevenueRs = roundCurrency(workshopLaborRepairRevenueRs);
  workshopLaborRepairCostRs = roundCurrency(workshopLaborRepairCostRs);
  const workshopLaborRepairProfitRs = roundCurrency(
    workshopLaborRepairRevenueRs - workshopLaborRepairCostRs
  );
  const workshopLaborRepairMarginPct =
    workshopLaborRepairRevenueRs > 0
      ? roundCurrency((workshopLaborRepairProfitRs / workshopLaborRepairRevenueRs) * 100)
      : 0;

  const workshopLaborRevenueRs = roundCurrency(
    workshopLaborRRRevenueRs + workshopLaborRepairRevenueRs
  );
  const workshopLaborCostRs = roundCurrency(workshopLaborRRCostRs + workshopLaborRepairCostRs);
  const workshopLaborProfitRs = roundCurrency(workshopLaborRevenueRs - workshopLaborCostRs);
  const workshopLaborMarginPct =
    workshopLaborRevenueRs > 0
      ? roundCurrency((workshopLaborProfitRs / workshopLaborRevenueRs) * 100)
      : 0;

  workshopPartsRevenueRs = roundCurrency(workshopPartsRevenueRs);
  workshopPartsCostRs = roundCurrency(workshopPartsCostRs);
  const workshopPartsProfitRs = roundCurrency(workshopPartsRevenueRs - workshopPartsCostRs);
  const workshopPartsMarginPct =
    workshopPartsRevenueRs > 0
      ? roundCurrency((workshopPartsProfitRs / workshopPartsRevenueRs) * 100)
      : 0;

  // 2. POS Counter Sales matching date filter
  const posSalesInFilter = posSales.filter((sale) =>
    isDateInFilter(sale.date || sale.createdAt, filter, referenceNow)
  );

  let posSalesRevenueRs = 0;
  let posBuyingCostRs = 0;

  for (const sale of posSalesInFilter) {
    posSalesRevenueRs += sale.netSalesRs || sale.netTotalSalesRs || 0;
    posBuyingCostRs += sale.totalBuyingCostRs || 0;
  }

  posSalesRevenueRs = roundCurrency(posSalesRevenueRs);
  posBuyingCostRs = roundCurrency(posBuyingCostRs);
  const posGrossProfitRs = roundCurrency(posSalesRevenueRs - posBuyingCostRs);
  const posMarginPct =
    posSalesRevenueRs > 0
      ? roundCurrency((posGrossProfitRs / posSalesRevenueRs) * 100)
      : 0;

  // 3. Combined Metrics
  const totalNetSalesRs = roundCurrency(
    workshopLaborRevenueRs + workshopPartsRevenueRs + posSalesRevenueRs
  );
  const totalDirectCostRs = roundCurrency(
    workshopLaborCostRs + workshopPartsCostRs + posBuyingCostRs
  );
  const combinedGrossProfitRs = roundCurrency(totalNetSalesRs - totalDirectCostRs);
  const grossMarginPct =
    totalNetSalesRs > 0
      ? roundCurrency((combinedGrossProfitRs / totalNetSalesRs) * 100)
      : 0;

  const getShare = (rev: number) =>
    totalNetSalesRs > 0 ? roundCurrency((rev / totalNetSalesRs) * 100) : 0;

  const streams: SalesGrossProfitReportData['streams'] = {
    workshopLabor: {
      name: 'Workshop Labor Services',
      revenueRs: workshopLaborRevenueRs,
      costRs: workshopLaborCostRs,
      grossProfitRs: workshopLaborProfitRs,
      grossMarginPct: workshopLaborMarginPct,
      percentageOfTotalRevenue: getShare(workshopLaborRevenueRs),
    },
    workshopLaborRR: {
      name: 'Workshop Labor R&R',
      revenueRs: workshopLaborRRRevenueRs,
      costRs: workshopLaborRRCostRs,
      grossProfitRs: workshopLaborRRProfitRs,
      grossMarginPct: workshopLaborRRMarginPct,
      percentageOfTotalRevenue: getShare(workshopLaborRRRevenueRs),
    },
    workshopLaborRepair: {
      name: 'Workshop Labor Repair',
      revenueRs: workshopLaborRepairRevenueRs,
      costRs: workshopLaborRepairCostRs,
      grossProfitRs: workshopLaborRepairProfitRs,
      grossMarginPct: workshopLaborRepairMarginPct,
      percentageOfTotalRevenue: getShare(workshopLaborRepairRevenueRs),
    },
    workshopParts: {
      name: 'Workshop Replacement Parts',
      revenueRs: workshopPartsRevenueRs,
      costRs: workshopPartsCostRs,
      grossProfitRs: workshopPartsProfitRs,
      grossMarginPct: workshopPartsMarginPct,
      percentageOfTotalRevenue: getShare(workshopPartsRevenueRs),
    },
    counterPosSales: {
      name: 'Counter Retail POS Sales',
      revenueRs: posSalesRevenueRs,
      costRs: posBuyingCostRs,
      grossProfitRs: posGrossProfitRs,
      grossMarginPct: posMarginPct,
      percentageOfTotalRevenue: getShare(posSalesRevenueRs),
    },
  };

  return {
    dateRange: filter,
    totalNetSalesRs,
    totalDirectCostRs,
    combinedGrossProfitRs,
    grossMarginPct,
    streams,
    invoicedJobsCount: invoicedJobs.length,
    posSalesCount: posSalesInFilter.length,
  };
}
