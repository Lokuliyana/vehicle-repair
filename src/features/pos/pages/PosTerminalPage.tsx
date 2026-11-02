import { useState, useEffect, useRef, useMemo, useCallback, type FormEvent } from 'react';
import {
  Store,
  Barcode,
  Search,
  Plus,
  Trash2,
  Vault,
  History,
  Minus,
  CheckCircle2,
  Tag,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { CatalogItem } from '@/features/catalog/types';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posSaleRepository } from '../repository/pos-sale.repository.mock';
import { PosCartLine, PosSaleTransaction } from '../types';
import { PosCustomItemModal, PosCustomItemDto } from '../components/PosCustomItemModal';
import { PosPaymentModal, PosPaymentResult } from '../components/PosPaymentModal';
import { PosShiftDrawerModal } from '../components/PosShiftDrawerModal';
import { PosSalesHistoryModal } from '../components/PosSalesHistoryModal';
import { PosReceiptModal } from '../components/PosReceiptModal';

import { cn } from '@/utils/cn';

type CategoryFilter = 'ALL' | 'SPAREPART' | 'LUBRICANT' | 'QUICK_SERVICE';

export function PosTerminalPage() {
  const { user, permissions, isCostProfitVisible, activeShift } = useAuth();
  const { toast } = useToast();

  // Catalog State
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Barcode Input
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Active Cart State
  const [cartLines, setCartLines] = useState<PosCartLine[]>([]);
  const [overallDiscountRs, setOverallDiscountRs] = useState<number>(0);
  const [customerNote, setCustomerNote] = useState('Walk-in Counter Sale');

  // Modals
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShiftDrawerModal, setShowShiftDrawerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PosSaleTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Load Catalog items
  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const items = await catalogRepository.getAll();
      setCatalogItems(items.filter((i) => i.isActive));
    } catch (err) {
      console.error('Failed to load catalog items:', err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalogItems.filter((item) => {
      // Category filter
      if (categoryFilter === 'SPAREPART' && item.itemType !== 'SPAREPART') return false;
      if (categoryFilter === 'LUBRICANT' && item.itemType !== 'LUBRICANT') return false;
      if (
        categoryFilter === 'QUICK_SERVICE' &&
        item.itemType !== 'LABOR_REMOVE_REASSEMBLE' &&
        item.itemType !== 'LABOR_REPAIR' &&
        !item.category.toLowerCase().includes('service')
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesBarcode = item.barcode ? item.barcode.toLowerCase().includes(q) : false;
        const matchesCategory = item.category.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesBarcode || matchesCategory;
      }

      return true;
    });
  }, [catalogItems, categoryFilter, searchQuery]);

  // Add Item to Cart (helper)
  const addItemToCart = useCallback(
    (item: CatalogItem) => {
      setCartLines((prev) => {
        const existingIndex = prev.findIndex((line) => line.catalogItemId === item.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const curr = updated[existingIndex];
          const newQty = curr.qty + 1;
          const grossSales = curr.unitSellingPriceRs * newQty;
          const lineTotalSalesRs = Math.max(0, grossSales - curr.lineDiscountRs);
          const lineTotalCostRs = curr.unitBuyingCostRs * newQty;
          updated[existingIndex] = {
            ...curr,
            qty: newQty,
            lineTotalSalesRs,
            lineTotalCostRs,
            lineGrossProfitRs: lineTotalSalesRs - lineTotalCostRs,
          };
          return updated;
        }

        const newLine: PosCartLine = {
          id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          catalogItemId: item.id,
          barcode: item.barcode,
          sku: item.sku,
          description: item.name,
          category: item.category,
          qty: 1,
          unitSellingPriceRs: item.sellingPriceRs,
          unitBuyingCostRs: item.buyingCostRs || 0,
          lineDiscountRs: 0,
          lineTotalSalesRs: item.sellingPriceRs,
          lineTotalCostRs: item.buyingCostRs || 0,
          lineGrossProfitRs: item.sellingPriceRs - (item.buyingCostRs || 0),
        };
        return [...prev, newLine];
      });

      toast({
        title: 'Item Added',
        message: `"${item.name}" added to cart.`,
        type: 'success',
      });
    },
    [toast]
  );

  // Scan or search by barcode/sku
  const handleScanOrAddCode = useCallback(
    async (code: string) => {
      const clean = code.trim().toLowerCase();
      if (!clean) return;

      // Match in loaded items
      const matched = catalogItems.find(
        (i) =>
          (i.barcode && i.barcode.toLowerCase() === clean) ||
          i.sku.toLowerCase() === clean ||
          i.name.toLowerCase().includes(clean)
      );

      if (matched) {
        addItemToCart(matched);
        setBarcodeInput('');
      } else {
        toast({
          title: 'Not Found',
          message: `No catalog product matched "${code}". Add as custom item if needed.`,
          type: 'warning',
        });
      }
    },
    [catalogItems, addItemToCart, toast]
  );

  // Hardware barcode scanner listener (intercepts rapid keystrokes ending in Enter)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === 'Enter') {
        if (buffer.length >= 3 && !isInput) {
          e.preventDefault();
          const scanned = buffer.trim();
          buffer = '';
          await handleScanOrAddCode(scanned);
        } else if (!isInput) {
          buffer = '';
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const now = Date.now();
        if (now - lastKeyTime > 120) {
          buffer = '';
        }
        lastKeyTime = now;
        if (!isInput) {
          buffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScanOrAddCode]);

  // Manual Barcode submit
  const handleBarcodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleScanOrAddCode(barcodeInput);
  };

  // Add Custom Item to Cart
  const handleAddCustomItem = (custom: PosCustomItemDto) => {
    const grossSales = custom.unitSellingPriceRs * custom.qty;
    const grossCost = custom.unitBuyingCostRs * custom.qty;
    const newLine: PosCartLine = {
      id: `custom-${Date.now()}`,
      description: custom.description,
      category: custom.category,
      qty: custom.qty,
      unitSellingPriceRs: custom.unitSellingPriceRs,
      unitBuyingCostRs: custom.unitBuyingCostRs,
      lineDiscountRs: 0,
      lineTotalSalesRs: grossSales,
      lineTotalCostRs: grossCost,
      lineGrossProfitRs: grossSales - grossCost,
    };

    setCartLines((prev) => [...prev, newLine]);
    toast({
      title: 'Custom Line Added',
      message: `"${custom.description}" added to cart.`,
      type: 'success',
    });
  };

  // Qty adjust
  const updateLineQty = (id: string, deltaOrExact: number, isExact: boolean = false) => {
    setCartLines((prev) => {
      return prev
        .map((line) => {
          if (line.id !== id) return line;
          const newQty = isExact ? deltaOrExact : line.qty + deltaOrExact;
          if (newQty <= 0) return null;
          const grossSales = line.unitSellingPriceRs * newQty;
          const lineTotalSalesRs = Math.max(0, grossSales - line.lineDiscountRs);
          const lineTotalCostRs = line.unitBuyingCostRs * newQty;
          return {
            ...line,
            qty: newQty,
            lineTotalSalesRs,
            lineTotalCostRs,
            lineGrossProfitRs: lineTotalSalesRs - lineTotalCostRs,
          };
        })
        .filter(Boolean) as PosCartLine[];
    });
  };

  // Line Discount adjust
  const updateLineDiscount = (id: string, discountRs: number) => {
    setCartLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const discount = Math.max(0, discountRs);
        const grossSales = line.unitSellingPriceRs * line.qty;
        const lineTotalSalesRs = Math.max(0, grossSales - discount);
        return {
          ...line,
          lineDiscountRs: discount,
          lineTotalSalesRs,
          lineGrossProfitRs: lineTotalSalesRs - line.lineTotalCostRs,
        };
      })
    );
  };

  // Remove Line
  const removeLine = (id: string) => {
    setCartLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartLines([]);
    setOverallDiscountRs(0);
    setCustomerNote('Walk-in Counter Sale');
  };

  // Live Cart Totals Math
  const {
    grossSubtotalRs,
    totalLineDiscountRs,
    totalDiscountRs,
    netPayableRs,
    totalBuyingCostRs,
    grossProfitRs,
    grossMarginPct,
  } = useMemo(() => {
    let subtotal = 0;
    let lineDiscounts = 0;
    let totalCost = 0;

    cartLines.forEach((l) => {
      subtotal += l.unitSellingPriceRs * l.qty;
      lineDiscounts += l.lineDiscountRs;
      totalCost += l.lineTotalCostRs;
    });

    const totalDisc = lineDiscounts + (Number(overallDiscountRs) || 0);
    const net = Math.max(0, subtotal - totalDisc);
    const profit = net - totalCost;
    const margin = net > 0 ? Number(((profit / net) * 100).toFixed(2)) : 0;

    return {
      grossSubtotalRs: subtotal,
      totalLineDiscountRs: lineDiscounts,
      totalDiscountRs: totalDisc,
      netPayableRs: net,
      totalBuyingCostRs: totalCost,
      grossProfitRs: profit,
      grossMarginPct: margin,
    };
  }, [cartLines, overallDiscountRs]);

  // Privacy invariant: ONLY OWNER & WORKSHOP_MANAGER when isCostProfitVisible is true
  const canSeeCostsAndMargin = Boolean(
    permissions.canViewCosts && permissions.canViewGrossProfit && isCostProfitVisible
  );

  // Complete Payment Action
  const handleCompletePayment = async (result: PosPaymentResult) => {
    if (!activeShift || activeShift.status !== 'OPEN') {
      toast({
        title: 'Register Closed',
        message: 'Cannot process sale: Active shift is closed.',
        type: 'error',
      });
      return;
    }

    try {
      const createdSale = await posSaleRepository.create({
        shiftId: activeShift.id,
        cashierName: activeShift.cashierName || user.name,
        cashierId: activeShift.cashierId || user.id,
        customerNote: customerNote.trim() || 'Walk-in Counter Sale',
        items: cartLines,
        overallDiscountRs,
        paymentMethod: result.paymentMethod,
        amountTenderedRs: result.amountTenderedRs,
        splitDetails: result.splitDetails,
      });

      // Reload catalog to reflect deducted stock
      await loadCatalog();

      // Clear Cart
      setCartLines([]);
      setOverallDiscountRs(0);
      setCustomerNote('Walk-in Counter Sale');

      // Present Receipt Modal
      setActiveReceipt(createdSale);
      setShowReceiptModal(true);

      toast({
        title: 'Sale Completed',
        message: `Receipt ${createdSale.receiptNumber} recorded. 80mm thermal receipt ready.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Checkout Error',
        message: err?.message || 'Failed to complete transaction.',
        type: 'error',
      });
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4"
      data-testid="pos-terminal-page"
    >
      {/* Top POS Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Counter POS & Quick Spare Parts Desk
            </h1>
            <p className="text-xs text-slate-500">
              Walk-in spare parts, lubricants, fluid top-ups, and fast 80mm ESC/POS thermal checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Shift Status Pill & Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShiftDrawerModal(true)}
            className="text-xs h-8 gap-1.5 border-slate-300 font-semibold"
            data-testid="pos-open-shift-drawer-btn"
          >
            <Vault className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shift:</span>
            {activeShift && activeShift.status === 'OPEN' ? (
              <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">
                OPEN
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-slate-500 font-bold">
                CLOSED
              </Badge>
            )}
          </Button>

          {/* Sales History Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryModal(true)}
            className="text-xs h-8 gap-1.5 border-slate-300 text-slate-700 font-semibold"
            data-testid="pos-open-history-btn"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Sales History</span>
          </Button>

          {/* Custom Item Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomItemModal(true)}
            className="text-xs h-8 gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-semibold"
            data-testid="pos-add-custom-item-btn"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Custom Item</span>
          </Button>
        </div>
      </div>

      {/* Barcode & Fast SKU Scanner Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              ref={barcodeInputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan barcode or type SKU / part name and press Enter..."
              className="pl-9 text-xs h-9"
              data-testid="pos-barcode-input"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4"
            data-testid="pos-barcode-submit-btn"
          >
            Add Line
          </Button>
        </form>
      </div>

      {/* Main Layout: 2 Columns (Catalog Browser vs Cart Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Product Catalog Browser (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Categories & Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" data-testid="catalog-category-tabs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer',
                    categoryFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  data-testid="category-tab-all"
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('SPAREPART')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer',
                    categoryFilter === 'SPAREPART'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  data-testid="category-tab-sparepart"
                >
                  Spare Parts
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('LUBRICANT')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer',
                    categoryFilter === 'LUBRICANT'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  data-testid="category-tab-lubricant"
                >
                  Lubricants & Fluids
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('QUICK_SERVICE')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer',
                    categoryFilter === 'QUICK_SERVICE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  data-testid="category-tab-quick-service"
                >
                  Quick Services
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter items..."
                  className="pl-8 text-xs h-7 w-full bg-slate-50"
                  data-testid="catalog-search-input"
                />
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[580px] overflow-y-auto pr-1"
            data-testid="pos-catalog-grid"
          >
            {loadingCatalog ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400 italic">
                Loading product catalog...
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200">
                No catalog items match current filters.
              </div>
            ) : (
              filteredCatalog.map((item) => {
                const isOutOfStock =
                  (item.itemType === 'SPAREPART' || item.itemType === 'LUBRICANT') &&
                  item.stockQty <= 0;
                const isLowStock =
                  (item.itemType === 'SPAREPART' || item.itemType === 'LUBRICANT') &&
                  item.stockQty > 0 &&
                  item.stockQty <= item.lowStockAlertLevel;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between gap-2.5 group"
                    data-testid={`catalog-card-${item.sku}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-2">
                          {item.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 shrink-0 font-mono"
                        >
                          {item.sku}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span>{item.category}</span>
                        {item.vehicleCompatibility && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px]" title={item.vehicleCompatibility}>
                              {item.vehicleCompatibility}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {formatRs(item.sellingPriceRs)}
                        </div>
                        <div className="text-[10px]">
                          {item.itemType === 'LABOR_REMOVE_REASSEMBLE' || item.itemType === 'LABOR_REPAIR' ? (
                            <span className="text-emerald-600 font-semibold">Service Preset</span>
                          ) : isOutOfStock ? (
                            <span className="text-rose-600 font-bold">Out of stock (0)</span>
                          ) : isLowStock ? (
                            <span className="text-amber-600 font-semibold">
                              Low: {item.stockQty} {item.uom}
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Stock: {item.stockQty} {item.uom}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => addItemToCart(item)}
                        className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 gap-1"
                        data-testid={`add-to-cart-btn-${item.sku}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Cart Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span>Active Counter Cart</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0" data-testid="cart-count-badge">
                  {cartLines.length} {cartLines.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              {cartLines.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  data-testid="clear-cart-btn"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Note Single-line input */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                Walk-in Customer / Vehicle Note
              </label>
              <Input
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Walk-in Counter Sale (or Name - Phone - Plate)"
                className="text-xs h-7 bg-white font-medium"
                data-testid="customer-note-input"
              />
            </div>

            {/* Cart Lines List */}
            <div
              className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-1"
              data-testid="cart-lines-container"
            >
              {cartLines.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  Cart is empty. Scan an item or pick from the catalog.
                </div>
              ) : (
                cartLines.map((line) => (
                  <div
                    key={line.id}
                    className="p-2 hover:bg-slate-50 rounded-lg flex flex-col gap-1.5 text-xs"
                    data-testid={`cart-line-${line.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 line-clamp-1">
                        {line.description}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                        title="Remove line"
                        data-testid={`remove-line-${line.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Qty Controls */}
                      <div className="flex items-center border border-slate-200 rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateLineQty(line.id, -1)}
                          className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          data-testid={`qty-minus-${line.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) =>
                            updateLineQty(line.id, parseInt(e.target.value, 10) || 1, true)
                          }
                          className="w-10 text-center text-xs font-bold border-none outline-none"
                          data-testid={`qty-input-${line.id}`}
                        />
                        <button
                          type="button"
                          onClick={() => updateLineQty(line.id, 1)}
                          className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          data-testid={`qty-plus-${line.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Unit Price x Qty */}
                      <div className="text-[11px] text-slate-500">
                        {formatRs(line.unitSellingPriceRs)} ea
                      </div>

                      {/* Line Discount Input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Disc:</span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={line.lineDiscountRs || ''}
                          onChange={(e) =>
                            updateLineDiscount(
                              line.id,
                              e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-14 text-right text-xs bg-white border border-slate-200 rounded px-1 py-0.5"
                          data-testid={`line-discount-input-${line.id}`}
                        />
                      </div>

                      {/* Line Total */}
                      <div className="font-bold text-slate-900 text-right">
                        {formatRs(line.lineTotalSalesRs)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Financial Settlement & Tender Block */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800" data-testid="cart-subtotal">
                  {formatRs(grossSubtotalRs)}
                </span>
              </div>

              {totalLineDiscountRs > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Line Discounts:</span>
                  <span className="font-semibold text-rose-600" data-testid="cart-line-discounts">
                    - {formatRs(totalLineDiscountRs)}
                  </span>
                </div>
              )}

              {/* Overall Discount Input */}
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Cart Discount (Rs.):
                </span>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={overallDiscountRs || ''}
                  onChange={(e) =>
                    setOverallDiscountRs(
                      e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value))
                    )
                  }
                  placeholder="0.00"
                  className="w-24 text-right text-xs h-6 bg-white"
                  data-testid="cart-overall-discount-input"
                />
              </div>

              {totalDiscountRs > 0 && (
                <div className="flex justify-between text-slate-600 text-[11px] font-semibold">
                  <span>Total Discount:</span>
                  <span className="text-rose-600" data-testid="cart-total-discount">
                    - {formatRs(totalDiscountRs)}
                  </span>
                </div>
              )}


              {/* Net Payable Highlight */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-900">Net Payable:</span>
                <span className="text-blue-700 text-lg" data-testid="cart-net-payable">
                  {formatRs(netPayableRs)}
                </span>
              </div>

              {/* OWNER & MANAGER ONLY: Embedded Internal Gross Margin Ledger */}
              {canSeeCostsAndMargin && (
                <div
                  className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1 text-[11px] mt-2"
                  data-testid="cart-internal-margin-panel"
                >
                  <div className="flex items-center justify-between font-bold border-b border-amber-200/80 pb-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-700" />
                      Internal Cost & Margin (Owner/Manager):
                    </span>
                    <span className="text-amber-800">{grossMarginPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Buying Cost:</span>
                    <span className="font-mono font-semibold" data-testid="cart-internal-cost">
                      {formatRs(totalBuyingCostRs)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Est. Gross Profit:</span>
                    <span className="font-mono" data-testid="cart-internal-profit">
                      {formatRs(grossProfitRs)}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkout / Tender Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="default"
                  disabled={cartLines.length === 0}
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 gap-1.5 shadow-sm cursor-pointer"
                  data-testid="open-payment-modal-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Checkout & Tender ({formatRs(netPayableRs)})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Custom Item Modal */}
      <PosCustomItemModal
        open={showCustomItemModal}
        onOpenChange={setShowCustomItemModal}
        onAddItem={handleAddCustomItem}
      />

      {/* 2. Payment Tender Modal */}
      <PosPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        netSalesRs={netPayableRs}
        customerNote={customerNote}
        isShiftOpen={Boolean(activeShift && activeShift.status === 'OPEN')}
        onCompletePayment={handleCompletePayment}
      />

      {/* 3. Shift Drawer Modal */}
      <PosShiftDrawerModal
        open={showShiftDrawerModal}
        onOpenChange={setShowShiftDrawerModal}
        activeShift={activeShift}
      />

      {/* 4. Sales History Modal */}
      <PosSalesHistoryModal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        onSelectReceipt={(receipt) => {
          setActiveReceipt(receipt);
          setShowHistoryModal(false);
          setShowReceiptModal(true);
        }}
      />

      {/* 5. 80mm Receipt Print Modal */}
      <PosReceiptModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        receipt={activeReceipt}
      />
    </div>
  );
}
