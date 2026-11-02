import { describe, it, expect, beforeEach } from 'vitest';
import { MockWorkshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { vehicleHistoryRepository } from '@/features/workshop/repository/vehicle-history.repository.mock';
import { CreateWorkshopJobSheetDto } from '@/types';

describe('WorkshopJobRepository & Domain Layer (Phase 4)', () => {
  let repo: MockWorkshopJobRepository;

  beforeEach(async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    repo = new MockWorkshopJobRepository();
    await repo.resetToDefaults();
  });

  it('loads realistic initial collision seeds properly', async () => {
    const jobs = await repo.getAll();
    expect(jobs.length).toBeGreaterThanOrEqual(5);

    const axioJob = await repo.getByJobNumber('JOB-2026-0042');
    expect(axioJob).not.toBeNull();
    expect(axioJob?.header.vehicleNumber).toBe('WP CAB-4521');
    expect(axioJob?.header.vehicleMake).toBe('Toyota');
    expect(axioJob?.header.vehicleModel).toBe('Corolla Axio');
    expect(axioJob?.docStage).toBe('ESTIMATE');
    expect(axioJob?.floorStatus).toBe('APPROVED_IN_PROGRESS');
    expect(axioJob?.financials.grandTotalSalesRs).toBe(85000);
  });

  it('generates sequential job numbering for new jobs', async () => {
    const nextJobNo = await repo.getNextJobNumber();
    const currentYear = new Date().getFullYear();
    expect(nextJobNo).toMatch(new RegExp(`^JOB-${currentYear}-\\d{4}$`));
    // Since seed max is JOB-2026-0042, next should be JOB-2026-0043
    expect(nextJobNo).toBe(`JOB-${currentYear}-0043`);
  });

  it('creates a new repair sheet and recalculates financials accurately', async () => {
    const newDto: CreateWorkshopJobSheetDto = {
      docStage: 'QUOTATION',
      floorStatus: 'DRAFT',
      paymentStatus: 'UNPAID',
      header: {
        date: '2026-11-02',
        jobNumber: '',
        vehicleNumber: 'WP KY-8899',
        natureOfRepair: 'Rear collision repair',
        vehicleMake: 'Mazda',
        chassisNumber: 'DJ5FS-100234',
        vehicleModel: 'Demio',
        daysForCompletion: '3 Days',
        yearOfMake: '2016',
        vehicleColor: 'Soul Red',
        insuranceName: 'Allianz Insurance',
        customerInfo: 'Sunil Weerasinghe - 071 555 1234',
      },
      lines: [
        {
          id: 'l1',
          rowNo: 1,
          category: 'LABOR_REMOVE_REASSEMBLE',
          description: 'Rear bumper disassembly',
          sellingPriceRs: 5000,
          buyingCostRs: 1200,
          assignedTechnician: 'Tech A',
          isCompleted: false,
        },
        {
          id: 'l2',
          rowNo: 1,
          category: 'LABOR_REPAIR',
          description: 'Tail panel beating',
          sellingPriceRs: 10000,
          buyingCostRs: 2500,
          assignedTechnician: 'Tech B',
          isCompleted: false,
        },
        {
          id: 'l3',
          rowNo: 1,
          category: 'REPLACEMENT',
          description: 'Rear Lamp Assy RH',
          sellingPriceRs: 25000,
          buyingCostRs: 18000,
          assignedTechnician: 'Store',
          isCompleted: false,
        },
      ],
      discountRs: 1000,
      taxRs: 500,
      insuranceApprovedRs: 30000,
      advancePaidRs: 5000,
    };

    const created = await repo.create(newDto);
    expect(created.id).toBeDefined();
    expect(created.jobNumber).toBe(`JOB-${new Date().getFullYear()}-0043`);
    expect(created.header.vehicleNumber).toBe('WP KY-8899');

    // Subtotals: 5000 + 10000 + 25000 = 40000
    // Gross: 40000 - 1000 (discount) + 500 (tax) = 39500
    expect(created.financials.subtotalRemoveReassembleRs).toBe(5000);
    expect(created.financials.subtotalRepairRs).toBe(10000);
    expect(created.financials.subtotalReplacementRs).toBe(25000);
    expect(created.financials.grandTotalSalesRs).toBe(39500);

    // Cost: 1200 + 2500 + 18000 = 21700
    expect(created.financials.totalBuyingCostRs).toBe(21700);

    // Gross profit: (40000 - 1000) - 21700 = 17300
    expect(created.financials.grossProfitRs).toBe(17300);

    // Customer excess: 39500 - 30000 = 9500
    expect(created.financials.customerPayableRs).toBe(9500);
    // Balance due: 9500 - 5000 = 4500
    expect(created.financials.balanceDueRs).toBe(4500);
  });

  it('updates an existing job sheet and syncs vehicle plate lookup history', async () => {
    const job = await repo.getByJobNumber('JOB-2026-0042');
    expect(job).not.toBeNull();

    const updated = await repo.update(job!.id, {
      header: {
        natureOfRepair: 'Updated front collision with fog lamp re-wiring',
      },
      discountRs: 5000,
    });

    expect(updated.header.natureOfRepair).toBe('Updated front collision with fog lamp re-wiring');
    expect(updated.financials.discountRs).toBe(5000);
    expect(updated.financials.grandTotalSalesRs).toBe(80000);

    // Verify vehicleHistoryRepository has updated record
    const historyMatches = await vehicleHistoryRepository.lookupByPlate('CAB-4521');
    expect(historyMatches.length).toBeGreaterThan(0);
    expect(historyMatches[0].vehicleNumber).toBe('WP CAB-4521');
    expect(historyMatches[0].lastJobNumber).toBe('JOB-2026-0042');
  });

  it('supports deletion of job sheet', async () => {
    const jobsBefore = await repo.getAll();
    const target = jobsBefore[0];

    const deleted = await repo.delete(target.id);
    expect(deleted).toBe(true);

    const jobsAfter = await repo.getAll();
    expect(jobsAfter.length).toBe(jobsBefore.length - 1);
    expect(await repo.getById(target.id)).toBeNull();
  });

  it('filters by stage, status, vehicle plate, and generic search query', async () => {
    // Stage filter
    const quotations = await repo.filter({ stage: 'QUOTATION' });
    expect(quotations.length).toBeGreaterThan(0);
    expect(quotations.every((j) => j.docStage === 'QUOTATION')).toBe(true);

    // Status filter
    const inProgress = await repo.filter({ status: 'APPROVED_IN_PROGRESS' });
    expect(inProgress.length).toBeGreaterThan(0);
    expect(inProgress.every((j) => j.floorStatus === 'APPROVED_IN_PROGRESS')).toBe(true);

    // Vehicle plate filter
    const byPlate = await repo.filter({ vehicleNumber: 'CAB4521' });
    expect(byPlate.length).toBe(1);
    expect(byPlate[0].jobNumber).toBe('JOB-2026-0042');

    // Generic search query
    const bySearch = await repo.filter({ search: 'SLIC' });
    expect(bySearch.length).toBeGreaterThan(0);
    expect(bySearch[0].header.insuranceName).toContain('SLIC');
  });

  it('persists data to localStorage and recovers across instances', async () => {
    const newDto: CreateWorkshopJobSheetDto = {
      docStage: 'ESTIMATE',
      header: {
        date: '2026-11-02',
        jobNumber: 'JOB-2026-7777',
        vehicleNumber: 'WP CAR-9999',
        natureOfRepair: 'Crash test',
        vehicleMake: 'Toyota',
        chassisNumber: 'XYZ-111',
        vehicleModel: 'Vitz',
        daysForCompletion: '2 Days',
        yearOfMake: '2015',
        vehicleColor: 'Silver',
        insuranceName: 'SLIC',
        customerInfo: 'Tester',
      },
      lines: [],
    };

    await repo.create(newDto);

    // Create a new fresh instance
    const freshRepo = new MockWorkshopJobRepository();
    const fetched = await freshRepo.getByJobNumber('JOB-2026-7777');
    expect(fetched).not.toBeNull();
    expect(fetched?.header.vehicleNumber).toBe('WP CAR-9999');
  });
});
