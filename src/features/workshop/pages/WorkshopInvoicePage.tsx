import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  Receipt,
  CreditCard,
  FileText,
  Shield,
  Lock,
  Unlock,
  Car,
  Building2,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import {
  WorkshopJobSheet,
  WorkshopPaymentRecord,
  WorkshopPaymentType,
} from '../types';
import {
  roundCurrency,
  formatRs,
} from '@/utils/currency';
import {
  InsuranceSplitBillingCalculator,
  OriginalEstimateSnapshotDrawer,
  SupplementaryLineItemBadge,
  AdvancePaymentReceiptRecorder,
  PaymentCollectionHistoryList,
} from '@/design-system/components/workshop-engine-components';
import { PosCollectPaymentModal } from '@/design-system/components/pos-counter-components';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { WorkshopPaymentThermalReceipt } from '@/components/print/WorkshopPaymentThermalReceipt';
import { cn } from '@/utils/cn';

export const WorkshopInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { permissions, isCostProfitVisible, toggleCostProfitVisible } = usePermissions();
  const { toast } = useToast();

  const [job, setJob] = useState<WorkshopJobSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [isSnapshotDrawerOpen, setIsSnapshotDrawerOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectModalType, setCollectModalType] = useState<
    'ADVANCE' | 'CUSTOMER_EXCESS' | 'INSURANCE_SETTLEMENT' | 'FULL_PAYMENT'
  >('CUSTOMER_EXCESS');
  const [isA4PrintOpen, setIsA4PrintOpen] = useState(false);
  const [isThermalPrintOpen, setIsThermalPrintOpen] = useState(false);
  const [activeThermalPayment, setActiveThermalPayment] = useState<WorkshopPaymentRecord | null>(null);

  // Interactive Split Billing States
  const [insuranceApproved, setInsuranceApproved] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [isSavingSplit, setIsSavingSplit] = useState(false);

  // Load Job
  const loadJob = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await workshopJobRepository.getById(id);
      if (data) {
        setJob(data);
        setInsuranceApproved(data.financials.insuranceApprovedRs || 0);
        setAdvancePaid(data.financials.advancePaidRs || 0);
        setDiscount(data.financials.discountRs || 0);
        setTax(data.financials.taxRs || 0);
      } else {
        setError(`Job #${id} could not be found.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice sheet.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  // Financial Step-Down Math
  const lines = job?.lines || [];
  const removeReassembleLines = useMemo(
    () => lines.filter((l) => l.category === 'LABOR_REMOVE_REASSEMBLE'),
    [lines]
  );
  const repairLines = useMemo(
    () => lines.filter((l) => l.category === 'LABOR_REPAIR'),
    [lines]
  );
  const replacementLines = useMemo(
    () => lines.filter((l) => l.category === 'REPLACEMENT'),
    [lines]
  );

  const subtotalRemoveReassemble = useMemo(
    () => removeReassembleLines.reduce((sum, l) => sum + (Number(l.sellingPriceRs) || 0), 0),
    [removeReassembleLines]
  );
  const subtotalRepair = useMemo(
    () => repairLines.reduce((sum, l) => sum + (Number(l.sellingPriceRs) || 0), 0),
    [repairLines]
  );
  const subtotalReplacement = useMemo(
    () => replacementLines.reduce((sum, l) => sum + (Number(l.sellingPriceRs) || 0), 0),
    [replacementLines]
  );

  const grossTotal = roundCurrency(
    subtotalRemoveReassemble + subtotalRepair + subtotalReplacement
  );
  const netInvoiceTotal = roundCurrency(Math.max(0, grossTotal - discount) + tax);

  // Split calculations
  const customerPayable = roundCurrency(Math.max(0, netInvoiceTotal - insuranceApproved));
  // Customer Balance Due = Grand Total - Discounts + Tax - Advance Paid - Insurance Approved Payable
  const customerBalanceDue = roundCurrency(Math.max(0, customerPayable - advancePaid));

  const insuranceSettled = useMemo(() => {
    return (job?.payments || [])
      .filter((p) => p.paymentType === 'INSURANCE_SETTLEMENT')
      .reduce((sum, p) => sum + (Number(p.amountRs) || 0), 0);
  }, [job?.payments]);

  const insuranceBalanceDue = roundCurrency(Math.max(0, insuranceApproved - insuranceSettled));

  // Computed live job sheet reflecting interactive split math for print previews
  const activeJobForPrint = useMemo(() => {
    if (!job) return null;
    return {
      ...job,
      financials: {
        ...job.financials,
        subtotalRemoveReassembleRs: subtotalRemoveReassemble,
        subtotalRepairRs: subtotalRepair,
        subtotalReplacementRs: subtotalReplacement,
        discountRs: discount,
        taxRs: tax,
        grandTotalSalesRs: netInvoiceTotal,
        insuranceApprovedRs: insuranceApproved,
        customerPayableRs: customerPayable,
        advancePaidRs: advancePaid,
        balanceDueRs: customerBalanceDue,
      },
    };
  }, [
    job,
    subtotalRemoveReassemble,
    subtotalRepair,
    subtotalReplacement,
    discount,
    tax,
    netInvoiceTotal,
    insuranceApproved,
    customerPayable,
    advancePaid,
    customerBalanceDue,
  ]);

  const openCollectModalFor = (
    type?: 'ADVANCE' | 'CUSTOMER_EXCESS' | 'INSURANCE_SETTLEMENT' | 'FULL_PAYMENT'
  ) => {
    if (type) {
      setCollectModalType(type);
    } else {
      if (insuranceApproved > 0 && customerBalanceDue <= 0 && insuranceBalanceDue > 0) {
        setCollectModalType('INSURANCE_SETTLEMENT');
      } else if (insuranceApproved > 0 && customerBalanceDue > 0) {
        setCollectModalType('CUSTOMER_EXCESS');
      } else {
        setCollectModalType('FULL_PAYMENT');
      }
    }
    setIsCollectModalOpen(true);
  };

  // 1-Click Convert to Invoice if visited in earlier stage
  const handleEnsureInvoiceStage = async () => {
    if (!job || job.docStage === 'INVOICE') return;
    try {
      const updated = await workshopJobRepository.convertStage(
        job.id,
        'INVOICE',
        'Direct stage conversion in Workshop Invoice Studio'
      );
      setJob(updated);
      toast({
        title: 'Stage Finalized',
        message: `Document transitioned to Final Invoice.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Conversion Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  // Sync split parameters to repository
  const handleSaveSplit = async () => {
    if (!job) return;
    try {
      setIsSavingSplit(true);
      const updated = await workshopJobRepository.update(job.id, {
        insuranceApprovedRs: insuranceApproved,
        advancePaidRs: advancePaid,
        discountRs: discount,
        taxRs: tax,
      });
      setJob(updated);
      setInsuranceApproved(updated.financials.insuranceApprovedRs);
      setAdvancePaid(updated.financials.advancePaidRs);
      setDiscount(updated.financials.discountRs);
      setTax(updated.financials.taxRs);
      toast({
        title: 'Split Billing Synchronized',
        message: `Updated Insurance Approved (${formatRs(insuranceApproved)}) & Customer Advance (${formatRs(advancePaid)}).`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to sync split billing',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSavingSplit(false);
    }
  };

  // Quick Advance deposit recording
  const handleRecordAdvance = async (amt: number, method: string, notes?: string) => {
    if (!job) return;
    try {
      const pMethod = method.toUpperCase().replace(/\s+/g, '_') as any;

      // Sync latest split baseline to repo first to prevent balance mismatch
      await workshopJobRepository.update(job.id, {
        insuranceApprovedRs: insuranceApproved,
        discountRs: discount,
        taxRs: tax,
      });

      const updated = await workshopJobRepository.recordPayment(job.id, {
        amountRs: amt,
        paymentType: 'ADVANCE',
        paymentMethod: pMethod || 'CASH',
        notes: notes || 'Quick customer advance deposit',
        recordedBy: user?.name || 'Cashier',
      });
      setJob(updated);
      setInsuranceApproved(updated.financials.insuranceApprovedRs);
      setAdvancePaid(updated.financials.advancePaidRs);
      setDiscount(updated.financials.discountRs);
      setTax(updated.financials.taxRs);
      toast({
        title: 'Advance Recorded',
        message: `Successfully credited ${formatRs(amt)} deposit via ${method}.`,
        type: 'success',
      });
      if (updated.payments && updated.payments.length > 0) {
        setActiveThermalPayment(updated.payments[updated.payments.length - 1]);
      }
    } catch (err: any) {
      toast({
        title: 'Advance Recording Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  // Modal payment collection (Settlements, Cheques, Customer Excess)
  const handleCompletePaymentModal = async (details: any) => {
    if (!job) return;
    try {
      const amt = Number(details.amountRs || details.tenderedRs);
      let pType: WorkshopPaymentType = details.paymentType;
      if (!pType) {
        if (insuranceApproved > 0 && customerBalanceDue <= 0 && insuranceBalanceDue > 0) {
          pType = 'INSURANCE_SETTLEMENT';
        } else if (insuranceApproved > 0 && customerBalanceDue > 0) {
          pType = 'CUSTOMER_EXCESS';
        } else {
          pType = 'FULL_PAYMENT';
        }
      }

      const pMethod = (details.method || 'CASH').toUpperCase().replace(/\s+/g, '_');

      // Sync latest split baseline to repo first so recordPayment validates against current values
      await workshopJobRepository.update(job.id, {
        insuranceApprovedRs: insuranceApproved,
        discountRs: discount,
        taxRs: tax,
      });

      const updated = await workshopJobRepository.recordPayment(job.id, {
        amountRs: amt,
        paymentType: pType,
        paymentMethod: pMethod as any,
        referenceNumber: details.referenceNumber,
        notes: details.notes,
        recordedBy: user?.name || 'Cashier',
      });

      setJob(updated);
      setInsuranceApproved(updated.financials.insuranceApprovedRs);
      setAdvancePaid(updated.financials.advancePaidRs);
      setDiscount(updated.financials.discountRs);
      setTax(updated.financials.taxRs);
      setIsCollectModalOpen(false);

      toast({
        title: 'Payment Recorded',
        message: `Successfully received ${formatRs(amt)} (${pType.replace('_', ' ')}). New Status: ${updated.paymentStatus}.`,
        type: 'success',
      });

      if (updated.payments && updated.payments.length > 0) {
        setActiveThermalPayment(updated.payments[updated.payments.length - 1]);
        setIsThermalPrintOpen(true);
      }
    } catch (err: any) {
      toast({
        title: 'Collection Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  const handlePrintThermalReceipt = (p: WorkshopPaymentRecord) => {
    setActiveThermalPayment(p);
    setIsThermalPrintOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-[#F95700] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Invoicing & Settlement Studio...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Document Not Found</h2>
          <p className="text-xs text-slate-600">{error || 'Unable to locate requested workshop job.'}</p>
          <div className="pt-2">
            <Link to="/workshop/jobs">
              <Button variant="default" className="w-full">
                Return to Workshop Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasSupplementaryItems = lines.some((l) => l.isSupplementary);

  return (
    <PageContainer
      maxWidth="wide"
      className="xl:max-w-[1600px] pb-16"
      dataTestId="workshop-invoice-page"
    >
      {/* 1. Standardized Modern Bento Command Card Header */}
      <PageHeader
        glowColor="indigo"
        icon={<Receipt className="w-5 h-5 text-indigo-600" />}
        iconClassName="bg-indigo-50/80 border-indigo-200/80 text-indigo-600"
        kicker="WORKSHOP INVOICING STUDIO"
        title={job.header.vehicleNumber || 'Unregistered Plate'}
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="invoice"
              className="font-bold text-xs px-2.5 py-1 uppercase"
              data-testid="invoice-stage-badge"
            >
              {job.docStage}
            </Badge>

            <Badge
              variant={
                job.paymentStatus === 'PAID'
                  ? 'emerald'
                  : job.paymentStatus === 'PARTIALLY_PAID'
                  ? 'amber'
                  : 'destructive'
              }
              className="font-bold text-xs px-2.5 py-1 uppercase"
              data-testid="invoice-payment-status-badge"
            >
              {job.paymentStatus.replace('_', ' ')}
            </Badge>
          </div>
        }
        description={
          job.header.vehicleMake
            ? `${job.header.vehicleMake} ${job.header.vehicleModel || ''} • Job Ref: ${job.jobNumber}`
            : `Job Ref: ${job.jobNumber} • Final Invoicing & Settlement`
        }
        breadcrumbs={[
          { label: 'Jobs', href: '/workshop/jobs' },
          { label: `Invoice #${job.jobNumber}` },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/workshop/jobs"
              className="sr-only"
              data-testid="back-to-jobs-btn"
            >
              Back
            </Link>

            {/* Admin Cost Mode Toggle (Authorized Roles Only) */}
            {permissions.canViewCosts && permissions.canViewGrossProfit && (
              <button
                type="button"
                onClick={toggleCostProfitVisible}
                title={isCostProfitVisible ? 'Hide buying costs' : 'Show buying costs (Admin)'}
                data-testid="toggle-cost-profit-btn"
                className={cn(
                  'h-8 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  isCostProfitVisible
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                {isCostProfitVisible ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Cost Mode</span>
              </button>
            )}

            {/* Compare Snapshot Drawer Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSnapshotDrawerOpen(true)}
              className="h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 gap-1.5 shadow-2xs"
              data-testid="open-snapshot-drawer-btn"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Baseline Audit</span>
            </Button>

            {/* Collect Payment Modal Button */}
            {role !== 'TECHNICIAN' && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => openCollectModalFor()}
                className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                data-testid="collect-settlement-btn"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Collect Settlement</span>
              </Button>
            )}

            {/* Print A4 Tax Invoice */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsA4PrintOpen(true)}
              className="h-8 text-xs font-bold text-slate-800 border-slate-200 hover:bg-slate-50 gap-1.5 shadow-2xs"
              data-testid="print-a4-invoice-btn"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">A4 Invoice</span>
            </Button>

            {/* Thermal Slip */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (job.payments && job.payments.length > 0) {
                  setActiveThermalPayment(job.payments[job.payments.length - 1]);
                } else {
                  setActiveThermalPayment({
                    id: 'preview',
                    receiptNumber: 'PREVIEW',
                    date: job.header.date || new Date().toISOString().split('T')[0],
                    amountRs: advancePaid,
                    paymentType: 'ADVANCE',
                    paymentMethod: 'CASH',
                    balanceAfterRs: customerBalanceDue,
                    createdAt: new Date().toISOString(),
                  });
                }
                setIsThermalPrintOpen(true);
              }}
              className="h-8 text-xs font-bold text-slate-800 border-slate-200 hover:bg-slate-50 gap-1.5 shadow-2xs"
              data-testid="print-thermal-receipt-btn"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">80mm Slip</span>
            </Button>

            {/* Link to Edit in Repair Sheet */}
            <Link to={`/workshop/sheet/${job.id}`}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                data-testid="view-job-sheet-btn"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                <span className="hidden md:inline">Edit Sheet</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Workspace Body: Two-Column Settlement Terminal Layout */}
      <div className="mt-2">
        {/* If document is not yet marked INVOICE, display prominent transition banner */}
        {job.docStage !== 'INVOICE' && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Document Stage: {job.docStage}
                </h4>
                <p className="text-xs text-amber-700">
                  This job is currently in {job.docStage} stage. Convert to Final Invoice to finalize pricing and issue tax settlement.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleEnsureInvoiceStage}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              data-testid="finalize-invoice-btn"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              Finalize to Invoice
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (60%): Clean itemized summary highlighting original approved estimate items vs. SUPPLEMENTARY amber-tagged items + Payment Ledger */}
          <div className="lg:col-span-7 space-y-6">
            {/* Vehicle Header Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-slate-600" />
                  <span>Workshop Vehicle Dossier</span>
                </span>
                <span className="font-mono text-slate-500">
                  Job Ref: <strong>{job.jobNumber}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Vehicle Plate</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {job.header.vehicleNumber || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Make & Model</span>
                  <span className="font-semibold text-slate-800">
                    {job.header.vehicleMake || '-'} {job.header.vehicleModel || ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Year & Color</span>
                  <span className="text-slate-700">
                    {job.header.yearOfMake || '-'} · {job.header.vehicleColor || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Chassis Number</span>
                  <span className="font-mono text-slate-700">{job.header.chassisNumber || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block uppercase">Insurance Company</span>
                  <span className="font-bold text-blue-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{job.header.insuranceName || 'None / Direct Cash Customer'}</span>
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-slate-400 block uppercase">Customer Information</span>
                  <span className="text-slate-800 font-medium">
                    {job.header.customerInfo || 'Walk-in Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Repair Summary Table with Supplementary Badges */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-600" />
                    <span>Itemized Repair Summary</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Original approved items vs. amber-tagged supplementary lines added during repair
                  </p>
                </div>
                {hasSupplementaryItems && (
                  <SupplementaryLineItemBadge />
                )}
              </div>

              {/* Section 1: Labor Remove & Reassemble */}
              <div className="border-b border-slate-100">
                <div className="bg-slate-100/70 px-4 py-2 font-bold text-[11px] text-slate-800 uppercase tracking-wider flex justify-between items-center">
                  <span>1. Labor - Remove & Reassemble ({removeReassembleLines.length})</span>
                  <span className="font-sans tabular-nums font-bold">{formatRs(subtotalRemoveReassemble)}</span>
                </div>
                <table className="w-full text-left">
                  <tbody>
                    {removeReassembleLines.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-slate-400 italic">
                          - Nil -
                        </td>
                      </tr>
                    ) : (
                      removeReassembleLines.map((l, idx) => (
                        <tr
                          key={l.id || idx}
                          className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                          data-testid={`repair-line-${l.id}`}
                        >
                          <td className="w-10 p-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {l.isSupplementary && <SupplementaryLineItemBadge />}
                              <span className="font-medium text-slate-800">{l.description}</span>
                            </div>
                            {l.assignedTechnician && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Tech: {l.assignedTechnician}
                              </span>
                            )}
                          </td>
                          <td className="w-32 p-3 text-right font-sans tabular-nums font-bold text-slate-900">
                            {formatRs(l.sellingPriceRs)}
                            {isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit && (
                              <span className="block text-[10px] font-normal text-emerald-700">
                                Cost: {formatRs(l.buyingCostRs)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 2: Labor Repair */}
              <div className="border-b border-slate-100">
                <div className="bg-slate-100/70 px-4 py-2 font-bold text-[11px] text-slate-800 uppercase tracking-wider flex justify-between items-center">
                  <span>2. Labor - Repair ({repairLines.length})</span>
                  <span className="font-sans tabular-nums font-bold">{formatRs(subtotalRepair)}</span>
                </div>
                <table className="w-full text-left">
                  <tbody>
                    {repairLines.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-slate-400 italic">
                          - Nil -
                        </td>
                      </tr>
                    ) : (
                      repairLines.map((l, idx) => (
                        <tr
                          key={l.id || idx}
                          className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                          data-testid={`repair-line-${l.id}`}
                        >
                          <td className="w-10 p-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {l.isSupplementary && <SupplementaryLineItemBadge />}
                              <span className="font-medium text-slate-800">{l.description}</span>
                            </div>
                            {l.assignedTechnician && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Tech: {l.assignedTechnician}
                              </span>
                            )}
                          </td>
                          <td className="w-32 p-3 text-right font-sans tabular-nums font-bold text-slate-900">
                            {formatRs(l.sellingPriceRs)}
                            {isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit && (
                              <span className="block text-[10px] font-normal text-emerald-700">
                                Cost: {formatRs(l.buyingCostRs)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 3: Replacement Parts */}
              <div>
                <div className="bg-slate-100/70 px-4 py-2 font-bold text-[11px] text-slate-800 uppercase tracking-wider flex justify-between items-center">
                  <span>3. Replacement Parts ({replacementLines.length})</span>
                  <span className="font-sans tabular-nums font-bold">{formatRs(subtotalReplacement)}</span>
                </div>
                <table className="w-full text-left">
                  <tbody>
                    {replacementLines.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-slate-400 italic">
                          - Nil -
                        </td>
                      </tr>
                    ) : (
                      replacementLines.map((l, idx) => (
                        <tr
                          key={l.id || idx}
                          className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                          data-testid={`repair-line-${l.id}`}
                        >
                          <td className="w-10 p-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {l.isSupplementary && <SupplementaryLineItemBadge />}
                              <span className="font-medium text-slate-800">{l.description}</span>
                            </div>
                          </td>
                          <td className="w-32 p-3 text-right font-sans tabular-nums font-bold text-slate-900">
                            {formatRs(l.sellingPriceRs)}
                            {isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit && (
                              <span className="block text-[10px] font-normal text-emerald-700">
                                Cost: {formatRs(l.buyingCostRs)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Items Section Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center font-bold text-slate-800">
                <span>Gross Line Items Total:</span>
                <span className="font-sans tabular-nums font-bold text-sm text-slate-900">{formatRs(grossTotal)}</span>
              </div>
            </div>

            {/* Quick Customer Advance Deposit Recorder */}
            {role !== 'TECHNICIAN' && (
              <AdvancePaymentReceiptRecorder
                advancePaid={advancePaid}
                onRecord={handleRecordAdvance}
              />
            )}

            {/* Payment & Settlement Receipts Ledger */}
            <PaymentCollectionHistoryList
              payments={job.payments || []}
              onPrintThermal={handlePrintThermalReceipt}
            />
          </div>

          {/* RIGHT COLUMN (40%): Sticky Insurance vs. Customer Excess Split-Billing Card */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <InsuranceSplitBillingCalculator
              grandTotal={netInvoiceTotal}
              grossTotal={grossTotal}
              discount={discount}
              tax={tax}
              insuranceApproved={insuranceApproved}
              advancePaid={advancePaid}
              insuranceSettled={insuranceSettled}
              onInsuranceChange={setInsuranceApproved}
              onAdvanceChange={setAdvancePaid}
              onDiscountChange={setDiscount}
              onTaxChange={setTax}
              onCollectPayment={() => openCollectModalFor(customerBalanceDue > 0 ? 'CUSTOMER_EXCESS' : 'FULL_PAYMENT')}
              onCollectInsurance={() => openCollectModalFor('INSURANCE_SETTLEMENT')}
              isReadOnly={role === 'TECHNICIAN'}
            />

            {/* Sync & Print Action Deck */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5 text-xs">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveSplit}
                disabled={isSavingSplit || role === 'TECHNICIAN'}
                className="w-full text-xs font-bold text-slate-800 border-slate-300 hover:bg-slate-50"
                data-testid="sync-split-financials-btn"
              >
                {isSavingSplit ? 'Synchronizing...' : 'Save & Sync Split Financials'}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsA4PrintOpen(true)}
                  className="w-full text-xs font-semibold gap-1.5"
                  data-testid="preview-a4-btn"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A4 Tax Invoice</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (job.payments && job.payments.length > 0) {
                      setActiveThermalPayment(job.payments[job.payments.length - 1]);
                    }
                    setIsThermalPrintOpen(true);
                  }}
                  className="w-full text-xs font-semibold gap-1.5"
                  data-testid="preview-thermal-btn"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>80mm Slip</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Original Estimate Snapshot Drawer */}
      <OriginalEstimateSnapshotDrawer
        open={isSnapshotDrawerOpen}
        onClose={() => setIsSnapshotDrawerOpen(false)}
        originalEstimate={job.originalEstimateSnapshot}
        currentDocument={job}
      />

      {/* PosCollectPaymentModal for Partial & Full Settlements */}
      <PosCollectPaymentModal
        open={isCollectModalOpen}
        orderNumber={job.jobNumber}
        totalRs={
          collectModalType === 'INSURANCE_SETTLEMENT'
            ? insuranceBalanceDue
            : customerBalanceDue > 0
            ? customerBalanceDue
            : insuranceBalanceDue > 0
            ? insuranceBalanceDue
            : 0
        }
        paymentTypeTotals={{
          CUSTOMER_EXCESS: customerBalanceDue,
          ADVANCE: customerBalanceDue,
          FULL_PAYMENT: customerBalanceDue,
          INSURANCE_SETTLEMENT: insuranceBalanceDue,
        }}
        customerName={job.header.customerInfo}
        title="Collect Invoice Settlement"
        allowTypeSelection={true}
        defaultPaymentType={collectModalType}
        onClose={() => setIsCollectModalOpen(false)}
        onComplete={handleCompletePaymentModal}
      />

      {/* A4 Tax Invoice Print Modal / View */}
      {isA4PrintOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          data-testid="a4-print-modal"
        >
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 max-h-[92vh] flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>A4 Tax Invoice Print Preview</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Includes split totals, payment history, and computer-generated footer
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                  data-testid="trigger-window-print-btn"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setIsA4PrintOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  data-testid="close-a4-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded A4 Workshop Print View */}
            <div className="overflow-x-auto bg-slate-100/60 p-4 rounded-xl border border-slate-200">
              <A4WorkshopPrint jobSheet={activeJobForPrint || job} />
            </div>
          </div>
        </div>
      )}

      {/* 80mm Thermal Receipt Print Modal */}
      {isThermalPrintOpen && activeThermalPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-testid="thermal-receipt-modal"
        >
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2 no-print">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-700" />
                <span>80mm Thermal Receipt Slip</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsThermalPrintOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                data-testid="close-thermal-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-center">
              <WorkshopPaymentThermalReceipt
                jobSheet={activeJobForPrint || job}
                payment={activeThermalPayment}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t no-print">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsThermalPrintOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                data-testid="trigger-thermal-print-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
