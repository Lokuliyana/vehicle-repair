import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, WorkshopJobSheet, PosSaleTransaction, CatalogItem } from '@/types';
import { ReportsPage } from '@/features/finance-reports/pages/ReportsPage';
import { analyticsRepository } from '@/features/finance-reports/repository/analytics.repository.mock';
import {
  calculateInsuranceAgingBucket,
  calculateAgingDays,
  aggregateInsuranceAging,
  calculateTechnicianTurnaround,
  calculateFastMovingParts,
  calculateLowStockAlerts,
} from '@/features/finance-reports/utils/analytics-math';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';

function renderReportsApp(
  initialRole: UserRole = 'OWNER',
  initialEntries: string[] = ['/reports']
) {
  const router = createMemoryRouter(
    [
      {
        path: '/reports',
        element: (
          <ProtectedRoute
            requiredPermission="canAccessReports"
            allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}
          >
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/workshop/sheet/:id',
        element: <div data-testid="sheet-page">Workshop Sheet Target</div>,
      },
      {
        path: '/catalog',
        element: <div data-testid="catalog-page">Catalog Target</div>,
      },
    ],
    { initialEntries }
  );

  return render(
    <ToastProvider>
      <AuthProvider initialRole={initialRole}>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}

describe('Phase 9: Reports & Analytics Dashboards', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await posSaleRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
  });

  // =========================================================================
  // 1. Insurance Claim Aging Pure Calculation & Grouping
  // =========================================================================
  describe('1. Insurance Claim Aging Mathematical Calculations', () => {
    it('categorizes aging days into the 4 standard buckets accurately', () => {
      // 0 - 30 Days (Current)
      expect(calculateInsuranceAgingBucket(0)).toBe('0_30');
      expect(calculateInsuranceAgingBucket(15)).toBe('0_30');
      expect(calculateInsuranceAgingBucket(30)).toBe('0_30');

      // 31 - 60 Days (Aging)
      expect(calculateInsuranceAgingBucket(31)).toBe('31_60');
      expect(calculateInsuranceAgingBucket(45)).toBe('31_60');
      expect(calculateInsuranceAgingBucket(60)).toBe('31_60');

      // 61 - 90 Days (Attention Required)
      expect(calculateInsuranceAgingBucket(61)).toBe('61_90');
      expect(calculateInsuranceAgingBucket(75)).toBe('61_90');
      expect(calculateInsuranceAgingBucket(90)).toBe('61_90');

      // 90+ Days (Critical Overdue)
      expect(calculateInsuranceAgingBucket(91)).toBe('90_PLUS');
      expect(calculateInsuranceAgingBucket(120)).toBe('90_PLUS');
      expect(calculateInsuranceAgingBucket(365)).toBe('90_PLUS');
    });

    it('calculates calendar aging days elapsed from claim date', () => {
      const refDate = new Date(2026, 10, 2); // 2026-11-02

      expect(calculateAgingDays('2026-11-02', refDate)).toBe(0);
      expect(calculateAgingDays('2026-11-01', refDate)).toBe(1);
      expect(calculateAgingDays('2026-10-18', refDate)).toBe(15);
      expect(calculateAgingDays('2026-10-02', refDate)).toBe(31);
      expect(calculateAgingDays('2026-09-02', refDate)).toBe(61);
      expect(calculateAgingDays('2026-07-01', refDate)).toBe(124);
    });

    it('aggregates claims across all 4 aging buckets and groups by insurance company', () => {
      const refDate = new Date(2026, 10, 2); // 2026-11-02

      const sampleJobs: WorkshopJobSheet[] = [
        // Bucket 0-30: 2 days old, SLIC, 75,000 approved, 0 settled -> 75,000 balance
        {
          id: 'job-c1',
          jobNumber: 'JOB-2026-0101',
          docStage: 'JOB_CARD',
          floorStatus: 'APPROVED_IN_PROGRESS',
          paymentStatus: 'UNPAID',
          header: {
            date: '2026-10-31',
            jobNumber: 'JOB-2026-0101',
            vehicleNumber: 'WP CAA-1111',
            natureOfRepair: 'Bumper',
            vehicleMake: 'Toyota',
            chassisNumber: 'CH-111',
            vehicleModel: 'Corolla',
            daysForCompletion: '3 Days',
            yearOfMake: '2020',
            vehicleColor: 'White',
            insuranceName: 'Sri Lanka Insurance (SLIC)',
            customerInfo: 'Kasun',
          },
          lines: [],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 75000,
            totalBuyingCostRs: 40000,
            grossProfitRs: 35000,
            grossMarginPct: 46.67,
            insuranceApprovedRs: 75000,
            customerPayableRs: 0,
            advancePaidRs: 0,
            balanceDueRs: 0,
          },
          payments: [],
          createdAt: '2026-10-31T08:00:00Z',
          updatedAt: '2026-10-31T08:00:00Z',
        },
        // Bucket 31-60: 45 days old, Ceylinco, 60,000 approved, 10,000 settled -> 50,000 balance
        {
          id: 'job-c2',
          jobNumber: 'JOB-2026-0102',
          docStage: 'INVOICE',
          floorStatus: 'READY_FOR_DELIVERY',
          paymentStatus: 'PARTIALLY_PAID',
          header: {
            date: '2026-09-18',
            jobNumber: 'JOB-2026-0102',
            vehicleNumber: 'WP CAR-2222',
            natureOfRepair: 'Rear Panel',
            vehicleMake: 'Honda',
            chassisNumber: 'CH-222',
            vehicleModel: 'Grace',
            daysForCompletion: '4 Days',
            yearOfMake: '2019',
            vehicleColor: 'Black',
            insuranceName: 'Ceylinco General Insurance',
            customerInfo: 'Nimal',
          },
          lines: [],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 60000,
            totalBuyingCostRs: 30000,
            grossProfitRs: 30000,
            grossMarginPct: 50,
            insuranceApprovedRs: 60000,
            customerPayableRs: 0,
            advancePaidRs: 0,
            balanceDueRs: 0,
          },
          payments: [
            {
              id: 'pay-c2-1',
              receiptNumber: 'REC-001',
              date: '2026-10-01',
              amountRs: 10000,
              paymentType: 'INSURANCE_SETTLEMENT',
              paymentMethod: 'BANK_TRANSFER',
              balanceAfterRs: 50000,
              createdAt: '2026-10-01T10:00:00Z',
            },
          ],
          createdAt: '2026-09-18T08:00:00Z',
          updatedAt: '2026-09-18T08:00:00Z',
        },
        // Bucket 61-90: 75 days old, Allianz, 40,000 approved, 0 settled -> 40,000 balance
        {
          id: 'job-c3',
          jobNumber: 'JOB-2026-0103',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'UNPAID',
          header: {
            date: '2026-08-19',
            jobNumber: 'JOB-2026-0103',
            vehicleNumber: 'WP CAB-3333',
            natureOfRepair: 'Door & Fender',
            vehicleMake: 'Nissan',
            chassisNumber: 'CH-333',
            vehicleModel: 'Leaf',
            daysForCompletion: '5 Days',
            yearOfMake: '2018',
            vehicleColor: 'Silver',
            insuranceName: 'Allianz Insurance Lanka',
            customerInfo: 'Sunil',
          },
          lines: [],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 40000,
            totalBuyingCostRs: 20000,
            grossProfitRs: 20000,
            grossMarginPct: 50,
            insuranceApprovedRs: 40000,
            customerPayableRs: 0,
            advancePaidRs: 0,
            balanceDueRs: 0,
          },
          payments: [],
          createdAt: '2026-08-19T08:00:00Z',
          updatedAt: '2026-08-19T08:00:00Z',
        },
        // Bucket 90+: 110 days old, SLIC, 30,000 approved, 0 settled -> 30,000 balance
        {
          id: 'job-c4',
          jobNumber: 'JOB-2026-0104',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'UNPAID',
          header: {
            date: '2026-07-15',
            jobNumber: 'JOB-2026-0104',
            vehicleNumber: 'WP CBC-4444',
            natureOfRepair: 'Side Mirror & Paint',
            vehicleMake: 'Suzuki',
            chassisNumber: 'CH-444',
            vehicleModel: 'Wagon R',
            daysForCompletion: '2 Days',
            yearOfMake: '2017',
            vehicleColor: 'Red',
            insuranceName: 'Sri Lanka Insurance (SLIC)',
            customerInfo: 'Bandara',
          },
          lines: [],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 30000,
            totalBuyingCostRs: 15000,
            grossProfitRs: 15000,
            grossMarginPct: 50,
            insuranceApprovedRs: 30000,
            customerPayableRs: 0,
            advancePaidRs: 0,
            balanceDueRs: 0,
          },
          payments: [],
          createdAt: '2026-07-15T08:00:00Z',
          updatedAt: '2026-07-15T08:00:00Z',
        },
        // Fully Settled Claim (should NOT appear in outstanding aging):
        {
          id: 'job-c5',
          jobNumber: 'JOB-2026-0105',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'PAID',
          header: {
            date: '2026-08-01',
            jobNumber: 'JOB-2026-0105',
            vehicleNumber: 'WP CBD-5555',
            natureOfRepair: 'Roof Dent',
            vehicleMake: 'Toyota',
            chassisNumber: 'CH-555',
            vehicleModel: 'Aqua',
            daysForCompletion: '3 Days',
            yearOfMake: '2016',
            vehicleColor: 'Blue',
            insuranceName: 'Fairfirst Insurance',
            customerInfo: 'Perera',
          },
          lines: [],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 50000,
            totalBuyingCostRs: 25000,
            grossProfitRs: 25000,
            grossMarginPct: 50,
            insuranceApprovedRs: 50000,
            customerPayableRs: 0,
            advancePaidRs: 0,
            balanceDueRs: 0,
          },
          payments: [
            {
              id: 'pay-c5-1',
              receiptNumber: 'REC-002',
              date: '2026-09-01',
              amountRs: 50000,
              paymentType: 'INSURANCE_SETTLEMENT',
              paymentMethod: 'CHEQUE',
              balanceAfterRs: 0,
              createdAt: '2026-09-01T10:00:00Z',
            },
          ],
          createdAt: '2026-08-01T08:00:00Z',
          updatedAt: '2026-08-01T08:00:00Z',
        },
      ];

      const report = aggregateInsuranceAging(sampleJobs, refDate);

      // Verify all 4 buckets populated correctly
      expect(report.buckets['0_30'].claimCount).toBe(1);
      expect(report.buckets['0_30'].outstandingBalanceRs).toBe(75000);

      expect(report.buckets['31_60'].claimCount).toBe(1);
      expect(report.buckets['31_60'].totalApprovedRs).toBe(60000);
      expect(report.buckets['31_60'].totalSettledRs).toBe(10000);
      expect(report.buckets['31_60'].outstandingBalanceRs).toBe(50000);

      expect(report.buckets['61_90'].claimCount).toBe(1);
      expect(report.buckets['61_90'].outstandingBalanceRs).toBe(40000);

      expect(report.buckets['90_PLUS'].claimCount).toBe(1);
      expect(report.buckets['90_PLUS'].outstandingBalanceRs).toBe(30000);

      // Fully settled claim (job-c5) excluded from outstanding
      expect(report.itemizedClaims.length).toBe(4);
      expect(report.totalOutstandingClaimsRs).toBe(75000 + 50000 + 40000 + 30000);

      // Verify grouping by insurance company
      const slicSummary = report.companySummaries.find(
        (c) => c.insuranceCompany === 'Sri Lanka Insurance (SLIC)'
      );
      expect(slicSummary).toBeDefined();
      expect(slicSummary?.claimCount).toBe(2);
      expect(slicSummary?.totalApprovedClaimsRs).toBe(105000); // 75000 + 30000
      expect(slicSummary?.outstandingBalanceRs).toBe(105000);
      expect(slicSummary?.oldestClaimDays).toBe(110);

      const ceylincoSummary = report.companySummaries.find(
        (c) => c.insuranceCompany === 'Ceylinco General Insurance'
      );
      expect(ceylincoSummary?.outstandingBalanceRs).toBe(50000);
      expect(ceylincoSummary?.settledAmountRs).toBe(10000);
      expect(ceylincoSummary?.oldestClaimDays).toBe(45);
    });
  });

  // =========================================================================
  // 2. Technician Turnaround & Job Velocity Pure Calculations
  // =========================================================================
  describe('2. Technician Turnaround & Velocity Calculations', () => {
    it('calculates assigned vs completed tasks, turnaround days vs target, and efficiency status', () => {
      const refDate = new Date(2026, 10, 2);

      const sampleJobs: WorkshopJobSheet[] = [
        {
          id: 'tech-job-1',
          jobNumber: 'JOB-2026-0001',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'PAID',
          header: {
            date: '2026-10-25',
            jobNumber: 'JOB-2026-0001',
            vehicleNumber: 'WP CAR-1000',
            natureOfRepair: 'Tinkering & Paint',
            vehicleMake: 'Toyota',
            chassisNumber: 'CH-1',
            vehicleModel: 'Vitz',
            daysForCompletion: '5 Days',
            yearOfMake: '2018',
            vehicleColor: 'Silver',
            insuranceName: 'SLIC',
            customerInfo: 'Kasun',
          },
          lines: [
            {
              id: 'l1',
              rowNo: 1,
              category: 'LABOR_REMOVE_REASSEMBLE',
              description: 'Door removal',
              sellingPriceRs: 5000,
              buyingCostRs: 1000,
              assignedTechnician: 'Nimal Bandara',
              isCompleted: true,
            },
            {
              id: 'l2',
              rowNo: 2,
              category: 'LABOR_REPAIR',
              description: 'Dent beating',
              sellingPriceRs: 12000,
              buyingCostRs: 3000,
              assignedTechnician: 'Nimal Bandara',
              isCompleted: true,
            },
            {
              id: 'l3',
              rowNo: 3,
              category: 'LABOR_REPAIR',
              description: 'Paint finish',
              sellingPriceRs: 15000,
              buyingCostRs: 4000,
              assignedTechnician: 'Sunil Shantha',
              isCompleted: true,
            },
          ],
          financials: {
            subtotalRemoveReassembleRs: 5000,
            subtotalRepairRs: 27000,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 32000,
            totalBuyingCostRs: 8000,
            grossProfitRs: 24000,
            grossMarginPct: 75,
            insuranceApprovedRs: 0,
            customerPayableRs: 32000,
            advancePaidRs: 32000,
            balanceDueRs: 0,
          },
          createdAt: '2026-10-25T08:00:00Z',
          updatedAt: '2026-10-28T08:00:00Z', // Took 3 days (target was 5 days) -> AHEAD
        },
        {
          id: 'tech-job-2',
          jobNumber: 'JOB-2026-0002',
          docStage: 'JOB_CARD',
          floorStatus: 'APPROVED_IN_PROGRESS',
          paymentStatus: 'UNPAID',
          header: {
            date: '2026-11-01',
            jobNumber: 'JOB-2026-0002',
            vehicleNumber: 'WP CAR-2000',
            natureOfRepair: 'Suspension',
            vehicleMake: 'Honda',
            chassisNumber: 'CH-2',
            vehicleModel: 'Fit',
            daysForCompletion: '2 Days',
            yearOfMake: '2019',
            vehicleColor: 'White',
            insuranceName: 'Ceylinco',
            customerInfo: 'Nimal',
          },
          lines: [
            {
              id: 'l4',
              rowNo: 1,
              category: 'LABOR_REPAIR',
              description: 'Arm alignment',
              sellingPriceRs: 8000,
              buyingCostRs: 2000,
              assignedTechnician: 'Sunil Shantha',
              isCompleted: false, // Incomplete in-progress task
            },
          ],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 8000,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 8000,
            totalBuyingCostRs: 2000,
            grossProfitRs: 6000,
            grossMarginPct: 75,
            insuranceApprovedRs: 0,
            customerPayableRs: 8000,
            advancePaidRs: 0,
            balanceDueRs: 8000,
          },
          createdAt: '2026-11-01T08:00:00Z',
          updatedAt: '2026-11-01T08:00:00Z',
        },
      ];

      const report = calculateTechnicianTurnaround(sampleJobs, refDate);

      expect(report.totalActiveTechnicians).toBe(2);
      expect(report.totalAssignedTasks).toBe(4);
      expect(report.totalCompletedTasks).toBe(3);
      expect(report.overallCompletionRatePct).toBe(75);

      const nimal = report.technicians.find((t) => t.technicianName === 'Nimal Bandara');
      expect(nimal).toBeDefined();
      expect(nimal?.totalAssignedTasks).toBe(2);
      expect(nimal?.completedTasks).toBe(2);
      expect(nimal?.taskCompletionRatePct).toBe(100);
      expect(nimal?.completedJobsCount).toBe(1);
      expect(nimal?.avgEstimatedTargetDays).toBe(5);
      expect(nimal?.avgTurnaroundDays).toBe(3);
      expect(nimal?.velocityStatus).toBe('AHEAD'); // 3 days turnaround < 5 days target

      const sunil = report.technicians.find((t) => t.technicianName === 'Sunil Shantha');
      expect(sunil).toBeDefined();
      expect(sunil?.totalAssignedTasks).toBe(2);
      expect(sunil?.completedTasks).toBe(1);
      expect(sunil?.activeInProgressJobsCount).toBe(1);
    });
  });

  // =========================================================================
  // 3. Fast-Moving Parts & Low-Stock Alerts Pure Calculations
  // =========================================================================
  describe('3. Fast-Moving Parts & Low-Stock Alert Calculations', () => {
    it('aggregates parts consumption combining workshop job replacements and counter POS sales', () => {
      const catalogItems: CatalogItem[] = [
        {
          id: 'cat-filter',
          sku: 'FLT-001',
          barcode: '890001',
          itemType: 'SPAREPART',
          name: 'Oil Filter C-110',
          category: 'Filters',
          uom: 'pcs',
          buyingCostRs: 1000,
          sellingPriceRs: 1800,
          defaultDiscountPct: 0,
          stockQty: 10,
          lowStockAlertLevel: 5,
          isActive: true,
          createdAt: '2026-10-01T00:00:00Z',
          updatedAt: '2026-10-01T00:00:00Z',
        },
        {
          id: 'cat-oil',
          sku: 'OIL-5W30',
          barcode: '890002',
          itemType: 'LUBRICANT',
          name: 'Toyota Engine Oil 5W-30',
          category: 'Lubricants',
          uom: 'cans',
          buyingCostRs: 8000,
          sellingPriceRs: 12000,
          defaultDiscountPct: 0,
          stockQty: 2,
          lowStockAlertLevel: 5, // LOW STOCK TRIGGER (stock 2 <= alert 5)
          isActive: true,
          createdAt: '2026-10-01T00:00:00Z',
          updatedAt: '2026-10-01T00:00:00Z',
        },
      ];

      const sampleJobs: WorkshopJobSheet[] = [
        {
          id: 'job-part-1',
          jobNumber: 'JOB-2026-0010',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'PAID',
          header: {
            date: '2026-11-02',
            jobNumber: 'JOB-2026-0010',
            vehicleNumber: 'WP CAR-1212',
            natureOfRepair: 'Service',
            vehicleMake: 'Toyota',
            chassisNumber: 'CH-10',
            vehicleModel: 'Axio',
            daysForCompletion: '1 Day',
            yearOfMake: '2019',
            vehicleColor: 'White',
            insuranceName: 'Direct Cash Customer',
            customerInfo: 'Kasun',
          },
          lines: [
            {
              id: 'l-repl-1',
              rowNo: 1,
              category: 'REPLACEMENT',
              catalogItemId: 'cat-filter',
              description: 'Oil Filter C-110',
              sellingPriceRs: 1800,
              buyingCostRs: 1000,
              isCompleted: true,
            },
          ],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 1800,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 1800,
            totalBuyingCostRs: 1000,
            grossProfitRs: 800,
            grossMarginPct: 44.44,
            insuranceApprovedRs: 0,
            customerPayableRs: 1800,
            advancePaidRs: 1800,
            balanceDueRs: 0,
          },
          createdAt: '2026-11-02T08:00:00Z',
          updatedAt: '2026-11-02T10:00:00Z',
        },
      ];

      const samplePosSales: PosSaleTransaction[] = [
        {
          id: 'pos-1',
          receiptNumber: 'POS-001',
          shiftId: 'SHIFT-1',
          cashierName: 'Kamal',
          date: '2026-11-02',
          customerNote: 'Walk-in',
          items: [
            {
              id: 'item-1',
              catalogItemId: 'cat-filter',
              sku: 'FLT-001',
              description: 'Oil Filter C-110',
              category: 'Filters',
              qty: 3,
              unitSellingPriceRs: 1800,
              unitBuyingCostRs: 1000,
              lineDiscountRs: 0,
              lineTotalSalesRs: 5400,
              lineTotalCostRs: 3000,
              lineGrossProfitRs: 2400,
            },
            {
              id: 'item-2',
              catalogItemId: 'cat-oil',
              sku: 'OIL-5W30',
              description: 'Toyota Engine Oil 5W-30',
              category: 'Lubricants',
              qty: 1,
              unitSellingPriceRs: 12000,
              unitBuyingCostRs: 8000,
              lineDiscountRs: 0,
              lineTotalSalesRs: 12000,
              lineTotalCostRs: 8000,
              lineGrossProfitRs: 4000,
            },
          ],
          subtotalSalesRs: 17400,
          overallDiscountRs: 0,
          netSalesRs: 17400,
          totalBuyingCostRs: 11000,
          grossProfitRs: 6400,
          grossMarginPct: 36.78,
          paymentMethod: 'CASH',
          amountTenderedRs: 20000,
          changeGivenRs: 2600,
          createdAt: '2026-11-02T10:00:00Z',
        },
      ];

      const fastMovers = calculateFastMovingParts(
        sampleJobs,
        samplePosSales,
        catalogItems,
        { range: 'ALL_TIME' }
      );

      expect(fastMovers.length).toBe(2);

      // Oil filter was consumed 1 in workshop + 3 in POS = 4 total qty
      const filterItem = fastMovers.find((p) => p.sku === 'FLT-001');
      expect(filterItem).toBeDefined();
      expect(filterItem?.workshopQtyUsed).toBe(1);
      expect(filterItem?.posQtySold).toBe(3);
      expect(filterItem?.totalQtyConsumed).toBe(4);
      expect(filterItem?.totalRevenueRs).toBe(1800 + 5400); // 7200
      expect(filterItem?.totalCostRs).toBe(1000 + 3000); // 4000
      expect(filterItem?.grossProfitRs).toBe(3200);

      // Oil was consumed 1 in POS
      const oilItem = fastMovers.find((p) => p.sku === 'OIL-5W30');
      expect(oilItem?.totalQtyConsumed).toBe(1);

      // Top mover ranked first by quantity
      expect(fastMovers[0].sku).toBe('FLT-001');
    });

    it('identifies low-stock and out-of-stock alert conditions with deficit quantities', () => {
      const catalogItems: CatalogItem[] = [
        {
          id: 'cat-1',
          sku: 'PRT-HEALTHY',
          itemType: 'SPAREPART',
          name: 'Healthy Part',
          category: 'Body',
          uom: 'pcs',
          buyingCostRs: 1000,
          sellingPriceRs: 2000,
          defaultDiscountPct: 0,
          stockQty: 10,
          lowStockAlertLevel: 3, // Healthy (10 > 3)
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'cat-2',
          sku: 'PRT-LOW',
          itemType: 'SPAREPART',
          name: 'Low Stock Part',
          category: 'Brakes',
          uom: 'sets',
          buyingCostRs: 5000,
          sellingPriceRs: 8000,
          defaultDiscountPct: 0,
          stockQty: 2,
          lowStockAlertLevel: 5, // LOW STOCK (2 <= 5), deficit = 3
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'cat-3',
          sku: 'LUB-OUT',
          itemType: 'LUBRICANT',
          name: 'Out of Stock Oil',
          category: 'Fluids',
          uom: 'cans',
          buyingCostRs: 4000,
          sellingPriceRs: 6500,
          defaultDiscountPct: 0,
          stockQty: 0,
          lowStockAlertLevel: 4, // OUT OF STOCK (0 <= 0), deficit = 4
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
      ];

      const alerts = calculateLowStockAlerts(catalogItems);

      expect(alerts.length).toBe(2);

      // Out of stock sorted first
      expect(alerts[0].sku).toBe('LUB-OUT');
      expect(alerts[0].status).toBe('OUT_OF_STOCK');
      expect(alerts[0].deficitQty).toBe(4);

      // Low stock sorted second
      expect(alerts[1].sku).toBe('PRT-LOW');
      expect(alerts[1].status).toBe('LOW_STOCK');
      expect(alerts[1].deficitQty).toBe(3);
    });
  });

  // =========================================================================
  // 4. Date-Range Sales & Gross Profit Aggregation
  // =========================================================================
  describe('4. Date-Range Sales & Gross Profit Stream Aggregation', () => {
    it('aggregates Workshop Labor, Replacement Parts, and Counter POS Sales accurately', async () => {
      const report = await analyticsRepository.getSalesGrossProfitReport({
        range: 'ALL_TIME',
      });

      expect(report.totalNetSalesRs).toBeGreaterThan(0);
      expect(report.combinedGrossProfitRs).toBe(
        report.totalNetSalesRs - report.totalDirectCostRs
      );

      // Breakdown verification
      const { workshopLabor, workshopParts, counterPosSales } = report.streams;
      expect(workshopLabor.grossProfitRs).toBe(
        workshopLabor.revenueRs - workshopLabor.costRs
      );
      expect(workshopParts.grossProfitRs).toBe(
        workshopParts.revenueRs - workshopParts.costRs
      );
      expect(counterPosSales.grossProfitRs).toBe(
        counterPosSales.revenueRs - counterPosSales.costRs
      );

      // Stream sum matches totals
      expect(
        workshopLabor.revenueRs + workshopParts.revenueRs + counterPosSales.revenueRs
      ).toBeCloseTo(report.totalNetSalesRs, 1);

      expect(
        workshopLabor.costRs + workshopParts.costRs + counterPosSales.costRs
      ).toBeCloseTo(report.totalDirectCostRs, 1);
    });

    it('filters sales by date periods (TODAY vs THIS_WEEK vs THIS_MONTH vs THIS_QUARTER)', async () => {
      const todayReport = await analyticsRepository.getSalesGrossProfitReport({
        range: 'TODAY',
      });
      const quarterReport = await analyticsRepository.getSalesGrossProfitReport({
        range: 'THIS_QUARTER',
      });

      expect(todayReport.dateRange.range).toBe('TODAY');
      expect(quarterReport.dateRange.range).toBe('THIS_QUARTER');
      // Quarter contains at least as much as today
      expect(quarterReport.totalNetSalesRs).toBeGreaterThanOrEqual(
        todayReport.totalNetSalesRs
      );
    });
  });

  // =========================================================================
  // 5. Role Permission Guards on /reports
  // =========================================================================
  describe('5. Role Permission Guard Enforcement for /reports', () => {
    it('ALLOWS OWNER to view the executive reports page', async () => {
      renderReportsApp('OWNER');

      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
      expect(
        screen.getByText('Executive Reports & Analytics Dashboards')
      ).toBeInTheDocument();
      expect(screen.getByTestId('reports-tab-nav')).toBeInTheDocument();
    });

    it('ALLOWS WORKSHOP_MANAGER to view the executive reports page', async () => {
      renderReportsApp('WORKSHOP_MANAGER');

      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
      expect(
        screen.getByText('Executive Reports & Analytics Dashboards')
      ).toBeInTheDocument();
    });

    it('BLOCKS SERVICE_ADVISOR from /reports and displays Access Restricted', async () => {
      renderReportsApp('SERVICE_ADVISOR');

      expect(screen.queryByTestId('reports-page')).not.toBeInTheDocument();
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(
        screen.getByText(/Insufficient Permissions for this Section/i)
      ).toBeInTheDocument();
    });

    it('BLOCKS CASHIER from /reports and displays Access Restricted', async () => {
      renderReportsApp('CASHIER');

      expect(screen.queryByTestId('reports-page')).not.toBeInTheDocument();
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });

    it('BLOCKS TECHNICIAN from /reports and displays Access Restricted', async () => {
      renderReportsApp('TECHNICIAN');

      expect(screen.queryByTestId('reports-page')).not.toBeInTheDocument();
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });

    it('allows quick elevation from Access Restricted screen for dev/testing', async () => {
      renderReportsApp('TECHNICIAN');

      expect(screen.getByText('Access Restricted')).toBeInTheDocument();

      const switchBtn = screen.getByText('Switch to OWNER');
      fireEvent.click(switchBtn);

      await waitFor(() => {
        expect(screen.getByTestId('reports-page')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 6. Interactive UI Tab Navigation & Workflows
  // =========================================================================
  describe('6. Interactive UI Dashboards & Tab Switching', () => {
    it('navigates seamlessly between the 4 dedicated analytics tabs', async () => {
      renderReportsApp('OWNER');

      // 1. Initial tab: Sales & Gross Profit
      expect(screen.getByTestId('date-range-sales-profit-tab')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-gross-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-gross-profit')).toBeInTheDocument();

      // 2. Click Insurance Aging tab
      fireEvent.click(screen.getByTestId('tab-btn-insurance-aging'));
      expect(screen.getByTestId('insurance-aging-tab')).toBeInTheDocument();
      expect(screen.getByTestId('aging-bucket-card-0_30')).toBeInTheDocument();
      expect(screen.getByTestId('aging-bucket-card-31_60')).toBeInTheDocument();
      expect(screen.getByTestId('aging-bucket-card-61_90')).toBeInTheDocument();
      expect(screen.getByTestId('aging-bucket-card-90_PLUS')).toBeInTheDocument();

      // 3. Click Technician Velocity tab
      fireEvent.click(screen.getByTestId('tab-btn-tech-velocity'));
      expect(screen.getByTestId('technician-velocity-tab')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-active-techs')).toBeInTheDocument();
      expect(screen.getByTestId('technicians-table')).toBeInTheDocument();

      // 4. Click Inventory Velocity & Alerts tab
      fireEvent.click(screen.getByTestId('tab-btn-inventory-alerts'));
      expect(screen.getByTestId('fast-moving-parts-alerts-tab')).toBeInTheDocument();
      expect(screen.getByTestId('fast-moving-parts-table')).toBeInTheDocument();
      expect(screen.getByTestId('low-stock-table')).toBeInTheDocument();
    });

    it('filters sales by date periods and updates UI metrics dynamically', async () => {
      renderReportsApp('OWNER');

      expect(screen.getByTestId('filter-btn-this_month')).toBeInTheDocument();

      // Click "Today" filter
      fireEvent.click(screen.getByTestId('filter-btn-today'));
      expect(screen.getByTestId('kpi-gross-revenue')).toBeInTheDocument();

      // Click "This Quarter" filter
      fireEvent.click(screen.getByTestId('filter-btn-this_quarter'));
      expect(screen.getByTestId('kpi-gross-revenue')).toBeInTheDocument();

      // Click "Custom Range" filter
      fireEvent.click(screen.getByTestId('filter-btn-custom'));
      expect(screen.getByTestId('custom-date-inputs')).toBeInTheDocument();
      expect(screen.getByTestId('custom-start-date')).toBeInTheDocument();
      expect(screen.getByTestId('custom-end-date')).toBeInTheDocument();
    });

    it('filters insurance claims by aging bucket and search query', async () => {
      renderReportsApp('OWNER');

      // Switch to Insurance Aging tab
      fireEvent.click(screen.getByTestId('tab-btn-insurance-aging'));

      // Click on 0-30 bucket card to filter
      const bucketCard = screen.getByTestId('aging-bucket-card-0_30');
      fireEvent.click(bucketCard);

      // Search input
      const searchInput = screen.getByTestId('claims-search-input');
      fireEvent.change(searchInput, { target: { value: 'SLIC' } });

      expect(screen.getByTestId('itemized-claims-table')).toBeInTheDocument();
    });

    it('filters technicians by velocity status in Technician Velocity tab', async () => {
      renderReportsApp('OWNER');

      fireEvent.click(screen.getByTestId('tab-btn-tech-velocity'));

      const statusSelect = screen.getByTestId('filter-velocity-status');
      fireEvent.change(statusSelect, { target: { value: 'ON_TRACK' } });

      const techSearch = screen.getByTestId('tech-search-input');
      fireEvent.change(techSearch, { target: { value: 'Nimal' } });

      expect(screen.getByTestId('technicians-table')).toBeInTheDocument();
    });

    it('has quick action linking to /catalog from Low-Stock alerts section', async () => {
      renderReportsApp('OWNER');

      fireEvent.click(screen.getByTestId('tab-btn-inventory-alerts'));

      const catalogBtn = screen.getByTestId('goto-catalog-btn');
      expect(catalogBtn).toBeInTheDocument();
      expect(catalogBtn.getAttribute('href')).toBe('/catalog');
    });

    it('triggers refresh button to reload all analytics metrics', async () => {
      renderReportsApp('OWNER');

      const refreshBtn = screen.getByTestId('refresh-reports-btn');
      fireEvent.click(refreshBtn);

      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. Edge Case Attacks & Robustness Verification
  // =========================================================================
  describe('7. Edge Cases, Null Boundaries & Robustness Hardening', () => {
    it('unifies fast-moving catalog item when workshop job line lacks catalogItemId but matches catalog name', () => {
      const catalogItems: CatalogItem[] = [
        {
          id: 'cat-brake-1',
          sku: 'BP-001',
          itemType: 'SPAREPART',
          name: 'Front Ceramic Brake Pads',
          category: 'Brakes',
          uom: 'sets',
          buyingCostRs: 5000,
          sellingPriceRs: 8500,
          defaultDiscountPct: 0,
          stockQty: 5,
          lowStockAlertLevel: 2,
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
      ];

      // Workshop job line WITHOUT catalogItemId, but matching description
      const jobs: WorkshopJobSheet[] = [
        {
          id: 'job-edge-1',
          jobNumber: 'JOB-2026-E1',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'PAID',
          header: {
            date: '2026-11-02',
            jobNumber: 'JOB-2026-E1',
            vehicleNumber: 'WP CAA-9999',
            natureOfRepair: 'Brake Replacement',
            vehicleMake: 'Toyota',
            chassisNumber: 'CH-99',
            vehicleModel: 'Premio',
            daysForCompletion: '1 Day',
            yearOfMake: '2019',
            vehicleColor: 'White',
            insuranceName: 'Direct Cash Customer',
            customerInfo: 'Sunil',
          },
          lines: [
            {
              id: 'l-edge-1',
              rowNo: 1,
              category: 'REPLACEMENT',
              description: 'Front Ceramic Brake Pads', // No catalogItemId
              sellingPriceRs: 8500,
              buyingCostRs: 5000,
              isCompleted: true,
            },
          ],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 8500,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 8500,
            totalBuyingCostRs: 5000,
            grossProfitRs: 3500,
            grossMarginPct: 41.18,
            insuranceApprovedRs: 0,
            customerPayableRs: 8500,
            advancePaidRs: 8500,
            balanceDueRs: 0,
          },
          createdAt: '2026-11-02T08:00:00Z',
          updatedAt: '2026-11-02T10:00:00Z',
        },
      ];

      // Counter POS sale WITH catalogItemId and SKU
      const posSales: PosSaleTransaction[] = [
        {
          id: 'pos-edge-1',
          receiptNumber: 'POS-2026-999',
          shiftId: 'SHIFT-1',
          cashierName: 'Kamal',
          date: '2026-11-02',
          customerNote: 'Walk-in',
          items: [
            {
              id: 'item-edge-1',
              catalogItemId: 'cat-brake-1',
              sku: 'BP-001',
              description: 'Front Ceramic Brake Pads',
              category: 'Brakes',
              qty: 2,
              unitSellingPriceRs: 8500,
              unitBuyingCostRs: 5000,
              lineDiscountRs: 0,
              lineTotalSalesRs: 17000,
              lineTotalCostRs: 10000,
              lineGrossProfitRs: 7000,
            },
          ],
          subtotalSalesRs: 17000,
          overallDiscountRs: 0,
          netSalesRs: 17000,
          totalBuyingCostRs: 10000,
          grossProfitRs: 7000,
          grossMarginPct: 41.18,
          paymentMethod: 'CASH',
          amountTenderedRs: 20000,
          changeGivenRs: 3000,
          createdAt: '2026-11-02T11:00:00Z',
        },
      ];

      const result = calculateFastMovingParts(jobs, posSales, catalogItems, { range: 'ALL_TIME' });

      // MUST NOT split into 2 entries! Must unify into 1 entry with totalQtyConsumed = 3 (1 workshop + 2 POS)
      expect(result.length).toBe(1);
      expect(result[0].sku).toBe('BP-001');
      expect(result[0].workshopQtyUsed).toBe(1);
      expect(result[0].posQtySold).toBe(2);
      expect(result[0].totalQtyConsumed).toBe(3);
      expect(result[0].totalRevenueRs).toBe(8500 + 17000);
      expect(result[0].totalCostRs).toBe(5000 + 10000);
    });

    it('captures pending insurance claims even when insuranceName is unspecified or blank', () => {
      const refDate = new Date(2026, 10, 2);
      const jobs: WorkshopJobSheet[] = [
        {
          id: 'job-unspecified-ins',
          jobNumber: 'JOB-2026-U1',
          docStage: 'JOB_CARD',
          floorStatus: 'APPROVED_IN_PROGRESS',
          paymentStatus: 'UNPAID',
          header: {
            date: '2026-10-20',
            jobNumber: 'JOB-2026-U1',
            vehicleNumber: 'WP CAB-7777',
            natureOfRepair: 'Rear Crash',
            vehicleMake: 'Honda',
            chassisNumber: 'CH-77',
            vehicleModel: 'Vezel',
            daysForCompletion: '5 Days',
            yearOfMake: '2019',
            vehicleColor: 'Black',
            insuranceName: '', // Blank insurance name!
            customerInfo: 'Nimal',
          },
          lines: [],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 0,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 45000,
            totalBuyingCostRs: 20000,
            grossProfitRs: 25000,
            grossMarginPct: 55.56,
            insuranceApprovedRs: 45000, // Has approved insurance balance
            customerPayableRs: 0,
            advancePaidRs: 0,
            balanceDueRs: 0,
          },
          payments: [],
          createdAt: '2026-10-20T08:00:00Z',
          updatedAt: '2026-10-20T08:00:00Z',
        },
      ];

      const report = aggregateInsuranceAging(jobs, refDate);

      // Must be included in aging report rather than silently dropped
      expect(report.totalOutstandingClaimsRs).toBe(45000);
      expect(report.itemizedClaims.length).toBe(1);
      expect(report.itemizedClaims[0].insuranceCompany).toMatch(/Unspecified/i);
    });

    it('handles invalid dates or missing createdAt without producing NaN turnaround velocity', () => {
      const refDate = new Date(2026, 10, 2);
      const jobs: WorkshopJobSheet[] = [
        {
          id: 'job-corrupt-date',
          jobNumber: 'JOB-2026-BAD',
          docStage: 'INVOICE',
          floorStatus: 'COMPLETED_DELIVERED',
          paymentStatus: 'PAID',
          header: {
            date: '2026-10-28',
            jobNumber: 'JOB-2026-BAD',
            vehicleNumber: 'WP CAD-8888',
            natureOfRepair: 'Repair',
            vehicleMake: 'Nissan',
            chassisNumber: 'CH-88',
            vehicleModel: 'March',
            daysForCompletion: '0 Days', // Edge case: 0 target days
            yearOfMake: '2015',
            vehicleColor: 'Red',
            insuranceName: 'SLIC',
            customerInfo: 'Rohan',
          },
          lines: [
            {
              id: 'l-bad-1',
              rowNo: 1,
              category: 'LABOR_REPAIR',
              description: 'Body fix',
              sellingPriceRs: 10000,
              buyingCostRs: 3000,
              assignedTechnician: 'Kamal Silva',
              isCompleted: true,
            },
          ],
          financials: {
            subtotalRemoveReassembleRs: 0,
            subtotalRepairRs: 10000,
            subtotalReplacementRs: 0,
            discountRs: 0,
            taxRs: 0,
            grandTotalSalesRs: 10000,
            totalBuyingCostRs: 3000,
            grossProfitRs: 7000,
            grossMarginPct: 70,
            insuranceApprovedRs: 0,
            customerPayableRs: 10000,
            advancePaidRs: 10000,
            balanceDueRs: 0,
          },
          createdAt: 'invalid-iso-timestamp' as any, // Invalid date string
          updatedAt: 'corrupt-date' as any,
        },
      ];

      const report = calculateTechnicianTurnaround(jobs, refDate);

      expect(report.totalActiveTechnicians).toBe(1);
      const kamal = report.technicians[0];
      expect(Number.isNaN(kamal.avgTurnaroundDays)).toBe(false);
      expect(Number.isNaN(kamal.avgEstimatedTargetDays)).toBe(false);
      expect(kamal.avgTurnaroundDays).toBeGreaterThanOrEqual(1);
      expect(kamal.avgEstimatedTargetDays).toBeGreaterThanOrEqual(1);
      expect(Number.isNaN(report.overallAvgTurnaroundDays)).toBe(false);
    });
  });
});
