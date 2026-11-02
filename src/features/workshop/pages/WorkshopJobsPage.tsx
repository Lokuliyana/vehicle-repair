import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Share2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Car,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from '@/types';
import { formatRs } from '@/utils/currency';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { buildWhatsAppShareUrl } from '@/utils/whatsapp';
import { cn } from '@/utils/cn';

export function WorkshopJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const queryParam = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryParam);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [revision, setRevision] = useState(0);
  const [activePrintJob, setActivePrintJob] = useState<WorkshopJobSheet | null>(null);

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

  const handleWhatsAppShare = (job: WorkshopJobSheet) => {
    const url = buildWhatsAppShareUrl(job);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      data-testid="workshop-jobs-page"
    >
      {/* Title & Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-600" />
            Workshop Jobs & Collision Estimates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable repository for Quotations, Estimates, Job Cards, and Invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetSeeds}
            className="text-xs h-8 text-slate-600 gap-1 border-slate-300"
            title="Reset to default collision seeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Seeds</span>
          </Button>

          <Link to="/workshop/sheet">
            <Button
              variant="default"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
              data-testid="create-new-sheet-btn"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Repair Sheet</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by vehicle plate (e.g. CAB-4521), Job #, Customer, or Insurance..."
              className="pl-9 h-9 text-xs"
              data-testid="jobs-search-input"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Floor Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 font-medium text-slate-800 outline-none cursor-pointer"
              data-testid="jobs-status-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_INSURANCE_APPROVAL">Pending Insurance</option>
              <option value="APPROVED_IN_PROGRESS">Approved / In Progress</option>
              <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="COMPLETED_DELIVERED">Completed / Delivered</option>
            </select>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {[
            { label: 'All Documents', value: 'ALL' },
            { label: 'Quotations', value: 'QUOTATION' },
            { label: 'Estimates', value: 'ESTIMATE' },
            { label: 'Job Cards', value: 'JOB_CARD' },
            { label: 'Invoices', value: 'INVOICE' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStage(tab.value)}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                filterStage === tab.value
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              )}
              data-testid={`stage-tab-${tab.value.toLowerCase()}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden no-print">
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
                <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs">
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
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-3">Job Details</th>
                  <th className="py-2.5 px-3">Vehicle Details</th>
                  <th className="py-2.5 px-3">Customer & Insurance</th>
                  <th className="py-2.5 px-3">Stage & Status</th>
                  <th className="py-2.5 px-3 text-right">Amount (Rs.)</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/80 transition-colors"
                    data-testid={`job-row-${job.id}`}
                  >
                    {/* Job Details */}
                    <td className="py-3 px-3 align-top">
                      <div className="font-bold font-mono text-slate-900">{job.jobNumber}</div>
                      <div className="text-[11px] text-slate-400">{job.header.date}</div>
                    </td>

                    {/* Vehicle Details */}
                    <td className="py-3 px-3 align-top">
                      <div className="font-bold text-slate-900 uppercase font-mono tracking-wide">
                        {job.header.vehicleNumber || '-'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {[job.header.vehicleMake, job.header.vehicleModel].filter(Boolean).join(' ') ||
                          '-'}
                      </div>
                      {job.header.natureOfRepair && (
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                          {job.header.natureOfRepair}
                        </div>
                      )}
                    </td>

                    {/* Customer & Insurance */}
                    <td className="py-3 px-3 align-top">
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-xs">
                        {job.header.customerInfo || 'Walk-in Customer'}
                      </div>
                      <div className="text-[11px] text-blue-700 font-semibold line-clamp-1 max-w-xs">
                        {job.header.insuranceName || 'Direct / Cash'}
                      </div>
                    </td>

                    {/* Stage & Status Badges */}
                    <td className="py-3 px-3 align-top space-y-1">
                      <div>
                        <Badge
                          variant={
                            job.docStage === 'INVOICE'
                              ? 'success'
                              : job.docStage === 'JOB_CARD'
                              ? 'info'
                              : 'warning'
                          }
                          className="font-bold uppercase tracking-wider text-[9px]"
                        >
                          {job.docStage}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {job.floorStatus.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 align-top text-right font-black text-slate-900">
                      {formatRs(job.financials?.grandTotalSalesRs || 0)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 align-top text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/workshop/sheet/${job.id}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-slate-700 border-slate-300 hover:bg-slate-100"
                            title="Open / Edit Repair Sheet"
                            data-testid={`edit-job-btn-${job.id}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setActivePrintJob(job)}
                          className="h-7 w-7 text-slate-700 border-slate-300 hover:bg-slate-100"
                          title="Print A4 Estimate / Job Sheet"
                          data-testid={`print-job-btn-${job.id}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleWhatsAppShare(job)}
                          className="h-7 w-7 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          title="Share via WhatsApp"
                          data-testid={`whatsapp-job-btn-${job.id}`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteJob(job.id, job.jobNumber)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600"
                          title="Delete Job"
                          data-testid={`delete-job-btn-${job.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
}
