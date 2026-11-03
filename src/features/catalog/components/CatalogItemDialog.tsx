import React, { useState, useEffect } from 'react';
import { Package, Lock, AlertCircle } from 'lucide-react';
import {
  CatalogItem,
  CatalogItemType,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
} from '../types';
import { catalogRepository } from '../repository/catalog.repository.mock';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RolePermissionGateWrapper } from '@/design-system/components/finance-privacy-components';
import { FileDropzoneDashed } from '@/design-system/components/form-inputs';

export interface CatalogItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: CatalogItem | null;
  onSaved: (item: CatalogItem) => void;
}

const CATEGORY_PRESETS = [
  'Body & Exterior',
  'Electrical & Lighting',
  'Braking System',
  'Engine Oils & Lubricants',
  'Transmission & Gear Oils',
  'Cooling & Fluids',
  'Filters & Service Kits',
  'Collision & Body Labor',
  'Paint & Tinkering Labor',
  'Mechanical Labor',
  'Consumables & Accessories',
];

export function CatalogItemDialog({
  open,
  onOpenChange,
  initialItem,
  onSaved,
}: CatalogItemDialogProps) {
  const { permissions } = useAuth();
  const isEditing = Boolean(initialItem);

  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [itemType, setItemType] = useState<CatalogItemType>('SPAREPART');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [vehicleCompatibility, setVehicleCompatibility] = useState('');
  const [uom, setUom] = useState('pcs');
  const [buyingCostRs, setBuyingCostRs] = useState('0');
  const [sellingPriceRs, setSellingPriceRs] = useState('0');
  const [defaultDiscountPct, setDefaultDiscountPct] = useState('0');
  const [stockQty, setStockQty] = useState('0');
  const [lowStockAlertLevel, setLowStockAlertLevel] = useState('2');
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setSku(initialItem.sku);
      setBarcode(initialItem.barcode || '');
      setItemType(initialItem.itemType);
      setName(initialItem.name);
      setCategory(initialItem.category);
      setVehicleCompatibility(initialItem.vehicleCompatibility || '');
      setUom(initialItem.uom);
      setBuyingCostRs(permissions.canViewCosts ? String(initialItem.buyingCostRs) : '0');
      setSellingPriceRs(String(initialItem.sellingPriceRs));
      setDefaultDiscountPct(String(initialItem.defaultDiscountPct));
      setStockQty(String(initialItem.stockQty));
      setLowStockAlertLevel(String(initialItem.lowStockAlertLevel));
      setIsActive(initialItem.isActive);
    } else {
      setSku('');
      setBarcode('');
      setItemType('SPAREPART');
      setName('');
      setCategory(CATEGORY_PRESETS[0]);
      setVehicleCompatibility('');
      setUom('pcs');
      setBuyingCostRs('0');
      setSellingPriceRs('0');
      setDefaultDiscountPct('0');
      setStockQty('0');
      setLowStockAlertLevel('2');
      setIsActive(true);
    }
    setError(null);
  }, [initialItem, open, permissions.canViewCosts]);

  // Adjust default UOM when itemType changes
  const handleTypeChange = (newType: CatalogItemType) => {
    setItemType(newType);
    if (newType === 'LABOR_REMOVE_REASSEMBLE' || newType === 'LABOR_REPAIR') {
      setUom('hours');
      setStockQty('0');
      setLowStockAlertLevel('0');
    } else if (newType === 'LUBRICANT') {
      setUom('cans');
    } else {
      setUom('pcs');
    }
  };

  const isLabor =
    itemType === 'LABOR_REMOVE_REASSEMBLE' || itemType === 'LABOR_REPAIR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!permissions.canManageCatalog) {
      setError('You lack permission to modify catalog items.');
      return;
    }

    if (!sku.trim()) {
      setError('SKU is required.');
      return;
    }
    if (!name.trim()) {
      setError('Item Name / Description is required.');
      return;
    }
    if (!category.trim()) {
      setError('Category is required.');
      return;
    }
    if (!uom.trim()) {
      setError('Unit of Measure (UOM) is required.');
      return;
    }

    const sellingPrice = parseFloat(sellingPriceRs);
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      setError('Selling Price must be a valid number greater than or equal to 0.');
      return;
    }

    const buyingCost = parseFloat(buyingCostRs);
    if (permissions.canViewCosts && (isNaN(buyingCost) || buyingCost < 0)) {
      setError('Buying Cost must be a valid number greater than or equal to 0.');
      return;
    }

    const stock = isLabor ? 0 : parseInt(stockQty, 10);
    if (!isLabor && (isNaN(stock) || stock < 0)) {
      setError('Stock Quantity must be a valid integer greater than or equal to 0.');
      return;
    }

    const alertLevel = isLabor ? 0 : parseInt(lowStockAlertLevel, 10);
    if (!isLabor && (isNaN(alertLevel) || alertLevel < 0)) {
      setError('Low stock alert level must be greater than or equal to 0.');
      return;
    }

    const discount = parseFloat(defaultDiscountPct);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      setError('Default discount must be between 0% and 100%.');
      return;
    }

    setIsSubmitting(true);
    try {
      let savedItem: CatalogItem;
      if (isEditing && initialItem) {
        const dto: UpdateCatalogItemDto = {
          sku: sku.trim().toUpperCase(),
          barcode: barcode.trim(),
          itemType,
          name: name.trim(),
          category: category.trim(),
          vehicleCompatibility: vehicleCompatibility.trim(),
          uom: uom.trim(),
          sellingPriceRs: sellingPrice,
          defaultDiscountPct: discount,
          stockQty: stock,
          lowStockAlertLevel: alertLevel,
          isActive,
        };
        // Only update buying cost if authorized to view/edit costs
        if (permissions.canViewCosts) {
          dto.buyingCostRs = buyingCost;
        }
        savedItem = await catalogRepository.update(initialItem.id, dto);
      } else {
        const dto: CreateCatalogItemDto = {
          sku: sku.trim().toUpperCase(),
          barcode: barcode.trim(),
          itemType,
          name: name.trim(),
          category: category.trim(),
          vehicleCompatibility: vehicleCompatibility.trim(),
          uom: uom.trim(),
          buyingCostRs: permissions.canViewCosts ? buyingCost : 0,
          sellingPriceRs: sellingPrice,
          defaultDiscountPct: discount,
          stockQty: stock,
          lowStockAlertLevel: alertLevel,
          isActive,
        };
        savedItem = await catalogRepository.create(dto);
      }

      onSaved(savedItem);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save catalog item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[90vh] overflow-y-auto pr-1" data-testid="catalog-item-dialog">
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" />
            <span>{isEditing ? 'Edit Catalog Item' : 'Add New Catalog Item'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update specifications and pricing for ${initialItem?.sku}`
              : 'Add a new spare part, lubricant, or standardized labor preset to the catalog.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            data-testid="catalog-dialog-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Item Type & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Type *
              </label>
              <select
                value={itemType}
                onChange={(e) => handleTypeChange(e.target.value as CatalogItemType)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                data-testid="catalog-form-type"
              >
                <option value="SPAREPART">Spare Part (Physical Inventory)</option>
                <option value="LUBRICANT">Lubricant / Oil / Fluid</option>
                <option value="LABOR_REMOVE_REASSEMBLE">Labor - Remove & Reassemble</option>
                <option value="LABOR_REPAIR">Labor - Repair / Painting / Tinkering</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                SKU / Code *
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. PRT-TOY-BMP-F"
                className="font-mono uppercase font-bold"
                data-testid="catalog-form-sku"
                required
              />
            </div>
          </div>

          {/* Name / Description */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Item Name / Description *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Front Bumper Cover Axio 161 (Primer Coated)"
              data-testid="catalog-form-name"
              required
            />
          </div>

          {/* Category & Vehicle Compatibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <input
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                data-testid="catalog-form-category"
                required
              />
              <datalist id="category-suggestions">
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle Compatibility
              </label>
              <Input
                value={vehicleCompatibility}
                onChange={(e) => setVehicleCompatibility(e.target.value)}
                placeholder="e.g. Toyota Premio / Allion NZT260"
                data-testid="catalog-form-compatibility"
              />
            </div>
          </div>

          {/* Barcode & UOM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Barcode / EAN (Optional)
              </label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8901234567890"
                className="font-mono"
                data-testid="catalog-form-barcode"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit of Measure (UOM) *
              </label>
              <Input
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                placeholder="pcs, liters, sets, hours..."
                data-testid="catalog-form-uom"
                required
              />
            </div>
          </div>

          {/* Prices & Internal Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div>
              <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                Selling Price (Rs.) *
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                value={sellingPriceRs}
                onChange={(e) => setSellingPriceRs(e.target.value)}
                className="font-mono font-bold text-slate-900"
                data-testid="catalog-form-selling-price"
                required
              />
            </div>

            {/* Buying Cost: STRICTLY GUARDED FOR OWNER & MANAGER */}
            <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
              {permissions.canViewCosts ? (
                <div className="bg-amber-100/60 p-2 rounded-md border border-amber-300">
                  <label className="flex items-center gap-1 font-bold text-amber-950 uppercase tracking-wider mb-1">
                    <Lock className="h-3 w-3 text-amber-700" />
                    Buying Cost (Rs.)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={buyingCostRs}
                    onChange={(e) => setBuyingCostRs(e.target.value)}
                    className="font-mono font-bold bg-white text-amber-900 border-amber-400"
                    data-testid="catalog-form-buying-cost"
                  />
                </div>
              ) : null}
            </RolePermissionGateWrapper>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Discount (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={defaultDiscountPct}
                onChange={(e) => setDefaultDiscountPct(e.target.value)}
                className="font-mono"
                data-testid="catalog-form-discount"
              />
            </div>
          </div>

          {/* Stock Tracking (only for physical parts & lubricants) */}
          {!isLabor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Stock Quantity
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="font-mono font-semibold"
                  data-testid="catalog-form-stock-qty"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Low Stock Alert Level
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={lowStockAlertLevel}
                  onChange={(e) => setLowStockAlertLevel(e.target.value)}
                  className="font-mono font-semibold"
                  data-testid="catalog-form-alert-level"
                />
              </div>
            </div>
          )}

          {/* Specification Document & Image Dropzone */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Part Diagram / Photo / Spec Sheet
            </label>
            <FileDropzoneDashed
              label="Drop part diagrams, collision reference images, or manufacturer specs"
              hint="PNG, JPG, WebP up to 10MB"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is-active-checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              data-testid="catalog-form-active"
            />
            <label
              htmlFor="is-active-checkbox"
              className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
            >
              Item is Active and selectable in Workshop Sheets & Counter POS
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              data-testid="catalog-form-submit"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
}
