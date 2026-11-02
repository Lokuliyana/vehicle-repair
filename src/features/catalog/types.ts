export type CatalogItemType =
  | 'SPAREPART'
  | 'LUBRICANT'
  | 'LABOR_REMOVE_REASSEMBLE'
  | 'LABOR_REPAIR';

export interface CatalogItem {
  id: string;
  sku: string;
  barcode?: string;
  itemType: CatalogItemType;
  name: string;
  category: string;
  vehicleCompatibility?: string;
  uom: string; // e.g. 'pcs', 'liters', 'sets', 'hours', 'cans'
  buyingCostRs: number; // Internal buying cost
  sellingPriceRs: number; // Customer price
  defaultDiscountPct: number;
  stockQty: number; // Current physical stock
  lowStockAlertLevel: number; // Threshold for low stock warning
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogFilter {
  search?: string;
  itemType?: CatalogItemType | 'ALL';
  category?: string | 'ALL';
  lowStockOnly?: boolean;
  activeOnly?: boolean;
}

export interface CreateCatalogItemDto {
  sku: string;
  barcode?: string;
  itemType: CatalogItemType;
  name: string;
  category: string;
  vehicleCompatibility?: string;
  uom: string;
  buyingCostRs: number;
  sellingPriceRs: number;
  defaultDiscountPct?: number;
  stockQty?: number;
  lowStockAlertLevel?: number;
  isActive?: boolean;
}

export interface UpdateCatalogItemDto extends Partial<CreateCatalogItemDto> {}

export interface StockAdjustmentDto {
  deltaQty: number;
  reason?: string;
}
