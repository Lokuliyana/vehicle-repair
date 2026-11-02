import { IPosSaleRepository } from '@/features/pos/repository/pos-sale.repository.interface';
import { PosSaleTransaction, CreatePosSaleDto, PosSaleFilter } from '@/features/pos/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for PosSaleRepository
 * Maps IPosSaleRepository calls to NestJS `/api/v1/pos/sales` endpoints.
 */
export class PosSaleApiAdapter implements IPosSaleRepository {
  constructor(private client: ApiClient = apiClient) {}

  async getAll(): Promise<PosSaleTransaction[]> {
    const res = await this.client.get<{ sales: PosSaleTransaction[]; total: number }>(
      '/pos/sales'
    );
    return res.sales || [];
  }

  async getById(id: string): Promise<PosSaleTransaction | null> {
    try {
      return await this.client.get<PosSaleTransaction>(`/pos/sales/${id}`);
    } catch {
      return null;
    }
  }

  async getByShiftId(shiftId: string): Promise<PosSaleTransaction[]> {
    const res = await this.client.get<{ sales: PosSaleTransaction[]; total: number }>(
      '/pos/sales',
      { shiftId }
    );
    return res.sales || [];
  }

  async filter(filter: PosSaleFilter): Promise<PosSaleTransaction[]> {
    const res = await this.client.get<{ sales: PosSaleTransaction[]; total: number }>(
      '/pos/sales',
      {
        shiftId: filter.shiftId,
        search: filter.search,
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo,
      }
    );
    return res.sales || [];
  }

  async create(dto: CreatePosSaleDto): Promise<PosSaleTransaction> {
    return this.client.post<PosSaleTransaction>('/pos/sales', dto);
  }

  async getNextReceiptNumber(): Promise<string> {
    const res = await this.client.get<{ nextReceiptNumber: string }>(
      '/pos/sales/next-receipt-number'
    );
    return res.nextReceiptNumber;
  }

  async resetToDefaults(): Promise<void> {
    await this.client.post('/pos/sales/reset');
  }
}

export const posSaleApiAdapter = new PosSaleApiAdapter();
