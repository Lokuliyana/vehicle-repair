import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { WorkshopInvoicePage } from '@/features/workshop/pages/WorkshopInvoicePage';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { WorkshopJobSheet } from '@/types';

describe('Phase 6: Workshop Final Invoicing, Insurance Split Billing & Collections Studio (/workshop/invoice/:id)', () => {
  let testJob: WorkshopJobSheet;

  beforeEach(async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    await workshopJobRepository.resetToDefaults();

    // Create a comprehensive test job in INVOICE stage with supplementary items
    testJob = await workshopJobRepository.create({
      docStage: 'INVOICE',
      floorStatus: 'READY_FOR_DELIVERY',
      header: {
        date: '2026-11-02',
        jobNumber: '',
        vehicleNumber: 'WP CBA-9988',
        natureOfRepair: 'Collision repair and front restoration',
        vehicleMake: 'Toyota',
        chassisNumber: 'NZE141-889922',
        vehicleModel: 'Premio F-EX',
        daysForCompletion: '4 Days',
        yearOfMake: '2019',
        vehicleColor: 'Silver Metallic',
        insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
        customerInfo: 'Rohan Wickramasinghe - 077 123 4567',
      },
      lines: [
        {
          id: 'inv-line-1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Front bumper & headlamp R&R (Original Estimate)',
          sellingPriceRs: 15000.5,
          buyingCostRs: 4000.25, // SENSITIVE COST
          isCompleted: true,
          isSupplementary: false,
        },
        {
          id: 'inv-line-2',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Sub-frame alignment & pull (Original Estimate)',
          sellingPriceRs: 35000.25,
          buyingCostRs: 10000.5, // SENSITIVE COST
          isCompleted: true,
          isSupplementary: false,
        },
        {
          id: 'inv-line-3',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'Radiator support crossmember (SUPPLEMENTARY)',
          sellingPriceRs: 25000.75,
          buyingCostRs: 18000.0, // SENSITIVE COST
          isCompleted: true,
          isSupplementary: true, // SUPPLEMENTARY ITEM ADDED DURING REPAIR
        },
      ],
      discountRs: 5000.5,
      taxRs: 2500.0,
      insuranceApprovedRs: 50000.0,
      advancePaidRs: 10000.0,
    });
  });

  const renderInvoicePage = (jobId: string, role = 'WORKSHOP_MANAGER') => {
    return render(
      <AuthProvider initialRole={role as any}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/workshop/invoice/${jobId}`]}>
            <Routes>
              <Route path="/workshop/invoice/:id" element={<WorkshopInvoicePage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );
  };

  describe('1. Two-Column Settlement Terminal Layout', () => {
    it('renders the two-column settlement terminal with 12-field vehicle dossier and stage badges', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('workshop-invoice-page')).toBeInTheDocument();
      });

      // Header Vehicle & Job Dossier
      expect(screen.getAllByText('WP CBA-9988').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Premio F-EX/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Sri Lanka Insurance Corporation (SLIC)')).toBeInTheDocument();
      expect(screen.getByTestId('invoice-stage-badge')).toHaveTextContent('INVOICE');
      expect(screen.getByTestId('invoice-payment-status-badge')).toBeInTheDocument();

      // Two-column layout elements
      expect(screen.getByText('Itemized Repair Summary')).toBeInTheDocument();
      expect(screen.getByTestId('insurance-split-billing-card')).toBeInTheDocument();
    });

    it('highlights original approved estimate items vs. SUPPLEMENTARY amber-tagged items', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByText(/Radiator support crossmember/i)).toBeInTheDocument();
      });

      // The supplementary line must display the amber SUPPLEMENTARY badge
      const supplementaryBadges = screen.getAllByTestId('supplementary-badge');
      expect(supplementaryBadges.length).toBeGreaterThanOrEqual(1);
      expect(supplementaryBadges[0]).toHaveTextContent('SUPPLEMENTARY');
    });

    it('opens and closes OriginalEstimateSnapshotDrawer to compare baseline frozen estimate', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('open-snapshot-drawer-btn')).toBeInTheDocument();
      });

      const openSnapshotBtn = screen.getByTestId('open-snapshot-drawer-btn');
      fireEvent.click(openSnapshotBtn);

      await waitFor(() => {
        expect(screen.getByTestId('original-estimate-snapshot-drawer')).toBeInTheDocument();
        expect(screen.getByText('Original Estimate Snapshot')).toBeInTheDocument();
      });

      const closeSnapshotBtn = screen.getByTestId('close-snapshot-drawer-btn');
      fireEvent.click(closeSnapshotBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('original-estimate-snapshot-drawer')).not.toBeInTheDocument();
      });
    });
  });

  describe('2. Live Split Math Display & Cent-Accurate Calculation', () => {
    it('accurately calculates and steps down Gross Total -> Less Discount -> Add Tax = Net Total down to the cent', async () => {
      // Gross: 15000.50 + 35000.25 + 25000.75 = 75,001.50
      // Discount: 5,000.50 -> 70,001.00
      // Tax: 2,500.00 -> Net: 72,501.00
      // Insurance: 50,000.00 -> Customer Liability: 22,501.00
      // Advance: 10,000.00 -> Customer Balance Due: 12,501.00
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('split-gross-total')).toHaveTextContent('Rs. 75,001.50');
      });

      expect(screen.getByTestId('discount-input')).toHaveValue(5000.5);
      expect(screen.getByTestId('tax-input')).toHaveValue(2500);
      expect(screen.getByTestId('split-net-total')).toHaveTextContent('Rs. 72,501.00');

      // Customer Excess Balance Due in large bold tabular numerals:
      // Customer Balance Due = Grand Total - Discounts + Tax - Advance Paid - Insurance Approved Payable
      const customerBalanceDue = screen.getByTestId('customer-balance-due');
      expect(customerBalanceDue).toHaveTextContent('Rs. 12,501.00');

      // Insurance Receivable Balance:
      const insuranceBalanceDue = screen.getByTestId('insurance-balance-due');
      expect(insuranceBalanceDue).toHaveTextContent('Rs. 50,000.00');
    });

    it('interactively recalculates Customer Excess Balance Due and Insurance Balance when inputs change down to cents', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('insurance-approved-input')).toBeInTheDocument();
      });

      const insuranceInput = screen.getByTestId('insurance-approved-input');
      const advanceInput = screen.getByTestId('advance-paid-input');

      // Update Insurance Approved to Rs. 60,000.50
      fireEvent.change(insuranceInput, { target: { value: '60000.50' } });

      // Update Advance Paid to Rs. 12,000.25
      fireEvent.change(advanceInput, { target: { value: '12000.25' } });

      // Net Total: 72,501.00
      // Customer Liability = 72,501.00 - 60,000.50 = 12,500.50
      // Customer Balance Due = 12,500.50 - 12,000.25 = 500.25
      await waitFor(() => {
        expect(screen.getByTestId('customer-balance-due')).toHaveTextContent('Rs. 500.25');
        expect(screen.getByTestId('insurance-balance-due')).toHaveTextContent('Rs. 60,000.50');
      });

      // Synchronize changes to repository
      const syncBtn = screen.getByTestId('sync-split-financials-btn');
      fireEvent.click(syncBtn);

      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(testJob.id);
        expect(reloaded?.financials.insuranceApprovedRs).toBe(60000.5);
        expect(reloaded?.financials.advancePaidRs).toBe(12000.25);
        expect(reloaded?.financials.balanceDueRs).toBe(500.25);
      });
    });
  });

  describe('3. Payment Collection & Receipt Recording', () => {
    it('records customer advance deposits via AdvancePaymentReceiptRecorder', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('advance-payment-receipt-recorder')).toBeInTheDocument();
      });

      const advanceAmountInput = screen.getByTestId('advance-recorder-amount');
      const advanceMethodSelect = screen.getByTestId('advance-recorder-method');
      const recordBtn = screen.getByTestId('advance-recorder-btn');

      fireEvent.change(advanceAmountInput, { target: { value: '2491' } });
      fireEvent.change(advanceMethodSelect, { target: { value: 'Card' } });
      fireEvent.click(recordBtn);

      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(testJob.id);
        // Previous advance 10,000 + 2,491 = 12,491
        expect(reloaded?.financials.advancePaidRs).toBe(12491);
        expect(reloaded?.payments?.length).toBe(1);
        expect(reloaded?.payments![0].amountRs).toBe(2491);
        expect(reloaded?.payments![0].paymentType).toBe('ADVANCE');
      });
    });

    it('collects settlement via PosCollectPaymentModal and transitions paymentStatus: UNPAID -> PARTIALLY_PAID -> PAID', async () => {
      // Create a fresh direct cash job with balance due
      const directJob = await workshopJobRepository.create({
        docStage: 'INVOICE',
        floorStatus: 'READY_FOR_DELIVERY',
        header: {
          date: '2026-11-02',
          jobNumber: '',
          vehicleNumber: 'WP CAR-1122',
          natureOfRepair: 'Bumper touchup',
          vehicleMake: 'Nissan',
          chassisNumber: 'FB15-1234',
          vehicleModel: 'Sunny',
          daysForCompletion: '1 Day',
          yearOfMake: '2005',
          vehicleColor: 'Black',
          insuranceName: '',
          customerInfo: 'Kasun Silva',
        },
        lines: [
          {
            id: 'd-1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Bumper paint repair',
            sellingPriceRs: 20000,
            buyingCostRs: 5000,
            isCompleted: true,
          },
        ],
        advancePaidRs: 0,
      });

      expect(directJob.paymentStatus).toBe('UNPAID');

      renderInvoicePage(directJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('invoice-payment-status-badge')).toHaveTextContent('UNPAID');
      });

      // Open settlement payment modal
      const collectBtn = screen.getByTestId('collect-settlement-btn');
      fireEvent.click(collectBtn);

      await waitFor(() => {
        expect(screen.getByTestId('pos-collect-payment-modal')).toBeInTheDocument();
      });

      // Collect partial payment of Rs. 10,000
      const amountInput = screen.getByTestId('pos-payment-amount-input');
      fireEvent.change(amountInput, { target: { value: '10000' } });

      const submitBtn = screen.getByTestId('pos-payment-submit-btn');
      fireEvent.click(submitBtn);

      // Verify transitions to PARTIALLY_PAID
      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(directJob.id);
        expect(reloaded?.paymentStatus).toBe('PARTIALLY_PAID');
        expect(reloaded?.financials.advancePaidRs).toBe(10000);
        expect(reloaded?.financials.balanceDueRs).toBe(10000);
      });

      // Settle remaining Rs. 10,000 to transition to PAID
      fireEvent.click(screen.getByTestId('collect-settlement-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('pos-collect-payment-modal')).toBeInTheDocument();
      });

      const remainingAmountInput = screen.getByTestId('pos-payment-amount-input');
      fireEvent.change(remainingAmountInput, { target: { value: '10000' } });
      fireEvent.click(screen.getByTestId('pos-payment-submit-btn'));

      await waitFor(async () => {
        const fullyPaid = await workshopJobRepository.getById(directJob.id);
        expect(fullyPaid?.paymentStatus).toBe('PAID');
        expect(fullyPaid?.financials.balanceDueRs).toBe(0);
        expect(fullyPaid?.floorStatus).toBe('COMPLETED_DELIVERED');
      });
    });

    it('renders payment collection history list showing date, payment method, reference, and amount', async () => {
      // Add a payment to testJob
      await workshopJobRepository.recordPayment(testJob.id, {
        amountRs: 5000,
        paymentType: 'CUSTOMER_EXCESS',
        paymentMethod: 'CHEQUE',
        referenceNumber: 'CHQ-778899',
        notes: 'Excess paid by customer',
      });

      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('payment-collection-history-list')).toBeInTheDocument();
      });

      expect(screen.getByText('Ref: CHQ-778899')).toBeInTheDocument();
      expect(screen.getByText(/via CHEQUE/i)).toBeInTheDocument();
      expect(screen.getAllByText('Rs. 5,000.00').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Invoice Print & Thermal Receipts Isolation', () => {
    it('opens A4 Tax Invoice Print view with A4FinancialTotalsPrintBlock showing split totals', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('print-a4-invoice-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('print-a4-invoice-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('a4-print-modal')).toBeInTheDocument();
        expect(screen.getByTestId('a4-financial-totals-print-block')).toBeInTheDocument();
      });

      // Verifies A4 Financial Totals split block
      const a4Block = screen.getByTestId('a4-financial-totals-print-block');
      expect(within(a4Block).getByText('Gross Total:')).toBeInTheDocument();
      expect(within(a4Block).getByText('Less Discount:')).toBeInTheDocument();
      expect(within(a4Block).getByText('Insurance Approved:')).toBeInTheDocument();
      expect(within(a4Block).getByText('Advance Paid:')).toBeInTheDocument();
      expect(within(a4Block).getByText('Net Balance Due:')).toBeInTheDocument();
    });

    it('STRICT PRIVACY INVARIANT: Buying cost, gross profit, and margin % never leak to print DOM', async () => {
      renderInvoicePage(testJob.id, 'CASHIER');

      await waitFor(() => {
        expect(screen.getByTestId('print-a4-invoice-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('print-a4-invoice-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('a4-print-modal')).toBeInTheDocument();
      });

      const modalHtml = screen.getByTestId('a4-print-modal').innerHTML;

      // Sensitive buying costs defined in testJob:
      // inv-line-1: 4000.25
      // inv-line-2: 10000.50
      // inv-line-3: 18000.00
      expect(modalHtml).not.toContain('4,000.25');
      expect(modalHtml).not.toContain('10,000.50');
      expect(modalHtml).not.toContain('18,000.00');
      expect(modalHtml).not.toContain('Buying Cost');
      expect(modalHtml).not.toContain('Gross Profit');
    });

    it('opens 80mm Thermal Receipt layout with receipt details and print isolation', async () => {
      // Record a customer excess payment
      const paid = await workshopJobRepository.recordPayment(testJob.id, {
        amountRs: 5000,
        paymentType: 'CUSTOMER_EXCESS',
        paymentMethod: 'CASH',
        referenceNumber: 'CASH-SLIP-01',
      });

      renderInvoicePage(paid.id);

      await waitFor(() => {
        expect(screen.getByTestId('print-thermal-receipt-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('print-thermal-receipt-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('thermal-receipt-modal')).toBeInTheDocument();
        expect(screen.getByTestId('workshop-thermal-receipt-root')).toBeInTheDocument();
      });

      const thermalModal = screen.getByTestId('thermal-receipt-modal');
      expect(within(thermalModal).getByText('CUSTOMER EXCESS PAYMENT RECEIPT')).toBeInTheDocument();
      expect(within(thermalModal).getByText('WP CBA-9988')).toBeInTheDocument();

      const thermalHtml = thermalModal.innerHTML;
      expect(thermalHtml).not.toContain('Buying Cost');
      expect(thermalHtml).not.toContain('Gross Profit');
    });
  });

  describe('5. Conversions & Navigation Integration', () => {
    it('provides 1-click finalize to Invoice if visited with ESTIMATE or JOB_CARD stage', async () => {
      // Create an ESTIMATE job
      const estimateJob = await workshopJobRepository.create({
        docStage: 'ESTIMATE',
        floorStatus: 'DRAFT',
        header: {
          date: '2026-11-02',
          jobNumber: '',
          vehicleNumber: 'WP CAR-3344',
          natureOfRepair: 'Touchup',
          vehicleMake: 'Toyota',
          chassisNumber: 'TOY-11',
          vehicleModel: 'Yaris',
          daysForCompletion: '1 Day',
          yearOfMake: '2020',
          vehicleColor: 'White',
          insuranceName: '',
          customerInfo: 'Sunil',
        },
        lines: [
          {
            id: 'l1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Paint buffing',
            sellingPriceRs: 10000,
            buyingCostRs: 2000,
            isCompleted: true,
          },
        ],
      });

      renderInvoicePage(estimateJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('finalize-invoice-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('finalize-invoice-btn'));

      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(estimateJob.id);
        expect(reloaded?.docStage).toBe('INVOICE');
        expect(screen.getByTestId('invoice-stage-badge')).toHaveTextContent('INVOICE');
      });
    });
  });

  describe('6. Deep Split Billing Edge Cases & Invoicing Robustness', () => {
    it('records insurance settlement cheque directly and settles insurance receivable', async () => {
      // testJob has insuranceApprovedRs: 50,000.00
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('collect-insurance-cheque-btn')).toBeInTheDocument();
      });

      // Click "Record Insurance Cheque"
      const recordChequeBtn = screen.getByTestId('collect-insurance-cheque-btn');
      fireEvent.click(recordChequeBtn);

      await waitFor(() => {
        expect(screen.getByTestId('pos-collect-payment-modal')).toBeInTheDocument();
      });

      // Modal defaults to INSURANCE_SETTLEMENT and tender 50000
      expect(screen.getByTestId('pos-payment-amount-input')).toHaveValue(50000);

      // Enter Cheque reference
      const refInput = screen.getByTestId('pos-payment-reference-input');
      fireEvent.change(refInput, { target: { value: 'SLIC-CHQ-991122' } });

      const submitBtn = screen.getByTestId('pos-payment-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(testJob.id);
        const insPayment = reloaded?.payments?.find((p) => p.paymentType === 'INSURANCE_SETTLEMENT');
        expect(insPayment).toBeDefined();
        expect(insPayment?.amountRs).toBe(50000);
        expect(insPayment?.referenceNumber).toBe('SLIC-CHQ-991122');
        expect(insPayment?.paymentMethod).toBe('CHEQUE');
        expect(screen.getByTestId('insurance-balance-due')).toHaveTextContent('Rs. 0.00');
      });
    });

    it('detects customer overpayment and renders Customer Refund / Credit Due indicator', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('advance-paid-input')).toBeInTheDocument();
      });

      // Net Total is 72,501.00
      // Insurance Approved is 50,000.00 -> Customer Payable is 22,501.00
      // If Customer Advance Paid is set to 25,000.00 (overpayment of 2,499.00)
      const advanceInput = screen.getByTestId('advance-paid-input');
      fireEvent.change(advanceInput, { target: { value: '25000' } });

      await waitFor(() => {
        expect(screen.getByTestId('customer-balance-due')).toHaveTextContent('Rs. 0.00');
        expect(screen.getByTestId('customer-refund-indicator')).toBeInTheDocument();
        expect(screen.getByTestId('customer-refund-indicator')).toHaveTextContent('Rs. 2,499.00');
      });
    });

    it('syncs interactive split values before payment collection preventing stale balance errors', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('insurance-approved-input')).toBeInTheDocument();
      });

      // Initially customerBalanceDue was 12,501.00 (Customer Payable 22,501 - Advance 10,000)
      // Change Insurance Approved to 30,000.00 without clicking "Save & Sync Split Financials"
      // New Customer Payable: 72,501 - 30,000 = 42,501.00
      // New Customer Balance Due: 42,501 - 10,000 = 32,501.00
      const insuranceInput = screen.getByTestId('insurance-approved-input');
      fireEvent.change(insuranceInput, { target: { value: '30000' } });

      await waitFor(() => {
        expect(screen.getByTestId('customer-balance-due')).toHaveTextContent('Rs. 32,501.00');
      });

      // Directly click "Collect Settlement" to collect 20,000 (which exceeds the OLD balance of 12,501)
      const collectBtn = screen.getByTestId('collect-settlement-btn');
      fireEvent.click(collectBtn);

      await waitFor(() => {
        expect(screen.getByTestId('pos-collect-payment-modal')).toBeInTheDocument();
      });

      const amountInput = screen.getByTestId('pos-payment-amount-input');
      fireEvent.change(amountInput, { target: { value: '20000' } });

      const submitBtn = screen.getByTestId('pos-payment-submit-btn');
      fireEvent.click(submitBtn);

      // Must succeed without throwing "exceeds customer balance due" error because it pre-syncs
      await waitFor(async () => {
        const reloaded = await workshopJobRepository.getById(testJob.id);
        expect(reloaded?.financials.insuranceApprovedRs).toBe(30000);
        expect(reloaded?.financials.advancePaidRs).toBe(30000); // 10,000 initial + 20,000
        expect(reloaded?.financials.balanceDueRs).toBe(12501);
      });
    });

    it('renders computer-generated tax invoice footer in A4 invoice print preview', async () => {
      renderInvoicePage(testJob.id);

      await waitFor(() => {
        expect(screen.getByTestId('print-a4-invoice-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('print-a4-invoice-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('a4-print-modal')).toBeInTheDocument();
        expect(screen.getByTestId('a4-computer-generated-footer')).toBeInTheDocument();
        expect(screen.getByTestId('a4-computer-generated-footer')).toHaveTextContent(
          'This is a computer-generated tax invoice and does not carry a physical signature.'
        );
      });
    });
  });
});

