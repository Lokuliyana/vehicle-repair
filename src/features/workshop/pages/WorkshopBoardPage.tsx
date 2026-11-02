import { Link } from 'react-router-dom';
import { Kanban, Clock, User, ArrowRight } from 'lucide-react';
import { WorkshopFloorStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface KanbanColumn {
  status: WorkshopFloorStatus;
  title: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { status: 'DRAFT', title: 'Draft / Intake', color: 'border-slate-300' },
  { status: 'PENDING_INSURANCE_APPROVAL', title: 'Insurance Pending', color: 'border-amber-400' },
  { status: 'APPROVED_IN_PROGRESS', title: 'In Progress', color: 'border-blue-400' },
  { status: 'WAITING_FOR_PARTS', title: 'Waiting for Parts', color: 'border-purple-400' },
  { status: 'QUALITY_CHECK', title: 'Quality Check (QC)', color: 'border-indigo-400' },
  { status: 'READY_FOR_DELIVERY', title: 'Ready for Delivery', color: 'border-emerald-400' },
  { status: 'COMPLETED_DELIVERED', title: 'Delivered', color: 'border-slate-400' },
];

interface BoardCard {
  id: string;
  jobNumber: string;
  vehicleNumber: string;
  model: string;
  status: WorkshopFloorStatus;
  daysRemaining: string;
  technician: string;
  stage: string;
}

const MOCK_BOARD_CARDS: BoardCard[] = [
  {
    id: 'b1',
    jobNumber: 'JOB-2026-0042',
    vehicleNumber: 'WP CAB-4521',
    model: 'Toyota Corolla Axio',
    status: 'APPROVED_IN_PROGRESS',
    daysRemaining: '3 Days',
    technician: 'Nimal Bandara',
    stage: 'ESTIMATE',
  },
  {
    id: 'b2',
    jobNumber: 'JOB-2026-0041',
    vehicleNumber: 'WP CAR-1234',
    model: 'Honda Fit GP5',
    status: 'WAITING_FOR_PARTS',
    daysRemaining: '2 Days',
    technician: 'Sunil Shantha',
    stage: 'JOB_CARD',
  },
  {
    id: 'b3',
    jobNumber: 'JOB-2026-0040',
    vehicleNumber: 'SP CAA-8822',
    model: 'Suzuki Wagon R',
    status: 'READY_FOR_DELIVERY',
    daysRemaining: '0 Days',
    technician: 'Kamal Silva',
    stage: 'INVOICE',
  },
  {
    id: 'b4',
    jobNumber: 'JOB-2026-0043',
    vehicleNumber: 'WP KI-9012',
    model: 'Nissan Leaf ZE1',
    status: 'PENDING_INSURANCE_APPROVAL',
    daysRemaining: '5 Days',
    technician: 'Unassigned',
    stage: 'ESTIMATE',
  },
];

export function WorkshopBoardPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="workshop-board-page">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Kanban className="w-6 h-6 text-blue-500" />
            Workshop Floor Status Board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time floor tracking: In Progress, Parts Awaiting, QC, and Customer Delivery.
          </p>
        </div>

        <Link to="/workshop/sheet/demo">
          <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
            + New Sheet
          </Button>
        </Link>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const cardsInCol = MOCK_BOARD_CARDS.filter((c) => c.status === col.status);

          return (
            <div
              key={col.status}
              className={`w-72 shrink-0 bg-slate-200/60 rounded-xl p-3 border-t-4 ${col.color}`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <Badge variant="secondary" className="text-[10px] bg-slate-300">
                  {cardsInCol.length}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {cardsInCol.length === 0 ? (
                  <div className="p-4 bg-white/50 border border-dashed border-slate-300 rounded-lg text-center text-[11px] text-slate-400 italic">
                    No active vehicles
                  </div>
                ) : (
                  cardsInCol.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] text-slate-500 font-semibold">
                          {card.jobNumber}
                        </span>
                        <Badge variant="outline" className="text-[9px]">
                          {card.stage}
                        </Badge>
                      </div>

                      <div className="font-bold text-slate-900 text-xs">{card.vehicleNumber}</div>
                      <div className="text-[11px] text-slate-500 mb-2">{card.model}</div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{card.technician}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-amber-700">
                          <Clock className="w-3 h-3" />
                          <span>{card.daysRemaining}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        <Link
                          to="/workshop/sheet/demo"
                          className="text-[10px] text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-0.5"
                        >
                          View Sheet <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
