import { useState, useEffect, useMemo } from 'react';
import {
  Vault,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  AlertTriangle,
  History,
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
import { Badge } from '@/components/ui/badge';
import { formatRs } from '@/utils/currency';
import { PosShift, PosShiftDrawerEntry } from '../types';
import { posShiftRepository } from '../repository/pos-shift.repository.mock';
import { MOCK_USERS_BY_ROLE } from '@/types/auth';
import { cn } from '@/utils/cn';

export interface PosShiftDrawerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeShift: PosShift | null;
  onShiftUpdated?: () => void;
}

export function PosShiftDrawerModal({
  open,
  onOpenChange,
  activeShift,
  onShiftUpdated,
}: PosShiftDrawerModalProps) {
  const [tab, setTab] = useState<'SUMMARY' | 'CASH_IN' | 'CASH_OUT' | 'CLOSE'>('SUMMARY');

  // Open shift state (if closed)
  const [cashierId, setCashierId] = useState('user-cashier');
  const [openingFloat, setOpeningFloat] = useState<number | ''>(15000);

  // Cash In state
  const [cashInAmount, setCashInAmount] = useState<number | ''>('');
  const [cashInReason, setCashInReason] = useState('');

  // Cash Out state
  const [cashOutAmount, setCashOutAmount] = useState<number | ''>('');
  const [cashOutReason, setCashOutReason] = useState('');

  // Close shift state
  const [countedActualCash, setCountedActualCash] = useState<number | ''>('');

  // Drawer entries log
  const [entries, setEntries] = useState<PosShiftDrawerEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isOpen = activeShift?.status === 'OPEN';

  // Load drawer movements log
  useEffect(() => {
    if (open && activeShift) {
      setLoadingEntries(true);
      posShiftRepository
        .getShiftDrawerEntries(activeShift.id)
        .then((res) => setEntries(res))
        .finally(() => setLoadingEntries(false));
      setError(null);
      setSuccessMsg(null);
      if (activeShift.status === 'OPEN') {
        setCountedActualCash(activeShift.expectedDrawerCashRs);
      }
    }
  }, [open, activeShift]);

  // Live close variance
  const countedVal = Number(countedActualCash) || 0;
  const expectedVal = activeShift?.expectedDrawerCashRs || 0;
  const variance = useMemo(() => {
    return countedVal - expectedVal;
  }, [countedVal, expectedVal]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const floatAmount = Number(openingFloat);
    if (isNaN(floatAmount) || floatAmount < 0) {
      setError('Opening cash float must be zero or a positive amount.');
      return;
    }

    const cashierUser = Object.values(MOCK_USERS_BY_ROLE).find((u) => u.id === cashierId);
    const cashierName = cashierUser ? cashierUser.name : 'Counter Cashier';

    try {
      await posShiftRepository.openShift(cashierId, cashierName, floatAmount);
      setSuccessMsg(`Shift opened successfully with float of ${formatRs(floatAmount)}.`);
      onShiftUpdated?.();
      setTab('SUMMARY');
    } catch (err: any) {
      setError(err?.message || 'Failed to open shift.');
    }
  };

  const handleCashIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!activeShift) return;

    const amt = Number(cashInAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Cash in amount must be greater than zero.');
      return;
    }
    if (!cashInReason.trim()) {
      setError('Please provide a reason for adding cash to the drawer.');
      return;
    }

    try {
      await posShiftRepository.recordCashIn(activeShift.id, amt, cashInReason);
      setSuccessMsg(`Recorded Cash In of ${formatRs(amt)}.`);
      setCashInAmount('');
      setCashInReason('');
      const updatedEntries = await posShiftRepository.getShiftDrawerEntries(activeShift.id);
      setEntries(updatedEntries);
      onShiftUpdated?.();
      setTab('SUMMARY');
    } catch (err: any) {
      setError(err?.message || 'Failed to record cash in.');
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!activeShift) return;

    const amt = Number(cashOutAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Cash out amount must be greater than zero.');
      return;
    }
    if (!cashOutReason.trim()) {
      setError('Please specify reason / expense category (e.g. Tea allowance, consumables).');
      return;
    }

    try {
      await posShiftRepository.recordCashOut(activeShift.id, amt, cashOutReason);
      setSuccessMsg(`Recorded Cash Out of ${formatRs(amt)}.`);
      setCashOutAmount('');
      setCashOutReason('');
      const updatedEntries = await posShiftRepository.getShiftDrawerEntries(activeShift.id);
      setEntries(updatedEntries);
      onShiftUpdated?.();
      setTab('SUMMARY');
    } catch (err: any) {
      setError(err?.message || 'Failed to record cash out.');
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!activeShift) return;

    if (countedActualCash === '' || isNaN(countedVal) || countedVal < 0) {
      setError('Please enter the counted actual drawer cash.');
      return;
    }

    try {
      await posShiftRepository.closeShift(activeShift.id, countedVal);
      setSuccessMsg(
        `Shift closed successfully. Variance: ${
          variance === 0
            ? 'Balanced'
            : variance > 0
            ? `+${formatRs(variance)} Over`
            : `-${formatRs(Math.abs(variance))} Short`
        }.`
      );
      onShiftUpdated?.();
      setTab('SUMMARY');
    } catch (err: any) {
      setError(err?.message || 'Failed to close shift.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <Vault className="w-5 h-5 text-indigo-600" />
            POS Shift Drawer & Cash Reconciliation
          </DialogTitle>
          {activeShift && (
            <Badge
              variant={isOpen ? 'success' : 'outline'}
              className="text-[11px] font-bold"
              data-testid="drawer-modal-shift-status"
            >
              {activeShift.id}: {activeShift.status}
            </Badge>
          )}
        </div>
        <DialogDescription className="text-xs">
          Manage opening float, cash drops/top-ups, petty shop expenses, and shift-end cash count.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4" data-testid="pos-shift-drawer-modal-body">
        {error && (
          <div
            className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5"
            data-testid="shift-modal-error"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div
            className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
            data-testid="shift-modal-success"
          >
            {successMsg}
          </div>
        )}

        {/* If shift is CLOSED: Offer to open new shift */}
        {!isOpen ? (
          <form onSubmit={handleOpenShift} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs pb-1 border-b border-slate-200">
              <Lock className="w-4 h-4 text-amber-600" />
              Register is Closed. Open New Shift to Begin Counter Billing.
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cashier Name / Operator
                </label>
                <select
                  value={cashierId}
                  onChange={(e) => setCashierId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="open-shift-cashier-select"
                >
                  <option value="user-cashier">Kamal Fonseka (CASHIER)</option>
                  <option value="user-owner">Jagath Perera (OWNER)</option>
                  <option value="user-manager">Bandara Ratnayake (MANAGER)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Cash Float (Rs.) *
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={openingFloat}
                  onChange={(e) =>
                    setOpeningFloat(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  className="text-xs h-9 font-bold text-emerald-700 bg-white"
                  data-testid="open-shift-float-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-2"
              data-testid="open-shift-submit-btn"
            >
              <Unlock className="w-4 h-4 mr-1.5" />
              Open Drawer & Start Shift
            </Button>
          </form>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setTab('SUMMARY')}
                className={cn(
                  'px-3 py-2 font-bold border-b-2 transition-colors cursor-pointer',
                  tab === 'SUMMARY'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
                data-testid="shift-tab-summary"
              >
                Drawer Summary
              </button>
              <button
                type="button"
                onClick={() => setTab('CASH_IN')}
                className={cn(
                  'px-3 py-2 font-bold border-b-2 transition-colors cursor-pointer',
                  tab === 'CASH_IN'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
                data-testid="shift-tab-cash-in"
              >
                + Cash In (Float)
              </button>
              <button
                type="button"
                onClick={() => setTab('CASH_OUT')}
                className={cn(
                  'px-3 py-2 font-bold border-b-2 transition-colors cursor-pointer',
                  tab === 'CASH_OUT'
                    ? 'border-rose-600 text-rose-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
                data-testid="shift-tab-cash-out"
              >
                - Cash Out (Expenses)
              </button>
              <button
                type="button"
                onClick={() => setTab('CLOSE')}
                className={cn(
                  'px-3 py-2 font-bold border-b-2 transition-colors cursor-pointer',
                  tab === 'CLOSE'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
                data-testid="shift-tab-close"
              >
                Close Shift
              </button>
            </div>

            {/* TAB: SUMMARY */}
            {tab === 'SUMMARY' && activeShift && (
              <div className="space-y-4">
                {/* Expected Drawer Cash Banner */}
                <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      System Expected Drawer Cash
                    </span>
                    <span
                      className="text-2xl font-black text-emerald-400 tracking-tight"
                      data-testid="expected-drawer-cash-value"
                    >
                      {formatRs(activeShift.expectedDrawerCashRs)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      (Opening Float + Cash Sales + Cash In - Cash Out)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Cashier</span>
                    <span className="font-semibold text-xs text-white">
                      {activeShift.cashierName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Since {activeShift.openedAt}
                    </span>
                  </div>
                </div>

                {/* 6-box Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Opening Float</span>
                    <span className="font-bold text-slate-900 text-sm" data-testid="metric-opening-float">
                      {formatRs(activeShift.openingFloatRs)}
                    </span>
                  </div>

                  <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[11px] text-emerald-800 block">Cash Sales</span>
                    <span className="font-bold text-emerald-700 text-sm" data-testid="metric-cash-sales">
                      {formatRs(activeShift.totalCashSalesRs)}
                    </span>
                  </div>

                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                    <span className="text-[11px] text-blue-800 block">Card Sales</span>
                    <span className="font-bold text-blue-700 text-sm" data-testid="metric-card-sales">
                      {formatRs(activeShift.totalCardSalesRs)}
                    </span>
                  </div>

                  <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-200">
                    <span className="text-[11px] text-indigo-800 block">Bank Transfers</span>
                    <span className="font-bold text-indigo-700 text-sm" data-testid="metric-transfer-sales">
                      {formatRs(activeShift.totalBankTransferSalesRs)}
                    </span>
                  </div>

                  <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[11px] text-emerald-800 block">+ Cash In</span>
                    <span className="font-bold text-emerald-700 text-sm" data-testid="metric-cash-in">
                      {formatRs(activeShift.cashInRs)}
                    </span>
                  </div>

                  <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-200">
                    <span className="text-[11px] text-rose-800 block">- Cash Out</span>
                    <span className="font-bold text-rose-700 text-sm" data-testid="metric-cash-out">
                      {formatRs(activeShift.cashOutRs)}
                    </span>
                  </div>
                </div>

                {/* Recent Drawer Transactions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Drawer Cash Movements ({entries.length})
                  </div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
                    {entries.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 italic">
                        {loadingEntries ? 'Loading movements...' : 'No cash-in or cash-out entries for this shift.'}
                      </div>
                    ) : (
                      entries.map((entry) => (
                        <div key={entry.id} className="p-2 flex justify-between items-center hover:bg-slate-50">
                          <div>
                            <span
                              className={cn(
                                'font-bold mr-2 text-[11px] px-1.5 py-0.5 rounded',
                                entry.type === 'CASH_IN'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              )}
                            >
                              {entry.type === 'CASH_IN' ? 'IN' : 'OUT'}
                            </span>
                            <span className="text-slate-800 font-medium">{entry.reason}</span>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                'font-bold',
                                entry.type === 'CASH_IN' ? 'text-emerald-700' : 'text-rose-700'
                              )}
                            >
                              {entry.type === 'CASH_IN' ? '+' : '-'} {formatRs(entry.amountRs)}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {entry.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CASH IN */}
            {tab === 'CASH_IN' && (
              <form onSubmit={handleCashIn} className="space-y-3" data-testid="cash-in-form">
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-bold">Add Cash into Drawer:</span> Use for top-ups, extra change, or cash floats returned from field errands.
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount to Add (Rs.) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    step="any"
                    value={cashInAmount}
                    onChange={(e) =>
                      setCashInAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="text-xs h-9 font-bold text-emerald-700"
                    data-testid="cash-in-amount-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason / Source *
                  </label>
                  <Input
                    value={cashInReason}
                    onChange={(e) => setCashInReason(e.target.value)}
                    placeholder="e.g. Additional float top-up, Petty cash reimbursement"
                    className="text-xs h-9"
                    data-testid="cash-in-reason-input"
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold w-full"
                  data-testid="cash-in-submit-btn"
                >
                  <ArrowDownLeft className="w-4 h-4 mr-1.5" />
                  Deposit Cash & Update Drawer
                </Button>
              </form>
            )}

            {/* TAB: CASH OUT */}
            {tab === 'CASH_OUT' && (
              <form onSubmit={handleCashOut} className="space-y-3" data-testid="cash-out-form">
                <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 text-xs text-rose-900">
                  <span className="font-bold">Payout Cash from Drawer:</span> Use for tea allowance, urgent workshop consumables, minor sublets, or courier fees.
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount to Payout (Rs.) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    step="any"
                    value={cashOutAmount}
                    onChange={(e) =>
                      setCashOutAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="text-xs h-9 font-bold text-rose-700"
                    data-testid="cash-out-amount-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expense Reason / Voucher Note *
                  </label>
                  <Input
                    value={cashOutReason}
                    onChange={(e) => setCashOutReason(e.target.value)}
                    placeholder="e.g. Staff tea allowance, Sandpaper & masking tape, Minor lathe sublet"
                    className="text-xs h-9"
                    data-testid="cash-out-reason-input"
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold w-full"
                  data-testid="cash-out-submit-btn"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1.5" />
                  Disburse Cash & Update Drawer
                </Button>
              </form>
            )}

            {/* TAB: CLOSE SHIFT */}
            {tab === 'CLOSE' && activeShift && (
              <form onSubmit={handleCloseShift} className="space-y-4" data-testid="close-shift-form">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <span className="font-bold">Shift End Reconciliation:</span> Count all physical cash in the drawer and enter below to compute drawer variance.
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">System Expected Cash</span>
                    <span className="text-lg font-black text-slate-900" data-testid="close-expected-cash">
                      {formatRs(expectedVal)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Counted Actual Cash (Rs.) *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      value={countedActualCash}
                      onChange={(e) =>
                        setCountedActualCash(
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      className="text-base font-black text-slate-900 h-10 bg-white"
                      data-testid="close-counted-cash-input"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Variance Badge */}
                <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold">
                  <span>Reconciliation Status:</span>
                  <span
                    className={cn(
                      'text-sm font-black px-2.5 py-1 rounded-md',
                      variance === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : variance > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    )}
                    data-testid="shift-variance-badge"
                  >
                    {variance === 0
                      ? 'Balanced (Rs. 0)'
                      : variance > 0
                      ? `Cash Over (+${formatRs(variance)})`
                      : `Cash Short (-${formatRs(Math.abs(variance))})`}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs"
                  data-testid="confirm-close-shift-btn"
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  Close Shift & Lock Register
                </Button>
              </form>
            )}
          </>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="text-xs"
        >
          Close Drawer Modal
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
