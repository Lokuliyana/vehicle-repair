import {
  ShopExpense,
  CreateShopExpenseDto,
  UpdateShopExpenseDto,
  ShopExpenseFilter,
  DateRangeFilter,
  ProfitLedgerSummary,
  FinanceLedgerItem,
} from '../types';
import { UserProfile } from '@/types';

export interface IFinanceRepository {
  getExpenses(filter?: ShopExpenseFilter): Promise<ShopExpense[]>;
  getExpensesSync(filter?: ShopExpenseFilter): ShopExpense[];
  getExpenseById(id: string): Promise<ShopExpense | null>;
  createExpense(dto: CreateShopExpenseDto, user?: UserProfile): Promise<ShopExpense>;
  createExpenseSync(dto: CreateShopExpenseDto, user?: UserProfile): ShopExpense;
  updateExpense(id: string, dto: UpdateShopExpenseDto): Promise<ShopExpense>;
  deleteExpense(id: string): Promise<boolean>;
  deleteExpenseSync(id: string): boolean;

  getProfitLedgerSummary(filter?: DateRangeFilter): Promise<ProfitLedgerSummary>;
  getProfitLedgerSummarySync(filter?: DateRangeFilter): ProfitLedgerSummary;

  getFinanceLedgerItems(
    filter?: DateRangeFilter,
    typeFilter?: string,
    search?: string
  ): Promise<FinanceLedgerItem[]>;
  getFinanceLedgerItemsSync(
    filter?: DateRangeFilter,
    typeFilter?: string,
    search?: string
  ): FinanceLedgerItem[];

  resetToDefaults(): Promise<void>;
  resetToDefaultsSync(): void;
}
