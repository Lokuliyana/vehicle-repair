import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Barcode,
  Trash2,
  X,
  Printer,
  Banknote,
  CreditCard,
  QrCode,
  FileText,
  Vault,
  Edit3,
  Receipt,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { globalDesignManager } from '../global-manager';
export {
  Thermal80mmReceiptContainer,
  ThermalReceiptItemizedTable,
  ThermalTenderSummaryBlock,
} from './print-abstractions';

export const PosBarcodeScannerStatusPill: React.FC<{ isReady?: boolean }> = ({ isReady = true }) => {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-xs select-none"
      data-testid="pos-barcode-scanner-status-pill"
    >
      <span className={clsx('w-2 h-2 rounded-full', isReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
      <Barcode className="w-3.5 h-3.5 text-slate-500" />
      <span>{isReady ? 'Hardware Scanner Ready' : 'Scanner Offline'}</span>
    </div>
  );
};

export const PosCategoryFilterRibbon: React.FC<{
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" data-testid="pos-category-filter-ribbon">
      {categories.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={clsx(
              'text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer',
              isActive
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900'
            )}
            data-testid={`pos-category-pill-${cat}`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export const PosProductTouchCard: React.FC<{
  name: string;
  sku: string;
  sellingPriceRs: number;
  stockQty: number;
  onAddToCart: () => void;
  category?: string;
  uom?: string;
  isService?: boolean;
}> = ({ name, sku, sellingPriceRs, stockQty, onAddToCart, category, uom = 'units', isService = false }) => {
  const isOutOfStock = !isService && stockQty <= 0;

  return (
    <div
      onClick={isOutOfStock ? undefined : onAddToCart}
      className="group bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
      data-testid={`catalog-card-${sku}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[11px] font-mono text-slate-400 font-medium">
            {sku}
          </span>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
            {isService ? 'Service' : isOutOfStock ? 'Out of stock' : `${stockQty} ${uom}`}
          </span>
        </div>
        <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 mt-1.5 leading-snug">
          {name}
        </h4>
        {category && <span className="text-[11px] text-slate-400 mt-0.5 block">{category}</span>}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <span className="text-sm font-bold font-sans tabular-nums text-slate-900">
          {globalDesignManager.formatRs(sellingPriceRs)}
        </span>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-[#F95700] group-hover:text-white flex items-center justify-center transition-colors font-bold text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          data-testid={`add-to-cart-btn-${sku}`}
          title="Add to cart"
        >
          +
        </button>
      </div>
    </div>
  );
};

export const PosCartItemCard: React.FC<{
  name: string;
  unitPriceRs: number;
  qty: number;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  id?: string;
  sku?: string;
  lineDiscountRs?: number;
  onDiscountChange?: (discountRs: number) => void;
  buyingCostRs?: number;
  showCostProfit?: boolean;
}> = ({
  name,
  unitPriceRs,
  qty,
  onQtyChange,
  onRemove,
  id,
  lineDiscountRs = 0,
  onDiscountChange,
  buyingCostRs,
  showCostProfit = false,
}) => {
  const lineGross = unitPriceRs * qty;
  const lineNet = Math.max(0, lineGross - lineDiscountRs);
  const lineProfit = buyingCostRs !== undefined ? lineNet - buyingCostRs * qty : 0;

  return (
    <div
      className="p-3 bg-white rounded-[12px] border border-slate-200/80 flex flex-col gap-2 text-xs shadow-xs hover:border-slate-300 transition-colors"
      data-testid={id ? `cart-line-${id}` : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-bold text-slate-900 block truncate" title={name}>
            {name}
          </span>
          <span className="text-[11px] text-slate-500 font-sans tabular-nums">
            {globalDesignManager.formatRs(unitPriceRs)} ea
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
          data-testid={id ? `remove-line-${id}` : undefined}
          title="Remove line"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
        {/* Quantity Stepper */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
            data-testid={id ? `qty-minus-${id}` : undefined}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => onQtyChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-8 text-center font-mono font-bold text-xs bg-transparent border-none outline-none"
            data-testid={id ? `qty-input-${id}` : undefined}
          />
          <button
            type="button"
            onClick={() => onQtyChange(qty + 1)}
            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
            data-testid={id ? `qty-plus-${id}` : undefined}
          >
            +
          </button>
        </div>

        {/* Line Discount input */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 font-medium">Disc:</span>
          <input
            type="number"
            min={0}
            value={lineDiscountRs || ''}
            onChange={(e) => onDiscountChange?.(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0"
            className="w-14 h-6 px-1.5 text-right font-sans tabular-nums text-xs border border-slate-200 rounded bg-white text-slate-800"
            data-testid={id ? `line-discount-input-${id}` : undefined}
          />
        </div>

        {/* Net Line Total */}
        <div className="font-sans tabular-nums font-bold text-slate-900 text-right min-w-[70px]">
          {globalDesignManager.formatRs(lineNet)}
        </div>
      </div>

      {/* Internal Buying Cost / Profit Line (Permission Gated) */}
      {showCostProfit && buyingCostRs !== undefined && (
        <div className="flex items-center justify-between text-[10px] text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200/60 font-sans tabular-nums">
          <span>Cost: {globalDesignManager.formatRs(buyingCostRs * qty)}</span>
          <span className="font-bold">Profit: {globalDesignManager.formatRs(lineProfit)}</span>
        </div>
      )}
    </div>
  );
};

export const PosPrimaryActionGrid: React.FC<{
  onHold: () => void;
  onCompletePrint: () => void;
  onCollectPayment: () => void;
  disabled?: boolean;
}> = ({ onHold, onCompletePrint, onCollectPayment, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onHold}
        className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all text-center flex items-center justify-center shadow-2xs"
        data-testid="pos-action-hold"
      >
        Hold
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onCompletePrint}
        className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all text-center flex items-center justify-center shadow-2xs"
        data-testid="pos-action-quick-cash"
      >
        Quick Cash
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onCollectPayment}
        className="h-9 px-4 rounded-lg bg-[#F95700] hover:bg-[#E04E00] text-white text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all text-center flex items-center justify-center shadow-2xs"
        data-testid="open-payment-modal-btn"
      >
        Pay / Split
      </button>
    </div>
  );
};

export const PosQuickCashPresetPills: React.FC<{
  totalAmountRs: number;
  onSelectAmount: (val: number) => void;
  onAddAmount?: (val: number) => void;
}> = ({ totalAmountRs, onSelectAmount, onAddAmount }) => {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      <button
        type="button"
        onClick={() => onSelectAmount(totalAmountRs)}
        data-testid="quick-cash-exact"
        className="py-2 px-1 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer text-center"
      >
        Exact
      </button>
      <button
        type="button"
        onClick={() => onAddAmount ? onAddAmount(1000) : onSelectAmount(1000)}
        data-testid="quick-cash-1000"
        className="py-2 px-1 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer text-center"
      >
        Rs. 1,000
      </button>
      <button
        type="button"
        onClick={() => onAddAmount ? onAddAmount(2000) : onSelectAmount(2000)}
        data-testid="quick-cash-2000"
        className="py-2 px-1 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer text-center"
      >
        Rs. 2,000
      </button>
      <button
        type="button"
        onClick={() => onAddAmount ? onAddAmount(5000) : onSelectAmount(5000)}
        data-testid="quick-cash-5000"
        className="py-2 px-1 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer text-center"
      >
        Rs. 5,000
      </button>
    </div>
  );
};

export const PosTouchNumericKeypad: React.FC<{
  onKeyPress: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}> = ({ onKeyPress, onClear, onBackspace }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-1.5" data-testid="pos-touch-numpad">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          data-testid={`numpad-key-${k}`}
          onClick={() => {
            if (k === 'C') onClear();
            else if (k === '⌫') onBackspace();
            else onKeyPress(k);
          }}
          className={clsx(
            'h-11 text-base font-mono font-bold rounded-[10px] transition-all cursor-pointer active:scale-95 shadow-xs border',
            k === 'C'
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : k === '⌫'
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          )}
        >
          {k}
        </button>
      ))}
    </div>
  );
};

export const PosChangeDueBanner: React.FC<{
  totalRs: number;
  tenderedRs: number;
}> = ({ totalRs, tenderedRs }) => {
  const change = Math.max(0, tenderedRs - totalRs);
  const isShort = tenderedRs > 0 && tenderedRs < totalRs;

  return (
    <div
      className={clsx(
        'p-2.5 rounded-[12px] border flex items-center justify-between text-xs font-sans tabular-nums transition-all',
        isShort ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      )}
      data-testid="pos-change-due-banner"
    >
      <div>
        <span className="text-slate-500 block text-[10px] uppercase font-bold">Tendered</span>
        <span className="font-bold text-slate-800">{globalDesignManager.formatRs(tenderedRs)}</span>
      </div>
      <div className="text-right">
        <span className={clsx('block text-[10px] uppercase font-bold', isShort ? 'text-amber-700' : 'text-emerald-700')}>
          {isShort ? 'Remaining Due' : 'Change Due'}
        </span>
        <span
          className={clsx('font-bold text-base', isShort ? 'text-amber-800' : 'text-emerald-800')}
          data-testid="pos-change-due"
        >
          {globalDesignManager.formatRs(isShort ? totalRs - tenderedRs : change)}
        </span>
      </div>
    </div>
  );
};

export const PosOnTheFlyCustomItemBar: React.FC<{
  onAddCustomItem: (item: {
    description: string;
    unitSellingPriceRs: number;
    unitBuyingCostRs: number;
    category?: string;
    qty?: number;
  }) => void;
  showCostInput?: boolean;
}> = ({ onAddCustomItem, showCostInput = true }) => {
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');

  const handleAdd = () => {
    const p = Number(price);
    if (desc.trim() && !isNaN(p) && p > 0) {
      onAddCustomItem({
        description: desc.trim(),
        unitSellingPriceRs: p,
        unitBuyingCostRs: showCostInput ? Number(cost) || 0 : 0,
        category: 'Custom Counter Item',
        qty: 1,
      });
      setDesc('');
      setPrice('');
      setCost('');
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-[14px] text-xs shadow-xs"
      data-testid="pos-on-the-fly-bar"
    >
      <input
        type="text"
        placeholder="+ Quick custom part / service description..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        className="flex-1 min-w-[180px] h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#F95700]"
        data-testid="on-the-fly-name-input"
      />
      <input
        type="number"
        min={0}
        placeholder="Rs. Price"
        value={price}
        onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        className="w-24 h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-right focus:outline-none focus:border-[#F95700]"
        data-testid="on-the-fly-price-input"
      />
      {showCostInput && (
        <input
          type="number"
          min={0}
          placeholder="Rs. Cost"
          value={cost}
          onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="w-20 h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-right focus:outline-none focus:border-[#F95700]"
          data-testid="on-the-fly-cost-input"
          title="Internal Buying Cost (Auto Gross Profit capture)"
        />
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!desc.trim() || !price || Number(price) <= 0}
        className="px-3.5 h-8 bg-[#F95700] hover:bg-[#EA580C] text-white font-bold rounded-lg text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
        data-testid="on-the-fly-add-btn"
      >
        + Add
      </button>
    </div>
  );
};

export const PosWalkInCustomerHeader: React.FC<{
  customerName?: string;
  phone?: string;
  vehicleNo?: string;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: (name: string, phone: string, vehicle: string) => void;
  onCancel?: () => void;
}> = ({
  customerName = 'Walk-in Counter Sale',
  phone,
  vehicleNo,
  onEdit,
  isEditing = false,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(customerName);
  const [ph, setPh] = useState(phone || '');
  const [veh, setVeh] = useState(vehicleNo || '');

  useEffect(() => {
    setName(customerName);
    setPh(phone || '');
    setVeh(vehicleNo || '');
  }, [customerName, phone, vehicleNo]);

  if (isEditing && onSave) {
    return (
      <div
        className="p-3 bg-white rounded-[12px] border border-orange-300 shadow-sm flex flex-col gap-2 text-xs"
        data-testid="pos-walk-in-customer-header"
      >
        <span className="font-bold text-slate-900">Edit Customer & Vehicle Info</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 px-2 border border-slate-200 rounded text-xs"
            data-testid="walk-in-customer-name-input"
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="h-8 px-2 border border-slate-200 rounded text-xs font-mono"
          />
          <input
            type="text"
            placeholder="Vehicle Plate (optional)"
            value={veh}
            onChange={(e) => setVeh(e.target.value)}
            className="h-8 px-2 border border-slate-200 rounded text-xs font-mono uppercase"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => onSave(name, ph, veh)}
            className="px-3 py-1 bg-[#F95700] text-white font-bold rounded text-xs cursor-pointer"
          >
            Save Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-[12px] border border-slate-200/80 text-xs shadow-xs"
      data-testid="pos-walk-in-customer-header"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="font-bold text-slate-900 truncate">{customerName}</span>
        {phone && <span className="text-[11px] text-slate-500 font-mono">({phone})</span>}
        {vehicleNo && (
          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono font-bold text-slate-700">
            {vehicleNo}
          </span>
        )}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] text-[#F95700] hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Edit3 className="w-3 h-3" />
          <span>Change</span>
        </button>
      )}
    </div>
  );
};

export const PosCartFinancialSummary: React.FC<{
  subtotalRs: number;
  discountRs: number;
  totalRs: number;
  itemCount: number;
  overallDiscountRs?: number;
  onOverallDiscountChange?: (discountRs: number) => void;
}> = ({
  subtotalRs,
  discountRs,
  totalRs,
  itemCount,
  overallDiscountRs = 0,
  onOverallDiscountChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-[14px] border border-slate-200 text-xs">
      <div className="flex items-center justify-between text-slate-500">
        <span>Cart Items</span>
        <span className="font-sans tabular-nums font-bold text-slate-800" data-testid="cart-summary-item-count">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex items-center justify-between text-slate-600">
        <span>Subtotal</span>
        <span className="font-sans tabular-nums font-semibold text-slate-900" data-testid="cart-subtotal">
          {globalDesignManager.formatRs(subtotalRs)}
        </span>
      </div>

      {discountRs > 0 && (
        <div className="flex items-center justify-between text-rose-600 font-medium">
          <span>Product Discount</span>
          <span className="font-sans tabular-nums" data-testid="cart-line-discounts">
            -{globalDesignManager.formatRs(discountRs)}
          </span>
        </div>
      )}

      {onOverallDiscountChange !== undefined && (
        <div className="flex items-center justify-between text-slate-600">
          <span>Extra Discount</span>
          <input
            type="number"
            min={0}
            value={overallDiscountRs || ''}
            onChange={(e) => onOverallDiscountChange(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0"
            className="w-20 h-6 px-1.5 text-right font-sans tabular-nums text-xs border border-slate-200 rounded bg-white text-slate-800"
            data-testid="cart-overall-discount-input"
          />
        </div>
      )}

      {overallDiscountRs > 0 && (
        <div className="flex items-center justify-between text-rose-600 font-medium text-[11px]">
          <span>Total Discount</span>
          <span className="font-sans tabular-nums" data-testid="cart-total-discount">
            -{globalDesignManager.formatRs(discountRs + overallDiscountRs)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
        <span>Net Total</span>
        <span className="text-lg font-bold font-sans tabular-nums text-slate-900" data-testid="cart-net-payable">
          {globalDesignManager.formatRs(totalRs)}
        </span>
      </div>
    </div>
  );
};

export const PosCollectPaymentModal: React.FC<{
  open: boolean;
  orderNumber?: string;
  totalRs?: number;
  netSalesRs?: number;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (paymentDetails: any) => void;
  onCompletePayment?: (result: any) => void;
  title?: string;
  defaultPaymentType?: 'ADVANCE' | 'CUSTOMER_EXCESS' | 'INSURANCE_SETTLEMENT' | 'FULL_PAYMENT';
  allowTypeSelection?: boolean;
  customerName?: string;
  customerNote?: string;
  isShiftOpen?: boolean;
  paymentTypeTotals?: Partial<
    Record<'ADVANCE' | 'CUSTOMER_EXCESS' | 'INSURANCE_SETTLEMENT' | 'FULL_PAYMENT', number>
  >;
}> = ({
  open,
  orderNumber = 'POS-ORDER',
  totalRs,
  netSalesRs,
  onClose,
  onOpenChange,
  onComplete,
  onCompletePayment,
  title,
  defaultPaymentType = 'FULL_PAYMENT',
  allowTypeSelection = false,
  customerName,
  customerNote,
  isShiftOpen = true,
  paymentTypeTotals,
}) => {
  const effectiveTotal = totalRs !== undefined ? totalRs : netSalesRs !== undefined ? netSalesRs : 0;

  const [paymentType, setPaymentType] = useState(defaultPaymentType);
  const [tenderMode, setTenderMode] = useState<'FULL' | 'SPLIT'>('FULL');
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');

  // Tender amount
  const [tenderedRs, setTenderedRs] = useState<number>(effectiveTotal);
  const [isTenderDirty, setIsTenderDirty] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Split details
  const [splitCash, setSplitCash] = useState<number | ''>('');
  const [splitCard, setSplitCard] = useState<number | ''>('');
  const [splitTransfer, setSplitTransfer] = useState<number | ''>('');
  const [activeSplitField, setActiveSplitField] = useState<'cash' | 'card' | 'transfer'>('cash');

  const activeTotalRs =
    paymentTypeTotals && paymentTypeTotals[paymentType] !== undefined
      ? paymentTypeTotals[paymentType]!
      : effectiveTotal;

  useEffect(() => {
    if (open) {
      const initialTotal =
        paymentTypeTotals && paymentTypeTotals[defaultPaymentType] !== undefined
          ? paymentTypeTotals[defaultPaymentType]!
          : effectiveTotal;
      setTenderedRs(initialTotal);
      setIsTenderDirty(false);
      setPaymentType(defaultPaymentType);
      setMethod(defaultPaymentType === 'INSURANCE_SETTLEMENT' ? 'CHEQUE' : 'CASH');
      setTenderMode('FULL');
      setReferenceNumber('');
      setNotes('');
      setSplitCash('');
      setSplitCard('');
      setSplitTransfer('');
      setActiveSplitField('cash');
    }
  }, [open, effectiveTotal, defaultPaymentType, paymentTypeTotals]);

  if (!open) return null;

  const closeSelf = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  // Split balance math
  const splitCashVal = Number(splitCash) || 0;
  const splitCardVal = Number(splitCard) || 0;
  const splitTransferVal = Number(splitTransfer) || 0;
  const splitTotal = splitCashVal + splitCardVal + splitTransferVal;
  const splitRemaining = activeTotalRs - splitTotal;
  const isSplitBalanced = Math.abs(splitRemaining) < 0.01;

  // Keypad actions
  const handleKeypadPress = (digit: string) => {
    if (tenderMode === 'SPLIT') {
      const updateSplit = (prev: number | '') => {
        const s = String(prev ?? '');
        return Number(`${s}${digit}`);
      };
      if (activeSplitField === 'cash') setSplitCash(updateSplit);
      else if (activeSplitField === 'card') setSplitCard(updateSplit);
      else if (activeSplitField === 'transfer') setSplitTransfer(updateSplit);
    } else {
      setMethod('CASH');
      if (!isTenderDirty) {
        setTenderedRs(Number(digit));
        setIsTenderDirty(true);
      } else {
        setTenderedRs((prev) => Number(`${prev || ''}${digit}`));
      }
    }
  };

  const handleKeypadClear = () => {
    if (tenderMode === 'SPLIT') {
      if (activeSplitField === 'cash') setSplitCash('');
      else if (activeSplitField === 'card') setSplitCard('');
      else if (activeSplitField === 'transfer') setSplitTransfer('');
    } else {
      setTenderedRs(0);
      setIsTenderDirty(true);
    }
  };

  const handleKeypadBackspace = () => {
    if (tenderMode === 'SPLIT') {
      const update = (v: number | '') => {
        const s = String(v ?? '');
        return s.length > 1 ? Number(s.slice(0, -1)) : '';
      };
      if (activeSplitField === 'cash') setSplitCash(update);
      else if (activeSplitField === 'card') setSplitCard(update);
      else if (activeSplitField === 'transfer') setSplitTransfer(update);
    } else {
      if (!isTenderDirty) {
        setTenderedRs(0);
        setIsTenderDirty(true);
      } else {
        const s = String(tenderedRs || '');
        setTenderedRs(s.length > 1 ? Number(s.slice(0, -1)) : 0);
      }
    }
  };

  const handleQuickAdd = (amt: number) => {
    setTenderedRs((prev) => (Number(prev) || 0) + amt);
    setIsTenderDirty(true);
    setMethod('CASH');
    setTenderMode('FULL');
  };

  const handleExactCash = () => {
    setTenderedRs(activeTotalRs);
    setIsTenderDirty(false);
    setMethod('CASH');
    setTenderMode('FULL');
  };

  const handleSelectType = (tId: 'ADVANCE' | 'CUSTOMER_EXCESS' | 'INSURANCE_SETTLEMENT' | 'FULL_PAYMENT') => {
    setPaymentType(tId);
    if (tId === 'INSURANCE_SETTLEMENT') {
      setMethod('CHEQUE');
    } else if (method === 'CHEQUE') {
      setMethod('CASH');
    }
    if (paymentTypeTotals && paymentTypeTotals[tId] !== undefined) {
      setTenderedRs(paymentTypeTotals[tId]!);
      setIsTenderDirty(false);
    }
  };

  const handleFinish = () => {
    if (!isShiftOpen) {
      return;
    }

    const change = Math.max(0, (tenderMode === 'FULL' && method === 'CASH' ? tenderedRs : activeTotalRs) - activeTotalRs);

    const payload = {
      method: tenderMode === 'SPLIT' ? 'SPLIT' : method,
      paymentMethod: tenderMode === 'SPLIT' ? 'SPLIT' : method,
      tenderedRs: tenderMode === 'SPLIT' ? activeTotalRs : tenderedRs,
      amountTenderedRs: tenderMode === 'SPLIT' ? activeTotalRs : tenderedRs,
      amountRs: tenderMode === 'SPLIT' ? activeTotalRs : tenderedRs,
      changeGivenRs: change,
      totalRs: activeTotalRs,
      paymentType,
      referenceNumber,
      notes,
      splitDetails:
        tenderMode === 'SPLIT'
          ? {
              cashAmountRs: splitCashVal,
              cardAmountRs: splitCardVal,
              bankTransferAmountRs: splitTransferVal,
            }
          : undefined,
    };

    onComplete?.(payload);
    onCompletePayment?.(payload);
    closeSelf();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      data-testid="pos-collect-payment-modal"
    >
      <div className="w-full max-w-[440px] bg-white rounded-[22px] border border-slate-200 shadow-2xl p-5 sm:p-6 flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title || 'Collect Payment'}</h3>
            <span className="text-[11px] font-mono text-slate-400">
              Ref #{orderNumber} {customerName || customerNote ? `• ${customerName || customerNote}` : ''}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              {paymentType === 'INSURANCE_SETTLEMENT' ? 'Insurance Balance' : 'Payable Due'}
            </span>
            <span className="text-xl font-sans tabular-nums font-black text-[#F95700]" data-testid="pos-modal-net-payable">
              {globalDesignManager.formatRs(activeTotalRs)}
            </span>
          </div>
        </div>

        {/* Settlement Category Selection (for Workshop Invoices) */}
        {allowTypeSelection && (
          <div className="flex flex-col gap-1.5" data-testid="pos-payment-type-select">
            <label className="text-[11px] font-semibold text-slate-600">Settlement Category</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'ADVANCE', label: 'Advance Deposit' },
                  { id: 'CUSTOMER_EXCESS', label: 'Customer Excess' },
                  { id: 'INSURANCE_SETTLEMENT', label: 'Insurance Cheque' },
                  { id: 'FULL_PAYMENT', label: 'Full Settlement' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectType(t.id)}
                  className={clsx(
                    'py-1.5 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                    paymentType === t.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Full Payment vs Split Bill Segmented Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTenderMode('FULL')}
            className={clsx(
              'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center',
              tenderMode === 'FULL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            )}
            data-testid="payment-method-full-tab"
          >
            Full Payment
          </button>
          <button
            type="button"
            onClick={() => {
              setTenderMode('SPLIT');
              if (!splitCash && !splitCard) {
                setSplitCash(activeTotalRs);
              }
            }}
            className={clsx(
              'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center',
              tenderMode === 'SPLIT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            )}
            data-testid="payment-method-split-tab"
          >
            Split Bill
          </button>
        </div>

        {/* Method Icon Tiles (when FULL payment) */}
        {tenderMode === 'FULL' && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote, testId: 'payment-method-cash-tab' },
              { id: 'CARD', label: 'Card', icon: CreditCard, testId: 'payment-method-card-tab' },
              { id: 'BANK_TRANSFER', label: 'Bank QR', icon: QrCode, testId: 'payment-method-transfer-tab' },
              { id: 'CHEQUE', label: 'Cheque', icon: FileText, testId: 'payment-method-cheque-tab' },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  data-testid={m.testId}
                  onClick={() => {
                    setMethod(m.id as any);
                    if (m.id !== 'CASH') setTenderedRs(activeTotalRs);
                  }}
                  className={clsx(
                    'p-2.5 rounded-[14px] border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tender Amount & Quick Presets (when FULL tender) */}
        {tenderMode === 'FULL' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600">Amount Tendered (Rs.)</label>
              <button
                type="button"
                onClick={handleExactCash}
                className="text-[10px] text-[#F95700] hover:underline font-bold cursor-pointer"
              >
                Exact ({globalDesignManager.formatRs(activeTotalRs)})
              </button>
            </div>
            <input
              type="number"
              value={tenderedRs !== undefined && !isNaN(tenderedRs) ? tenderedRs : ''}
              onChange={(e) => setTenderedRs(e.target.value === '' ? 0 : Number(e.target.value))}
              data-testid="pos-payment-amount-input"
              className="w-full h-11 px-3 text-lg font-mono font-black border border-slate-200 rounded-[12px] text-right focus:border-[#F95700] focus:outline-none"
            />

            {/* Quick cash denomination chips */}
            {method === 'CASH' && (
              <PosQuickCashPresetPills
                totalAmountRs={activeTotalRs}
                onSelectAmount={handleExactCash}
                onAddAmount={handleQuickAdd}
              />
            )}

            {/* Change Due Banner */}
            {method === 'CASH' && (
              <PosChangeDueBanner totalRs={activeTotalRs} tenderedRs={tenderedRs} />
            )}
          </div>
        )}

        {/* Split Bill Tender Allocator */}
        {tenderMode === 'SPLIT' && (
          <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-[14px] border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Split Bill Allocation</span>
              <span
                className={clsx(
                  'text-[11px] font-bold font-mono px-2 py-0.5 rounded-full',
                  isSplitBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                )}
                data-testid="split-remaining-indicator"
              >
                {isSplitBalanced
                  ? 'Balanced'
                  : `Remaining: ${globalDesignManager.formatRs(splitRemaining)}`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Cash (Rs.)</label>
                <input
                  type="number"
                  value={splitCash}
                  onFocus={() => setActiveSplitField('cash')}
                  onChange={(e) => setSplitCash(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  data-testid="split-cash-input"
                  placeholder="0"
                  className={clsx(
                    'w-full h-8 px-2 border rounded-lg font-mono text-right text-xs bg-white',
                    activeSplitField === 'cash' ? 'border-[#F95700] ring-1 ring-[#F95700]' : 'border-slate-200'
                  )}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Card (Rs.)</label>
                <input
                  type="number"
                  value={splitCard}
                  onFocus={() => setActiveSplitField('card')}
                  onChange={(e) => setSplitCard(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  data-testid="split-card-input"
                  placeholder="0"
                  className={clsx(
                    'w-full h-8 px-2 border rounded-lg font-mono text-right text-xs bg-white',
                    activeSplitField === 'card' ? 'border-[#F95700] ring-1 ring-[#F95700]' : 'border-slate-200'
                  )}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Bank QR (Rs.)</label>
                <input
                  type="number"
                  value={splitTransfer}
                  onFocus={() => setActiveSplitField('transfer')}
                  onChange={(e) => setSplitTransfer(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  data-testid="split-transfer-input"
                  placeholder="0"
                  className={clsx(
                    'w-full h-8 px-2 border rounded-lg font-mono text-right text-xs bg-white',
                    activeSplitField === 'transfer' ? 'border-[#F95700] ring-1 ring-[#F95700]' : 'border-slate-200'
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tactile Touch Keypad */}
        <div className="pt-1">
          <PosTouchNumericKeypad
            onKeyPress={handleKeypadPress}
            onClear={handleKeypadClear}
            onBackspace={handleKeypadBackspace}
          />
        </div>

        {/* References & Remarks */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Slip / Auth Ref #"
            data-testid="pos-payment-reference-input"
            className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white font-mono"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            data-testid="pos-payment-notes-input"
            className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white"
          />
        </div>

        {/* Shift Closed Warning Banner */}
        {!isShiftOpen && (
          <div
            className="p-2.5 bg-amber-50 border border-amber-200 rounded-[12px] text-amber-900 text-xs flex items-center gap-2"
            data-testid="shift-closed-alert"
          >
            <Vault className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              Register shift is currently closed. Open a shift in Shift & Drawer to complete payments.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={closeSelf}
            data-testid="pos-payment-cancel-btn"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={
              !isShiftOpen ||
              (tenderMode === 'SPLIT'
                ? !isSplitBalanced
                : !tenderedRs || tenderedRs <= 0)
            }
            data-testid="pos-payment-submit-btn"
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-[12px] transition-all cursor-pointer shadow-xs"
          >
            Complete & Print 80mm
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={
              !isShiftOpen ||
              (tenderMode === 'SPLIT'
                ? !isSplitBalanced
                : !tenderedRs || tenderedRs <= 0)
            }
            data-testid="complete-pos-payment-btn"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export const PosSplitTenderAllocator: React.FC<{
  totalRs: number;
  cashAmount: number;
  cardAmount: number;
  onCashChange: (amt: number) => void;
  onCardChange: (amt: number) => void;
}> = ({ totalRs, cashAmount, cardAmount, onCashChange, onCardChange }) => {
  const remaining = Math.max(0, totalRs - (cashAmount + cardAmount));

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-[12px] border border-slate-200 text-xs">
      <span className="font-bold text-slate-700 uppercase">Split Tender Allocation</span>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-500 block">Cash Portion (Rs.)</label>
          <input
            type="number"
            value={cashAmount || ''}
            onChange={(e) => onCashChange(Number(e.target.value))}
            className="w-full h-8 px-2 border rounded font-mono text-right"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block">Card Portion (Rs.)</label>
          <input
            type="number"
            value={cardAmount || ''}
            onChange={(e) => onCardChange(Number(e.target.value))}
            className="w-full h-8 px-2 border rounded font-mono text-right"
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-1 border-t text-[11px] font-mono">
        <span>Unallocated Balance:</span>
        <span className={clsx('font-bold', remaining > 0 ? 'text-red-600' : 'text-emerald-700')}>
          {globalDesignManager.formatRs(remaining)}
        </span>
      </div>
    </div>
  );
};

export const PosShiftOpenModal: React.FC<{
  open: boolean;
  onOpenShift: (floatRs: number, notes: string) => void;
  onClose?: () => void;
}> = ({ open, onOpenShift, onClose }) => {
  const [floatRs, setFloatRs] = useState<number | ''>(15000);
  const [notes, setNotes] = useState('Morning Counter Shift');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
      data-testid="pos-shift-open-modal"
    >
      <div className="w-full max-w-sm bg-white rounded-[22px] border border-slate-200 shadow-2xl p-6 flex flex-col gap-4 text-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Open Register Shift</h3>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Opening Cash Float (Rs.)</label>
          <input
            type="number"
            value={floatRs}
            onChange={(e) => setFloatRs(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full h-10 px-3 border border-slate-200 rounded-[10px] font-mono font-bold text-slate-900 text-lg focus:border-indigo-600 focus:outline-none"
            data-testid="shift-open-float-input"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Shift Notes</label>
          <input
            type="text"
            placeholder="e.g. Morning counter shift"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-9 px-3 border border-slate-200 rounded-[10px] text-xs focus:border-indigo-600 focus:outline-none"
            data-testid="shift-open-notes-input"
          />
        </div>

        <button
          type="button"
          onClick={() => onOpenShift(Number(floatRs) || 0, notes)}
          disabled={floatRs === '' || Number(floatRs) < 0}
          className="w-full py-2.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-[12px] shadow-xs cursor-pointer disabled:opacity-50 transition-all text-center"
          data-testid="shift-open-submit-btn"
        >
          Unlock Register & Start Shift
        </button>
      </div>
    </div>
  );
};

export const PosPettyCashOutDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onRecord: (amount: number, reason: string) => void;
}> = ({ open, onClose, onRecord }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
      data-testid="pos-petty-cash-modal"
    >
      <div className="w-full max-w-sm bg-white rounded-[22px] border border-slate-200 shadow-2xl p-6 flex flex-col gap-3.5 text-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Petty Cash Payout</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-slate-700 font-bold block mb-1">Disbursement Amount (Rs.)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="0.00"
            className="w-full h-10 px-3 border border-slate-200 rounded-[10px] font-mono font-bold text-lg text-rose-600 focus:outline-none focus:border-rose-500"
            data-testid="petty-cash-amount-input"
          />
        </div>

        <div>
          <label className="text-slate-700 font-bold block mb-1">Expense Reason / Category</label>
          <input
            type="text"
            placeholder="e.g. Staff tea, courier, urgent hardware..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-9 px-3 border border-slate-200 rounded-[10px] text-xs focus:outline-none focus:border-rose-500"
            data-testid="petty-cash-reason-input"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={!amount || Number(amount) <= 0 || !reason.trim()}
            onClick={() => {
              onRecord(Number(amount), reason.trim());
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-[10px] disabled:opacity-50 cursor-pointer shadow-xs"
            data-testid="petty-cash-submit-btn"
          >
            Disburse Cash
          </button>
        </div>
      </div>
    </div>
  );
};

export const PosShiftReconciliationSheet: React.FC<{
  openingFloatRs: number;
  cashSalesRs: number;
  pettyCashOutRs: number;
  cashInRs?: number;
  onCloseShift: (countedCashRs: number) => void;
  isClosed?: boolean;
  actualDrawerCashRs?: number;
  varianceRs?: number;
}> = ({
  openingFloatRs,
  cashSalesRs,
  pettyCashOutRs,
  cashInRs = 0,
  onCloseShift,
  isClosed = false,
  actualDrawerCashRs,
  varianceRs,
}) => {
  const expectedCash = openingFloatRs + cashInRs + cashSalesRs - pettyCashOutRs;
  const initialCounted = isClosed && actualDrawerCashRs !== undefined ? actualDrawerCashRs : expectedCash;
  const [counted, setCounted] = useState<number | ''>(initialCounted);

  useEffect(() => {
    if (isClosed && actualDrawerCashRs !== undefined) {
      setCounted(actualDrawerCashRs);
    } else {
      setCounted(expectedCash);
    }
  }, [expectedCash, isClosed, actualDrawerCashRs]);

  const countedNum = Number(counted) || 0;
  const diff = isClosed && varianceRs !== undefined ? varianceRs : countedNum - expectedCash;

  return (
    <div
      className="p-5 bg-white rounded-[20px] border border-slate-200/80 shadow-xs flex flex-col gap-3.5 text-xs font-sans"
      data-testid="pos-shift-reconciliation-sheet"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-900 font-sans text-sm flex items-center gap-2">
          <Vault className="w-4 h-4 text-slate-700" />
          <span>End of Shift Reconciliation</span>
        </h3>
        <span
          className={clsx(
            'px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans tabular-nums',
            diff === 0
              ? 'bg-emerald-100 text-emerald-800'
              : diff > 0
              ? 'bg-blue-100 text-blue-800'
              : 'bg-rose-100 text-rose-800'
          )}
          data-testid="shift-variance-badge"
        >
          {diff === 0
            ? 'Balanced'
            : diff > 0
            ? `Cash Over (+${globalDesignManager.formatRs(diff)})`
            : `Cash Short (-${globalDesignManager.formatRs(Math.abs(diff))})`}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 text-xs">
        <div className="flex justify-between items-center text-slate-600 font-medium">
          <span>Opening Float:</span>
          <span className="font-semibold font-sans tabular-nums text-slate-900">{globalDesignManager.formatRs(openingFloatRs)}</span>
        </div>
        {cashInRs > 0 && (
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>+ Cash In (Additions):</span>
            <span className="font-semibold font-sans tabular-nums text-slate-900">+{globalDesignManager.formatRs(cashInRs)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-slate-600 font-medium">
          <span>+ Cash Sales:</span>
          <span className="font-semibold font-sans tabular-nums text-slate-900">+{globalDesignManager.formatRs(cashSalesRs)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600 font-medium">
          <span>- Petty Cash Out:</span>
          <span className="font-semibold font-sans tabular-nums text-slate-900">-{globalDesignManager.formatRs(pettyCashOutRs)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-slate-900 text-xs font-semibold">
          <span>Expected In Drawer:</span>
          <span className="font-bold font-sans tabular-nums text-slate-900" data-testid="expected-drawer-cash-value">{globalDesignManager.formatRs(expectedCash)}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 block mb-1.5">Physical Counted Cash (Rs.)</label>
        <input
          type="number"
          disabled={isClosed}
          value={counted}
          onChange={(e) => setCounted(e.target.value === '' ? '' : parseFloat(e.target.value))}
          className="w-full h-9 px-3 text-sm font-semibold tabular-nums text-left border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
          data-testid="close-counted-cash-input"
        />
      </div>

      <button
        type="button"
        disabled={isClosed}
        onClick={() => onCloseShift(countedNum)}
        className="w-full h-9 font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs cursor-pointer transition-all text-center flex items-center justify-center"
        data-testid="confirm-close-shift-btn"
      >
        {isClosed ? 'Register Shift Closed & Finalized' : 'Lock Drawer & Finalize Shift'}
      </button>
    </div>
  );
};

export const PosHeldBillsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  heldBills: Array<{ id: string; customer: string; totalRs: number; time: string; itemsCount: number }>;
  onResume: (id: string) => void;
  onDelete?: (id: string) => void;
}> = ({ open, onClose, heldBills, onResume, onDelete }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      data-testid="pos-held-bills-drawer"
    >
      <div className="w-88 max-w-full h-full bg-white border-l border-slate-200 p-5 flex flex-col gap-4 overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#F95700]" />
            <h3 className="text-sm font-bold text-slate-900">Parked / Held Carts ({heldBills.length})</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {heldBills.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <span>No parked carts at the moment</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {heldBills.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-[14px] flex flex-col gap-2 text-xs hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{b.customer}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {b.itemsCount} {b.itemsCount === 1 ? 'item' : 'items'} • {b.time}
                    </span>
                  </div>
                  <span className="font-sans tabular-nums font-bold text-[#F95700] text-sm">
                    {globalDesignManager.formatRs(b.totalRs)}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(b.id)}
                      className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onResume(b.id);
                      onClose();
                    }}
                    className="px-3 py-1 bg-[#F95700] hover:bg-[#EA580C] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    data-testid={`resume-held-cart-btn-${b.id}`}
                  >
                    Resume Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const PosRecentReceiptsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  recentSales: Array<{ id: string; receiptNo: string; totalRs: number; time: string; customer?: string }>;
  onReprint: (id: string) => void;
}> = ({ open, onClose, recentSales, onReprint }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      data-testid="pos-recent-receipts-drawer"
    >
      <div className="w-88 max-w-full h-full bg-white border-l border-slate-200 p-5 flex flex-col gap-4 overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Today's Receipts ({recentSales.length})</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <span>No receipts recorded today yet</span>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSales.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-[12px] flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 block">{s.receiptNo}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {s.time} {s.customer ? `• ${s.customer}` : ''}
                  </span>
                  <span className="font-sans tabular-nums font-bold text-emerald-700 block mt-0.5">
                    {globalDesignManager.formatRs(s.totalRs)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onReprint(s.id)}
                  className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-xs"
                  data-testid={`reprint-receipt-btn-${s.receiptNo}`}
                  title="Reprint 80mm Receipt"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const PosLowStockWarningBadge: React.FC<{ stockQty: number }> = ({ stockQty }) => {
  if (stockQty > 5) return null;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
      {stockQty <= 0 ? 'Out of Stock' : `Only ${stockQty} Left`}
    </span>
  );
};
