import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, createMemoryRouter, RouterProvider, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { Header } from '@/app/layout/Header';
import { WorkshopTable } from '@/components/workshop/WorkshopTable';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { A4PriceRedactedJobCardPrint } from '@/components/print/A4PriceRedactedJobCardPrint';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';
import { PosTerminalPage } from '@/features/pos/pages/PosTerminalPage';
import { RepairSheetPage } from '@/features/workshop/pages/RepairSheetPage';
import { WorkshopInvoicePage } from '@/features/workshop/pages/WorkshopInvoicePage';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { financeRepository } from '@/features/finance-reports/repository/finance.repository.mock';
import { formatWhatsAppSummary, buildWhatsAppShareUrl } from '@/utils/whatsapp';
import { WorkshopJobSheet, WorkshopLineItem, PosSaleReceipt, UserRole } from '@/types';

function renderRepairSheetApp(
  initialEntries: string[] = ['/workshop/sheet/new'],
  role: UserRole = 'OWNER'
) {
  const testRouter = createMemoryRouter(
    [
      {
        path: '/workshop/sheet',
        element: <RepairSheetPage />,
      },
      {
        path: '/workshop/sheet/:id',
        element: <RepairSheetPage />,
      },
      {
        path: '/workshop/jobs',
        element: <div data-testid="mock-jobs-page">Jobs Page</div>,
      },
    ],
    {
      initialEntries,
    }
  );

  return render(
    <ToastProvider>
      <AuthProvider initialRole={role}>
        <RouterProvider router={testRouter} />
      </AuthProvider>
    </ToastProvider>
  );
}

function renderInvoiceApp(jobId: string, role: UserRole = 'OWNER') {
  return render(
    <ToastProvider>
      <AuthProvider initialRole={role}>
        <MemoryRouter initialEntries={[`/workshop/invoice/${jobId}`]}>
          <Routes>
            <Route path="/workshop/invoice/:id" element={<WorkshopInvoicePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

describe('Phase 10 — Final Print Privacy Audit, Keyboard Ergonomics & Regression QA Master Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
    await posSaleRepository.resetToDefaults();
    await posShiftRepository.resetToDefaults();
    await financeRepository.resetToDefaults();
  });

  // ===========================================================================
  // 1. ZERO-CRM MANUAL ENTRY TEST
  // ===========================================================================
  describe('1. Zero-CRM Manual Entry Test', () => {
    it('creates a full Accident Repair Estimate by typing brand-new Vehicle, Customer, Insurance, and 10 custom rows across all 3 sections without touching separate CRM or Catalog screen', async () => {
      // 10 custom repair rows across all 3 sections:
      // Section 1: LABOR_REMOVE_REASSEMBLE (3 rows)
      // Section 2: LABOR_REPAIR (4 rows)
      // Section 3: REPLACEMENT (3 rows)
      const tenCustomRows: WorkshopLineItem[] = [
        // Section 1 (3 rows)
        {
          id: 'row-rr-1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Front Bumper, Grille, and Headlamps R&R',
          sellingPriceRs: 14000,
          buyingCostRs: 4000,
          assignedTechnician: 'Nimal',
          isCompleted: false,
        },
        {
          id: 'row-rr-2',
          rowNo: 2,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Radiator, Intercooler, and AC Condenser R&R',
          sellingPriceRs: 16000,
          buyingCostRs: 5000,
          assignedTechnician: 'Nimal',
          isCompleted: false,
        },
        {
          id: 'row-rr-3',
          rowNo: 3,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Dashboard & Steering Column R&R',
          sellingPriceRs: 22000,
          buyingCostRs: 7000,
          assignedTechnician: 'Kamal',
          isCompleted: false,
        },
        // Section 2 (4 rows)
        {
          id: 'row-rep-1',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Front Chassis Rail Straightening & Hydraulic Pulling',
          sellingPriceRs: 45000,
          buyingCostRs: 12000,
          assignedTechnician: 'Sunil',
          isCompleted: false,
        },
        {
          id: 'row-rep-2',
          rowNo: 2,
          category: 'LABOR_REPAIR',
          description: 'Fender LH Beating & Body Aligning',
          sellingPriceRs: 18000,
          buyingCostRs: 4500,
          assignedTechnician: 'Sunil',
          isCompleted: false,
        },
        {
          id: 'row-rep-3',
          rowNo: 3,
          category: 'LABOR_REPAIR',
          description: 'Bonnet Panel Tinkering & Leveling',
          sellingPriceRs: 20000,
          buyingCostRs: 5000,
          assignedTechnician: 'Sunil',
          isCompleted: false,
        },
        {
          id: 'row-rep-4',
          rowNo: 4,
          category: 'LABOR_REPAIR',
          description: 'Front Apron & Suspension Tower Realignment',
          sellingPriceRs: 32000,
          buyingCostRs: 9000,
          assignedTechnician: 'Sunil',
          isCompleted: false,
        },
        // Section 3 (3 rows)
        {
          id: 'row-part-1',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'Front Bumper Outer Skin OEM Genuine',
          sellingPriceRs: 65000,
          buyingCostRs: 48000,
          assignedTechnician: 'Stores',
          isCompleted: false,
        },
        {
          id: 'row-part-2',
          rowNo: 2,
          category: 'REPLACEMENT',
          description: 'Bi-LED Headlamp Assembly LH Genuine',
          sellingPriceRs: 110000,
          buyingCostRs: 82000,
          assignedTechnician: 'Stores',
          isCompleted: false,
        },
        {
          id: 'row-part-3',
          rowNo: 3,
          category: 'REPLACEMENT',
          description: 'Radiator Core Sub-Assembly Denso',
          sellingPriceRs: 38000,
          buyingCostRs: 26000,
          assignedTechnician: 'Stores',
          isCompleted: false,
        },
      ];

      expect(tenCustomRows.length).toBe(10);
      expect(tenCustomRows.filter((r) => r.category === 'LABOR_REMOVE_REASSEMBLE').length).toBe(3);
      expect(tenCustomRows.filter((r) => r.category === 'LABOR_REPAIR').length).toBe(4);
      expect(tenCustomRows.filter((r) => r.category === 'REPLACEMENT').length).toBe(3);

      // Create new job sheet via Zero-CRM manual entry
      const brandNewVehicleNumber = 'WP CAZ-1010';
      const brandNewCustomer = 'Deshamanya Dr. Rohan Karunaratne - 077 712 3456 / No 42, Ward Place, Colombo 07';
      const brandNewInsurance = 'Fairfirst Insurance PLC';

      const createdEstimate = await workshopJobRepository.create({
        jobNumber: 'JOB-2026-ZERO-CRM-10',
        docStage: 'ESTIMATE',
        floorStatus: 'PENDING_INSURANCE_APPROVAL',
        paymentStatus: 'UNPAID',
        header: {
          date: '2026-11-03',
          jobNumber: 'JOB-2026-ZERO-CRM-10',
          vehicleNumber: brandNewVehicleNumber,
          natureOfRepair: 'High-Impact Accident Repair Frontal Crash & Structural Beating',
          vehicleMake: 'Toyota',
          chassisNumber: 'ZVW50-5192837',
          vehicleModel: 'Prius 4th Gen',
          daysForCompletion: '10 Days',
          yearOfMake: '2019',
          vehicleColor: 'Super White II',
          insuranceName: brandNewInsurance,
          customerInfo: brandNewCustomer,
        },
        lines: tenCustomRows,
        discountRs: 5000,
        taxRs: 0,
        insuranceApprovedRs: 300000,
        advancePaidRs: 25000,
      });

      expect(createdEstimate.id).toBeDefined();
      expect(createdEstimate.header.vehicleNumber).toBe('WP CAZ-1010');
      expect(createdEstimate.header.customerInfo).toBe(brandNewCustomer);
      expect(createdEstimate.header.insuranceName).toBe(brandNewInsurance);
      expect(createdEstimate.lines.length).toBe(10);

      // Verify subtotals across all 3 sections
      // Section 1: 14000 + 16000 + 22000 = 52000
      expect(createdEstimate.financials.subtotalRemoveReassembleRs).toBe(52000);
      // Section 2: 45000 + 18000 + 20000 + 32000 = 115000
      expect(createdEstimate.financials.subtotalRepairRs).toBe(115000);
      // Section 3: 65000 + 110000 + 38000 = 213000
      expect(createdEstimate.financials.subtotalReplacementRs).toBe(213000);

      // Gross Total = 52000 + 115000 + 213000 = 380,000
      // Discount = 5,000 -> Net Grand Total = 375,000
      expect(createdEstimate.financials.grandTotalSalesRs).toBe(375000);

      // Split Billing:
      // Insurance Approved: 300,000 -> Customer Payable: 75,000
      // Advance Paid: 25,000 -> Balance Due: 50,000
      expect(createdEstimate.financials.insuranceApprovedRs).toBe(300000);
      expect(createdEstimate.financials.customerPayableRs).toBe(75000);
      expect(createdEstimate.financials.advancePaidRs).toBe(25000);
      expect(createdEstimate.financials.balanceDueRs).toBe(50000);

      // Verify that this required 0 records in external CRM or catalog
      const allCatalog = await catalogRepository.getAll();
      expect(allCatalog.some((c) => c.name === 'Dashboard & Steering Column R&R')).toBe(false);
    });

    it('creates a full Accident Repair Estimate by typing brand-new Vehicle, Customer, Insurance, and 10 custom rows across all 3 sections via RepairSheetPage UI', async () => {
      renderRepairSheetApp(['/workshop/sheet/new'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
      });

      // Type brand-new unregistered vehicle
      const vehicleInput = screen.getByTestId('vehicle-lookup-input');
      fireEvent.change(vehicleInput, { target: { value: 'WP CAZ-1010' } });

      // Type customer info
      const customerInput = screen.getByTestId('header-customer-info');
      fireEvent.change(customerInput, {
        target: { value: 'Deshamanya Dr. Rohan Karunaratne - 077 712 3456 / No 42, Ward Place, Colombo 07' },
      });

      // Type insurance company
      const insuranceInput = screen.getByTestId('header-insurance-name');
      fireEvent.change(insuranceInput, { target: { value: 'Fairfirst Insurance PLC' } });

      // Type nature of repair
      const repairNatureInput = screen.getByTestId('header-nature-of-repair');
      fireEvent.change(repairNatureInput, {
        target: { value: 'High-Impact Accident Repair Frontal Crash & Structural Beating' },
      });

      // Set stage to ESTIMATE
      const estimateToggle = screen.getByTestId('stage-toggle-estimate');
      fireEvent.click(estimateToggle);

      // Section 1: Add 3 rows
      const addSection1Btn = screen.getByTestId('add-row-btn-LABOR_REMOVE_REASSEMBLE');
      fireEvent.click(addSection1Btn);
      fireEvent.click(addSection1Btn);
      fireEvent.click(addSection1Btn);

      // Section 2: Add 4 rows
      const addSection2Btn = screen.getByTestId('add-row-btn-LABOR_REPAIR');
      fireEvent.click(addSection2Btn);
      fireEvent.click(addSection2Btn);
      fireEvent.click(addSection2Btn);
      fireEvent.click(addSection2Btn);

      // Section 3: Add 3 rows
      const addSection3Btn = screen.getByTestId('add-row-btn-REPLACEMENT');
      fireEvent.click(addSection3Btn);
      fireEvent.click(addSection3Btn);
      fireEvent.click(addSection3Btn);

      // Verify 10 description inputs exist in DOM
      const descInputs = screen.getAllByPlaceholderText('Enter repair or replacement item description...');
      expect(descInputs.length).toBe(10);

      // Fill in all 10 descriptions
      const descriptions = [
        'Front Bumper, Grille, and Headlamps R&R',
        'Radiator, Intercooler, and AC Condenser R&R',
        'Dashboard & Steering Column R&R',
        'Front Chassis Rail Straightening & Hydraulic Pulling',
        'Fender LH Beating & Body Aligning',
        'Bonnet Panel Tinkering & Leveling',
        'Front Apron & Suspension Tower Realignment',
        'Front Bumper Outer Skin OEM Genuine',
        'Bi-LED Headlamp Assembly LH Genuine',
        'Radiator Core Sub-Assembly Denso',
      ];
      const amounts = [14000, 16000, 22000, 45000, 18000, 20000, 32000, 65000, 110000, 38000];

      const amountInputs = screen.getAllByTestId(/^amount-input-/);
      expect(amountInputs.length).toBe(10);

      for (let i = 0; i < 10; i++) {
        fireEvent.change(descInputs[i], { target: { value: descriptions[i] } });
        fireEvent.change(amountInputs[i], { target: { value: String(amounts[i]) } });
      }

      // Click Save Repair Sheet button
      const saveBtn = screen.getByTestId('save-sheet-btn');
      fireEvent.click(saveBtn);

      // Wait for repository to have the newly saved job
      await waitFor(async () => {
        const allJobs = await workshopJobRepository.getAll();
        const savedJob = allJobs.find((j) => j.header.vehicleNumber === 'WP CAZ-1010');
        expect(savedJob).toBeDefined();
        expect(savedJob?.docStage).toBe('ESTIMATE');
        expect(savedJob?.lines.length).toBe(10);
        expect(savedJob?.lines.filter((l) => l.category === 'LABOR_REMOVE_REASSEMBLE').length).toBe(3);
        expect(savedJob?.lines.filter((l) => l.category === 'LABOR_REPAIR').length).toBe(4);
        expect(savedJob?.lines.filter((l) => l.category === 'REPLACEMENT').length).toBe(3);
        expect(savedJob?.header.customerInfo).toContain('Deshamanya Dr. Rohan Karunaratne');
        expect(savedJob?.header.insuranceName).toBe('Fairfirst Insurance PLC');
        expect(savedJob?.financials.grandTotalSalesRs).toBe(380000);
      });
    });
  });

  // ===========================================================================
  // 2. LIFECYCLE STATE MACHINE TEST (ZERO DATA LOSS & AUDIT TRAILS)
  // ===========================================================================
  describe('2. Lifecycle State Machine Test', () => {
    it('verifies sequential transitions across Quotation -> Estimate -> Job Card -> Final Invoice with zero data loss across all 12 header fields and 3 line-item tables, plus full audit trail log recording', async () => {
      // 1. Initial QUOTATION creation
      const initialHeader = {
        date: '2026-11-03',
        jobNumber: 'JOB-2026-LIFECYCLE',
        vehicleNumber: 'WP CAR-8822',
        natureOfRepair: 'Quarter Panel Collision Repair',
        vehicleMake: 'Honda',
        chassisNumber: 'FK7-1029384',
        vehicleModel: 'Civic Hatchback Turbo',
        daysForCompletion: '6 Days',
        yearOfMake: '2019',
        vehicleColor: 'Sonic Gray Pearl',
        insuranceName: 'Allianz Insurance Lanka',
        customerInfo: 'Ramesh Jayasuriya - 077 445 6677 / No 15, Havelock Road, Colombo 05',
      };

      const initialLines: WorkshopLineItem[] = [
        {
          id: 'l-rr',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Rear Bumper & Tail Lamp R&R',
          sellingPriceRs: 9000,
          buyingCostRs: 2500,
          assignedTechnician: 'Nimal',
          isCompleted: false,
        },
        {
          id: 'l-rep',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Quarter Panel Dent Pulling & Painting',
          sellingPriceRs: 24000,
          buyingCostRs: 6000,
          assignedTechnician: 'Sunil',
          isCompleted: false,
        },
        {
          id: 'l-repl',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'OEM Tail Lamp Assembly LH LED',
          sellingPriceRs: 48000,
          buyingCostRs: 34000,
          assignedTechnician: 'Stores',
          isCompleted: false,
        },
      ];

      // Stage 1: QUOTATION
      const quoteJob = await workshopJobRepository.create({
        jobNumber: initialHeader.jobNumber,
        docStage: 'QUOTATION',
        floorStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        header: initialHeader,
        lines: initialLines,
        discountRs: 1000,
        taxRs: 0,
        insuranceApprovedRs: 0,
        advancePaidRs: 0,
      });

      expect(quoteJob.docStage).toBe('QUOTATION');
      expect(quoteJob.header).toEqual(initialHeader);
      expect(quoteJob.lines.length).toBe(3);

      // Stage 2: ESTIMATE (Customer approves preliminary quote, insurer provides initial approval)
      const estimateJob = await workshopJobRepository.convertStage(
        quoteJob.id,
        'ESTIMATE',
        'Customer approved preliminary quotation - transition to Estimate'
      );
      await workshopJobRepository.update(estimateJob.id, {
        floorStatus: 'PENDING_INSURANCE_APPROVAL',
        insuranceApprovedRs: 60000,
        advancePaidRs: 10000,
      });

      const reloadedEstimate = (await workshopJobRepository.getById(quoteJob.id))!;
      expect(reloadedEstimate.docStage).toBe('ESTIMATE');
      // Verify all 12 header fields are completely preserved
      expect(reloadedEstimate.header.date).toBe(initialHeader.date);
      expect(reloadedEstimate.header.jobNumber).toBe(initialHeader.jobNumber);
      expect(reloadedEstimate.header.vehicleNumber).toBe(initialHeader.vehicleNumber);
      expect(reloadedEstimate.header.natureOfRepair).toBe(initialHeader.natureOfRepair);
      expect(reloadedEstimate.header.vehicleMake).toBe(initialHeader.vehicleMake);
      expect(reloadedEstimate.header.chassisNumber).toBe(initialHeader.chassisNumber);
      expect(reloadedEstimate.header.vehicleModel).toBe(initialHeader.vehicleModel);
      expect(reloadedEstimate.header.daysForCompletion).toBe(initialHeader.daysForCompletion);
      expect(reloadedEstimate.header.yearOfMake).toBe(initialHeader.yearOfMake);
      expect(reloadedEstimate.header.vehicleColor).toBe(initialHeader.vehicleColor);
      expect(reloadedEstimate.header.insuranceName).toBe(initialHeader.insuranceName);
      expect(reloadedEstimate.header.customerInfo).toBe(initialHeader.customerInfo);
      // Line items preserved
      expect(reloadedEstimate.lines.length).toBe(3);

      // Stage 3: JOB_CARD (Transition with frozen snapshot)
      const jobCardJob = await workshopJobRepository.convertStage(
        reloadedEstimate.id,
        'JOB_CARD',
        'Customer approved estimate - convert to Job Card'
      );

      expect(jobCardJob.docStage).toBe('JOB_CARD');
      expect(jobCardJob.originalEstimateSnapshot).toBeDefined();
      const parsedSnapshot = JSON.parse(jobCardJob.originalEstimateSnapshot!);
      expect(parsedSnapshot.grandTotalSalesRs).toBe(80000); // (9000 + 24000 + 48000) - 1000
      expect(parsedSnapshot.lines.length).toBe(3);

      // Add Supplementary Line during repair
      const suppItem: WorkshopLineItem = {
        id: 'l-supp-1',
        rowNo: 2,
        category: 'REPLACEMENT',
        description: 'Bumper Inner Bracket Clip Mount RH',
        sellingPriceRs: 5000,
        buyingCostRs: 3000,
        assignedTechnician: 'Stores',
        isCompleted: false,
        isSupplementary: true,
      };

      const jobCardWithSupp = await workshopJobRepository.update(jobCardJob.id, {
        lines: [...jobCardJob.lines, suppItem],
      });
      expect(jobCardWithSupp.lines.length).toBe(4);
      expect(jobCardWithSupp.lines.find((l) => l.id === 'l-supp-1')?.isSupplementary).toBe(true);

      // Stage 4: FINAL INVOICE
      const invoiceJob = await workshopJobRepository.convertStage(
        jobCardWithSupp.id,
        'INVOICE',
        'Work completed - convert Job Card to Final Invoice'
      );
      await workshopJobRepository.update(invoiceJob.id, {
        floorStatus: 'READY_FOR_DELIVERY',
        insuranceApprovedRs: 65000, // Insurer approved 65,000
      });

      const reloadedInvoice = (await workshopJobRepository.getById(invoiceJob.id))!;
      expect(reloadedInvoice.docStage).toBe('INVOICE');
      // Verify all 12 header fields remain 100% intact
      expect(reloadedInvoice.header).toEqual(initialHeader);
      // All 4 line items across 3 categories intact
      expect(reloadedInvoice.lines.length).toBe(4);
      expect(reloadedInvoice.lines.filter((l) => l.category === 'LABOR_REMOVE_REASSEMBLE').length).toBe(1);
      expect(reloadedInvoice.lines.filter((l) => l.category === 'LABOR_REPAIR').length).toBe(1);
      expect(reloadedInvoice.lines.filter((l) => l.category === 'REPLACEMENT').length).toBe(2);

      // Verify Audit Trail Log Recording
      expect(reloadedInvoice.auditLogs).toBeDefined();
      expect(reloadedInvoice.auditLogs!.length).toBeGreaterThanOrEqual(3);
      const stageConversions = reloadedInvoice.auditLogs!.filter((log) => log.toState !== undefined);
      expect(stageConversions.some((l) => l.toState === 'ESTIMATE')).toBe(true);
      expect(stageConversions.some((l) => l.toState === 'JOB_CARD')).toBe(true);
      expect(stageConversions.some((l) => l.toState === 'INVOICE')).toBe(true);
    });

    it('verifies sequential transitions across Quotation -> Estimate -> Job Card -> Final Invoice via RepairSheetPage UI with zero data loss', async () => {
      // Create initial QUOTATION job in repository
      const createdJob = await workshopJobRepository.create({
        jobNumber: 'JOB-2026-UI-LIFECYCLE',
        docStage: 'QUOTATION',
        floorStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        header: {
          date: '2026-11-03',
          jobNumber: 'JOB-2026-UI-LIFECYCLE',
          vehicleNumber: 'WP CAT-9900',
          natureOfRepair: 'Rear Crash Overhaul',
          vehicleMake: 'Honda',
          chassisNumber: 'FK7-554433',
          vehicleModel: 'Civic',
          daysForCompletion: '5 Days',
          yearOfMake: '2020',
          vehicleColor: 'Sonic Gray',
          insuranceName: 'Allianz Insurance Lanka',
          customerInfo: 'Sunil Weerasinghe - 077 889 0011',
        },
        lines: [
          {
            id: 'l-rr-init',
            rowNo: 1,
            category: 'LABOR_REMOVE_REASSEMBLE',
            description: 'Bumper removal',
            sellingPriceRs: 10000,
            buyingCostRs: 3000,
            assignedTechnician: 'Nimal',
            isCompleted: false,
          },
          {
            id: 'l-rep-init',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Quarter panel beating',
            sellingPriceRs: 25000,
            buyingCostRs: 6000,
            assignedTechnician: 'Kamal',
            isCompleted: false,
          },
          {
            id: 'l-part-init',
            rowNo: 1,
            category: 'REPLACEMENT',
            description: 'Rear Lamp Unit',
            sellingPriceRs: 45000,
            buyingCostRs: 30000,
            assignedTechnician: 'Stores',
            isCompleted: false,
          },
        ],
        discountRs: 0,
        taxRs: 0,
        insuranceApprovedRs: 0,
        advancePaidRs: 0,
      });

      renderRepairSheetApp([`/workshop/sheet/${createdJob.id}`], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
      });

      // 1. Transition to ESTIMATE
      fireEvent.click(screen.getByTestId('stage-toggle-estimate'));
      await waitFor(async () => {
        const repoJob = await workshopJobRepository.getById(createdJob.id);
        expect(repoJob?.docStage).toBe('ESTIMATE');
        expect(repoJob?.header.vehicleNumber).toBe('WP CAT-9900');
        expect(repoJob?.lines.length).toBe(3);
      });

      // 2. Transition to JOB_CARD
      fireEvent.click(screen.getByTestId('stage-toggle-job_card'));
      await waitFor(async () => {
        const repoJob = await workshopJobRepository.getById(createdJob.id);
        expect(repoJob?.docStage).toBe('JOB_CARD');
        expect(repoJob?.originalEstimateSnapshot).toBeDefined();
        const snapshot = JSON.parse(repoJob!.originalEstimateSnapshot!);
        expect(snapshot.grandTotalSalesRs).toBe(80000);
      });

      // 3. Transition to INVOICE
      fireEvent.click(screen.getByTestId('stage-toggle-invoice'));
      await waitFor(async () => {
        const repoJob = await workshopJobRepository.getById(createdJob.id);
        expect(repoJob?.docStage).toBe('INVOICE');
        expect(repoJob?.header.vehicleNumber).toBe('WP CAT-9900');
        expect(repoJob?.header.customerInfo).toBe('Sunil Weerasinghe - 077 889 0011');
        expect(repoJob?.lines.length).toBe(3);
        expect(repoJob?.auditLogs?.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  // ===========================================================================
  // 3. COST PRIVACY INVARIANT COMPREHENSIVE AUDIT
  // ===========================================================================
  describe('3. Cost Privacy Invariant Comprehensive Audit', () => {
    const SENSITIVE_JOB_SHEET: WorkshopJobSheet = {
      id: 'job-privacy-master-1',
      jobNumber: 'JOB-2026-PRIVACY',
      docStage: 'QUOTATION',
      floorStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      header: {
        date: '2026-11-03',
        jobNumber: 'JOB-2026-PRIVACY',
        vehicleNumber: 'WP CAR-9999',
        natureOfRepair: 'Collision Overhaul',
        vehicleMake: 'Toyota',
        chassisNumber: 'ZVW30-9876543',
        vehicleModel: 'Prius',
        daysForCompletion: '5 Days',
        yearOfMake: '2016',
        vehicleColor: 'Silver Metallic',
        insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
        customerInfo: 'Rohan - 077 123 4567 / Colombo',
      },
      lines: [
        {
          id: 'p-line-1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Front End Dismantling',
          sellingPriceRs: 15000,
          buyingCostRs: 3333, // SENSITIVE
          assignedTechnician: 'Nimal',
          isCompleted: true,
        },
        {
          id: 'p-line-2',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Chassis Straightening',
          sellingPriceRs: 35000,
          buyingCostRs: 7777, // SENSITIVE
          assignedTechnician: 'Sunil',
          isCompleted: false,
        },
        {
          id: 'p-line-3',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'Genuine Radiator Assembly',
          sellingPriceRs: 50000,
          buyingCostRs: 31111, // SENSITIVE
          assignedTechnician: 'Stores',
          isCompleted: true,
        },
      ],
      financials: {
        subtotalRemoveReassembleRs: 15000,
        subtotalRepairRs: 35000,
        subtotalReplacementRs: 50000,
        discountRs: 0,
        taxRs: 0,
        grandTotalSalesRs: 100000,
        totalBuyingCostRs: 42221, // SENSITIVE TOTAL COST
        grossProfitRs: 57779, // SENSITIVE PROFIT
        grossMarginPct: 57.78, // SENSITIVE MARGIN
        insuranceApprovedRs: 70000,
        customerPayableRs: 30000,
        advancePaidRs: 10000,
        balanceDueRs: 20000,
      },
      createdAt: '2026-11-03T00:00:00Z',
      updatedAt: '2026-11-03T00:00:00Z',
    };

    it('A4 Quotations: 0% buying costs, gross profit, or margin % in DOM or print tree', () => {
      const { container } = render(
        <A4WorkshopPrint
          jobSheet={{ ...SENSITIVE_JOB_SHEET, docStage: 'QUOTATION' }}
        />
      );

      const html = container.innerHTML;
      expect(html).not.toContain('3333');
      expect(html).not.toContain('7777');
      expect(html).not.toContain('31111');
      expect(html).not.toContain('42221');
      expect(html).not.toContain('42,221');
      expect(html).not.toContain('57779');
      expect(html).not.toContain('57,779');
      expect(html).not.toContain('57.78');
      expect(html.toLowerCase()).not.toContain('buying cost');
      expect(html.toLowerCase()).not.toContain('gross profit');
      expect(html.toLowerCase()).not.toContain('margin %');
    });

    it('A4 Estimates: 0% buying costs, gross profit, or margin % in DOM or print tree', () => {
      const { container } = render(
        <A4WorkshopPrint
          jobSheet={{ ...SENSITIVE_JOB_SHEET, docStage: 'ESTIMATE' }}
        />
      );

      const html = container.innerHTML;
      expect(html).not.toContain('3333');
      expect(html).not.toContain('7777');
      expect(html).not.toContain('31111');
      expect(html).not.toContain('42221');
      expect(html).not.toContain('57779');
      expect(html).not.toContain('57.78');
      expect(html.toLowerCase()).not.toContain('buying cost');
      expect(html.toLowerCase()).not.toContain('gross profit');
    });

    it('A4 Job Cards: 100% price and cost redaction across all tables and footers', () => {
      const { container } = render(
        <A4PriceRedactedJobCardPrint jobSheet={SENSITIVE_JOB_SHEET} />
      );

      const html = container.innerHTML;
      // All costs redacted
      expect(html).not.toContain('3333');
      expect(html).not.toContain('42221');
      // All selling prices and totals redacted
      expect(html).not.toContain('15,000');
      expect(html).not.toContain('35,000');
      expect(html).not.toContain('50,000');
      expect(html).not.toContain('100,000');
      expect(html).not.toContain('70,000');
      expect(html).not.toContain('20,000');

      // But technician and task checkboxes must be visible
      expect(screen.getAllByText('Assigned Technician').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Task Completed [ ]').length).toBeGreaterThanOrEqual(1);
    });

    it('A4 Invoices: 0% buying costs, gross profit, or margin % in DOM or print tree', () => {
      const { container } = render(
        <A4WorkshopPrint
          jobSheet={{ ...SENSITIVE_JOB_SHEET, docStage: 'INVOICE' }}
        />
      );

      const html = container.innerHTML;
      expect(html).not.toContain('3333');
      expect(html).not.toContain('7777');
      expect(html).not.toContain('31111');
      expect(html).not.toContain('42221');
      expect(html).not.toContain('57779');
      expect(html.toLowerCase()).not.toContain('buying cost');
      expect(html.toLowerCase()).not.toContain('gross profit');
    });

    it('80mm POS Receipts: 0% buying costs or gross profit in thermal receipt DOM', () => {
      const mockPosReceipt: PosSaleReceipt = {
        id: 'rec-priv-1',
        receiptNumber: 'POS-2026-PRIV-1',
        date: '2026-11-03 10:00 AM',
        customerNote: 'Walk-in',
        items: [
          {
            id: 'pos-l1',
            description: 'Engine Oil 5W-30',
            qty: 2,
            unitSellingPriceRs: 8500,
            unitBuyingCostRs: 6123, // SENSITIVE COST
            lineDiscountRs: 0,
            lineTotalSalesRs: 17000,
            lineTotalCostRs: 12246,
            lineGrossProfitRs: 4754,
          },
        ],
        subtotalRs: 17000,
        discountRs: 0,
        netTotalSalesRs: 17000,
        netSalesRs: 17000,
        totalCostRs: 12246,
        grossProfitRs: 4754,
        amountTenderedRs: 20000,
        changeGivenRs: 3000,
        paymentMethod: 'CASH',
        cashierName: 'Kamal Fonseka',
      };

      const { container } = render(<ThermalReceiptPrint receipt={mockPosReceipt} />);
      const html = container.innerHTML;

      expect(html).not.toContain('6123');
      expect(html.toLowerCase()).not.toContain('buying cost');
      expect(html.toLowerCase()).not.toContain('profit');
    });

    it('WhatsApp share payloads: text summary and generated wa.me URL strictly exclude costs, profit, and margin', () => {
      const summary = formatWhatsAppSummary(SENSITIVE_JOB_SHEET);
      const url = buildWhatsAppShareUrl(SENSITIVE_JOB_SHEET);

      expect(summary).not.toContain('42221');
      expect(summary).not.toContain('57779');
      expect(summary).not.toContain('57.78');
      expect(summary).not.toContain('3333');
      expect(summary.toLowerCase()).not.toContain('buying cost');
      expect(summary.toLowerCase()).not.toContain('profit');
      expect(summary.toLowerCase()).not.toContain('margin');

      expect(url).not.toContain('42221');
      expect(url).not.toContain('57779');
      expect(url.toLowerCase()).not.toContain('profit');
      expect(url.toLowerCase()).not.toContain('cost');
    });

    it('WorkshopInvoicePage: Service Advisor, Cashier, and Technician cannot see cost toggle button or any buying costs in DOM', async () => {
      const invJob = await workshopJobRepository.create({
        docStage: 'INVOICE',
        floorStatus: 'READY_FOR_DELIVERY',
        header: {
          date: '2026-11-03',
          jobNumber: 'JOB-INV-PRIVACY-1',
          vehicleNumber: 'WP CAR-7766',
          natureOfRepair: 'Bumper touchup',
          vehicleMake: 'Toyota',
          chassisNumber: 'NZE141-889922',
          vehicleModel: 'Premio',
          daysForCompletion: '2 Days',
          yearOfMake: '2018',
          vehicleColor: 'Silver',
          insuranceName: 'SLIC',
          customerInfo: 'Kasun - 077 112 2334',
        },
        lines: [
          {
            id: 'priv-l1',
            rowNo: 1,
            category: 'LABOR_REMOVE_REASSEMBLE',
            description: 'Rear Trim Dismantle',
            sellingPriceRs: 15000,
            buyingCostRs: 4891, // SENSITIVE COST
            assignedTechnician: 'Nimal',
            isCompleted: true,
          },
        ],
        discountRs: 0,
        taxRs: 0,
        insuranceApprovedRs: 0,
        advancePaidRs: 0,
      });

      // 1. SERVICE_ADVISOR: cannot see Cost Mode toggle button and cannot see buying cost
      const { unmount: unmountAdvisor } = renderInvoiceApp(invJob.id, 'SERVICE_ADVISOR');
      await waitFor(() => {
        expect(screen.getByTestId('workshop-invoice-page')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('toggle-cost-profit-btn')).not.toBeInTheDocument();
      expect(document.body.innerHTML).not.toContain('4891');
      expect(document.body.innerHTML.toLowerCase()).not.toContain('cost: rs.');
      unmountAdvisor();

      // 2. CASHIER: cannot see Cost Mode toggle button and cannot see buying cost
      const { unmount: unmountCashier } = renderInvoiceApp(invJob.id, 'CASHIER');
      await waitFor(() => {
        expect(screen.getByTestId('workshop-invoice-page')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('toggle-cost-profit-btn')).not.toBeInTheDocument();
      expect(document.body.innerHTML).not.toContain('4891');
      unmountCashier();

      // 3. TECHNICIAN: cannot see Cost Mode toggle button and cannot see buying cost
      const { unmount: unmountTech } = renderInvoiceApp(invJob.id, 'TECHNICIAN');
      await waitFor(() => {
        expect(screen.getByTestId('workshop-invoice-page')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('toggle-cost-profit-btn')).not.toBeInTheDocument();
      expect(document.body.innerHTML).not.toContain('4891');
      unmountTech();
    });

    it('A4 print layout renders cleanly when sections have 0 rows (- Nil -) and handles 100% customer liability (0 advance, 0 insurance)', () => {
      const edgeJob: WorkshopJobSheet = {
        id: 'job-edge-1',
        jobNumber: 'JOB-2026-EDGE-1',
        docStage: 'INVOICE',
        floorStatus: 'READY_FOR_DELIVERY',
        paymentStatus: 'UNPAID',
        header: {
          date: '2026-11-03',
          jobNumber: 'JOB-2026-EDGE-1',
          vehicleNumber: 'WP CAA-1111',
          natureOfRepair: 'Replacement Only Repair',
          vehicleMake: 'Suzuki',
          chassisNumber: 'MH34S-123456',
          vehicleModel: 'Wagon R',
          daysForCompletion: '1 Day',
          yearOfMake: '2015',
          vehicleColor: 'Pearl White',
          insuranceName: 'Direct Cash Customer',
          customerInfo: 'Saman - 077 555 6677',
        },
        lines: [
          // Section 1: EMPTY (0 items)
          // Section 2: EMPTY (0 items)
          // Section 3: 2 replacement parts
          {
            id: 'edge-p1',
            rowNo: 1,
            category: 'REPLACEMENT',
            description: 'Cabin Air Filter Genuine',
            sellingPriceRs: 4500,
            buyingCostRs: 2500,
            assignedTechnician: 'Stores',
            isCompleted: true,
          },
          {
            id: 'edge-p2',
            rowNo: 2,
            category: 'REPLACEMENT',
            description: 'Wiper Blade Set Bosch',
            sellingPriceRs: 6500,
            buyingCostRs: 3500,
            assignedTechnician: 'Stores',
            isCompleted: true,
          },
        ],
        financials: {
          subtotalRemoveReassembleRs: 0,
          subtotalRepairRs: 0,
          subtotalReplacementRs: 11000,
          discountRs: 0,
          taxRs: 0,
          grandTotalSalesRs: 11000,
          totalBuyingCostRs: 6000,
          grossProfitRs: 5000,
          grossMarginPct: 45.45,
          insuranceApprovedRs: 0, // 0 Insurance Approved
          customerPayableRs: 11000,
          advancePaidRs: 0, // 0 Advance Paid
          balanceDueRs: 11000, // 100% Customer Liability
        },
        createdAt: '2026-11-03T00:00:00Z',
        updatedAt: '2026-11-03T00:00:00Z',
      };

      const { container } = render(<A4WorkshopPrint jobSheet={edgeJob} />);
      const nilElements = screen.getAllByText('- Nil -');
      expect(nilElements.length).toBe(2); // Section 1 & Section 2 both show - Nil -

      // Verify replacement section shows items
      expect(screen.getByText('Cabin Air Filter Genuine')).toBeInTheDocument();
      expect(screen.getByText('Wiper Blade Set Bosch')).toBeInTheDocument();

      // Verify financials block
      const html = container.innerHTML;
      expect(html).toContain('11,000');
      // Insurance Approved and Advance Paid rows are NOT rendered since amounts are 0
      expect(html).not.toContain('Insurance Approved:');
      expect(html).not.toContain('Advance Paid:');
    });
  });

  // ===========================================================================
  // 4. GROSS PROFIT & SPLIT BILLING MATH AUDIT
  // ===========================================================================
  describe('4. Gross Profit & Split Billing Math Audit', () => {
    it('verifies Net Sales - Direct Cost = Gross Profit across combined Workshop + POS transactions', async () => {
      // 1. Create Workshop Job with known revenue & cost
      // Revenue = 150,000, Cost = 90,000 -> Gross Profit = 60,000
      await workshopJobRepository.create({
        jobNumber: 'JOB-FINANCE-MATH-1',
        docStage: 'INVOICE',
        floorStatus: 'COMPLETED_DELIVERED',
        paymentStatus: 'PAID',
        header: {
          date: '2026-11-03',
          jobNumber: 'JOB-FINANCE-MATH-1',
          vehicleNumber: 'WP CAR-1122',
          natureOfRepair: 'Suspension & Brakes',
          vehicleMake: 'Nissan',
          chassisNumber: 'T32-123456',
          vehicleModel: 'X-Trail',
          daysForCompletion: '3 Days',
          yearOfMake: '2017',
          vehicleColor: 'Black',
          insuranceName: 'Direct Cash Customer',
          customerInfo: 'Sunil - 077 334 5566',
        },
        lines: [
          {
            id: 'l-m1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Suspension Overhaul',
            sellingPriceRs: 50000,
            buyingCostRs: 20000,
            assignedTechnician: 'Sunil',
            isCompleted: true,
          },
          {
            id: 'l-m2',
            rowNo: 1,
            category: 'REPLACEMENT',
            description: 'Shock Absorber Pair KYB',
            sellingPriceRs: 100000,
            buyingCostRs: 70000,
            assignedTechnician: 'Stores',
            isCompleted: true,
          },
        ],
        discountRs: 0,
        taxRs: 0,
        insuranceApprovedRs: 0,
        advancePaidRs: 0,
      });

      // 2. Open Shift & Create POS Sale
      // Sale: 2 x 10,000 = 20,000 revenue. Cost: 2 x 6,000 = 12,000. Profit = 8,000
      const shift = await posShiftRepository.openShift('cashier-02', 'Nimal Silva', 10000);
      const testItem = await catalogRepository.create({
        sku: 'OIL-TEST-001',
        name: 'Test Oil 4L',
        itemType: 'LUBRICANT',
        category: 'LUBRICANTS',
        uom: 'CAN',
        buyingCostRs: 6000,
        sellingPriceRs: 10000,
        stockQty: 50,
      });

      await posSaleRepository.create({
        shiftId: shift.id,
        cashierId: 'cashier-02',
        cashierName: 'Nimal Silva',
        paymentMethod: 'CASH',
        amountTenderedRs: 20000,
        items: [
          {
            catalogItemId: testItem.id,
            sku: testItem.sku,
            description: testItem.name,
            category: testItem.category,
            unitSellingPriceRs: 10000,
            unitBuyingCostRs: 6000,
            qty: 2,
            lineDiscountRs: 0,
          },
        ],
      });

      // 3. Create Daily Shop Operating Expense: Rs. 15,000
      await financeRepository.createExpense({
        date: '2026-11-03',
        category: 'RENT',
        description: 'Daily Workshop Facility Allocation',
        amountRs: 15000,
        paidFrom: 'MAIN_CASH',
      });

      // 4. Query Unified Profit Ledger Summary
      const summary = await financeRepository.getProfitLedgerSummary({ range: 'ALL_TIME' });

      // Invariant 1: Combined Net Sales = Workshop Revenue + POS Revenue
      expect(summary.totalNetSalesRs).toBe(
        summary.workshopTotalRevenueRs + summary.posSalesRevenueRs
      );

      // Invariant 2: Combined Direct Cost = Workshop Direct Cost + POS Direct Cost
      expect(summary.totalDirectCostRs).toBe(
        summary.workshopTotalCostRs + summary.posBuyingCostRs
      );

      // Invariant 3: Combined Gross Profit = Total Net Sales - Total Direct Cost
      expect(summary.combinedGrossProfitRs).toBe(
        summary.totalNetSalesRs - summary.totalDirectCostRs
      );

      // Invariant 4: Net Operating Profit = Combined Gross Profit - Daily Operating Expenses
      expect(summary.netOperatingProfitRs).toBe(
        summary.combinedGrossProfitRs - summary.dailyOperatingExpensesRs
      );
    });

    it('verifies Grand Total - Advance - Insurance Approved = Customer Excess Due across split billing payment collections', async () => {
      // Create job with Grand Total = 120,000, Insurance Approved = 90,000, Advance = 15,000
      const job = await workshopJobRepository.create({
        jobNumber: 'JOB-SPLIT-MATH-1',
        docStage: 'INVOICE',
        floorStatus: 'READY_FOR_DELIVERY',
        paymentStatus: 'UNPAID',
        header: {
          date: '2026-11-03',
          jobNumber: 'JOB-SPLIT-MATH-1',
          vehicleNumber: 'WP CAR-3344',
          natureOfRepair: 'Rear Crash',
          vehicleMake: 'Mazda',
          chassisNumber: 'DJ5FS-102938',
          vehicleModel: 'Demio',
          daysForCompletion: '4 Days',
          yearOfMake: '2016',
          vehicleColor: 'Soul Red',
          insuranceName: 'Ceylinco General Insurance',
          customerInfo: 'Priyantha - 071 889 9900',
        },
        lines: [
          {
            id: 'l-s1',
            rowNo: 1,
            category: 'LABOR_REPAIR',
            description: 'Rear Panel Beating',
            sellingPriceRs: 40000,
            buyingCostRs: 10000,
            assignedTechnician: 'Sunil',
            isCompleted: true,
          },
          {
            id: 'l-s2',
            rowNo: 1,
            category: 'REPLACEMENT',
            description: 'Rear Bumper & Light Set',
            sellingPriceRs: 80000,
            buyingCostRs: 50000,
            assignedTechnician: 'Stores',
            isCompleted: true,
          },
        ],
        discountRs: 0,
        taxRs: 0,
        insuranceApprovedRs: 90000,
        advancePaidRs: 15000,
      });

      // Verification:
      // Grand Total = 120,000
      // Customer Payable = 120,000 - 90,000 = 30,000
      // Customer Excess Due = Grand Total - Advance - Insurance Approved
      // = 120,000 - 15,000 - 90,000 = 15,000
      expect(job.financials.grandTotalSalesRs).toBe(120000);
      expect(job.financials.insuranceApprovedRs).toBe(90000);
      expect(job.financials.customerPayableRs).toBe(30000);
      expect(job.financials.advancePaidRs).toBe(15000);
      expect(job.financials.balanceDueRs).toBe(15000);

      // Customer settles remaining 15,000 excess via Card
      const afterCustomerPayment = await workshopJobRepository.recordPayment(job.id, {
        amountRs: 15000,
        paymentType: 'CUSTOMER_EXCESS',
        paymentMethod: 'CARD',
        referenceNumber: 'CARD-VISA-9011',
      });

      expect(afterCustomerPayment.financials.balanceDueRs).toBe(0);
      expect(afterCustomerPayment.paymentStatus).toBe('PARTIALLY_PAID'); // Still waiting for 90,000 insurance settlement

      // Insurer settles 90,000 claim payout via Bank Transfer
      const afterInsuranceSettlement = await workshopJobRepository.recordPayment(job.id, {
        amountRs: 90000,
        paymentType: 'INSURANCE_SETTLEMENT',
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: 'TXN-CEY-998822',
      });

      expect(afterInsuranceSettlement.paymentStatus).toBe('PAID');
      expect(afterInsuranceSettlement.floorStatus).toBe('COMPLETED_DELIVERED');
      expect(afterInsuranceSettlement.payments?.length).toBe(2);
    });
  });

  // ===========================================================================
  // 5. HIGH-SPEED KEYBOARD ERGONOMICS TEST
  // ===========================================================================
  describe('5. High-Speed Keyboard Ergonomics Test', () => {
    it('Enter in the last row appends a new row in WorkshopTable', () => {
      let currentItems: WorkshopLineItem[] = [
        {
          id: 'test-row-1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'First Action',
          sellingPriceRs: 5000,
          buyingCostRs: 1500,
          assignedTechnician: 'Tech 1',
          isCompleted: false,
        },
      ];

      const { rerender } = render(
        <WorkshopTable
          category="LABOR_REMOVE_REASSEMBLE"
          title="1. Labor - Remove & Reassemble"
          sectionNumber={1}
          items={currentItems}
          isCostProfitVisible={false}
          isJobCardMode={false}
          onItemsChange={(updated) => {
            currentItems = updated;
          }}
        />
      );

      const amountInput = screen.getByTestId('amount-input-test-row-1');
      expect(screen.getAllByPlaceholderText('Enter repair or replacement item description...').length).toBe(1);

      // Press Enter in the final row amount field
      fireEvent.keyDown(amountInput, { key: 'Enter', code: 'Enter' });

      // onItemsChange should have appended a new row
      expect(currentItems.length).toBe(2);

      rerender(
        <WorkshopTable
          category="LABOR_REMOVE_REASSEMBLE"
          title="1. Labor - Remove & Reassemble"
          sectionNumber={1}
          items={currentItems}
          isCostProfitVisible={false}
          isJobCardMode={false}
          onItemsChange={(updated) => {
            currentItems = updated;
          }}
        />
      );

      expect(screen.getAllByPlaceholderText('Enter repair or replacement item description...').length).toBe(2);
    });

    it('⌘K opens and focuses universal lookup in Header bar', () => {
      render(
        <MemoryRouter>
          <AuthProvider initialRole="OWNER">
            <ToastProvider>
              <Header onToggleMobile={() => {}} />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      const searchInput = screen.getByTestId('global-search-input');
      expect(document.activeElement).not.toBe(searchInput);

      // Trigger Cmd+K
      fireEvent.keyDown(window, { key: 'k', code: 'KeyK', metaKey: true });
      expect(document.activeElement).toBe(searchInput);
    });

    it('POS barcode scanning operates smoothly without focus traps', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <AuthProvider initialRole="OWNER">
              <ToastProvider>
                <PosTerminalPage />
              </ToastProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      // Barcode input is visible and free to receive focus or blur
      const barcodeInput = screen.getByTestId('pos-barcode-input');
      expect(barcodeInput).toBeInTheDocument();

      // Typing into barcode input directly works
      fireEvent.change(barcodeInput, { target: { value: 'OIL-TEST' } });
      expect(barcodeInput).toHaveValue('OIL-TEST');
      fireEvent.change(barcodeInput, { target: { value: '' } });

      // Blurring barcode input returns active focus to body
      barcodeInput.blur();
      expect(document.activeElement).not.toBe(barcodeInput);

      // Scanning via hardware scanner adds item without focus trap
      const barcodeChars = '8901234567891'.split('');
      await act(async () => {
        for (const char of barcodeChars) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        }
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('1 item');
    });
  });
});
