import { useState, useEffect } from 'react';
import { PlusCircle, Wallet, Store, AlertCircle } from 'lucide-react';
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
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  ExpenseCategory,
  ExpensePaidFrom,
  CreateShopExpenseDto,
  EXPENSE_CATEGORY_LABELS,
} from '../types';
import { financeRepository } from '../repository/finance.repository.mock';

export interface DailyExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded?: () => void;
}

export function DailyExpenseModal({
  open,
  onOpenChange,
  onExpenseAdded,
}: DailyExpenseModalProps) {
  const { user, activeShift } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<ExpenseCategory>('CONSUMABLES_PAINT');
  const [description, setDescription] = useState<string>('');
  const [amountRs, setAmountRs] = useState<string>('');
  const [paidFrom, setPaidFrom] = useState<ExpensePaidFrom>('POS_DRAWER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('CONSUMABLES_PAINT');
      setDescription('');
      setAmountRs('');
      setPaidFrom(activeShift ? 'POS_DRAWER' : 'MAIN_CASH');
      setErrorMessage(null);
    }
  }, [open, activeShift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amountRs);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please enter an expense description or reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateShopExpenseDto = {
        date,
        category,
        description: description.trim(),
        amountRs: parsedAmount,
        paidFrom,
        shiftId: paidFrom === 'POS_DRAWER' ? activeShift?.id : undefined,
        recordedBy: user.name,
      };

      await financeRepository.createExpense(dto, user);

      toast({
        title: 'Shop Expense Recorded',
        message: `Rs. ${parsedAmount.toLocaleString('en-LK', {
          minimumFractionDigits: 2,
        })} recorded under ${EXPENSE_CATEGORY_LABELS[category]}.`,
        type: 'success',
      });

      if (onExpenseAdded) {
        onExpenseAdded();
      }
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create shop expense:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to record shop expense.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg">
      <DialogClose onClick={() => onOpenChange(false)} />
      <form onSubmit={handleSubmit} noValidate data-testid="daily-expense-form">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <PlusCircle className="w-5 h-5 text-amber-600" />
            Record Daily Shop Operating Expense
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Fast petty cash & shop overhead voucher entry with real-time gross profit deduction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-xs">
          {errorMessage && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2"
              data-testid="expense-error-alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Date & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="expense-date"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Date *
              </label>
              <Input
                id="expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-9 text-xs"
                data-testid="expense-date-input"
              />
            </div>

            <div>
              <label
                htmlFor="expense-category"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Expense Category *
              </label>
              <select
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                data-testid="expense-category-select"
              >
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {EXPENSE_CATEGORY_LABELS[catKey]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="expense-description"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Description / Voucher Details *
            </label>
            <Input
              id="expense-description"
              type="text"
              placeholder="e.g. 3M Sandpaper, Morning tea for 8, Sublet radiator weld"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-9 text-xs"
              data-testid="expense-desc-input"
            />
          </div>

          {/* Amount (Rs.) */}
          <div>
            <label
              htmlFor="expense-amount"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Amount (Rs.) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                Rs.
              </span>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountRs}
                onChange={(e) => setAmountRs(e.target.value)}
                required
                className="h-9 pl-9 font-mono font-bold text-xs"
                data-testid="expense-amount-input"
              />
            </div>
          </div>

          {/* Payment Source */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Source *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaidFrom('POS_DRAWER')}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2 ${
                  paidFrom === 'POS_DRAWER'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                data-testid="expense-paidfrom-pos"
              >
                <Store className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs">POS Cash Drawer</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {activeShift
                      ? `Active Shift: ${activeShift.id}`
                      : 'Petty cash cash-out'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaidFrom('MAIN_CASH')}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2 ${
                  paidFrom === 'MAIN_CASH'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-bold ring-1 ring-blue-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                data-testid="expense-paidfrom-main"
              >
                <Wallet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs">Main Cash / Safe</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Direct shop overhead / cheque
                  </div>
                </div>
              </button>
            </div>
            {paidFrom === 'POS_DRAWER' && (
              <p className="text-[11px] text-amber-800 mt-1.5 bg-amber-50 p-2 rounded border border-amber-200">
                ⚡ <strong>Automatic Reconciliation:</strong> This will record an immediate Cash-Out entry on the active POS shift drawer.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 flex justify-between sm:justify-between items-center w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs"
            data-testid="expense-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs"
            data-testid="expense-submit-btn"
          >
            {isSubmitting ? 'Recording...' : 'Record Expense Voucher'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
