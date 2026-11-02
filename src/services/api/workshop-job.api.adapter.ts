import { IWorkshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.interface';
import {
  WorkshopJobSheet,
  CreateWorkshopJobSheetDto,
  UpdateWorkshopJobSheetDto,
  WorkshopJobFilter,
  RecordPaymentDto,
  DocumentStage,
} from '@/features/workshop/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for WorkshopJobRepository
 * Maps IWorkshopJobRepository calls to NestJS `/api/v1/workshop/jobs` endpoints.
 */
export class WorkshopJobApiAdapter implements IWorkshopJobRepository {
  constructor(private client: ApiClient = apiClient) {}

  async getAll(): Promise<WorkshopJobSheet[]> {
    const res = await this.client.get<{ jobs: WorkshopJobSheet[]; total: number }>(
      '/workshop/jobs'
    );
    return res.jobs || [];
  }

  async getById(id: string): Promise<WorkshopJobSheet | null> {
    try {
      return await this.client.get<WorkshopJobSheet>(`/workshop/jobs/${id}`);
    } catch {
      return null;
    }
  }

  async getByJobNumber(jobNumber: string): Promise<WorkshopJobSheet | null> {
    try {
      return await this.client.get<WorkshopJobSheet>(
        `/workshop/jobs/by-number/${encodeURIComponent(jobNumber)}`
      );
    } catch {
      return null;
    }
  }

  async create(dto: CreateWorkshopJobSheetDto): Promise<WorkshopJobSheet> {
    return this.client.post<WorkshopJobSheet>('/workshop/jobs', dto);
  }

  async update(id: string, updates: UpdateWorkshopJobSheetDto): Promise<WorkshopJobSheet> {
    return this.client.put<WorkshopJobSheet>(`/workshop/jobs/${id}`, updates);
  }

  async convertStage(
    id: string,
    targetStage: DocumentStage,
    reason?: string
  ): Promise<WorkshopJobSheet> {
    return this.client.post<WorkshopJobSheet>(`/workshop/jobs/${id}/convert-stage`, {
      targetStage,
      reason,
    });
  }

  async recordPayment(id: string, paymentDto: RecordPaymentDto): Promise<WorkshopJobSheet> {
    return this.client.post<WorkshopJobSheet>(`/workshop/jobs/${id}/payments`, paymentDto);
  }

  async delete(id: string): Promise<boolean> {
    await this.client.delete(`/workshop/jobs/${id}`);
    return true;
  }

  async filter(filter: WorkshopJobFilter): Promise<WorkshopJobSheet[]> {
    const res = await this.client.get<{ jobs: WorkshopJobSheet[]; total: number }>(
      '/workshop/jobs',
      {
        search: filter.search,
        stage: filter.stage !== 'ALL' ? filter.stage : undefined,
        floorStatus: filter.status !== 'ALL' ? filter.status : undefined,
        vehicleNumber: filter.vehicleNumber,
      }
    );
    return res.jobs || [];
  }

  async getNextJobNumber(): Promise<string> {
    const res = await this.client.get<{ nextJobNumber: string }>('/workshop/jobs/next-number');
    return res.nextJobNumber;
  }

  async getNextReceiptNumber(): Promise<string> {
    const res = await this.client.get<{ nextReceiptNumber: string }>(
      '/workshop/jobs/next-receipt-number'
    );
    return res.nextReceiptNumber;
  }

  async resetToDefaults(): Promise<void> {
    await this.client.post('/workshop/jobs/reset');
  }
}

export const workshopJobApiAdapter = new WorkshopJobApiAdapter();
