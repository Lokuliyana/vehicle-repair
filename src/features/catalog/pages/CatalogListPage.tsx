import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Lock,
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit2,
  RotateCcw,
  Package,
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
import {
  RolePermissionGateWrapper,
  RedactedCipherPlaceholder,
} from '@/design-system/components/finance-privacy-components';
import {
  LuxuryDataTableWrapper,
  DataTableWarmHeaderRow,
  TableStatusFilterPills,
  TableMarginSparkBarCell,
} from '@/design-system/components/data-tables-ledgers';
import { PastelTintedKpiCard } from '@/design-system/components/cards-kpis-charts';
import { SwitchiOSTactile } from '@/design-system/components/form-inputs';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

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

  const avgPartMargin = useMemo(() => {
    const parts = items.filter(
      (i) =>
        (i.itemType === 'SPAREPART' || i.itemType === 'LUBRICANT') &&
        i.sellingPriceRs > 0 &&
        i.buyingCostRs > 0
    );
    if (parts.length === 0) return 0;
    const sum = parts.reduce(
      (acc, p) => acc + ((p.sellingPriceRs - p.buyingCostRs) / p.sellingPriceRs) * 100,
      0
    );
    return Math.round((sum / parts.length) * 10) / 10;
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
    <PageContainer maxWidth="wide" dataTestId="catalog-list-page">
      {/* 1. Standardized Modern Bento Command Card Header */}
      <PageHeader
        glowColor="emerald"
        icon={<Package className="w-5 h-5 text-emerald-600" />}
        iconClassName="bg-emerald-50/80 border-emerald-200/80 text-emerald-600"
        kicker="PARTS & LABOR MASTER"
        title="Parts & Labor Catalog"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {stats.total} SKUs
          </span>
        }
        description="Manage spare parts, lubricants, barcodes, and standard labor presets."
        actions={
          <>
            {permissions.canManageCatalog && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="text-slate-700 gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-slate-50/90 border-slate-200/90 hover:bg-slate-100 shadow-2xs"
                title="Reset to default seed parts & labor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </Button>
            )}

            {permissions.canManageCatalog && (
              <Button
                variant="default"
                size="sm"
                onClick={handleAddNew}
                className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-3.5 rounded-lg text-xs font-semibold gap-1.5 shadow-xs"
                data-testid="add-catalog-item-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Catalog Item</span>
              </Button>
            )}
          </>
        }
      />

      {/* Top Quick-Stats Strip: 4 compact metric tiles (Plain integers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <PastelTintedKpiCard
          title="Total Catalog SKUs"
          value={stats.total}
          isCurrency={false}
          tint="cobalt"
          subtitle={`${stats.active} Active across system`}
        />
        <PastelTintedKpiCard
          title="Avg Part Margin %"
          value={permissions.canViewGrossProfit && isCostProfitVisible ? `${avgPartMargin}%` : 'Confidential'}
          tint="emerald"
          subtitle="Physical inventory gross margin"
        />
        <PastelTintedKpiCard
          title="Labor Presets"
          value={stats.laborCount}
          isCurrency={false}
          tint="cobalt"
          subtitle="R&R and repair operation presets"
        />
        <div
          role="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className="cursor-pointer"
          data-testid="catalog-low-stock-stat"
        >
          <PastelTintedKpiCard
            title="Low Stock Alerts"
            value={stats.lowStock}
            isCurrency={false}
            tint="amber"
            subtitle={stats.lowStock > 0 ? (lowStockOnly ? 'Filtered: Low stock only' : 'Click to filter low stock') : 'All items in stock'}
          />
        </div>
      </div>

      {/* Parts & Labor Catalog Table with Integrated Header Filter Bar */}
      <LuxuryDataTableWrapper>
        {/* Integrated Top Header Filters */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Real-time search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by SKU, barcode, name, or vehicle compatibility..."
                className="pl-9 h-8 text-xs font-mono rounded-lg border-slate-200"
                data-testid="catalog-search-input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider shrink-0">
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900"
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

          {/* Item Type segmented pills & toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <TableStatusFilterPills
              filters={[
                { label: 'All', value: 'ALL', count: stats.total },
                { label: 'Spare Parts', value: 'SPAREPART', count: stats.partsCount },
                { label: 'Lubricants', value: 'LUBRICANT', count: items.filter((i) => i.itemType === 'LUBRICANT').length },
                { label: 'Labor - R&R', value: 'LABOR_REMOVE_REASSEMBLE', count: items.filter((i) => i.itemType === 'LABOR_REMOVE_REASSEMBLE').length },
                { label: 'Labor - Repair', value: 'LABOR_REPAIR', count: items.filter((i) => i.itemType === 'LABOR_REPAIR').length },
              ]}
              activeValue={typeFilter}
              onChange={(val) => setTypeFilter(val as any)}
              testIdPrefix="catalog-filter"
            />

            <div className="flex items-center gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  data-testid="catalog-filter-lowstock"
                />
                <span className="flex items-center gap-1 text-amber-900 font-semibold text-xs">
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
                <span className="text-xs">Active Only</span>
              </label>
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <DataTableWarmHeaderRow>
              <th className="py-2.5 px-3 whitespace-nowrap">SKU</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Barcode</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
              <th className="py-2.5 px-3 min-w-[280px]">Description & Compatibility</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">UOM</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Stock</th>
              {/* PRIVACY INVARIANT: Buying cost visible ONLY to OWNER & WORKSHOP_MANAGER when toggled */}
              <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
                {isCostProfitVisible && permissions.canViewCosts && (
                  <th
                    className="py-2.5 px-3 text-right whitespace-nowrap bg-amber-950 text-amber-200"
                    data-testid="catalog-cost-header"
                  >
                    <div
                      className="flex items-center justify-end gap-1"
                      data-testid="buying-cost-header"
                    >
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Buying Cost</span>
                    </div>
                  </th>
                )}
              </RolePermissionGateWrapper>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Selling Price</th>
              <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
                {isCostProfitVisible && permissions.canViewGrossProfit && (
                  <th
                    className="py-2.5 px-3 text-center whitespace-nowrap bg-emerald-950 text-emerald-200"
                    data-testid="profit-header"
                  >
                    Margin %
                  </th>
                )}
              </RolePermissionGateWrapper>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
              {permissions.canManageCatalog && <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>}
            </DataTableWarmHeaderRow>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    8 +
                    (isCostProfitVisible && permissions.canViewCosts ? 1 : 0) +
                    (isCostProfitVisible && permissions.canViewGrossProfit ? 1 : 0) +
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
                const marginPct =
                  item.sellingPriceRs > 0 && item.buyingCostRs > 0
                    ? Math.round(
                        ((item.sellingPriceRs - item.buyingCostRs) / item.sellingPriceRs) * 1000
                      ) / 10
                    : null;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !item.isActive ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                    data-testid={`catalog-row-${item.sku}`}
                  >
                    {/* SKU */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.sku}
                      </span>
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

                    {/* Description & Compatibility (1 clean line each, no redundant square PT badge) */}
                    <td className="p-3 min-w-[280px]">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.name}
                      </div>
                      {item.vehicleCompatibility && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[320px]">
                          Compat: {item.vehicleCompatibility}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3 text-slate-600 whitespace-nowrap">{item.category}</td>

                    {/* UOM */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.uom}
                      </span>
                    </td>

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
                    <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
                      {isCostProfitVisible && permissions.canViewCosts && (
                        <td
                          className="p-3 text-right font-mono font-bold text-amber-950 bg-amber-50/60 whitespace-nowrap"
                          data-testid={`catalog-cost-${item.sku}`}
                        >
                          <RedactedCipherPlaceholder value={item.buyingCostRs} isRedacted={false} />
                        </td>
                      )}
                    </RolePermissionGateWrapper>

                    {/* Selling Price */}
                    <td className="p-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                      {formatRs(item.sellingPriceRs)}
                      {item.defaultDiscountPct > 0 && (
                        <div className="text-[10px] text-emerald-700 font-sans font-medium">
                          {item.defaultDiscountPct}% off
                        </div>
                      )}
                    </td>

                    {/* Margin Spark Bar */}
                    <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
                      {isCostProfitVisible && permissions.canViewGrossProfit && (
                        <td className="p-3 text-center whitespace-nowrap bg-emerald-50/30">
                          {marginPct !== null ? (
                            <TableMarginSparkBarCell marginPercent={marginPct} />
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>
                      )}
                    </RolePermissionGateWrapper>

                    {/* Status */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {permissions.canManageCatalog ? (
                        <SwitchiOSTactile
                          checked={item.isActive}
                          onChange={() => handleToggleActive(item)}
                          data-testid={`toggle-active-btn-${item.sku}`}
                        />
                      ) : (
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
                      )}
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
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </LuxuryDataTableWrapper>

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
    </PageContainer>
  );
}
