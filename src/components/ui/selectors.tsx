import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Plus, User, Car, Truck, Package, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';
import { globalDesignManager } from '@/design-system/global-manager';

export interface EntityOption {
  id: string;
  primary: string;
  secondary?: string;
  badge?: string;
  detail?: string;
  metadata?: any;
}

export interface EntitySelectorProps {
  label?: string;
  placeholder?: string;
  selectedId?: string;
  options: EntityOption[];
  onSelect: (option: EntityOption | null) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  label,
  placeholder = 'Search...',
  selectedId,
  options,
  onSelect,
  onAddNew,
  addNewLabel = 'Create New',
  isLoading = false,
  disabled = false,
  error = false,
  icon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.id === selectedId);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const filtered = options.filter(
    (o) =>
      o.primary.toLowerCase().includes(query.toLowerCase()) ||
      (o.secondary && o.secondary.toLowerCase().includes(query.toLowerCase())) ||
      (o.badge && o.badge.toLowerCase().includes(query.toLowerCase()))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        onSelect(filtered[activeIndex]);
        setIsOpen(false);
        setQuery('');
      } else if (filtered.length === 1) {
        onSelect(filtered[0]);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}

      {selectedOption ? (
        // Selected Pill / Card State
        <div
          className={cn(
            'flex items-center justify-between h-10 px-3.5 bg-white border rounded-[10px] shadow-2xs transition-all',
            error ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200/90',
            disabled && 'bg-slate-50 opacity-60 pointer-events-none'
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            {icon && <span className="text-slate-400 shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
            <div className="flex items-baseline gap-2 truncate">
              <span className="text-sm font-semibold text-slate-900 truncate">{selectedOption.primary}</span>
              {selectedOption.secondary && (
                <span className="text-xs text-slate-500 truncate">{selectedOption.secondary}</span>
              )}
            </div>
            {selectedOption.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                {selectedOption.badge}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onSelect(null);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Search Input State
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : (
              icon || <Search className="w-4 h-4" />
            )}
          </span>

          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full h-10 pl-9 pr-8 text-sm bg-white border rounded-[10px] transition-all',
              'placeholder:text-slate-400 text-slate-900',
              error
                ? 'border-red-500 ring-2 ring-red-500/10'
                : 'border-slate-200/90 hover:border-slate-300 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
              disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed'
            )}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Popover Dropdown */}
      {isOpen && !selectedOption && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500">No results found for "{query}"</p>
                {onAddNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onAddNew();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F95700] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{addNewLabel}</span>
                  </button>
                )}
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'w-full p-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer',
                      isActive ? 'bg-orange-50/70 text-[#F95700]' : 'hover:bg-slate-50 text-slate-800'
                    )}
                  >
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.primary}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.secondary && (
                        <span className="text-[11px] text-slate-500 truncate">{item.secondary}</span>
                      )}
                    </div>
                    {item.detail && (
                      <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 shrink-0">
                        {item.detail}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {onAddNew && filtered.length > 0 && (
            <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F95700] hover:text-[#EA580C] px-2 py-1 rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addNewLabel}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized Domain Selectors
export interface CustomerSelectorProps {
  selectedCustomerId?: string;
  customers: Array<{ id: string; name: string; phone: string; address?: string }>;
  onSelectCustomer: (cust: { id: string; name: string; phone: string } | null) => void;
  onAddNewCustomer?: () => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomerId,
  customers,
  onSelectCustomer,
  onAddNewCustomer,
  disabled,
  error,
  className,
}) => {
  const options: EntityOption[] = customers.map((c) => ({
    id: c.id,
    primary: c.name,
    secondary: c.phone,
    badge: c.address,
  }));

  return (
    <EntitySelector
      label="Customer Account"
      placeholder="Search customer by name or phone..."
      selectedId={selectedCustomerId}
      options={options}
      onSelect={(opt) =>
        onSelectCustomer(
          opt ? { id: opt.id, name: opt.primary, phone: opt.secondary || '' } : null
        )
      }
      onAddNew={onAddNewCustomer}
      addNewLabel="Add New Customer"
      icon={<User className="w-4 h-4 text-slate-400" />}
      disabled={disabled}
      error={error}
      className={className}
    />
  );
};

export interface VehicleSelectorProps {
  selectedVehicleId?: string;
  vehicles: Array<{ id: string; plateNumber: string; makeModel: string; year?: number }>;
  onSelectVehicle: (veh: { id: string; plateNumber: string; makeModel: string } | null) => void;
  onAddNewVehicle?: () => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicleId,
  vehicles,
  onSelectVehicle,
  onAddNewVehicle,
  disabled,
  error,
  className,
}) => {
  const options: EntityOption[] = vehicles.map((v) => ({
    id: v.id,
    primary: v.plateNumber,
    secondary: v.makeModel,
    badge: v.year ? String(v.year) : undefined,
  }));

  return (
    <EntitySelector
      label="Vehicle Registration"
      placeholder="Search vehicle plate (e.g. WP CAD-5678)..."
      selectedId={selectedVehicleId}
      options={options}
      onSelect={(opt) =>
        onSelectVehicle(
          opt ? { id: opt.id, plateNumber: opt.primary, makeModel: opt.secondary || '' } : null
        )
      }
      onAddNew={onAddNewVehicle}
      addNewLabel="Register Vehicle"
      icon={<Car className="w-4 h-4 text-slate-400" />}
      disabled={disabled}
      error={error}
      className={className}
    />
  );
};

export interface SupplierSelectorProps {
  selectedSupplierId?: string;
  suppliers: Array<{ id: string; name: string; contactPerson?: string; phone?: string }>;
  onSelectSupplier: (sup: { id: string; name: string } | null) => void;
  disabled?: boolean;
  className?: string;
}

export const SupplierSelector: React.FC<SupplierSelectorProps> = ({
  selectedSupplierId,
  suppliers,
  onSelectSupplier,
  disabled,
  className,
}) => {
  const options: EntityOption[] = suppliers.map((s) => ({
    id: s.id,
    primary: s.name,
    secondary: s.contactPerson,
    detail: s.phone,
  }));

  return (
    <EntitySelector
      label="Parts Supplier"
      placeholder="Search supplier..."
      selectedId={selectedSupplierId}
      options={options}
      onSelect={(opt) => onSelectSupplier(opt ? { id: opt.id, name: opt.primary } : null)}
      icon={<Truck className="w-4 h-4 text-slate-400" />}
      disabled={disabled}
      className={className}
    />
  );
};

export interface ProductSelectorProps {
  selectedProductId?: string;
  products: Array<{ id: string; name: string; sku: string; priceRs: number; stock: number }>;
  onSelectProduct: (prod: { id: string; name: string; sku: string; priceRs: number } | null) => void;
  disabled?: boolean;
  className?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProductId,
  products,
  onSelectProduct,
  disabled,
  className,
}) => {
  const options: EntityOption[] = products.map((p) => ({
    id: p.id,
    primary: p.name,
    secondary: `SKU: ${p.sku}`,
    badge: `${p.stock} in stock`,
    detail: globalDesignManager.formatRs(p.priceRs),
    metadata: p,
  }));

  return (
    <EntitySelector
      label="Catalog Item / Spare Part"
      placeholder="Search parts by name or SKU..."
      selectedId={selectedProductId}
      options={options}
      onSelect={(opt) =>
        onSelectProduct(
          opt
            ? {
                id: opt.id,
                name: opt.primary,
                sku: opt.metadata?.sku || '',
                priceRs: opt.metadata?.priceRs || 0,
              }
            : null
        )
      }
      icon={<Package className="w-4 h-4 text-slate-400" />}
      disabled={disabled}
      className={className}
    />
  );
};

export interface BatchSelectorProps {
  selectedBatchId?: string;
  batches: Array<{
    id: string;
    batchNumber: string;
    expiryDate?: string;
    quantity: number;
    unitCostRs?: number;
    sellingPriceRs?: number;
  }>;
  onSelectBatch: (
    batch: {
      id: string;
      batchNumber: string;
      quantity: number;
      unitCostRs?: number;
      sellingPriceRs?: number;
    } | null
  ) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  selectedBatchId,
  batches,
  onSelectBatch,
  disabled,
  error,
  className,
}) => {
  const options: EntityOption[] = batches.map((b) => ({
    id: b.id,
    primary: b.batchNumber,
    secondary: b.expiryDate ? `Exp: ${b.expiryDate}` : undefined,
    badge: `${b.quantity} in batch`,
    detail: b.sellingPriceRs !== undefined ? globalDesignManager.formatRs(b.sellingPriceRs) : undefined,
    metadata: b,
  }));

  return (
    <EntitySelector
      label="Inventory Batch"
      placeholder="Search batch number..."
      selectedId={selectedBatchId}
      options={options}
      onSelect={(opt) =>
        onSelectBatch(
          opt
            ? {
                id: opt.id,
                batchNumber: opt.primary,
                quantity: opt.metadata?.quantity || 0,
                unitCostRs: opt.metadata?.unitCostRs,
                sellingPriceRs: opt.metadata?.sellingPriceRs,
              }
            : null
        )
      }
      icon={<Layers className="w-4 h-4 text-slate-400" />}
      disabled={disabled}
      error={error}
      className={className}
    />
  );
};
