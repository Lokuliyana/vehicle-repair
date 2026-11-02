import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';
import { WorkshopPaymentThermalReceipt } from '@/components/print/WorkshopPaymentThermalReceipt';
import { WorkshopBoardPage } from '@/features/workshop/pages/WorkshopBoardPage';
import { RepairSheetPage } from '@/features/workshop/pages/RepairSheetPage';
import { CatalogListPage } from '@/features/catalog/pages/CatalogListPage';
import { PosTerminalPage } from '@/features/pos/pages/PosTerminalPage';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { WorkshopJobSheet, PosSaleReceipt, WorkshopPaymentRecord } from '@/types';

const MOCK_AUDIT_JOB_SHEET: WorkshopJobSheet = {
  id: 'audit-job-1',
  jobNumber: 'JOB-2026-AUDIT',
  docStage: 'QUOTATION',
  floorStatus: 'DRAFT',
  paymentStatus: 'UNPAID',
  header: {
    date: '2026-11-02',
    jobNumber: 'JOB-2026-AUDIT',
    vehicleNumber: 'WP CAD-7788',
    natureOfRepair: 'Quarter Panel Collision Repair',
    vehicleMake: 'Toyota',
    chassisNumber: 'ZVW30-1928374',
    vehicleModel: 'Prius 3rd Gen',
    daysForCompletion: '4 Days',
    yearOfMake: '2015',
    vehicleColor: 'Pearl White',
    insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
    customerInfo: 'Rohan Wickramasinghe - 077 345 6789',
  },
  lines: [
    {
      id: 'l1',
      rowNo: 1,
      category: 'LABOR_REMOVE_REASSEMBLE',
      description: 'Rear Quarter Trim & Bumper R&R',
      sellingPriceRs: 7500,
      buyingCostRs: 2123, // UNIQUE SENSITIVE COST
      assignedTechnician: 'Nimal',
      isCompleted: true,
    },
    {
      id: 'l2',
      rowNo: 1,
      category: 'LABOR_REPAIR',
      description: 'Quarter Panel Dent Pulling & Surface Prep',
      sellingPriceRs: 18500,
      buyingCostRs: 5432, // UNIQUE SENSITIVE COST
      assignedTechnician: 'Sunil',
      isCompleted: false,
    },
    {
      id: 'l3',
      rowNo: 1,
      category: 'REPLACEMENT',
      description: 'Quarter Panel Outer Skin RH Genuine',
      sellingPriceRs: 39000,
      buyingCostRs: 27654, // UNIQUE SENSITIVE COST
      assignedTechnician: 'Stores',
      isCompleted: true,
    },
  ],
  financials: {
    subtotalRemoveReassembleRs: 7500,
    subtotalRepairRs: 18500,
    subtotalReplacementRs: 39000,
    discountRs: 1000,
    taxRs: 0,
    grandTotalSalesRs: 64000,
    totalBuyingCostRs: 35209, // UNIQUE SENSITIVE TOTAL COST
    grossProfitRs: 28791, // UNIQUE SENSITIVE PROFIT
    grossMarginPct: 44.99, // UNIQUE SENSITIVE MARGIN
    insuranceApprovedRs: 45000,
    customerPayableRs: 19000,
    advancePaidRs: 5000,
    balanceDueRs: 14000,
  },
  createdAt: '2026-11-02T08:00:00Z',
  updatedAt: '2026-11-02T08:00:00Z',
};

const MOCK_AUDIT_POS_RECEIPT: PosSaleReceipt = {
  id: 'pos-audit-1',
  receiptNumber: 'POS-2026-8888',
  date: '2026-11-02 02:30 PM',
  customerNote: 'Walk-in Retail Buyer',
  items: [
    {
      id: 'p1',
      description: 'Brake Fluid DOT 4 500ml Synthetic Castrol',
      qty: 2,
      unitSellingPriceRs: 1450,
      unitBuyingCostRs: 923, // UNIQUE SENSITIVE COST
      lineDiscountRs: 0,
      lineTotalSalesRs: 2900,
      lineTotalCostRs: 1846, // UNIQUE SENSITIVE COST
      lineGrossProfitRs: 1054, // UNIQUE SENSITIVE PROFIT
    },
  ],
  subtotalRs: 2900,
  discountRs: 0,
  netTotalSalesRs: 2900,
  totalCostRs: 1846, // UNIQUE SENSITIVE COST
  grossProfitRs: 1054, // UNIQUE SENSITIVE PROFIT
  paymentMethod: 'CASH',
  amountTenderedRs: 3000,
  changeGivenRs: 100,
  cashierName: 'Kamal Cashier',
};

const MOCK_AUDIT_PAYMENT: WorkshopPaymentRecord = {
  id: 'pay-audit-1',
  receiptNumber: 'RCP-2026-0099',
  date: '2026-11-02',
  amountRs: 5000,
  paymentType: 'ADVANCE',
  paymentMethod: 'CASH',
  referenceNumber: 'CASH-REC-01',
  notes: 'Deposit for repair commencement',
  recordedBy: 'Kamal Cashier',
  balanceAfterRs: 14000,
  createdAt: '2026-11-02T09:00:00Z',
};

describe('Comprehensive Cost Privacy Invariant Audit (Master Guide Section 14)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
    await posShiftRepository.resetToDefaults();
  });

  describe('1. A4 Quotation Printout Privacy Audit', () => {
    it('guarantees Buying Cost, Gross Profit, and margins are strictly absent from Quotation print DOM', () => {
      const quotationSheet: WorkshopJobSheet = {
        ...MOCK_AUDIT_JOB_SHEET,
        docStage: 'QUOTATION',
      };

      const { container } = render(<A4WorkshopPrint jobSheet={quotationSheet} />);
      const html = container.innerHTML;

      // Legitimate customer figures must exist
      expect(screen.getByText('VEHICLE REPAIR QUOTATION')).toBeInTheDocument();
      expect(screen.getByText('JOB-2026-AUDIT')).toBeInTheDocument();
      expect(screen.getByText('WP CAD-7788')).toBeInTheDocument();
      expect(screen.getByText('Rs. 64,000.00')).toBeInTheDocument();

      // SENSITIVE INTERNAL COSTS & MARGINS MUST NEVER EXIST
      expect(html).not.toContain('2,123.00'); // l1 buying cost
      expect(html).not.toContain('5,432.00'); // l2 buying cost
      expect(html).not.toContain('27,654.00'); // l3 buying cost
      expect(html).not.toContain('35,209.00'); // total buying cost
      expect(html).not.toContain('28,791.00'); // gross profit
      expect(html).not.toContain('44.99%'); // gross margin
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });

  describe('2. A4 Estimate Printout Privacy Audit', () => {
    it('guarantees Buying Cost, Gross Profit, and margins are strictly absent from Estimate print DOM', () => {
      const estimateSheet: WorkshopJobSheet = {
        ...MOCK_AUDIT_JOB_SHEET,
        docStage: 'ESTIMATE',
      };

      const { container } = render(<A4WorkshopPrint jobSheet={estimateSheet} />);
      const html = container.innerHTML;

      expect(screen.getByText('VEHICLE REPAIR ESTIMATE')).toBeInTheDocument();
      expect(screen.getByText('Insurance Approved:')).toBeInTheDocument();
      expect(screen.getByText('Customer Payable:')).toBeInTheDocument();

      // SENSITIVE INTERNAL COSTS & MARGINS MUST NEVER EXIST
      expect(html).not.toContain('2,123.00');
      expect(html).not.toContain('5,432.00');
      expect(html).not.toContain('27,654.00');
      expect(html).not.toContain('35,209.00');
      expect(html).not.toContain('28,791.00');
      expect(html).not.toContain('44.99%');
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });

  describe('3. A4 Job Card Floor Printout Redaction Audit', () => {
    it('guarantees ALL monetary figures (selling prices, subtotals, grand totals, costs, margins) are completely redacted', () => {
      const jobCardSheet: WorkshopJobSheet = {
        ...MOCK_AUDIT_JOB_SHEET,
        docStage: 'JOB_CARD',
      };

      const { container } = render(<A4WorkshopPrint jobSheet={jobCardSheet} />);
      const html = container.innerHTML;

      // Job card operational header & task info must exist
      expect(screen.getByText('WORKSHOP JOB CARD')).toBeInTheDocument();
      expect(screen.getByText('JOB-2026-AUDIT')).toBeInTheDocument();
      expect(screen.getByText('WP CAD-7788')).toBeInTheDocument();
      expect(screen.getByText('Quarter Panel Collision Repair')).toBeInTheDocument();
      expect(screen.getByText('Floor Supervisor Signature')).toBeInTheDocument();
      expect(screen.getByText('Technician Lead Signature')).toBeInTheDocument();

      // ALL MONETARY HEADERS AND TOTALS MUST BE COMPLETELY REDACTED
      expect(screen.queryByText('Amount (Rs.)')).not.toBeInTheDocument();
      expect(screen.queryByText('Grand Total:')).not.toBeInTheDocument();
      expect(screen.queryByText('Insurance Approved:')).not.toBeInTheDocument();
      expect(screen.queryByText('Customer Payable:')).not.toBeInTheDocument();
      expect(screen.queryByText('Balance Due:')).not.toBeInTheDocument();

      // NO SELLING PRICES
      expect(html).not.toContain('7,500.00');
      expect(html).not.toContain('18,500.00');
      expect(html).not.toContain('39,000.00');
      expect(html).not.toContain('64,000.00');
      expect(html).not.toContain('14,000.00');

      // NO BUYING COSTS OR PROFIT
      expect(html).not.toContain('2,123.00');
      expect(html).not.toContain('5,432.00');
      expect(html).not.toContain('27,654.00');
      expect(html).not.toContain('35,209.00');
      expect(html).not.toContain('28,791.00');
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });

  describe('4. A4 Final Invoice Printout Privacy Audit', () => {
    it('guarantees Buying Cost and Gross Profit are strictly absent from Invoice print DOM', () => {
      const invoiceSheet: WorkshopJobSheet = {
        ...MOCK_AUDIT_JOB_SHEET,
        docStage: 'INVOICE',
      };

      const { container } = render(<A4WorkshopPrint jobSheet={invoiceSheet} />);
      const html = container.innerHTML;

      expect(screen.getByText('VEHICLE REPAIR INVOICE')).toBeInTheDocument();
      expect(screen.getByText('Balance Due:')).toBeInTheDocument();

      // SENSITIVE INTERNAL COSTS & MARGINS MUST NEVER EXIST
      expect(html).not.toContain('2,123.00');
      expect(html).not.toContain('5,432.00');
      expect(html).not.toContain('27,654.00');
      expect(html).not.toContain('35,209.00');
      expect(html).not.toContain('28,791.00');
      expect(html).not.toContain('44.99%');
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });

  describe('5. 80mm POS & Payment Thermal Receipt Privacy Audit', () => {
    it('guarantees POS Thermal receipt never prints buying costs or profits', () => {
      const { container } = render(<ThermalReceiptPrint receipt={MOCK_AUDIT_POS_RECEIPT} />);
      const html = container.innerHTML;

      expect(screen.getByText('POS-2026-8888')).toBeInTheDocument();
      expect(screen.getAllByText('Rs. 2,900.00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Rs. 100.00')).toBeInTheDocument(); // Change

      // Internal costs strictly absent
      expect(html).not.toContain('923.00');
      expect(html).not.toContain('1,846.00');
      expect(html).not.toContain('1,054.00');
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });

    it('guarantees Workshop Payment Thermal receipt never prints internal cost figures', () => {
      const { container } = render(
        <WorkshopPaymentThermalReceipt
          jobSheet={MOCK_AUDIT_JOB_SHEET}
          payment={MOCK_AUDIT_PAYMENT}
        />
      );
      const html = container.innerHTML;

      expect(screen.getByText('RCP-2026-0099')).toBeInTheDocument();
      expect(screen.getAllByText('Rs. 5,000.00').length).toBeGreaterThanOrEqual(1);

      // Sensitive internal cost numbers absent
      expect(html).not.toContain('35,209.00');
      expect(html).not.toContain('28,791.00');
      expect(html).not.toContain('Buying Cost');
      expect(html).not.toContain('Gross Profit');
    });
  });

  describe('6. Technician Role Screen View Privacy Audit', () => {
    it('hides all monetary figures on Workshop Kanban status cards when role is TECHNICIAN', async () => {
      render(
        <MemoryRouter>
          <AuthProvider initialRole="TECHNICIAN">
            <ToastProvider>
              <WorkshopBoardPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('workshop-board-page')).toBeInTheDocument();
      });

      // Grand total amount spans should be absent for technician
      const amountSpans = screen.queryAllByTestId(/^board-card-amount-/);
      expect(amountSpans.length).toBe(0);

      // Payment status badges should be absent for technician
      const paymentBadges = screen.queryAllByTestId(/^board-card-payment-status-/);
      expect(paymentBadges.length).toBe(0);
    });

    it('redacts all financial summary cards and prices on RepairSheetPage for TECHNICIAN', async () => {
      const router = createMemoryRouter(
        [
          {
            path: '/workshop/sheet/:id',
            element: <RepairSheetPage />,
          },
        ],
        { initialEntries: ['/workshop/sheet/audit-job-1'] }
      );

      // Seed repo with audit job
      await workshopJobRepository.create({
        ...MOCK_AUDIT_JOB_SHEET,
      });

      render(
        <ToastProvider>
          <AuthProvider initialRole="TECHNICIAN">
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('technician-progress-panel')).toBeInTheDocument();
      });

      // Invoice & Settlement summary card must NOT be present
      expect(screen.queryByText('Invoice & Settlement Summary')).not.toBeInTheDocument();

      // Amount input fields must NOT be present (table switches to job card mode)
      expect(screen.queryByTestId('amount-input-l1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cost-input-l1')).not.toBeInTheDocument();
      expect(screen.queryByText('Buying Cost (Rs.)')).not.toBeInTheDocument();
      expect(screen.queryByText('Line Profit')).not.toBeInTheDocument();
    });
  });

  describe('7. Cashier Role Screen View Privacy Audit', () => {
    it('hides Buying Cost and Gross Profit columns in Catalog for CASHIER role', async () => {
      render(
        <MemoryRouter>
          <AuthProvider initialRole="CASHIER">
            <ToastProvider>
              <CatalogListPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('catalog-list-page')).toBeInTheDocument();
      });

      // Headers for Buying Cost and Line Profit should NOT be in the document
      expect(screen.queryByTestId('buying-cost-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('profit-header')).not.toBeInTheDocument();
      expect(screen.queryByText(/Buying Cost/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Est\. Profit/i)).not.toBeInTheDocument();
    });

    it('hides internal cost and gross profit margin panel in POS Cart for CASHIER role', async () => {
      render(
        <MemoryRouter>
          <AuthProvider initialRole="CASHIER">
            <ToastProvider>
              <PosTerminalPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pos-terminal-page')).toBeInTheDocument();
      });

      // Internal margin panel must NOT exist for cashier
      expect(screen.queryByTestId('cart-internal-margin-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-internal-cost')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-internal-profit')).not.toBeInTheDocument();
      expect(screen.queryByText(/Internal Cost & Margin/i)).not.toBeInTheDocument();
    });
  });
});
