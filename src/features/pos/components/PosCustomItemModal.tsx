import { useState, type FormEvent } from 'react';

import { PlusCircle } from 'lucide-react';
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

export interface PosCustomItemDto {
  description: string;
  category: string;
  unitSellingPriceRs: number;
  unitBuyingCostRs: number;
  qty: number;
}

export interface PosCustomItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: PosCustomItemDto) => void;
}

export function PosCustomItemModal({
  open,
  onOpenChange,
  onAddItem,
}: PosCustomItemModalProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'SPAREPART' | 'LUBRICANT' | 'QUICK_SERVICE'>('SPAREPART');
  const [unitSellingPriceRs, setUnitSellingPriceRs] = useState<number | ''>('');
  const [unitBuyingCostRs, setUnitBuyingCostRs] = useState<number | ''>('');
  const [qty, setQty] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {

    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Item description or part name is required.');
      return;
    }
    const sellingPrice = Number(unitSellingPriceRs);
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      setError('Selling price must be a valid positive amount.');
      return;
    }
    const buyingCost = Number(unitBuyingCostRs) || 0;
    if (buyingCost < 0) {
      setError('Buying cost cannot be negative.');
      return;
    }
    if (qty < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    onAddItem({
      description: description.trim(),
      category:
        category === 'QUICK_SERVICE'
          ? 'Quick Service'
          : category === 'LUBRICANT'
          ? 'Lubricants & Fluids'
          : 'Spare Parts',
      unitSellingPriceRs: sellingPrice,
      unitBuyingCostRs: buyingCost,
      qty,
    });

    // Reset form
    setDescription('');
    setCategory('SPAREPART');
    setUnitSellingPriceRs('');
    setUnitBuyingCostRs('');
    setQty(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md">
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          Add Custom Counter Item
        </DialogTitle>
        <DialogDescription>
          Quick entry for unlisted walk-in spare parts, emergency consumables, or ad-hoc quick services.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="pos-custom-item-form">
        {error && (
          <div
            className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
            data-testid="custom-item-error"
          >
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Item Description / Part Name *
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Ad-hoc Radiator Cap (0.9 Bar) / Quick Fuse Replace"
            className="text-xs h-9"
            data-testid="custom-item-desc-input"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="custom-item-category-select"
            >
              <option value="SPAREPART">Spare Part</option>
              <option value="LUBRICANT">Lubricant / Fluid</option>
              <option value="QUICK_SERVICE">Quick Service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity *
            </label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="text-xs h-9 text-center font-medium"
              data-testid="custom-item-qty-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Price (Rs.) *
            </label>
            <Input
              type="number"
              min={0}
              step="any"
              value={unitSellingPriceRs}
              onChange={(e) =>
                setUnitSellingPriceRs(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="0.00"
              className="text-xs h-9 font-semibold text-blue-900"
              data-testid="custom-item-price-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Buying Cost (Rs.) <span className="text-[10px] text-slate-400">(Internal)</span>
            </label>
            <Input
              type="number"
              min={0}
              step="any"
              value={unitBuyingCostRs}
              onChange={(e) =>
                setUnitBuyingCostRs(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="0.00 (optional)"
              className="text-xs h-9 text-slate-600"
              data-testid="custom-item-cost-input"
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white"
            data-testid="add-custom-item-btn"
          >
            Add to Active Cart
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
