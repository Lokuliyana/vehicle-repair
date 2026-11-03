import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Printer,
  Eye,
  EyeOff,
  Scale,
} from 'lucide-react';
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
import { UnifiedProfitLedgerTable } from '../components/UnifiedProfitLedgerTable';
import {
  RolePermissionGateWrapper,
  PrintDomPrivacySanitizer,
} from '@/design-system/components/finance-privacy-components';
import { PosReceiptModal } from '@/features/pos/components/PosReceiptModal';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { WorkshopJobSheet, PosSaleTransaction } from '@/types';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

export function ProfitLedgerPage() {
  const { role, permissions } = useAuth();
  const { toast } = useToast();

  // Role Security Guard
  const canAccess = permissions.canAccessFinance;

  // Shared Screen Privacy Mode (RedactedCipherPlaceholder)
  const [screenPrivacyMode, setScreenPrivacyMode] = useState<boolean>(false);
  const isRedacted = !permissions.canViewCosts || screenPrivacyMode;

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
        grossRevenueRs: 0,
        totalDiscountsRs: 0,
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
      }
    >
      <PrintDomPrivacySanitizer>
        <PageContainer maxWidth="wide" dataTestId="profit-ledger-page" className="tabular-nums">
        {/* 1. Standardized Modern Bento Command Card Header */}
        <PageHeader
          glowColor="purple"
          icon={<Scale className="w-5 h-5 text-purple-600" />}
          iconClassName="bg-purple-50/80 border-purple-200/80 text-purple-600"
          kicker="FINANCIAL AUDIT & GROSS PROFIT"
          title="Profit & Financial Ledger"
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
              Live Books
            </span>
          }
          description="Unified gross revenue, direct part/sublet costs, and net operating profit."
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="sr-only">Unified Profit & Financial Ledger</span>

              {/* Screen Privacy Toggle Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScreenPrivacyMode((prev) => !prev)}
                className="text-xs h-8 px-3 border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-2xs cursor-pointer text-slate-700 gap-1.5 font-semibold"
                title={screenPrivacyMode ? 'Reveal confidential costs' : 'Hide costs for shared-screen presentations'}
                data-testid="toggle-privacy-btn"
              >
                {screenPrivacyMode ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reveal Figures</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shared-Screen Privacy</span>
                  </>
                )}
              </Button>

              <select
                value={dateRangeOption}
                onChange={(e) => setDateRangeOption(e.target.value as DateRangeOption)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-hidden cursor-pointer"
                data-testid="date-range-select"
              >
                <option value="ALL_TIME">Period: All Time</option>
                <option value="TODAY">Period: Today</option>
                <option value="YESTERDAY">Period: Yesterday</option>
                <option value="THIS_WEEK">Period: This Week</option>
                <option value="THIS_MONTH">Period: This Month</option>
                <option value="CUSTOM">Period: Custom Range</option>
              </select>
              <span className="sr-only">
                Showing financial events for {dateRangeOption.replace('_', ' ')}
              </span>

              {dateRangeOption === 'CUSTOM' && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-8 text-xs w-32 rounded-lg"
                    data-testid="custom-start-date"
                  />
                  <span className="text-slate-400 font-bold text-xs">to</span>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-8 text-xs w-32 rounded-lg"
                    data-testid="custom-end-date"
                  />
                </div>
              )}

              <Link to="/finance/expenses">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                  title="View Garage Expenses Register"
                  data-testid="view-expenses-btn"
                >
                  Shop Expenses
                </Button>
              </Link>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-[#F95700] hover:bg-[#E04E00] text-white font-semibold text-xs h-8 px-3.5 rounded-lg shadow-2xs gap-1.5 cursor-pointer"
                data-testid="record-expense-btn"
              >
                + Record Expense
              </Button>
            </div>
          }
        />

        {/* High-Level Financial Summary KPI Cards (Consolidated 5-Card Cockpit) & Revenue Stream Breakdown */}
        <ProfitKpiCards summary={summary} isRedacted={isRedacted} />

        {/* 2. Unified Chronological Profit Ledger Table */}
        <UnifiedProfitLedgerTable
          items={ledgerItems}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          isRedacted={isRedacted}
          dateRangeOption={dateRangeOption}
          onDateRangeChange={setDateRangeOption}
          onViewInvoice={(job) => setActiveInvoiceJob(job)}
          onViewReceipt={(sale) => setActiveReceiptSale(sale)}
          onDeleteExpense={handleDeleteExpense}
        />

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
                    className="bg-slate-900 text-white font-bold text-xs gap-1 cursor-pointer"
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
      </PageContainer>
      </PrintDomPrivacySanitizer>
    </RolePermissionGateWrapper>
  );
}
