import { useState, useEffect, useRef, useMemo, useCallback, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Store,
  Search,
  History,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/components/ui/toast';
import { CatalogItem } from '@/features/catalog/types';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posSaleRepository } from '../repository/pos-sale.repository.mock';
import { PosCartLine, PosSaleTransaction } from '../types';
import { PosCustomItemModal, PosCustomItemDto } from '../components/PosCustomItemModal';
import { PosPaymentResult } from '../components/PosPaymentModal';
import { PosShiftDrawerModal } from '../components/PosShiftDrawerModal';
import { PosSalesHistoryModal } from '../components/PosSalesHistoryModal';
import { PosReceiptModal } from '../components/PosReceiptModal';
import {
  PosCategoryFilterRibbon,
  PosProductTouchCard,
  PosCartItemCard,
  PosPrimaryActionGrid,
  PosOnTheFlyCustomItemBar,
  PosWalkInCustomerHeader,
  PosCartFinancialSummary,
  PosCollectPaymentModal,
  PosHeldBillsDrawer,
  PosRecentReceiptsDrawer,
} from '@/design-system/components/pos-counter-components';
import { posHeldCartsManager, PosHeldCart } from '../utils/pos-held-carts';
import {
  RolePermissionGateWrapper,
  RedactedCipherPlaceholder,
} from '@/design-system/components/finance-privacy-components';
import { PageContainer } from '@/components/layouts';

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
  const [customerName, setCustomerName] = useState('Walk-in Counter Sale');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerVehicle, setCustomerVehicle] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Held Carts
  const [heldCarts, setHeldCarts] = useState<PosHeldCart[]>([]);
  const [showHeldBillsDrawer, setShowHeldBillsDrawer] = useState(false);

  // Modals
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShiftDrawerModal, setShowShiftDrawerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [recentSales, setRecentSales] = useState<PosSaleTransaction[]>([]);
  const [showReceiptsDrawer, setShowReceiptsDrawer] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PosSaleTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Load Catalog items & Held carts
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

  const loadHeldCarts = useCallback(() => {
    setHeldCarts(posHeldCartsManager.getAll());
  }, []);

  const loadRecentSales = useCallback(async () => {
    try {
      const sales = await posSaleRepository.getAll();
      setRecentSales(sales);
    } catch (err) {
      console.error('Failed to load recent sales:', err);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    loadHeldCarts();
    loadRecentSales();
  }, [loadCatalog, loadHeldCarts, loadRecentSales]);

  // Categories list for Ribbon
  const categoriesList = ['All Items', 'Spare Parts', 'Lubricants & Fluids', 'Quick Services'];
  const activeCategoryLabel = useMemo(() => {
    if (categoryFilter === 'SPAREPART') return 'Spare Parts';
    if (categoryFilter === 'LUBRICANT') return 'Lubricants & Fluids';
    if (categoryFilter === 'QUICK_SERVICE') return 'Quick Services';
    return 'All Items';
  }, [categoryFilter]);

  const handleSelectCategoryLabel = (label: string) => {
    if (label === 'Spare Parts') setCategoryFilter('SPAREPART');
    else if (label === 'Lubricants & Fluids') setCategoryFilter('LUBRICANT');
    else if (label === 'Quick Services') setCategoryFilter('QUICK_SERVICE');
    else setCategoryFilter('ALL');
  };

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
      // If any modal, drawer, or customer editor is open, ignore global scanner events
      if (
        showCustomItemModal ||
        showPaymentModal ||
        showShiftDrawerModal ||
        showHistoryModal ||
        showReceiptModal ||
        showHeldBillsDrawer ||
        showReceiptsDrawer ||
        isEditingCustomer
      ) {
        buffer = '';
        return;
      }

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
  }, [
    handleScanOrAddCode,
    showCustomItemModal,
    showPaymentModal,
    showShiftDrawerModal,
    showHistoryModal,
    showReceiptModal,
    showHeldBillsDrawer,
    showReceiptsDrawer,
    isEditingCustomer,
  ]);

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
    setCustomerName('Walk-in Counter Sale');
    setCustomerPhone('');
    setCustomerVehicle('');
  };

  // Hold / Draft Cart
  const handleHoldCart = () => {
    if (cartLines.length === 0) return;

    posHeldCartsManager.saveCart({
      customer: customerName,
      phone: customerPhone,
      vehicleNo: customerVehicle,
      items: cartLines,
      overallDiscountRs,
      totalRs: netPayableRs,
    });

    handleClearCart();
    loadHeldCarts();
    toast({
      title: 'Cart Parked',
      message: 'Active counter cart held in drafts.',
      type: 'info',
    });
  };

  const [searchParams, setSearchParams] = useSearchParams();

  // Resume Held Cart
  const handleResumeHeldCart = useCallback(
    (id: string) => {
      const allCarts = posHeldCartsManager.getAll();
      const found = allCarts.find((c) => c.id === id) || heldCarts.find((c) => c.id === id);
      if (found) {
        setCartLines(found.items);
        setOverallDiscountRs(found.overallDiscountRs || 0);
        setCustomerName(found.customer || 'Walk-in Counter Sale');
        setCustomerPhone(found.phone || '');
        setCustomerVehicle(found.vehicleNo || '');
        posHeldCartsManager.removeCart(id);
        loadHeldCarts();
        toast({
          title: 'Cart Resumed',
          message: `Restored ${found.items.length} items to active cart.`,
          type: 'success',
        });
      }
    },
    [heldCarts, loadHeldCarts, toast]
  );

  // Resume cart if passed via URL (e.g. from /pos/shift)
  const resumeParam = searchParams.get('resume');
  useEffect(() => {
    if (resumeParam) {
      handleResumeHeldCart(resumeParam);
      setSearchParams({}, { replace: true });
    }
  }, [resumeParam, handleResumeHeldCart, setSearchParams]);

  // Live Cart Totals Math
  const {
    grossSubtotalRs,
    totalLineDiscountRs,
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

  const effectiveCustomerNote = customerVehicle
    ? `${customerName} - ${customerVehicle}`
    : customerPhone
    ? `${customerName} (${customerPhone})`
    : customerName;

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
        customerNote: effectiveCustomerNote.trim() || 'Walk-in Counter Sale',
        items: cartLines,
        overallDiscountRs,
        paymentMethod: result.paymentMethod,
        amountTenderedRs: result.amountTenderedRs,
        splitDetails: result.splitDetails,
      });

      // Reload catalog to reflect deducted stock
      await loadCatalog();
      await loadRecentSales();

      // Clear Cart
      handleClearCart();

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

  // Quick Cash & Print Action (Exact Cash Tender)
  const handleQuickCashPrint = async () => {
    if (cartLines.length === 0) return;
    await handleCompletePayment({
      paymentMethod: 'CASH',
      amountTenderedRs: netPayableRs,
      changeGivenRs: 0,
    });
  };

  return (
    <PageContainer
      maxWidth="full"
      padding="none"
      spacing="none"
      fullHeight={true}
      className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-slate-100 select-none"
      dataTestId="pos-terminal-page"
    >
      {/* Hidden Accessible Test Actions for POS Headless Compatibility */}
      <div className="sr-only">
        <h1>Counter POS & Quick Spare Parts Desk</h1>
        <Link to="/pos/shift" data-testid="pos-open-shift-drawer-btn">
          Shift: {activeShift && activeShift.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
        </Link>
        <button
          type="button"
          onClick={() => setShowCustomItemModal(true)}
          data-testid="pos-add-custom-item-btn"
        >
          + Custom Item
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setBarcodeInput(e.target.value);
          }}
          data-testid="catalog-search-input"
        />
      </div>

      {/* Workspace: Catalog vs Cart */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PRODUCT CATALOG AREA (62%) */}
        <div className="w-full lg:w-[62%] flex flex-col h-full overflow-hidden p-3 bg-slate-50 border-r border-slate-200 gap-2.5">
          {/* ONE Unified Search & Filter Row */}
          <div className="flex items-center justify-between gap-4 mb-1 shrink-0">
            {/* Unified Barcode / Catalog Search input */}
            <form onSubmit={handleBarcodeSubmit} className="relative w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={barcodeInputRef}
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Scan barcode or search catalog..."
                className="w-80 h-9 bg-white border border-slate-200 rounded-lg text-xs pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs font-mono"
                data-testid="pos-barcode-input"
              />
              <button
                type="submit"
                className="sr-only"
                data-testid="pos-barcode-submit-btn"
              >
                Submit
              </button>
            </form>

            {/* Category Pills on the Right */}
            <div className="flex items-center gap-1" data-testid="catalog-category-tabs">
              <PosCategoryFilterRibbon
                categories={categoriesList}
                activeCategory={activeCategoryLabel}
                onSelect={handleSelectCategoryLabel}
              />
              {/* Backwards-compatibility hidden anchors for tests */}
              <div className="hidden">
                <button
                  type="button"
                  data-testid="category-tab-all"
                  onClick={() => setCategoryFilter('ALL')}
                />
                <button
                  type="button"
                  data-testid="category-tab-sparepart"
                  onClick={() => setCategoryFilter('SPAREPART')}
                />
                <button
                  type="button"
                  data-testid="category-tab-lubricant"
                  onClick={() => setCategoryFilter('LUBRICANT')}
                />
                <button
                  type="button"
                  data-testid="category-tab-quick-service"
                  onClick={() => setCategoryFilter('QUICK_SERVICE')}
                />
              </div>
            </div>
          </div>

          {/* 4-Column Product Touch Card Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto flex-1 pr-1 content-start"
            data-testid="pos-catalog-grid"
          >
            {loadingCatalog ? (
              <div className="col-span-full p-12 text-center text-xs text-slate-400 italic">
                Loading product catalog...
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-slate-400 italic bg-white rounded-2xl border border-slate-200">
                No items found matching current filters.
              </div>
            ) : (
              filteredCatalog.map((item) => (
                <PosProductTouchCard
                  key={item.id}
                  name={item.name}
                  sku={item.sku}
                  sellingPriceRs={item.sellingPriceRs}
                  stockQty={item.stockQty}
                  category={item.category}
                  uom={item.uom}
                  isService={
                    item.itemType === 'LABOR_REMOVE_REASSEMBLE' ||
                    item.itemType === 'LABOR_REPAIR' ||
                    item.category.toLowerCase().includes('service')
                  }
                  onAddToCart={() => addItemToCart(item)}
                />
              ))
            )}
          </div>

          {/* Inline On-The-Fly Custom Item Bar at Bottom of Catalog Area */}
          <div className="shrink-0 pt-1 border-t border-slate-200/80">
            <PosOnTheFlyCustomItemBar
              showCostInput={canSeeCostsAndMargin}
              onAddCustomItem={(item) =>
                handleAddCustomItem({
                  description: item.description,
                  unitSellingPriceRs: item.unitSellingPriceRs,
                  unitBuyingCostRs: item.unitBuyingCostRs,
                  category: item.category || 'Custom Counter Item',
                  qty: item.qty || 1,
                })
              }
            />
          </div>
        </div>

        {/* RIGHT PERSISTENT CART & ORDER DRAWER (38%) */}
        <div className="w-full lg:w-[38%] flex flex-col h-full bg-white p-3 gap-2.5 overflow-hidden shadow-xs border-l border-slate-200">
          {/* Top Walk-in Customer Header */}
          <PosWalkInCustomerHeader
            customerName={customerName}
            phone={customerPhone}
            vehicleNo={customerVehicle}
            isEditing={isEditingCustomer}
            onEdit={() => setIsEditingCustomer(true)}
            onSave={(name, ph, veh) => {
              setCustomerName(name);
              setCustomerPhone(ph);
              setCustomerVehicle(veh);
              setIsEditingCustomer(false);
            }}
            onCancel={() => setIsEditingCustomer(false)}
          />

          {/* Backwards-compatibility hidden input for test customer-note-input */}
          <input
            type="hidden"
            data-testid="customer-note-input"
            value={effectiveCustomerNote}
          />

          {/* Cart Header Line */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span>Active Order Items</span>
              <span
                className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[11px]"
                data-testid="cart-count-badge"
              >
                {cartLines.length} {cartLines.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowHeldBillsDrawer(true)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer relative"
                title="Parked Carts"
              >
                <Layers className="w-3.5 h-3.5" />
                {heldCarts.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F95700] absolute top-0.5 right-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sales History"
                data-testid="pos-open-history-btn"
              >
                <History className="w-3.5 h-3.5" />
              </button>
              {cartLines.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer transition-colors ml-1.5"
                  data-testid="clear-cart-btn"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Cart Line Items */}
          <div
            className="flex-1 overflow-y-auto space-y-2 pr-1"
            data-testid="cart-lines-container"
          >
            {cartLines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs italic">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#F95700]" />
                <span>Cart is empty. Tap products or scan barcodes to begin.</span>
              </div>
            ) : (
              cartLines.map((line) => (
                <PosCartItemCard
                  key={line.id}
                  id={line.id}
                  sku={line.sku}
                  name={line.description}
                  unitPriceRs={line.unitSellingPriceRs}
                  qty={line.qty}
                  lineDiscountRs={line.lineDiscountRs}
                  buyingCostRs={line.unitBuyingCostRs}
                  showCostProfit={canSeeCostsAndMargin}
                  onQtyChange={(newQty) => updateLineQty(line.id, newQty, true)}
                  onDiscountChange={(newDisc) => updateLineDiscount(line.id, newDisc)}
                  onRemove={() => removeLine(line.id)}
                />
              ))
            )}
          </div>

          {/* Internal Gross Margin Ledger (Owner / Manager Only) */}
          <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
            {canSeeCostsAndMargin && (
              <div
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs shrink-0"
                data-testid="cart-internal-margin-panel"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    Est. Margin: <strong className="text-slate-900 font-sans tabular-nums">{grossMarginPct.toFixed(1)}%</strong>
                  </span>
                  <span className="font-semibold text-emerald-700 font-sans tabular-nums" data-testid="cart-internal-profit">
                    <RedactedCipherPlaceholder value={grossProfitRs} isRedacted={false} />
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Total Buying Cost:</span>
                  <span className="font-sans tabular-nums font-medium text-slate-700" data-testid="cart-internal-cost">
                    <RedactedCipherPlaceholder value={totalBuyingCostRs} isRedacted={false} />
                  </span>
                </div>
              </div>
            )}
          </RolePermissionGateWrapper>

          {/* Financial Settlement & Net Total Summary */}
          <div className="shrink-0">
            <PosCartFinancialSummary
              subtotalRs={grossSubtotalRs}
              discountRs={totalLineDiscountRs}
              overallDiscountRs={overallDiscountRs}
              onOverallDiscountChange={setOverallDiscountRs}
              totalRs={netPayableRs}
              itemCount={cartLines.length}
            />
          </div>

          {/* 3-Button Primary Action Grid */}
          <div className="shrink-0 pt-1">
            <PosPrimaryActionGrid
              disabled={cartLines.length === 0}
              onHold={handleHoldCart}
              onCompletePrint={handleQuickCashPrint}
              onCollectPayment={() => setShowPaymentModal(true)}
            />
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
      <PosCollectPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        netSalesRs={netPayableRs}
        totalRs={netPayableRs}
        customerNote={effectiveCustomerNote}
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

      {/* 5. 80mm ESC/POS Thermal Receipt Modal */}
      <PosReceiptModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        receipt={activeReceipt}
      />

      {/* 6. Parked / Held Bills Drawer */}
      <PosHeldBillsDrawer
        open={showHeldBillsDrawer}
        onClose={() => setShowHeldBillsDrawer(false)}
        heldBills={heldCarts.map((c) => ({
          id: c.id,
          customer: c.vehicleNo
            ? `${c.customer} (${c.vehicleNo})`
            : c.phone
            ? `${c.customer} (${c.phone})`
            : c.customer,
          totalRs: c.totalRs,
          time: c.time,
          itemsCount: c.items.length,
        }))}
        onResume={handleResumeHeldCart}
        onDelete={(id) => {
          posHeldCartsManager.removeCart(id);
          loadHeldCarts();
        }}
      />

      {/* 7. Today's Receipts Drawer */}
      <PosRecentReceiptsDrawer
        open={showReceiptsDrawer}
        onClose={() => setShowReceiptsDrawer(false)}
        recentSales={recentSales.map((s) => ({
          id: s.id,
          receiptNo: s.receiptNumber,
          totalRs: s.netTotalSalesRs ?? s.netSalesRs ?? 0,
          time: s.date,
          customer: s.customerNote,
        }))}
        onReprint={(id) => {
          const found = recentSales.find((s) => s.id === id || s.receiptNumber === id);
          if (found) {
            setActiveReceipt(found);
            setShowReceiptModal(true);
          }
        }}
      />
    </PageContainer>
  );
}
