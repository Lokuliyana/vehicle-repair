import React, { useState, useEffect } from 'react';
import { Layers, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CatalogItem } from '../types';
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

export interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CatalogItem | null;
  onSaved: (item: CatalogItem) => void;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: StockAdjustDialogProps) {
  const { permissions } = useAuth();
  const [adjustmentDelta, setAdjustmentDelta] = useState<string>('0');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && item) {
      setAdjustmentDelta('0');
      setAdjustmentType('ADD');
      setReason('');
      setError(null);
    }
  }, [open, item]);

  if (!item) return null;

  const currentStock = item.stockQty;
  const numDelta = Math.abs(parseInt(adjustmentDelta, 10) || 0);
  const signedDelta = adjustmentType === 'ADD' ? numDelta : -numDelta;
  const newCalculatedStock = Math.max(0, currentStock + signedDelta);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!permissions.canManageCatalog) {
      setError('You lack permission to adjust inventory stock.');
      return;
    }

    if (numDelta === 0) {
      setError('Please enter a non-zero adjustment quantity.');
      return;
    }

    if (adjustmentType === 'REMOVE' && numDelta > currentStock) {
      setError(
        `Cannot remove ${numDelta} units. Maximum available to deduct is ${currentStock}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await catalogRepository.adjustStock(
        item.id,
        signedDelta,
        reason.trim() || undefined
      );
      onSaved(updated);
      onOpenChange(false);
      setAdjustmentDelta('0');
      setReason('');
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust stock quantity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div data-testid="stock-adjust-dialog">
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-600" />
            <span>Stock Inventory Adjustment</span>
          </DialogTitle>
          <DialogDescription>
            Record incoming stock or write-offs for physical parts.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            data-testid="stock-adjust-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800">{item.sku}</span>
              <span className="text-slate-500 font-medium">{item.uom}</span>
            </div>
            <p className="font-semibold text-slate-900">{item.name}</p>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
              <span className="text-slate-600">Current Stock:</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {currentStock} {item.uom}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('ADD')}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-md font-bold text-xs border transition-colors cursor-pointer ${
                adjustmentType === 'ADD'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              data-testid="stock-adjust-type-add"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Stock In (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('REMOVE')}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-md font-bold text-xs border transition-colors cursor-pointer ${
                adjustmentType === 'REMOVE'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              data-testid="stock-adjust-type-remove"
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>Stock Out (-)</span>
            </button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity to {adjustmentType === 'ADD' ? 'Add' : 'Deduct'} *
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              value={adjustmentDelta}
              onChange={(e) => setAdjustmentDelta(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="font-mono text-base font-bold text-slate-900"
              data-testid="stock-adjust-qty-input"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Reference Note
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Supplier PO #4489 / Physical count audit"
              data-testid="stock-adjust-reason-input"
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 flex items-center justify-between text-xs">
            <span className="font-medium text-amber-900">Resulting Stock Level:</span>
            <span
              className="font-mono font-black text-amber-950 text-base"
              data-testid="stock-adjust-resulting-qty"
            >
              {newCalculatedStock} {item.uom}
            </span>
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
              data-testid="stock-adjust-submit-btn"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Stock Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
}
