import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Flame,
  Search,
  ExternalLink,
  Boxes,
  TrendingUp,
} from 'lucide-react';
import { InventoryVelocityAndAlertsReportData, StockAlertSeverity, DateRangeOption } from '../types';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface FastMovingPartsAlertsTabProps {
  data: InventoryVelocityAndAlertsReportData;
  activeRange?: DateRangeOption;
}

export function FastMovingPartsAlertsTab({ data, activeRange = 'THIS_MONTH' }: FastMovingPartsAlertsTabProps) {
  const [partsSearch, setPartsSearch] = useState('');
  const [alertsSearch, setAlertsSearch] = useState('');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'ALL' | StockAlertSeverity>('ALL');

  const filteredFastMoving = useMemo(() => {
    if (!partsSearch.trim()) return data.fastMovingParts;
    const q = partsSearch.toLowerCase().trim();
    return data.fastMovingParts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [data.fastMovingParts, partsSearch]);

  const filteredAlerts = useMemo(() => {
    return data.lowStockAlerts.filter((a) => {
      if (alertSeverityFilter !== 'ALL' && a.status !== alertSeverityFilter) {
        return false;
      }
      if (alertsSearch.trim()) {
        const q = alertsSearch.toLowerCase().trim();
        return (
          a.name.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.lowStockAlerts, alertSeverityFilter, alertsSearch]);

  const topConsumedItem = data.fastMovingParts[0];

  return (
    <div className="space-y-6" data-testid="fast-moving-parts-alerts-tab">
      {/* High-Level Inventory Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Fast Mover */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-top-mover"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top Fast-Moving Item
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 tracking-tight truncate" title={topConsumedItem?.name}>
            {topConsumedItem ? topConsumedItem.name : 'No Items'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {topConsumedItem ? `${topConsumedItem.totalQtyConsumed} ${topConsumedItem.uom} sold/used` : '0 sold'}
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div
          className={`p-5 rounded-xl border shadow-xs space-y-2 ${
            data.totalOutOfStockItemsCount > 0
              ? 'bg-rose-50/60 border-rose-300'
              : 'bg-white border-slate-200'
          }`}
          data-testid="kpi-out-of-stock"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Critical Out of Stock
            </span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-950 font-mono tracking-tight">
            {data.totalOutOfStockItemsCount} Items
          </div>
          <div className="text-[11px] text-rose-800 font-medium">
            Immediate reorder required (Stock = 0)
          </div>
        </div>

        {/* Low Stock Warning */}
        <div
          className={`p-5 rounded-xl border shadow-xs space-y-2 ${
            data.totalLowStockItemsCount > 0
              ? 'bg-amber-50/60 border-amber-300'
              : 'bg-white border-slate-200'
          }`}
          data-testid="kpi-low-stock"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono tracking-tight">
            {data.totalLowStockItemsCount} Items
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            Stock at or below reorder threshold
          </div>
        </div>

        {/* Total Deficit Qty */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-deficit-units"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Replenishment Deficit
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {data.totalInventoryDeficitQty} Units
          </div>
          <div className="text-[11px] text-slate-500">
            Units needed to restore safety stock
          </div>
        </div>
      </div>

      {/* Section 1: Fast-Moving Parts & Lubricants Velocity */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        data-testid="fast-moving-parts-section"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Fast-Moving Parts & Lubricants Velocity Ranking
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono bg-white text-slate-700">
                Period: {activeRange.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Combined consumption velocity across Workshop Job Card replacements and Walk-in Counter POS sales.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <Input
              placeholder="Search part name, SKU..."
              value={partsSearch}
              onChange={(e) => setPartsSearch(e.target.value)}
              className="h-8 text-xs pl-8 w-60 bg-white"
              data-testid="parts-search-input"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="fast-moving-parts-table">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Part / Lubricant Name</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Workshop Qty</th>
                <th className="py-3 px-4 text-center">POS Sold Qty</th>
                <th className="py-3 px-4 text-center">Total Consumed</th>
                <th className="py-3 px-4 text-right">Revenue (Rs.)</th>
                <th className="py-3 px-4 text-right">Direct Cost (Rs.)</th>
                <th className="py-3 px-4 text-right">Gross Profit (Rs.)</th>
                <th className="py-3 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredFastMoving.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    No consumption data recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredFastMoving.map((part, idx) => (
                  <tr
                    key={part.sku + part.name}
                    className="hover:bg-slate-50 transition-colors"
                    data-testid={`fast-part-row-${part.sku.toLowerCase()}`}
                  >
                    <td className="py-3 px-4 text-center font-sans font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 font-black'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800 font-bold'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-700 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {part.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-bold text-slate-800">{part.sku}</div>
                      {part.barcode && <div className="text-[10px] text-slate-400">{part.barcode}</div>}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">
                      <Badge variant="outline" className="text-[10px] bg-slate-50">
                        {part.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {part.workshopQtyUsed} {part.uom}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {part.posQtySold} {part.uom}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      <Badge variant="secondary" className="font-mono text-xs font-bold">
                        {part.totalQtyConsumed} {part.uom}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatRs(part.totalRevenueRs)}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-800">
                      {formatRs(part.totalCostRs)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatRs(part.grossProfitRs)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {part.grossMarginPct.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Low-Stock and Out-of-Stock Alert Table */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        data-testid="low-stock-alerts-section"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Low-Stock & Out-of-Stock Urgent Inventory Alerts
            </h3>
            <p className="text-[11px] text-slate-500">
              Spare parts and lubricants requiring immediate reorder to prevent workshop stoppages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <Input
                placeholder="Search alerts..."
                value={alertsSearch}
                onChange={(e) => setAlertsSearch(e.target.value)}
                className="h-8 text-xs pl-8 w-48 bg-white"
                data-testid="alerts-search-input"
              />
            </div>

            <select
              value={alertSeverityFilter}
              onChange={(e) => setAlertSeverityFilter(e.target.value as any)}
              className="h-8 text-xs px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              data-testid="filter-alert-severity"
            >
              <option value="ALL">All Stock Alerts ({data.lowStockAlerts.length})</option>
              <option value="OUT_OF_STOCK">Out of Stock ({data.totalOutOfStockItemsCount})</option>
              <option value="LOW_STOCK">Low Stock ({data.totalLowStockItemsCount})</option>
            </select>

            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              data-testid="goto-catalog-btn"
            >
              <span>Manage in Catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="low-stock-table">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Part / Lubricant Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Alert Level</th>
                <th className="py-3 px-4 text-center">Deficit Qty</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No low-stock alerts. All inventory levels are healthy!
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((item) => {
                  const isOutOfStock = item.status === 'OUT_OF_STOCK';

                  return (
                    <tr
                      key={item.catalogItemId}
                      className="hover:bg-slate-50 transition-colors"
                      data-testid={`stock-alert-row-${item.sku.toLowerCase()}`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.sku}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.barcode || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200'
                              : 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'
                          }
                        >
                          {item.stockQty} {item.uom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {item.lowStockAlertLevel} {item.uom}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-700">
                        +{item.deficitQty} {item.uom}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to="/catalog"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline"
                          data-testid={`adjust-stock-link-${item.sku.toLowerCase()}`}
                        >
                          <span>Adjust Stock</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
