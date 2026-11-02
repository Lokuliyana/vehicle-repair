import {
  ShopExpense,
  CreateShopExpenseDto,
  UpdateShopExpenseDto,
  ShopExpenseFilter,
  DateRangeFilter,
  ProfitLedgerSummary,
  FinanceLedgerItem,
  EXPENSE_CATEGORY_LABELS,
} from '../types';
import { IFinanceRepository } from './finance.repository.interface';
import { UserProfile } from '@/types';
import { roundCurrency } from '@/utils/currency';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';

const STORAGE_KEY_EXPENSES = 'antigravity_shop_expenses_v1';

export const INITIAL_SHOP_EXPENSES_SEED: ShopExpense[] = [
  {
    id: 'exp-2026-0001',
    date: '2026-11-02',
    category: 'TEA_ALLOWANCE',
    description: 'Morning & afternoon staff tea with buns (Workshop 8 technicians)',
    amountRs: 850,
    paidFrom: 'POS_DRAWER',
    shiftId: 'SHIFT-2026-001',
    recordedBy: 'Kamal Fonseka',
    createdAt: '2026-11-02T08:45:00.000Z',
  },
  {
    id: 'exp-2026-0002',
    date: '2026-11-02',
    category: 'CONSUMABLES_PAINT',
    description: '3M 2000-grit waterproof sandpaper & masking tape pack',
    amountRs: 3400,
    paidFrom: 'POS_DRAWER',
    shiftId: 'SHIFT-2026-001',
    recordedBy: 'Kamal Fonseka',
    createdAt: '2026-11-02T10:15:00.000Z',
  },
  {
    id: 'exp-2026-0003',
    date: '2026-11-02',
    category: 'OTHER',
    description: 'Brake cleaner spray (2 cans) & workshop wiping rags',
    amountRs: 1200,
    paidFrom: 'POS_DRAWER',
    shiftId: 'SHIFT-2026-001',
    recordedBy: 'Kamal Fonseka',
    createdAt: '2026-11-02T11:30:00.000Z',
  },
  {
    id: 'exp-2026-0004',
    date: '2026-11-01',
    category: 'SUBLET_BILLS',
    description: 'Sublet radiator pressure test & tank brazing repair (Nimal Radiators)',
    amountRs: 4500,
    paidFrom: 'MAIN_CASH',
    recordedBy: 'Bandara Ratnayake',
    createdAt: '2026-11-01T14:20:00.000Z',
  },
  {
    id: 'exp-2026-0005',
    date: '2026-10-31',
    category: 'ELECTRICITY_UTILITIES',
    description: 'CEB Workshop 3-Phase commercial electricity bill (October)',
    amountRs: 24500,
    paidFrom: 'MAIN_CASH',
    recordedBy: 'Jagath Perera',
    createdAt: '2026-10-31T09:00:00.000Z',
  },
  {
    id: 'exp-2026-0006',
    date: '2026-10-28',
    category: 'RENT',
    description: 'Workshop premises lease installment advance (November)',
    amountRs: 85000,
    paidFrom: 'MAIN_CASH',
    recordedBy: 'Jagath Perera',
    createdAt: '2026-10-28T16:00:00.000Z',
  },
];

export function extractDateString(input: string | Date | undefined): string {
  if (!input) return '';
  if (input instanceof Date) {
    const year = input.getFullYear();
    const month = String(input.getMonth() + 1).padStart(2, '0');
    const day = String(input.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const str = String(input).trim();
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
}

export function isDateInFilter(
  dateInput: string | Date | undefined,
  filter?: DateRangeFilter,
  referenceNow: Date = new Date()
): boolean {
  if (!filter || filter.range === 'ALL_TIME') return true;

  const itemDateStr = extractDateString(dateInput);
  if (!itemDateStr) return false;

  const nowStr = extractDateString(referenceNow);

  switch (filter.range) {
    case 'TODAY':
      return itemDateStr === nowStr;

    case 'YESTERDAY': {
      const yesterday = new Date(referenceNow);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = extractDateString(yesterday);
      return itemDateStr === yesterdayStr;
    }

    case 'THIS_WEEK': {
      // Calculate start of week (Monday) and end of week (Sunday)
      const day = referenceNow.getDay(); // 0 is Sunday, 1 is Monday ...
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(referenceNow);
      monday.setDate(referenceNow.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const startStr = extractDateString(monday);
      const endStr = extractDateString(sunday);
      return itemDateStr >= startStr && itemDateStr <= endStr;
    }

    case 'THIS_MONTH': {
      const yearMonth = `${referenceNow.getFullYear()}-${String(
        referenceNow.getMonth() + 1
      ).padStart(2, '0')}`;
      return itemDateStr.startsWith(yearMonth);
    }

    case 'CUSTOM': {
      let matches = true;
      if (filter.startDate && itemDateStr < filter.startDate) {
        matches = false;
      }
      if (filter.endDate && itemDateStr > filter.endDate) {
        matches = false;
      }
      return matches;
    }

    default:
      return true;
  }
}

export class MockFinanceRepository implements IFinanceRepository {
  private loadExpenses(): ShopExpense[] {
    if (typeof window === 'undefined') {
      return INITIAL_SHOP_EXPENSES_SEED;
    }
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) {
      this.saveExpenses(INITIAL_SHOP_EXPENSES_SEED);
      return INITIAL_SHOP_EXPENSES_SEED;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_SHOP_EXPENSES_SEED;
    } catch {
      return INITIAL_SHOP_EXPENSES_SEED;
    }
  }

  private saveExpenses(expenses: ShopExpense[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    }
  }

  async getExpenses(filter?: ShopExpenseFilter): Promise<ShopExpense[]> {
    return this.getExpensesSync(filter);
  }

  getExpensesSync(filter?: ShopExpenseFilter): ShopExpense[] {
    let list = this.loadExpenses();

    if (filter) {
      if (filter.category && filter.category !== 'ALL') {
        list = list.filter((e) => e.category === filter.category);
      }
      if (filter.paidFrom && filter.paidFrom !== 'ALL') {
        list = list.filter((e) => e.paidFrom === filter.paidFrom);
      }
      if (filter.startDate) {
        list = list.filter((e) => e.date >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter((e) => e.date <= filter.endDate!);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q) ||
            (EXPENSE_CATEGORY_LABELS[e.category] || '').toLowerCase().includes(q) ||
            (e.recordedBy || '').toLowerCase().includes(q)
        );
      }
    }

    return [...list].sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
  }

  async getExpenseById(id: string): Promise<ShopExpense | null> {
    const list = this.loadExpenses();
    return list.find((e) => e.id === id) || null;
  }

  async createExpense(dto: CreateShopExpenseDto, user?: UserProfile): Promise<ShopExpense> {
    return this.createExpenseSync(dto, user);
  }

  createExpenseSync(dto: CreateShopExpenseDto, user?: UserProfile): ShopExpense {
    if (!dto.amountRs || dto.amountRs <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }
    if (!dto.description || !dto.description.trim()) {
      throw new Error('Expense description is required.');
    }

    const list = this.loadExpenses();
    const now = new Date();
    const year = now.getFullYear();
    const nextSeq = list.length + 1;
    const id = `exp-${year}-${String(nextSeq).padStart(4, '0')}`;

    const recorder = user?.name || dto.recordedBy || 'Workshop User';

    let shiftId = dto.shiftId;
    // Auto-link to active POS shift if paid from POS Drawer
    if (dto.paidFrom === 'POS_DRAWER') {
      const activeShift = posShiftRepository.getActiveShiftSync();
      if (activeShift) {
        shiftId = activeShift.id;
        try {
          // Record cash-out directly in the active POS shift
          posShiftRepository.recordCashOut(
            activeShift.id,
            dto.amountRs,
            `${EXPENSE_CATEGORY_LABELS[dto.category] || dto.category}: ${dto.description.trim()}`,
            recorder
          );
        } catch (err) {
          console.warn('Could not auto-record drawer cash-out:', err);
        }
      }
    }

    const newExpense: ShopExpense = {
      id,
      date: dto.date || extractDateString(now),
      category: dto.category,
      description: dto.description.trim(),
      amountRs: roundCurrency(dto.amountRs),
      paidFrom: dto.paidFrom,
      shiftId,
      recordedBy: recorder,
      createdAt: now.toISOString(),
    };

    list.unshift(newExpense);
    this.saveExpenses(list);
    return newExpense;
  }

  async updateExpense(id: string, dto: UpdateShopExpenseDto): Promise<ShopExpense> {
    const list = this.loadExpenses();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Expense with ID ${id} not found.`);
    }

    const current = list[index];
    const updated: ShopExpense = {
      ...current,
      date: dto.date !== undefined ? dto.date : current.date,
      category: dto.category !== undefined ? dto.category : current.category,
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      amountRs: dto.amountRs !== undefined ? roundCurrency(dto.amountRs) : current.amountRs,
      paidFrom: dto.paidFrom !== undefined ? dto.paidFrom : current.paidFrom,
      shiftId: dto.shiftId !== undefined ? dto.shiftId : current.shiftId,
    };

    if (updated.amountRs <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }

    list[index] = updated;
    this.saveExpenses(list);
    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.deleteExpenseSync(id);
  }

  deleteExpenseSync(id: string): boolean {
    const list = this.loadExpenses();
    const filtered = list.filter((e) => e.id !== id);
    if (filtered.length !== list.length) {
      this.saveExpenses(filtered);
      return true;
    }
    return false;
  }

  async getProfitLedgerSummary(filter?: DateRangeFilter): Promise<ProfitLedgerSummary> {
    return this.getProfitLedgerSummarySync(filter);
  }

  getProfitLedgerSummarySync(filter?: DateRangeFilter): ProfitLedgerSummary {
    const allJobs = workshopJobRepository.getAllSync();
    const allPosSales = posSaleRepository.getAllSync();
    const allExpenses = this.loadExpenses();

    // 1. Invoiced Workshop Jobs in date filter
    const invoicedJobs = allJobs.filter((job) => {
      if (job.docStage !== 'INVOICE') return false;
      return isDateInFilter(job.header?.date || job.createdAt, filter);
    });

    let workshopLaborRevenueRs = 0;
    let workshopLaborCostRs = 0;
    let workshopPartsRevenueRs = 0;
    let workshopPartsCostRs = 0;
    let workshopTotalRevenueRs = 0;
    let workshopTotalCostRs = 0;

    for (const job of invoicedJobs) {
      const netSales =
        job.financials.grandTotalSalesRs - (job.financials.taxRs || 0);
      workshopTotalRevenueRs += netSales;
      workshopTotalCostRs += job.financials.totalBuyingCostRs || 0;

      for (const line of job.lines) {
        const selling = Math.max(0, Number(line.sellingPriceRs) || 0);
        const buying = Math.max(0, Number(line.buyingCostRs) || 0);
        if (
          line.category === 'LABOR_REMOVE_REASSEMBLE' ||
          line.category === 'LABOR_REPAIR'
        ) {
          workshopLaborRevenueRs += selling;
          workshopLaborCostRs += buying;
        } else if (line.category === 'REPLACEMENT') {
          workshopPartsRevenueRs += selling;
          workshopPartsCostRs += buying;
        }
      }
    }

    workshopLaborRevenueRs = roundCurrency(workshopLaborRevenueRs);
    workshopLaborCostRs = roundCurrency(workshopLaborCostRs);
    const workshopLaborProfitRs = roundCurrency(
      workshopLaborRevenueRs - workshopLaborCostRs
    );

    workshopPartsRevenueRs = roundCurrency(workshopPartsRevenueRs);
    workshopPartsCostRs = roundCurrency(workshopPartsCostRs);
    const workshopPartsProfitRs = roundCurrency(
      workshopPartsRevenueRs - workshopPartsCostRs
    );

    workshopTotalRevenueRs = roundCurrency(workshopTotalRevenueRs);
    workshopTotalCostRs = roundCurrency(workshopTotalCostRs);
    const workshopGrossProfitRs = roundCurrency(
      workshopTotalRevenueRs - workshopTotalCostRs
    );

    // 2. POS Sales in date filter
    const posSalesInFilter = allPosSales.filter((sale) =>
      isDateInFilter(sale.date || sale.createdAt, filter)
    );

    let posSalesRevenueRs = 0;
    let posBuyingCostRs = 0;

    for (const sale of posSalesInFilter) {
      posSalesRevenueRs += sale.netSalesRs || sale.netTotalSalesRs || 0;
      posBuyingCostRs += sale.totalBuyingCostRs || 0;
    }

    posSalesRevenueRs = roundCurrency(posSalesRevenueRs);
    posBuyingCostRs = roundCurrency(posBuyingCostRs);
    const posGrossProfitRs = roundCurrency(posSalesRevenueRs - posBuyingCostRs);

    // 3. Combined Financials
    // Total Net Sales = Invoiced Workshop Sales + POS Sales
    const totalNetSalesRs = roundCurrency(workshopTotalRevenueRs + posSalesRevenueRs);
    // Total Direct Cost = Workshop Buying Costs + POS Buying Costs
    const totalDirectCostRs = roundCurrency(workshopTotalCostRs + posBuyingCostRs);
    // Combined Gross Profit = (Invoiced Workshop Sales - Workshop Buying Costs) + (POS Sales - POS Buying Costs)
    const combinedGrossProfitRs = roundCurrency(totalNetSalesRs - totalDirectCostRs);
    const grossMarginPct =
      totalNetSalesRs > 0
        ? roundCurrency((combinedGrossProfitRs / totalNetSalesRs) * 100)
        : 0;

    // 4. Daily Operating Expenses in filter
    const expensesInFilter = allExpenses.filter((exp) =>
      isDateInFilter(exp.date || exp.createdAt, filter)
    );
    let dailyOperatingExpensesRs = 0;
    for (const exp of expensesInFilter) {
      dailyOperatingExpensesRs += exp.amountRs || 0;
    }
    dailyOperatingExpensesRs = roundCurrency(dailyOperatingExpensesRs);

    // 5. Net Shop Operating Profit = Combined Gross Profit - Shop Operating Expenses
    const netOperatingProfitRs = roundCurrency(
      combinedGrossProfitRs - dailyOperatingExpensesRs
    );

    // 6. Outstanding Receivables across workshop jobs
    let pendingInsuranceClaimsRs = 0;
    let customerBalancesDueRs = 0;

    for (const job of allJobs) {
      // Insurance pending
      if (job.financials && job.financials.insuranceApprovedRs > 0) {
        const insurancePaid = (job.payments || [])
          .filter((p) => p.paymentType === 'INSURANCE_SETTLEMENT')
          .reduce((sum, p) => sum + (Number(p.amountRs) || 0), 0);
        const pending = Math.max(
          0,
          roundCurrency(job.financials.insuranceApprovedRs - insurancePaid)
        );
        pendingInsuranceClaimsRs += pending;
      }

      // Customer balance due
      if (job.financials && job.financials.balanceDueRs > 0) {
        customerBalancesDueRs += roundCurrency(job.financials.balanceDueRs);
      }
    }

    pendingInsuranceClaimsRs = roundCurrency(pendingInsuranceClaimsRs);
    customerBalancesDueRs = roundCurrency(customerBalancesDueRs);
    const totalOutstandingReceivablesRs = roundCurrency(
      pendingInsuranceClaimsRs + customerBalancesDueRs
    );

    return {
      totalNetSalesRs,
      totalDirectCostRs,
      combinedGrossProfitRs,
      grossMarginPct,
      dailyOperatingExpensesRs,
      netOperatingProfitRs,
      pendingInsuranceClaimsRs,
      customerBalancesDueRs,
      totalOutstandingReceivablesRs,
      workshopLaborRevenueRs,
      workshopLaborCostRs,
      workshopLaborProfitRs,
      workshopPartsRevenueRs,
      workshopPartsCostRs,
      workshopPartsProfitRs,
      workshopTotalRevenueRs,
      workshopTotalCostRs,
      workshopGrossProfitRs,
      posSalesRevenueRs,
      posBuyingCostRs,
      posGrossProfitRs,
    };
  }

  async getFinanceLedgerItems(
    filter?: DateRangeFilter,
    typeFilter?: string,
    search?: string
  ): Promise<FinanceLedgerItem[]> {
    return this.getFinanceLedgerItemsSync(filter, typeFilter, search);
  }

  getFinanceLedgerItemsSync(
    filter?: DateRangeFilter,
    typeFilter?: string,
    search?: string
  ): FinanceLedgerItem[] {
    const allJobs = workshopJobRepository.getAllSync();
    const allPosSales = posSaleRepository.getAllSync();
    const allExpenses = this.loadExpenses();

    const items: FinanceLedgerItem[] = [];

    // 1. Invoiced Workshop Jobs
    const invoicedJobs = allJobs.filter((j) => j.docStage === 'INVOICE');
    for (const job of invoicedJobs) {
      const dateVal = job.header?.date || job.createdAt;
      if (!isDateInFilter(dateVal, filter)) continue;

      const sales = roundCurrency(
        job.financials.grandTotalSalesRs - (job.financials.taxRs || 0)
      );
      const cost = roundCurrency(job.financials.totalBuyingCostRs || 0);
      const profit = roundCurrency(sales - cost);

      const customer = job.header?.customerInfo || 'Customer';
      const vehicle = job.header?.vehicleNumber || 'Vehicle';

      items.push({
        id: `job-${job.id}`,
        date: job.header?.date || extractDateString(job.createdAt),
        timestamp: new Date(job.createdAt || job.header?.date).getTime(),
        reference: job.jobNumber,
        type: 'WORKSHOP_INVOICE',
        categoryBadge: 'Workshop Invoice',
        entityOrPayee: `${vehicle} — ${customer}`,
        description: job.header?.natureOfRepair || 'Vehicle Repair & Service Invoice',
        salesRevenueRs: sales,
        directCostRs: cost,
        operatingExpenseRs: 0,
        netProfitContributionRs: profit,
        sourceId: job.id,
        job,
      });
    }

    // 2. POS Sales Transactions
    for (const sale of allPosSales) {
      const dateVal = sale.date || sale.createdAt;
      if (!isDateInFilter(dateVal, filter)) continue;

      const sales = roundCurrency(sale.netSalesRs || sale.netTotalSalesRs || 0);
      const cost = roundCurrency(sale.totalBuyingCostRs || 0);
      const profit = roundCurrency(sale.grossProfitRs || sales - cost);

      const itemsDesc =
        (sale.items || []).map((i) => `${i.description} (x${i.qty})`).join(', ') ||
        'Counter Spare Parts Sale';

      items.push({
        id: `pos-${sale.id}`,
        date: extractDateString(sale.date || sale.createdAt),
        timestamp: new Date(sale.createdAt || sale.date).getTime(),
        reference: sale.receiptNumber,
        type: 'POS_SALE',
        categoryBadge: 'POS Walk-in',
        entityOrPayee: sale.customerNote || 'Walk-in Counter Customer',
        description: itemsDesc,
        salesRevenueRs: sales,
        directCostRs: cost,
        operatingExpenseRs: 0,
        netProfitContributionRs: profit,
        sourceId: sale.id,
        posSale: sale,
      });
    }

    // 3. Shop Expenses
    for (const exp of allExpenses) {
      const dateVal = exp.date || exp.createdAt;
      if (!isDateInFilter(dateVal, filter)) continue;

      const amount = roundCurrency(exp.amountRs || 0);
      const payee =
        exp.paidFrom === 'POS_DRAWER'
          ? `Paid from POS Drawer ${exp.shiftId ? `(${exp.shiftId})` : ''}`
          : 'Paid from Main Cash';

      items.push({
        id: `exp-${exp.id}`,
        date: exp.date,
        timestamp: new Date(exp.createdAt || exp.date).getTime(),
        reference: exp.id,
        type: 'SHOP_EXPENSE',
        categoryBadge: EXPENSE_CATEGORY_LABELS[exp.category] || exp.category,
        entityOrPayee: `${payee} (by ${exp.recordedBy || 'Staff'})`,
        description: exp.description,
        salesRevenueRs: 0,
        directCostRs: 0,
        operatingExpenseRs: amount,
        netProfitContributionRs: -amount,
        sourceId: exp.id,
        expense: exp,
      });
    }

    // Apply type filter if specified
    let filtered = items;
    if (typeFilter && typeFilter !== 'ALL') {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    // Apply search filter if specified
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.reference.toLowerCase().includes(q) ||
          i.entityOrPayee.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.categoryBadge.toLowerCase().includes(q)
      );
    }

    // Sort chronologically descending (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  async resetToDefaults(): Promise<void> {
    this.resetToDefaultsSync();
  }

  resetToDefaultsSync(): void {
    this.saveExpenses(JSON.parse(JSON.stringify(INITIAL_SHOP_EXPENSES_SEED)));
  }
}

export const financeRepository = new MockFinanceRepository();
