import {
  TrendingUp,
  DollarSign,
  Receipt,
  Scissors,
  Wrench,
  Package,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatRs } from '@/utils/currency';
import { ProfitLedgerSummary } from '../types';
import { Badge } from '@/components/ui/badge';

export interface ProfitKpiCardsProps {
  summary: ProfitLedgerSummary;
}

export function ProfitKpiCards({ summary }: ProfitKpiCardsProps) {
  const isNetProfitPositive = summary.netOperatingProfitRs >= 0;
  const isGrossProfitPositive = summary.combinedGrossProfitRs >= 0;

  return (
    <div className="space-y-6" data-testid="profit-kpi-section">
      {/* 6 High-Level Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Total Net Sales Revenue */}
        <div
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-sales"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Net Sales
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
              {formatRs(summary.totalNetSalesRs)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Workshop Invoices + Counter POS
            </div>
          </div>
        </div>

        {/* Card 2: Total Direct Cost */}
        <div
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-direct-cost"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Total Direct Cost
            </span>
            <Scissors className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-amber-950 tracking-tight font-mono">
              {formatRs(summary.totalDirectCostRs)}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">
              Parts Buying + Sublet Labor
            </div>
          </div>
        </div>

        {/* Card 3: Combined Gross Profit & Margin % */}
        <div
          className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-gross-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Combined Gross Profit
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div
              className={`text-xl font-black tracking-tight font-mono ${
                isGrossProfitPositive ? 'text-emerald-950' : 'text-red-700'
              }`}
            >
              {formatRs(summary.combinedGrossProfitRs)}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-100/80 text-emerald-800 border-emerald-300 font-mono text-[10px] px-1.5 py-0"
              >
                {summary.grossMarginPct.toFixed(1)}% Margin
              </Badge>
              <span className="text-[10px] text-emerald-700">Sales − Cost</span>
            </div>
          </div>
        </div>

        {/* Card 4: Daily Shop Operating Expenses */}
        <div
          className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-expenses"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Shop Expenses
            </span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-rose-950 tracking-tight font-mono">
              {formatRs(summary.dailyOperatingExpensesRs)}
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">
              Consumables, Tea, Sublet & Rent
            </div>
          </div>
        </div>

        {/* Card 5: Net Shop Operating Profit */}
        <div
          className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
            isNetProfitPositive
              ? 'bg-blue-50/70 border-blue-200'
              : 'bg-red-50/80 border-red-300'
          }`}
          data-testid="kpi-card-net-profit"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isNetProfitPositive ? 'text-blue-900' : 'text-red-900'
              }`}
            >
              Net Operating Profit
            </span>
            {isNetProfitPositive ? (
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="mt-2">
            <div
              className={`text-xl font-black tracking-tight font-mono ${
                isNetProfitPositive ? 'text-blue-950' : 'text-red-900'
              }`}
            >
              {formatRs(summary.netOperatingProfitRs)}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Gross Profit − Shop Expenses
            </div>
          </div>
        </div>

        {/* Card 6: Outstanding Receivables */}
        <div
          className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 shadow-xs flex flex-col justify-between"
          data-testid="kpi-card-receivables"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-purple-950 tracking-tight font-mono">
              {formatRs(summary.totalOutstandingReceivablesRs)}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5">
              Ins: {formatRs(summary.pendingInsuranceClaimsRs)} | Cust: {formatRs(summary.customerBalancesDueRs)}
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
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Revenue Stream Breakdown & Direct Margin Analysis
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparative analysis of Workshop Labor Services, Workshop Replacement Parts, and Counter POS Sales.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 self-start sm:self-auto">
            Real-time Direct Cost Matching
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Stream 1: Workshop Labor Services */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Workshop Labor</div>
                  <div className="text-[10px] text-slate-500">Remove & Reassemble, Body Tinkering, Paint</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-600">
                <span>Revenue:</span>
                <span className="font-semibold text-slate-900">{formatRs(summary.workshopLaborRevenueRs)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Direct Costs:</span>
                <span className="font-semibold text-amber-800">{formatRs(summary.workshopLaborCostRs)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-blue-200/60 font-bold">
                <span className="text-blue-950">Labor Profit:</span>
                <span className="text-emerald-700">{formatRs(summary.workshopLaborProfitRs)}</span>
              </div>
            </div>

            <div className="text-[11px] text-blue-900 font-semibold bg-blue-100/70 py-1 px-2 rounded flex justify-between">
              <span>Labor Margin:</span>
              <span>
                {summary.workshopLaborRevenueRs > 0
                  ? ((summary.workshopLaborProfitRs / summary.workshopLaborRevenueRs) * 100).toFixed(1)
                  : '0.0'}
                %
              </span>
            </div>
          </div>

          {/* Stream 2: Workshop Replacement Parts */}
          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Workshop Parts</div>
                  <div className="text-[10px] text-slate-500">Replacement panels, lamps, mechanical parts</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-600">
                <span>Revenue:</span>
                <span className="font-semibold text-slate-900">{formatRs(summary.workshopPartsRevenueRs)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Buying Costs:</span>
                <span className="font-semibold text-amber-800">{formatRs(summary.workshopPartsCostRs)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-amber-200/60 font-bold">
                <span className="text-amber-950">Parts Profit:</span>
                <span className="text-emerald-700">{formatRs(summary.workshopPartsProfitRs)}</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-950 font-semibold bg-amber-100/70 py-1 px-2 rounded flex justify-between">
              <span>Parts Margin:</span>
              <span>
                {summary.workshopPartsRevenueRs > 0
                  ? ((summary.workshopPartsProfitRs / summary.workshopPartsRevenueRs) * 100).toFixed(1)
                  : '0.0'}
                %
              </span>
            </div>
          </div>

          {/* Stream 3: Counter POS Sales */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Counter POS Sales</div>
                  <div className="text-[10px] text-slate-500">Walk-in retail, engine oils, consumables</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-600">
                <span>Sales Revenue:</span>
                <span className="font-semibold text-slate-900">{formatRs(summary.posSalesRevenueRs)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Buying Costs:</span>
                <span className="font-semibold text-amber-800">{formatRs(summary.posBuyingCostRs)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60 font-bold">
                <span className="text-emerald-950">POS Profit:</span>
                <span className="text-emerald-700">{formatRs(summary.posGrossProfitRs)}</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-950 font-semibold bg-emerald-100/70 py-1 px-2 rounded flex justify-between">
              <span>POS Margin:</span>
              <span>
                {summary.posSalesRevenueRs > 0
                  ? ((summary.posGrossProfitRs / summary.posSalesRevenueRs) * 100).toFixed(1)
                  : '0.0'}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
