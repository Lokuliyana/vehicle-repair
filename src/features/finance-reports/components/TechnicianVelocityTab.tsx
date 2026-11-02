import { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  Search,
  Sparkles,
} from 'lucide-react';
import { TechnicianVelocityReportData } from '../types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TechnicianVelocityTabProps {
  data: TechnicianVelocityReportData;
}

export function TechnicianVelocityTab({ data }: TechnicianVelocityTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AHEAD' | 'ON_TRACK' | 'BEHIND'>('ALL');

  const filteredTechnicians = useMemo(() => {
    return data.technicians.filter((tech) => {
      if (statusFilter !== 'ALL' && tech.velocityStatus !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        return tech.technicianName.toLowerCase().includes(search.toLowerCase().trim());
      }
      return true;
    });
  }, [data.technicians, statusFilter, search]);

  return (
    <div className="space-y-6" data-testid="technician-velocity-tab">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Technicians */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-active-techs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Technicians
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {data.totalActiveTechnicians}
          </div>
          <div className="text-[11px] text-slate-500">
            Mechanics & specialists on floor
          </div>
        </div>

        {/* Assigned vs Completed Tasks */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-task-completion"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Task Completion Rate
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
            {data.overallCompletionRatePct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {data.totalCompletedTasks} of {data.totalAssignedTasks} tasks completed
          </div>
        </div>

        {/* Turnaround Days vs Target Days */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-avg-turnaround"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Turnaround Velocity
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-950 font-mono tracking-tight">
            {data.overallAvgTurnaroundDays} Days
          </div>
          <div className="text-[11px] text-purple-700">
            vs. {data.overallAvgTargetDays} Days estimated target
          </div>
        </div>

        {/* Completion Pace Indicator */}
        <div
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2"
          data-testid="kpi-completion-pace"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Shop Velocity
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {data.overallAvgTurnaroundDays <= data.overallAvgTargetDays
              ? 'On Schedule / Ahead'
              : 'Attention Needed'}
          </div>
          <div className="text-[11px] text-slate-500">
            Based on completed repair cards
          </div>
        </div>
      </div>

      {/* Technician Productivity & Velocity Table */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        data-testid="technician-velocity-table-section"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Technician Productivity & Velocity Metrics
            </h3>
            <p className="text-[11px] text-slate-500">
              Individual mechanics task completion rates, job turnaround days vs estimated targets, and active floor jobs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <Input
                placeholder="Search technician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs pl-8 w-48 bg-white"
                data-testid="tech-search-input"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 text-xs px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              data-testid="filter-velocity-status"
            >
              <option value="ALL">All Velocities</option>
              <option value="AHEAD">Ahead of Schedule</option>
              <option value="ON_TRACK">On Track</option>
              <option value="BEHIND">Behind Schedule</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="technicians-table">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Technician Name</th>
                <th className="py-3 px-4" style={{ minWidth: '180px' }}>
                  Assigned vs. Completed Tasks
                </th>
                <th className="py-3 px-4 text-center">Completed Jobs</th>
                <th className="py-3 px-4 text-center">Active Jobs In-Progress</th>
                <th className="py-3 px-4 text-center">Avg Target Days</th>
                <th className="py-3 px-4 text-center">Avg Turnaround</th>
                <th className="py-3 px-4 text-center">Velocity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No technicians found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTechnicians.map((tech) => {
                  let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                  let statusLabel = 'On Track';
                  if (tech.velocityStatus === 'AHEAD') {
                    badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
                    statusLabel = 'Ahead of Schedule';
                  } else if (tech.velocityStatus === 'BEHIND') {
                    badgeClass = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
                    statusLabel = 'Behind Target';
                  }

                  return (
                    <tr
                      key={tech.technicianName}
                      className="hover:bg-slate-50 transition-colors"
                      data-testid={`tech-row-${tech.technicianName.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                          {tech.technicianName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{tech.technicianName}</div>
                          <div className="text-[10px] text-slate-500">Workshop Specialist</div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-slate-600">
                              {tech.completedTasks} / {tech.totalAssignedTasks} tasks
                            </span>
                            <span className="font-bold text-slate-900">
                              {tech.taskCompletionRatePct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, tech.taskCompletionRatePct)}%` }}
                              data-testid={`tech-progress-${tech.technicianName}`}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {tech.completedJobsCount}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <Badge
                          variant="secondary"
                          className={tech.activeInProgressJobsCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}
                        >
                          {tech.activeInProgressJobsCount} Active
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {tech.avgEstimatedTargetDays > 0
                          ? `${tech.avgEstimatedTargetDays} Days`
                          : '—'}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {tech.avgTurnaroundDays > 0
                          ? `${tech.avgTurnaroundDays} Days`
                          : '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={`text-[10px] ${badgeClass}`}>
                          {statusLabel}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredTechnicians.length > 0 && (
              <tfoot className="bg-slate-100 font-sans font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="py-3 px-4">Team Total ({filteredTechnicians.length} Technicians)</td>
                  <td className="py-3 px-4 font-mono">
                    {data.totalCompletedTasks} / {data.totalAssignedTasks} tasks ({data.overallCompletionRatePct.toFixed(0)}%)
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {filteredTechnicians.reduce((s, t) => s + t.completedJobsCount, 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {filteredTechnicians.reduce((s, t) => s + t.activeInProgressJobsCount, 0)} Active
                  </td>
                  <td className="py-3 px-4 text-center font-mono">{data.overallAvgTargetDays} Days</td>
                  <td className="py-3 px-4 text-center font-mono">{data.overallAvgTurnaroundDays} Days</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="secondary" className="text-[10px]">
                      Average
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
