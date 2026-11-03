import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Printer,
  Share2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Car,
  FileCheck,
  CreditCard,
  Receipt,
  MoreVertical,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import {
  WorkshopJobSheet,
  DocumentStage,
  WorkshopFloorStatus,
  AuditLogEntry,
} from '@/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs, determineWorkshopPaymentStatus } from '@/utils/currency';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { PaymentCollectionModal } from '../components/PaymentCollectionModal';
import { buildWhatsAppShareUrl } from '@/utils/whatsapp';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

export function WorkshopJobsPage() {
  const { role, user, permissions } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const queryParam = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryParam);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [revision, setRevision] = useState(0);
  const [activePrintJob, setActivePrintJob] = useState<WorkshopJobSheet | null>(null);
  const [activePaymentJob, setActivePaymentJob] = useState<WorkshopJobSheet | null>(null);
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null);

  // Sync search param when URL queryParam changes
  useEffect(() => {
    if (queryParam !== search) {
      setSearch(queryParam);
    }
  }, [queryParam]);

  const jobs = useMemo(() => {
    if (workshopJobRepository.filterSync) {
      return workshopJobRepository.filterSync({
        search,
        stage: filterStage === 'ALL' ? undefined : (filterStage as DocumentStage),
        status: filterStatus === 'ALL' ? undefined : (filterStatus as WorkshopFloorStatus),
      });
    }
    return [];
  }, [search, filterStage, filterStatus, revision]);

  const allJobs = useMemo(() => {
    if (workshopJobRepository.filterSync) {
      return workshopJobRepository.filterSync({});
    }
    return [];
  }, [revision]);

  const stageCounts = useMemo(() => {
    return {
      ALL: allJobs.length,
      QUOTATION: allJobs.filter((j) => j.docStage === 'QUOTATION').length,
      ESTIMATE: allJobs.filter((j) => j.docStage === 'ESTIMATE').length,
      JOB_CARD: allJobs.filter((j) => j.docStage === 'JOB_CARD').length,
      INVOICE: allJobs.filter((j) => j.docStage === 'INVOICE').length,
    };
  }, [allJobs]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteJob = async (id: string, jobNo: string) => {
    if (!window.confirm(`Are you sure you want to delete job ${jobNo}?`)) {
      return;
    }
    try {
      await workshopJobRepository.delete(id);
      toast({
        title: 'Job Deleted',
        message: `Job ${jobNo} has been removed.`,
        type: 'info',
      });
      setRevision((r) => r + 1);
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Delete Failed',
        message: 'Could not delete the job record.',
        type: 'error',
      });
    }
  };

  const handleResetSeeds = async () => {
    try {
      await workshopJobRepository.resetToDefaults();
      toast({
        title: 'Defaults Restored',
        message: 'Loaded sample collision repair job records.',
        type: 'success',
      });
      setRevision((r) => r + 1);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleConvertToJobCard = async (job: WorkshopJobSheet) => {
    try {
      let snapshot = job.originalEstimateSnapshot;
      if (!snapshot) {
        const snapshotData = {
          lines: JSON.parse(JSON.stringify(job.lines)),
          financials: { ...job.financials },
          grandTotalSalesRs: job.financials.grandTotalSalesRs,
          subtotalRemoveReassembleRs: job.financials.subtotalRemoveReassembleRs,
          subtotalRepairRs: job.financials.subtotalRepairRs,
          subtotalReplacementRs: job.financials.subtotalReplacementRs,
          discountRs: job.financials.discountRs || 0,
          taxRs: job.financials.taxRs || 0,
          frozenAt: new Date().toISOString(),
          stage: job.docStage,
        };
        snapshot = JSON.stringify(snapshotData);
      }

      const auditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor: user?.name || role,
        action: 'STAGE_CONVERSION',
        fromState: job.docStage,
        toState: 'JOB_CARD',
        comment: `Converted from ${job.docStage} to Job Card. Baseline estimate frozen at Rs. ${job.financials.grandTotalSalesRs}.`,
      };

      const updatedLogs = [...(job.auditLogs || []), auditEntry];

      await workshopJobRepository.update(job.id, {
        docStage: 'JOB_CARD',
        floorStatus: 'APPROVED_IN_PROGRESS',
        originalEstimateSnapshot: snapshot,
        auditLogs: updatedLogs,
      });

      toast({
        title: 'Converted to Job Card',
        message: `${job.jobNumber} successfully converted to Job Card.`,
        type: 'success',
      });

      setRevision((r) => r + 1);
    } catch (err) {
      console.error('Job card conversion error:', err);
      toast({
        title: 'Conversion Failed',
        message: 'Could not convert job to Job Card.',
        type: 'error',
      });
    }
  };

  const handleConvertToInvoice = async (job: WorkshopJobSheet) => {
    try {
      let snapshot = job.originalEstimateSnapshot;
      if (!snapshot) {
        const snapshotData = {
          lines: JSON.parse(JSON.stringify(job.lines)),
          financials: { ...job.financials },
          grandTotalSalesRs: job.financials.grandTotalSalesRs,
          subtotalRemoveReassembleRs: job.financials.subtotalRemoveReassembleRs,
          subtotalRepairRs: job.financials.subtotalRepairRs,
          subtotalReplacementRs: job.financials.subtotalReplacementRs,
          discountRs: job.financials.discountRs || 0,
          taxRs: job.financials.taxRs || 0,
          frozenAt: new Date().toISOString(),
          stage: job.docStage,
        };
        snapshot = JSON.stringify(snapshotData);
      }

      const currentPaymentStatus = determineWorkshopPaymentStatus({
        grandTotalSalesRs: job.financials.grandTotalSalesRs,
        insuranceApprovedRs: job.financials.insuranceApprovedRs,
        advancePaidRs: job.financials.advancePaidRs,
        balanceDueRs: job.financials.balanceDueRs,
        payments: job.payments,
      });

      const isFullyPaid = currentPaymentStatus === 'PAID';
      const nextFloorStatus: WorkshopFloorStatus = isFullyPaid
        ? 'COMPLETED_DELIVERED'
        : 'READY_FOR_DELIVERY';

      const auditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor: user?.name || role,
        action: 'STAGE_CONVERSION',
        fromState: job.docStage,
        toState: 'INVOICE',
        comment: `Converted from ${job.docStage} to Final Invoice. Grand Total: Rs. ${job.financials.grandTotalSalesRs}, Balance Due: Rs. ${job.financials.balanceDueRs}.`,
      };

      const updatedLogs = [...(job.auditLogs || []), auditEntry];

      await workshopJobRepository.update(job.id, {
        docStage: 'INVOICE',
        floorStatus: nextFloorStatus,
        paymentStatus: currentPaymentStatus,
        originalEstimateSnapshot: snapshot,
        auditLogs: updatedLogs,
      });

      toast({
        title: 'Converted to Invoice',
        message: `${job.jobNumber} successfully converted to Final Invoice.`,
        type: 'success',
      });

      setRevision((r) => r + 1);
    } catch (err) {
      console.error('Invoice conversion error:', err);
      toast({
        title: 'Conversion Failed',
        message: 'Could not convert job to Invoice.',
        type: 'error',
      });
    }
  };

  const handleWhatsAppShare = (job: WorkshopJobSheet) => {
    const url = buildWhatsAppShareUrl(job);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer maxWidth="standard" className="xl:max-w-[1600px]" dataTestId="workshop-jobs-page">
      {/* 1. Standardized Modern Bento Command Card Header */}
      <PageHeader
        glowColor="orange"
        icon={<Wrench className="w-5 h-5 text-[#F95700]" />}
        iconClassName="bg-orange-50/80 border-orange-200/80 text-[#F95700]"
        kicker="WORKSHOP OPERATIONS"
        title="Workshop Jobs & Collision Estimates"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-orange-50 text-[#F95700] border border-orange-200/60">
            {stageCounts.ALL} Records
          </span>
        }
        description="Searchable repository for quotations, collision estimates, active job cards, and invoices."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSeeds}
              className="text-xs h-8 text-slate-700 gap-1.5 border-slate-200/90 bg-white hover:bg-slate-50 rounded-lg shadow-2xs font-semibold px-3"
              title="Reset to default collision seeds"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Seeds</span>
            </Button>

            <Link to="/workshop/sheet">
              <Button
                variant="default"
                size="sm"
                className="bg-[#F95700] hover:bg-[#EA580C] text-white font-semibold text-xs h-8 px-3.5 gap-1.5 rounded-lg shadow-xs"
                data-testid="create-new-sheet-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Repair Sheet</span>
              </Button>
            </Link>
          </>
        }
      />

      {/* Unified Table Card (Executive Command Strip + Table + Pagination) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden no-print">
        {/* Card Top Row: Stage Tabs with Count Pills */}
        <div className="flex items-center gap-5 px-4 pt-2.5 border-b border-slate-200/70 overflow-x-auto">
          {[
            { label: 'All', value: 'ALL', count: stageCounts.ALL },
            { label: 'Quotations', value: 'QUOTATION', count: stageCounts.QUOTATION },
            { label: 'Estimates', value: 'ESTIMATE', count: stageCounts.ESTIMATE },
            { label: 'Job Cards', value: 'JOB_CARD', count: stageCounts.JOB_CARD },
            { label: 'Invoices', value: 'INVOICE', count: stageCounts.INVOICE },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStage(tab.value)}
              className={cn(
                'pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                filterStage === tab.value
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
              data-testid={`stage-tab-${tab.value.toLowerCase()}`}
            >
              <span>{tab.label}</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-sans tabular-nums">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Card Second Row: Search & Status Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by vehicle plate, job #, customer, or insurance..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200/90 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              data-testid="jobs-search-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 hidden md:inline">Floor status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 text-xs bg-white border border-slate-200/90 rounded-lg px-2.5 font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300 focus:border-slate-900"
              data-testid="jobs-status-select"
            >
              <option value="ALL">All Floor Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_INSURANCE_APPROVAL">Pending Insurance</option>
              <option value="APPROVED_IN_PROGRESS">Approved in Progress</option>
              <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="COMPLETED_DELIVERED">Completed / Delivered</option>
            </select>
          </div>
        </div>

        {/* Jobs List / Table */}
        {jobs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Car className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Workshop Jobs Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No records match your search "${search}". Try clearing filters or searching for another plate.`
                : 'Get started by creating your first vehicle repair quotation or estimate.'}
            </p>
            <div className="pt-2">
              <Link to="/workshop/sheet">
                <Button variant="default" size="sm" className="bg-[#F95700] hover:bg-[#EA580C] text-xs font-semibold rounded-lg">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Create Repair Sheet
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4 whitespace-nowrap">Job ID</th>
                  <th className="py-3 px-4 whitespace-nowrap">Vehicle</th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer & insurer</th>
                  <th className="py-3 px-4 whitespace-nowrap">Stage</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  {role !== 'TECHNICIAN' && (
                    <th className="py-3 px-4 text-right whitespace-nowrap">Amount (Rs.)</th>
                  )}
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/80 transition-colors"
                    data-testid={`job-row-${job.id}`}
                  >
                    {/* Column 1: Job ID */}
                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                        {job.jobNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                        {job.header.date}
                      </div>
                    </td>

                    {/* Column 2: Vehicle */}
                    <td className="py-3 px-4 align-top min-w-[200px]">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="inline-flex items-center bg-slate-900 text-white font-mono text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap">
                          {job.header.vehicleNumber || '-'}
                        </span>
                        <span className="font-semibold text-xs text-slate-900 whitespace-nowrap">
                          {[job.header.vehicleMake, job.header.vehicleModel].filter(Boolean).join(' ') || '-'}
                        </span>
                      </div>
                      {job.header.natureOfRepair && (
                        <div className="text-xs text-slate-500 truncate max-w-[240px] mt-1">
                          {job.header.natureOfRepair}
                        </div>
                      )}
                    </td>

                    {/* Column 3: Customer & Insurer */}
                    <td className="py-3 px-4 align-top min-w-[180px]">
                      <div className="text-xs font-medium text-slate-800 truncate max-w-[220px]">
                        {job.header.customerInfo || 'Walk-in Customer'}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[220px] mt-0.5">
                        {job.header.insuranceName || 'Direct / Cash'}
                      </div>
                    </td>

                    {/* Column 4: Stage */}
                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium border',
                          job.docStage === 'INVOICE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            : job.docStage === 'JOB_CARD'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                            : job.docStage === 'ESTIMATE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        )}
                      >
                        {job.docStage === 'JOB_CARD'
                          ? 'Job Card'
                          : job.docStage === 'INVOICE'
                          ? 'Invoice'
                          : job.docStage === 'ESTIMATE'
                          ? 'Estimate'
                          : 'Quotation'}
                      </span>
                    </td>

                    {/* Column 5: Status */}
                    <td className="py-3 px-4 align-top whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            job.paymentStatus === 'PAID'
                              ? 'bg-emerald-500'
                              : job.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          )}
                        />
                        <span className="text-[11px] font-medium text-slate-700">
                          {job.paymentStatus === 'PAID'
                            ? 'Paid'
                            : job.paymentStatus === 'PARTIALLY_PAID'
                            ? 'Partially Paid'
                            : 'Unpaid'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 whitespace-nowrap">
                        {job.floorStatus
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </div>
                    </td>

                    {/* Column 6: Amount */}
                    {role !== 'TECHNICIAN' && (
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap font-sans tabular-nums text-sm font-semibold text-slate-900">
                        {formatRs(job.financials?.grandTotalSalesRs || 0).replace(' ', '\u00A0')}
                      </td>
                    )}

                    {/* Column 7: Actions */}
                    <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* 1. Primary Contextual Pill Button */}
                        {permissions.canManageJobCards && (job.docStage === 'QUOTATION' || job.docStage === 'ESTIMATE') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvertToJobCard(job)}
                            className="h-7 px-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
                            title="Convert to Job Card"
                            data-testid={`convert-job-btn-${job.id}`}
                          >
                            <span>→ Job Card</span>
                          </Button>
                        ) : permissions.canManageJobCards && job.docStage === 'JOB_CARD' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvertToInvoice(job)}
                            className="h-7 px-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
                            title="Convert to Invoice"
                            data-testid={`convert-invoice-btn-${job.id}`}
                          >
                            <span>→ Invoice</span>
                          </Button>
                        ) : (
                          <Link to={`/workshop/sheet/${job.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1 shadow-2xs whitespace-nowrap"
                            >
                              <span>View Sheet</span>
                            </Button>
                          </Link>
                        )}

                        {/* 2. Three-Dot Dropdown Menu (⋯) */}
                        <div className="relative inline-block text-left group/menu">
                          <button
                            type="button"
                            onClick={() => setOpenMenuJobId(openMenuJobId === job.id ? null : job.id)}
                            className="h-7 w-7 rounded-md border border-slate-200/80 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors shadow-2xs"
                            title="More actions"
                            data-testid={`job-menu-trigger-${job.id}`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          <div
                            className={cn(
                              'absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200/90 shadow-lg py-1 z-30 transition-all text-xs text-left',
                              openMenuJobId === job.id ? 'block' : 'hidden group-hover/menu:block'
                            )}
                          >
                            <Link
                              to={`/workshop/sheet/${job.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full"
                              data-testid={`edit-job-btn-${job.id}`}
                              onClick={() => setOpenMenuJobId(null)}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              <span>View / Edit Sheet</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActivePrintJob(job);
                                setOpenMenuJobId(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full cursor-pointer text-left"
                              data-testid={`print-job-btn-${job.id}`}
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-400" />
                              <span>Print A4</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleWhatsAppShare(job);
                                setOpenMenuJobId(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full cursor-pointer text-left"
                              data-testid={`whatsapp-job-btn-${job.id}`}
                            >
                              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Share WhatsApp</span>
                            </button>

                            {role !== 'TECHNICIAN' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePaymentJob(job);
                                  setOpenMenuJobId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full cursor-pointer text-left"
                                data-testid={`collect-payment-btn-${job.id}`}
                              >
                                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                                <span>Record Payment</span>
                              </button>
                            )}

                            {permissions.canManageJobCards && job.docStage === 'ESTIMATE' && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleConvertToInvoice(job);
                                  setOpenMenuJobId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full cursor-pointer text-left"
                                data-testid={`convert-invoice-btn-${job.id}`}
                              >
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Convert to Invoice</span>
                              </button>
                            )}

                            {job.docStage === 'INVOICE' && (
                              <Link
                                to={`/workshop/invoice/${job.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full text-left"
                                data-testid={`open-invoice-btn-${job.id}`}
                                onClick={() => setOpenMenuJobId(null)}
                              >
                                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Invoice Terminal</span>
                              </Link>
                            )}

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuJobId(null);
                                handleDeleteJob(job.id, job.jobNumber);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer text-left"
                              data-testid={`delete-job-btn-${job.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete Job</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Clean Pagination / Count Footer Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200/70 bg-slate-50/30 text-xs text-slate-500">
          <div>
            Showing 1–{jobs.length} of {jobs.length} workshop records
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 bg-white text-slate-400 cursor-not-allowed"
            >
              Previous
            </button>
            <span className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white rounded-md font-sans tabular-nums font-semibold text-xs">
              1
            </span>
            <button
              type="button"
              disabled
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 bg-white text-slate-400 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* A4 Print Modal for quick preview from list */}
      <Dialog
        open={activePrintJob !== null}
        onOpenChange={(open) => {
          if (!open) setActivePrintJob(null);
        }}
      >
        {activePrintJob && (
          <div className="p-4 sm:p-6 space-y-4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="no-print">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-sm font-bold flex items-center gap-2">
                    <Printer className="w-4 h-4 text-slate-700" />
                    A4 Print Preview - {activePrintJob.jobNumber} ({activePrintJob.docStage})
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Standard 1px black border laser print layout. Zero cost/margin disclosure.
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-black text-white text-xs h-8 font-bold gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Now
                  </Button>
                  <DialogClose onClick={() => setActivePrintJob(null)} />
                </div>
              </div>
            </DialogHeader>

            <div className="border border-slate-300 rounded shadow-inner p-2 sm:p-4 bg-slate-100 flex justify-center print:border-none print:shadow-none print:p-0 print:bg-transparent">
              <A4WorkshopPrint jobSheet={activePrintJob} />
            </div>
          </div>
        )}
      </Dialog>

      {/* Payment Collection Modal */}
      {activePaymentJob && (
        <PaymentCollectionModal
          isOpen={activePaymentJob !== null}
          onClose={() => setActivePaymentJob(null)}
          job={activePaymentJob}
          onPaymentSuccess={() => {
            setActivePaymentJob(null);
            setRevision((r) => r + 1);
          }}
        />
      )}
    </PageContainer>
  );
}
