import { Link } from 'react-router-dom';
import {
  Printer,
  Trash2,
  ExternalLink,
  Receipt,
  Search,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRs } from '@/utils/currency';
import {
  TableMarginSparkBarCell,
  TableVehicleBadgeCell,
  TableStatusFilterPills,
} from '@/design-system/components/data-tables-ledgers';
import { RedactedCipherPlaceholder } from '@/design-system/components/finance-privacy-components';
import { FinanceLedgerItem, DateRangeOption } from '../types';
import { WorkshopJobSheet, PosSaleTransaction } from '@/types';

export interface UnifiedProfitLedgerTableProps {
  items: FinanceLedgerItem[];
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isRedacted?: boolean;
  dateRangeOption?: DateRangeOption;
  onDateRangeChange?: (range: DateRangeOption) => void;
  onViewInvoice?: (job: WorkshopJobSheet) => void;
  onViewReceipt?: (sale: PosSaleTransaction) => void;
  onDeleteExpense?: (id: string, description: string) => void;
}

export function UnifiedProfitLedgerTable({
  items,
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchQueryChange,
  isRedacted = false,
  dateRangeOption,
  onDateRangeChange,
  onViewInvoice,
  onViewReceipt,
  onDeleteExpense,
}: UnifiedProfitLedgerTableProps) {
  const filterPills = [
    { label: 'All Transactions', value: 'ALL' },
    { label: 'Workshop Invoices', value: 'WORKSHOP_INVOICE' },
    { label: 'POS Sales', value: 'POS_SALE' },
    { label: 'Shop Expenses', value: 'SHOP_EXPENSE' },
  ];

  const handleExportCsv = (customerFacing = isRedacted) => {
    let headers: string[];
    let rows: string[][];

    if (customerFacing) {
      // Strict Customer Privacy: Strip direct costs, gross profit, and margin %
      headers = [
        'Date',
        'Reference ID',
        'Source',
        'Customer / Vehicle',
        'Description',
        'Net Selling Price (Rs.)',
        'Status',
      ];
      rows = items.map((item) => [
        `"${item.date}"`,
        `"${item.reference}"`,
        `"${item.type === 'WORKSHOP_INVOICE' ? 'Workshop Invoice' : item.type === 'POS_SALE' ? 'POS Sale' : 'Shop Expense'}"`,
        `"${(item.vehiclePlate ? `${item.vehiclePlate} - ${item.customerName || item.entityOrPayee}` : item.entityOrPayee).replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${item.salesRevenueRs > 0 ? item.salesRevenueRs.toFixed(2) : '0.00'}"`,
        `"${item.status || ''}"`,
      ]);
    } else {
      // Executive Internal Ledger: Includes costs & margins
      headers = [
        'Date',
        'Reference ID',
        'Source',
        'Customer / Vehicle',
        'Description',
        'Net Selling Price (Rs.)',
        'Direct Cost (Rs.)',
        'Gross Profit (Rs.)',
        'Margin %',
        'Status',
      ];
      rows = items.map((item) => {
        const margin =
          item.marginPercent !== undefined
            ? item.marginPercent
            : item.salesRevenueRs > 0
            ? (item.netProfitContributionRs / item.salesRevenueRs) * 100
            : 0;
        return [
          `"${item.date}"`,
          `"${item.reference}"`,
          `"${item.type === 'WORKSHOP_INVOICE' ? 'Workshop Invoice' : item.type === 'POS_SALE' ? 'POS Sale' : 'Shop Expense'}"`,
          `"${(item.vehiclePlate ? `${item.vehiclePlate} - ${item.customerName || item.entityOrPayee}` : item.entityOrPayee).replace(/"/g, '""')}"`,
          `"${(item.description || '').replace(/"/g, '""')}"`,
          `"${item.salesRevenueRs > 0 ? item.salesRevenueRs.toFixed(2) : '0.00'}"`,
          `"${item.directCostRs.toFixed(2)}"`,
          `"${item.netProfitContributionRs.toFixed(2)}"`,
          `"${margin.toFixed(1)}%"`,
          `"${item.status || ''}"`,
        ];
      });
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      customerFacing
        ? `profit-ledger-customer-statement-${new Date().toISOString().split('T')[0]}.csv`
        : `profit-ledger-executive-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Filter & Search Controls Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                Unified Chronological Profit Ledger ({items.length} records)
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                Workshop Invoices + Counter POS Sales + Garage Overheads
              </span>
            </div>
          </div>

          {/* Quick Filter Ribbon (Pills) */}
          <div className="hidden sm:block">
            <TableStatusFilterPills
              filters={filterPills}
              activeValue={typeFilter}
              onChange={onTypeFilterChange}
              testIdPrefix="filter-pill"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Optional Embedded Date Range Switcher */}
          {dateRangeOption && onDateRangeChange && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateRangeOption}
                onChange={(e) => onDateRangeChange(e.target.value as DateRangeOption)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
                data-testid="table-date-range-select"
                aria-label="Filter transactions by date period"
              >
                <option value="ALL_TIME">All Time</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="THIS_WEEK">This Week</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>
          )}

          {/* Fallback & Mobile Accessible Select */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
              data-testid="type-filter-select"
              aria-label="Filter transactions by type"
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
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="h-8 pl-8 text-xs w-48 sm:w-64"
              data-testid="search-input"
            />
          </div>

          {/* CSV Export Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv(isRedacted)}
            className="h-8 text-xs gap-1.5 border-slate-300 hover:bg-slate-50 cursor-pointer"
            title={isRedacted ? 'Export Customer Statement (Costs Stripped)' : 'Export Financial Ledger CSV'}
            data-testid="export-ledger-btn"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{isRedacted ? 'Customer Export' : 'Export CSV'}</span>
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" data-testid="ledger-table">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 font-medium text-[11px] border-b border-slate-100">
              <th className="p-3">Date & time</th>
              <th className="p-3">Reference ID</th>
              <th className="p-3">Source</th>
              <th className="p-3">Customer / vehicle</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-right">Net selling price (Rs.)</th>
              <th className="p-3 text-right cost-column print-hidden">Direct Cost (Rs.)</th>
              <th className="p-3 text-right cost-column print-hidden">Gross Profit (Rs.)</th>
              <th className="p-3 text-center cost-column print-hidden">Gross Margin %</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-12 text-center text-slate-500 italic">
                  No financial transactions or expenses found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const margin =
                  item.marginPercent !== undefined
                    ? item.marginPercent
                    : item.salesRevenueRs > 0
                    ? ((item.netProfitContributionRs / item.salesRevenueRs) * 100)
                    : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                    data-testid={`ledger-row-${item.id}`}
                  >
                    {/* Date & Time */}
                    <td className="p-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      <div className="font-semibold text-slate-900">{item.date}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </td>

                    {/* Reference ID */}
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.type === 'WORKSHOP_INVOICE' && item.job ? (
                        <button
                          type="button"
                          onClick={() => onViewInvoice && onViewInvoice(item.job!)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left font-bold"
                          title="View / Print Workshop Invoice"
                          data-testid={`ref-link-${item.reference}`}
                        >
                          {item.reference}
                        </button>
                      ) : item.type === 'POS_SALE' && item.posSale ? (
                        <button
                          type="button"
                          onClick={() => onViewReceipt && onViewReceipt(item.posSale!)}
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

                    {/* Source Badge */}
                    <td className="p-3 whitespace-nowrap">
                      <Badge
                        variant={
                          item.type === 'WORKSHOP_INVOICE'
                            ? 'invoice'
                            : item.type === 'POS_SALE'
                            ? 'success'
                            : 'destructive'
                        }
                        className="text-[10px] font-bold"
                      >
                        {item.type === 'WORKSHOP_INVOICE'
                          ? 'Workshop Invoice'
                          : item.type === 'POS_SALE'
                          ? 'POS Sale'
                          : 'Shop Expense'}
                      </Badge>
                    </td>

                    {/* Customer / Vehicle */}
                    <td className="p-3 text-slate-800 max-w-xs truncate" title={item.entityOrPayee}>
                      {item.vehiclePlate ? (
                        <div className="flex flex-col gap-0.5">
                          <TableVehicleBadgeCell
                            plateNumber={item.vehiclePlate}
                            makeModel={item.vehicleModel}
                          />
                          <span className="text-[11px] text-slate-600 font-semibold truncate">
                            {item.customerName || item.entityOrPayee}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800">{item.entityOrPayee}</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="p-3 text-slate-600 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>

                    {/* Net Selling Price (Rs.) */}
                    <td className="p-3 text-right font-sans tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {item.salesRevenueRs > 0 ? formatRs(item.salesRevenueRs) : '—'}
                    </td>

                    {/* Direct Cost (Rs.) */}
                    <td className="p-3 text-right font-sans tabular-nums font-semibold text-amber-900 whitespace-nowrap cost-cell print-hidden">
                      {item.directCostRs > 0 ? (
                        <RedactedCipherPlaceholder
                          isRedacted={isRedacted}
                          value={item.directCostRs}
                        />
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Gross Profit (Rs.) */}
                    <td
                      className={`p-3 text-right font-sans tabular-nums font-bold whitespace-nowrap cost-cell print-hidden ${
                        item.netProfitContributionRs > 0
                          ? 'text-emerald-700'
                          : item.netProfitContributionRs < 0
                          ? 'text-red-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.type === 'SHOP_EXPENSE' ? (
                        <span className="text-rose-700">
                          - {formatRs(item.operatingExpenseRs)}
                        </span>
                      ) : (
                        <>
                          {item.netProfitContributionRs >= 0 ? '+' : ''}
                          <RedactedCipherPlaceholder
                            isRedacted={isRedacted}
                            value={item.netProfitContributionRs}
                          />
                        </>
                      )}
                    </td>

                    {/* Visual TableMarginSparkBarCell */}
                    <td className="p-3 text-center whitespace-nowrap cost-cell print-hidden">
                      {item.type === 'SHOP_EXPENSE' ? (
                        <span className="text-[10px] text-slate-400 font-mono italic">
                          Overhead
                        </span>
                      ) : (
                        <div className="flex justify-center">
                          <TableMarginSparkBarCell marginPercent={margin} isRedacted={isRedacted} />
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {item.type === 'WORKSHOP_INVOICE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.status || 'INVOICED'}
                        </span>
                      )}
                      {item.type === 'POS_SALE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {item.status || 'PAID'}
                        </span>
                      )}
                      {item.type === 'SHOP_EXPENSE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          {item.status || 'DISBURSED'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {item.type === 'WORKSHOP_INVOICE' && item.job && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewInvoice && onViewInvoice(item.job!)}
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
                          onClick={() => onViewReceipt && onViewReceipt(item.posSale!)}
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
                          onClick={() =>
                            onDeleteExpense &&
                            onDeleteExpense(item.reference, item.description)
                          }
                          className="h-7 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 cursor-pointer"
                          title="Delete Expense Voucher"
                          data-testid={`delete-expense-btn-${item.reference}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
