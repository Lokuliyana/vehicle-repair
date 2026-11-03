import { clsx } from 'clsx';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Scissors,
  Wrench,
  Package,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { ProfitLedgerSummary } from '../types';
import { RedactedCipherPlaceholder } from '@/design-system/components/finance-privacy-components';

export interface ProfitKpiCardsProps {
  summary: ProfitLedgerSummary;
  isRedacted?: boolean;
}

export function ProfitKpiCards({ summary, isRedacted = false }: ProfitKpiCardsProps) {
  const isNetProfitPositive = summary.netOperatingProfitRs >= 0;

  return (
    <div className="space-y-6" data-testid="profit-kpi-section">
      {/* 5-Column Executive Cockpit */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1: Net Sales Revenue */}
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-sales"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Net Sales Revenue
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight font-sans tabular-nums">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.totalNetSalesRs} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Workshop + POS Walk-in
            </div>
          </div>
        </div>

        {/* Card 2: Total Direct Cost */}
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between cost-cell"
          data-testid="kpi-card-direct-cost"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Direct Cost
            </span>
            <Scissors className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight font-sans tabular-nums">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.totalDirectCostRs} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Parts buying + Sublet
            </div>
          </div>
        </div>

        {/* Card 3: Gross Profit */}
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-gross-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Gross Profit
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight font-sans tabular-nums">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.combinedGrossProfitRs} />
            </div>
            <div className="mt-1">
              <span className="bg-emerald-50 text-emerald-700 font-sans tabular-nums font-semibold text-[10px] px-2 py-0.5 rounded-full inline-block">
                {isRedacted ? '••••%' : `${summary.grossMarginPct.toFixed(1)}% Margin`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Shop Overheads */}
        <div
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-expenses"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Shop Overheads
            </span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tracking-tight font-sans tabular-nums">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.dailyOperatingExpensesRs} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Direct shop overheads
            </div>
          </div>
        </div>

        {/* Card 5: Net Operating Profit (Hero Obsidian Card) */}
        <div
          className="bg-[#0F172A] text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between"
          data-testid="kpi-card-net-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Net Operating Profit
            </span>
            <span
              className={clsx(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                isNetProfitPositive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              )}
            >
              {isNetProfitPositive ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-white tracking-tight font-sans tabular-nums">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.netOperatingProfitRs} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Gross Profit - Overheads
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stream Breakdown Card */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
        data-testid="revenue-stream-breakdown"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F95700]"></span>
              Revenue Stream Breakdown & Direct Margin Analysis
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparative analysis of Workshop Labor Services, Workshop Replacement Parts, and Counter POS Sales.
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto"
            data-testid="kpi-card-receivables"
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px] font-medium text-slate-500">Receivables:</span>
            <span className="font-bold text-slate-900 font-sans tabular-nums">
              <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.totalOutstandingReceivablesRs} />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Stream 1: Workshop Labor Services */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Workshop Labor</div>
                  <div className="text-[10px] text-slate-500">Remove & Reassemble, Body Tinkering, Paint</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-sans tabular-nums">
              <div className="flex justify-between items-center text-slate-600">
                <span>Revenue:</span>
                <span className="font-semibold text-slate-900">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.workshopLaborRevenueRs} />
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 cost-cell">
                <span>Direct Costs:</span>
                <span className="font-semibold text-amber-800">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.workshopLaborCostRs} />
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 font-bold">
                <span className="text-slate-900">Labor Profit:</span>
                <span className="text-emerald-700">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.workshopLaborProfitRs} />
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 font-semibold bg-slate-50 py-1 px-2 rounded flex justify-between font-sans tabular-nums">
              <span>Labor Margin:</span>
              <span>
                {isRedacted
                  ? '••••%'
                  : `${summary.workshopLaborRevenueRs > 0
                      ? ((summary.workshopLaborProfitRs / summary.workshopLaborRevenueRs) * 100).toFixed(1)
                      : '0.0'}%`}
              </span>
            </div>
          </div>

          {/* Stream 2: Workshop Replacement Parts */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Workshop Parts</div>
                  <div className="text-[10px] text-slate-500">Replacement panels, lamps, mechanical parts</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-sans tabular-nums">
              <div className="flex justify-between items-center text-slate-600">
                <span>Revenue:</span>
                <span className="font-semibold text-slate-900">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.workshopPartsRevenueRs} />
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 cost-cell">
                <span>Buying Costs:</span>
                <span className="font-semibold text-amber-800">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.workshopPartsCostRs} />
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 font-bold">
                <span className="text-slate-900">Parts Profit:</span>
                <span className="text-emerald-700">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.workshopPartsProfitRs} />
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 font-semibold bg-slate-50 py-1 px-2 rounded flex justify-between font-sans tabular-nums">
              <span>Parts Margin:</span>
              <span>
                {isRedacted
                  ? '••••%'
                  : `${summary.workshopPartsRevenueRs > 0
                      ? ((summary.workshopPartsProfitRs / summary.workshopPartsRevenueRs) * 100).toFixed(1)
                      : '0.0'}%`}
              </span>
            </div>
          </div>

          {/* Stream 3: Counter POS Sales */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Counter POS Sales</div>
                  <div className="text-[10px] text-slate-500">Walk-in retail, engine oils, consumables</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-sans tabular-nums">
              <div className="flex justify-between items-center text-slate-600">
                <span>Sales Revenue:</span>
                <span className="font-semibold text-slate-900">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.posSalesRevenueRs} />
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 cost-cell">
                <span>Buying Costs:</span>
                <span className="font-semibold text-amber-800">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.posBuyingCostRs} />
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 font-bold">
                <span className="text-slate-900">POS Profit:</span>
                <span className="text-emerald-700">
                  <RedactedCipherPlaceholder isRedacted={isRedacted} value={summary.posGrossProfitRs} />
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 font-semibold bg-slate-50 py-1 px-2 rounded flex justify-between font-sans tabular-nums">
              <span>POS Margin:</span>
              <span>
                {isRedacted
                  ? '••••%'
                  : `${summary.posSalesRevenueRs > 0
                      ? ((summary.posGrossProfitRs / summary.posSalesRevenueRs) * 100).toFixed(1)
                      : '0.0'}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
