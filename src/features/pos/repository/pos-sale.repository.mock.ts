import {
  PosSaleTransaction,
  PosCartLine,
  CreatePosSaleDto,
  PosSaleFilter,
} from '../types';
import { IPosSaleRepository } from './pos-sale.repository.interface';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posShiftRepository } from './pos-shift.repository.mock';

const STORAGE_KEY_SALES = 'antigravity_pos_sales_v1';

export const INITIAL_POS_SALES_SEED: PosSaleTransaction[] = [
  {
    id: 'pos-sale-101',
    receiptNumber: 'POS-2026-0001',
    shiftId: 'SHIFT-2026-001',
    cashierName: 'Kamal Fonseka',
    cashierId: 'user-cashier',
    date: '2026-11-02 09:30 AM',
    customerNote: 'Walk-in Counter (WP GA-9090)',
    items: [
      {
        id: 'line-1',
        catalogItemId: 'cat-prt-004',
        barcode: '8901234567891',
        sku: 'FLT-DEN-C110',
        description: 'Denso Oil Filter C-110',
        category: 'Filters & Service Kits',
        qty: 1,
        unitSellingPriceRs: 2200,
        unitBuyingCostRs: 1400,
        lineDiscountRs: 0,
        lineTotalSalesRs: 2200,
        lineTotalCostRs: 1400,
        lineGrossProfitRs: 800,
      },
      {
        id: 'line-2',
        catalogItemId: 'cat-lub-001',
        barcode: '8901234567812',
        sku: 'LUB-TOY-5W30-4L',
        description: 'Toyota Genuine Motor Oil 5W-30 (4L)',
        category: 'Engine Oils & Fluids',
        qty: 1,
        unitSellingPriceRs: 14500,
        unitBuyingCostRs: 11200,
        lineDiscountRs: 0,
        lineTotalSalesRs: 14500,
        lineTotalCostRs: 11200,
        lineGrossProfitRs: 3300,
      },
    ],
    subtotalSalesRs: 16700,
    subtotalRs: 16700,
    overallDiscountRs: 0,
    discountRs: 0,
    netSalesRs: 16700,
    netTotalSalesRs: 16700,
    totalBuyingCostRs: 12600,
    grossProfitRs: 4100,
    grossMarginPct: 24.55,
    paymentMethod: 'CASH',
    amountTenderedRs: 20000,
    changeGivenRs: 3300,
    createdAt: '2026-11-02T04:00:00.000Z',
  },
];

export class MockPosSaleRepository implements IPosSaleRepository {
  private loadSales(): PosSaleTransaction[] {
    if (typeof window === 'undefined') {
      return INITIAL_POS_SALES_SEED;
    }
    const raw = localStorage.getItem(STORAGE_KEY_SALES);
    if (!raw) {
      this.saveSales(INITIAL_POS_SALES_SEED);
      return INITIAL_POS_SALES_SEED;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_POS_SALES_SEED;
    } catch {
      return INITIAL_POS_SALES_SEED;
    }
  }

  private saveSales(sales: PosSaleTransaction[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
    }
  }

  async getAll(): Promise<PosSaleTransaction[]> {
    return this.getAllSync();
  }

  getAllSync(): PosSaleTransaction[] {
    const sales = this.loadSales();
    return [...sales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<PosSaleTransaction | null> {
    const sales = this.loadSales();
    return sales.find((s) => s.id === id || s.receiptNumber === id) || null;
  }

  async getByShiftId(shiftId: string): Promise<PosSaleTransaction[]> {
    const sales = this.loadSales();
    return sales.filter((s) => s.shiftId === shiftId);
  }

  async filter(filter: PosSaleFilter): Promise<PosSaleTransaction[]> {
    let sales = this.loadSales();

    if (filter.shiftId) {
      sales = sales.filter((s) => s.shiftId === filter.shiftId);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      sales = sales.filter(
        (s) =>
          s.receiptNumber.toLowerCase().includes(q) ||
          s.customerNote.toLowerCase().includes(q) ||
          s.cashierName.toLowerCase().includes(q) ||
          s.items.some((it) => it.description.toLowerCase().includes(q))
      );
    }

    return sales.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getNextReceiptNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const sales = this.loadSales();
    const prefix = `POS-${currentYear}-`;

    let maxSeq = 0;
    sales.forEach((s) => {
      if (s.receiptNumber && s.receiptNumber.startsWith(prefix)) {
        const parts = s.receiptNumber.split('-');
        if (parts.length >= 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });

    const nextSeq = maxSeq + 1;
    return `POS-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  }

  async create(dto: CreatePosSaleDto): Promise<PosSaleTransaction> {
    const receiptNumber = await this.getNextReceiptNumber();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Compute line items
    let subtotalSalesRs = 0;
    let totalLineDiscountRs = 0;
    let totalBuyingCostRs = 0;

    const items: PosCartLine[] = dto.items.map((lineItem, idx) => {
      const qty = Math.max(1, lineItem.qty);
      const unitSelling = Number(lineItem.unitSellingPriceRs) || 0;
      const unitBuying = Number(lineItem.unitBuyingCostRs) || 0;
      const lineDiscount = Number(lineItem.lineDiscountRs) || 0;

      const grossLineSales = unitSelling * qty;
      const lineTotalSalesRs = Math.max(0, grossLineSales - lineDiscount);
      const lineTotalCostRs = unitBuying * qty;
      const lineGrossProfitRs = lineTotalSalesRs - lineTotalCostRs;

      subtotalSalesRs += grossLineSales;
      totalLineDiscountRs += lineDiscount;
      totalBuyingCostRs += lineTotalCostRs;

      return {
        id: `line-${Date.now()}-${idx}`,
        catalogItemId: lineItem.catalogItemId,
        barcode: lineItem.barcode,
        sku: lineItem.sku,
        description: lineItem.description,
        category: lineItem.category,
        qty,
        unitSellingPriceRs: unitSelling,
        unitBuyingCostRs: unitBuying,
        lineDiscountRs: lineDiscount,
        lineTotalSalesRs,
        lineTotalCostRs,
        lineGrossProfitRs,
      };
    });

    const overallDiscountRs = (Number(dto.overallDiscountRs) || 0) + totalLineDiscountRs;
    const netSalesRs = Math.max(0, subtotalSalesRs - overallDiscountRs);
    const grossProfitRs = netSalesRs - totalBuyingCostRs;
    const grossMarginPct =
      netSalesRs > 0 ? Number(((grossProfitRs / netSalesRs) * 100).toFixed(2)) : 0;

    const amountTenderedRs = Number(dto.amountTenderedRs) || netSalesRs;
    const changeGivenRs =
      dto.paymentMethod === 'CASH'
        ? Math.max(0, amountTenderedRs - netSalesRs)
        : dto.paymentMethod === 'SPLIT' && dto.splitDetails?.cashTenderedRs
        ? Math.max(0, dto.splitDetails.cashTenderedRs - (dto.splitDetails.cashAmountRs || 0))
        : 0;

    const transaction: PosSaleTransaction = {
      id: `pos-${Date.now()}`,
      receiptNumber,
      shiftId: dto.shiftId,
      cashierName: dto.cashierName,
      cashierId: dto.cashierId,
      date: formattedDate,
      customerNote: dto.customerNote?.trim() || 'Walk-in Counter Sale',
      items,
      subtotalSalesRs,
      subtotalRs: subtotalSalesRs,
      overallDiscountRs,
      discountRs: overallDiscountRs,
      netSalesRs,
      netTotalSalesRs: netSalesRs,
      totalBuyingCostRs,
      grossProfitRs,
      grossMarginPct,
      paymentMethod: dto.paymentMethod,
      amountTenderedRs,
      changeGivenRs,
      splitDetails: dto.splitDetails,
      createdAt: now.toISOString(),
    };

    // 1. Persist sale
    const sales = this.loadSales();
    sales.unshift(transaction);
    this.saveSales(sales);

    // 2. Stock synchronization: deduct stockQty for tracked catalog items
    for (const item of items) {
      if (item.catalogItemId) {
        try {
          await catalogRepository.adjustStock(
            item.catalogItemId,
            -item.qty,
            `POS Sale ${receiptNumber}`
          );
        } catch (err) {
          // If item is non-inventory or failed, don't crash checkout
          console.warn(`[Inventory Sync] Skipped or failed for ${item.catalogItemId}:`, err);
        }
      }
    }

    // 3. Shift ledger update
    if (dto.shiftId) {
      try {
        await posShiftRepository.recordSale(
          dto.shiftId,
          dto.paymentMethod,
          netSalesRs,
          dto.splitDetails
        );
      } catch (err) {
        console.warn(`[Shift Sync] Could not record sale to shift ${dto.shiftId}:`, err);
      }
    }

    return transaction;
  }

  async resetToDefaults(): Promise<void> {
    this.saveSales(JSON.parse(JSON.stringify(INITIAL_POS_SALES_SEED)));
  }
}

export const posSaleRepository = new MockPosSaleRepository();
