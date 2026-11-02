import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockCatalogRepository,
  INITIAL_CATALOG_SEED,
} from '@/features/catalog/repository/catalog.repository.mock';

describe('Catalog Repository Master & Math Tests', () => {
  let repo: MockCatalogRepository;

  beforeEach(async () => {
    repo = new MockCatalogRepository();
    await repo.resetToDefaults();
  });

  it('initializes with complete realistic Sri Lankan automobile seed data', async () => {
    const items = await repo.getAll();
    expect(items.length).toBe(INITIAL_CATALOG_SEED.length);
    expect(items.length).toBeGreaterThanOrEqual(15);

    // Verify key seed items exist
    const bumper = await repo.getBySku('PRT-TOY-BMP-F');
    expect(bumper).not.toBeNull();
    expect(bumper?.name).toContain('Front Bumper');
    expect(bumper?.buyingCostRs).toBe(25000);
    expect(bumper?.sellingPriceRs).toBe(38000);

    const oil = await repo.getBySku('OIL-TOY-5W30');
    expect(oil).not.toBeNull();
    expect(oil?.barcode).toBe('8901234567890');
    expect(oil?.stockQty).toBe(1); // Low stock seed item
    expect(oil?.lowStockAlertLevel).toBe(5);
  });

  it('creates new catalog item and enforces SKU uniqueness', async () => {
    const newItem = await repo.create({
      sku: 'BAT-EXD-65AH',
      itemType: 'SPAREPART',
      name: 'Exide Matrix 12V 65Ah Battery',
      category: 'Electrical & Lighting',
      vehicleCompatibility: 'Diesel Sedans / Small SUVs',
      uom: 'pcs',
      buyingCostRs: 28000,
      sellingPriceRs: 39500,
      stockQty: 5,
      lowStockAlertLevel: 2,
    });

    expect(newItem.id).toBeDefined();
    expect(newItem.sku).toBe('BAT-EXD-65AH');

    const fetched = await repo.getBySku('BAT-EXD-65AH');
    expect(fetched).not.toBeNull();
    expect(fetched?.sellingPriceRs).toBe(39500);

    // Attempt duplicate SKU
    await expect(
      repo.create({
        sku: 'BAT-EXD-65AH',
        itemType: 'SPAREPART',
        name: 'Another battery',
        category: 'Electrical',
        uom: 'pcs',
        buyingCostRs: 1000,
        sellingPriceRs: 2000,
      })
    ).rejects.toThrow(/already exists/);
  });

  it('updates catalog item details and updates timestamp', async () => {
    const bumper = await repo.getBySku('PRT-TOY-BMP-F');
    expect(bumper).not.toBeNull();

    const updated = await repo.update(bumper!.id, {
      sellingPriceRs: 42000,
      vehicleCompatibility: 'Toyota Premio NZT260 / ZRT260 facelift',
    });

    expect(updated.sellingPriceRs).toBe(42000);
    expect(updated.vehicleCompatibility).toBe('Toyota Premio NZT260 / ZRT260 facelift');

    const refetched = await repo.getById(bumper!.id);
    expect(refetched?.sellingPriceRs).toBe(42000);
  });

  it('adjusts stock safely with positive and negative deltas without negative stock', async () => {
    const filter = await repo.getBySku('FLT-DEN-C110');
    expect(filter).not.toBeNull();
    const initialQty = filter!.stockQty; // 45

    // Add 10 units (e.g. supplier delivery)
    const afterAdd = await repo.adjustStock(filter!.id, 10, 'Supplier stock delivery');
    expect(afterAdd.stockQty).toBe(initialQty + 10);

    // Deduct 20 units
    const afterDeduct = await repo.adjustStock(filter!.id, -20, 'Workshop batch consumption');
    expect(afterDeduct.stockQty).toBe(initialQty - 10);

    // Attempt deducting more than available: clamps to 0
    const afterLargeDeduct = await repo.adjustStock(filter!.id, -999, 'Inventory write-off');
    expect(afterLargeDeduct.stockQty).toBe(0);
  });

  it('toggles active/inactive status', async () => {
    const oil = await repo.getBySku('OIL-MOB-0W20');
    expect(oil?.isActive).toBe(true);

    const deactivated = await repo.toggleActive(oil!.id);
    expect(deactivated.isActive).toBe(false);

    const reactivated = await repo.toggleActive(oil!.id);
    expect(reactivated.isActive).toBe(true);
  });

  it('deletes catalog item by ID', async () => {
    const item = await repo.create({
      sku: 'TEMP-TEST-DEL',
      itemType: 'SPAREPART',
      name: 'Temporary Item',
      category: 'Consumables & Accessories',
      uom: 'pcs',
      buyingCostRs: 100,
      sellingPriceRs: 200,
    });

    const deleted = await repo.delete(item.id);
    expect(deleted).toBe(true);

    const check = await repo.getById(item.id);
    expect(check).toBeNull();
  });

  it('searches across SKU, name, barcode, and vehicle compatibility in real-time', async () => {
    // Search by SKU
    const skuResults = await repo.filter({ search: 'OIL-TOY' });
    expect(skuResults.length).toBeGreaterThanOrEqual(1);

    // Search by vehicle model
    const vezelResults = await repo.filter({ search: 'Vezel' });
    expect(vezelResults.length).toBeGreaterThanOrEqual(1);
    expect(vezelResults.some((i) => i.sku === 'PRT-HND-BP-FR')).toBe(true);

    // Search by barcode
    const barcodeResults = await repo.filter({ search: '8901234567891' });
    expect(barcodeResults.length).toBe(1);
    expect(barcodeResults[0].sku).toBe('FLT-DEN-C110');

    // Search by labor action
    const paintResults = await repo.filter({ search: 'Painting' });
    expect(paintResults.some((i) => i.sku === 'LBR-RP-PNT-PANEL')).toBe(true);
  });

  it('filters by itemType and category correctly', async () => {
    // Labor R&R filter
    const rrLabor = await repo.filter({ itemType: 'LABOR_REMOVE_REASSEMBLE' });
    expect(rrLabor.length).toBeGreaterThan(0);
    expect(rrLabor.every((i) => i.itemType === 'LABOR_REMOVE_REASSEMBLE')).toBe(true);

    // Lubricants filter
    const lubricants = await repo.filter({ itemType: 'LUBRICANT' });
    expect(lubricants.length).toBeGreaterThan(0);
    expect(lubricants.every((i) => i.itemType === 'LUBRICANT')).toBe(true);

    // Category filter
    const electrical = await repo.filter({ category: 'Electrical & Lighting' });
    expect(electrical.length).toBeGreaterThan(0);
    expect(electrical.every((i) => i.category === 'Electrical & Lighting')).toBe(true);
  });

  it('identifies and filters low-stock items accurately', async () => {
    const lowStockItems = await repo.getLowStockItems();
    expect(lowStockItems.length).toBeGreaterThanOrEqual(1);

    // Toyota 5W-30 has stockQty = 1 and lowStockAlertLevel = 5
    const oil = lowStockItems.find((i) => i.sku === 'OIL-TOY-5W30');
    expect(oil).toBeDefined();

    // Verify filter with lowStockOnly: true
    const filtered = await repo.filter({ lowStockOnly: true });
    expect(filtered.length).toBe(lowStockItems.length);
    expect(filtered.every((i) => i.stockQty <= i.lowStockAlertLevel)).toBe(true);
  });

  it('persists data across repository re-instantiation via localStorage', async () => {
    const customSku = `TEST-PERSIST-${Date.now()}`;
    await repo.create({
      sku: customSku,
      itemType: 'SPAREPART',
      name: 'Persistent Test Part',
      category: 'Consumables & Accessories',
      uom: 'pcs',
      buyingCostRs: 5000,
      sellingPriceRs: 7500,
      stockQty: 8,
      lowStockAlertLevel: 2,
    });

    // Create a new instance of repository simulating page reload
    const reloadedRepo = new MockCatalogRepository();
    const item = await reloadedRepo.getBySku(customSku);
    expect(item).not.toBeNull();
    expect(item?.name).toBe('Persistent Test Part');
    expect(item?.sellingPriceRs).toBe(7500);
  });

  it('rejects stock adjustment on labor preset operations', async () => {
    const labor = await repo.getBySku('LBR-RR-BMP-FR');
    expect(labor).not.toBeNull();
    expect(labor?.itemType).toBe('LABOR_REMOVE_REASSEMBLE');

    await expect(repo.adjustStock(labor!.id, 5, 'Invalid test')).rejects.toThrow(
      /Cannot adjust stock for labor presets/i
    );
  });

  it('provides synchronous lookup helpers for immediate UI rendering and barcode wedge', () => {
    const syncAll = repo.getAllSync();
    expect(syncAll.length).toBeGreaterThanOrEqual(15);

    const syncSku = repo.getBySkuSync('OIL-TOY-5W30');
    expect(syncSku).not.toBeNull();
    expect(syncSku?.sku).toBe('OIL-TOY-5W30');

    const syncBarcode = repo.getByBarcodeSync('8901234567891');
    expect(syncBarcode).not.toBeNull();
    expect(syncBarcode?.sku).toBe('FLT-DEN-C110');
  });

  it('excludes inactive items from low stock alerts', async () => {
    // Deactivate low-stock oil item
    const oil = await repo.getBySku('OIL-TOY-5W30');
    expect(oil).not.toBeNull();
    await repo.toggleActive(oil!.id);

    const lowStock = await repo.getLowStockItems();
    expect(lowStock.some((i) => i.sku === 'OIL-TOY-5W30')).toBe(false);

    const filtered = await repo.filter({ lowStockOnly: true });
    expect(filtered.some((i) => i.sku === 'OIL-TOY-5W30')).toBe(false);
  });
});
