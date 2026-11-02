import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { WorkshopJobsPage } from '@/features/workshop/pages/WorkshopJobsPage';
import { ToastProvider } from '@/components/ui/toast';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';

function renderJobsHistoryApp(initialEntries: string[] = ['/workshop/jobs']) {
  const testRouter = createMemoryRouter(
    [
      {
        path: '/workshop/jobs',
        element: <WorkshopJobsPage />,
      },
      {
        path: '/workshop/sheet',
        element: <div data-testid="new-sheet-page">New Sheet Page</div>,
      },
      {
        path: '/workshop/sheet/:id',
        element: <div data-testid="edit-sheet-page">Edit Sheet Page</div>,
      },
    ],
    {
      initialEntries,
    }
  );

  return render(
    <ToastProvider>
      <AuthProvider initialRole="OWNER">
        <RouterProvider router={testRouter} />
      </AuthProvider>
    </ToastProvider>
  );
}

describe('Searchable Repair Jobs History Page (Phase 4)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
  });

  it('renders list of realistic collision repair jobs', () => {
    renderJobsHistoryApp();

    expect(screen.getByTestId('workshop-jobs-page')).toBeInTheDocument();
    expect(screen.getByText('JOB-2026-0042')).toBeInTheDocument();
    expect(screen.getByText('WP CAB-4521')).toBeInTheDocument();
    expect(screen.getByText(/Corolla Axio/i)).toBeInTheDocument();
    expect(screen.getByText(/Kasun Perera/i)).toBeInTheDocument();
    expect(screen.getByText('JOB-2026-0041')).toBeInTheDocument();
    expect(screen.getByText('WP CAR-1234')).toBeInTheDocument();
  });

  it('filters jobs dynamically by vehicle plate or customer name', async () => {
    renderJobsHistoryApp();

    const searchInput = screen.getByTestId('jobs-search-input');
    fireEvent.change(searchInput, { target: { value: 'CAB-4521' } });

    await waitFor(() => {
      expect(screen.getByText('JOB-2026-0042')).toBeInTheDocument();
      expect(screen.queryByText('JOB-2026-0041')).not.toBeInTheDocument();
      expect(screen.queryByText('JOB-2026-0040')).not.toBeInTheDocument();
    });

    // Clear search and search by insurance
    fireEvent.change(searchInput, { target: { value: 'Fairfirst' } });

    await waitFor(() => {
      expect(screen.getByText('JOB-2026-0040')).toBeInTheDocument();
      expect(screen.queryByText('JOB-2026-0042')).not.toBeInTheDocument();
    });
  });

  it('filters jobs by document stage tabs', async () => {
    renderJobsHistoryApp();

    // Click Quotations tab
    const quotationsTab = screen.getByTestId('stage-tab-quotation');
    fireEvent.click(quotationsTab);

    await waitFor(() => {
      expect(screen.getByText('JOB-2026-0039')).toBeInTheDocument(); // Quotation
      expect(screen.getByText('JOB-2026-0038')).toBeInTheDocument(); // Quotation
      expect(screen.queryByText('JOB-2026-0042')).not.toBeInTheDocument(); // Estimate
    });

    // Click Estimates tab
    const estimatesTab = screen.getByTestId('stage-tab-estimate');
    fireEvent.click(estimatesTab);

    await waitFor(() => {
      expect(screen.getByText('JOB-2026-0042')).toBeInTheDocument();
      expect(screen.queryByText('JOB-2026-0039')).not.toBeInTheDocument();
    });
  });

  it('filters jobs by floor status dropdown', async () => {
    renderJobsHistoryApp();

    const statusSelect = screen.getByTestId('jobs-status-select');
    fireEvent.change(statusSelect, { target: { value: 'WAITING_FOR_PARTS' } });

    await waitFor(() => {
      expect(screen.getByText('JOB-2026-0041')).toBeInTheDocument();
      expect(screen.queryByText('JOB-2026-0042')).not.toBeInTheDocument();
    });
  });

  it('opens A4 print modal directly from jobs list', async () => {
    renderJobsHistoryApp();

    const printBtn = screen.getByTestId('print-job-btn-job-1');
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByTestId('a4-workshop-print-root')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/JOB-2026-0042/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WP CAB-4521/i).length).toBeGreaterThan(0);
  });

  it('triggers WhatsApp share link generation from jobs list', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderJobsHistoryApp();

    const waBtn = screen.getByTestId('whatsapp-job-btn-job-1');
    fireEvent.click(waBtn);

    expect(openSpy).toHaveBeenCalled();
    const calledUrl = openSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://wa.me/');
    expect(calledUrl).toContain('JOB-2026-0042');

    openSpy.mockRestore();
  });

  it('has "+ New Repair Sheet" button linking to /workshop/sheet', () => {
    renderJobsHistoryApp();

    const createBtn = screen.getByTestId('create-new-sheet-btn');
    expect(createBtn).toBeInTheDocument();
    expect(createBtn.closest('a')).toHaveAttribute('href', '/workshop/sheet');
  });
});
