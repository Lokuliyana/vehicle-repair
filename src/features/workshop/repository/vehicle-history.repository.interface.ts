import { VehicleHistoricalRecord } from '../types';

export interface IVehicleHistoryRepository {
  lookupByPlate(plateQuery: string): Promise<VehicleHistoricalRecord[]>;
  getByExactPlate(plateNumber: string): Promise<VehicleHistoricalRecord | null>;
  saveRecord(record: VehicleHistoricalRecord): Promise<VehicleHistoricalRecord>;
  getAll(): Promise<VehicleHistoricalRecord[]>;
  resetToDefaults(): Promise<void>;
}
