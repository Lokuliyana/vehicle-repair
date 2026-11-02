import { useRef } from 'react';
import { Printer } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';
import { PosSaleTransaction } from '../types';
import { PosSaleReceipt } from '@/types';


export interface PosReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: PosSaleTransaction | PosSaleReceipt | null;
}

export function PosReceiptModal({
  open,
  onOpenChange,
  receipt,
}: PosReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md">
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-bold">
          <Printer className="w-5 h-5 text-blue-600" />
          80mm Thermal Receipt ({receipt.receiptNumber})
        </DialogTitle>
        <DialogDescription className="text-xs">
          Calibrated ESC/POS 80mm thermal receipt layout with zero cost leakage.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2 flex justify-center bg-slate-100 p-4 rounded-xl overflow-y-auto max-h-[65vh]">
        <ThermalReceiptPrint ref={receiptRef} receipt={receipt} />
      </div>

      <DialogFooter className="pt-2 flex justify-between sm:justify-between items-center w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="text-xs"
        >
          Close
        </Button>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
          data-testid="print-receipt-btn"
        >
          <Printer className="w-4 h-4" />
          Print 80mm ESC/POS
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
