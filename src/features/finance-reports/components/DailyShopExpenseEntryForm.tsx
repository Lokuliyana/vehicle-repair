import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Store,
  AlertCircle,
  PlusCircle,
  Receipt,
  FileCheck,
} from 'lucide-react';
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

export interface DailyShopExpenseEntryFormProps {
  onAddExpense?: (expense: {
    category: ExpenseCategory | string;
    amountRs: number;
    description: string;
    paidFrom?: ExpensePaidFrom;
    date?: string;
    receiptRef?: string;
    note?: string;
  }) => void | Promise<void>;
  onExpenseAdded?: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

export function DailyShopExpenseEntryForm({
  onAddExpense,
  onExpenseAdded,
  onCancel,
  isInline = false,
}: DailyShopExpenseEntryFormProps) {
  const { user, activeShift } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<ExpenseCategory>('CONSUMABLES_PAINT');
  const [description, setDescription] = useState<string>('');
  const [amountRs, setAmountRs] = useState<string>('');
  const [paidFrom, setPaidFrom] = useState<ExpensePaidFrom>('POS_DRAWER');
  const [receiptRef, setReceiptRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeShift) {
      setPaidFrom('POS_DRAWER');
    } else {
      setPaidFrom('MAIN_CASH');
    }
  }, [activeShift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date || !date.trim()) {
      setErrorMessage('Please select a valid expense date.');
      return;
    }

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
      if (onAddExpense) {
        await onAddExpense({
          category,
          amountRs: parsedAmount,
          description: description.trim(),
          paidFrom,
          date,
          receiptRef: receiptRef.trim() || undefined,
          note: description.trim(),
        });
      } else {
        const dto: CreateShopExpenseDto = {
          date,
          category,
          description: receiptRef.trim()
            ? `${description.trim()} (Receipt #${receiptRef.trim()})`
            : description.trim(),
          amountRs: parsedAmount,
          paidFrom,
          shiftId: paidFrom === 'POS_DRAWER' ? activeShift?.id : undefined,
          recordedBy: user?.name || 'Staff',
        };

        await financeRepository.createExpense(dto, user);
      }

      toast({
        title: 'Garage Expense Recorded',
        message: `Rs. ${parsedAmount.toLocaleString('en-LK', {
          minimumFractionDigits: 2,
        })} recorded under ${EXPENSE_CATEGORY_LABELS[category]}. Deducted from Net Shop Profit.`,
        type: 'success',
      });

      // Reset form fields
      setDescription('');
      setAmountRs('');
      setReceiptRef('');
      if (onExpenseAdded) {
        onExpenseAdded();
      }
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
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="daily-expense-form"
      className={
        isInline
          ? 'bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-5 space-y-4 text-xs'
          : 'space-y-4 text-xs'
      }
    >
      {/* Header if inline */}
      {isInline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Daily Garage Overhead & Expense Entry Register
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Log workshop rent, utilities, welding consumables, and sublet bills. Real-time deduction from Net Shop Profit.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold self-start sm:self-auto">
            <FileCheck className="w-3 h-3 text-emerald-600" />
            <span>Automatic Shift Drawer Sync</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2 animate-in fade-in"
          data-testid="expense-error-alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="expense-date"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Voucher date *
          </label>
          <Input
            id="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-9 text-xs font-sans"
            data-testid="expense-date-input"
          />
        </div>

        <div>
          <label
            htmlFor="expense-category"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Expense category *
          </label>
          <select
            id="expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-medium shadow-xs"
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

      {/* Description & Reference Number */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sm:col-span-2">
          <label
            htmlFor="expense-description"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Description *
          </label>
          <Input
            id="expense-description"
            type="text"
            placeholder="e.g. 3M Sandpaper, Morning tea for 8, CEB bill, Lathe skimming"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="h-9 text-xs"
            data-testid="expense-desc-input"
          />
        </div>

        <div>
          <label
            htmlFor="expense-receipt-ref"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Reference number
          </label>
          <Input
            id="expense-receipt-ref"
            type="text"
            placeholder="e.g. CEB-9942 / BILL-102"
            value={receiptRef}
            onChange={(e) => setReceiptRef(e.target.value)}
            className="h-9 text-xs font-sans"
            data-testid="expense-receipt-input"
          />
        </div>
      </div>

      {/* Amount (Rs.) & Payment Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label
            htmlFor="expense-amount"
            className="block text-xs font-medium text-slate-600 mb-1"
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
              className="h-9 pl-9 font-sans tabular-nums font-semibold text-xs text-slate-900"
              data-testid="expense-amount-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Payment source *
          </label>
          <div className="inline-flex p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl w-full">
            <button
              type="button"
              onClick={() => setPaidFrom('POS_DRAWER')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paidFrom === 'POS_DRAWER'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              data-testid="expense-paidfrom-pos"
            >
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>POS Cash Drawer</span>
            </button>

            <button
              type="button"
              onClick={() => setPaidFrom('MAIN_CASH')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paidFrom === 'MAIN_CASH'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              data-testid="expense-paidfrom-main"
            >
              <Wallet className="w-3.5 h-3.5 text-blue-600" />
              <span>Main Cash / Safe</span>
            </button>
          </div>
        </div>
      </div>

      {paidFrom === 'POS_DRAWER' && (
        <p className="text-[11px] text-slate-500 pt-1">
          <strong>Automatic Drawer Sync:</strong> Drawer cash-outs deduct live from the active register shift and link to the shift reconciliation journal.
        </p>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs h-8 px-3 rounded-lg"
            data-testid="expense-cancel-btn"
          >
            Cancel
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={isSubmitting}
          className="bg-[#F95700] hover:bg-[#E04E00] text-white font-semibold text-xs h-8 px-3.5 rounded-lg gap-1.5 shadow-xs cursor-pointer"
          data-testid="expense-submit-btn"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isSubmitting ? 'Saving...' : 'Save Voucher'}
        </Button>
      </div>
    </form>
  );
}
