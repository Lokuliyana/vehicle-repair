import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Lock,
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit2,
  Power,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  CatalogItem,
  CatalogItemType,
} from '../types';
import { catalogRepository } from '../repository/catalog.repository.mock';
import { CatalogItemDialog } from '../components/CatalogItemDialog';
import { StockAdjustDialog } from '../components/StockAdjustDialog';

export function CatalogListPage() {
  const { isCostProfitVisible, permissions } = useAuth();
  const { toast } = useToast();
  const showToast = (
    message: string,
    type: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default'
  ) => {
    toast({ message, type });
  };

  const [items, setItems] = useState<CatalogItem[]>(() =>
    catalogRepository.getAllSync ? catalogRepository.getAllSync() : []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CatalogItemType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<CatalogItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await catalogRepository.getAll();
      setItems(data);
    } catch (err) {
      console.error('Failed to load catalog items:', err);
      showToast('Failed to load catalog records.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      loadData();
    }
  }, []);

  // Filtered list computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeOnly && !item.isActive) return false;
      if (typeFilter !== 'ALL' && item.itemType !== typeFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (lowStockOnly) {
        const isPhysical =
          item.itemType === 'SPAREPART' || item.itemType === 'LUBRICANT';
        if (!item.isActive || !isPhysical || item.stockQty > item.lowStockAlertLevel) {
          return false;
        }
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesBarcode = item.barcode ? item.barcode.toLowerCase().includes(q) : false;
        const matchesCompat = item.vehicleCompatibility
          ? item.vehicleCompatibility.toLowerCase().includes(q)
          : false;
        const matchesCat = item.category.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesBarcode || matchesCompat || matchesCat;
      }

      return true;
    });
  }, [items, search, typeFilter, categoryFilter, lowStockOnly, activeOnly]);

  // Distinct categories for dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // KPI calculations
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const lowStock = items.filter(
      (i) =>
        i.isActive &&
        (i.itemType === 'SPAREPART' || i.itemType === 'LUBRICANT') &&
        i.stockQty <= i.lowStockAlertLevel
    ).length;
    const partsCount = items.filter((i) => i.itemType === 'SPAREPART').length;
    const laborCount = items.filter(
      (i) =>
        i.itemType === 'LABOR_REMOVE_REASSEMBLE' || i.itemType === 'LABOR_REPAIR'
    ).length;
    return { total, active, lowStock, partsCount, laborCount };
  }, [items]);

  // Actions
  const handleAddNew = () => {
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleAdjustStock = (item: CatalogItem) => {
    setAdjustingItem(item);
    setStockDialogOpen(true);
  };

  const handleToggleActive = async (item: CatalogItem) => {
    try {
      const updated = await catalogRepository.toggleActive(item.id);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      showToast(
        `${item.sku} is now ${updated.isActive ? 'Active' : 'Inactive'}.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset catalog items to standard factory seed data?')) {
      await catalogRepository.resetToDefaults();
      await loadData();
      showToast('Catalog seed data reinitialized.', 'info');
    }
  };

  const handleItemSaved = (savedItem: CatalogItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id);
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i));
      }
      return [savedItem, ...prev];
    });
    showToast(`Catalog item ${savedItem.sku} saved successfully.`, 'success');
  };

  const handleStockUpdated = (updatedItem: CatalogItem) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    showToast(
      `Stock for ${updatedItem.sku} adjusted to ${updatedItem.stockQty} ${updatedItem.uom}.`,
      'success'
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="catalog-list-page">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Parts & Labor Catalog Master
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized master for Collision Estimates, Workshop Job Cards, and Counter POS Sales.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-600">
              Total Items: <span className="font-mono font-bold text-slate-900">{stats.total}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-emerald-700">
              Active: <span className="font-mono font-bold">{stats.active}</span>
            </span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                stats.lowStock > 0
                  ? lowStockOnly
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'text-slate-500'
              }`}
              data-testid="catalog-low-stock-stat"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Low Stock Alerts: </span>
              <span className="font-mono font-bold">{stats.lowStock}</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Parts: <span className="font-mono font-semibold">{stats.partsCount}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Labor Presets: <span className="font-mono font-semibold">{stats.laborCount}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permissions.canManageCatalog && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-slate-600 gap-1.5"
              title="Reset to default seed parts & labor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Seed</span>
            </Button>
          )}

          {permissions.canManageCatalog && (
            <Button
              variant="default"
              size="sm"
              onClick={handleAddNew}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 font-bold shadow-xs"
              data-testid="add-catalog-item-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Catalog Item</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Real-time search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, barcode, name, or vehicle compatibility..."
              className="pl-9 h-9 text-xs"
              data-testid="catalog-search-input"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
              Category:
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              data-testid="catalog-category-filter"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Type tabs & toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: 'All Items', value: 'ALL' },
              { label: 'Spare Parts', value: 'SPAREPART' },
              { label: 'Lubricants & Fluids', value: 'LUBRICANT' },
              { label: 'Labor - R&R', value: 'LABOR_REMOVE_REASSEMBLE' },
              { label: 'Labor - Repair', value: 'LABOR_REPAIR' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  typeFilter === tab.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                data-testid={`catalog-filter-${tab.value}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                data-testid="catalog-filter-lowstock"
              />
              <span className="flex items-center gap-1 text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Low Stock Only
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                data-testid="catalog-filter-active"
              />
              <span>Active Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-3">SKU</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description & Model Compatibility</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Stock</th>
                {/* PRIVACY INVARIANT: Buying cost visible ONLY to OWNER & WORKSHOP_MANAGER when toggled */}
                {isCostProfitVisible && permissions.canViewCosts && (
                  <th
                    className="p-3 text-right bg-amber-950 text-amber-200"
                    data-testid="catalog-cost-header"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Buying Cost</span>
                    </div>
                  </th>
                )}
                <th className="p-3 text-right">Selling Price</th>
                <th className="p-3 text-center">Status</th>
                {permissions.canManageCatalog && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      8 +
                      (isCostProfitVisible && permissions.canViewCosts ? 1 : 0) +
                      (permissions.canManageCatalog ? 1 : 0)
                    }
                    className="p-8 text-center text-slate-400 text-xs"
                  >
                    {isLoading
                      ? 'Loading catalog items...'
                      : 'No catalog items match your search or filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isPhysical =
                    item.itemType === 'SPAREPART' || item.itemType === 'LUBRICANT';
                  const isLowStock =
                    isPhysical && item.stockQty <= item.lowStockAlertLevel;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !item.isActive ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                      data-testid={`catalog-row-${item.sku}`}
                    >
                      {/* SKU */}
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.sku}
                      </td>

                      {/* Barcode */}
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {item.barcode || '—'}
                      </td>

                      {/* Item Type */}
                      <td className="p-3 whitespace-nowrap">
                        {item.itemType === 'SPAREPART' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                            Part
                          </Badge>
                        )}
                        {item.itemType === 'LUBRICANT' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            Fluid
                          </Badge>
                        )}
                        {item.itemType === 'LABOR_REMOVE_REASSEMBLE' && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                            Labor R&R
                          </Badge>
                        )}
                        {item.itemType === 'LABOR_REPAIR' && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            Labor Repair
                          </Badge>
                        )}
                      </td>

                      {/* Description & Vehicle Compatibility */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        {item.vehicleCompatibility && (
                          <div className="text-[11px] text-slate-500 font-normal">
                            Compat: {item.vehicleCompatibility}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">{item.category}</td>

                      {/* Stock Level */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {isPhysical ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                                item.stockQty === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                              data-testid={`catalog-stock-${item.sku}`}
                            >
                              {item.stockQty} {item.uom}
                            </span>
                            {isLowStock && (
                              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tighter">
                                Low Stock Alert
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">Service Preset</span>
                        )}
                      </td>

                      {/* Internal Buying Cost: STRICT PRIVACY INVARIANT */}
                      {isCostProfitVisible && permissions.canViewCosts && (
                        <td
                          className="p-3 text-right font-mono font-bold text-amber-950 bg-amber-50/60 whitespace-nowrap"
                          data-testid={`catalog-cost-${item.sku}`}
                        >
                          {formatRs(item.buyingCostRs)}
                        </td>
                      )}

                      {/* Selling Price */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRs(item.sellingPriceRs)}
                        {item.defaultDiscountPct > 0 && (
                          <div className="text-[10px] text-emerald-700 font-sans font-medium">
                            {item.defaultDiscountPct}% off
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      {permissions.canManageCatalog && (
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPhysical && (
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item)}
                                className="p-1.5 rounded-md text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                title="Adjust Stock"
                                data-testid={`adjust-stock-btn-${item.sku}`}
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Item"
                              data-testid={`edit-item-btn-${item.sku}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(item)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                item.isActive
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={item.isActive ? 'Deactivate' : 'Activate'}
                              data-testid={`toggle-active-btn-${item.sku}`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <CatalogItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        initialItem={editingItem}
        onSaved={handleItemSaved}
      />

      {/* Stock Adjust Dialog */}
      <StockAdjustDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        item={adjustingItem}
        onSaved={handleStockUpdated}
      />
    </div>
  );
}
