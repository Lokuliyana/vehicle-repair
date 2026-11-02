import { useState } from 'react';
import { Package, Search, Plus, Lock } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MockCatalogItem {
  id: string;
  sku: string;
  barcode: string;
  type: 'SPAREPART' | 'LUBRICANT' | 'LABOR_OPERATION';
  description: string;
  buyingCostRs: number;
  sellingPriceRs: number;
  stockQty: number;
}

const MOCK_CATALOG: MockCatalogItem[] = [
  {
    id: 'c1',
    sku: 'OIL-TOY-5W30',
    barcode: '8901234567890',
    type: 'LUBRICANT',
    description: 'Toyota Genuine Motor Oil 5W-30 (4L)',
    buyingCostRs: 11200,
    sellingPriceRs: 14500,
    stockQty: 24,
  },
  {
    id: 'c2',
    sku: 'FLT-DEN-C110',
    barcode: '8901234567891',
    type: 'SPAREPART',
    description: 'Denso Oil Filter C-110',
    buyingCostRs: 1400,
    sellingPriceRs: 2200,
    stockQty: 58,
  },
  {
    id: 'c3',
    sku: 'LBR-BMP-RR',
    barcode: '',
    type: 'LABOR_OPERATION',
    description: 'Front Bumper Removal & Refit Standard',
    buyingCostRs: 1200,
    sellingPriceRs: 4500,
    stockQty: 0,
  },
  {
    id: 'c4',
    sku: 'LBR-PNT-PANEL',
    barcode: '',
    type: 'LABOR_OPERATION',
    description: 'Single Panel 2K Acrylic Painting & Oven Bake',
    buyingCostRs: 4500,
    sellingPriceRs: 18000,
    stockQty: 0,
  },
];

export function CatalogListPage() {
  const { isCostProfitVisible, permissions } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredItems = MOCK_CATALOG.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.includes(search);
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="catalog-list-page">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            Shared Parts & Labor Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Common repository for Workshop Estimations and Counter POS checkouts.
          </p>
        </div>

        <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5">
          <Plus className="w-4 h-4" />
          Add Catalog Item
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, barcode, or description..."
            className="pl-9 h-9 text-xs"
            data-testid="catalog-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'SPAREPART', 'LUBRICANT', 'LABOR_OPERATION'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-slate-200 uppercase tracking-wider text-[10px] font-bold">
              <th className="p-3">SKU</th>
              <th className="p-3">Barcode</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-center">Stock</th>
              {isCostProfitVisible && permissions.canViewCosts && (
                <th className="p-3 text-right bg-amber-950 text-amber-200">
                  <div className="flex items-center justify-end gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Cost (Rs.)</span>
                  </div>
                </th>
              )}
              <th className="p-3 text-right">Selling Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-900">{item.sku}</td>
                <td className="p-3 font-mono text-slate-500">{item.barcode || '—'}</td>
                <td className="p-3">
                  <Badge variant="outline" className="text-[10px]">
                    {item.type}
                  </Badge>
                </td>
                <td className="p-3 font-medium text-slate-900">{item.description}</td>
                <td className="p-3 text-center font-semibold">
                  {item.stockQty > 0 ? (
                    <span className="text-emerald-700">{item.stockQty} in stock</span>
                  ) : (
                    <span className="text-slate-400">Service</span>
                  )}
                </td>
                {isCostProfitVisible && permissions.canViewCosts && (
                  <td className="p-3 text-right font-mono font-bold text-amber-900 bg-amber-50/50">
                    {formatRs(item.buyingCostRs)}
                  </td>
                )}
                <td className="p-3 text-right font-mono font-bold text-slate-900">
                  {formatRs(item.sellingPriceRs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
