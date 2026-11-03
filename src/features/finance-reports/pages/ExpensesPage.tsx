import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Store,
  Wallet,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import {
  ExpenseCategory,
  ExpensePaidFrom,
  ShopExpense,
  EXPENSE_CATEGORY_LABELS,
} from '../types';
import { financeRepository } from '../repository/finance.repository.mock';
import { DailyExpenseModal } from '../components/DailyExpenseModal';
import { RolePermissionGateWrapper } from '@/design-system/components/finance-privacy-components';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

export function ExpensesPage() {
  const { role, permissions } = useAuth();
  const { toast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [paidFromFilter, setPaidFromFilter] = useState<ExpensePaidFrom | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Load expenses
  const expenses = useMemo<ShopExpense[]>(() => {
    if (!permissions.canAccessFinance) return [];
    return financeRepository.getExpensesSync({
      category: categoryFilter,
      paidFrom: paidFromFilter,
      search: searchQuery,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, paidFromFilter, searchQuery, refreshTrigger, permissions.canAccessFinance]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    let totalRs = 0;
    let posDrawerRs = 0;
    let mainCashRs = 0;
    const categoryTotals: Record<string, number> = {};

    for (const exp of expenses) {
      const amt = exp.amountRs || 0;
      totalRs += amt;
      if (exp.paidFrom === 'POS_DRAWER') {
        posDrawerRs += amt;
      } else {
        mainCashRs += amt;
      }
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
    }

    let topCategory = 'None';
    let topCategoryAmount = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] || cat;
      }
    }

    return {
      totalRs,
      posDrawerRs,
      mainCashRs,
      topCategory,
      topCategoryAmount,
      count: expenses.length,
    };
  }, [expenses]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast({
      title: 'Expenses Refreshed',
      message: 'Synchronized real-time garage overhead vouchers and drawer payouts.',
      type: 'info',
    });
  };

  const handleDeleteExpense = (id: string, desc: string) => {
    if (window.confirm(`Are you sure you want to delete expense voucher "${desc}" (${id})?`)) {
      try {
        const deleted = financeRepository.deleteExpenseSync(id);
        if (deleted) {
          toast({
            title: 'Expense Voucher Deleted',
            message: `Overhead voucher ${id} removed. Cash-out reversed if shift was open.`,
            type: 'warning',
          });
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (err) {
        toast({
          title: 'Cannot Delete Expense',
          message: err instanceof Error ? err.message : 'Failed to delete expense voucher.',
          type: 'error',
        });
      }
    }
  };

  return (
    <RolePermissionGateWrapper
      allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}
      fallback={
        <div
          className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-red-200 rounded-xl shadow-xs text-center"
          data-testid="restricted-finance-alert"
        >
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <Badge variant="destructive" className="mb-3 uppercase tracking-wider text-[11px]">
            Access Restricted
          </Badge>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Confidential Expense Register
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Access to garage overheads and operating expense registers is restricted strictly to
            <strong> OWNER</strong> and <strong>WORKSHOP MANAGER</strong> roles.
            Your current active role is <code className="px-1.5 py-0.5 bg-slate-100 rounded text-red-700 font-bold">{role}</code>.
          </p>
          <Link to="/">
            <Button variant="default" size="sm" className="bg-slate-900 text-white font-bold text-xs">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      }
    >
      <PageContainer maxWidth="wide" dataTestId="expenses-page">
        {/* 1. Standardized Modern Bento Command Card Header */}
        <PageHeader
          glowColor="amber"
          icon={<Wallet className="w-5 h-5 text-amber-600" />}
          iconClassName="bg-amber-50/80 border-amber-200/80 text-amber-600"
          kicker="GARAGE OVERHEADS"
          title="Shop Expenses & Overheads"
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
              Disbursements
            </span>
          }
          description="Petty cash disbursements, CEB electricity, welding consumables, and sublet lathe bills."
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="sr-only">Garage Overhead & Expense Register</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-xs h-8 px-3 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-2xs cursor-pointer"
                title="Refresh Expenses"
                data-testid="refresh-expenses-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>

              <Link to="/finance/profit-ledger">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                  data-testid="goto-profit-ledger-btn"
                >
                  Profit Ledger
                </Button>
              </Link>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-[#F95700] hover:bg-[#E04E00] text-white h-8 px-3.5 rounded-lg text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer"
                data-testid="record-expense-voucher-btn"
              >
                + Record Expense Voucher
              </Button>
            </div>
          }
        />

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Total Filtered Overheads
            </span>
            <div className="mt-1">
              <span className="text-2xl font-bold text-slate-900 font-sans tabular-nums tracking-tight block">
                {formatRs(metrics.totalRs)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {metrics.count} logged expense vouchers
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                POS Drawer Cash-Outs
              </span>
              <Store className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-slate-900 font-sans tabular-nums tracking-tight block">
                {formatRs(metrics.posDrawerRs)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Petty cash deducted from active shifts
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Main Cash & Cheques
              </span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-slate-900 font-sans tabular-nums tracking-tight block">
                {formatRs(metrics.mainCashRs)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Premises lease, utilities & sublet
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Top Overhead Category
              </span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-slate-900 font-sans tracking-tight truncate block" title={metrics.topCategory}>
                {metrics.topCategory}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 font-sans tabular-nums font-semibold block">
                {formatRs(metrics.topCategoryAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Dialog for Recording Expense */}
        <DailyExpenseModal
          open={isExpenseModalOpen}
          onOpenChange={setIsExpenseModalOpen}
          onExpenseAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />

        {/* Overheads Journal Table */}
        <div className="bg-white rounded-[16px] border border-slate-200 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                Logged Expense Vouchers ({expenses.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'ALL')}
                  className="h-8 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 font-medium"
                  data-testid="expenses-category-filter"
                  aria-label="Filter expenses by category"
                >
                  <option value="ALL">All Categories</option>
                  {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {EXPENSE_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Source Filter */}
              <select
                value={paidFromFilter}
                onChange={(e) => setPaidFromFilter(e.target.value as ExpensePaidFrom | 'ALL')}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 font-medium"
                data-testid="expenses-paidfrom-filter"
                aria-label="Filter expenses by payment source"
              >
                <option value="ALL">All Payment Sources</option>
                <option value="POS_DRAWER">POS Cash Drawer</option>
                <option value="MAIN_CASH">Main Cash / Safe</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <Input
                  type="text"
                  placeholder="Search expense description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs w-48 sm:w-60"
                  data-testid="expenses-search-input"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs" data-testid="expenses-table">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 font-medium text-[11px] border-b border-slate-100">
                  <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Voucher #</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Payment Source</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Recorded By</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount (Rs.)</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap w-14">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                      No expense vouchers found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/80 transition-colors"
                      data-testid={`expense-row-${exp.id}`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {exp.id}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border',
                            exp.category === 'RENT'
                              ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                              : exp.category === 'ELECTRICITY_UTILITIES'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                              : exp.category === 'SUBLET_BILLS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : exp.category === 'CONSUMABLES_PAINT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : exp.category === 'TEA_ALLOWANCE'
                              ? 'bg-slate-100 text-slate-700 border-slate-200/60'
                              : 'bg-rose-50 text-rose-700 border-rose-200/60'
                          )}
                        >
                          {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-xs truncate" title={exp.description}>
                        {exp.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {exp.paidFrom === 'POS_DRAWER' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800">
                            <Store className="w-3.5 h-3.5 text-amber-600" />
                            Drawer {exp.shiftId ? `(${exp.shiftId})` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800">
                            <Wallet className="w-3.5 h-3.5 text-blue-600" />
                            Main Cash
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {exp.recordedBy || 'Staff'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans tabular-nums font-bold text-rose-700 whitespace-nowrap">
                        {formatRs(exp.amountRs)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap w-14">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(exp.id, exp.description)}
                          className="h-7 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 cursor-pointer"
                          title="Delete Expense Voucher"
                          data-testid={`delete-voucher-btn-${exp.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </RolePermissionGateWrapper>
  );
}
