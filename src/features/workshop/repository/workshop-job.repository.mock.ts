import {
  WorkshopJobSheet,
  CreateWorkshopJobSheetDto,
  UpdateWorkshopJobSheetDto,
  WorkshopJobFilter,
} from '../types';
import { IWorkshopJobRepository } from './workshop-job.repository.interface';
import { calculateWorkshopFinancials } from '@/utils/currency';
import { vehicleHistoryRepository } from './vehicle-history.repository.mock';

const STORAGE_KEY = 'antigravity_workshop_jobs_v1';

export const INITIAL_WORKSHOP_JOBS_SEED: WorkshopJobSheet[] = [
  {
    id: 'job-1',
    jobNumber: 'JOB-2026-0042',
    docStage: 'ESTIMATE',
    floorStatus: 'APPROVED_IN_PROGRESS',
    paymentStatus: 'UNPAID',
    header: {
      date: '2026-11-02',
      jobNumber: 'JOB-2026-0042',
      vehicleNumber: 'WP CAB-4521',
      natureOfRepair: 'Accident Damage Front Left Side & Bumper Replacement',
      vehicleMake: 'Toyota',
      chassisNumber: 'NZE141-9034821',
      vehicleModel: 'Corolla Axio',
      daysForCompletion: '4 Days',
      yearOfMake: '2018',
      vehicleColor: 'Pearl White (070)',
      insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
      customerInfo: 'Kasun Perera - 077 889 1234 / No 45, Galle Road, Colombo 03',
    },
    lines: [
      {
        id: 'l1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Front bumper & lower grill removal & reassembly',
        sellingPriceRs: 4500,
        buyingCostRs: 1200,
        assignedTechnician: 'Nimal Bandara',
        isCompleted: true,
      },
      {
        id: 'l2',
        rowNo: 2,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Left headlight & fog lamp assembly removal',
        sellingPriceRs: 2500,
        buyingCostRs: 600,
        assignedTechnician: 'Nimal Bandara',
        isCompleted: true,
      },
      {
        id: 'l3',
        rowNo: 1,
        category: 'LABOR_REPAIR',
        description: 'Front left fender panel beating & alignment repair',
        sellingPriceRs: 12000,
        buyingCostRs: 3000,
        assignedTechnician: 'Sunil Shantha',
        isCompleted: false,
      },
      {
        id: 'l4',
        rowNo: 2,
        category: 'LABOR_REPAIR',
        description: 'Bumper bracket correction & radiator support check',
        sellingPriceRs: 6000,
        buyingCostRs: 1500,
        assignedTechnician: 'Sunil Shantha',
        isCompleted: false,
      },
      {
        id: 'l5',
        rowNo: 1,
        category: 'REPLACEMENT',
        description: 'Toyota Axio Front Bumper Shell OEM Genuine',
        sellingPriceRs: 38000,
        buyingCostRs: 28000,
        assignedTechnician: 'Store / Lead',
        isCompleted: true,
      },
      {
        id: 'l6',
        rowNo: 2,
        category: 'REPLACEMENT',
        description: 'Left Headlight Assembly Crystal Clear Depo',
        sellingPriceRs: 22000,
        buyingCostRs: 15500,
        assignedTechnician: 'Store / Lead',
        isCompleted: true,
      },
    ],
    financials: {
      subtotalRemoveReassembleRs: 7000,
      subtotalRepairRs: 18000,
      subtotalReplacementRs: 60000,
      discountRs: 0,
      taxRs: 0,
      grandTotalSalesRs: 85000,
      totalBuyingCostRs: 49800,
      grossProfitRs: 35200,
      grossMarginPct: 41.41,
      insuranceApprovedRs: 75000,
      customerPayableRs: 10000,
      advancePaidRs: 10000,
      balanceDueRs: 0,
    },
    createdAt: '2026-11-02T08:30:00.000Z',
    updatedAt: '2026-11-02T09:15:00.000Z',
  },
  {
    id: 'job-2',
    jobNumber: 'JOB-2026-0041',
    docStage: 'JOB_CARD',
    floorStatus: 'WAITING_FOR_PARTS',
    paymentStatus: 'UNPAID',
    header: {
      date: '2026-11-01',
      jobNumber: 'JOB-2026-0041',
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
        id: 'l201',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Rear Bumper & Tail Lamp Removal',
        sellingPriceRs: 5000,
        buyingCostRs: 1500,
        assignedTechnician: 'Kamal Jayawardena',
        isCompleted: true,
      },
      {
        id: 'l202',
        rowNo: 1,
        category: 'LABOR_REPAIR',
        description: 'Rear Quarter Panel Dent Pulling & Primer',
        sellingPriceRs: 14500,
        buyingCostRs: 4000,
        assignedTechnician: 'Kamal Jayawardena',
        isCompleted: false,
      },
      {
        id: 'l203',
        rowNo: 1,
        category: 'REPLACEMENT',
        description: 'Rear Bumper Bracket LH Genuine OEM',
        sellingPriceRs: 8500,
        buyingCostRs: 6200,
        assignedTechnician: 'Store',
        isCompleted: false,
      },
    ],
    financials: {
      subtotalRemoveReassembleRs: 5000,
      subtotalRepairRs: 14500,
      subtotalReplacementRs: 8500,
      discountRs: 0,
      taxRs: 0,
      grandTotalSalesRs: 28000,
      totalBuyingCostRs: 11700,
      grossProfitRs: 16300,
      grossMarginPct: 58.21,
      insuranceApprovedRs: 20000,
      customerPayableRs: 8000,
      advancePaidRs: 0,
      balanceDueRs: 8000,
    },
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T14:30:00.000Z',
  },
  {
    id: 'job-3',
    jobNumber: 'JOB-2026-0040',
    docStage: 'INVOICE',
    floorStatus: 'READY_FOR_DELIVERY',
    paymentStatus: 'PAID',
    header: {
      date: '2026-10-31',
      jobNumber: 'JOB-2026-0040',
      vehicleNumber: 'SP CAA-8822',
      natureOfRepair: 'Running Repairs & Front Suspension Overhaul',
      vehicleMake: 'Suzuki',
      chassisNumber: 'MH34S-442211',
      vehicleModel: 'Wagon R Stingray',
      daysForCompletion: '2 Days',
      yearOfMake: '2017',
      vehicleColor: 'Pearl Black',
      insuranceName: 'Fairfirst Insurance',
      customerInfo: 'Mahesh Bandara - 071 998 8776',
    },
    lines: [
      {
        id: 'l301',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Front Struts & Lower Arm Removal & Refit',
        sellingPriceRs: 8500,
        buyingCostRs: 2500,
        assignedTechnician: 'Sunil Shantha',
        isCompleted: true,
      },
      {
        id: 'l302',
        rowNo: 1,
        category: 'LABOR_REPAIR',
        description: 'Brake Disc Skimming & Caliper Servicing',
        sellingPriceRs: 6000,
        buyingCostRs: 1500,
        assignedTechnician: 'Sunil Shantha',
        isCompleted: true,
      },
      {
        id: 'l303',
        rowNo: 1,
        category: 'REPLACEMENT',
        description: 'Front Shock Absorber Pair KYB Japan',
        sellingPriceRs: 24000,
        buyingCostRs: 17500,
        assignedTechnician: 'Store',
        isCompleted: true,
      },
      {
        id: 'l304',
        rowNo: 2,
        category: 'REPLACEMENT',
        description: 'Front Brake Pad Set Akebono Genuine',
        sellingPriceRs: 4000,
        buyingCostRs: 2600,
        assignedTechnician: 'Store',
        isCompleted: true,
      },
    ],
    financials: {
      subtotalRemoveReassembleRs: 8500,
      subtotalRepairRs: 6000,
      subtotalReplacementRs: 28000,
      discountRs: 0,
      taxRs: 0,
      grandTotalSalesRs: 42500,
      totalBuyingCostRs: 24100,
      grossProfitRs: 18400,
      grossMarginPct: 43.29,
      insuranceApprovedRs: 0,
      customerPayableRs: 42500,
      advancePaidRs: 42500,
      balanceDueRs: 0,
    },
    createdAt: '2026-10-31T09:15:00.000Z',
    updatedAt: '2026-10-31T17:45:00.000Z',
  },
  {
    id: 'job-4',
    jobNumber: 'JOB-2026-0039',
    docStage: 'QUOTATION',
    floorStatus: 'DRAFT',
    paymentStatus: 'UNPAID',
    header: {
      date: '2026-10-30',
      jobNumber: 'JOB-2026-0039',
      vehicleNumber: 'WP KQ-7612',
      natureOfRepair: 'Full Body Auto Paint & Tinkering Quotation',
      vehicleMake: 'Nissan',
      chassisNumber: 'FB15-098231',
      vehicleModel: 'Sunny FB15',
      daysForCompletion: '7 Days',
      yearOfMake: '2002',
      vehicleColor: 'Silver Metallic',
      insuranceName: 'Direct Cash Customer',
      customerInfo: 'Ruwan Chamara - 075 112 2334',
    },
    lines: [
      {
        id: 'l401',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Door beadings, lights, handles disassembly',
        sellingPriceRs: 4500,
        buyingCostRs: 1200,
        assignedTechnician: 'Unassigned',
        isCompleted: false,
      },
      {
        id: 'l402',
        rowNo: 1,
        category: 'LABOR_REPAIR',
        description: 'Body dent tinkering and surface smoothing',
        sellingPriceRs: 15000,
        buyingCostRs: 4000,
        assignedTechnician: 'Unassigned',
        isCompleted: false,
      },
    ],
    financials: {
      subtotalRemoveReassembleRs: 4500,
      subtotalRepairRs: 15000,
      subtotalReplacementRs: 0,
      discountRs: 0,
      taxRs: 0,
      grandTotalSalesRs: 19500,
      totalBuyingCostRs: 5200,
      grossProfitRs: 14300,
      grossMarginPct: 73.33,
      insuranceApprovedRs: 0,
      customerPayableRs: 19500,
      advancePaidRs: 0,
      balanceDueRs: 19500,
    },
    createdAt: '2026-10-30T11:00:00.000Z',
    updatedAt: '2026-10-30T11:45:00.000Z',
  },
  {
    id: 'job-5',
    jobNumber: 'JOB-2026-0038',
    docStage: 'QUOTATION',
    floorStatus: 'PENDING_INSURANCE_APPROVAL',
    paymentStatus: 'UNPAID',
    header: {
      date: '2026-10-28',
      jobNumber: 'JOB-2026-0038',
      vehicleNumber: 'CP CAR-8890',
      natureOfRepair: 'Front Right Collision & Headlamp Replacement',
      vehicleMake: 'Nissan',
      chassisNumber: 'T32-5544332',
      vehicleModel: 'X-Trail Hybrid',
      daysForCompletion: '5 Days',
      yearOfMake: '2019',
      vehicleColor: 'Silver Metallic',
      insuranceName: 'Allianz Insurance Lanka',
      customerInfo: 'Jagath Alwis - 076 555 4433 / Kandy Road, Peradeniya',
    },
    lines: [
      {
        id: 'l501',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Front Bumper and Right Headlight Removal',
        sellingPriceRs: 4000,
        buyingCostRs: 1000,
        assignedTechnician: 'Unassigned',
        isCompleted: false,
      },
      {
        id: 'l502',
        rowNo: 1,
        category: 'LABOR_REPAIR',
        description: 'Right Fender Panel Straightening and Paint Prep',
        sellingPriceRs: 18000,
        buyingCostRs: 5000,
        assignedTechnician: 'Unassigned',
        isCompleted: false,
      },
      {
        id: 'l503',
        rowNo: 1,
        category: 'REPLACEMENT',
        description: 'Nissan X-Trail T32 Headlamp RH LED Genuine',
        sellingPriceRs: 65000,
        buyingCostRs: 48000,
        assignedTechnician: 'Store',
        isCompleted: false,
      },
    ],
    financials: {
      subtotalRemoveReassembleRs: 4000,
      subtotalRepairRs: 18000,
      subtotalReplacementRs: 65000,
      discountRs: 0,
      taxRs: 0,
      grandTotalSalesRs: 87000,
      totalBuyingCostRs: 54000,
      grossProfitRs: 33000,
      grossMarginPct: 37.93,
      insuranceApprovedRs: 0,
      customerPayableRs: 87000,
      advancePaidRs: 0,
      balanceDueRs: 87000,
    },
    createdAt: '2026-10-28T14:20:00.000Z',
    updatedAt: '2026-10-28T15:00:00.000Z',
  },
];

export class MockWorkshopJobRepository implements IWorkshopJobRepository {
  private jobs: WorkshopJobSheet[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.jobs = parsed;
            this.isInitialized = true;
            return;
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for WorkshopJobRepository, fallback to memory', e);
    }

    this.jobs = JSON.parse(JSON.stringify(INITIAL_WORKSHOP_JOBS_SEED));
    this.saveToStorage();
    this.isInitialized = true;
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.jobs));
      }
    } catch (e) {
      console.warn('Failed to save jobs to localStorage:', e);
    }
  }

  private syncVehicleHistory(job: WorkshopJobSheet) {
    if (job.header && job.header.vehicleNumber) {
      vehicleHistoryRepository.saveRecord({
        vehicleNumber: job.header.vehicleNumber,
        vehicleMake: job.header.vehicleMake || '',
        vehicleModel: job.header.vehicleModel || '',
        yearOfMake: job.header.yearOfMake || '',
        vehicleColor: job.header.vehicleColor || '',
        chassisNumber: job.header.chassisNumber || '',
        insuranceName: job.header.insuranceName || '',
        customerInfo: job.header.customerInfo || '',
        lastJobNumber: job.jobNumber,
        lastServiceDate: job.header.date || new Date().toISOString().split('T')[0],
      });
    }
  }

  async getAll(): Promise<WorkshopJobSheet[]> {
    this.init();
    return [...this.jobs];
  }

  getAllSync(): WorkshopJobSheet[] {
    this.init();
    return [...this.jobs];
  }

  async getById(id: string): Promise<WorkshopJobSheet | null> {
    this.init();
    const found = this.jobs.find((j) => j.id === id);
    return found ? { ...found } : null;
  }

  async getByJobNumber(jobNumber: string): Promise<WorkshopJobSheet | null> {
    this.init();
    const clean = jobNumber.trim().toUpperCase();
    const found = this.jobs.find((j) => j.jobNumber.trim().toUpperCase() === clean);
    return found ? { ...found } : null;
  }

  async getNextJobNumber(): Promise<string> {
    this.init();
    const currentYear = new Date().getFullYear();
    const pattern = new RegExp(`^JOB-${currentYear}-(\\d+)$`, 'i');

    let maxSeq = 0;
    for (const job of this.jobs) {
      const match = job.jobNumber.match(pattern);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    const nextSeq = maxSeq + 1;
    return `JOB-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  }

  async create(dto: CreateWorkshopJobSheetDto): Promise<WorkshopJobSheet> {
    this.init();
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const jobNumber = dto.jobNumber || (dto.header && dto.header.jobNumber) || (await this.getNextJobNumber());
    const now = new Date().toISOString();

    const financials = calculateWorkshopFinancials(
      dto.lines || [],
      dto.discountRs || 0,
      dto.taxRs || 0,
      dto.insuranceApprovedRs || 0,
      dto.advancePaidRs || 0
    );

    const newJob: WorkshopJobSheet = {
      id,
      jobNumber,
      docStage: dto.docStage || 'QUOTATION',
      floorStatus: dto.floorStatus || 'DRAFT',
      paymentStatus: dto.paymentStatus || 'UNPAID',
      header: {
        ...dto.header,
        jobNumber,
      },
      lines: dto.lines || [],
      financials,
      originalEstimateSnapshot: dto.originalEstimateSnapshot,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.unshift(newJob);
    this.saveToStorage();
    this.syncVehicleHistory(newJob);

    return { ...newJob };
  }

  async update(id: string, updates: UpdateWorkshopJobSheetDto): Promise<WorkshopJobSheet> {
    this.init();
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index === -1) {
      throw new Error(`Job not found with id: ${id}`);
    }

    const current = this.jobs[index];
    const updatedHeader = {
      ...current.header,
      ...(updates.header || {}),
      jobNumber: updates.jobNumber || current.jobNumber,
    };

    const updatedLines = updates.lines !== undefined ? updates.lines : current.lines;

    const discountRs =
      updates.discountRs !== undefined ? updates.discountRs : current.financials.discountRs;
    const taxRs = updates.taxRs !== undefined ? updates.taxRs : current.financials.taxRs;
    const insuranceApprovedRs =
      updates.insuranceApprovedRs !== undefined
        ? updates.insuranceApprovedRs
        : current.financials.insuranceApprovedRs;
    const advancePaidRs =
      updates.advancePaidRs !== undefined
        ? updates.advancePaidRs
        : current.financials.advancePaidRs;

    const recalculatedFinancials = calculateWorkshopFinancials(
      updatedLines,
      discountRs,
      taxRs,
      insuranceApprovedRs,
      advancePaidRs
    );

    const updatedJob: WorkshopJobSheet = {
      ...current,
      jobNumber: updates.jobNumber || current.jobNumber,
      docStage: updates.docStage || current.docStage,
      floorStatus: updates.floorStatus || current.floorStatus,
      paymentStatus: updates.paymentStatus || current.paymentStatus,
      header: updatedHeader,
      lines: updatedLines,
      financials: recalculatedFinancials,
      originalEstimateSnapshot:
        updates.originalEstimateSnapshot !== undefined
          ? updates.originalEstimateSnapshot
          : current.originalEstimateSnapshot,
      updatedAt: new Date().toISOString(),
    };

    this.jobs[index] = updatedJob;
    this.saveToStorage();
    this.syncVehicleHistory(updatedJob);

    return { ...updatedJob };
  }

  async delete(id: string): Promise<boolean> {
    this.init();
    const initialLen = this.jobs.length;
    this.jobs = this.jobs.filter((j) => j.id !== id);
    if (this.jobs.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  filterSync(filter: WorkshopJobFilter): WorkshopJobSheet[] {
    this.init();
    return this.jobs.filter((job) => {
      if (filter.stage && filter.stage !== 'ALL' && job.docStage !== filter.stage) {
        return false;
      }
      if (filter.status && filter.status !== 'ALL' && job.floorStatus !== filter.status) {
        return false;
      }
      if (filter.vehicleNumber) {
        const queryNorm = filter.vehicleNumber.replace(/[\s\-_]/g, '').toUpperCase();
        const jobPlateNorm = (job.header?.vehicleNumber || '').replace(/[\s\-_]/g, '').toUpperCase();
        if (!jobPlateNorm.includes(queryNorm)) {
          return false;
        }
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        const plateMatch = (job.header?.vehicleNumber || '').toLowerCase().includes(q);
        const jobNumMatch = job.jobNumber.toLowerCase().includes(q);
        const custMatch = (job.header?.customerInfo || '').toLowerCase().includes(q);
        const insMatch = (job.header?.insuranceName || '').toLowerCase().includes(q);
        const modelMatch = (job.header?.vehicleModel || '').toLowerCase().includes(q);
        const makeMatch = (job.header?.vehicleMake || '').toLowerCase().includes(q);
        const repairMatch = (job.header?.natureOfRepair || '').toLowerCase().includes(q);
        if (
          !plateMatch &&
          !jobNumMatch &&
          !custMatch &&
          !insMatch &&
          !modelMatch &&
          !makeMatch &&
          !repairMatch
        ) {
          return false;
        }
      }
      return true;
    });
  }

  async filter(filter: WorkshopJobFilter): Promise<WorkshopJobSheet[]> {
    return this.filterSync(filter);
  }

  async resetToDefaults(): Promise<void> {
    this.jobs = JSON.parse(JSON.stringify(INITIAL_WORKSHOP_JOBS_SEED));
    this.saveToStorage();
  }
}

export const workshopJobRepository = new MockWorkshopJobRepository();
