import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Scissors,
  Percent,
  Wrench,
  Package,
  ShoppingCart,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { SalesGrossProfitReportData, DateRangeOption } from '../types';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DateRangeSalesProfitTabProps {
  data: SalesGrossProfitReportData;
  activeRange: DateRangeOption;
  customStartDate: string;
  customEndDate: string;
  onRangeChange: (range: DateRangeOption) => void;
  onCustomDatesChange: (start: string, end: string) => void;
}

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeOption }[] = [
  { label: 'Today', value: 'TODAY' },
  { label: 'This Week', value: 'THIS_WEEK' },
  { label: 'This Month', value: 'THIS_MONTH' },
  { label: 'This Quarter', value: 'THIS_QUARTER' },
  { label: 'Custom Range', value: 'CUSTOM' },
];

export function DateRangeSalesProfitTab({
  data,
  activeRange,
  customStartDate,
  customEndDate,
  onRangeChange,
  onCustomDatesChange,
}: DateRangeSalesProfitTabProps) {
  const [startInput, setStartInput] = useState(customStartDate);
  const [endInput, setEndInput] = useState(customEndDate);

  useEffect(() => {
    setStartInput(customStartDate);
  }, [customStartDate]);

  useEffect(() => {
    setEndInput(customEndDate);
  }, [customEndDate]);

  const isInvertedRange = Boolean(startInput && endInput && startInput > endInput);

  const handleApplyCustom = () => {
    onCustomDatesChange(startInput, endInput);
  };

  const { workshopLabor, workshopParts, counterPosSales } = data.streams;
  const streamsList = [
    {
      key: 'labor',
      icon: Wrench,
      data: workshopLabor,
      bg: 'bg-blue-50/50',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-800',
      barColor: 'bg-blue-500',
    },
    {
      key: 'parts',
      icon: Package,
      data: workshopParts,
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800',
      barColor: 'bg-amber-500',
    },
    {
      key: 'pos',
      icon: ShoppingCart,
      data: counterPosSales,
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      barColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6" data-testid="date-range-sales-profit-tab">
      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Analysis Period:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 ml-1">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={activeRange === opt.value ? 'default' : 'outline'}
                onClick={() => onRangeChange(opt.value)}
                className={`text-xs h-8 px-3 ${
                  activeRange === opt.value
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid={`filter-btn-${opt.value.toLowerCase()}`}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {activeRange === 'CUSTOM' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2" data-testid="custom-date-inputs">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="h-8 text-xs font-mono w-36"
                data-testid="custom-start-date"
              />
              <span className="text-xs text-slate-400 font-medium">to</span>
              <Input
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="h-8 text-xs font-mono w-36"
                data-testid="custom-end-date"
              />
              <Button
                size="sm"
                variant="default"
                onClick={handleApplyCustom}
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="apply-custom-dates-btn"
              >
                Apply
              </Button>
            </div>
            {isInvertedRange && (
              <div
                className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium"
                data-testid="inverted-dates-notice"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Start date is later than end date; dates will be auto-normalized.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* High-Level Sales & Gross Profit KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-gross-revenue"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Net Revenue
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatRs(data.totalNetSalesRs)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Invoiced Jobs: {data.invoicedJobsCount}</span>
            <span>POS Sales: {data.posSalesCount}</span>
          </div>
        </div>

        {/* Direct Cost */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-direct-cost"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Direct Buying / Sublet Cost
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono tracking-tight">
            {formatRs(data.totalDirectCostRs)}
          </div>
          <div className="text-[11px] text-amber-700">
            Internal parts buying + sublet labor fees
          </div>
        </div>

        {/* Combined Gross Profit */}
        <div
          className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200 shadow-xs space-y-2"
          data-testid="kpi-gross-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Combined Gross Profit
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
            {formatRs(data.combinedGrossProfitRs)}
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
            <span>Net Sales − Direct Buying Costs</span>
          </div>
        </div>

        {/* Combined Margin % */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-gross-margin"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Gross Margin %
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {data.grossMarginPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500">
            Across Labor, Parts & Counter Retail
          </div>
        </div>
      </div>

      {/* Visual Progress / Bar Representations of the 3 Revenue Streams */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              3-Revenue Stream Comparison & Velocity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual contribution and profit margin breakdown across workshop labor, replacement parts, and POS desk.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto bg-slate-50">
            Period Total: {formatRs(data.totalNetSalesRs)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {streamsList.map((item) => {
            const Icon = item.icon;
            const isProfitPositive = item.data.grossProfitRs >= 0;

            return (
              <div
                key={item.key}
                className={`p-5 rounded-xl border ${item.border} ${item.bg} space-y-4 flex flex-col justify-between`}
                data-testid={`stream-card-${item.key}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white shadow-2xs text-slate-800">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.data.name}</h4>
                        <span className="text-[10px] text-slate-500">
                          {item.data.percentageOfTotalRevenue.toFixed(1)}% of Net Sales
                        </span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] font-bold ${item.badgeBg}`}>
                      {item.data.grossMarginPct.toFixed(1)}% Margin
                    </Badge>
                  </div>

                  {/* Progress Bar of Revenue Contribution */}
                  <div className="space-y-1 mb-2.5">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                      <span>Revenue Contribution</span>
                      <span className="font-mono">{item.data.percentageOfTotalRevenue.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${item.barColor}`}
                        style={{ width: `${Math.min(100, item.data.percentageOfTotalRevenue)}%` }}
                        data-testid={`progress-bar-${item.key}`}
                      />
                    </div>
                  </div>

                  {/* Progress Bar of Gross Margin Efficiency */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                      <span>Gross Margin Efficiency</span>
                      <span className="font-mono text-emerald-800 font-bold">{item.data.grossMarginPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500 bg-emerald-500"
                        style={{ width: `${Math.max(0, Math.min(100, item.data.grossMarginPct))}%` }}
                        data-testid={`margin-bar-${item.key}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Gross Revenue:</span>
                      <span className="font-bold text-slate-900">{formatRs(item.data.revenueRs)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Direct Buying Cost:</span>
                      <span className="font-semibold text-amber-800">{formatRs(item.data.costRs)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 font-bold">
                      <span className="text-slate-900">Gross Profit:</span>
                      <span className={isProfitPositive ? 'text-emerald-700' : 'text-red-700'}>
                        {formatRs(item.data.grossProfitRs)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 flex justify-between items-center">
                  <span>Gross Margin %:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {item.data.grossMarginPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stream Breakdown Table */}
      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
        data-testid="sales-breakdown-table"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Comprehensive Revenue Stream Summary
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Period: {data.dateRange.range}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Revenue Stream</th>
                <th className="py-3 px-4 text-right">Gross Net Sales (Rs.)</th>
                <th className="py-3 px-4 text-right">Direct Cost (Rs.)</th>
                <th className="py-3 px-4 text-right">Gross Profit (Rs.)</th>
                <th className="py-3 px-4 text-right">Gross Margin %</th>
                <th className="py-3 px-4 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Workshop Labor Services
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                  {formatRs(workshopLabor.revenueRs)}
                </td>
                <td className="py-3 px-4 text-right text-amber-800">
                  {formatRs(workshopLabor.costRs)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {formatRs(workshopLabor.grossProfitRs)}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-800 border-blue-200">
                    {workshopLabor.grossMarginPct.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-medium">
                  {workshopLabor.percentageOfTotalRevenue.toFixed(1)}%
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Workshop Replacement Parts
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                  {formatRs(workshopParts.revenueRs)}
                </td>
                <td className="py-3 px-4 text-right text-amber-800">
                  {formatRs(workshopParts.costRs)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {formatRs(workshopParts.grossProfitRs)}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                    {workshopParts.grossMarginPct.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-medium">
                  {workshopParts.percentageOfTotalRevenue.toFixed(1)}%
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Counter POS Retail Sales
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                  {formatRs(counterPosSales.revenueRs)}
                </td>
                <td className="py-3 px-4 text-right text-amber-800">
                  {formatRs(counterPosSales.costRs)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {formatRs(counterPosSales.grossProfitRs)}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                    {counterPosSales.grossMarginPct.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-medium">
                  {counterPosSales.percentageOfTotalRevenue.toFixed(1)}%
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 font-mono font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="py-3 px-4 font-sans">Total Combined Portfolio</td>
                <td className="py-3 px-4 text-right">{formatRs(data.totalNetSalesRs)}</td>
                <td className="py-3 px-4 text-right text-amber-900">{formatRs(data.totalDirectCostRs)}</td>
                <td className="py-3 px-4 text-right text-emerald-800">{formatRs(data.combinedGrossProfitRs)}</td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="default" className="text-[10px] bg-slate-900 text-white">
                    {data.grossMarginPct.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
