import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { RepairSheetPage } from '@/features/workshop/pages/RepairSheetPage';
import { WorkshopJobsPage } from '@/features/workshop/pages/WorkshopJobsPage';
import { WorkshopBoardPage } from '@/features/workshop/pages/WorkshopBoardPage';
import { ToastProvider } from '@/components/ui/toast';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { UserRole } from '@/types';

function renderAppWithRoutes(
  initialEntries: string[] = ['/workshop/board'],
  role: UserRole = 'OWNER'
) {
  const testRouter = createMemoryRouter(
    [
      {
        path: '/workshop/board',
        element: <WorkshopBoardPage />,
      },
      {
        path: '/workshop/jobs',
        element: <WorkshopJobsPage />,
      },
      {
        path: '/workshop/sheet',
        element: <RepairSheetPage />,
      },
      {
        path: '/workshop/sheet/:id',
        element: <RepairSheetPage />,
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

describe('Phase 5: Job Card Conversion & Workshop Floor Board', () => {
  beforeEach(async () => {
    localStorage.clear();
    await workshopJobRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
  });

  describe('1-Click Conversion to Job Card & Immutable Snapshot Freeze', () => {
    it('provides 1-click "Convert to Job Card" action in RepairSheetPage that freezes baseline snapshot', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-1'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-job-card-btn')).toBeInTheDocument();
      });

      expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('ESTIMATE');

      // Click 1-click convert
      fireEvent.click(screen.getByTestId('convert-to-job-card-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('JOB_CARD');
      });

      // Status updated to APPROVED_IN_PROGRESS
      expect(screen.getByText(/APPROVED IN PROGRESS/i)).toBeInTheDocument();

      // Snapshot banner displayed
      const banner = screen.getByTestId('snapshot-frozen-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent(/Baseline Total:/i);
      expect(banner).toHaveTextContent(/Rs\.\s*85,000\.00/i);

      // Verify persistence in repository
      const updatedInRepo = await workshopJobRepository.getById('job-1');
      expect(updatedInRepo?.docStage).toBe('JOB_CARD');
      expect(updatedInRepo?.floorStatus).toBe('APPROVED_IN_PROGRESS');
      expect(updatedInRepo?.originalEstimateSnapshot).toBeDefined();

      const parsedSnapshot = JSON.parse(updatedInRepo!.originalEstimateSnapshot!);
      expect(parsedSnapshot.grandTotalSalesRs).toBe(85000);
      expect(parsedSnapshot.lines.length).toBe(6);

      // Audit log recorded
      expect(updatedInRepo?.auditLogs?.length).toBeGreaterThan(0);
      const conversionLog = updatedInRepo?.auditLogs?.find(
        (l) => l.action === 'STAGE_CONVERSION' && l.toState === 'JOB_CARD'
      );
      expect(conversionLog).toBeDefined();
      expect(conversionLog?.actor).toBeDefined();
    });

    it('provides 1-click "Convert to Job Card" action in WorkshopJobsPage', async () => {
      renderAppWithRoutes(['/workshop/jobs'], 'OWNER');

      // job-1 is ESTIMATE
      await waitFor(() => {
        expect(screen.getByTestId('convert-job-btn-job-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-job-btn-job-1'));

      await waitFor(async () => {
        const job1 = await workshopJobRepository.getById('job-1');
        expect(job1?.docStage).toBe('JOB_CARD');
        expect(job1?.floorStatus).toBe('APPROVED_IN_PROGRESS');
        expect(job1?.originalEstimateSnapshot).toBeDefined();
      });

      // The button should now be gone for job-1 since it is already JOB_CARD
      await waitFor(() => {
        expect(screen.queryByTestId('convert-job-btn-job-1')).not.toBeInTheDocument();
      });
    });

    it('IMMUTABLE SNAPSHOT RETENTION: preserves original estimate baseline even when supplementary items are appended', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-1'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-job-card-btn')).toBeInTheDocument();
      });

      // Convert to Job Card
      fireEvent.click(screen.getByTestId('convert-to-job-card-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('snapshot-frozen-banner')).toBeInTheDocument();
      });

      // Check snapshot in repo
      const jobBefore = await workshopJobRepository.getById('job-1');
      const initialSnapshot = jobBefore?.originalEstimateSnapshot;
      expect(initialSnapshot).toBeDefined();

      // Add a supplementary row
      const addRowBtn = screen.getByTestId('add-row-btn-REPLACEMENT');
      fireEvent.click(addRowBtn);

      // Save sheet
      fireEvent.click(screen.getByTestId('save-sheet-btn'));

      await waitFor(async () => {
        const jobAfter = await workshopJobRepository.getById('job-1');
        // Snapshot string MUST be strictly identical
        expect(jobAfter?.originalEstimateSnapshot).toBe(initialSnapshot);
      });
    });
  });

  describe('Supplementary Parts & Labor Badging', () => {
    it('automatically marks items added in Job Card mode as supplementary and renders the badge', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-1'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-job-card-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-to-job-card-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('JOB_CARD');
      });

      // Add supplementary row to Labor Repair table
      const addRowBtn = screen.getByTestId('add-row-btn-LABOR_REPAIR');
      fireEvent.click(addRowBtn);

      // Supplementary badge must appear
      await waitFor(() => {
        const badges = screen.getAllByText(/SUPPLEMENTARY/i);
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('shows [Supplementary] indicator in A4 print layout for supplementary items', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-1'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-job-card-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-to-job-card-btn'));

      // Add supplementary row
      const addRowBtn = screen.getByTestId('add-row-btn-REPLACEMENT');
      fireEvent.click(addRowBtn);

      // Open print preview
      fireEvent.click(screen.getByTestId('print-sheet-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('a4-workshop-print-root')).toBeInTheDocument();
      });

      const printRoot = screen.getByTestId('a4-workshop-print-root');
      expect(printRoot.textContent).toContain('[Supplementary]');
    });
  });

  describe('Price Redaction for Job Card View & Print', () => {
    it('completely redacts all line prices, subtotals, and buying costs in WorkshopTable when in Job Card mode', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-1'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-job-card-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-to-job-card-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('JOB_CARD');
      });

      // In Job Card mode, WorkshopTable amount inputs must NOT exist
      expect(screen.queryByTestId('amount-input-l1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cost-input-l1')).not.toBeInTheDocument();

      // Assigned tech input and completed checkboxes must exist
      expect(screen.getByTestId('tech-input-l1')).toBeInTheDocument();
      expect(screen.getByTestId('completed-check-l1')).toBeInTheDocument();
    });

    it('A4 print preview in Job Card mode suppresses all financial totals and displays signatures', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-2'], 'OWNER'); // job-2 is JOB_CARD

      await waitFor(() => {
        expect(screen.getByTestId('sheet-stage-badge')).toHaveTextContent('JOB_CARD');
      });

      fireEvent.click(screen.getByTestId('print-sheet-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('a4-workshop-print-root')).toBeInTheDocument();
      });

      const printRoot = screen.getByTestId('a4-workshop-print-root');
      expect(printRoot).toHaveTextContent('WORKSHOP JOB CARD');
      expect(printRoot).toHaveTextContent('Floor Supervisor Signature');
      expect(printRoot).toHaveTextContent('Technician Lead Signature');

      // Price figures must NOT be present in printout
      expect(printRoot).not.toHaveTextContent('Grand Total');
      expect(printRoot).not.toHaveTextContent('28,000.00');
    });

    it('TECHNICIAN ROLE PRIVACY: completely hides settlement financials on screen and shows work order summary', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-2'], 'TECHNICIAN');

      await waitFor(() => {
        expect(screen.getByTestId('technician-progress-panel')).toBeInTheDocument();
      });

      // Settlement card must NOT be present
      expect(screen.queryByTestId('grand-total-amount')).not.toBeInTheDocument();
      expect(screen.queryByTestId('total-buying-cost-display')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cost-profit-panel')).not.toBeInTheDocument();

      // Technician progress panel shows work order status and tasks
      expect(screen.getByText(/Technician Work Order Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Tasks Completion:/i)).toBeInTheDocument();
    });
  });

  describe('Workshop Floor Status Board (/workshop/board)', () => {
    it('renders all 7 operational Kanban columns and cards with vehicle specs and task progress', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('workshop-board-page')).toBeInTheDocument();
      });

      // 7 columns
      expect(screen.getByTestId('kanban-column-draft')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-pending_insurance_approval')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-approved_in_progress')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-waiting_for_parts')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-quality_check')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-ready_for_delivery')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-completed_delivered')).toBeInTheDocument();

      // Job cards rendered
      expect(screen.getByTestId('board-card-job-1')).toBeInTheDocument();
      expect(screen.getByTestId('board-card-job-2')).toBeInTheDocument();

      // Shows vehicle plate and model
      expect(screen.getByText('WP CAB-4521')).toBeInTheDocument();
      expect(screen.getByText(/Corolla Axio/i)).toBeInTheDocument();

      // Shows task completion progress
      expect(screen.getByTestId('task-progress-job-1')).toHaveTextContent(/tasks completed/i);
    });

    it('1-click advances floor status and records an audit log entry', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('status-select-job-1')).toBeInTheDocument();
      });

      // Advance job-1 from APPROVED_IN_PROGRESS to QUALITY_CHECK
      const statusSelect = screen.getByTestId('status-select-job-1');
      fireEvent.change(statusSelect, { target: { value: 'QUALITY_CHECK' } });

      await waitFor(async () => {
        const job = await workshopJobRepository.getById('job-1');
        expect(job?.floorStatus).toBe('QUALITY_CHECK');

        // Check audit log
        const statusLog = job?.auditLogs?.find(
          (l) => l.action === 'STATUS_ADVANCEMENT' && l.toState === 'QUALITY_CHECK'
        );
        expect(statusLog).toBeDefined();
        expect(statusLog?.fromState).toBe('APPROVED_IN_PROGRESS');
      });
    });

    it('toggles task completion directly on the board and updates task progress indicator', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('board-card-job-1')).toBeInTheDocument();
      });

      // Expand task checklist for job-1
      const expandBtn = screen.getByTestId('board-card-job-1').querySelector('button');
      if (expandBtn) fireEvent.click(expandBtn);

      await waitFor(() => {
        expect(screen.getByTestId('task-list-job-1')).toBeInTheDocument();
      });

      // Line l3 is currently false (not completed)
      const taskCheckL3 = screen.getByTestId('board-task-check-l3');
      expect(taskCheckL3).not.toBeChecked();

      // Check task l3
      fireEvent.click(taskCheckL3);

      await waitFor(async () => {
        const job = await workshopJobRepository.getById('job-1');
        const l3 = job?.lines.find((l) => l.id === 'l3');
        expect(l3?.isCompleted).toBe(true);

        // Check audit log for task completion
        const taskLog = job?.auditLogs?.find(
          (l) => l.action === 'TASK_COMPLETION' && l.comment?.includes('Completed')
        );
        expect(taskLog).toBeDefined();
      });
    });

    it('TECHNICIAN ROLE PRIVACY ON BOARD: hides all monetary figures on cards', async () => {
      renderAppWithRoutes(['/workshop/board'], 'TECHNICIAN');

      await waitFor(() => {
        expect(screen.getByTestId('workshop-board-page')).toBeInTheDocument();
      });

      // Check that no monetary prices appear on any card
      expect(screen.queryByText(/Rs\.\s*85,000/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Rs\.\s*42,500/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Rs\.\s*19,500/i)).not.toBeInTheDocument();

      // Task progress and plates still fully visible
      expect(screen.getByText('WP CAB-4521')).toBeInTheDocument();
      expect(screen.getByTestId('task-progress-job-1')).toBeInTheDocument();
    });

    it('opens price-redacted physical Job Card print modal from board card', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('print-jobcard-btn-job-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('print-jobcard-btn-job-1'));

      await waitFor(() => {
        expect(screen.getByTestId('a4-workshop-print-root')).toBeInTheDocument();
      });

      const printRoot = screen.getByTestId('a4-workshop-print-root');
      expect(printRoot).toHaveTextContent('WORKSHOP JOB CARD');
      expect(printRoot).not.toHaveTextContent('85,000.00'); // Price redacted
      expect(printRoot).toHaveTextContent('Floor Supervisor Signature');
    });

    it('has quick action to open full repair sheet from any board card', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('view-sheet-btn-job-1')).toBeInTheDocument();
      });

      const link = screen.getByTestId('view-sheet-btn-job-1');
      expect(link).toHaveAttribute('href', '/workshop/sheet/job-1');
    });

    it('displays monetary amounts on Kanban cards for OWNER', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('board-card-amount-job-1')).toBeInTheDocument();
      });

      expect(screen.getByTestId('board-card-amount-job-1')).toHaveTextContent(/85,000/);
      expect(screen.getByTestId('board-card-amount-job-2')).toHaveTextContent(/28,000/);
    });

    it('TECHNICIAN ROLE RESTRICTIONS: hides "+ New Repair Sheet" button on board', async () => {
      renderAppWithRoutes(['/workshop/board'], 'TECHNICIAN');

      await waitFor(() => {
        expect(screen.getByTestId('workshop-board-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('board-new-sheet-btn')).not.toBeInTheDocument();
    });

    it('TECHNICIAN ROLE RESTRICTIONS: hides stage conversion actions in RepairSheetPage and WorkshopJobsPage', async () => {
      // In RepairSheetPage
      renderAppWithRoutes(['/workshop/sheet/job-1'], 'TECHNICIAN');

      await waitFor(() => {
        expect(screen.getByTestId('repair-sheet-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('convert-to-job-card-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('stage-toggle-quotation')).not.toBeInTheDocument();
      expect(screen.queryByTestId('stage-toggle-job_card')).not.toBeInTheDocument();

      // In WorkshopJobsPage
      renderAppWithRoutes(['/workshop/jobs'], 'TECHNICIAN');

      await waitFor(() => {
        expect(screen.getByTestId('workshop-jobs-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('convert-job-btn-job-1')).not.toBeInTheDocument();
    });

    it('renders frozen snapshot banner for seeded Job Card job-2', async () => {
      renderAppWithRoutes(['/workshop/sheet/job-2'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('snapshot-frozen-banner')).toBeInTheDocument();
      });

      const banner = screen.getByTestId('snapshot-frozen-banner');
      expect(banner).toHaveTextContent(/Baseline Total:/i);
      expect(banner).toHaveTextContent(/28,000\.00/);
      expect(banner).toHaveTextContent(/3 items/);
    });

    it('handles zero line items conversion safely without division by zero', async () => {
      const emptyJob = await workshopJobRepository.create({
        jobNumber: 'JOB-2026-EMPTY',
        docStage: 'ESTIMATE',
        floorStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        header: {
          date: '2026-11-02',
          jobNumber: 'JOB-2026-EMPTY',
          vehicleNumber: 'WP EMPTY-01',
          natureOfRepair: 'General Inspection',
          vehicleMake: 'Toyota',
          chassisNumber: '',
          vehicleModel: 'Corolla',
          daysForCompletion: '1 Day',
          yearOfMake: '2020',
          vehicleColor: 'White',
          insuranceName: '',
          customerInfo: 'Test Walkin',
        },
        lines: [],
      });

      renderAppWithRoutes([`/workshop/sheet/${emptyJob.id}`], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('convert-to-job-card-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('convert-to-job-card-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('snapshot-frozen-banner')).toBeInTheDocument();
      });

      expect(screen.getByTestId('snapshot-frozen-banner')).toHaveTextContent(/0 items/);

      // Now view on board
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId(`board-card-${emptyJob.id}`)).toBeInTheDocument();
      });

      expect(screen.getByTestId(`task-progress-${emptyJob.id}`)).toHaveTextContent('0/0 tasks completed');
    });

    it('supports rapid consecutive task toggling without dropping state', async () => {
      renderAppWithRoutes(['/workshop/board'], 'OWNER');

      await waitFor(() => {
        expect(screen.getByTestId('board-card-job-1')).toBeInTheDocument();
      });

      // Expand task checklist
      const expandBtn = screen.getByTestId('board-card-job-1').querySelector('button');
      if (expandBtn) fireEvent.click(expandBtn);

      await waitFor(() => {
        expect(screen.getByTestId('task-list-job-1')).toBeInTheDocument();
      });

      const taskCheckL3 = screen.getByTestId('board-task-check-l3');
      const taskCheckL4 = screen.getByTestId('board-task-check-l4');

      expect(taskCheckL3).not.toBeChecked();
      expect(taskCheckL4).not.toBeChecked();

      // Click task l3 and then rapidly task l4
      fireEvent.click(taskCheckL3);
      fireEvent.click(taskCheckL4);

      await waitFor(async () => {
        const job = await workshopJobRepository.getById('job-1');
        const l3 = job?.lines.find((l) => l.id === 'l3');
        const l4 = job?.lines.find((l) => l.id === 'l4');
        expect(l3?.isCompleted).toBe(true);
        expect(l4?.isCompleted).toBe(true);
      });
    });
  });
});
