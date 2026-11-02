import { TrendingUp, Lock } from 'lucide-react';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';

interface ProfitRow {
  id: string;
  date: string;
  reference: string;
  type: 'WORKSHOP_INVOICE' | 'POS_SALE' | 'SHOP_EXPENSE';
  description: string;
  grossSalesRs: number;
  directCostRs: number;
  grossProfitRs: number;
}

const MOCK_PROFIT_ROWS: ProfitRow[] = [
  {
    id: 'pr-1',
    date: '2026-11-02',
    reference: 'JOB-2026-0040',
    type: 'WORKSHOP_INVOICE',
    description: 'Vehicle SP CAA-8822 (Suzuki Wagon R Accident Repair)',
    grossSalesRs: 42500,
    directCostRs: 26000,
    grossProfitRs: 16500,
  },
  {
    id: 'pr-2',
    date: '2026-11-02',
    reference: 'POS-2026-0891',
    type: 'POS_SALE',
    description: 'Counter Walk-in: Toyota Engine Oil + Oil Filter',
    grossSalesRs: 16700,
    directCostRs: 12600,
    grossProfitRs: 4100,
  },
  {
    id: 'pr-3',
    date: '2026-11-02',
    reference: 'EXP-2026-0012',
    type: 'SHOP_EXPENSE',
    description: 'Daily Workshop Consumables (Sandpaper & Masking Tape)',
    grossSalesRs: 0,
    directCostRs: 2200,
    grossProfitRs: -2200,
  },
];

export function ProfitLedgerPage() {
  const totalSales = 59200;
  const totalDirectCosts = 38600;
  const grossProfit = 20600;
  const dailyExpenses = 2200;
  const netOperatingProfit = 18400;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="profit-ledger-page">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Unified Profit & Financial Ledger
            </h1>
            <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 text-[10px] gap-1">
              <Lock className="w-2.5 h-2.5" /> Owner / Manager Only
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Gross Profit & Operating Margin tracking across Workshop Invoices and Counter POS.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Total Gross Sales</div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatRs(totalSales)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Workshop + POS</div>
        </div>

        <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-xs text-amber-800 font-semibold">Total Direct Costs</div>
          <div className="text-2xl font-black text-amber-950 mt-2">{formatRs(totalDirectCosts)}</div>
          <div className="text-[11px] text-amber-700 mt-1">Parts & sublet costs</div>
        </div>

        <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-xs text-emerald-800 font-semibold">Gross Profit (34.8%)</div>
          <div className="text-2xl font-black text-emerald-950 mt-2">{formatRs(grossProfit)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">Sales − Direct Costs</div>
        </div>

        <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-xs text-blue-800 font-semibold">Net Operating Profit</div>
          <div className="text-2xl font-black text-blue-950 mt-2">{formatRs(netOperatingProfit)}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-semibold">
            Gross Profit − Expenses ({formatRs(dailyExpenses)})
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
          Transaction Journal (Today)
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
              <th className="p-3">Date</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-right">Revenue (Rs.)</th>
              <th className="p-3 text-right">Direct Cost (Rs.)</th>
              <th className="p-3 text-right">Gross Profit (Rs.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {MOCK_PROFIT_ROWS.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-600">{row.date}</td>
                <td className="p-3 font-mono font-bold text-slate-900">{row.reference}</td>
                <td className="p-3">
                  <Badge
                    variant={
                      row.type === 'WORKSHOP_INVOICE'
                        ? 'invoice'
                        : row.type === 'POS_SALE'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {row.type.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-3 text-slate-800">{row.description}</td>
                <td className="p-3 text-right font-mono text-slate-900 font-semibold">
                  {formatRs(row.grossSalesRs)}
                </td>
                <td className="p-3 text-right font-mono text-amber-900 font-semibold">
                  {formatRs(row.directCostRs)}
                </td>
                <td
                  className={`p-3 text-right font-mono font-bold ${
                    row.grossProfitRs >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {formatRs(row.grossProfitRs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
