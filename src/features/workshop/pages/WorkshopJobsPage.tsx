import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DocumentStage, WorkshopFloorStatus } from '@/types';
import { formatRs } from '@/utils/currency';

interface MockJobRow {
  id: string;
  jobNumber: string;
  date: string;
  vehicleNumber: string;
  vehicleModel: string;
  customerName: string;
  insuranceName: string;
  stage: DocumentStage;
  floorStatus: WorkshopFloorStatus;
  amountRs: number;
}

const MOCK_JOBS: MockJobRow[] = [
  {
    id: 'job-1',
    jobNumber: 'JOB-2026-0042',
    date: '2026-11-02',
    vehicleNumber: 'WP CAB-4521',
    vehicleModel: 'Toyota Corolla Axio',
    customerName: 'Kasun Perera',
    insuranceName: 'SLIC Insurance',
    stage: 'ESTIMATE',
    floorStatus: 'APPROVED_IN_PROGRESS',
    amountRs: 85000,
  },
  {
    id: 'job-2',
    jobNumber: 'JOB-2026-0041',
    date: '2026-11-01',
    vehicleNumber: 'WP CAR-1234',
    vehicleModel: 'Honda Fit Hybrid',
    customerName: 'Sunil Silva',
    insuranceName: 'Ceylinco General Insurance',
    stage: 'JOB_CARD',
    floorStatus: 'WAITING_FOR_PARTS',
    amountRs: 28000,
  },
  {
    id: 'job-3',
    jobNumber: 'JOB-2026-0040',
    date: '2026-10-31',
    vehicleNumber: 'SP CAA-8822',
    vehicleModel: 'Suzuki Wagon R Stingray',
    customerName: 'Mahesh Bandara',
    insuranceName: 'Fairfirst Insurance',
    stage: 'INVOICE',
    floorStatus: 'READY_FOR_DELIVERY',
    amountRs: 42500,
  },
  {
    id: 'job-4',
    jobNumber: 'JOB-2026-0039',
    date: '2026-10-30',
    vehicleNumber: 'WP KQ-7612',
    vehicleModel: 'Nissan Sunny FB15',
    customerName: 'Ruwan Chamara',
    insuranceName: 'Direct Cash Customer',
    stage: 'QUOTATION',
    floorStatus: 'DRAFT',
    amountRs: 19500,
  },
];

export function WorkshopJobsPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryParam);
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesSearch =
      job.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      job.customerName.toLowerCase().includes(search.toLowerCase()) ||
      job.insuranceName.toLowerCase().includes(search.toLowerCase());
    const matchesStage = filterStage === 'ALL' || job.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="workshop-jobs-page">
      {/* Title & Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            Workshop Repair Sheets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Single-document lifecycle: Quotation → Estimate → Job Card → Invoice
          </p>
        </div>

        <Link to="/workshop/sheet/demo">
          <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5" data-testid="jobs-new-sheet-btn">
            <Plus className="w-4 h-4" />
            + New Repair Sheet
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by plate, job # or customer..."
            className="pl-9 h-9 text-xs"
            data-testid="jobs-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'QUOTATION', 'ESTIMATE', 'JOB_CARD', 'INVOICE'].map((stage) => (
            <button
              key={stage}
              onClick={() => setFilterStage(stage)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterStage === stage
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Job Sheets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-slate-200 uppercase tracking-wider text-[10px] font-bold">
              <th className="p-3">Job #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Customer & Insurance</th>
              <th className="p-3">Stage</th>
              <th className="p-3">Floor Status</th>
              <th className="p-3 text-right">Selling Total</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No repair sheets matched your search filter.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{job.jobNumber}</td>
                  <td className="p-3 text-slate-600">{job.date}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{job.vehicleNumber}</div>
                    <div className="text-[11px] text-slate-500">{job.vehicleModel}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{job.customerName}</div>
                    <div className="text-[11px] text-slate-500">{job.insuranceName}</div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        job.stage === 'QUOTATION'
                          ? 'quotation'
                          : job.stage === 'ESTIMATE'
                          ? 'estimate'
                          : job.stage === 'JOB_CARD'
                          ? 'jobCard'
                          : 'invoice'
                      }
                    >
                      {job.stage}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] text-slate-600">
                      {job.floorStatus.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatRs(job.amountRs)}
                  </td>
                  <td className="p-3 text-center">
                    <Link to="/workshop/sheet/demo">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        Open Sheet
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
