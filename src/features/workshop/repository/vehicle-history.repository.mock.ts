import { VehicleHistoricalRecord } from '../types';
import { IVehicleHistoryRepository } from './vehicle-history.repository.interface';

const STORAGE_KEY = 'antigravity_vehicle_history_v1';

export function normalizePlate(plate: string): string {
  if (!plate) return '';
  return plate
    .replace(/[\s\-_./\\,]/g, '')
    .replace(/ශ්‍රී|ශ්රී/g, 'SRI')
    .toUpperCase();
}

export const INITIAL_VEHICLE_HISTORY_SEED: VehicleHistoricalRecord[] = [
  {
    vehicleNumber: 'WP CBA-1234',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla Axio',
    yearOfMake: '2018',
    vehicleColor: 'Pearl White (070)',
    chassisNumber: 'NZE161-1234567',
    insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
    customerName: 'Nimal Perera',
    customerPhone: '077-1234567',
    customerAddress: 'No 45, Baseline Road, Colombo 09',
    customerInfo: 'Nimal Perera - 077 123 4567 / No 45, Baseline Road, Colombo 09',
    lastJobNumber: 'JOB-2026-0012',
    lastServiceDate: '2026-09-15',
  },
  {
    vehicleNumber: 'WP CAB-4521',
    vehicleMake: 'Honda',
    vehicleModel: 'Vezel Hybrid Z',
    yearOfMake: '2017',
    vehicleColor: 'Metallic Black',
    chassisNumber: 'RU3-9876543',
    insuranceName: 'Ceylinco General Insurance',
    customerName: 'Kasun Perera',
    customerPhone: '077-8891234',
    customerAddress: 'No 45, Galle Road, Colombo 03',
    customerInfo: 'Kasun Perera - 077 889 1234 / No 45, Galle Road, Colombo 03',
    lastJobNumber: 'JOB-2026-0042',
    lastServiceDate: '2026-10-18',
  },
  {
    vehicleNumber: 'CP CAR-8890',
    vehicleMake: 'Nissan',
    vehicleModel: 'X-Trail Hybrid',
    yearOfMake: '2019',
    vehicleColor: 'Silver Metallic',
    chassisNumber: 'T32-5544332',
    insuranceName: 'Allianz Insurance Lanka',
    customerName: 'Jagath Alwis',
    customerPhone: '076-5554433',
    customerAddress: 'Kandy Road, Peradeniya',
    customerInfo: 'Jagath Alwis - 076 555 4433 / Kandy Road, Peradeniya',
    lastJobNumber: 'JOB-2026-0035',
    lastServiceDate: '2026-08-22',
  },
  {
    vehicleNumber: 'SP KX-7722',
    vehicleMake: 'Suzuki',
    vehicleModel: 'Wagon R FX',
    yearOfMake: '2016',
    vehicleColor: 'Silky Silver',
    chassisNumber: 'MH34S-4433221',
    insuranceName: 'Fairfirst Insurance',
    customerName: 'Priyantha Kumara',
    customerPhone: '072-9988776',
    customerAddress: 'Galle Main Street',
    customerInfo: 'Priyantha Kumara - 072 998 8776 / Galle',
    lastJobNumber: 'JOB-2026-0021',
    lastServiceDate: '2026-07-04',
  },
  {
    vehicleNumber: 'WP CAD-9012',
    vehicleMake: 'Mitsubishi',
    vehicleModel: 'Outlander PHEV',
    yearOfMake: '2018',
    vehicleColor: 'Titanium Gray',
    chassisNumber: 'GG2W-0192834',
    insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
    customerName: 'Dr. Ruwan Gunawardena',
    customerPhone: '071-2233445',
    customerAddress: 'High Level Road, Maharagama',
    customerInfo: 'Dr. Ruwan Gunawardena - 071 223 3445 / Maharagama',
    lastJobNumber: 'JOB-2026-0050',
    lastServiceDate: '2026-10-29',
  },
  {
    vehicleNumber: '14-1234',
    vehicleMake: 'Toyota',
    vehicleModel: 'Land Cruiser BJ40 (Vintage 4x4)',
    yearOfMake: '1982',
    vehicleColor: 'Rustic Olive Green',
    chassisNumber: 'BJ40-019823',
    insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
    customerName: 'Gamini Dissanayake',
    customerPhone: '077-3344556',
    customerAddress: 'Kandy Road, Kurunegala',
    customerInfo: 'Gamini Dissanayake - 077 334 4556 / Kurunegala',
    lastJobNumber: 'JOB-2026-0005',
    lastServiceDate: '2026-05-10',
  },
  {
    vehicleNumber: '5 Sri 4567',
    vehicleMake: 'Austin',
    vehicleModel: 'Cambridge A60 (Classic Saloon)',
    yearOfMake: '1965',
    vehicleColor: 'Maroon & Cream',
    chassisNumber: 'A60-887766',
    insuranceName: 'Ceylinco General Insurance',
    customerName: 'Sunil Wickramasinghe',
    customerPhone: '071-7788990',
    customerAddress: 'Ward Place, Colombo 07',
    customerInfo: 'Sunil Wickramasinghe - 071 778 8990 / Colombo 07',
    lastJobNumber: 'JOB-2026-0002',
    lastServiceDate: '2026-04-12',
  },
];

export class MockVehicleHistoryRepository implements IVehicleHistoryRepository {
  private memoryRecords: VehicleHistoricalRecord[] | null = null;

  private loadRecords(): VehicleHistoricalRecord[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall back to seed
        }
      }
      this.saveRecords(INITIAL_VEHICLE_HISTORY_SEED);
      return [...INITIAL_VEHICLE_HISTORY_SEED];
    }

    if (!this.memoryRecords) {
      this.memoryRecords = JSON.parse(JSON.stringify(INITIAL_VEHICLE_HISTORY_SEED));
    }
    return this.memoryRecords!;
  }

  private saveRecords(records: VehicleHistoricalRecord[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
    this.memoryRecords = records;
  }

  async getAll(): Promise<VehicleHistoricalRecord[]> {
    return this.loadRecords();
  }

  async getByExactPlate(plateNumber: string): Promise<VehicleHistoricalRecord | null> {
    const clean = normalizePlate(plateNumber);
    if (!clean) return null;
    const records = this.loadRecords();
    return records.find((r) => normalizePlate(r.vehicleNumber) === clean) || null;
  }

  async lookupByPlate(plateQuery: string): Promise<VehicleHistoricalRecord[]> {
    const rawClean = plateQuery.trim();
    if (!rawClean || rawClean.length < 2) {
      return [];
    }

    const normalizedQuery = normalizePlate(rawClean);
    const records = this.loadRecords();

    return records.filter((r) => {
      const normalizedRecordPlate = normalizePlate(r.vehicleNumber);
      // Check full normalized match, substring match, or match without province prefix (e.g. CBA1234 in WPCBA1234)
      const matchesPlate =
        normalizedRecordPlate.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedRecordPlate);

      // Check customer name or phone
      const matchesCustomer =
        (r.customerName && r.customerName.toLowerCase().includes(rawClean.toLowerCase())) ||
        (r.customerPhone && normalizePlate(r.customerPhone).includes(normalizedQuery)) ||
        r.customerInfo.toLowerCase().includes(rawClean.toLowerCase());

      return matchesPlate || matchesCustomer;
    });
  }

  async saveRecord(record: VehicleHistoricalRecord): Promise<VehicleHistoricalRecord> {
    const records = this.loadRecords();
    const cleanNormalized = normalizePlate(record.vehicleNumber);

    const index = records.findIndex(
      (r) => normalizePlate(r.vehicleNumber) === cleanNormalized
    );

    if (index >= 0) {
      records[index] = { ...records[index], ...record };
    } else {
      records.unshift(record);
    }

    this.saveRecords(records);
    return record;
  }

  async resetToDefaults(): Promise<void> {
    this.saveRecords(JSON.parse(JSON.stringify(INITIAL_VEHICLE_HISTORY_SEED)));
  }
}

// Global singleton instance
export const vehicleHistoryRepository = new MockVehicleHistoryRepository();
