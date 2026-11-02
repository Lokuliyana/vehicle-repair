import { IFinanceRepository } from '@/features/finance-reports/repository/finance.repository.interface';
import {
  ShopExpense,
  CreateShopExpenseDto,
  UpdateShopExpenseDto,
  ShopExpenseFilter,
  DateRangeFilter,
  ProfitLedgerSummary,
  FinanceLedgerItem,
} from '@/features/finance-reports/types';
import { UserProfile } from '@/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for FinanceRepository
 * Maps IFinanceRepository calls to NestJS `/api/v1/finance` endpoints.
 */
export class FinanceApiAdapter implements IFinanceRepository {
  constructor(private client: ApiClient = apiClient) {}

  async getExpenses(filter?: ShopExpenseFilter): Promise<ShopExpense[]> {
    const res = await this.client.get<{ expenses: ShopExpense[]; total: number }>(
      '/finance/expenses',
      {
        category: filter?.category,
        paidFrom: filter?.paidFrom,
        startDate: filter?.startDate,
        endDate: filter?.endDate,
        search: filter?.search,
      }
    );
    return res.expenses || [];
  }

  getExpensesSync(_filter?: ShopExpenseFilter): ShopExpense[] {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async getExpenseById(id: string): Promise<ShopExpense | null> {
    try {
      return await this.client.get<ShopExpense>(`/finance/expenses/${id}`);
    } catch {
      return null;
    }
  }

  async createExpense(dto: CreateShopExpenseDto, user?: UserProfile): Promise<ShopExpense> {
    return this.client.post<ShopExpense>('/finance/expenses', {
      ...dto,
      recordedBy: user?.name,
    });
  }

  createExpenseSync(_dto: CreateShopExpenseDto, _user?: UserProfile): ShopExpense {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async updateExpense(id: string, dto: UpdateShopExpenseDto): Promise<ShopExpense> {
    return this.client.put<ShopExpense>(`/finance/expenses/${id}`, dto);
  }

  async deleteExpense(id: string): Promise<boolean> {
    await this.client.delete(`/finance/expenses/${id}`);
    return true;
  }

  deleteExpenseSync(_id: string): boolean {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async getProfitLedgerSummary(filter?: DateRangeFilter): Promise<ProfitLedgerSummary> {
    return this.client.get<ProfitLedgerSummary>('/finance/profit-ledger', {
      range: filter?.range,
      startDate: filter?.startDate,
      endDate: filter?.endDate,
    });
  }

  getProfitLedgerSummarySync(_filter?: DateRangeFilter): ProfitLedgerSummary {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async getFinanceLedgerItems(
    filter?: DateRangeFilter,
    typeFilter?: string,
    search?: string
  ): Promise<FinanceLedgerItem[]> {
    const res = await this.client.get<{ items: FinanceLedgerItem[] }>('/finance/ledger-items', {
      range: filter?.range,
      startDate: filter?.startDate,
      endDate: filter?.endDate,
      type: typeFilter,
      search,
    });
    return res.items || [];
  }

  getFinanceLedgerItemsSync(
    _filter?: DateRangeFilter,
    _typeFilter?: string,
    _search?: string
  ): FinanceLedgerItem[] {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async resetToDefaults(): Promise<void> {
    await this.client.post('/finance/reset');
  }

  resetToDefaultsSync(): void {
    throw new Error('Synchronous operation not supported in REST API mode');
  }
}

export const financeApiAdapter = new FinanceApiAdapter();
