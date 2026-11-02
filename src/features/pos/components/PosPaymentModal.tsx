import { useState, useEffect, useMemo, type FormEvent } from 'react';

import {
  Banknote,
  CreditCard,
  Building2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from 'lucide-react';
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
import { formatRs } from '@/utils/currency';
import { PaymentMethod, SplitPaymentDetails } from '../types';
import { cn } from '@/utils/cn';

export interface PosPaymentResult {
  paymentMethod: PaymentMethod;
  amountTenderedRs: number;
  changeGivenRs: number;
  splitDetails?: SplitPaymentDetails;
}

export interface PosPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  netSalesRs: number;
  customerNote: string;
  isShiftOpen: boolean;
  onCompletePayment: (result: PosPaymentResult) => void;
}

export function PosPaymentModal({
  open,
  onOpenChange,
  netSalesRs,
  customerNote,
  isShiftOpen,
  onCompletePayment,
}: PosPaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');

  // Cash state
  const [cashTendered, setCashTendered] = useState<number | ''>(netSalesRs);

  // Card & Transfer references
  const [cardRef, setCardRef] = useState('');
  const [transferRef, setTransferRef] = useState('');

  // Split payment state
  const [splitCash, setSplitCash] = useState<number | ''>('');
  const [splitCard, setSplitCard] = useState<number | ''>('');
  const [splitTransfer, setSplitTransfer] = useState<number | ''>('');
  const [splitCashTendered, setSplitCashTendered] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);

  // Reset or preset state when opened
  useEffect(() => {
    if (open) {
      setMethod('CASH');
      setCashTendered(netSalesRs);
      setCardRef('');
      setTransferRef('');
      setSplitCash('');
      setSplitCard('');
      setSplitTransfer('');
      setSplitCashTendered('');
      setError(null);
    }
  }, [open, netSalesRs]);

  // Real-time calculations
  const cashTenderedVal = Number(cashTendered) || 0;
  const cashChange = useMemo(() => {
    return Math.max(0, cashTenderedVal - netSalesRs);
  }, [cashTenderedVal, netSalesRs]);

  const isCashInsufficient = method === 'CASH' && cashTenderedVal < netSalesRs;

  // Split calculations
  const splitCashVal = Number(splitCash) || 0;
  const splitCardVal = Number(splitCard) || 0;
  const splitTransferVal = Number(splitTransfer) || 0;
  const splitTotal = splitCashVal + splitCardVal + splitTransferVal;
  const splitRemaining = netSalesRs - splitTotal;
  const splitCashTenderedVal = Number(splitCashTendered) || splitCashVal;
  const splitCashChange = Math.max(0, splitCashTenderedVal - splitCashVal);

  const handleQuickAdd = (addition: number) => {
    setCashTendered((prev) => (Number(prev) || 0) + addition);
  };

  const handleExactCash = () => {
    setCashTendered(netSalesRs);
  };

  const handleComplete = (e: FormEvent) => {

    e.preventDefault();
    setError(null);

    if (!isShiftOpen) {
      setError('Cannot complete POS transaction: Active shift is closed. Open shift first.');
      return;
    }

    if (netSalesRs <= 0) {
      setError('Cart net payable must be greater than zero.');
      return;
    }

    if (method === 'CASH') {
      if (cashTenderedVal < netSalesRs) {
        setError(
          `Insufficient cash tendered. Short by ${formatRs(netSalesRs - cashTenderedVal)}.`
        );
        return;
      }
      onCompletePayment({
        paymentMethod: 'CASH',
        amountTenderedRs: cashTenderedVal,
        changeGivenRs: cashChange,
      });
      onOpenChange(false);
      return;
    }

    if (method === 'CARD') {
      onCompletePayment({
        paymentMethod: 'CARD',
        amountTenderedRs: netSalesRs,
        changeGivenRs: 0,
      });
      onOpenChange(false);
      return;
    }

    if (method === 'BANK_TRANSFER') {
      onCompletePayment({
        paymentMethod: 'BANK_TRANSFER',
        amountTenderedRs: netSalesRs,
        changeGivenRs: 0,
      });
      onOpenChange(false);
      return;
    }

    if (method === 'SPLIT') {
      if (Math.abs(splitRemaining) > 0.01) {
        setError(
          `Split payment amounts must exactly equal Net Payable (${formatRs(
            netSalesRs
          )}). Currently allocated: ${formatRs(splitTotal)}.`
        );
        return;
      }
      if (splitCashVal > 0 && splitCashTenderedVal < splitCashVal) {
        setError(
          `Cash tendered in split is insufficient. Short by ${formatRs(
            splitCashVal - splitCashTenderedVal
          )}.`
        );
        return;
      }

      onCompletePayment({
        paymentMethod: 'SPLIT',
        amountTenderedRs:
          (splitCashVal > 0 ? splitCashTenderedVal : 0) + splitCardVal + splitTransferVal,
        changeGivenRs: splitCashChange,
        splitDetails: {
          cashAmountRs: splitCashVal,
          cardAmountRs: splitCardVal,
          bankTransferAmountRs: splitTransferVal,
          cashTenderedRs: splitCashTenderedVal,
          cashChangeRs: splitCashChange,
          cardReference: cardRef.trim() || undefined,
          transferReference: transferRef.trim() || undefined,
        },
      });
      onOpenChange(false);
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg">
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-black">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Settle Counter Sale & Payment Tender
        </DialogTitle>
        <DialogDescription className="text-xs">
          Walk-in Note: <span className="font-semibold text-slate-800">{customerNote}</span>
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleComplete} className="space-y-4" data-testid="pos-payment-modal-form">
        {!isShiftOpen && (
          <div
            className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2"
            data-testid="shift-closed-warning"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Shift register is currently CLOSED. Please open drawer to complete sales.</span>
          </div>
        )}

        {error && (
          <div
            className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
            data-testid="payment-error-alert"
          >
            {error}
          </div>
        )}

        {/* Net Total Display Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Net Amount Payable
            </div>
            <div className="text-2xl font-black text-amber-400 tracking-tight" data-testid="pos-modal-net-payable">
              {formatRs(netSalesRs)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Method</span>
            <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 inline-block mt-0.5">
              {method}
            </span>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Payment Tender Method
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setMethod('CASH')}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                method === 'CASH'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              )}
              data-testid="payment-method-cash-tab"
            >
              <Banknote className="w-4 h-4 mb-1 text-emerald-600" />
              Cash
            </button>

            <button
              type="button"
              onClick={() => setMethod('CARD')}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                method === 'CARD'
                  ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              )}
              data-testid="payment-method-card-tab"
            >
              <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
              Card
            </button>

            <button
              type="button"
              onClick={() => setMethod('BANK_TRANSFER')}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                method === 'BANK_TRANSFER'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              )}
              data-testid="payment-method-transfer-tab"
            >
              <Building2 className="w-4 h-4 mb-1 text-indigo-600" />
              Transfer
            </button>

            <button
              type="button"
              onClick={() => setMethod('SPLIT')}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                method === 'SPLIT'
                  ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              )}
              data-testid="payment-method-split-tab"
            >
              <Layers className="w-4 h-4 mb-1 text-amber-600" />
              Split
            </button>
          </div>
        </div>

        {/* CASH TENDER VIEW */}
        {method === 'CASH' && (
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Cash Amount Tendered (Rs.) *
                </label>
                {isCashInsufficient && (
                  <span className="text-[11px] font-semibold text-rose-600">
                    Short by {formatRs(netSalesRs - cashTenderedVal)}
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="any"
                min={0}
                value={cashTendered}
                onChange={(e) =>
                  setCashTendered(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                className="text-base font-black text-slate-900 h-10 bg-white"
                data-testid="cash-tendered-input"
                autoFocus
              />
            </div>

            {/* Quick-Cash Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
                Quick Denominations
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExactCash}
                  className="text-xs h-8 font-bold border-slate-300"
                  data-testid="quick-cash-exact"
                >
                  Exact ({formatRs(netSalesRs)})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(500)}
                  className="text-xs h-8 border-slate-300 font-semibold"
                  data-testid="quick-cash-500"
                >
                  + Rs. 500
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(1000)}
                  className="text-xs h-8 border-slate-300 font-semibold"
                  data-testid="quick-cash-1000"
                >
                  + Rs. 1,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(5000)}
                  className="text-xs h-8 border-slate-300 font-semibold"
                  data-testid="quick-cash-5000"
                >
                  + Rs. 5,000
                </Button>
              </div>
            </div>

            {/* Change Due Display */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">Change Due to Customer:</span>
              <span
                className={cn(
                  'text-base font-black',
                  cashChange > 0 ? 'text-emerald-600' : 'text-slate-600'
                )}
                data-testid="pos-change-due"
              >
                {formatRs(cashChange)}
              </span>
            </div>
          </div>
        )}

        {/* CARD VIEW */}
        {method === 'CARD' && (
          <div className="space-y-3 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
            <div className="text-xs text-blue-900 font-medium">
              POS Card swipe/tap terminal payment for full amount of{' '}
              <strong className="font-bold">{formatRs(netSalesRs)}</strong>.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Card Approval / Trace Number (Optional)
              </label>
              <Input
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                placeholder="e.g. AUTH-889102 / Last 4 Digits"
                className="text-xs h-9 bg-white"
                data-testid="card-reference-input"
              />
            </div>
          </div>
        )}

        {/* BANK TRANSFER VIEW */}
        {method === 'BANK_TRANSFER' && (
          <div className="space-y-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <div className="text-xs text-indigo-900 font-medium">
              Direct Counter Bank Transfer (CEFT / QR / Online Banking) for{' '}
              <strong className="font-bold">{formatRs(netSalesRs)}</strong>.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Ref / Slip Number (Optional)
              </label>
              <Input
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                placeholder="e.g. TXN-COMM-2026-90"
                className="text-xs h-9 bg-white"
                data-testid="transfer-reference-input"
              />
            </div>
          </div>
        )}

        {/* SPLIT PAYMENT VIEW */}
        {method === 'SPLIT' && (
          <div className="space-y-3 bg-amber-50/40 p-3.5 rounded-xl border border-amber-200">
            <div className="flex justify-between items-center text-xs pb-1 border-b border-amber-200">
              <span className="font-bold text-slate-800">Split Breakdown:</span>
              <span
                className={cn(
                  'font-bold',
                  splitRemaining === 0
                    ? 'text-emerald-700'
                    : 'text-amber-800'
                )}
                data-testid="split-remaining-indicator"
              >
                {splitRemaining === 0
                  ? 'Balanced'
                  : `Remaining to allocate: ${formatRs(splitRemaining)}`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Cash (Rs.)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={splitCash}
                  onChange={(e) =>
                    setSplitCash(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  className="text-xs h-8 bg-white"
                  data-testid="split-cash-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Card (Rs.)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={splitCard}
                  onChange={(e) =>
                    setSplitCard(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  className="text-xs h-8 bg-white"
                  data-testid="split-card-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Transfer (Rs.)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={splitTransfer}
                  onChange={(e) =>
                    setSplitTransfer(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  className="text-xs h-8 bg-white"
                  data-testid="split-transfer-input"
                />
              </div>
            </div>

            {splitCashVal > 0 && (
              <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block">
                    Cash Tendered for Cash Part:
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={splitCashTendered}
                    onChange={(e) =>
                      setSplitCashTendered(
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    placeholder={String(splitCashVal)}
                    className="text-xs h-7 w-32 bg-white mt-0.5"
                    data-testid="split-cash-tendered-input"
                  />
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Cash Change:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatRs(splitCashChange)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

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
            disabled={!isShiftOpen || (method === 'CASH' && isCashInsufficient)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            data-testid="complete-pos-payment-btn"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Sale & Print 80mm
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
