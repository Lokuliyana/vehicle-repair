import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';
import { WorkshopJobSheet, PosSaleReceipt } from '@/types';

const MOCK_JOB_SHEET: WorkshopJobSheet = {
  id: 'test-job-1',
  jobNumber: 'JOB-2026-9999',
  docStage: 'ESTIMATE',
  floorStatus: 'DRAFT',
  paymentStatus: 'UNPAID',
  header: {
    date: '2026-11-02',
    jobNumber: 'JOB-2026-9999',
    vehicleNumber: 'WP CAR-1234',
    natureOfRepair: 'Rear Collision & Quarter Panel Repair',
    vehicleMake: 'Honda',
    chassisNumber: 'GP5-1029384',
    vehicleModel: 'Fit Hybrid',
    daysForCompletion: '3 Days',
    yearOfMake: '2016',
    vehicleColor: 'Milano Red',
    insuranceName: 'Ceylinco General Insurance',
    customerInfo: 'Sunil Silva - 071 234 5678',
  },
  lines: [
    {
      id: 'l1',
      rowNo: 1,
      category: 'LABOR_REMOVE_REASSEMBLE',
      description: 'Rear Bumper Removal & Refit',
      sellingPriceRs: 5000,
      buyingCostRs: 1500, // INTERNAL SENSITIVE COST
      assignedTechnician: 'Tech A',
      isCompleted: true,
    },
    {
      id: 'l2',
      rowNo: 1,
      category: 'LABOR_REPAIR',
      description: 'Quarter Panel Dent Repair',
      sellingPriceRs: 15000,
      buyingCostRs: 4000, // INTERNAL SENSITIVE COST
      assignedTechnician: 'Tech B',
      isCompleted: false,
    },
    {
      id: 'l3',
      rowNo: 1,
      category: 'REPLACEMENT',
      description: 'Rear Bumper Bracket LH Genuine OEM Extra Long Part Description That Must Wrap Cleanly',
      sellingPriceRs: 8500,
      buyingCostRs: 6200, // INTERNAL SENSITIVE COST
      assignedTechnician: 'Store',
      isCompleted: true,
    },
  ],
  financials: {
    subtotalRemoveReassembleRs: 5000,
    subtotalRepairRs: 15000,
    subtotalReplacementRs: 8500,
    discountRs: 500,
    taxRs: 0,
    grandTotalSalesRs: 28000,
    totalBuyingCostRs: 11700, // INTERNAL SENSITIVE COST
    grossProfitRs: 16300, // INTERNAL SENSITIVE PROFIT
    grossMarginPct: 58.21, // INTERNAL SENSITIVE MARGIN
    insuranceApprovedRs: 20000,
    customerPayableRs: 8000,
    advancePaidRs: 3000,
    balanceDueRs: 5000,
  },
  createdAt: '2026-11-02T10:00:00Z',
  updatedAt: '2026-11-02T10:00:00Z',
};

const MOCK_POS_RECEIPT: PosSaleReceipt = {
  id: 'pos-1',
  receiptNumber: 'POS-2026-5555',
  date: '2026-11-02 11:30 AM',
  customerNote: 'Walk-in Cash Customer',
  items: [
    {
      id: 'p1',
      description: 'Engine Coolant 1L High-Performance Anti-Freeze / Anti-Boil Coolant Blue',
      qty: 2,
      unitSellingPriceRs: 1800,
      unitBuyingCostRs: 1200, // INTERNAL SENSITIVE COST
      lineDiscountRs: 0,
      lineTotalSalesRs: 3600,
      lineTotalCostRs: 2400, // INTERNAL SENSITIVE COST
      lineGrossProfitRs: 1200, // INTERNAL SENSITIVE PROFIT
    },
  ],
  subtotalRs: 3600,
  discountRs: 0,
  netTotalSalesRs: 3600,
  totalCostRs: 2400, // INTERNAL SENSITIVE COST
  grossProfitRs: 1200, // INTERNAL SENSITIVE PROFIT
  paymentMethod: 'CASH',
  amountTenderedRs: 5000,
  changeGivenRs: 1400,
  cashierName: 'Cashier 1',
};

describe('A4 Workshop Print Engine & Privacy Invariant', () => {
  it('renders top service banner matching uploaded templates exactly', () => {
    render(<A4WorkshopPrint jobSheet={MOCK_JOB_SHEET} />);

    expect(
      screen.getByText(
        /ALL KIND OF VEHICLE, ELECTRICAL & MECHANICAL REPAIRS, SCANNING, TINKERING, ACCIDENT REPAIR & AUTO PAINT/i
      )
    ).toBeInTheDocument();
  });

  it('renders exact 12-field workshop header grid', () => {
    render(<A4WorkshopPrint jobSheet={MOCK_JOB_SHEET} />);

    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('2026-11-02')).toBeInTheDocument();

    expect(screen.getByText('Job Number:')).toBeInTheDocument();
    expect(screen.getByText('JOB-2026-9999')).toBeInTheDocument();

    expect(screen.getByText('Vehicle Number:')).toBeInTheDocument();
    expect(screen.getByText('WP CAR-1234')).toBeInTheDocument();

    expect(screen.getByText('Nature of Repair:')).toBeInTheDocument();
    expect(screen.getByText('Rear Collision & Quarter Panel Repair')).toBeInTheDocument();

    expect(screen.getByText('Vehicle Make:')).toBeInTheDocument();
    expect(screen.getByText('Honda')).toBeInTheDocument();

    expect(screen.getByText('Chassis Number:')).toBeInTheDocument();
    expect(screen.getByText('GP5-1029384')).toBeInTheDocument();

    expect(screen.getByText('Vehicle Model:')).toBeInTheDocument();
    expect(screen.getByText('Fit Hybrid')).toBeInTheDocument();

    expect(screen.getByText('No of Days Completion:')).toBeInTheDocument();
    expect(screen.getByText('3 Days')).toBeInTheDocument();

    expect(screen.getByText('Year of Make:')).toBeInTheDocument();
    expect(screen.getByText('2016')).toBeInTheDocument();

    expect(screen.getByText('Vehicle Color:')).toBeInTheDocument();
    expect(screen.getByText('Milano Red')).toBeInTheDocument();

    expect(screen.getByText('Name of Insurance:')).toBeInTheDocument();
    expect(screen.getByText('Ceylinco General Insurance')).toBeInTheDocument();

    expect(screen.getByText('Customer Information:')).toBeInTheDocument();
    expect(screen.getByText('Sunil Silva - 071 234 5678')).toBeInTheDocument();
  });

  it('renders 3 distinct numbered sections, bottom disclaimers, and Customer Payable on insurance split', () => {
    render(<A4WorkshopPrint jobSheet={MOCK_JOB_SHEET} />);

    expect(screen.getByText('1. Labor - Remove & Reassemble')).toBeInTheDocument();
    expect(screen.getByText('2. Labor - Repair')).toBeInTheDocument();
    expect(screen.getByText('3. Replacement')).toBeInTheDocument();

    expect(screen.getByText('Insurance Approved:')).toBeInTheDocument();
    expect(screen.getByText('Customer Payable:')).toBeInTheDocument();
    expect(screen.getByText('Balance Due:')).toBeInTheDocument();

    expect(
      screen.getByText(/Computer generated estimate and does not carry a signature/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/T H A N K \s*Y O U/i)).toBeInTheDocument();
  });

  it('renders Balance Due for direct customer repairs without insurance when advance is paid', () => {
    const directCustomerSheet: WorkshopJobSheet = {
      ...MOCK_JOB_SHEET,
      docStage: 'ESTIMATE',
      financials: {
        ...MOCK_JOB_SHEET.financials,
        insuranceApprovedRs: 0,
        advancePaidRs: 10000,
        customerPayableRs: 28000,
        balanceDueRs: 18000,
      },
    };

    render(<A4WorkshopPrint jobSheet={directCustomerSheet} />);

    expect(screen.queryByText('Insurance Approved:')).not.toBeInTheDocument();
    expect(screen.getByText('Advance Paid:')).toBeInTheDocument();
    expect(screen.getByText('Balance Due:')).toBeInTheDocument();
    expect(screen.getByText('Rs. 18,000.00')).toBeInTheDocument();
  });

  it('renders Balance Due when document stage is INVOICE even with zero advance', () => {
    const invoiceSheet: WorkshopJobSheet = {
      ...MOCK_JOB_SHEET,
      docStage: 'INVOICE',
      financials: {
        ...MOCK_JOB_SHEET.financials,
        insuranceApprovedRs: 0,
        advancePaidRs: 0,
        customerPayableRs: 28000,
        balanceDueRs: 28000,
      },
    };

    render(<A4WorkshopPrint jobSheet={invoiceSheet} />);

    expect(screen.getByText('VEHICLE REPAIR INVOICE')).toBeInTheDocument();
    expect(screen.getByText('Balance Due:')).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 28,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('ENFORCES PRIVACY INVARIANT: Internal Buying Costs and Gross Profits are NEVER in the A4 Print DOM', () => {
    const { container } = render(<A4WorkshopPrint jobSheet={MOCK_JOB_SHEET} />);
    const html = container.innerHTML;

    // Buying costs must not exist anywhere in the print DOM
    expect(html).not.toContain('1,500.00'); // l1 buying cost
    expect(html).not.toContain('4,000.00'); // l2 buying cost
    expect(html).not.toContain('6,200.00'); // l3 buying cost
    expect(html).not.toContain('11,700.00'); // total buying cost
    expect(html).not.toContain('16,300.00'); // gross profit
    expect(html).not.toContain('58.21%'); // margin pct
    expect(html).not.toContain('Buying Cost');
    expect(html).not.toContain('Gross Profit');
  });

  it('ENFORCES JOB CARD REDACTION: All prices and monetary totals are redacted in JOB_CARD stage', () => {
    const jobCardSheet: WorkshopJobSheet = {
      ...MOCK_JOB_SHEET,
      docStage: 'JOB_CARD',
    };

    const { container } = render(<A4WorkshopPrint jobSheet={jobCardSheet} />);
    const html = container.innerHTML;

    expect(screen.getByText('WORKSHOP JOB CARD')).toBeInTheDocument();
    expect(screen.queryByText('Amount (Rs.)')).not.toBeInTheDocument();
    expect(screen.queryByText('Grand Total:')).not.toBeInTheDocument();
    expect(screen.getByText('Floor Supervisor Signature')).toBeInTheDocument();
    expect(screen.getByText('Technician Lead Signature')).toBeInTheDocument();

    // Selling amounts should not be present
    expect(html).not.toContain('Rs. 28,000.00');
    expect(html).not.toContain('Rs. 5,000.00');
    expect(html).not.toContain('Rs. 15,000.00');
  });
});

describe('80mm POS Thermal Receipt Print & Privacy', () => {
  it('renders thermal receipt header, itemized quantities, and totals with text wrapping', () => {
    render(<ThermalReceiptPrint receipt={MOCK_POS_RECEIPT} />);

    expect(screen.getByText('POS-2026-5555')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Engine Coolant 1L High-Performance Anti-Freeze / Anti-Boil Coolant Blue'
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 3,600.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Rs. 1,400.00')).toBeInTheDocument(); // Change
    expect(screen.getByText('THANK YOU FOR YOUR BUSINESS!')).toBeInTheDocument();
  });

  it('ENFORCES PRIVACY INVARIANT on Thermal Receipts: internal buying costs never printed', () => {
    const { container } = render(<ThermalReceiptPrint receipt={MOCK_POS_RECEIPT} />);
    const html = container.innerHTML;

    expect(html).not.toContain('1,200.00'); // buying cost
    expect(html).not.toContain('2,400.00'); // total cost
    expect(html).not.toContain('Buying Cost');
    expect(html).not.toContain('Profit');
  });
});
