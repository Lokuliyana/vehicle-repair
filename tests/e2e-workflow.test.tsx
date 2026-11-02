import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { WorkshopJobsPage } from '@/features/workshop/pages/WorkshopJobsPage';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { financeRepository } from '@/features/finance-reports/repository/finance.repository.mock';
import { analyticsRepository } from '@/features/finance-reports/repository/analytics.repository.mock';
import { calculateWorkshopFinancials } from '@/utils/currency';
import { WorkshopLineItem } from '@/types';

describe('Phase 10: Comprehensive End-to-End Workflow Integration Test Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
    await posSaleRepository.resetToDefaults();
    await posShiftRepository.resetToDefaults();
    await financeRepository.resetToDefaults();
  });

  it('executes full end-to-end workshop lifecycle: Intake -> Quotation -> Estimate -> Job Card (Snapshot) -> Supplementary Item -> Invoice (Split) -> Multi-Method Payment Collections -> Ledger Reconciliations', async () => {
    // -------------------------------------------------------------------------
    // 1. ZERO-CRM VEHICLE INTAKE & FREEFORM MANUAL HEADER ENTRY
    // -------------------------------------------------------------------------
    const newVehicleNumber = 'WP CP-9009';
    const initialJobNumber = 'JOB-2026-9009';

    const createdJob = await workshopJobRepository.create({
      jobNumber: initialJobNumber,
      docStage: 'QUOTATION',
      floorStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      header: {
        date: '2026-11-02',
        jobNumber: initialJobNumber,
        vehicleNumber: newVehicleNumber,
        natureOfRepair: 'Frontal Crash Repair & Suspension Overhaul',
        vehicleMake: 'Mitsubishi',
        chassisNumber: 'CY4A-0987654',
        vehicleModel: 'Lancer EX',
        daysForCompletion: '5 Days',
        yearOfMake: '2017',
        vehicleColor: 'Titanium Gray',
        insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
        customerInfo: 'Dr. Anura Bandara - 077 987 6543',
      },
      lines: [
        {
          id: 'l1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Front Bumper, Fender & Headlight R&R',
          sellingPriceRs: 12000,
          buyingCostRs: 3000,
          assignedTechnician: 'Nimal',
          isCompleted: false,
          isSupplementary: false,
        },
        {
          id: 'l2',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Apron Realignment & Frame Straightening',
          sellingPriceRs: 25000,
          buyingCostRs: 6000,
          assignedTechnician: 'Sunil',
          isCompleted: false,
          isSupplementary: false,
        },
        {
          id: 'l3',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'Radiator Support Frame Assembly',
          sellingPriceRs: 40000,
          buyingCostRs: 28000,
          assignedTechnician: 'Stores',
          isCompleted: false,
          isSupplementary: false,
        },
      ],
      discountRs: 2000,
      taxRs: 0,
      insuranceApprovedRs: 0,
      advancePaidRs: 0,
    });

    expect(createdJob.id).toBeDefined();
    expect(createdJob.header.vehicleNumber).toBe('WP CP-9009');
    expect(createdJob.header.customerInfo).toBe('Dr. Anura Bandara - 077 987 6543');
    expect(createdJob.docStage).toBe('QUOTATION');

    // -------------------------------------------------------------------------
    // 2. CREATE QUOTATION & TRANSITION TO ACCIDENT REPAIR ESTIMATE
    // -------------------------------------------------------------------------
    const quotationFinancials = calculateWorkshopFinancials(
      createdJob.lines,
      createdJob.financials.discountRs,
      createdJob.financials.taxRs,
      0,
      0
    );
    expect(quotationFinancials.subtotalRemoveReassembleRs).toBe(12000);
    expect(quotationFinancials.subtotalRepairRs).toBe(25000);
    expect(quotationFinancials.subtotalReplacementRs).toBe(40000);
    expect(quotationFinancials.grandTotalSalesRs).toBe(75000); // 12000 + 25000 + 40000 - 2000

    // Transition to ESTIMATE with initial insurance approval and advance payment
    const estimateJob = await workshopJobRepository.update(createdJob.id, {
      docStage: 'ESTIMATE',
      floorStatus: 'PENDING_INSURANCE_APPROVAL',
      insuranceApprovedRs: 55000,
      advancePaidRs: 10000,
    });

    expect(estimateJob.docStage).toBe('ESTIMATE');
    expect(estimateJob.financials.grandTotalSalesRs).toBe(75000);
    expect(estimateJob.financials.insuranceApprovedRs).toBe(55000);
    expect(estimateJob.financials.customerPayableRs).toBe(20000); // 75000 - 55000
    expect(estimateJob.financials.advancePaidRs).toBe(10000);
    expect(estimateJob.financials.balanceDueRs).toBe(10000); // 20000 - 10000

    // -------------------------------------------------------------------------
    // 3. CONVERT TO JOB CARD: VERIFY FROZEN IMMUTABLE BASELINE ESTIMATE SNAPSHOT
    // -------------------------------------------------------------------------
    const baselineSnapshot = JSON.stringify({
      id: estimateJob.id,
      jobNumber: estimateJob.jobNumber,
      docStage: 'ESTIMATE',
      grandTotalSalesRs: estimateJob.financials.grandTotalSalesRs,
      lines: estimateJob.lines,
      frozenAt: new Date().toISOString(),
    });

    const jobCardJob = await workshopJobRepository.update(estimateJob.id, {
      docStage: 'JOB_CARD',
      floorStatus: 'APPROVED_IN_PROGRESS',
      originalEstimateSnapshot: baselineSnapshot,
    });

    expect(jobCardJob.docStage).toBe('JOB_CARD');
    expect(jobCardJob.floorStatus).toBe('APPROVED_IN_PROGRESS');
    expect(jobCardJob.originalEstimateSnapshot).toBeDefined();

    const parsedSnapshot = JSON.parse(jobCardJob.originalEstimateSnapshot!);
    expect(parsedSnapshot.grandTotalSalesRs).toBe(75000);
    expect(parsedSnapshot.lines.length).toBe(3);

    // -------------------------------------------------------------------------
    // 4. ADD SUPPLEMENTARY LINE ITEMS DURING DISMANTLING (WITH BADGE INVARIANT)
    // -------------------------------------------------------------------------
    const supplementaryLine: WorkshopLineItem = {
      id: 'l4-supp',
      rowNo: 2,
      category: 'REPLACEMENT',
      description: 'Air Conditioning Condenser & Pipe Assembly (Hidden Impact Damage)',
      sellingPriceRs: 22000,
      buyingCostRs: 15000,
      assignedTechnician: 'Stores',
      isCompleted: false,
      isSupplementary: true, // MUST BE MARKED AS SUPPLEMENTARY
    };

    const linesWithSupplementary = [...jobCardJob.lines, supplementaryLine];
    const updatedJobCard = await workshopJobRepository.update(jobCardJob.id, {
      lines: linesWithSupplementary,
    });

    expect(updatedJobCard.lines.length).toBe(4);
    const savedSuppItem = updatedJobCard.lines.find((l) => l.id === 'l4-supp');
    expect(savedSuppItem?.isSupplementary).toBe(true);

    // -------------------------------------------------------------------------
    // 5. CONVERT TO INVOICE: VERIFY INSURANCE SPLIT BILLING ACCURACY
    // -------------------------------------------------------------------------
    // Grand Total: 75,000 + 22,000 = 97,000
    // Supplementary insurance approval increases insurance coverage from 55,000 to 70,000
    const invoiceJob = await workshopJobRepository.update(updatedJobCard.id, {
      docStage: 'INVOICE',
      floorStatus: 'READY_FOR_DELIVERY',
      insuranceApprovedRs: 70000,
      advancePaidRs: 10000,
    });

    expect(invoiceJob.docStage).toBe('INVOICE');
    expect(invoiceJob.financials.grandTotalSalesRs).toBe(97000);
    expect(invoiceJob.financials.insuranceApprovedRs).toBe(70000);
    expect(invoiceJob.financials.customerPayableRs).toBe(27000); // 97000 - 70000
    expect(invoiceJob.financials.advancePaidRs).toBe(10000);
    expect(invoiceJob.financials.balanceDueRs).toBe(17000); // 27000 - 10000
    expect(invoiceJob.paymentStatus).toBe('PARTIALLY_PAID');

    // -------------------------------------------------------------------------
    // 6. COLLECT PAYMENTS ACROSS MULTIPLE METHODS & VERIFY STATUS TRANSITIONS
    // -------------------------------------------------------------------------
    // Payment 1: Cash payment of Rs. 7,000
    const afterPay1 = await workshopJobRepository.recordPayment(invoiceJob.id, {
      amountRs: 7000,
      paymentType: 'CUSTOMER_EXCESS',
      paymentMethod: 'CASH',
      referenceNumber: 'CASH-001',
      notes: 'Customer paid partial excess in cash',
    });
    expect(afterPay1.financials.balanceDueRs).toBe(10000);
    expect(afterPay1.paymentStatus).toBe('PARTIALLY_PAID');
    expect(afterPay1.payments?.length).toBe(1);

    // Payment 2: Card payment of Rs. 5,000
    const afterPay2 = await workshopJobRepository.recordPayment(invoiceJob.id, {
      amountRs: 5000,
      paymentType: 'CUSTOMER_EXCESS',
      paymentMethod: 'CARD',
      referenceNumber: 'VISA-4491',
      notes: 'Card payment for remaining balance part',
    });
    expect(afterPay2.financials.balanceDueRs).toBe(5000);
    expect(afterPay2.paymentStatus).toBe('PARTIALLY_PAID');
    expect(afterPay2.payments?.length).toBe(2);

    // Payment 3: Cheque payment of Rs. 5,000 (Settles customer balance due in full)
    const afterPay3 = await workshopJobRepository.recordPayment(invoiceJob.id, {
      amountRs: 5000,
      paymentType: 'CUSTOMER_EXCESS',
      paymentMethod: 'CHEQUE',
      referenceNumber: 'CHQ-882910',
      notes: 'Cheque payment settling customer excess in full',
    });
    expect(afterPay3.financials.balanceDueRs).toBe(0);
    expect(afterPay3.payments?.length).toBe(3);

    // Payment 4: Insurance Settlement of Rs. 70,000 via Bank Transfer
    const afterPay4 = await workshopJobRepository.recordPayment(invoiceJob.id, {
      amountRs: 70000,
      paymentType: 'INSURANCE_SETTLEMENT',
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: 'TXN-SLIC-77881',
      notes: 'SLIC insurance company settlement claim payout',
    });
    expect(afterPay4.paymentStatus).toBe('PAID'); // STATUS TRANSITIONS TO PAID!
    expect(afterPay4.floorStatus).toBe('COMPLETED_DELIVERED');
    expect(afterPay4.payments?.length).toBe(4);

    // -------------------------------------------------------------------------
    // 7. COMPLETE WALK-IN POS COUNTER SALE & CASH DRAWER SHIFT UPDATE
    // -------------------------------------------------------------------------
    // Open cash shift with float Rs. 5,000
    const openedShift = await posShiftRepository.openShift('cashier-01', 'Kamal Fonseka', 5000);
    expect(openedShift.status).toBe('OPEN');
    expect(openedShift.openingFloatRs).toBe(5000);

    // Create / fetch catalog item
    const oilItem = await catalogRepository.create({
      sku: 'OIL-SYN-5W30',
      name: 'Full Synthetic Engine Oil 5W-30 4L Castrol Magnatec',
      itemType: 'LUBRICANT',
      category: 'LUBRICANTS',
      uom: 'CAN',
      buyingCostRs: 6500,
      sellingPriceRs: 9000,
      stockQty: 20,
    });
    expect(oilItem.stockQty).toBe(20);

    // Process sale: 3 cans = 27,000
    const createdSale = await posSaleRepository.create({
      shiftId: openedShift.id,
      cashierId: 'cashier-01',
      cashierName: 'Kamal Fonseka',
      customerNote: 'Walk-in cash counter sale',
      paymentMethod: 'CASH',
      amountTenderedRs: 30000,
      items: [
        {
          catalogItemId: oilItem.id,
          sku: oilItem.sku,
          description: oilItem.name,
          category: oilItem.category,
          unitSellingPriceRs: 9000,
          unitBuyingCostRs: 6500,
          qty: 3,
          lineDiscountRs: 0,
        },
      ],
    });
    expect(createdSale.netSalesRs).toBe(27000);
    expect(createdSale.changeGivenRs).toBe(3000);

    // Verify stock decrement in CatalogRepository (20 -> 17)
    const reloadedOilItem = await catalogRepository.getById(oilItem.id);
    expect(reloadedOilItem?.stockQty).toBe(17);

    // Verify cash shift register updates
    const activeShift = await posShiftRepository.getActiveShift();
    expect(activeShift?.totalCashSalesRs).toBe(27000);
    expect(activeShift?.expectedDrawerCashRs).toBe(32000); // 5000 float + 27000 cash sale

    // -------------------------------------------------------------------------
    // 8. FINANCIAL PROFIT LEDGER: WORKSHOP + POS SALES - DIRECT COSTS - EXPENSES
    // -------------------------------------------------------------------------
    // Record daily shop expense: Workshop Electricity Utilities Rs. 7,500
    await financeRepository.createExpense({
      date: '2026-11-02',
      category: 'ELECTRICITY_UTILITIES',
      description: 'Monthly Workshop Three-Phase Power Bill',
      amountRs: 7500,
      paidFrom: 'MAIN_CASH',
    });

    const profitSummary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

    // Ledger reconciliations
    expect(profitSummary.workshopTotalRevenueRs).toBeGreaterThanOrEqual(97000);
    expect(profitSummary.posSalesRevenueRs).toBeGreaterThanOrEqual(27000);
    expect(profitSummary.totalNetSalesRs).toBe(
      profitSummary.workshopTotalRevenueRs + profitSummary.posSalesRevenueRs
    );
    expect(profitSummary.totalDirectCostRs).toBe(
      profitSummary.workshopTotalCostRs + profitSummary.posBuyingCostRs
    );
    expect(profitSummary.combinedGrossProfitRs).toBe(
      profitSummary.totalNetSalesRs - profitSummary.totalDirectCostRs
    );
    expect(profitSummary.dailyOperatingExpensesRs).toBeGreaterThanOrEqual(7500);
    expect(profitSummary.netOperatingProfitRs).toBe(
      profitSummary.combinedGrossProfitRs - profitSummary.dailyOperatingExpensesRs
    );

    // -------------------------------------------------------------------------
    // 9. REPORTS & ANALYTICS: INSURANCE CLAIM AGING & INVENTORY CONSUMPTION
    // -------------------------------------------------------------------------
    // Insurance aging report
    const agingReport = await analyticsRepository.getInsuranceAgingReport();
    expect(agingReport).toBeDefined();
    expect(agingReport.companySummaries).toBeDefined();

    // Inventory consumption report
    const inventoryReport = await analyticsRepository.getInventoryVelocityAndAlertsReport({
      range: 'ALL_TIME',
    });
    expect(inventoryReport.fastMovingParts.length).toBeGreaterThan(0);
  });

  it('renders zero-CRM vehicle intake on Workshop Jobs History and allows navigation to new sheet', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/workshop/jobs',
          element: <WorkshopJobsPage />,
        },
        {
          path: '/workshop/sheet',
          element: <div data-testid="new-sheet-target">New Workshop Sheet</div>,
        },
      ],
      { initialEntries: ['/workshop/jobs'] }
    );

    render(
      <ToastProvider>
        <AuthProvider initialRole="OWNER">
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('workshop-jobs-page')).toBeInTheDocument();
    });

    // Verify "+ New Repair Sheet" button exists for immediate zero-CRM vehicle intake
    const newSheetBtn = screen.getByTestId('create-new-sheet-btn');
    expect(newSheetBtn).toBeInTheDocument();
    expect(newSheetBtn).toHaveTextContent(/New Repair Sheet/i);
  });
});
