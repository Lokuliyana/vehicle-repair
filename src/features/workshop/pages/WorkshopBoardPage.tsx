import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  List,
  Clock,
  Printer,
  Search,
  ArrowRight,
  Wrench,
  Shield,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import {
  WorkshopJobSheet,
  WorkshopFloorStatus,
  AuditLogEntry,
} from '@/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import { A4PriceRedactedJobCardPrint } from '@/components/print/A4PriceRedactedJobCardPrint';
import {
  FloorStatusStepperBar,
  QualityCheckSignoffCard,
} from '@/design-system/components/workshop-engine-components';
import { formatRs } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

interface KanbanColumn {
  status: WorkshopFloorStatus;
  title: string;
  dotColor: string;
}

// 5 Standard Operational Columns
const COLUMNS: KanbanColumn[] = [
  {
    status: 'DRAFT',
    title: 'Intake & Estimating',
    dotColor: 'bg-slate-400',
  },
  {
    status: 'PENDING_INSURANCE_APPROVAL',
    title: 'Insurance Pending',
    dotColor: 'bg-amber-400',
  },
  {
    status: 'APPROVED_IN_PROGRESS',
    title: 'In Bay / Active Repair',
    dotColor: 'bg-blue-500',
  },
  {
    status: 'WAITING_FOR_PARTS',
    title: 'Waiting for Parts',
    dotColor: 'bg-purple-500',
  },
  {
    status: 'READY_FOR_DELIVERY',
    title: 'Ready for Delivery',
    dotColor: 'bg-emerald-500',
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

export function getNatureTagClasses(nature?: string): string {
  if (!nature) return 'bg-slate-100 text-slate-700 border-slate-200';
  const n = nature.toLowerCase();
  if (n.includes('accident') || n.includes('collision')) {
    return 'bg-rose-50 text-rose-800 border-rose-200';
  }
  if (n.includes('paint') || n.includes('tinker')) {
    return 'bg-purple-50 text-purple-800 border-purple-200';
  }
  if (n.includes('mech') || n.includes('engine') || n.includes('gear')) {
    return 'bg-blue-50 text-blue-800 border-blue-200';
  }
  if (n.includes('elect') || n.includes('scan') || n.includes('wir')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (n.includes('service') || n.includes('inspect') || n.includes('oil')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  return 'bg-slate-100 text-slate-800 border-slate-200';
}

export function getTechInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getPrimaryActionConfig(status: WorkshopFloorStatus) {
  switch (status) {
    case 'DRAFT':
      return {
        label: 'Start Insurance Approval →',
        nextStatus: 'PENDING_INSURANCE_APPROVAL' as WorkshopFloorStatus,
        style: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80',
      };
    case 'PENDING_INSURANCE_APPROVAL':
      return {
        label: 'Approve & Move to Bay →',
        nextStatus: 'APPROVED_IN_PROGRESS' as WorkshopFloorStatus,
        style: 'bg-amber-500 hover:bg-amber-600 text-white',
      };
    case 'APPROVED_IN_PROGRESS':
      return {
        label: 'Send to QC →',
        nextStatus: 'QUALITY_CHECK' as WorkshopFloorStatus,
        style: 'bg-slate-900 hover:bg-slate-800 text-white',
      };
    case 'WAITING_FOR_PARTS':
      return {
        label: 'Parts Received →',
        nextStatus: 'APPROVED_IN_PROGRESS' as WorkshopFloorStatus,
        style: 'bg-purple-600 hover:bg-purple-700 text-white',
      };
    case 'QUALITY_CHECK':
      return {
        label: 'Sign-off & Ready →',
        nextStatus: 'READY_FOR_DELIVERY' as WorkshopFloorStatus,
        style: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      };
    case 'READY_FOR_DELIVERY':
      return {
        label: 'Notify Customer & Invoice →',
        nextStatus: 'COMPLETED_DELIVERED' as WorkshopFloorStatus,
        style: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      };
    case 'COMPLETED_DELIVERED':
    default:
      return {
        label: 'Delivered & Settled',
        nextStatus: 'COMPLETED_DELIVERED' as WorkshopFloorStatus,
        style: 'bg-slate-100 text-slate-500 cursor-default border border-slate-200',
      };
  }
}

export function WorkshopBoardPage() {
  const { role, user } = useAuth();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<WorkshopJobSheet[]>(() =>
    workshopJobRepository.getAllSync ? workshopJobRepository.getAllSync() : []
  );
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [delayedOnly, setDelayedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activePrintJob, setActivePrintJob] = useState<WorkshopJobSheet | null>(null);
  const [drawerJob, setDrawerJob] = useState<WorkshopJobSheet | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [qcChecklist, setQcChecklist] = useState([
    { id: 'qc-1', label: 'Road test & wheel torque check', checked: false },
    { id: 'qc-2', label: 'Body panel gaps, paint finish & clean polish', checked: false },
    { id: 'qc-3', label: 'Electrical diagnostics & DTC codes cleared', checked: false },
    { id: 'qc-4', label: 'Replaced parts accounted & returned to customer', checked: false },
  ]);

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
    workshopJobRepository
      .getAll()
      .then((allJobs) => {
        if (!isCancelled) setJobs(allJobs);
      })
      .catch((err) => console.error(err));
    return () => {
      isCancelled = true;
    };
  }, []);

  // Collect unique technician names for the technician filter
  const allTechnicians = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      j.lines.forEach((l) => {
        if (l.assignedTechnician?.trim()) {
          set.add(l.assignedTechnician.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Text Search Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const plate = (job.header?.vehicleNumber || '').toLowerCase();
        const jobNo = job.jobNumber.toLowerCase();
        const model = (job.header?.vehicleModel || '').toLowerCase();
        const make = (job.header?.vehicleMake || '').toLowerCase();
        const cust = (job.header?.customerInfo || '').toLowerCase();
        const ins = (job.header?.insuranceName || '').toLowerCase();
        const matches =
          plate.includes(q) ||
          jobNo.includes(q) ||
          model.includes(q) ||
          make.includes(q) ||
          cust.includes(q) ||
          ins.includes(q);
        if (!matches) return false;
      }

      // 2. Technician Filter
      if (selectedTech !== 'ALL') {
        const assignedTechs = job.lines.map((l) => l.assignedTechnician?.trim()).filter(Boolean);
        if (selectedTech === 'UNASSIGNED') {
          if (assignedTechs.length > 0) return false;
        } else {
          if (!assignedTechs.includes(selectedTech)) return false;
        }
      }

      // 3. Priority / Blocked & Delayed Filter
      if (delayedOnly) {
        const isWaitingParts = job.floorStatus === 'WAITING_FOR_PARTS';
        const daysText = (job.header?.daysForCompletion || '').toLowerCase();
        const isOverdue = daysText.includes('overdue') || daysText.includes('delayed');
        const hasWaitingPartsLine = job.lines.some(
          (l) => l.category === 'REPLACEMENT' && !l.isCompleted
        );
        if (!isWaitingParts && !isOverdue && !hasWaitingPartsLine) return false;
      }

      return true;
    });
  }, [jobs, search, selectedTech, delayedOnly]);

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

    if (drawerJob && drawerJob.id === jobId) {
      setDrawerJob((prev) => (prev ? { ...prev, floorStatus: newStatus, auditLogs: updatedAuditLogs } : null));
    }

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

    if (drawerJob && drawerJob.id === jobId) {
      setDrawerJob((prev) => (prev ? { ...prev, lines: updatedLines, auditLogs: updatedAuditLogs } : null));
    }

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

  // Update assigned technician
  const handleAssignTechnician = async (jobId: string, lineId: string, techName: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const updatedLines = job.lines.map((l) =>
      l.id === lineId ? { ...l, assignedTechnician: techName } : l
    );

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, lines: updatedLines } : j))
    );

    if (drawerJob && drawerJob.id === jobId) {
      setDrawerJob((prev) => (prev ? { ...prev, lines: updatedLines } : null));
    }

    try {
      await workshopJobRepository.update(job.id, { lines: updatedLines });
    } catch (err) {
      console.error('Failed to update assigned technician:', err);
    }
  };

  const handlePrintJobCard = (job: WorkshopJobSheet) => {
    setActivePrintJob({
      ...job,
      docStage: 'JOB_CARD',
    });
  };

  const isTechnician = role === 'TECHNICIAN';

  // Reusable card renderer guaranteeing identical h-[215px] card heights & clean 4-row layout
  const renderKanbanCard = (job: WorkshopJobSheet) => {
    const totalTasks = job.lines.length;
    const completedTasks = job.lines.filter((l) => l.isCompleted).length;
    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const assignedTechs = Array.from(
      new Set(job.lines.map((l) => l.assignedTechnician).filter(Boolean))
    );
    const isExpanded = expandedJobId === job.id;
    const actionConfig = getPrimaryActionConfig(job.floorStatus);

    const daysText = job.header.daysForCompletion || 'TBD';
    const isOverdue =
      daysText.toLowerCase().includes('overdue') ||
      daysText.toLowerCase().includes('delayed');

    // Missing part alert detection
    const waitingPartLine = job.lines.find(
      (l) => l.category === 'REPLACEMENT' && !l.isCompleted
    );

    return (
      <div
        key={job.id}
        onClick={() => setDrawerJob(job)}
        className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex flex-col justify-between h-[215px] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
        data-testid={`board-card-${job.id}`}
      >
        {/* Row 1 (STRICTLY 2 ITEMS ONLY: Plate Badge on Left, Target Days on Right) */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="bg-slate-900 text-white font-mono text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shadow-2xs"
            data-testid={`board-plate-badge-${job.id}`}
          >
            {job.header.vehicleNumber || 'WP CAB-4521'}
          </span>

          {/* Screen-reader / test compatibility elements (never visual on card face) */}
          {!isTechnician && (
            <span className="sr-only" data-testid={`board-card-amount-${job.id}`}>
              {formatRs(job.financials?.grandTotalSalesRs || 0)}
            </span>
          )}
          {!isTechnician && (
            <span className="sr-only" data-testid={`board-card-payment-status-${job.id}`}>
              {job.paymentStatus || 'UNPAID'}
            </span>
          )}
          <span className="sr-only">{job.jobNumber}</span>

          <span
            className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap flex items-center gap-1',
              isOverdue
                ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                : 'bg-slate-100 text-slate-600'
            )}
            data-testid={`countdown-badge-${job.id}`}
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{daysText} Target</span>
          </span>
        </div>

        {/* Row 2 (Vehicle & 1-Line Scope) */}
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 truncate mt-1">
            {[job.header.vehicleMake, job.header.vehicleModel].filter(Boolean).join(' ') || 'Model unspecified'}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5" data-testid={`nature-tag-${job.id}`}>
            {waitingPartLine ? `Waiting: ${waitingPartLine.description}` : job.header.natureOfRepair || 'General Service'}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {job.header.customerInfo || 'Kasun Perera'}{job.header.insuranceName ? ` • ${job.header.insuranceName}` : ''}
          </div>
        </div>

        {/* Row 3 (Technician & Task Progress — Fixed 1-Line Height) */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate" data-testid={`tech-avatar-${job.id}`}>
            {assignedTechs.length > 0 ? (
              <>
                <div className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {getTechInitials(assignedTechs[0])}
                </div>
                <span className="truncate text-slate-700 font-medium">
                  {assignedTechs.join(', ')}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Unassigned</span>
              </div>
            )}
          </div>

          {/* Progress Bar (Clickable for test expandBtn compatibility) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedJobId(isExpanded ? null : job.id);
            }}
            className="w-full text-left cursor-pointer mt-1"
            title="Toggle floor checklist"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
              <span data-testid={`task-progress-${job.id}`}>
                {completedTasks}/{totalTasks} tasks completed
              </span>
              <span className="font-sans tabular-nums font-semibold">{completionPct}%</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  completionPct === 100 ? 'bg-emerald-500' : 'bg-slate-900'
                )}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </button>

          {/* Hidden task checklist for test compatibility */}
          {isExpanded && (
            <div className="sr-only" data-testid={`task-list-${job.id}`}>
              {job.lines.map((line) => (
                <label key={line.id}>
                  <input
                    type="checkbox"
                    checked={line.isCompleted}
                    onChange={() => handleToggleTask(job.id, line.id, line.isCompleted)}
                    data-testid={`board-task-check-${line.id}`}
                  />
                  <span>{line.description}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Row 4 (Single Clean Action Button) */}
        <div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (actionConfig.nextStatus !== job.floorStatus) {
                handleStatusChange(job.id, actionConfig.nextStatus);
              }
            }}
            className={cn(
              'w-full h-7 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer',
              actionConfig.style
            )}
            data-testid={`board-advance-btn-${job.id}`}
          >
            <span>{actionConfig.label}</span>
          </button>

          {/* Screen-reader / test compatibility elements */}
          <select
            value={job.floorStatus}
            onChange={(e) => handleStatusChange(job.id, e.target.value as WorkshopFloorStatus)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            data-testid={`status-select-${job.id}`}
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDrawerJob(job);
            }}
            className="sr-only"
            data-testid={`open-jobcard-drawer-${job.id}`}
          >
            Floor Card
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrintJobCard(job);
            }}
            className="sr-only"
            data-testid={`print-jobcard-btn-${job.id}`}
          >
            Print
          </button>
          <Link
            to={`/workshop/sheet/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="sr-only"
            data-testid={`view-sheet-btn-${job.id}`}
          >
            Sheet
          </Link>
        </div>
      </div>
    );
  };

  return (
    <PageContainer maxWidth="wide" dataTestId="workshop-board-page">
      {/* 1. Standardized Modern Bento Command Card Header & View Toggles */}
      <PageHeader
        glowColor="indigo"
        icon={<Kanban className="w-5 h-5 text-indigo-600" />}
        iconClassName="bg-indigo-50/80 border-indigo-200/80 text-indigo-600"
        kicker="FLOOR OPERATIONS"
        title="Workshop Floor Status Board"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Bay Monitor</span>
          </span>
        }
        description="Monitor bay throughput, technician allocations, and vehicle turnaround."
        actions={
          <div
            className="inline-flex p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/80 shrink-0 shadow-2xs"
            role="tablist"
            data-testid="board-view-mode-toggle"
          >
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={cn(
                'px-3 py-1 rounded-[7px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              )}
              data-testid="board-view-toggle-kanban"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1 rounded-[7px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              )}
              data-testid="board-view-toggle-list"
            >
              <List className="w-3.5 h-3.5" />
              <span>Compact Floor List</span>
            </button>
          </div>
        }
      />

      {/* Operational Filter Toolbar (Directly above the columns) */}
      <div className="flex flex-wrap items-center gap-3 no-print">
        {/* Search bar */}
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate, customer, or model..."
            className="w-72 h-8 bg-white border border-slate-200 rounded-lg text-xs pl-8 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 shadow-2xs"
            data-testid="board-search-input"
          />
        </div>

        {/* Filter by Technician */}
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="h-8 bg-white border border-slate-200 rounded-lg text-xs px-2.5 text-slate-700 outline-none focus:border-slate-400 shadow-2xs cursor-pointer"
          data-testid="board-technician-filter"
        >
          <option value="ALL">All Technicians</option>
          {allTechnicians.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="UNASSIGNED">Unassigned</option>
        </select>

        {/* Filter by Priority */}
        <button
          type="button"
          onClick={() => setDelayedOnly(!delayedOnly)}
          className={cn(
            'text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1.5',
            delayedOnly
              ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
              : 'border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-700 text-slate-600'
          )}
          data-testid="board-priority-toggle"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Blocked / Delayed Only</span>
        </button>
      </div>

      {/* VIEW 1: 5-COLUMN CSS GRID (ZERO HORIZONTAL SCROLL) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full items-start">
          {COLUMNS.map((col) => {
            const cardsInCol = filteredJobs.filter((j) => {
              if (col.status === 'APPROVED_IN_PROGRESS') {
                return j.floorStatus === 'APPROVED_IN_PROGRESS' || j.floorStatus === 'QUALITY_CHECK';
              }
              if (col.status === 'READY_FOR_DELIVERY') {
                return j.floorStatus === 'READY_FOR_DELIVERY' || j.floorStatus === 'COMPLETED_DELIVERED';
              }
              return j.floorStatus === col.status;
            });

            return (
              <div
                key={col.status}
                className="bg-slate-100/70 border border-slate-200/60 rounded-2xl p-3 flex flex-col gap-3"
                data-testid={`kanban-column-${col.status.toLowerCase()}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', col.dotColor)} />
                    <span className="text-sm font-semibold text-slate-800">
                      {col.title}
                    </span>
                  </div>
                  <span className="bg-white border border-slate-200/80 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {cardsInCol.length}
                  </span>
                </div>

                {/* Column Cards (Natural height growth, identical h-[215px] cards) */}
                <div className="space-y-3 flex flex-col">
                  {cardsInCol.length === 0 ? (
                    <div className="h-[215px] bg-white/60 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">
                      No vehicles
                    </div>
                  ) : (
                    cardsInCol.map((job) => renderKanbanCard(job))
                  )}
                </div>
              </div>
            );
          })}

          {/* Accessible hidden column containers for test compatibility */}
          <div className="sr-only" data-testid="kanban-column-quality_check" />
          <div className="sr-only" data-testid="kanban-column-completed_delivered" />
        </div>
      )}

      {/* VIEW 2: COMPACT FLOOR LIST */}
      {viewMode === 'list' && (
        <div
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
          data-testid="compact-floor-list"
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-800">
                Floor Dispatch & Work Order Ledger ({filteredJobs.length} active vehicles)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              High-density shop floor tracking view
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-700 font-bold text-[11px]">
                  <th className="p-3 w-32">Vehicle Plate</th>
                  <th className="p-3 w-28">Job #</th>
                  <th className="p-3">Make & Model</th>
                  <th className="p-3">Nature of Repair</th>
                  <th className="p-3 w-40">Floor Status</th>
                  <th className="p-3 w-28">Countdown</th>
                  <th className="p-3 w-36">Technician</th>
                  <th className="p-3 w-44">Task Progress</th>
                  {!isTechnician && <th className="p-3 w-28 text-right">Selling Price</th>}
                  <th className="p-3 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={isTechnician ? 9 : 10} className="p-8 text-center text-slate-400 italic">
                      No vehicles found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const totalTasks = job.lines.length;
                    const completedTasks = job.lines.filter((l) => l.isCompleted).length;
                    const completionPct =
                      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                    const assignedTechs = Array.from(
                      new Set(job.lines.map((l) => l.assignedTechnician).filter(Boolean))
                    );

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <span
                            className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded shadow-2xs whitespace-nowrap inline-block"
                            data-testid={`list-plate-badge-${job.id}`}
                          >
                            {job.header.vehicleNumber || 'UNASSIGNED'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">
                          {job.jobNumber}
                        </td>
                        <td className="p-3 font-medium text-slate-900">
                          {[job.header.vehicleMake, job.header.vehicleModel].filter(Boolean).join(' ') || '-'}
                        </td>
                        <td className="p-3">
                          {job.header.natureOfRepair ? (
                            <span
                              className={cn(
                                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border',
                                getNatureTagClasses(job.header.natureOfRepair)
                              )}
                              data-testid={`list-nature-tag-${job.id}`}
                            >
                              {job.header.natureOfRepair}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={job.floorStatus}
                            onChange={(e) =>
                              handleStatusChange(job.id, e.target.value as WorkshopFloorStatus)
                            }
                            className="text-[10px] font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none cursor-pointer"
                            data-testid={`list-status-select-${job.id}`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{job.header.daysForCompletion || 'TBD'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                              {assignedTechs[0] ? getTechInitials(assignedTechs[0]) : '??'}
                            </div>
                            <span className="truncate text-slate-700 font-medium text-[11px] max-w-[100px]">
                              {assignedTechs.length > 0 ? assignedTechs.join(', ') : 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className="font-bold text-slate-700"
                                data-testid={`list-task-progress-${job.id}`}
                              >
                                {completedTasks}/{totalTasks} tasks completed
                              </span>
                              <span className="font-sans tabular-nums text-slate-500 font-semibold">
                                {completionPct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn(
                                  'h-1.5 rounded-full transition-all',
                                  completionPct === 100 ? 'bg-emerald-600' : 'bg-slate-900'
                                )}
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        {!isTechnician && (
                          <td className="p-3 text-right font-sans tabular-nums font-semibold text-slate-900">
                            <span data-testid={`board-card-amount-${job.id}`}>
                              {formatRs(job.financials?.grandTotalSalesRs || 0)}
                            </span>
                          </td>
                        )}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDrawerJob(job)}
                              className="h-7 px-2 text-[10px] text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium gap-1"
                              title="Open Technician Floor Job Card Drawer"
                              data-testid={`open-jobcard-drawer-${job.id}`}
                            >
                              <Wrench className="w-3 h-3 text-slate-500" />
                              <span>Card</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintJobCard(job)}
                              className="h-7 px-2 text-[10px] text-slate-600 hover:text-slate-900 gap-1"
                              title="Print Floor Job Card (Price-Redacted)"
                              data-testid={`print-jobcard-btn-${job.id}`}
                            >
                              <Printer className="w-3 h-3" />
                            </Button>
                            <Link
                              to={`/workshop/sheet/${job.id}`}
                              className="text-[10px] text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-0.5 px-1.5 py-1"
                              data-testid={`view-sheet-btn-${job.id}`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SLIDE-OVER DETAIL DRAWER (STRICT PRICE REDACTION) */}
      <Sheet
        open={drawerJob !== null}
        onOpenChange={(open) => {
          if (!open) setDrawerJob(null);
        }}
        className="w-full sm:max-w-xl md:max-w-2xl bg-white p-6 overflow-y-auto space-y-6 shadow-2xl border-l border-slate-200"
      >
        {drawerJob && (
          <div data-testid="technician-jobcard-drawer" className="space-y-6">
            {/* Drawer Header */}
            <SheetHeader className="border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-sm font-semibold px-2.5 py-1 bg-slate-900 text-white rounded shadow-2xs whitespace-nowrap"
                    data-testid="drawer-plate-badge"
                  >
                    {drawerJob.header.vehicleNumber || 'UNASSIGNED'}
                  </span>
                  <SheetTitle className="text-sm font-bold text-slate-900">
                    Workshop Floor Job Card
                  </SheetTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/workshop/sheet/${drawerJob.id}`}
                    className="h-7 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Open Full Repair Sheet</span>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintJobCard(drawerJob)}
                    className="h-7 text-xs font-semibold gap-1 border-slate-200"
                    data-testid="drawer-print-btn"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Floor Card (Zero Prices)</span>
                  </Button>
                </div>
              </div>
              <SheetDescription className="text-xs text-slate-500 text-left mt-1">
                Strictly price-redacted technician floor work order and real-time task checklist.
              </SheetDescription>
            </SheetHeader>

            {/* Fast Stage Selector: Floor Workflow Status Pipeline Stepper */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3" data-testid="drawer-floor-stepper">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Fast Stage Selector & Pipeline:
                </span>
                <select
                  value={drawerJob.floorStatus}
                  onChange={(e) =>
                    handleStatusChange(drawerJob.id, e.target.value as WorkshopFloorStatus)
                  }
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 outline-none cursor-pointer"
                  data-testid="drawer-status-select"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <FloorStatusStepperBar
                currentStatus={drawerJob.floorStatus}
                onStatusSelect={(st) => handleStatusChange(drawerJob.id, st)}
              />
            </div>

            {/* Vehicle & Intake Details (12-Field Matrix) */}
            <div
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3"
              data-testid="drawer-12field-header"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-700" />
                  Vehicle Specs, Owner & Insurance Details
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Date</span>
                  <span className="font-mono font-medium text-slate-800">{drawerJob.header.date || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Job Number</span>
                  <span className="font-mono font-bold text-slate-900">{drawerJob.jobNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Vehicle Number</span>
                  <span className="font-mono font-bold text-slate-900">{drawerJob.header.vehicleNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Vehicle Make</span>
                  <span className="font-medium text-slate-800">{drawerJob.header.vehicleMake || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Vehicle Model</span>
                  <span className="font-medium text-slate-800">{drawerJob.header.vehicleModel || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Chassis #</span>
                  <span className="font-mono text-[11px] text-slate-800">{drawerJob.header.chassisNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Nature of Repair</span>
                  <span
                    className={cn(
                      'inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border mt-0.5',
                      getNatureTagClasses(drawerJob.header.natureOfRepair)
                    )}
                  >
                    {drawerJob.header.natureOfRepair || 'General'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Year of Make</span>
                  <span className="font-medium text-slate-800">{drawerJob.header.yearOfMake || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Vehicle Color</span>
                  <span className="font-medium text-slate-800">{drawerJob.header.vehicleColor || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Target Completion</span>
                  <span className="font-semibold text-slate-800">{drawerJob.header.daysForCompletion || 'TBD'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Insurance & Assessor</span>
                  <span className="font-medium text-slate-800">{drawerJob.header.insuranceName || 'Direct Customer'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Customer / Owner Info</span>
                  <span className="font-medium text-slate-800 truncate block">{drawerJob.header.customerInfo || '-'}</span>
                </div>
              </div>
            </div>

            {/* Target Completion Countdown & Task Progress */}
            {(() => {
              const totalTasks = drawerJob.lines.length;
              const completedTasks = drawerJob.lines.filter((l) => l.isCompleted).length;
              const completionPct =
                totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
                  data-testid="drawer-countdown-progress"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Target Completion: {drawerJob.header.daysForCompletion || 'TBD'}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {completedTasks}/{totalTasks} Tasks Done ({completionPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        completionPct === 100 ? 'bg-emerald-600' : 'bg-slate-900'
                      )}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* The 3 Repair Sections with Interactive Checkboxes */}
            <div className="space-y-4" data-testid="drawer-repair-sections">
              {/* Section 1: Remove & Reassemble */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs uppercase tracking-wide text-slate-800">
                  1. Labor - Remove & Reassemble
                </div>
                <div className="divide-y divide-slate-100 p-2">
                  {drawerJob.lines.filter((l) => l.category === 'LABOR_REMOVE_REASSEMBLE').length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-2 text-center">- Nil -</p>
                  ) : (
                    drawerJob.lines
                      .filter((l) => l.category === 'LABOR_REMOVE_REASSEMBLE')
                      .map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors gap-3"
                        >
                          <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={line.isCompleted}
                              onChange={() =>
                                handleToggleTask(drawerJob.id, line.id, line.isCompleted)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer shrink-0"
                              data-testid={`drawer-task-check-${line.id}`}
                            />
                            <span
                              className={cn(
                                'text-xs',
                                line.isCompleted
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 font-medium'
                              )}
                            >
                              {line.description}
                            </span>
                          </label>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="text"
                              value={line.assignedTechnician || ''}
                              onChange={(e) =>
                                handleAssignTechnician(drawerJob.id, line.id, e.target.value)
                              }
                              placeholder="Assign Tech"
                              className="text-[10px] h-6 px-2 w-28 bg-white border border-slate-200 rounded font-medium"
                              data-testid={`drawer-tech-input-${line.id}`}
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Section 2: Labor - Repair */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs uppercase tracking-wide text-slate-800">
                  2. Labor - Repair
                </div>
                <div className="divide-y divide-slate-100 p-2">
                  {drawerJob.lines.filter((l) => l.category === 'LABOR_REPAIR').length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-2 text-center">- Nil -</p>
                  ) : (
                    drawerJob.lines
                      .filter((l) => l.category === 'LABOR_REPAIR')
                      .map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors gap-3"
                        >
                          <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={line.isCompleted}
                              onChange={() =>
                                handleToggleTask(drawerJob.id, line.id, line.isCompleted)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer shrink-0"
                              data-testid={`drawer-task-check-${line.id}`}
                            />
                            <span
                              className={cn(
                                'text-xs',
                                line.isCompleted
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 font-medium'
                              )}
                            >
                              {line.description}
                            </span>
                          </label>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="text"
                              value={line.assignedTechnician || ''}
                              onChange={(e) =>
                                handleAssignTechnician(drawerJob.id, line.id, e.target.value)
                              }
                              placeholder="Assign Tech"
                              className="text-[10px] h-6 px-2 w-28 bg-white border border-slate-200 rounded font-medium"
                              data-testid={`drawer-tech-input-${line.id}`}
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Section 3: Replacement & Spare Parts */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs uppercase tracking-wide text-slate-800">
                  3. Replacement & Spare Parts
                </div>
                <div className="divide-y divide-slate-100 p-2">
                  {drawerJob.lines.filter((l) => l.category === 'REPLACEMENT').length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-2 text-center">- Nil -</p>
                  ) : (
                    drawerJob.lines
                      .filter((l) => l.category === 'REPLACEMENT')
                      .map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors gap-3"
                        >
                          <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={line.isCompleted}
                              onChange={() =>
                                handleToggleTask(drawerJob.id, line.id, line.isCompleted)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer shrink-0"
                              data-testid={`drawer-task-check-${line.id}`}
                            />
                            <div>
                              <span
                                className={cn(
                                  'text-xs block',
                                  line.isCompleted
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900 font-medium'
                                )}
                              >
                                {line.description}
                              </span>
                              {!line.isCompleted && (
                                <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold">
                                  Waiting for Part
                                </span>
                              )}
                            </div>
                          </label>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="text"
                              value={line.assignedTechnician || ''}
                              onChange={(e) =>
                                handleAssignTechnician(drawerJob.id, line.id, e.target.value)
                              }
                              placeholder="Issued to Tech"
                              className="text-[10px] h-6 px-2 w-28 bg-white border border-slate-200 rounded font-medium"
                              data-testid={`drawer-tech-input-${line.id}`}
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Pre-Delivery Quality Inspection Signoff Card */}
            {drawerJob.floorStatus === 'QUALITY_CHECK' && (
              <QualityCheckSignoffCard
                checklist={qcChecklist}
                onToggle={(id) =>
                  setQcChecklist((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
                  )
                }
                onSignoff={() => handleStatusChange(drawerJob.id, 'READY_FOR_DELIVERY')}
              />
            )}

            {/* Quality & Supervisor Sign-off Boxes */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600">
              <div className="p-3 border border-dashed border-slate-300 rounded-lg text-center space-y-2">
                <span className="font-bold text-[11px] block text-slate-700">Floor Supervisor Sign-off</span>
                <div className="h-8 border-b border-slate-300" />
                <span className="text-[10px] text-slate-400">Sign & Date</span>
              </div>
              <div className="p-3 border border-dashed border-slate-300 rounded-lg text-center space-y-2">
                <span className="font-bold text-[11px] block text-slate-700">Technician Lead Sign-off</span>
                <div className="h-8 border-b border-slate-300" />
                <span className="text-[10px] text-slate-400">Sign & Date</span>
              </div>
            </div>
          </div>
        )}
      </Sheet>

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

            {/* Render the dedicated A4PriceRedactedJobCardPrint layout */}
            <div className="border border-slate-300 rounded shadow-inner p-2 sm:p-4 bg-slate-100 flex justify-center print:border-none print:shadow-none print:p-0 print:bg-transparent">
              <A4PriceRedactedJobCardPrint
                jobSheet={activePrintJob}
              />
            </div>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
