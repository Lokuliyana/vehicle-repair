import {
  CatalogItem,
  CatalogFilter,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
} from '../types';

export interface ICatalogRepository {
  getAll(): Promise<CatalogItem[]>;
  getAllSync?(): CatalogItem[];
  getById(id: string): Promise<CatalogItem | null>;
  getBySku(sku: string): Promise<CatalogItem | null>;
  getBySkuSync?(sku: string): CatalogItem | null;
  getByBarcode(barcode: string): Promise<CatalogItem | null>;
  getByBarcodeSync?(barcode: string): CatalogItem | null;
  filter(filter: CatalogFilter): Promise<CatalogItem[]>;
  create(dto: CreateCatalogItemDto): Promise<CatalogItem>;
  update(id: string, dto: UpdateCatalogItemDto): Promise<CatalogItem>;
  adjustStock(id: string, deltaQty: number, reason?: string): Promise<CatalogItem>;
  toggleActive(id: string): Promise<CatalogItem>;
  delete(id: string): Promise<boolean>;
  getLowStockItems(): Promise<CatalogItem[]>;
  resetToDefaults(): Promise<void>;
}
