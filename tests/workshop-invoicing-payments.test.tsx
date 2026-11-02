import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { RepairSheetPage } from '@/features/workshop/pages/RepairSheetPage';
import { WorkshopJobsPage } from '@/features/workshop/pages/WorkshopJobsPage';
import { PaymentCollectionModal } from '@/features/workshop/components/PaymentCollectionModal';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { WorkshopPaymentThermalReceipt } from '@/components/print/WorkshopPaymentThermalReceipt';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { determineWorkshopPaymentStatus, calculateWorkshopFinancials } from '@/utils/currency';
import { WorkshopJobSheet, WorkshopPaymentRecord } from '@/types';

describe('Phase 6: Workshop Invoicing, Split Billing & Collections', () => {
  beforeEach(async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    await workshopJobRepository.resetToDefaults();
  });

  describe('1. Insurance Split Billing & Dynamic Payment Status State Machine', () => {
    it('accurately computes Gross Sales, Net Sales, Customer Payable, and Balance Due matching Master Guide', () => {
      const lines = [
        {
          id: 'l1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE' as const,
          description: 'Front bumper R&R',
          sellingPriceRs: 12000,
          buyingCostRs: 3000,
          isCompleted: true,
        },
        {
          id: 'l2',
          rowNo: 1,
          category: 'LABOR_REPAIR' as const,
          description: 'Fender alignment',
          sellingPriceRs: 18000,
          buyingCostRs: 4000,
          isCompleted: true,
        },
        {
          id: 'l3',
          rowNo: 1,
          category: 'REPLACEMENT' as const,
          description: 'Headlight Assembly',
          sellingPriceRs: 70000,
          buyingCostRs: 50000,
          isCompleted: true,
        },
      ];

      // Gross = 12000 + 18000 + 70000 = 100,000
      // Discount = 5,000 -> Net = 95,000
      // Tax = 2,000 -> Grand Total = 97,000
      // Insurance Approved = 80,000 -> Customer Payable = 17,000
      // Advance Paid = 10,000 -> Balance Due = 7,000
      const summary = calculateWorkshopFinancials(lines, 5000, 2000, 80000, 10000);

      expect(summary.subtotalRemoveReassembleRs).toBe(12000);
      expect(summary.subtotalRepairRs).toBe(18000);
      expect(summary.subtotalReplacementRs).toBe(70000);
      expect(summary.discountRs).toBe(5000);
      expect(summary.taxRs).toBe(2000);
      expect(summary.grandTotalSalesRs).toBe(97000);
      expect(summary.insuranceApprovedRs).toBe(80000);
      expect(summary.customerPayableRs).toBe(17000);
      expect(summary.advancePaidRs).toBe(10000);
      expect(summary.balanceDueRs).toBe(7000);
    });

    it('evaluates dynamic paymentStatus state machine: UNPAID -> PARTIALLY_PAID -> PAID', () => {
      // 1. UNPAID: Zero advance and pending balance due > 0
      const status1 = determineWorkshopPaymentStatus({
        grandTotalSalesRs: 50000,
        insuranceApprovedRs: 0,
        advancePaidRs: 0,
        balanceDueRs: 50000,
        payments: [],
      });
      expect(status1).toBe('UNPAID');

      // 2. PARTIALLY_PAID: Partial advance paid, but customer balance due > 0
      const status2 = determineWorkshopPaymentStatus({
        grandTotalSalesRs: 50000,
        insuranceApprovedRs: 0,
        advancePaidRs: 20000,
        balanceDueRs: 30000,
        payments: [
          {
            amountRs: 20000,
            paymentType: 'ADVANCE',
          },
        ],
      });
      expect(status2).toBe('PARTIALLY_PAID');

      // 3. PAID: Customer balance due is 0 without insurance claim
      const status3 = determineWorkshopPaymentStatus({
        grandTotalSalesRs: 50000,
        insuranceApprovedRs: 0,
        advancePaidRs: 50000,
        balanceDueRs: 0,
        payments: [
          {
            amountRs: 50000,
            paymentType: 'FULL_PAYMENT',
          },
        ],
      });
      expect(status3).toBe('PAID');

      // 4. Insurance Split Billing: Customer paid excess, but insurance settlement is still pending
      const status4 = determineWorkshopPaymentStatus({
        grandTotalSalesRs: 100000,
        insuranceApprovedRs: 80000,
        advancePaidRs: 20000,
        balanceDueRs: 0, // Customer portion is paid off
        payments: [
          {
            amountRs: 20000,
            paymentType: 'CUSTOMER_EXCESS',
          },
        ],
      });
      // Remains PARTIALLY_PAID because insurance settlement of 80,000 is still pending!
      expect(status4).toBe('PARTIALLY_PAID');

      // 5. Insurance Split Billing: Both customer excess AND insurance settlement collected
      const status5 = determineWorkshopPaymentStatus({
        grandTotalSalesRs: 100000,
        insuranceApprovedRs: 80000,
        advancePaidRs: 20000,
        balanceDueRs: 0,
        payments: [
          {
            amountRs: 20000,
            paymentType: 'CUSTOMER_EXCESS',
          },
          {
            amountRs: 80000,
            paymentType: 'INSURANCE_SETTLEMENT',
          },
        ],
      });
      // Transitions to PAID!
      expect(status5).toBe('PAID');

      // 6. REFUNDED_VOID when void flag is set
      const status6 = determineWorkshopPaymentStatus({
        grandTotalSalesRs: 50000,
        balanceDueRs: 0,
        isVoid: true,
      });
      expect(status6).toBe('REFUNDED_VOID');
    });
  });

  describe('2. Repository Level Payment Recording & Guard Validations', () => {
    it('records a payment and increments advancePaidRs and sequential receipt numbers', async () => {
      const job = await workshopJobRepository.getByJobNumber('JOB-2026-0042');
      expect(job).not.toBeNull();

      // Ensure fresh job has some balance due
      const updatedJob = await workshopJobRepository.update(job!.id, {
        advancePaidRs: 0,
        insuranceApprovedRs: 0,
      });
      expect(updatedJob.financials.balanceDueRs).toBe(85000);

      // Record first payment of Rs. 35,000 Cash
      const afterFirstPayment = await workshopJobRepository.recordPayment(job!.id, {
        amountRs: 35000,
        paymentType: 'ADVANCE',
        paymentMethod: 'CASH',
        notes: 'Initial deposit by customer',
        recordedBy: 'Cashier 1',
      });

      expect(afterFirstPayment.financials.advancePaidRs).toBe(35000);
      expect(afterFirstPayment.financials.balanceDueRs).toBe(50000);
      expect(afterFirstPayment.paymentStatus).toBe('PARTIALLY_PAID');
      expect(afterFirstPayment.payments?.length).toBe(1);

      const receipt1 = afterFirstPayment.payments![0];
      const currentYear = new Date().getFullYear();
      expect(receipt1.receiptNumber).toBe(`REC-${currentYear}-0001`);
      expect(receipt1.amountRs).toBe(35000);
      expect(receipt1.paymentMethod).toBe('CASH');
      expect(receipt1.balanceAfterRs).toBe(50000);

      // Verify audit log entry was created
      const auditLog = afterFirstPayment.auditLogs?.find(
        (l) => l.action === 'PAYMENT_COLLECTED'
      );
      expect(auditLog).toBeDefined();
      expect(auditLog?.comment).toContain('Rs. 35,000.00 via CASH');

      // Record second payment: Card payment with slip reference #
      const afterSecondPayment = await workshopJobRepository.recordPayment(job!.id, {
        amountRs: 50000,
        paymentType: 'FULL_PAYMENT',
        paymentMethod: 'CARD',
        referenceNumber: 'AUTH-998822',
        recordedBy: 'Cashier 1',
      });

      expect(afterSecondPayment.financials.advancePaidRs).toBe(85000);
      expect(afterSecondPayment.financials.balanceDueRs).toBe(0);
      expect(afterSecondPayment.paymentStatus).toBe('PAID');
      expect(afterSecondPayment.payments?.length).toBe(2);

      const receipt2 = afterSecondPayment.payments![1];
      expect(receipt2.receiptNumber).toBe(`REC-${currentYear}-0002`);
      expect(receipt2.referenceNumber).toBe('AUTH-998822');
      expect(receipt2.balanceAfterRs).toBe(0);
    });

    it('enforces validation guards: rejects non-positive amounts and overpayments', async () => {
      const job = await workshopJobRepository.getByJobNumber('JOB-2026-0042');
      expect(job).not.toBeNull();

      // Zero or negative payment
      await expect(
        workshopJobRepository.recordPayment(job!.id, {
          amountRs: 0,
          paymentType: 'ADVANCE',
          paymentMethod: 'CASH',
        })
      ).rejects.toThrow(/greater than 0/i);

      await expect(
        workshopJobRepository.recordPayment(job!.id, {
          amountRs: -500,
          paymentType: 'ADVANCE',
          paymentMethod: 'CASH',
        })
      ).rejects.toThrow(/greater than 0/i);

      // Overpayment exceeding customer balance due
      const balanceDue = job!.financials.balanceDueRs;
      await expect(
        workshopJobRepository.recordPayment(job!.id, {
          amountRs: balanceDue + 10000,
          paymentType: 'ADVANCE',
          paymentMethod: 'CASH',
        })
      ).rejects.toThrow(/exceeds customer balance due/i);
    });

    it('handles insurance company settlement payments correctly', async () => {
      // Create an insurance claim job
      const newJob = await workshopJobRepository.create({
        docStage: 'JOB_CARD',
        floorStatus: 'APPROVED_IN_PROGRESS',
        header: {
          date: '2026-11-02',
          jobNumber: '',
          vehicleNumber: 'WP CAR-7788',
          natureOfRepair: 'Collision repair',
          vehicleMake: 'Toyota',
          chassisNumber: 'NZE-112233',
          vehicleModel: 'Allion',
          daysForCompletion: '5 Days',
          yearOfMake: '2017',
          vehicleColor: 'Silver',
          insuranceName: 'Ceylinco General Insurance',
          customerInfo: 'Nimal Silva',
        },
        lines: [
          {
            id: 'l1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Body beating',
            sellingPriceRs: 50000,
            buyingCostRs: 15000,
            isCompleted: true,
          },
        ],
        insuranceApprovedRs: 40000,
        advancePaidRs: 10000, // Customer pays their 10,000 excess
      });

      expect(newJob.financials.customerPayableRs).toBe(10000);
      expect(newJob.financials.balanceDueRs).toBe(0); // Customer portion is 0
      expect(newJob.paymentStatus).toBe('PARTIALLY_PAID'); // Because insurance 40,000 is pending

      // Reject insurance overpayment
      await expect(
        workshopJobRepository.recordPayment(newJob.id, {
          amountRs: 45000, // Exceeds 40,000 approved amount
          paymentType: 'INSURANCE_SETTLEMENT',
          paymentMethod: 'BANK_TRANSFER',
        })
      ).rejects.toThrow(/exceeds pending insurance settlement/i);

      // Settle insurance amount partially: Rs. 25,000 of 40,000
      const partialJob = await workshopJobRepository.recordPayment(newJob.id, {
        amountRs: 25000,
        paymentType: 'INSURANCE_SETTLEMENT',
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'SLIC-CHEQUE-78192-PART1',
        notes: 'Partial settlement from Ceylinco',
        recordedBy: 'Finance Desk',
      });

      expect(partialJob.paymentStatus).toBe('PARTIALLY_PAID');
      expect(partialJob.payments?.length).toBe(1);
      expect(partialJob.payments![0].balanceAfterRs).toBe(15000); // 40,000 - 25,000 = 15,000
      const partialAudit = partialJob.auditLogs?.find((l) => l.action === 'PAYMENT_COLLECTED');
      expect(partialAudit?.comment).toContain('Insurance balance remaining: Rs. 15,000.00');

      // Settle remaining insurance amount: Rs. 15,000
      const fullySettledJob = await workshopJobRepository.recordPayment(newJob.id, {
        amountRs: 15000,
        paymentType: 'INSURANCE_SETTLEMENT',
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'SLIC-CHEQUE-78192-PART2',
        notes: 'Final settlement from Ceylinco',
        recordedBy: 'Finance Desk',
      });

      expect(fullySettledJob.paymentStatus).toBe('PAID');
      expect(fullySettledJob.payments?.length).toBe(2);
      expect(fullySettledJob.payments![1].balanceAfterRs).toBe(0);
      expect(fullySettledJob.payments![1].paymentType).toBe('INSURANCE_SETTLEMENT');
    });
  });

  describe('3. 1-Click Conversion to Final Invoice', () => {
    it('converts Job Card to Invoice in RepairSheetPage, sets READY_FOR_DELIVERY, and preserves metadata & lines', async () => {
      // Use job-2 which is a JOB_CARD
      const job = await workshopJobRepository.getByJobNumber('JOB-2026-0041');
      expect(job).not.toBeNull();
      expect(job?.docStage).toBe('JOB_CARD');

      render(
        <AuthProvider initialRole="WORKSHOP_MANAGER">
          <ToastProvider>
            <MemoryRouter initialEntries={[`/workshop/sheet/${job!.id}`]}>
              <Routes>
                <Route path="/workshop/sheet/:id" element={<RepairSheetPage />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      );

      // Verify page loads with JOB_CARD stage
      await waitFor(() => {
        expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('JOB_CARD');
      });

      // Verify 1-click "Convert to Invoice" button is visible
      const convertBtn = screen.getByTestId('convert-to-invoice-btn');
      expect(convertBtn).toBeInTheDocument();

      fireEvent.click(convertBtn);

      // Verify document stage converted to INVOICE
      await waitFor(() => {
        expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('INVOICE');
      });

      // Verify repository updated
      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(job!.id);
        expect(reloaded?.docStage).toBe('INVOICE');
        expect(reloaded?.floorStatus).toBe('READY_FOR_DELIVERY');
        // Preserved header & line items
        expect(reloaded?.header.vehicleNumber).toBe(job!.header.vehicleNumber);
        expect(reloaded?.lines.length).toBe(job!.lines.length);
        // Audit log recorded
        const conversionAudit = reloaded?.auditLogs?.find(
          (l) => l.action === 'STAGE_CONVERSION' && l.toState === 'INVOICE'
        );
        expect(conversionAudit).toBeDefined();
      });
    });

    it('converts Estimate to Invoice in WorkshopJobsPage with 1-click action button', async () => {
      render(
        <AuthProvider initialRole="WORKSHOP_MANAGER">
          <ToastProvider>
            <MemoryRouter>
              <WorkshopJobsPage />
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('WP CAB-4521')).toBeInTheDocument();
      });

      // Target job-1 which is in ESTIMATE stage
      const convertInvoiceBtn = screen.getByTestId('convert-invoice-btn-job-1');
      expect(convertInvoiceBtn).toBeInTheDocument();

      fireEvent.click(convertInvoiceBtn);

      await waitFor(async () => {
        const job = await workshopJobRepository.getById('job-1');
        expect(job?.docStage).toBe('INVOICE');
        expect(job?.originalEstimateSnapshot).toBeDefined();
      });
    });

    it('sets READY_FOR_DELIVERY when customer balance is 0 but insurance settlement is pending, and COMPLETED_DELIVERED when fully paid', async () => {
      // Create a job with insurance where customer excess is 0 but insurance approved is pending
      const insJob = await workshopJobRepository.create({
        docStage: 'JOB_CARD',
        floorStatus: 'APPROVED_IN_PROGRESS',
        header: {
          date: '2026-11-02',
          jobNumber: '',
          vehicleNumber: 'WP KAA-9900',
          natureOfRepair: 'Insurance claim repair',
          vehicleMake: 'Mazda',
          chassisNumber: 'MZ-123',
          vehicleModel: 'Axela',
          daysForCompletion: '3 Days',
          yearOfMake: '2015',
          vehicleColor: 'Blue',
          insuranceName: 'Allianz Insurance',
          customerInfo: 'Sunil',
        },
        lines: [
          {
            id: 'l1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Panel Repair',
            sellingPriceRs: 50000,
            buyingCostRs: 20000,
            isCompleted: true,
          },
        ],
        insuranceApprovedRs: 50000,
        advancePaidRs: 0,
      });

      // Customer balance due is 0 (50,000 - 50,000 insurance approved = 0), BUT insurance is pending!
      expect(insJob.financials.balanceDueRs).toBe(0);
      expect(insJob.paymentStatus).toBe('UNPAID');

      render(
        <AuthProvider initialRole="WORKSHOP_MANAGER">
          <ToastProvider>
            <MemoryRouter initialEntries={[`/workshop/sheet/${insJob.id}`]}>
              <Routes>
                <Route path="/workshop/sheet/:id" element={<RepairSheetPage />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-invoice-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-to-invoice-btn'));

      // Since insurance settlement of 50,000 is still pending, floor status MUST be READY_FOR_DELIVERY, NOT COMPLETED_DELIVERED!
      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(insJob.id);
        expect(reloaded?.docStage).toBe('INVOICE');
        expect(reloaded?.floorStatus).toBe('READY_FOR_DELIVERY');
        expect(reloaded?.paymentStatus).not.toBe('PAID');
      });

      // Now settle the insurance payment
      await workshopJobRepository.recordPayment(insJob.id, {
        amountRs: 50000,
        paymentType: 'INSURANCE_SETTLEMENT',
        paymentMethod: 'BANK_TRANSFER',
      });

      const settled = await workshopJobRepository.getById(insJob.id);
      expect(settled?.paymentStatus).toBe('PAID');
      // When invoice is fully paid, recordPayment transitions floorStatus to COMPLETED_DELIVERED!
      expect(settled?.floorStatus).toBe('COMPLETED_DELIVERED');
    });

    it('converts Estimate directly to Invoice in RepairSheetPage with frozen baseline snapshot', async () => {
      const estJob = await workshopJobRepository.create({
        docStage: 'ESTIMATE',
        floorStatus: 'DRAFT',
        header: {
          date: '2026-11-02',
          jobNumber: '',
          vehicleNumber: 'WP CAA-7711',
          natureOfRepair: 'Direct customer paint work',
          vehicleMake: 'Honda',
          chassisNumber: 'FIT-001',
          vehicleModel: 'Fit',
          daysForCompletion: '2 Days',
          yearOfMake: '2018',
          vehicleColor: 'White',
          insuranceName: '',
          customerInfo: 'Kamal Perera',
        },
        lines: [
          {
            id: 'l1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Door Paint',
            sellingPriceRs: 20000,
            buyingCostRs: 8000,
            isCompleted: true,
          },
        ],
        advancePaidRs: 0,
      });

      render(
        <AuthProvider initialRole="WORKSHOP_MANAGER">
          <ToastProvider>
            <MemoryRouter initialEntries={[`/workshop/sheet/${estJob.id}`]}>
              <Routes>
                <Route path="/workshop/sheet/:id" element={<RepairSheetPage />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-invoice-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-to-invoice-btn'));

      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(estJob.id);
        expect(reloaded?.docStage).toBe('INVOICE');
        expect(reloaded?.floorStatus).toBe('READY_FOR_DELIVERY');
        expect(reloaded?.originalEstimateSnapshot).toBeDefined();
        const parsed = JSON.parse(reloaded!.originalEstimateSnapshot!);
        expect(parsed.financials.grandTotalSalesRs).toBe(20000);
      });
    });
  });

  describe('4. PaymentCollectionModal Component Behavior', () => {
    it('renders pending balances, validates input, and records payment successfully', async () => {
      const job = (await workshopJobRepository.getByJobNumber('JOB-2026-0041'))!;
      const onPaymentSuccess = vi.fn();

      render(
        <AuthProvider initialRole="CASHIER">
          <ToastProvider>
            <PaymentCollectionModal
              isOpen={true}
              onClose={() => {}}
              job={job}
              onPaymentSuccess={onPaymentSuccess}
            />
          </ToastProvider>
        </AuthProvider>
      );

      expect(screen.getByText(/Workshop Payment Collection/i)).toBeInTheDocument();
      expect(screen.getByText('WP CAR-1234')).toBeInTheDocument();

      const amountInput = screen.getByTestId('payment-amount-input');
      const submitBtn = screen.getByTestId('record-payment-submit-btn');

      // Attempt submitting 0
      fireEvent.change(amountInput, { target: { value: '0' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('payment-validation-error')).toHaveTextContent(
          /greater than Rs\. 0\.00/i
        );
      });

      // Test "Pay Full Pending" quick button
      const payFullBtn = screen.getByTestId('pay-full-balance-btn');
      fireEvent.click(payFullBtn);

      // Verify reference input and method select
      const refInput = screen.getByTestId('payment-reference-input');
      fireEvent.change(refInput, { target: { value: 'CHEQUE-102938' } });

      const methodSelect = screen.getByTestId('payment-method-select');
      fireEvent.change(methodSelect, { target: { value: 'CHEQUE' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
        expect(screen.getByText(/Payment Successfully Collected!/i)).toBeInTheDocument();
        expect(screen.getByTestId('completed-receipt-number')).toBeInTheDocument();
      });

      expect(onPaymentSuccess).toHaveBeenCalled();
    });

    it('synchronizes modal state and updates category when reopened or given a new job', async () => {
      const job = (await workshopJobRepository.getByJobNumber('JOB-2026-0041'))!;

      const { rerender } = render(
        <AuthProvider initialRole="CASHIER">
          <ToastProvider>
            <PaymentCollectionModal
              isOpen={true}
              onClose={() => {}}
              job={job}
            />
          </ToastProvider>
        </AuthProvider>
      );

      // Verify amount input can be modified
      const amountInput = screen.getByTestId('payment-amount-input');
      fireEvent.change(amountInput, { target: { value: '1234' } });
      expect(amountInput).toHaveValue(1234);

      // Close modal
      rerender(
        <AuthProvider initialRole="CASHIER">
          <ToastProvider>
            <PaymentCollectionModal
              isOpen={false}
              onClose={() => {}}
              job={job}
            />
          </ToastProvider>
        </AuthProvider>
      );

      // Reopen modal: state should be reset cleanly
      rerender(
        <AuthProvider initialRole="CASHIER">
          <ToastProvider>
            <PaymentCollectionModal
              isOpen={true}
              onClose={() => {}}
              job={job}
            />
          </ToastProvider>
        </AuthProvider>
      );

      const refreshedAmount = screen.getByTestId('payment-amount-input');
      expect(refreshedAmount).toHaveValue(null);
    });

    it('enforces print isolation: screen header and controls are marked no-print while thermal receipt is print-ready', async () => {
      const job = (await workshopJobRepository.getByJobNumber('JOB-2026-0041'))!;

      const { container } = render(
        <AuthProvider initialRole="CASHIER">
          <ToastProvider>
            <PaymentCollectionModal
              isOpen={true}
              onClose={() => {}}
              job={job}
            />
          </ToastProvider>
        </AuthProvider>
      );

      // Submit valid payment
      const payFullBtn = screen.getByTestId('pay-full-balance-btn');
      fireEvent.click(payFullBtn);
      const submitBtn = screen.getByTestId('record-payment-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
      });

      // Verify no-print is present on screen controls
      const noPrintElements = container.querySelectorAll('.no-print');
      expect(noPrintElements.length).toBeGreaterThanOrEqual(1);

      // Thermal receipt is in DOM and configured for print media
      const thermalReceipt = screen.getByTestId('workshop-thermal-receipt-root');
      expect(thermalReceipt).toBeInTheDocument();
    });
  });

  describe('5. Final A4 Invoice Printout & Privacy Invariant', () => {
    const mockInvoiceSheet: WorkshopJobSheet = {
      id: 'inv-test-1',
      jobNumber: 'JOB-2026-8888',
      docStage: 'INVOICE',
      floorStatus: 'READY_FOR_DELIVERY',
      paymentStatus: 'PARTIALLY_PAID',
      header: {
        date: '2026-11-02',
        jobNumber: 'JOB-2026-8888',
        vehicleNumber: 'WP CAR-5566',
        natureOfRepair: 'Accident Collision Front End Overhaul',
        vehicleMake: 'Nissan',
        chassisNumber: 'FB15-992211',
        vehicleModel: 'Sunny Super Saloon',
        daysForCompletion: '4 Days',
        yearOfMake: '2004',
        vehicleColor: 'Silver Metallic',
        insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
        customerInfo: 'Kasun Bandara - 077 123 4567',
      },
      lines: [
        {
          id: 'l1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Front bumper & headlights assembly removal',
          sellingPriceRs: 8000,
          buyingCostRs: 2500, // SENSITIVE COST
          isCompleted: true,
        },
        {
          id: 'l2',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Front crossmember pulling and realignment',
          sellingPriceRs: 22000,
          buyingCostRs: 6000, // SENSITIVE COST
          isCompleted: true,
        },
        {
          id: 'l3',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'Front Bumper OEM & Radiator Core',
          sellingPriceRs: 50000,
          buyingCostRs: 38000, // SENSITIVE COST
          isCompleted: true,
        },
      ],
      financials: {
        subtotalRemoveReassembleRs: 8000,
        subtotalRepairRs: 22000,
        subtotalReplacementRs: 50000,
        discountRs: 2000,
        taxRs: 1000,
        grandTotalSalesRs: 79000,
        totalBuyingCostRs: 46500, // SENSITIVE COST
        grossProfitRs: 30500, // SENSITIVE PROFIT
        grossMarginPct: 39.61, // SENSITIVE MARGIN
        insuranceApprovedRs: 65000,
        customerPayableRs: 14000,
        advancePaidRs: 10000,
        balanceDueRs: 4000,
      },
      payments: [
        {
          id: 'pay-1',
          receiptNumber: 'REC-2026-0099',
          date: '2026-11-01',
          amountRs: 10000,
          paymentType: 'ADVANCE',
          paymentMethod: 'CASH',
          referenceNumber: 'RCPT-101',
          balanceAfterRs: 4000,
          createdAt: '2026-11-01T10:00:00Z',
        },
      ],
      createdAt: '2026-11-01T09:00:00Z',
      updatedAt: '2026-11-02T10:00:00Z',
    };

    it('renders ACCIDENT REPAIR INVOICE title, itemized payment receipts list, and insurance split', () => {
      render(<A4WorkshopPrint jobSheet={mockInvoiceSheet} />);

      // Title & Stage
      expect(screen.getByText('VEHICLE REPAIR INVOICE')).toBeInTheDocument();
      expect(screen.getByText('ACCIDENT REPAIR INVOICE')).toBeInTheDocument();

      // Financial breakdown
      expect(screen.getByText('Insurance Approved:')).toBeInTheDocument();
      expect(screen.getByText('Customer Payable:')).toBeInTheDocument();
      expect(screen.getByText('Advance Paid:')).toBeInTheDocument();
      expect(screen.getByText('Balance Due:')).toBeInTheDocument();
      expect(screen.getAllByText('Rs. 4,000.00').length).toBeGreaterThanOrEqual(1);

      // Itemized Payment Receipts Table
      expect(
        screen.getByText('Itemized Payment Receipts & Settlement History')
      ).toBeInTheDocument();
      expect(screen.getByText('REC-2026-0099')).toBeInTheDocument();
      expect(screen.getByText('RCPT-101')).toBeInTheDocument();
      expect(screen.getAllByText('Rs. 10,000.00').length).toBeGreaterThanOrEqual(1);
    });

    it('STRICT PRIVACY INVARIANT: Buying costs, gross profits, and margins are strictly omitted from A4 print DOM', () => {
      const { container } = render(<A4WorkshopPrint jobSheet={mockInvoiceSheet} />);
      const html = container.innerHTML;

      expect(html).not.toContain('2,500.00'); // l1 buying cost
      expect(html).not.toContain('6,000.00'); // l2 buying cost
      expect(html).not.toContain('38,000.00'); // l3 buying cost
      expect(html).not.toContain('46,500.00'); // total cost
      expect(html).not.toContain('30,500.00'); // gross profit
      expect(html).not.toContain('39.61%'); // margin
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });

  describe('6. 80mm Workshop Payment Thermal Receipt Option & Privacy', () => {
    const mockPayment: WorkshopPaymentRecord = {
      id: 'pay-thermal-1',
      receiptNumber: 'REC-2026-0088',
      date: '2026-11-02',
      amountRs: 15000,
      paymentType: 'CUSTOMER_EXCESS',
      paymentMethod: 'CARD',
      referenceNumber: 'SLIP-4455',
      notes: 'Customer excess collected via Visa',
      recordedBy: 'Cashier Sarah',
      balanceAfterRs: 0,
      createdAt: '2026-11-02T14:30:00Z',
    };

    const mockJob: WorkshopJobSheet = {
      id: 'job-therm-1',
      jobNumber: 'JOB-2026-0088',
      docStage: 'INVOICE',
      floorStatus: 'READY_FOR_DELIVERY',
      paymentStatus: 'PAID',
      header: {
        date: '2026-11-02',
        jobNumber: 'JOB-2026-0088',
        vehicleNumber: 'WP CAR-1234',
        natureOfRepair: 'Rear bumper painting',
        vehicleMake: 'Honda',
        chassisNumber: 'GP5-10022',
        vehicleModel: 'Fit Hybrid',
        daysForCompletion: '2 Days',
        yearOfMake: '2016',
        vehicleColor: 'Red',
        insuranceName: 'Fairfirst Insurance',
        customerInfo: 'Rohan Jayasinghe',
      },
      lines: [],
      financials: {
        subtotalRemoveReassembleRs: 5000,
        subtotalRepairRs: 10000,
        subtotalReplacementRs: 25000,
        discountRs: 0,
        taxRs: 0,
        grandTotalSalesRs: 40000,
        totalBuyingCostRs: 22000, // SENSITIVE
        grossProfitRs: 18000, // SENSITIVE
        grossMarginPct: 45.0, // SENSITIVE
        insuranceApprovedRs: 25000,
        customerPayableRs: 15000,
        advancePaidRs: 15000,
        balanceDueRs: 0,
      },
      payments: [mockPayment],
      createdAt: '2026-11-02T10:00:00Z',
      updatedAt: '2026-11-02T14:30:00Z',
    };

    it('renders 80mm thermal receipt with correct voucher type, amounts, and receipt metadata', () => {
      render(
        <WorkshopPaymentThermalReceipt jobSheet={mockJob} payment={mockPayment} />
      );

      expect(
        screen.getByText('CUSTOMER EXCESS PAYMENT RECEIPT')
      ).toBeInTheDocument();
      expect(screen.getByText('REC-2026-0088')).toBeInTheDocument();
      expect(screen.getByText('JOB-2026-0088')).toBeInTheDocument();
      expect(screen.getByText('WP CAR-1234')).toBeInTheDocument();
      expect(screen.getByText('SLIP-4455')).toBeInTheDocument();
      expect(screen.getByText('Cashier Sarah')).toBeInTheDocument();
      expect(screen.getAllByText('Rs. 15,000.00').length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(/Please retain this receipt for workshop gate release/i)
      ).toBeInTheDocument();
    });

    it('STRICT PRIVACY INVARIANT: 80mm thermal payment receipt strictly omits internal buying costs', () => {
      const { container } = render(
        <WorkshopPaymentThermalReceipt jobSheet={mockJob} payment={mockPayment} />
      );
      const html = container.innerHTML;

      expect(html).not.toContain('22,000.00'); // sensitive buying cost
      expect(html).not.toContain('18,000.00'); // sensitive gross profit
      expect(html).not.toContain('45.0%'); // sensitive margin
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });
});
