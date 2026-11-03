import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { RepairSheetPage } from '@/features/workshop/pages/RepairSheetPage';
import { ToastProvider } from '@/components/ui/toast';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { UserRole } from '@/types';

function renderRepairSheetApp(
  initialEntries: string[] = ['/workshop/sheet/job-1'],
  role: UserRole = 'OWNER',
  initialCostMode: boolean = false
) {
  if (initialCostMode) {
    localStorage.setItem('antigravity_cost_mode_visible', 'true');
  } else {
    localStorage.setItem('antigravity_cost_mode_visible', 'false');
  }

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

describe('Unified Repair Sheet Page (Phase 4)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
  });

  it('renders exact 12-field vehicle/insurance/customer header grid matching template', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    // Row 1: Date | Job Number
    expect(screen.getByTestId('header-date')).toBeInTheDocument();
    expect(screen.getByTestId('header-job-number')).toHaveValue('JOB-2026-0042');

    // Row 2: Vehicle Number | Nature of Repair
    expect(screen.getByTestId('vehicle-lookup-input')).toHaveValue('WP CAB-4521');
    expect(screen.getByTestId('header-nature-of-repair')).toBeInTheDocument();

    // Row 3: Vehicle Make | Chassis Number
    expect(screen.getByTestId('header-vehicle-make')).toHaveValue('Toyota');
    expect(screen.getByTestId('header-chassis-number')).toHaveValue('NZE141-9034821');

    // Row 4: Vehicle Model | No of Days Completion
    expect(screen.getByTestId('header-vehicle-model')).toHaveValue('Corolla Axio');
    expect(screen.getByTestId('header-days-for-completion')).toHaveValue('4 Days');

    // Row 5: Year of Make | Vehicle Color
    expect(screen.getByTestId('header-year-of-make')).toHaveValue('2018');
    expect(screen.getByTestId('header-vehicle-color')).toHaveValue('Pearl White (070)');

    // Row 6 (Full Width): Name of Insurance
    expect(screen.getByTestId('header-insurance-name')).toHaveValue(
      'Sri Lanka Insurance Corporation (SLIC)'
    );

    // Row 7 (Full Width): Customer Information
    expect(screen.getByTestId('header-customer-info')).toHaveValue(
      'Kasun Perera - 077 889 1234 / No 45, Galle Road, Colombo 03'
    );
  });

  it('allows 100% freeform manual typing of customer & vehicle details without CRM registration (Zero-CRM)', async () => {
    renderRepairSheetApp(['/workshop/sheet'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    // Type completely new unregistered vehicle and customer
    const vehicleInput = screen.getByTestId('vehicle-lookup-input');
    fireEvent.change(vehicleInput, { target: { value: 'WP ND-5566' } });
    expect(vehicleInput).toHaveValue('WP ND-5566');

    const customerInput = screen.getByTestId('header-customer-info');
    fireEvent.change(customerInput, {
      target: { value: 'Nimal Bandara - 077 334 5566 / Colombo 07' },
    });
    expect(customerInput).toHaveValue('Nimal Bandara - 077 334 5566 / Colombo 07');

    const makeInput = screen.getByTestId('header-vehicle-make');
    fireEvent.change(makeInput, { target: { value: 'Mitsubishi' } });
    expect(makeInput).toHaveValue('Mitsubishi');
  });

  it('auto-populates header fields when selecting vehicle plate suggestion', async () => {
    renderRepairSheetApp(['/workshop/sheet'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    const vehicleInput = screen.getByTestId('vehicle-lookup-input');
    fireEvent.change(vehicleInput, { target: { value: 'CBA-1234' } });

    // Suggestion pill should appear
    await waitFor(() => {
      expect(screen.getByTestId('vehicle-suggestion-pill')).toBeInTheDocument();
    });

    // Click auto-fill suggestion
    fireEvent.click(screen.getByTestId('vehicle-populate-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('header-vehicle-make')).toHaveValue('Toyota');
      expect(screen.getByTestId('header-vehicle-model')).toHaveValue('Corolla Axio');
      expect(screen.getByTestId('header-chassis-number')).toHaveValue('NZE161-1234567');
      expect(screen.getByTestId('header-insurance-name')).toHaveValue(
        'Sri Lanka Insurance Corporation (SLIC)'
      );
      expect(screen.getByTestId('header-customer-info')).toHaveValue(
        'Nimal Perera - 077 123 4567 / No 45, Baseline Road, Colombo 09'
      );
    });
  });

  it('populates catalog presets onto line items and updates subtotals and grand total', async () => {
    renderRepairSheetApp(['/workshop/sheet'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    // Search catalog combobox using barcode/sku rapid wedge
    const comboboxInput = screen.getByTestId('catalog-combobox-input');
    fireEvent.focus(comboboxInput);
    fireEvent.change(comboboxInput, { target: { value: 'LBR-RR-BMP-FR' } });
    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 'Enter' });

    // Should appear in table and update totals
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(/Front Bumper & Lower Grille Removal/i)
      ).toBeInTheDocument();
    });

    // Check grand total (preset selling price is 4,500.00)
    expect(screen.getByTestId('grand-total-amount')).toHaveTextContent(/Rs\.\s*4,500\.00/);
  });

  it('calculates gross sales, discount, tax, grand total, insurance approved, and balance due live', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('grand-total-amount')).toHaveTextContent('Rs. 85,000.00');
    });

    // Enter discount: Rs. 5000
    const discountInput = screen.getByTestId('finance-discount-input');
    fireEvent.change(discountInput, { target: { value: '5000' } });

    // Grand total becomes 85000 - 5000 = 80000
    await waitFor(() => {
      expect(screen.getByTestId('grand-total-amount')).toHaveTextContent('Rs. 80,000.00');
    });

    // Enter tax: Rs. 2000 -> 82000
    const taxInput = screen.getByTestId('finance-tax-input');
    fireEvent.change(taxInput, { target: { value: '2000' } });

    await waitFor(() => {
      expect(screen.getByTestId('grand-total-amount')).toHaveTextContent('Rs. 82,000.00');
    });

    // Insurance Approved is 75000, Customer Payable is 82000 - 75000 = 7000
    // Advance Paid is 10000, Balance Due = 7000 - 10000 = -3000 (0 or negative)
    const balanceDueDisplay = screen.getByTestId('finance-balance-due-display');
    expect(balanceDueDisplay).toHaveTextContent(/Rs\.\s*-?3,000\.00/);
  });

  it('COST & MARGIN PRIVACY INVARIANT: displays internal profit panel only when authorized role has cost toggle ON', async () => {
    // When role is OWNER and cost mode is ON
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER', true);

    await waitFor(() => {
      expect(screen.getByTestId('cost-profit-panel')).toBeInTheDocument();
    });

    expect(screen.getByTestId('total-buying-cost-display')).toBeInTheDocument();
    expect(screen.getByTestId('gross-profit-amount')).toBeInTheDocument();
    expect(screen.getByTestId('gross-margin-pct')).toBeInTheDocument();
  });

  it('COST & MARGIN PRIVACY INVARIANT: hides internal cost panel for SERVICE_ADVISOR even if toggle was requested', async () => {
    // SERVICE_ADVISOR role
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'SERVICE_ADVISOR', true);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    // Cost profit panel must NOT be visible
    expect(screen.queryByTestId('cost-profit-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('total-buying-cost-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gross-profit-amount')).not.toBeInTheDocument();
    expect(screen.getByText(/Role lacks authorization to view internal buying costs/i)).toBeInTheDocument();
  });

  it('transitions document stage across Quotation -> Estimate -> Job Card -> Invoice without re-typing', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('ESTIMATE');
    });

    // Transition to Job Card
    const jobCardToggle = screen.getByTestId('stage-toggle-job_card');
    fireEvent.click(jobCardToggle);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('JOB_CARD');
    });

    // In Job Card mode, assigned technician input should be visible in rows
    expect(screen.getAllByPlaceholderText('Assign technician...').length).toBeGreaterThan(0);

    // Transition to Invoice
    const invoiceToggle = screen.getByTestId('stage-toggle-invoice');
    fireEvent.click(invoiceToggle);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('INVOICE');
    });

    // Retained 100% of header data
    expect(screen.getByTestId('header-job-number')).toHaveValue('JOB-2026-0042');
    expect(screen.getByTestId('vehicle-lookup-input')).toHaveValue('WP CAB-4521');
  });

  it('STRICT PRINT PRIVACY: A4 print view completely excludes buying costs and profit margins', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER', true);

    await waitFor(() => {
      expect(screen.getByTestId('print-sheet-btn')).toBeInTheDocument();
    });

    // Open print preview modal
    fireEvent.click(screen.getByTestId('print-sheet-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('a4-workshop-print-root')).toBeInTheDocument();
    });

    const printRoot = screen.getByTestId('a4-workshop-print-root');

    // Template top banner must be present
    expect(printRoot).toHaveTextContent(
      /ALL KIND OF VEHICLE, ELECTRICAL & MECHANICAL REPAIRS, SCANNING, TINKERING, ACCIDENT REPAIR & AUTO PAINT/i
    );

    // Bottom disclaimers must be present
    expect(printRoot).toHaveTextContent(/Computer generated estimate and does not carry a signature/i);
    expect(printRoot).toHaveTextContent(/T H A N K \s*Y O U/i);

    // Selling grand total is shown
    expect(printRoot).toHaveTextContent('Rs. 85,000.00');

    // INTERNAL PRIVACY: buying cost and gross profit must NOT exist in the printable DOM
    expect(printRoot).not.toHaveTextContent('49,800.00'); // total buying cost
    expect(printRoot).not.toHaveTextContent('35,200.00'); // gross profit
    expect(printRoot).not.toHaveTextContent('41.41'); // margin %
    expect(printRoot.textContent?.toLowerCase()).not.toContain('buying cost');
    expect(printRoot.textContent?.toLowerCase()).not.toContain('gross profit');
    expect(printRoot.textContent?.toLowerCase()).not.toContain('margin %');
  });

  it('allows adding custom unlisted items directly via the quick insertion combobox', async () => {
    renderRepairSheetApp(['/workshop/sheet'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    const comboboxInput = screen.getByTestId('catalog-combobox-input');
    fireEvent.focus(comboboxInput);
    fireEvent.change(comboboxInput, { target: { value: 'Custom Specialty Weld Repair' } });
    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 'Enter' });

    // Custom item should appear in the replacement table
    await waitFor(() => {
      expect(screen.getByDisplayValue('Custom Specialty Weld Repair')).toBeInTheDocument();
    });
  });

  it('DEFENSE-IN-DEPTH: WorkshopTable never renders cost or margin columns for SERVICE_ADVISOR even if cost mode was requested', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'SERVICE_ADVISOR', true);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });

    // Neither the cost panel nor any table cost input must be rendered
    expect(screen.queryByTestId('cost-profit-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cost-input-l1')).not.toBeInTheDocument();
    expect(screen.queryByText(/Buying Cost \(Rs\.\)/i)).not.toBeInTheDocument();
  });

  it('renders Sticky Bottom Executive Margin & Total Bar with live subtotals and gated metrics', async () => {
    // 1. OWNER with cost mode ON
    const { unmount } = renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER', true);

    await waitFor(() => {
      expect(screen.getByTestId('executive-margin-bottom-bar')).toBeInTheDocument();
    });

    const bottomBar = screen.getByTestId('executive-margin-bottom-bar');
    expect(bottomBar).toHaveTextContent(/Labor Subtotal/i);
    expect(bottomBar).toHaveTextContent(/Parts Subtotal/i);
    expect(bottomBar).toHaveTextContent(/Gross Total/i);

    // Cost & Profit metrics should be rendered for OWNER
    expect(screen.getByTestId('bottom-bar-total-cost')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-bar-gross-profit')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-bar-gross-margin')).toBeInTheDocument();

    unmount();

    // 2. SERVICE_ADVISOR
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'SERVICE_ADVISOR', true);

    await waitFor(() => {
      expect(screen.getByTestId('executive-margin-bottom-bar')).toBeInTheDocument();
    });

    // Subtotals present, but cost/profit metrics strictly excluded
    expect(screen.queryByTestId('bottom-bar-total-cost')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-bar-gross-profit')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-bar-gross-margin')).not.toBeInTheDocument();
  });

  it('renders Admin Cost switch for OWNER and dynamically toggles cost mode', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER', false);

    await waitFor(() => {
      expect(screen.getByTestId('admin-cost-mode-switch')).toBeInTheDocument();
    });

    // Initially cost panel is hidden
    expect(screen.queryByTestId('cost-profit-panel')).not.toBeInTheDocument();

    // Toggle ON
    const costSwitch = screen.getByTestId('admin-cost-mode-switch');
    fireEvent.click(costSwitch);

    await waitFor(() => {
      expect(screen.getByTestId('cost-profit-panel')).toBeInTheDocument();
      expect(screen.getByTestId('bottom-bar-total-cost')).toBeInTheDocument();
    });

    // Toggle OFF
    fireEvent.click(costSwitch);

    await waitFor(() => {
      expect(screen.queryByTestId('cost-profit-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bottom-bar-total-cost')).not.toBeInTheDocument();
    });
  });

  it('completely hides Admin Cost switch for SERVICE_ADVISOR and TECHNICIAN', async () => {
    // SERVICE_ADVISOR
    const { unmount } = renderRepairSheetApp(['/workshop/sheet/job-1'], 'SERVICE_ADVISOR', false);

    await waitFor(() => {
      expect(screen.getByTestId('sheet-header-grid')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('admin-cost-mode-switch')).not.toBeInTheDocument();

    unmount();

    // TECHNICIAN
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'TECHNICIAN', false);

    await waitFor(() => {
      expect(screen.getByTestId('technician-progress-panel')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('admin-cost-mode-switch')).not.toBeInTheDocument();
  });

  it('opens WhatsApp share modal when clicking WhatsApp button', async () => {
    renderRepairSheetApp(['/workshop/sheet/job-1'], 'OWNER');

    await waitFor(() => {
      expect(screen.getByTestId('whatsapp-share-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('whatsapp-share-btn'));

    await waitFor(() => {
      expect(screen.getByText('WhatsApp Summary Share')).toBeInTheDocument();
      expect(screen.getByText(/ANTIGRAVITY AUTO CARE/i)).toBeInTheDocument();
      expect(screen.getAllByText(/JOB-2026-0042/i).length).toBeGreaterThanOrEqual(2);
    });
  });
});
