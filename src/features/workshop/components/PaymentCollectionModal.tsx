import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  WorkshopJobSheet,
  WorkshopPaymentRecord,
  WorkshopPaymentType,
  WorkshopPaymentMethod,
} from '@/types';
import { formatRs } from '@/utils/currency';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import { WorkshopPaymentThermalReceipt } from '@/components/print/WorkshopPaymentThermalReceipt';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';

export interface PaymentCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: WorkshopJobSheet;
  onPaymentSuccess?: (
    updatedJob: WorkshopJobSheet,
    paymentRecord: WorkshopPaymentRecord
  ) => void;
}

export function PaymentCollectionModal({
  isOpen,
  onClose,
  job,
  onPaymentSuccess,
}: PaymentCollectionModalProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();

  const isInsurance = job.financials.insuranceApprovedRs > 0;

  // Calculate existing insurance settlement amount
  const existingInsurancePaid = useMemo(() => {
    return (job.payments || [])
      .filter((p) => p.paymentType === 'INSURANCE_SETTLEMENT')
      .reduce((sum, p) => sum + (Number(p.amountRs) || 0), 0);
  }, [job.payments]);

  const pendingInsurance = useMemo(() => {
    return Math.max(0, job.financials.insuranceApprovedRs - existingInsurancePaid);
  }, [job.financials.insuranceApprovedRs, existingInsurancePaid]);

  // Determine initial payment type
  const initialType: WorkshopPaymentType = useMemo(() => {
    if (isInsurance) {
      if (job.financials.balanceDueRs > 0) return 'CUSTOMER_EXCESS';
      if (pendingInsurance > 0) return 'INSURANCE_SETTLEMENT';
    }
    return job.docStage === 'INVOICE' ? 'FULL_PAYMENT' : 'ADVANCE';
  }, [isInsurance, job.financials.balanceDueRs, pendingInsurance, job.docStage]);

  // Form State
  const [paymentType, setPaymentType] = useState<WorkshopPaymentType>(initialType);
  const [paymentMethod, setPaymentMethod] = useState<WorkshopPaymentMethod>('CASH');
  const [amountInput, setAmountInput] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success State for Thermal Receipt Printing
  const [completedPayment, setCompletedPayment] =
    useState<WorkshopPaymentRecord | null>(null);
  const [latestJobState, setLatestJobState] = useState<WorkshopJobSheet>(job);
  const [isPrintingThermal, setIsPrintingThermal] = useState(false);

  // Synchronize state whenever modal opens or job changes
  React.useEffect(() => {
    if (isOpen) {
      setPaymentType(initialType);
      setPaymentMethod('CASH');
      setAmountInput('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReferenceNumber('');
      setNotes('');
      setValidationError(null);
      setCompletedPayment(null);
      setLatestJobState(job);
      setIsPrintingThermal(false);
    }
  }, [isOpen, job.id, initialType]);

  // Maximum allowed based on selected payment type
  const maxAllowedAmount = useMemo(() => {
    if (paymentType === 'INSURANCE_SETTLEMENT') {
      return pendingInsurance;
    }
    return Math.max(0, job.financials.balanceDueRs);
  }, [paymentType, pendingInsurance, job.financials.balanceDueRs]);

  const handleTypeChange = (type: WorkshopPaymentType) => {
    setPaymentType(type);
    setValidationError(null);
  };

  const handleFillMax = () => {
    setAmountInput(String(maxAllowedAmount));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
      setValidationError('Payment amount must be greater than Rs. 0.00');
      return;
    }

    if (amount > maxAllowedAmount) {
      setValidationError(
        `Payment amount (${formatRs(amount)}) cannot exceed pending balance of ${formatRs(
          maxAllowedAmount
        )}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await workshopJobRepository.recordPayment(job.id, {
        amountRs: amount,
        paymentType,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        date: paymentDate,
        recordedBy: user?.name || role,
      });

      const newRecord = updated.payments?.[updated.payments.length - 1];
      if (newRecord) {
        setCompletedPayment(newRecord);
      }
      setLatestJobState(updated);

      toast({
        title: 'Payment Recorded',
        message: `Successfully collected ${formatRs(amount)} via ${paymentMethod}.`,
        type: 'success',
      });

      if (onPaymentSuccess && newRecord) {
        onPaymentSuccess(updated, newRecord);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not record payment';
      setValidationError(errorMsg);
      toast({
        title: 'Payment Failed',
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintThermal = () => {
    window.print();
  };

  const handleResetAndClose = () => {
    setCompletedPayment(null);
    setAmountInput('');
    setReferenceNumber('');
    setNotes('');
    setValidationError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-w-none"
        data-testid="payment-collection-modal"
      >
        <DialogHeader className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Workshop Payment Collection
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Job: <span className="font-bold text-slate-700">{job.jobNumber}</span> | Vehicle:{' '}
              <span className="font-bold text-slate-700">{job.header.vehicleNumber || 'N/A'}</span>
            </DialogDescription>
          </div>
          <DialogClose onClick={handleResetAndClose} />
        </DialogHeader>

        {completedPayment ? (
          /* Post-Payment Success View with Thermal Receipt Action */
          <div className="p-6 space-y-6 print:p-0" data-testid="payment-success-view">
            <div className="no-print space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Payment Successfully Collected!
                </h3>
                <p className="text-xs text-slate-600">
                  Receipt Number:{' '}
                  <span className="font-mono font-bold text-slate-900" data-testid="completed-receipt-number">
                    {completedPayment.receiptNumber}
                  </span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Collected:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatRs(completedPayment.amountRs)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Category:</span>
                  <span className="font-semibold capitalize">
                    {completedPayment.paymentType.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Method:</span>
                  <span className="font-semibold">{completedPayment.paymentMethod}</span>
                </div>
                {completedPayment.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Reference / Cheque #:</span>
                    <span className="font-mono">{completedPayment.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span className="text-slate-800">
                    {completedPayment.paymentType === 'INSURANCE_SETTLEMENT'
                      ? 'Remaining Insurance Balance:'
                      : 'Remaining Balance Due:'}
                  </span>
                  <span className="text-amber-950 font-black" data-testid="remaining-balance-due">
                    {formatRs(completedPayment.balanceAfterRs)}
                  </span>
                </div>
              </div>

              {/* Print View Preview Toggle & Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPrintingThermal((prev) => !prev)}
                  className="text-xs font-semibold gap-1.5 h-9 text-slate-700"
                  data-testid="toggle-thermal-preview-btn"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>{isPrintingThermal ? 'Hide 80mm Preview' : 'Show 80mm Preview'}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handlePrintThermal}
                    className="text-xs font-bold gap-1.5 h-9 bg-slate-900 hover:bg-slate-800 text-white"
                    data-testid="print-thermal-receipt-btn"
                  >
                    <Printer className="w-4 h-4 text-slate-200" />
                    <span>Print 80mm Receipt</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetAndClose}
                    className="text-xs font-semibold h-9"
                    data-testid="payment-success-close-btn"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>

            {/* 80mm Thermal Receipt Container - Shown when preview toggle ON or during print */}
            <div
              className={cn(
                'justify-center',
                isPrintingThermal
                  ? 'flex border border-slate-300 rounded-lg p-3 bg-slate-100 max-h-96 overflow-y-auto'
                  : 'hidden',
                'print:flex print:border-none print:p-0 print:m-0 print:bg-transparent print:max-h-none print:overflow-visible'
              )}
            >
              <WorkshopPaymentThermalReceipt
                jobSheet={latestJobState}
                payment={completedPayment}
              />
            </div>
          </div>
        ) : (
          /* Payment Collection Form */
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
            {/* Account Financial Status Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Grand Total
                </span>
                <span className="font-bold text-slate-900">
                  {formatRs(job.financials.grandTotalSalesRs)}
                </span>
              </div>
              {isInsurance ? (
                <>
                  <div>
                    <span className="text-blue-700 block text-[10px] uppercase font-bold">
                      Insurance Approved
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatRs(job.financials.insuranceApprovedRs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Customer Excess
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRs(job.financials.customerPayableRs)}
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Total Advance Paid
                  </span>
                  <span className="font-bold text-emerald-800">
                    {formatRs(job.financials.advancePaidRs)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-amber-700 block text-[10px] uppercase font-bold">
                  Customer Balance Due
                </span>
                <span
                  className="font-black text-amber-950 text-sm"
                  data-testid="pending-balance-display"
                >
                  {formatRs(job.financials.balanceDueRs)}
                </span>
              </div>
            </div>

            {/* Payment Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Type / Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    'ADVANCE',
                    'CUSTOMER_EXCESS',
                    'INSURANCE_SETTLEMENT',
                    'FULL_PAYMENT',
                  ] as WorkshopPaymentType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      'p-2 text-xs rounded-lg border font-semibold text-center transition-all cursor-pointer',
                      paymentType === type
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    )}
                    data-testid={`payment-type-${type.toLowerCase()}`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input with Quick Max Fill */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Amount to Collect (Rs.):
                </label>
                {maxAllowedAmount > 0 && (
                  <button
                    type="button"
                    onClick={handleFillMax}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    data-testid="pay-full-balance-btn"
                  >
                    Pay Full Pending ({formatRs(maxAllowedAmount)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                  Rs.
                </span>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={maxAllowedAmount > 0 ? maxAllowedAmount : undefined}
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="0.00"
                  className="pl-9 h-10 text-sm font-bold text-slate-900"
                  data-testid="payment-amount-input"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Max allowable for this category:{' '}
                <span className="font-semibold text-slate-800">
                  {formatRs(maxAllowedAmount)}
                </span>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as WorkshopPaymentMethod)
                  }
                  className="w-full h-9 px-2 text-xs rounded-md border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  data-testid="payment-method-select"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card (Debit / Credit)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / Online</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Date:
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9 text-xs"
                  data-testid="payment-date-input"
                />
              </div>
            </div>

            {/* Reference Number / Cheque Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reference / Cheque / Slip #:
              </label>
              <Input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. Cheque # 102938, Card Slip # 5421, TXN-9988"
                className="h-9 text-xs font-mono"
                data-testid="payment-reference-input"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Payment Notes (Optional):
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Advance paid before painting, balance due upon delivery"
                className="h-9 text-xs"
                data-testid="payment-notes-input"
              />
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div
                className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-semibold"
                data-testid="payment-validation-error"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Existing Payment History Summary */}
            {job.payments && job.payments.length > 0 && (
              <div className="border-t border-slate-200 pt-3">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">
                  Previous Payments on this Job ({job.payments.length}):
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1 text-xs">
                  {job.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]"
                    >
                      <span className="font-mono font-bold text-slate-700">
                        {p.receiptNumber} ({p.date})
                      </span>
                      <span className="text-slate-600">
                        {p.paymentMethod} • {p.paymentType.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatRs(p.amountRs)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetAndClose}
                className="text-xs h-9 px-4"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isSubmitting || maxAllowedAmount <= 0}
                className="text-xs h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm"
                data-testid="record-payment-submit-btn"
              >
                <DollarSign className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording...' : 'Record Payment'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}
