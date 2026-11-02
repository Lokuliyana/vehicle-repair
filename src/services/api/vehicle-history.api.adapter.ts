import { IVehicleHistoryRepository } from '@/features/workshop/repository/vehicle-history.repository.interface';
import { VehicleHistoricalRecord } from '@/features/workshop/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for VehicleHistoryRepository
 * Maps IVehicleHistoryRepository calls to NestJS `/api/v1/workshop/jobs/lookup` endpoints.
 */
export class VehicleHistoryApiAdapter implements IVehicleHistoryRepository {
  constructor(private client: ApiClient = apiClient) {}

  async lookupByPlate(plateQuery: string): Promise<VehicleHistoricalRecord[]> {
    if (!plateQuery || plateQuery.trim().length === 0) {
      return [];
    }
    const res = await this.client.get<{ records: VehicleHistoricalRecord[]; total: number }>(
      '/workshop/jobs/lookup',
      { search: plateQuery.trim() }
    );
    return res.records || [];
  }

  async getByExactPlate(plateNumber: string): Promise<VehicleHistoricalRecord | null> {
    if (!plateNumber || plateNumber.trim().length === 0) {
      return null;
    }
    try {
      return await this.client.get<VehicleHistoricalRecord>(
        `/workshop/jobs/lookup/${encodeURIComponent(plateNumber.trim())}`
      );
    } catch {
      return null;
    }
  }

  async saveRecord(record: VehicleHistoricalRecord): Promise<VehicleHistoricalRecord> {
    return this.client.post<VehicleHistoricalRecord>('/workshop/jobs/lookup', record);
  }

  async getAll(): Promise<VehicleHistoricalRecord[]> {
    const res = await this.client.get<{ records: VehicleHistoricalRecord[]; total: number }>(
      '/workshop/jobs/lookup'
    );
    return res.records || [];
  }

  async resetToDefaults(): Promise<void> {
    await this.client.post('/workshop/jobs/lookup/reset');
  }
}

export const vehicleHistoryApiAdapter = new VehicleHistoryApiAdapter();
