import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  Receipt,
  Printer,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  DateRangeOption,
  DateRangeFilter,
} from '../types';
import { financeRepository } from '../repository/finance.repository.mock';
import { ProfitKpiCards } from '../components/ProfitKpiCards';
import { DailyExpenseModal } from '../components/DailyExpenseModal';
import { PosReceiptModal } from '@/features/pos/components/PosReceiptModal';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { WorkshopJobSheet, PosSaleTransaction } from '@/types';

export function ProfitLedgerPage() {
  const { role, permissions } = useAuth();
  const { toast } = useToast();

  // Role Security Guard
  const canAccess = permissions.canAccessFinance;

  // Date Range Filter State
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('ALL_TIME');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Table Filter State
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<PosSaleTransaction | null>(null);
  const [activeInvoiceJob, setActiveInvoiceJob] = useState<WorkshopJobSheet | null>(null);

  // Construct active filter object
  const currentFilter: DateRangeFilter = useMemo(() => {
    return {
      range: dateRangeOption,
      startDate: dateRangeOption === 'CUSTOM' ? customStartDate : undefined,
      endDate: dateRangeOption === 'CUSTOM' ? customEndDate : undefined,
    };
  }, [dateRangeOption, customStartDate, customEndDate]);

  // Load KPI Summary
  const summary = useMemo(() => {
    if (!canAccess) {
      return {
        totalNetSalesRs: 0,
        totalDirectCostRs: 0,
        combinedGrossProfitRs: 0,
        grossMarginPct: 0,
        dailyOperatingExpensesRs: 0,
        netOperatingProfitRs: 0,
        pendingInsuranceClaimsRs: 0,
        customerBalancesDueRs: 0,
        totalOutstandingReceivablesRs: 0,
        workshopLaborRevenueRs: 0,
        workshopLaborCostRs: 0,
        workshopLaborProfitRs: 0,
        workshopPartsRevenueRs: 0,
        workshopPartsCostRs: 0,
        workshopPartsProfitRs: 0,
        workshopTotalRevenueRs: 0,
        workshopTotalCostRs: 0,
        workshopGrossProfitRs: 0,
        posSalesRevenueRs: 0,
        posBuyingCostRs: 0,
        posGrossProfitRs: 0,
      };
    }
    return financeRepository.getProfitLedgerSummarySync(currentFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter, refreshTrigger, canAccess]);

  // Load Combined Ledger Items
  const ledgerItems = useMemo(() => {
    if (!canAccess) return [];
    return financeRepository.getFinanceLedgerItemsSync(
      currentFilter,
      typeFilter,
      searchQuery
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter, typeFilter, searchQuery, refreshTrigger, canAccess]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast({
      title: 'Ledger Refreshed',
      message: 'Synchronized real-time workshop invoices, POS receipts, and shop expenses.',
      type: 'info',
    });
  };

  const handleDeleteExpense = (id: string, desc: string) => {
    if (window.confirm(`Are you sure you want to delete expense "${desc}" (${id})?`)) {
      try {
        const deleted = financeRepository.deleteExpenseSync(id);
        if (deleted) {
          toast({
            title: 'Expense Deleted',
            message: `Shop expense voucher ${id} has been removed.`,
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

  if (!canAccess) {
    return (
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
          Confidential Profit & Finance Ledger
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Access to workshop buying costs, gross profit margins, and net operating financials is
          restricted strictly to <strong>OWNER</strong> and <strong>WORKSHOP MANAGER</strong> roles.
          Your current active role is <code className="px-1.5 py-0.5 bg-slate-100 rounded text-red-700 font-bold">{role}</code>.
        </p>
        <Link to="/">
          <Button variant="default" size="sm" className="bg-slate-900 text-white font-bold text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="profit-ledger-page">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Unified Profit & Financial Ledger
            </h1>
            <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 text-[10px] gap-1 font-bold">
              <Lock className="w-2.5 h-2.5" /> Owner / Manager Restricted
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Gross Profit, Parts vs. Labor Margins, Counter POS, and Daily Shop Operating Overhead.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs h-9 gap-1.5"
            title="Refresh Data"
            data-testid="refresh-ledger-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs h-9 gap-1.5 shadow-xs"
            data-testid="record-expense-btn"
          >
            <Plus className="w-4 h-4" />
            Record Shop Expense
          </Button>
        </div>
      </div>

      {/* Date Range Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-slate-500" />
            Period Filter:
          </span>
          <select
            value={dateRangeOption}
            onChange={(e) => setDateRangeOption(e.target.value as DateRangeOption)}
            className="h-8.5 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            data-testid="date-range-select"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="CUSTOM">Custom Range</option>
          </select>

          {dateRangeOption === 'CUSTOM' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-8.5 text-xs w-36"
                data-testid="custom-start-date"
              />
              <span className="text-slate-400 font-bold">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8.5 text-xs w-36"
                data-testid="custom-end-date"
              />
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 italic">
          Showing financial events for <strong className="text-slate-800">{dateRangeOption.replace('_', ' ')}</strong>
        </div>
      </div>

      {/* High-Level Financial Summary KPI Cards & Revenue Breakdown */}
      <ProfitKpiCards summary={summary} />

      {/* Combined Chronological Financial Events Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter & Search Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-xs uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-slate-600" />
              Chronological Financial Journal ({ledgerItems.length} records)
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
                data-testid="type-filter-select"
              >
                <option value="ALL">All Event Types</option>
                <option value="WORKSHOP_INVOICE">Workshop Invoices</option>
                <option value="POS_SALE">Counter POS Sales</option>
                <option value="SHOP_EXPENSE">Shop Expenses</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <Input
                type="text"
                placeholder="Search ref #, customer, payee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs w-48 sm:w-64"
                data-testid="search-input"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" data-testid="ledger-table">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                <th className="p-3">Date & Time</th>
                <th className="p-3">Ref #</th>
                <th className="p-3">Type</th>
                <th className="p-3">Customer / Vehicle / Payee</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Sales Revenue</th>
                <th className="p-3 text-right">Direct Cost</th>
                <th className="p-3 text-right">Operating Expense</th>
                <th className="p-3 text-right">Net Profit Contribution</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ledgerItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                    No financial transactions or expenses found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                ledgerItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                    data-testid={`ledger-row-${item.id}`}
                  >
                    <td className="p-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      <div className="font-semibold text-slate-900">{item.date}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.type === 'WORKSHOP_INVOICE' && item.job ? (
                        <button
                          type="button"
                          onClick={() => setActiveInvoiceJob(item.job || null)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left font-bold"
                          title="View / Print Workshop Invoice"
                          data-testid={`ref-link-${item.reference}`}
                        >
                          {item.reference}
                        </button>
                      ) : item.type === 'POS_SALE' && item.posSale ? (
                        <button
                          type="button"
                          onClick={() => setActiveReceiptSale(item.posSale || null)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left font-bold"
                          title="View / Print 80mm POS Receipt"
                          data-testid={`ref-link-${item.reference}`}
                        >
                          {item.reference}
                        </button>
                      ) : (
                        <span>{item.reference}</span>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <Badge
                        variant={
                          item.type === 'WORKSHOP_INVOICE'
                            ? 'invoice'
                            : item.type === 'POS_SALE'
                            ? 'success'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {item.type === 'WORKSHOP_INVOICE'
                          ? 'Workshop Invoice'
                          : item.type === 'POS_SALE'
                          ? 'POS Sale'
                          : 'Shop Expense'}
                      </Badge>
                    </td>

                    <td className="p-3 text-slate-800 max-w-xs truncate" title={item.entityOrPayee}>
                      <span className="font-semibold">{item.entityOrPayee}</span>
                    </td>

                    <td className="p-3 text-slate-600 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>

                    <td className="p-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {item.salesRevenueRs > 0 ? formatRs(item.salesRevenueRs) : '—'}
                    </td>

                    <td className="p-3 text-right font-mono font-semibold text-amber-900 whitespace-nowrap">
                      {item.directCostRs > 0 ? formatRs(item.directCostRs) : '—'}
                    </td>

                    <td className="p-3 text-right font-mono font-semibold text-rose-800 whitespace-nowrap">
                      {item.operatingExpenseRs > 0 ? formatRs(item.operatingExpenseRs) : '—'}
                    </td>

                    <td
                      className={`p-3 text-right font-mono font-bold whitespace-nowrap ${
                        item.netProfitContributionRs > 0
                          ? 'text-emerald-700'
                          : item.netProfitContributionRs < 0
                          ? 'text-red-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.netProfitContributionRs >= 0 ? '+' : ''}
                      {formatRs(item.netProfitContributionRs)}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {item.type === 'WORKSHOP_INVOICE' && item.job && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveInvoiceJob(item.job || null)}
                            className="h-7 px-2 text-[11px] gap-1 border-slate-300 hover:bg-slate-100"
                            title="View / Print A4 Invoice"
                            data-testid={`view-invoice-btn-${item.reference}`}
                          >
                            <Printer className="w-3 h-3 text-slate-700" />
                            Print
                          </Button>
                          <Link to={`/workshop/sheet/${item.job.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] gap-1 text-blue-600 hover:text-blue-800"
                              title="Open Job Sheet"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      )}

                      {item.type === 'POS_SALE' && item.posSale && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveReceiptSale(item.posSale || null)}
                          className="h-7 px-2 text-[11px] gap-1 border-slate-300 hover:bg-slate-100"
                          title="View / Print 80mm Thermal Receipt"
                          data-testid={`view-receipt-btn-${item.reference}`}
                        >
                          <Printer className="w-3 h-3 text-blue-600" />
                          Receipt
                        </Button>
                      )}

                      {item.type === 'SHOP_EXPENSE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(item.reference, item.description)}
                          className="h-7 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                          title="Delete Expense Voucher"
                          data-testid={`delete-expense-btn-${item.reference}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Shop Expense Entry Modal */}
      <DailyExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        onExpenseAdded={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* POS Receipt Preview Modal */}
      <PosReceiptModal
        open={activeReceiptSale !== null}
        onOpenChange={(open) => {
          if (!open) setActiveReceiptSale(null);
        }}
        receipt={activeReceiptSale}
      />

      {/* Workshop Invoice A4 Print Modal */}
      <Dialog
        open={activeInvoiceJob !== null}
        onOpenChange={(open) => {
          if (!open) setActiveInvoiceJob(null);
        }}
      >
        <DialogClose onClick={() => setActiveInvoiceJob(null)} />
        {activeInvoiceJob && (
          <div className="p-4 sm:p-6 space-y-4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="no-print">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-sm font-bold flex items-center gap-2">
                    <Printer className="w-4 h-4 text-slate-700" />
                    Workshop Invoice Print Preview — {activeInvoiceJob.jobNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Standard A4 laser print layout with zero buying cost or margin leakage.
                  </DialogDescription>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-slate-900 text-white font-bold text-xs gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Now
                </Button>
              </div>
            </DialogHeader>

            <div className="bg-slate-100 p-4 rounded-xl flex justify-center print:border-none print:shadow-none print:p-0 print:bg-transparent">
              <A4WorkshopPrint jobSheet={activeInvoiceJob} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
