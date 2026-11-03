import React, { useState, useContext } from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { globalDesignManager } from '../global-manager';
import { UserRole } from '@/types';
import { AuthContext } from '@/app/providers/AuthProvider';

export interface RolePermissionGateWrapperProps {
  userRole?: UserRole | string;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RolePermissionGateWrapper: React.FC<RolePermissionGateWrapperProps> = ({
  userRole,
  allowedRoles = ['OWNER', 'WORKSHOP_MANAGER'],
  children,
  fallback = null,
}) => {
  const auth = useContext(AuthContext);
  const activeRole = userRole || auth?.role;
  const isAllowed = activeRole ? allowedRoles.includes(activeRole as UserRole) : false;

  if (!isAllowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export const MarginHealthTrafficLight: React.FC<{ marginPercent: number }> = ({ marginPercent }) => {
  const health = globalDesignManager.getMarginHealth(marginPercent);

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        health.badgeClass
      )}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: health.dotColor }} />
      <span>{health.label} ({marginPercent.toFixed(1)}%)</span>
    </div>
  );
};

export const UnenteredBuyingCostAlertPill: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-medium">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      <span>{count} parts missing Buying Cost</span>
    </div>
  );
};

export interface DailyCashFlowWaterfallCardProps {
  grossSalesRs?: number;
  grossRevenueRs?: number;
  discountsRs?: number;
  totalDiscountsRs?: number;
  directCostRs?: number;
  totalDirectCostRs?: number;
  grossProfitRs?: number;
  combinedGrossProfitRs?: number;
  grossMarginPct?: number;
  expensesRs?: number;
  dailyOperatingExpensesRs?: number;
  netShopProfitRs?: number;
  netOperatingProfitRs?: number;
  isRedacted?: boolean;
}

export const DailyCashFlowWaterfallCard: React.FC<DailyCashFlowWaterfallCardProps> = ({
  grossSalesRs,
  grossRevenueRs,
  discountsRs,
  totalDiscountsRs,
  directCostRs,
  totalDirectCostRs,
  grossProfitRs,
  combinedGrossProfitRs,
  grossMarginPct,
  expensesRs,
  dailyOperatingExpensesRs,
  netShopProfitRs,
  netOperatingProfitRs,
  isRedacted = false,
}) => {
  const gross = grossRevenueRs ?? grossSalesRs ?? 0;
  const discounts = totalDiscountsRs ?? discountsRs ?? 0;
  const netRevenue = gross - discounts;
  const directCost = totalDirectCostRs ?? directCostRs ?? 0;
  const grossProfit = combinedGrossProfitRs ?? grossProfitRs ?? (netRevenue - directCost);
  const marginPct =
    grossMarginPct ?? (netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0);
  const expenses = dailyOperatingExpensesRs ?? expensesRs ?? 0;
  const netShopProfit = netOperatingProfitRs ?? netShopProfitRs ?? (grossProfit - expenses);

  return (
    <div
      className="p-5 bg-white rounded-[16px] border border-slate-200/90 shadow-xs flex flex-col gap-4 text-xs"
      data-testid="daily-cash-flow-waterfall-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Executive Financial Waterfall Ribbon
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Gross Revenue → Net Sales → Direct Cost → Gross Profit → Garage Expenses → Net Shop Profit
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <span>Net Shop Profit:</span>
            <RedactedCipherPlaceholder isRedacted={isRedacted} value={netShopProfit} />
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            Sri Lankan Rupees (Rs.)
          </span>
        </div>
      </div>

      {/* 5-Step Connected Financial Waterfall Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Step 1: Gross Sales / Revenue */}
        <div
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          data-testid="waterfall-step-1-gross"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              1. Gross Revenue
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Billings</span>
          </div>
          <div className="mt-2">
            <span className="font-sans tabular-nums font-bold text-slate-900 text-base block">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={gross} />
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Workshop + POS Walk-in
            </span>
          </div>
        </div>

        {/* Step 2: Net Sales Revenue (after discounts) */}
        <div
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          data-testid="waterfall-step-2-net"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              2. Net Sales Revenue
            </span>
            {discounts > 0 && (
              <span className="text-[9px] font-sans tabular-nums font-semibold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                -Rs. {discounts.toLocaleString()}
              </span>
            )}
          </div>
          <div className="mt-2">
            <span className="font-sans tabular-nums font-bold text-slate-900 text-base block">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={netRevenue} />
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Gross less shop discounts
            </span>
          </div>
        </div>

        {/* Step 3: Total Direct Cost */}
        <div
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between cost-cell"
          data-testid="waterfall-step-3-cost"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              3. Total Direct Cost
            </span>
            <span className="text-[9px] text-slate-400 font-sans">Parts + Sublet</span>
          </div>
          <div className="mt-2">
            <span className="font-sans tabular-nums font-bold text-slate-900 text-base block">
              - <RedactedCipherPlaceholder isRedacted={isRedacted} value={directCost} />
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Parts buying + sublet labor
            </span>
          </div>
        </div>

        {/* Step 4: Gross Profit & Margin % */}
        <div
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          data-testid="waterfall-step-4-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              4. Gross Profit & %
            </span>
            <span className="text-[9px] font-sans tabular-nums font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full">
              {marginPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <span className="font-sans tabular-nums font-bold text-slate-900 text-base block">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={grossProfit} />
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Combined Gross Profit
            </span>
          </div>
        </div>

        {/* Step 5: Daily Garage Expenses */}
        <div
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          data-testid="waterfall-step-5-expenses"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              5. Garage Expenses
            </span>
            <span className="text-[9px] text-slate-400 font-sans">Overheads</span>
          </div>
          <div className="mt-2">
            <span className="font-sans tabular-nums font-bold text-slate-900 text-base block">
              - <RedactedCipherPlaceholder isRedacted={isRedacted} value={expenses} />
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Rent, CEB, Consumables, Tea
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrintDomPrivacySanitizer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="print:text-black print:bg-transparent [&_.print-hidden]:print:hidden [&_.cost-column]:print:hidden [&_.cost-field]:print:hidden [&_.cost-cell]:print:hidden [&_.profit-badge]:print:hidden [&_.admin-profit-telemetry]:print:hidden [&_[data-private-cost]]:print:hidden [&_[data-cost-profit]]:print:hidden">
      {children}
    </div>
  );
};

export interface UnifiedProfitLedgerTableProps {
  transactions?: Array<{
    id: string;
    type: 'WORKSHOP' | 'POS' | string;
    date: string;
    reference: string;
    sellingPriceRs: number;
    directCostRs: number;
    grossProfitRs: number;
    marginPercent: number;
    status?: string;
  }>;
  items?: any[];
  typeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  isRedacted?: boolean;
  onViewInvoice?: (job: any) => void;
  onViewReceipt?: (sale: any) => void;
  onDeleteExpense?: (id: string, description: string) => void;
}

export const UnifiedProfitLedgerTable: React.FC<UnifiedProfitLedgerTableProps> = (props) => {
  const { transactions, items, isRedacted = false } = props;

  // If transactions array is passed directly (e.g. from global design system tests)
  if (transactions && !items) {
    return (
      <div className="bg-white rounded-[16px] border border-slate-200 shadow-xs overflow-hidden" data-testid="ledger-table">
        <table className="w-full text-xs">
          <thead className="bg-[#FFF7ED]/60 border-b border-orange-100/80 text-[11px] font-bold uppercase text-slate-700">
            <tr>
              <th className="py-2.5 px-3 text-left">Date & Time</th>
              <th className="py-2.5 px-3 text-left">Ref / Channel</th>
              <th className="py-2.5 px-3 text-right">Revenue</th>
              <th className="py-2.5 px-3 text-right">Direct Cost</th>
              <th className="py-2.5 px-3 text-right">Gross Profit</th>
              <th className="py-2.5 px-3 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 font-mono">
                <td className="p-3 text-slate-500 font-sans">{tx.date}</td>
                <td className="p-3 font-sans">
                  <span className="font-bold text-slate-900 block">{tx.reference}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{tx.type}</span>
                </td>
                <td className="p-3 text-right font-bold text-slate-900">
                  {globalDesignManager.formatRs(tx.sellingPriceRs)}
                </td>
                <td className="p-3 text-right text-slate-600">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={tx.directCostRs} />
                </td>
                <td className="p-3 text-right font-bold text-emerald-700">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={tx.grossProfitRs} />
                </td>
                <td className="p-3 text-right">
                  {isRedacted ? (
                    <span className="font-mono text-[10px] text-slate-400">••••%</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {tx.marginPercent.toFixed(1)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // If rich items array is passed (e.g. from ProfitLedgerPage)
  const rows = items || [];
  return (
    <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs overflow-hidden" data-testid="ledger-table">
      <table className="w-full text-xs">
        <thead className="bg-[#FFF7ED]/60 border-b border-orange-100/80 text-[11px] font-bold uppercase text-slate-700">
          <tr>
            <th className="py-2.5 px-3 text-left">Date & Time</th>
            <th className="py-2.5 px-3 text-left">Reference ID</th>
            <th className="py-2.5 px-3 text-left">Source Badge</th>
            <th className="py-2.5 px-3 text-left">Customer / Vehicle</th>
            <th className="py-2.5 px-3 text-right">Selling Price</th>
            <th className="py-2.5 px-3 text-right">Direct Cost</th>
            <th className="py-2.5 px-3 text-right">Gross Profit</th>
            <th className="py-2.5 px-3 text-center">Margin %</th>
            <th className="py-2.5 px-3 text-center">Status</th>
            <th className="py-2.5 px-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx: any) => (
            <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 font-mono" data-testid={`ledger-row-${tx.id}`}>
              <td className="p-3 text-slate-500 font-sans">{tx.date}</td>
              <td className="p-3 font-sans font-bold text-slate-900">{tx.reference}</td>
              <td className="p-3 font-sans">{tx.type}</td>
              <td className="p-3 font-sans">{tx.entityOrPayee}</td>
              <td className="p-3 text-right font-bold text-slate-900">
                {globalDesignManager.formatRs(tx.salesRevenueRs || tx.sellingPriceRs || 0)}
              </td>
              <td className="p-3 text-right text-slate-600">
                <RedactedCipherPlaceholder isRedacted={isRedacted} value={tx.directCostRs || 0} />
              </td>
              <td className="p-3 text-right font-bold text-emerald-700">
                <RedactedCipherPlaceholder isRedacted={isRedacted} value={tx.netProfitContributionRs || tx.grossProfitRs || 0} />
              </td>
              <td className="p-3 text-center">
                {isRedacted ? (
                  <span className="font-mono text-[10px] text-slate-400">••••%</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {(tx.marginPercent || 0).toFixed(1)}%
                  </span>
                )}
              </td>
              <td className="p-3 text-center font-sans">{tx.status || 'FINALIZED'}</td>
              <td className="p-3 text-center font-sans">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface DailyShopExpenseEntryFormProps {
  onAddExpense?: (expense: { category: string; amountRs: number; note: string; description?: string }) => void;
  onExpenseAdded?: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

export const DailyShopExpenseEntryForm: React.FC<DailyShopExpenseEntryFormProps> = ({
  onAddExpense,
  onExpenseAdded,
}) => {
  const [category, setCategory] = useState('Rent & Utilities');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paidFrom, setPaidFrom] = useState<'POS_DRAWER' | 'MAIN_CASH'>('POS_DRAWER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    'Rent & Utilities',
    'Consumables & Gas',
    'Staff Refreshments',
    'Tools & Maintenance',
    'Sublet Machining',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date || !date.trim()) {
      setErrorMessage('Please select a valid expense date.');
      return;
    }

    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!note.trim()) {
      setErrorMessage('Please enter an expense description or reason.');
      return;
    }

    if (onAddExpense) {
      onAddExpense({ category, amountRs: numAmount, note: note.trim(), description: note.trim() });
      setAmount('');
      setNote('');
      if (onExpenseAdded) onExpenseAdded();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="daily-expense-form"
      className="p-4 bg-slate-50 rounded-[14px] border border-slate-200 flex flex-col gap-3 text-xs"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 uppercase tracking-wider">
          Record Daily Garage Expense
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Overhead Voucher</span>
      </div>

      {errorMessage && (
        <div
          className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium"
          data-testid="expense-error-alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 px-2 bg-white border border-slate-200 rounded-[8px]"
          data-testid="expense-date-input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-2 bg-white border border-slate-200 rounded-[8px]"
          data-testid="expense-category-select"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount (Rs.)"
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          className="h-9 px-2 bg-white border border-slate-200 rounded-[8px] font-mono text-right"
          data-testid="expense-amount-input"
        />

        <input
          type="text"
          placeholder="Note / Description..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-9 px-2 bg-white border border-slate-200 rounded-[8px]"
          data-testid="expense-desc-input"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaidFrom('POS_DRAWER')}
            className={clsx(
              'px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer',
              paidFrom === 'POS_DRAWER'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200'
            )}
            data-testid="expense-paidfrom-pos"
          >
            POS Drawer
          </button>
          <button
            type="button"
            onClick={() => setPaidFrom('MAIN_CASH')}
            className={clsx(
              'px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer',
              paidFrom === 'MAIN_CASH'
                ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200'
            )}
            data-testid="expense-paidfrom-main"
          >
            Main Cash / Safe
          </button>
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-[8px] transition-colors cursor-pointer"
          data-testid="expense-submit-btn"
        >
          Record Expense
        </button>
      </div>
    </form>
  );
};

export interface NetShopProfitSummaryCardProps {
  totalGrossProfitRs?: number;
  combinedGrossProfitRs?: number;
  totalExpensesRs?: number;
  dailyOperatingExpensesRs?: number;
  netShopProfitRs?: number;
  netOperatingProfitRs?: number;
  isRedacted?: boolean;
}

export const NetShopProfitSummaryCard: React.FC<NetShopProfitSummaryCardProps> = ({
  totalGrossProfitRs,
  combinedGrossProfitRs,
  totalExpensesRs,
  dailyOperatingExpensesRs,
  netShopProfitRs,
  netOperatingProfitRs,
  isRedacted = false,
}) => {
  const grossProfit = combinedGrossProfitRs ?? totalGrossProfitRs ?? 0;
  const expenses = dailyOperatingExpensesRs ?? totalExpensesRs ?? 0;
  const net = netOperatingProfitRs ?? netShopProfitRs ?? (grossProfit - expenses);
  const isLoss = net < 0;

  return (
    <div
      className="p-5 bg-white rounded-[16px] border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      data-testid="net-shop-profit-summary-card"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Net Shop Profit
          </span>
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
              isLoss
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            )}
          >
            {isLoss ? 'Deficit' : 'Profitable'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
          Formula: Total Gross Profit (Workshop + POS) - Daily Garage Expenses
        </span>
      </div>
      <div className="text-right">
        <span
          className={clsx(
            'text-2xl font-sans tabular-nums font-bold tracking-tight',
            isLoss ? 'text-red-600' : 'text-emerald-700'
          )}
        >
          <RedactedCipherPlaceholder isRedacted={isRedacted} value={net} />
        </span>
        <div className="text-[10px] text-slate-400 font-sans tabular-nums mt-0.5">
          GP {isRedacted ? '••••••' : globalDesignManager.formatRs(grossProfit)} − Exp {isRedacted ? '••••••' : globalDesignManager.formatRs(expenses)}
        </div>
      </div>
    </div>
  );
};

export const InsuranceVsCustomerReceivableSplitBar: React.FC<{
  insuranceReceivableRs: number;
  customerReceivableRs: number;
}> = ({ insuranceReceivableRs, customerReceivableRs }) => {
  const total = insuranceReceivableRs + customerReceivableRs || 1;
  const insPct = Math.round((insuranceReceivableRs / total) * 100);
  const custPct = 100 - insPct;

  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200 flex flex-col gap-2 text-xs">
      <div className="flex justify-between font-bold text-slate-800">
        <span>Receivable Breakdown</span>
        <span className="font-mono text-[11px] text-slate-500">
          Ins: {globalDesignManager.formatRs(insuranceReceivableRs)} | Cust: {globalDesignManager.formatRs(customerReceivableRs)}
        </span>
      </div>
      <div className="h-3 w-full flex rounded-full overflow-hidden">
        <div className="bg-indigo-600" style={{ width: `${insPct}%` }} title={`Insurance: ${insPct}%`} />
        <div className="bg-orange-500" style={{ width: `${custPct}%` }} title={`Customer: ${custPct}%`} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>● Insurance Claims ({insPct}%)</span>
        <span>● Customer Excess ({custPct}%)</span>
      </div>
    </div>
  );
};

export const PriceOverrideAuditPrompt: React.FC<{
  open: boolean;
  itemName: string;
  originalPrice: number;
  overridePrice: number;
  onApprove: (managerPin: string) => void;
  onReject: () => void;
}> = ({ open, itemName, originalPrice, overridePrice, onApprove, onReject }) => {
  const [pin, setPin] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-[22px] border border-amber-200 shadow-2xl p-6 flex flex-col gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-600 font-bold">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Price Override Authorization</span>
        </div>
        <p className="text-slate-600">
          Discounting <strong>{itemName}</strong> from {globalDesignManager.formatRs(originalPrice)} to{' '}
          <strong className="text-red-600">{globalDesignManager.formatRs(overridePrice)}</strong> requires Manager PIN.
        </p>
        <input
          type="password"
          maxLength={6}
          placeholder="Enter Manager PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full h-10 px-3 text-center font-mono text-base border rounded-[8px]"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onReject} className="px-3 py-1.5 text-slate-500">
            Cancel
          </button>
          <button
            type="button"
            disabled={!pin}
            onClick={() => onApprove(pin)}
            className="px-4 py-1.5 bg-[#0F172A] text-white font-bold rounded-[8px] disabled:opacity-50"
          >
            Authorize Override
          </button>
        </div>
      </div>
    </div>
  );
};

export const HistoricalSnapshotIntegrityBadge: React.FC<{ isLocked?: boolean }> = ({ isLocked = true }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
      <Lock className="w-3 h-3 text-slate-500" />
      <span>{isLocked ? 'Frozen Cost Snapshot' : 'Live Catalog Linked'}</span>
    </div>
  );
};

export const ProfitByCategoryBreakdownCard: React.FC<{
  categories: Array<{ category: string; grossProfitRs: number; marginPercent: number }>;
}> = ({ categories }) => {
  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200 flex flex-col gap-2.5 text-xs">
      <span className="font-bold text-slate-800 uppercase tracking-wider">Profit By Category</span>
      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <div key={c.category} className="flex items-center justify-between p-2 bg-slate-50 rounded-[8px]">
            <span className="font-semibold text-slate-700">{c.category}</span>
            <div className="flex items-center gap-2">
              <span className="font-sans tabular-nums font-bold text-emerald-800">
                {globalDesignManager.formatRs(c.grossProfitRs)}
              </span>
              <span className="font-sans tabular-nums text-[10px] text-slate-400">({c.marginPercent.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RedactedCipherPlaceholder: React.FC<{
  value?: number | string;
  isRedacted?: boolean;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}> = ({ value, isRedacted = false, className, dataTestId, ...rest }) => {
  const resolvedTestId = dataTestId || rest['data-testid'];

  if (isRedacted) {
    return (
      <span
        data-testid={resolvedTestId}
        className={clsx('font-sans tabular-nums text-slate-400 select-none tracking-wider', className)}
      >
        Rs. ••••••
      </span>
    );
  }
  return (
    <span
      data-testid={resolvedTestId}
      className={clsx('font-sans tabular-nums font-bold text-slate-900', className)}
    >
      {typeof value === 'number' ? globalDesignManager.formatRs(value) : (value ?? 'Rs. 0.00')}
    </span>
  );
};

