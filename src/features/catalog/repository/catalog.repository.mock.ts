import {
  CatalogItem,
  CatalogFilter,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
} from '../types';
import { ICatalogRepository } from './catalog.repository.interface';

const STORAGE_KEY = 'antigravity_catalog_items_v1';

export const INITIAL_CATALOG_SEED: CatalogItem[] = [
  // --- SPARE PARTS ---
  {
    id: 'cat-prt-001',
    sku: 'PRT-TOY-BMP-F',
    barcode: '8901234567801',
    itemType: 'SPAREPART',
    name: 'Front Bumper Cover (Primer Coated)',
    category: 'Body & Exterior',
    vehicleCompatibility: 'Toyota Premio / Allion NZT260 / ZRT260',
    uom: 'pcs',
    buyingCostRs: 25000,
    sellingPriceRs: 38000,
    defaultDiscountPct: 0,
    stockQty: 4,
    lowStockAlertLevel: 2,
    isActive: true,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'cat-prt-002',
    sku: 'PRT-TOY-HDL-RH',
    barcode: '8901234567802',
    itemType: 'SPAREPART',
    name: 'Headlight Assembly RH (Halogen/LED Projector)',
    category: 'Electrical & Lighting',
    vehicleCompatibility: 'Toyota Corolla Axio / Fielder NZE161',
    uom: 'pcs',
    buyingCostRs: 32000,
    sellingPriceRs: 46500,
    defaultDiscountPct: 0,
    stockQty: 2,
    lowStockAlertLevel: 2,
    isActive: true,
    createdAt: '2026-10-01T08:15:00Z',
    updatedAt: '2026-10-01T08:15:00Z',
  },
  {
    id: 'cat-prt-003',
    sku: 'PRT-HND-BP-FR',
    barcode: '8901234567803',
    itemType: 'SPAREPART',
    name: 'Brake Pads Front Ceramic Set (Akebono OEM)',
    category: 'Braking System',
    vehicleCompatibility: 'Honda Vezel RU1 / RU3 / Fit GP5',
    uom: 'sets',
    buyingCostRs: 7500,
    sellingPriceRs: 12500,
    defaultDiscountPct: 5,
    stockQty: 12,
    lowStockAlertLevel: 5,
    isActive: true,
    createdAt: '2026-10-02T09:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'cat-prt-004',
    sku: 'FLT-DEN-C110',
    barcode: '8901234567891',
    itemType: 'SPAREPART',
    name: 'Denso Oil Filter C-110',
    category: 'Filters & Service Kits',
    vehicleCompatibility: 'Toyota 1NZ-FE / 2ZR-FAE / Universal',
    uom: 'pcs',
    buyingCostRs: 1400,
    sellingPriceRs: 2200,
    defaultDiscountPct: 0,
    stockQty: 45,
    lowStockAlertLevel: 10,
    isActive: true,
    createdAt: '2026-10-02T09:30:00Z',
    updatedAt: '2026-10-02T09:30:00Z',
  },
  {
    id: 'cat-prt-005',
    sku: 'FLT-NIS-AF01',
    barcode: '8901234567805',
    itemType: 'SPAREPART',
    name: 'Engine Air Intake Filter Element',
    category: 'Filters & Service Kits',
    vehicleCompatibility: 'Nissan X-Trail T32 / Qashqai J11',
    uom: 'pcs',
    buyingCostRs: 2800,
    sellingPriceRs: 4500,
    defaultDiscountPct: 0,
    stockQty: 6,
    lowStockAlertLevel: 3,
    isActive: true,
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'cat-prt-006',
    sku: 'BAT-GSY-45AH',
    barcode: '8901234567806',
    itemType: 'SPAREPART',
    name: 'GS Yuasa 12V 45Ah Maintenance Free Battery',
    category: 'Electrical & Lighting',
    vehicleCompatibility: 'Japanese Hybrid & Subcompact Sedans',
    uom: 'pcs',
    buyingCostRs: 22000,
    sellingPriceRs: 31500,
    defaultDiscountPct: 0,
    stockQty: 3,
    lowStockAlertLevel: 3,
    isActive: true,
    createdAt: '2026-10-04T11:00:00Z',
    updatedAt: '2026-10-04T11:00:00Z',
  },
  {
    id: 'cat-prt-007',
    sku: 'PRT-UNI-WPR-2616',
    barcode: '8901234567807',
    itemType: 'SPAREPART',
    name: 'Frameless Silicone Wiper Blade Pair 26" / 16"',
    category: 'Consumables & Accessories',
    vehicleCompatibility: 'Universal Japanese Hook Slot',
    uom: 'pairs',
    buyingCostRs: 2200,
    sellingPriceRs: 4200,
    defaultDiscountPct: 0,
    stockQty: 15,
    lowStockAlertLevel: 4,
    isActive: true,
    createdAt: '2026-10-05T12:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },

  // --- LUBRICANTS & FLUIDS ---
  {
    id: 'cat-lub-001',
    sku: 'OIL-TOY-5W30',
    barcode: '8901234567890',
    itemType: 'LUBRICANT',
    name: 'Toyota Genuine Motor Oil 5W-30 SN/CF (4L)',
    category: 'Engine Oils & Lubricants',
    vehicleCompatibility: 'Toyota Vitz / Axio / Premio / Allion',
    uom: 'cans',
    buyingCostRs: 11200,
    sellingPriceRs: 14500,
    defaultDiscountPct: 0,
    stockQty: 1, // LOW STOCK TRIGGER (alert level is 5)
    lowStockAlertLevel: 5,
    isActive: true,
    createdAt: '2026-10-05T13:00:00Z',
    updatedAt: '2026-10-05T13:00:00Z',
  },
  {
    id: 'cat-lub-002',
    sku: 'OIL-MOB-0W20',
    barcode: '8901234567892',
    itemType: 'LUBRICANT',
    name: 'Mobil 1 Advanced Full Synthetic 0W-20 (4L)',
    category: 'Engine Oils & Lubricants',
    vehicleCompatibility: 'Hybrid Synergy Drive / Honda Earth Dreams',
    uom: 'cans',
    buyingCostRs: 14500,
    sellingPriceRs: 19800,
    defaultDiscountPct: 0,
    stockQty: 6,
    lowStockAlertLevel: 3,
    isActive: true,
    createdAt: '2026-10-06T14:00:00Z',
    updatedAt: '2026-10-06T14:00:00Z',
  },
  {
    id: 'cat-lub-003',
    sku: 'OIL-TOY-CVT4L',
    barcode: '8901234567893',
    itemType: 'LUBRICANT',
    name: 'Toyota Genuine CVT Fluid TC / FE (4L Tin)',
    category: 'Transmission & Gear Oils',
    vehicleCompatibility: 'Toyota K310 / K311 / K114 CVT Systems',
    uom: 'cans',
    buyingCostRs: 13000,
    sellingPriceRs: 17500,
    defaultDiscountPct: 0,
    stockQty: 4,
    lowStockAlertLevel: 2,
    isActive: true,
    createdAt: '2026-10-07T15:00:00Z',
    updatedAt: '2026-10-07T15:00:00Z',
  },
  {
    id: 'cat-lub-004',
    sku: 'LUB-CLT-GRN-4L',
    barcode: '8901234567905',
    itemType: 'LUBRICANT',
    name: 'Long Life Radiator Coolant 50/50 Pre-Mix (4L)',
    category: 'Cooling & Fluids',
    vehicleCompatibility: 'Universal Aluminum Radiator Engines',
    uom: 'cans',
    buyingCostRs: 3200,
    sellingPriceRs: 5200,
    defaultDiscountPct: 0,
    stockQty: 8,
    lowStockAlertLevel: 4,
    isActive: true,
    createdAt: '2026-10-08T16:00:00Z',
    updatedAt: '2026-10-08T16:00:00Z',
  },
  {
    id: 'cat-lub-005',
    sku: 'LUB-BF-DOT4-500',
    barcode: '8901234567894',
    itemType: 'LUBRICANT',
    name: 'DOT 4 High Performance Brake & Clutch Fluid (500ml)',
    category: 'Cooling & Fluids',
    vehicleCompatibility: 'Universal Hydraulic Disc & ABS Brakes',
    uom: 'bottles',
    buyingCostRs: 950,
    sellingPriceRs: 1650,
    defaultDiscountPct: 0,
    stockQty: 18,
    lowStockAlertLevel: 5,
    isActive: true,
    createdAt: '2026-10-09T17:00:00Z',
    updatedAt: '2026-10-09T17:00:00Z',
  },

  // --- LABOR - REMOVE & REASSEMBLE (Category 1) ---
  {
    id: 'cat-lbr-rr-001',
    sku: 'LBR-RR-BMP-FR',
    barcode: '',
    itemType: 'LABOR_REMOVE_REASSEMBLE',
    name: 'Front Bumper & Lower Grille Removal & Reassembly',
    category: 'Collision & Body Labor',
    vehicleCompatibility: 'All Passenger Sedans / Hatchbacks',
    uom: 'hours',
    buyingCostRs: 1200,
    sellingPriceRs: 4500,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'cat-lbr-rr-002',
    sku: 'LBR-RR-HDL-RH',
    barcode: '',
    itemType: 'LABOR_REMOVE_REASSEMBLE',
    name: 'Headlight Assembly RH Removal & Refit with Fog Lamp',
    category: 'Collision & Body Labor',
    vehicleCompatibility: 'All Passenger Vehicles',
    uom: 'hours',
    buyingCostRs: 800,
    sellingPriceRs: 2500,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-10T08:30:00Z',
    updatedAt: '2026-10-10T08:30:00Z',
  },
  {
    id: 'cat-lbr-rr-003',
    sku: 'LBR-RR-RAD-CD',
    barcode: '',
    itemType: 'LABOR_REMOVE_REASSEMBLE',
    name: 'Radiator & AC Condenser Assembly Dismantle & Reinstall',
    category: 'Mechanical Labor',
    vehicleCompatibility: 'Universal Front Engine Vehicles',
    uom: 'hours',
    buyingCostRs: 2500,
    sellingPriceRs: 8000,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'cat-lbr-rr-004',
    sku: 'LBR-RR-STRUT-F',
    barcode: '',
    itemType: 'LABOR_REMOVE_REASSEMBLE',
    name: 'Front Suspension Strut & Coil Spring R&R (Per Side)',
    category: 'Mechanical Labor',
    vehicleCompatibility: 'MacPherson Strut Front Suspensions',
    uom: 'hours',
    buyingCostRs: 1800,
    sellingPriceRs: 5500,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-10T09:30:00Z',
    updatedAt: '2026-10-10T09:30:00Z',
  },

  // --- LABOR - REPAIR (Category 2) ---
  {
    id: 'cat-lbr-rp-001',
    sku: 'LBR-RP-PNT-PANEL',
    barcode: '',
    itemType: 'LABOR_REPAIR',
    name: 'Single Panel 2K Acrylic Painting, Primer & Oven Bake',
    category: 'Paint & Tinkering Labor',
    vehicleCompatibility: 'Standard Exterior Metal / Plastic Panel',
    uom: 'panels',
    buyingCostRs: 4500,
    sellingPriceRs: 18000,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-11T10:00:00Z',
    updatedAt: '2026-10-11T10:00:00Z',
  },
  {
    id: 'cat-lbr-rp-002',
    sku: 'LBR-RP-TNK-FND',
    barcode: '',
    itemType: 'LABOR_REPAIR',
    name: 'Front Fender Tinkering, Dent Beating & Frame Alignment',
    category: 'Paint & Tinkering Labor',
    vehicleCompatibility: 'Accident Damaged Front Quarters',
    uom: 'hours',
    buyingCostRs: 3000,
    sellingPriceRs: 9500,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-11T10:30:00Z',
    updatedAt: '2026-10-11T10:30:00Z',
  },
  {
    id: 'cat-lbr-rp-003',
    sku: 'LBR-RP-BMP-WELD',
    barcode: '',
    itemType: 'LABOR_REPAIR',
    name: 'Plastic Bumper Thermal Crack Welding & Mounting Tab Rebuild',
    category: 'Paint & Tinkering Labor',
    vehicleCompatibility: 'Polypropylene / ABS Bumper Covers',
    uom: 'jobs',
    buyingCostRs: 2000,
    sellingPriceRs: 6500,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-11T11:00:00Z',
    updatedAt: '2026-10-11T11:00:00Z',
  },
  {
    id: 'cat-lbr-rp-004',
    sku: 'LBR-RP-DET-3STP',
    barcode: '',
    itemType: 'LABOR_REPAIR',
    name: 'Full Vehicle Body 3-Step Compound Cut & High-Gloss Mirror Polish',
    category: 'Paint & Tinkering Labor',
    vehicleCompatibility: 'Sedans, Station Wagons & SUVs',
    uom: 'jobs',
    buyingCostRs: 6000,
    sellingPriceRs: 22000,
    defaultDiscountPct: 5,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-12T12:00:00Z',
    updatedAt: '2026-10-12T12:00:00Z',
  },
  {
    id: 'cat-lbr-rp-005',
    sku: 'LBR-RP-BRK-RES',
    barcode: '',
    itemType: 'LABOR_REPAIR',
    name: 'Brake Disc Rotor Surface Skimming (On-Vehicle Pair)',
    category: 'Mechanical Labor',
    vehicleCompatibility: 'Front Ventilated Brake Rotors',
    uom: 'pairs',
    buyingCostRs: 1500,
    sellingPriceRs: 5000,
    defaultDiscountPct: 0,
    stockQty: 0,
    lowStockAlertLevel: 0,
    isActive: true,
    createdAt: '2026-10-12T12:30:00Z',
    updatedAt: '2026-10-12T12:30:00Z',
  },
];

export class MockCatalogRepository implements ICatalogRepository {
  private memoryItems: CatalogItem[] | null = null;

  private loadItems(): CatalogItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall back to seed
        }
      }
      this.saveItems(INITIAL_CATALOG_SEED);
      return [...INITIAL_CATALOG_SEED];
    }

    if (!this.memoryItems) {
      this.memoryItems = JSON.parse(JSON.stringify(INITIAL_CATALOG_SEED));
    }
    return this.memoryItems!;
  }

  private saveItems(items: CatalogItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    this.memoryItems = items;
  }

  async getAll(): Promise<CatalogItem[]> {
    return this.loadItems();
  }

  getAllSync(): CatalogItem[] {
    return this.loadItems();
  }

  async getById(id: string): Promise<CatalogItem | null> {
    const items = this.loadItems();
    return items.find((i) => i.id === id) || null;
  }

  async getBySku(sku: string): Promise<CatalogItem | null> {
    return this.getBySkuSync(sku);
  }

  getBySkuSync(sku: string): CatalogItem | null {
    if (!sku.trim()) return null;
    const items = this.loadItems();
    const cleanSku = sku.trim().toUpperCase();
    return items.find((i) => i.sku.toUpperCase() === cleanSku) || null;
  }

  async getByBarcode(barcode: string): Promise<CatalogItem | null> {
    return this.getByBarcodeSync(barcode);
  }

  getByBarcodeSync(barcode: string): CatalogItem | null {
    if (!barcode.trim()) return null;
    const items = this.loadItems();
    const clean = barcode.trim();
    return items.find((i) => i.barcode?.trim() === clean) || null;
  }

  async filter(filter: CatalogFilter): Promise<CatalogItem[]> {
    let items = this.loadItems();

    if (filter.activeOnly) {
      items = items.filter((i) => i.isActive);
    }

    if (filter.itemType && filter.itemType !== 'ALL') {
      items = items.filter((i) => i.itemType === filter.itemType);
    }

    if (filter.category && filter.category !== 'ALL') {
      items = items.filter((i) => i.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter.lowStockOnly) {
      items = items.filter(
        (i) =>
          i.isActive &&
          (i.itemType === 'SPAREPART' || i.itemType === 'LUBRICANT') &&
          i.stockQty <= i.lowStockAlertLevel
      );
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      items = items.filter((i) => {
        const matchesName = i.name.toLowerCase().includes(q);
        const matchesSku = i.sku.toLowerCase().includes(q);
        const matchesBarcode = i.barcode ? i.barcode.toLowerCase().includes(q) : false;
        const matchesCompat = i.vehicleCompatibility
          ? i.vehicleCompatibility.toLowerCase().includes(q)
          : false;
        const matchesCategory = i.category.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesBarcode || matchesCompat || matchesCategory;
      });
    }

    return items;
  }

  async create(dto: CreateCatalogItemDto): Promise<CatalogItem> {
    const items = this.loadItems();
    const cleanSku = dto.sku.trim().toUpperCase();

    const exists = items.some((i) => i.sku.toUpperCase() === cleanSku);
    if (exists) {
      throw new Error(`Catalog item with SKU "${cleanSku}" already exists.`);
    }

    const now = new Date().toISOString();
    const newItem: CatalogItem = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sku: cleanSku,
      barcode: dto.barcode?.trim() || '',
      itemType: dto.itemType,
      name: dto.name.trim(),
      category: dto.category.trim(),
      vehicleCompatibility: dto.vehicleCompatibility?.trim() || '',
      uom: dto.uom.trim() || 'pcs',
      buyingCostRs: Number(dto.buyingCostRs) || 0,
      sellingPriceRs: Number(dto.sellingPriceRs) || 0,
      defaultDiscountPct: Number(dto.defaultDiscountPct) || 0,
      stockQty: Number(dto.stockQty) || 0,
      lowStockAlertLevel: Number(dto.lowStockAlertLevel) || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  }

  async update(id: string, dto: UpdateCatalogItemDto): Promise<CatalogItem> {
    const items = this.loadItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Catalog item with id "${id}" not found.`);
    }

    if (dto.sku) {
      const cleanSku = dto.sku.trim().toUpperCase();
      const duplicate = items.some(
        (i) => i.id !== id && i.sku.toUpperCase() === cleanSku
      );
      if (duplicate) {
        throw new Error(`Catalog item with SKU "${cleanSku}" already exists.`);
      }
    }

    const current = items[index];
    const updated: CatalogItem = {
      ...current,
      sku: dto.sku !== undefined ? dto.sku.trim().toUpperCase() : current.sku,
      barcode: dto.barcode !== undefined ? dto.barcode.trim() : current.barcode,
      itemType: dto.itemType !== undefined ? dto.itemType : current.itemType,
      name: dto.name !== undefined ? dto.name.trim() : current.name,
      category: dto.category !== undefined ? dto.category.trim() : current.category,
      vehicleCompatibility:
        dto.vehicleCompatibility !== undefined
          ? dto.vehicleCompatibility.trim()
          : current.vehicleCompatibility,
      uom: dto.uom !== undefined ? dto.uom.trim() : current.uom,
      buyingCostRs:
        dto.buyingCostRs !== undefined ? Number(dto.buyingCostRs) : current.buyingCostRs,
      sellingPriceRs:
        dto.sellingPriceRs !== undefined ? Number(dto.sellingPriceRs) : current.sellingPriceRs,
      defaultDiscountPct:
        dto.defaultDiscountPct !== undefined
          ? Number(dto.defaultDiscountPct)
          : current.defaultDiscountPct,
      stockQty: dto.stockQty !== undefined ? Number(dto.stockQty) : current.stockQty,
      lowStockAlertLevel:
        dto.lowStockAlertLevel !== undefined
          ? Number(dto.lowStockAlertLevel)
          : current.lowStockAlertLevel,
      isActive: dto.isActive !== undefined ? dto.isActive : current.isActive,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this.saveItems(items);
    return updated;
  }

  async adjustStock(id: string, deltaQty: number, _reason?: string): Promise<CatalogItem> {
    const items = this.loadItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Catalog item with id "${id}" not found.`);
    }

    const current = items[index];
    if (current.itemType !== 'SPAREPART' && current.itemType !== 'LUBRICANT') {
      throw new Error('Cannot adjust stock for labor presets or non-inventory service items.');
    }
    const newQty = Math.max(0, current.stockQty + deltaQty);
    const updated: CatalogItem = {
      ...current,
      stockQty: newQty,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this.saveItems(items);
    return updated;
  }

  async toggleActive(id: string): Promise<CatalogItem> {
    const items = this.loadItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Catalog item with id "${id}" not found.`);
    }

    const current = items[index];
    const updated: CatalogItem = {
      ...current,
      isActive: !current.isActive,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this.saveItems(items);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const items = this.loadItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) {
      return false;
    }
    this.saveItems(filtered);
    return true;
  }

  async getLowStockItems(): Promise<CatalogItem[]> {
    const items = this.loadItems();
    return items.filter(
      (i) =>
        i.isActive &&
        (i.itemType === 'SPAREPART' || i.itemType === 'LUBRICANT') &&
        i.stockQty <= i.lowStockAlertLevel
    );
  }

  async resetToDefaults(): Promise<void> {
    this.saveItems(JSON.parse(JSON.stringify(INITIAL_CATALOG_SEED)));
  }
}

// Global singleton instance
export const catalogRepository = new MockCatalogRepository();
