import { ICatalogRepository } from '@/features/catalog/repository/catalog.repository.interface';
import {
  CatalogItem,
  CatalogFilter,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
} from '@/features/catalog/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for CatalogRepository
 * Maps ICatalogRepository calls to NestJS `/api/v1/catalog` endpoints.
 */
export class CatalogApiAdapter implements ICatalogRepository {
  constructor(private client: ApiClient = apiClient) {}

  async getAll(): Promise<CatalogItem[]> {
    const res = await this.client.get<{ items: CatalogItem[]; total: number }>('/catalog');
    return res.items || [];
  }

  async getById(id: string): Promise<CatalogItem | null> {
    try {
      return await this.client.get<CatalogItem>(`/catalog/${id}`);
    } catch {
      return null;
    }
  }

  async getBySku(sku: string): Promise<CatalogItem | null> {
    try {
      return await this.client.get<CatalogItem>(`/catalog/sku/${encodeURIComponent(sku)}`);
    } catch {
      return null;
    }
  }

  async getByBarcode(barcode: string): Promise<CatalogItem | null> {
    try {
      return await this.client.get<CatalogItem>(`/catalog/barcode/${encodeURIComponent(barcode)}`);
    } catch {
      return null;
    }
  }

  async filter(filter: CatalogFilter): Promise<CatalogItem[]> {
    const res = await this.client.get<{ items: CatalogItem[]; total: number }>('/catalog', {
      search: filter.search,
      itemType: filter.itemType,
      category: filter.category,
      lowStockOnly: filter.lowStockOnly,
      activeOnly: filter.activeOnly,
    });
    return res.items || [];
  }

  async create(dto: CreateCatalogItemDto): Promise<CatalogItem> {
    return this.client.post<CatalogItem>('/catalog', dto);
  }

  async update(id: string, dto: UpdateCatalogItemDto): Promise<CatalogItem> {
    return this.client.patch<CatalogItem>(`/catalog/${id}`, dto);
  }

  async adjustStock(id: string, deltaQty: number, reason?: string): Promise<CatalogItem> {
    return this.client.post<CatalogItem>(`/catalog/${id}/adjust-stock`, { deltaQty, reason });
  }

  async toggleActive(id: string): Promise<CatalogItem> {
    return this.client.patch<CatalogItem>(`/catalog/${id}/toggle-active`);
  }

  async delete(id: string): Promise<boolean> {
    await this.client.delete(`/catalog/${id}`);
    return true;
  }

  async getLowStockItems(): Promise<CatalogItem[]> {
    const res = await this.client.get<{ items: CatalogItem[]; total: number }>('/catalog/low-stock');
    return res.items || [];
  }

  async resetToDefaults(): Promise<void> {
    await this.client.post('/catalog/reset');
  }
}

export const catalogApiAdapter = new CatalogApiAdapter();
