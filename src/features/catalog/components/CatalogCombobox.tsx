import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, Lock } from 'lucide-react';
import { CatalogItem, CatalogItemType } from '../types';
import { catalogRepository } from '../repository/catalog.repository.mock';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { cn } from '@/utils/cn';

export interface CatalogComboboxProps {
  onSelect: (item: CatalogItem) => void;
  onSelectCustom?: (customDescription: string) => void;
  itemTypeFilter?: CatalogItemType;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function CatalogCombobox({
  onSelect,
  onSelectCustom,
  itemTypeFilter,
  placeholder = 'Search catalog by SKU, name, or model...',
  className,
  autoFocus = false,
}: CatalogComboboxProps) {
  const { permissions, isCostProfitVisible } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const results = await catalogRepository.filter({
          search: query,
          itemType: itemTypeFilter || 'ALL',
          activeOnly: true,
        });
        if (!isCancelled) {
          setItems(results.slice(0, 8)); // Top 8 matches
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('CatalogCombobox search error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMatches();

    return () => {
      isCancelled = true;
    };
  }, [query, itemTypeFilter, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (item: CatalogItem) => {
    onSelect(item);
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectCustom = () => {
    if (!query.trim()) return;
    if (onSelectCustom) {
      onSelectCustom(query.trim());
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const trimmed = query.trim();
    const totalOptions = items.length + (onSelectCustom && trimmed ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < totalOptions ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();

      // Immediate exact match for physical barcode scanner rapid wedge input
      if (trimmed) {
        const directBarcode = catalogRepository.getByBarcodeSync
          ? catalogRepository.getByBarcodeSync(trimmed)
          : await catalogRepository.getByBarcode(trimmed);
        if (directBarcode) {
          handleSelectItem(directBarcode);
          return;
        }

        const directSku = catalogRepository.getBySkuSync
          ? catalogRepository.getBySkuSync(trimmed)
          : await catalogRepository.getBySku(trimmed);
        if (directSku) {
          handleSelectItem(directSku);
          return;
        }
      }

      if (selectedIndex >= 0 && selectedIndex < items.length) {
        handleSelectItem(items[selectedIndex]);
      } else if (
        selectedIndex === items.length ||
        (selectedIndex === -1 && trimmed)
      ) {
        if (items.length > 0 && selectedIndex === -1) {
          handleSelectItem(items[0]);
        } else {
          handleSelectCustom();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getItemTypeBadge = (type: CatalogItemType) => {
    switch (type) {
      case 'SPAREPART':
        return (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
            PART
          </span>
        );
      case 'LUBRICANT':
        return (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            FLUID
          </span>
        );
      case 'LABOR_REMOVE_REASSEMBLE':
        return (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
            R&R
          </span>
        );
      case 'LABOR_REPAIR':
        return (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            LABOR
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full h-9 pl-9 pr-8 rounded-md border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors"
          data-testid="catalog-combobox-input"
        />
        {isLoading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg text-xs"
          data-testid="catalog-combobox-dropdown"
        >
          {items.length === 0 && !query.trim() && (
            <div className="p-3 text-center text-slate-400 text-xs">
              Type to search spare parts, lubricants, or labor presets...
            </div>
          )}

          {items.length === 0 && query.trim() && (
            <div className="p-2 text-center text-slate-500 text-xs">
              No catalog match found for &quot;{query}&quot;.
            </div>
          )}

          {items.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const isPhysical =
              item.itemType === 'SPAREPART' || item.itemType === 'LUBRICANT';
            const isLowStock = isPhysical && item.stockQty <= item.lowStockAlertLevel;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                  isSelected ? 'bg-amber-50 text-slate-900' : 'hover:bg-slate-50 text-slate-800'
                )}
                data-testid={`catalog-option-${item.sku}`}
              >
                <div className="flex items-start gap-2 max-w-[70%]">
                  <div className="mt-0.5 shrink-0">{getItemTypeBadge(item.itemType)}</div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">
                        {item.sku}
                      </span>
                      <span className="font-medium text-slate-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    {item.vehicleCompatibility && (
                      <p className="text-[10px] text-slate-500 truncate">
                        Compat: {item.vehicleCompatibility}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2 space-y-0.5">
                  <div className="font-mono font-bold text-slate-900">
                    {formatRs(item.sellingPriceRs)}
                  </div>

                  {/* Stock indicator */}
                  {isPhysical ? (
                    <div className="text-[10px]">
                      {item.stockQty === 0 ? (
                        <span className="text-rose-600 font-bold">Out of stock</span>
                      ) : isLowStock ? (
                        <span className="text-amber-700 font-bold">
                          Low: {item.stockQty} {item.uom}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          {item.stockQty} in stock
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400">Preset service</div>
                  )}

                  {/* Internal cost: STRICT PRIVACY INVARIANT */}
                  {isCostProfitVisible && permissions.canViewCosts && (
                    <div className="text-[9px] font-mono text-amber-700 flex items-center justify-end gap-0.5">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Cost: {formatRs(item.buyingCostRs)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Zero CRM friction: Custom free-form item entry */}
          {onSelectCustom && query.trim() && (
            <div
              onClick={handleSelectCustom}
              onMouseEnter={() => setSelectedIndex(items.length)}
              className={cn(
                'mt-1 flex items-center gap-2 p-2 rounded-md border-t border-slate-100 cursor-pointer transition-colors',
                selectedIndex === items.length
                  ? 'bg-amber-100/70 text-amber-950 font-semibold'
                  : 'text-amber-900 hover:bg-amber-50'
              )}
              data-testid="catalog-combobox-custom-option"
            >
              <PlusCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="truncate">
                <span>Use custom entry: </span>
                <span className="font-bold underline">&quot;{query}&quot;</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
