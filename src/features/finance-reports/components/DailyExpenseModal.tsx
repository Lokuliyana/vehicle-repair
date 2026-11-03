import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { DailyShopExpenseEntryForm } from './DailyShopExpenseEntryForm';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
      <DialogClose onClick={() => onOpenChange(false)} />
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <PlusCircle className="w-5 h-5 text-amber-600" />
            Record Daily Shop Operating Expense
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Fast petty cash & shop overhead voucher entry with real-time gross profit deduction.
          </DialogDescription>
        </DialogHeader>

        <DailyShopExpenseEntryForm
          onCancel={() => onOpenChange(false)}
          onExpenseAdded={() => {
            if (onExpenseAdded) onExpenseAdded();
            onOpenChange(false);
          }}
        />
      </div>
    </Dialog>
  );
}
