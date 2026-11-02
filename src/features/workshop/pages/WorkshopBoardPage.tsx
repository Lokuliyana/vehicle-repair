import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  Clock,
  User,
  Printer,
  Search,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import {
  WorkshopJobSheet,
  WorkshopFloorStatus,
  AuditLogEntry,
} from '@/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
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

interface KanbanColumn {
  status: WorkshopFloorStatus;
  title: string;
  borderColor: string;
  bgHeader: string;
}

const COLUMNS: KanbanColumn[] = [
  {
    status: 'DRAFT',
    title: 'Draft / Intake',
    borderColor: 'border-slate-300',
    bgHeader: 'bg-slate-100',
  },
  {
    status: 'PENDING_INSURANCE_APPROVAL',
    title: 'Insurance Pending',
    borderColor: 'border-amber-400',
    bgHeader: 'bg-amber-50',
  },
  {
    status: 'APPROVED_IN_PROGRESS',
    title: 'In Progress',
    borderColor: 'border-blue-500',
    bgHeader: 'bg-blue-50',
  },
  {
    status: 'WAITING_FOR_PARTS',
    title: 'Waiting for Parts',
    borderColor: 'border-purple-500',
    bgHeader: 'bg-purple-50',
  },
  {
    status: 'QUALITY_CHECK',
    title: 'Quality Check (QC)',
    borderColor: 'border-indigo-500',
    bgHeader: 'bg-indigo-50',
  },
  {
    status: 'READY_FOR_DELIVERY',
    title: 'Ready for Delivery',
    borderColor: 'border-emerald-500',
    bgHeader: 'bg-emerald-50',
  },
  {
    status: 'COMPLETED_DELIVERED',
    title: 'Completed / Delivered',
    borderColor: 'border-slate-500',
    bgHeader: 'bg-slate-200',
  },
];

const ALL_STATUSES: WorkshopFloorStatus[] = [
  'DRAFT',
  'PENDING_INSURANCE_APPROVAL',
  'APPROVED_IN_PROGRESS',
  'WAITING_FOR_PARTS',
  'QUALITY_CHECK',
  'READY_FOR_DELIVERY',
  'COMPLETED_DELIVERED',
];

export function WorkshopBoardPage() {
  const { role, user } = useAuth();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<WorkshopJobSheet[]>(() =>
    workshopJobRepository.getAllSync ? workshopJobRepository.getAllSync() : []
  );
  const [search, setSearch] = useState('');
  const [activePrintJob, setActivePrintJob] = useState<WorkshopJobSheet | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      const allJobs = await workshopJobRepository.getAll();
      setJobs(allJobs);
    } catch (err) {
      console.error('Error loading jobs for floor board:', err);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (jobs.length === 0) {
      workshopJobRepository
        .getAll()
        .then((allJobs) => {
          if (!isCancelled) setJobs(allJobs);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase().trim();
    return jobs.filter((job) => {
      const plate = (job.header?.vehicleNumber || '').toLowerCase();
      const jobNo = job.jobNumber.toLowerCase();
      const model = (job.header?.vehicleModel || '').toLowerCase();
      const make = (job.header?.vehicleMake || '').toLowerCase();
      const cust = (job.header?.customerInfo || '').toLowerCase();
      return (
        plate.includes(q) ||
        jobNo.includes(q) ||
        model.includes(q) ||
        make.includes(q) ||
        cust.includes(q)
      );
    });
  }, [jobs, search]);

  // 1-Click Status Advancement with Audit Logging
  const handleStatusChange = async (jobId: string, newStatus: WorkshopFloorStatus) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.floorStatus === newStatus) return;

    const fromState = job.floorStatus;
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor: user?.name || role,
      action: 'STATUS_ADVANCEMENT',
      fromState,
      toState: newStatus,
      comment: `Floor status advanced from ${fromState.replace(/_/g, ' ')} to ${newStatus.replace(/_/g, ' ')}.`,
    };

    const updatedAuditLogs = [...(job.auditLogs || []), auditEntry];

    // Optimistic UI update
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, floorStatus: newStatus, auditLogs: updatedAuditLogs }
          : j
      )
    );

    try {
      await workshopJobRepository.update(job.id, {
        floorStatus: newStatus,
        auditLogs: updatedAuditLogs,
      });
      toast({
        title: 'Floor Status Updated',
        message: `${job.jobNumber} moved to ${newStatus.replace(/_/g, ' ')}.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to advance floor status:', err);
      toast({
        title: 'Status Update Failed',
        message: 'Could not update floor status.',
        type: 'error',
      });
      loadJobs();
    }
  };

  // Toggle task completion from board with audit logging
  const handleToggleTask = async (jobId: string, lineId: string, currentStatus: boolean) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const updatedLines = job.lines.map((l) =>
      l.id === lineId ? { ...l, isCompleted: !currentStatus } : l
    );

    const targetDesc = job.lines.find((l) => l.id === lineId)?.description || 'Task';
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor: user?.name || role,
      action: 'TASK_COMPLETION',
      comment: `Task "${targetDesc}" marked as ${!currentStatus ? 'Completed' : 'Pending'}.`,
    };

    const updatedAuditLogs = [...(job.auditLogs || []), auditEntry];

    // Optimistic UI update
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, lines: updatedLines, auditLogs: updatedAuditLogs }
          : j
      )
    );

    try {
      await workshopJobRepository.update(job.id, {
        lines: updatedLines,
        auditLogs: updatedAuditLogs,
      });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      loadJobs();
    }
  };

  const handlePrintJobCard = (job: WorkshopJobSheet) => {
    setActivePrintJob({
      ...job,
      docStage: 'JOB_CARD',
    });
  };

  const isTechnician = role === 'TECHNICIAN';

  return (
    <div
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      data-testid="workshop-board-page"
    >
      {/* Title & Board Controls Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Kanban className="w-6 h-6 text-blue-600" />
            Workshop Floor Status Board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workshop floor orchestration across 7 operational milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate, job #, model..."
              className="pl-9 h-8 text-xs"
              data-testid="board-search-input"
            />
          </div>

          {!isTechnician && (
            <Link to="/workshop/sheet">
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 shadow-xs"
                data-testid="board-new-sheet-btn"
              >
                + New Repair Sheet
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const cardsInCol = filteredJobs.filter((j) => j.floorStatus === col.status);

          return (
            <div
              key={col.status}
              className={`w-80 shrink-0 bg-slate-100/80 rounded-xl p-3 border-t-4 ${col.borderColor} flex flex-col`}
              data-testid={`kanban-column-${col.status.toLowerCase()}`}
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg border border-slate-200 ${col.bgHeader}`}
              >
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  {col.title}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono font-bold bg-white border border-slate-300"
                >
                  {cardsInCol.length}
                </Badge>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[75vh] pr-0.5">
                {cardsInCol.length === 0 ? (
                  <div className="p-6 bg-white/60 border border-dashed border-slate-300 rounded-lg text-center text-[11px] text-slate-400 italic">
                    No vehicles in this status
                  </div>
                ) : (
                  cardsInCol.map((job) => {
                    const totalTasks = job.lines.length;
                    const completedTasks = job.lines.filter((l) => l.isCompleted).length;
                    const completionPct =
                      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                    const assignedTechs = Array.from(
                      new Set(job.lines.map((l) => l.assignedTechnician).filter(Boolean))
                    );
                    const isExpanded = expandedJobId === job.id;

                    return (
                      <div
                        key={job.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                        data-testid={`board-card-${job.id}`}
                      >
                        {/* Header: Job Number & Stage Badge & Selling Amount */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-600 font-bold">
                            {job.jobNumber}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                job.docStage === 'INVOICE'
                                  ? 'success'
                                  : job.docStage === 'JOB_CARD'
                                  ? 'info'
                                  : 'warning'
                              }
                              className="text-[9px] font-bold uppercase tracking-wider"
                            >
                              {job.docStage}
                            </Badge>

                            {/* Monetary Figure - STRICTLY REDACTED for TECHNICIAN */}
                            {!isTechnician && (
                              <span
                                className="font-bold text-slate-900 text-[11px]"
                                data-testid={`board-card-amount-${job.id}`}
                              >
                                {formatRs(job.financials?.grandTotalSalesRs || 0)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Vehicle & Customer Details */}
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs tracking-wide uppercase font-mono">
                            {job.header.vehicleNumber || 'Unassigned Plate'}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                            {[job.header.vehicleMake, job.header.vehicleModel]
                              .filter(Boolean)
                              .join(' ') || 'Model unspecified'}
                          </div>
                          {job.header.natureOfRepair && (
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {job.header.natureOfRepair}
                            </div>
                          )}
                        </div>

                        {/* Customer & Insurance tags */}
                        <div className="text-[10px] space-y-0.5 text-slate-500 pt-1 border-t border-slate-100">
                          {job.header.customerInfo && (
                            <div className="line-clamp-1">
                              <strong>Cust:</strong> {job.header.customerInfo}
                            </div>
                          )}
                          {job.header.insuranceName && (
                            <div className="line-clamp-1 text-blue-700 font-semibold">
                              <strong>Ins:</strong> {job.header.insuranceName}
                            </div>
                          )}
                        </div>

                        {/* Completion Days & Assigned Tech */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <div className="flex items-center gap-1 text-amber-800 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{job.header.daysForCompletion || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[130px]">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {assignedTechs.length > 0 ? assignedTechs.join(', ') : 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        {/* Task Completion Progress Indicator */}
                        <div className="space-y-1 pt-1.5 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[10px]">
                            <span
                              className="font-bold text-slate-700"
                              data-testid={`task-progress-${job.id}`}
                            >
                              {completedTasks}/{totalTasks} tasks completed
                            </span>
                            <span className="font-mono text-slate-500">{completionPct}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Interactive Task Checklist Expander */}
                        {totalTasks > 0 && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between w-full py-0.5 cursor-pointer"
                            >
                              <span>Floor Task Checklist</span>
                              <ChevronDown
                                className={cn(
                                  'w-3 h-3 transition-transform',
                                  isExpanded ? 'rotate-180' : ''
                                )}
                              />
                            </button>

                            {isExpanded && (
                              <div
                                className="space-y-1.5 mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]"
                                data-testid={`task-list-${job.id}`}
                              >
                                {job.lines.map((line) => (
                                  <label
                                    key={line.id}
                                    className="flex items-start gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={line.isCompleted}
                                      onChange={() =>
                                        handleToggleTask(job.id, line.id, line.isCompleted)
                                      }
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 mt-0.5 cursor-pointer shrink-0"
                                      data-testid={`board-task-check-${line.id}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={cn(
                                          'text-[10px] leading-tight line-clamp-2',
                                          line.isCompleted
                                            ? 'line-through text-slate-400'
                                            : 'text-slate-800 font-medium'
                                        )}
                                      >
                                        {line.description}
                                      </p>
                                      {line.assignedTechnician && (
                                        <span className="text-[9px] text-slate-400">
                                          Tech: {line.assignedTechnician}
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 1-Click Status Advancement Selector */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight shrink-0">
                            Move:
                          </label>
                          <select
                            value={job.floorStatus}
                            onChange={(e) =>
                              handleStatusChange(job.id, e.target.value as WorkshopFloorStatus)
                            }
                            className="text-[10px] font-semibold bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-slate-800 outline-none w-full cursor-pointer"
                            data-testid={`status-select-${job.id}`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Bottom Actions: View Sheet & Print Job Card */}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintJobCard(job)}
                            className="h-6 px-1.5 text-[10px] text-slate-600 hover:text-slate-900 gap-1"
                            title="Print Floor Job Card (Price-Redacted)"
                            data-testid={`print-jobcard-btn-${job.id}`}
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print Card</span>
                          </Button>

                          <Link
                            to={`/workshop/sheet/${job.id}`}
                            className="text-[10px] text-amber-600 hover:text-amber-800 font-bold inline-flex items-center gap-0.5"
                            data-testid={`view-sheet-btn-${job.id}`}
                          >
                            <span>Open Sheet</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price-Redacted Physical Job Card Print Modal */}
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
                    Physical Workshop Job Card Print Preview - {activePrintJob.jobNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Workshop floor physical dispatch sheet. Strictly price-redacted with task checklists & signatures.
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
                    Print Floor Card
                  </Button>
                  <DialogClose onClick={() => setActivePrintJob(null)} />
                </div>
              </div>
            </DialogHeader>

            {/* Render the printable component with docStage locked to JOB_CARD */}
            <div className="border border-slate-300 rounded shadow-inner p-2 sm:p-4 bg-slate-100 flex justify-center print:border-none print:shadow-none print:p-0 print:bg-transparent">
              <A4WorkshopPrint
                jobSheet={{
                  ...activePrintJob,
                  docStage: 'JOB_CARD',
                }}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
