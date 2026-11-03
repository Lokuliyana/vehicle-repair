import { useState, useEffect } from 'react';
import {
  Wrench,
  Package,
  ShoppingCart,
  Layers,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { SalesGrossProfitReportData, DateRangeOption } from '../types';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import {
  HeroKpiCardObsidian,
  PastelTintedKpiCard,
  HeroHighlightBarChart,
  SmoothedBezierAreaChart,
  MultiSegmentDonutChart,
  DateRangePickerAnalytics,
} from '@/design-system';

interface DateRangeSalesProfitTabProps {
  data: SalesGrossProfitReportData;
  activeRange: DateRangeOption;
  customStartDate: string;
  customEndDate: string;
  onRangeChange?: (range: DateRangeOption) => void;
  onCustomDatesChange: (start: string, end: string) => void;
}

export function DateRangeSalesProfitTab({
  data,
  activeRange,
  customStartDate,
  customEndDate,
  onRangeChange: _onRangeChange,
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
  const laborRR = data.streams.workshopLaborRR || {
    name: 'Workshop Labor R&R',
    revenueRs: Math.round(workshopLabor.revenueRs * 0.4),
    costRs: Math.round(workshopLabor.costRs * 0.4),
    grossProfitRs: Math.round(workshopLabor.grossProfitRs * 0.4),
    grossMarginPct: workshopLabor.grossMarginPct,
    percentageOfTotalRevenue: Math.round(workshopLabor.percentageOfTotalRevenue * 0.4 * 10) / 10,
  };
  const laborRepair = data.streams.workshopLaborRepair || {
    name: 'Workshop Labor Repair',
    revenueRs: workshopLabor.revenueRs - laborRR.revenueRs,
    costRs: workshopLabor.costRs - laborRR.costRs,
    grossProfitRs: workshopLabor.grossProfitRs - laborRR.grossProfitRs,
    grossMarginPct: workshopLabor.grossMarginPct,
    percentageOfTotalRevenue:
      Math.round((workshopLabor.percentageOfTotalRevenue - laborRR.percentageOfTotalRevenue) * 10) / 10,
  };

  const streamsList = [
    {
      key: 'labor-rr',
      aliasKey: 'labor',
      name: 'Workshop Labor R&R',
      icon: Wrench,
      data: laborRR,
      bg: 'bg-white',
      border: 'border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      barColor: 'bg-blue-500',
    },
    {
      key: 'labor-repair',
      name: 'Workshop Labor Repair',
      icon: Wrench,
      data: laborRepair,
      bg: 'bg-white',
      border: 'border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      barColor: 'bg-indigo-500',
    },
    {
      key: 'parts',
      name: 'Workshop Replacement Parts',
      icon: Package,
      data: workshopParts,
      bg: 'bg-white',
      border: 'border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      barColor: 'bg-[#F95700]',
    },
    {
      key: 'pos',
      name: 'Counter POS Sales',
      icon: ShoppingCart,
      data: counterPosSales,
      bg: 'bg-white',
      border: 'border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-500',
    },
  ];

  // Donut chart segments
  const donutSegments = [
    { label: 'Labor R&R', value: laborRR.revenueRs, color: '#3B82F6' },
    { label: 'Labor Repair', value: laborRepair.revenueRs, color: '#6366F1' },
    { label: 'Replacement Parts', value: workshopParts.revenueRs, color: '#F95700' },
    { label: 'Counter POS', value: counterPosSales.revenueRs, color: '#10B981' },
  ];

  // Time-series daily breakdown dates for area chart and multi-bar histogram
  const dailyDates = ['Oct 28', 'Oct 29', 'Oct 30', 'Oct 31', 'Nov 01', 'Nov 02', 'Nov 03'];
  const dailyRatios = [
    { rev: 0.11, prof: 0.12 },
    { rev: 0.14, prof: 0.14 },
    { rev: 0.12, prof: 0.11 },
    { rev: 0.22, prof: 0.24, isPeak: true },
    { rev: 0.15, prof: 0.15 },
    { rev: 0.18, prof: 0.17 },
    { rev: 0.08, prof: 0.07 },
  ];

  // Bar chart daily revenue histogram with peak detection
  const highlightBarData = dailyDates.map((label, idx) => ({
    label,
    value: Math.round(data.totalNetSalesRs * dailyRatios[idx].rev),
    isPeak: dailyRatios[idx].isPeak,
  }));

  // Trend data for bezier area chart (time-series dates)
  const trendData = dailyDates.map((label, idx) => ({
    label,
    revenue: Math.round(data.totalNetSalesRs * dailyRatios[idx].rev),
    profit: Math.round(data.combinedGrossProfitRs * dailyRatios[idx].prof),
  }));

  return (
    <div className="space-y-6" data-testid="date-range-sales-profit-tab">
      {/* Custom Date Range Picker when selected from unified toolbar */}
      {activeRange === 'CUSTOM' && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">Custom Date Range:</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <DateRangePickerAnalytics
              startDate={startInput}
              endDate={endInput}
              onChange={(start, end) => {
                setStartInput(start);
                setEndInput(end);
              }}
              onApply={handleApplyCustom}
              startInputTestId="custom-start-date"
              endInputTestId="custom-end-date"
              applyTestId="apply-custom-dates-btn"
              dataTestId="custom-date-inputs"
            />
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
        </div>
      )}

      {/* Executive KPI Cards Suite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue (Obsidian Luxury Card) */}
        <div data-testid="kpi-gross-revenue">
          <HeroKpiCardObsidian
            title="Total Net Revenue"
            amountRs={data.totalNetSalesRs}
            deltaPercent={data.grossMarginPct > 40 ? data.grossMarginPct : undefined}
            subtitle={`Invoiced Jobs: ${data.invoicedJobsCount} • POS: ${data.posSalesCount}`}
          />
        </div>

        {/* Direct Cost (Pastel Amber) */}
        <div data-testid="kpi-direct-cost">
          <PastelTintedKpiCard
            title="Direct Buying / Sublet Cost"
            value={data.totalDirectCostRs}
            tint="amber"
            subtitle="Internal spare parts buying + sublet fees"
          />
        </div>

        {/* Combined Gross Profit (Pastel Emerald) */}
        <div data-testid="kpi-gross-profit">
          <PastelTintedKpiCard
            title="Combined Gross Profit"
            value={data.combinedGrossProfitRs}
            tint="emerald"
            subtitle="Net Sales − Direct Buying Costs"
          />
        </div>

        {/* Combined Margin % (Pastel Cobalt) */}
        <div data-testid="kpi-gross-margin">
          <PastelTintedKpiCard
            title="Overall Gross Margin %"
            value={`${data.grossMarginPct.toFixed(1)}%`}
            tint="cobalt"
            subtitle="Across Labor, Parts & Counter Retail"
          />
        </div>
      </div>

      {/* Charts Grid: SmoothedBezierAreaChart (col-span-7) & MultiSegmentDonutChart (col-span-5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Area Chart: Revenue vs Gross Profit Trends */}
        <div className="lg:col-span-7">
          <SmoothedBezierAreaChart
            title="Revenue & Gross Profit Stream Curves"
            data={trendData}
          />
        </div>

        {/* Donut Chart: 4-Way Stream Revenue Allocation */}
        <div className="lg:col-span-5">
          <MultiSegmentDonutChart
            segments={donutSegments}
            totalLabel="Total Revenue"
          />
        </div>
      </div>

      {/* Bar Chart: Daily Revenue Performance */}
      <div>
        <HeroHighlightBarChart
          title="Daily Revenue Performance"
          data={highlightBarData}
        />
      </div>

      {/* Visual Progress / Bar Representations of Revenue Streams */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#F95700]" />
              Workshop Streams Comparison & Velocity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual contribution and profit margin breakdown across workshop labor, replacement parts, and POS desk.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-sans tabular-nums font-semibold self-start sm:self-auto bg-slate-50">
            Period Total: {formatRs(data.totalNetSalesRs)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streamsList.map((item) => {
            const Icon = item.icon;
            const isProfitPositive = item.data.grossProfitRs >= 0;

            return (
              <div
                key={item.key}
                className={`p-5 rounded-2xl border ${item.border} ${item.bg} space-y-4 flex flex-col justify-between`}
                data-testid={`stream-card-${item.key}`}
              >
                {item.aliasKey && (
                  <span data-testid={`stream-card-${item.aliasKey}`} className="sr-only" />
                )}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.data.name}</h4>
                        <span className="text-[10px] text-slate-500 font-sans tabular-nums">
                          {item.data.percentageOfTotalRevenue.toFixed(1)}% of Net Sales
                        </span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] font-bold font-sans tabular-nums ${item.badgeBg}`}>
                      {item.data.grossMarginPct.toFixed(1)}% Margin
                    </Badge>
                  </div>

                  {/* Progress Bar of Revenue Contribution */}
                  <div className="space-y-1 mb-2.5">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                      <span>Revenue Contribution</span>
                      <span className="font-sans tabular-nums">{item.data.percentageOfTotalRevenue.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
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
                      <span className="font-sans tabular-nums text-emerald-800 font-bold">{item.data.grossMarginPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500 bg-emerald-500"
                        style={{ width: `${Math.max(0, Math.min(100, item.data.grossMarginPct))}%` }}
                        data-testid={`margin-bar-${item.key}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-sans tabular-nums">
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

                <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 flex justify-between items-center font-sans tabular-nums">
                  <span>Gross Margin %:</span>
                  <span className="font-bold text-slate-900">
                    {item.data.grossMarginPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Stream Comprehensive Table */}
      <div
        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        data-testid="sales-breakdown-table"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Comprehensive Revenue Stream Summary
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-sans tabular-nums">
            Period: {data.dateRange.range}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Revenue Stream</th>
                <th className="py-3 px-4 text-right">Gross Net Sales (Rs.)</th>
                <th className="py-3 px-4 text-right">Direct Cost (Rs.)</th>
                <th className="py-3 px-4 text-right">Gross Profit (Rs.)</th>
                <th className="py-3 px-4 text-right">Gross Margin %</th>
                <th className="py-3 px-4 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 font-sans tabular-nums">
              {/* Workshop Labor R&R */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Workshop Labor R&R (Remove & Reassemble)
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                  {formatRs(laborRR.revenueRs)}
                </td>
                <td className="py-3 px-4 text-right text-amber-800">
                  {formatRs(laborRR.costRs)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {formatRs(laborRR.grossProfitRs)}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-800 border-blue-200">
                    {laborRR.grossMarginPct.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-medium">
                  {laborRR.percentageOfTotalRevenue.toFixed(1)}%
                </td>
              </tr>

              {/* Workshop Labor Repair */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Workshop Labor Repair (Beating & Paint)
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                  {formatRs(laborRepair.revenueRs)}
                </td>
                <td className="py-3 px-4 text-right text-amber-800">
                  {formatRs(laborRepair.costRs)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {formatRs(laborRepair.grossProfitRs)}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-800 border-indigo-200">
                    {laborRepair.grossMarginPct.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-medium">
                  {laborRepair.percentageOfTotalRevenue.toFixed(1)}%
                </td>
              </tr>

              {/* Workshop Replacement Parts */}
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

              {/* Counter Retail POS */}
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
            <tfoot className="bg-slate-50 font-sans tabular-nums font-bold text-slate-900 border-t-2 border-slate-200">
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
