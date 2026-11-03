import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Calendar,
  Plus,
  ShoppingCart,
  Kanban,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import {
  RolePermissionGateWrapper,
  RedactedCipherPlaceholder,
} from '@/design-system/components/finance-privacy-components';
import { PageContainer } from '@/components/layouts';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';

export function RoleDashboardPage() {
  const { user, role, isCostProfitVisible, activeShift } = useAuth();

  // Load recent workshop jobs for summary table
  const recentJobs = useMemo(() => {
    try {
      if (workshopJobRepository.filterSync) {
        return workshopJobRepository.filterSync({}).slice(0, 5);
      }
    } catch {
      // Fallback
    }
    return [];
  }, []);

  // 7-day daily trend data for Revenue & Profit Overview bar chart
  const weeklyDailyTrend = [
    { label: 'Oct 28', value: 72000, isPeak: false },
    { label: 'Oct 29', value: 84500, isPeak: false },
    { label: 'Oct 30', value: 69000, isPeak: false },
    { label: 'Oct 31', value: 92000, isPeak: false },
    { label: 'Nov 01', value: 88000, isPeak: false },
    { label: 'Nov 02', value: 96000, isPeak: false },
    { label: 'Nov 03', value: 102900, isPeak: true },
  ];

  const peakDay = weeklyDailyTrend.find((d) => d.isPeak) || weeklyDailyTrend[weeklyDailyTrend.length - 1];
  const maxBarValue = Math.max(...weeklyDailyTrend.map((d) => d.value));

  // Bay status data for donut chart
  const bayStatusItems = [
    { label: 'In Progress', count: 4, color: '#3B82F6', textClass: 'text-blue-700', bgClass: 'bg-blue-50' },
    { label: 'Waiting Parts', count: 2, color: '#A855F7', textClass: 'text-purple-700', bgClass: 'bg-purple-50' },
    { label: 'Insurance Pending', count: 1, color: '#F59E0B', textClass: 'text-amber-700', bgClass: 'bg-amber-50' },
    { label: 'Ready for Delivery', count: 1, color: '#10B981', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50' },
  ];
  const totalBayVehicles = bayStatusItems.reduce((acc, i) => acc + i.count, 0);

  return (
    <PageContainer maxWidth="wide" dataTestId="role-dashboard">
      {/* 1. Standardized Modern Bento Command Card Header */}
      <PageHeader
        glowColor="blue"
        icon={<LayoutDashboard className="w-5 h-5 text-blue-600" />}
        iconClassName="bg-blue-50/80 border-blue-200/80 text-blue-600"
        kicker="EXECUTIVE OVERVIEW"
        title={`Welcome back, ${user.name}`}
        badge={
          <Badge variant="secondary" className="text-[11px] font-semibold px-2 py-0.5 shadow-2xs">
            {role}
          </Badge>
        }
        description="Here is what's happening across your workshop bays and counter today."
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today, Nov 3</span>
          </div>
        }
      />

      {/* VIEW 1: OWNER & WORKSHOP MANAGER (Executive & Financial Overview) */}
      {(role === 'OWNER' || role === 'WORKSHOP_MANAGER') && (
        <div className="space-y-4 sm:space-y-4.5" data-testid="dashboard-owner-view">
          {/* 2. KPI Ribbon (4 Pure White Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Today's Gross Sales */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Today's Gross Sales</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums tracking-tight text-slate-900 mt-2">
                {formatRs(102900)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  +14.2% vs yesterday
                </span>
                <span className="text-[11px] text-slate-400">18 orders</span>
              </div>
            </div>

            {/* Direct Costs & Margin (Visible ONLY if isCostProfitVisible to OWNER & WORKSHOP_MANAGER) */}
            <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
              {isCostProfitVisible ? (
                <>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Direct Buying Costs</span>
                      <span className="text-[11px] font-medium text-slate-400">Parts + Sublet</span>
                    </div>
                    <div className="text-2xl font-bold font-sans tabular-nums tracking-tight text-slate-900 mt-2">
                      <RedactedCipherPlaceholder value={66200} isRedacted={false} />
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Direct material & outsourced costs
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                      <span>Gross Profit & Margin</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold font-sans tabular-nums tracking-tight text-slate-900 mt-2">
                      <RedactedCipherPlaceholder value={36700} isRedacted={false} />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        35.7% Margin
                      </span>
                      <span className="text-[11px] text-slate-400">Target 32%</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-1 sm:col-span-2 bg-white border border-dashed border-slate-300 rounded-xl p-4 sm:p-4.5 flex items-center justify-center text-xs text-slate-400 italic">
                  Internal Buying Costs & Gross Profit hidden. Toggle 'Costs: ON' in header to reveal.
                </div>
              )}
            </RolePermissionGateWrapper>

            {/* Card 4: Active Floor Jobs */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Active Floor Jobs</span>
                <Car className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums tracking-tight text-slate-900 mt-2">
                8 Vehicles
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  3 Pending Insurance
                </span>
                <span className="text-[11px] text-slate-400">4 Bays Active</span>
              </div>
            </div>
          </div>

          {/* 3. Middle Row: 2-Column Grid (12 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Left (8 cols): Revenue & Profit Overview Bar Chart */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Revenue & Profit Overview
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily gross performance over the last 7 days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#F95700]" />
                    Peak Day ({peakDay.label})
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FFE4D6]" />
                    Normal Volume
                  </span>
                </div>
              </div>

              {/* Multi-Bar Histogram */}
              <div className="flex items-end gap-3 h-52 pt-8 pb-2">
                {weeklyDailyTrend.map((d, idx) => {
                  const heightPct = Math.max(12, Math.round((d.value / maxBarValue) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                    >
                      {/* Floating Tooltip */}
                      <div className="absolute -top-10 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-xs font-sans tabular-nums px-2.5 py-1 rounded-lg shadow-xl border border-slate-800">
                        <span className="font-semibold">{d.label}: </span>
                        <span>{formatRs(d.value)}</span>
                      </div>

                      <div className="w-full flex items-end justify-center h-full">
                        <div
                          className={`w-full max-w-[44px] rounded-t-lg transition-all duration-300 ${
                            d.isPeak
                              ? 'bg-[#F95700] shadow-sm'
                              : 'bg-[#FFE4D6] hover:bg-[#FFD2BE]'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 truncate w-full text-center">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right (4 cols): Workshop Bay Status */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Workshop Bay Status
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalBayVehicles} active vehicles across all service bays
                  </p>
                </div>
                <Link to="/workshop/board" className="text-xs font-semibold text-[#F95700] hover:underline">
                  Board →
                </Link>
              </div>

              {/* Donut Chart & Status List with Micro Color Badges */}
              <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
                {/* SVG Mini Donut Chart */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center" data-testid="dashboard-bay-donut">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="30" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                    {(() => {
                      const circumference = 2 * Math.PI * 30;
                      let accumulated = 0;
                      return bayStatusItems.map((item, idx) => {
                        const pct = totalBayVehicles > 0 ? item.count / totalBayVehicles : 0;
                        const dashLength = pct * circumference;
                        const dashOffset = (1 - accumulated) * circumference;
                        accumulated += pct;
                        return (
                          <circle
                            key={idx}
                            cx="40"
                            cy="40"
                            r="30"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="10"
                            strokeDasharray={`${dashLength} ${circumference}`}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-300"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-bold font-sans tabular-nums text-slate-900 leading-none">
                      {totalBayVehicles}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight">
                      Vehicles
                    </span>
                  </div>
                </div>

                {/* Status List with Micro Color Badges */}
                <div className="flex-1 w-full space-y-1.5">
                  {bayStatusItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className={`text-[11px] font-bold font-sans tabular-nums px-2 py-0.5 rounded-full ${item.bgClass} ${item.textClass}`}>
                        {item.count} {item.count === 1 ? 'car' : 'cars'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-400">Average turn-around time: </span>
                <span className="text-xs font-bold text-slate-700">3.8 Days</span>
              </div>
            </div>
          </div>

          {/* 4. Bottom Row: Recent Workshop Jobs & Counter Sales Table */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Recent Workshop Jobs & Counter Sales
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest collision repairs, job cards, and counter invoices
                </p>
              </div>
              <Link
                to="/workshop/jobs"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View all jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-medium text-slate-500">
                    <th className="py-3 px-5">Job ID</th>
                    <th className="py-3 px-5">Vehicle & model</th>
                    <th className="py-3 px-5">Customer / insurance</th>
                    <th className="py-3 px-5">Document stage</th>
                    <th className="py-3 px-5">Floor status</th>
                    <th className="py-3 px-5 text-right">Amount (Rs.)</th>
                    <th className="py-3 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                        No recent workshop jobs logged yet.
                      </td>
                    </tr>
                  ) : (
                    recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-xs font-medium text-slate-700">
                          {job.jobNumber}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white">
                              {job.header.vehicleNumber ? job.header.vehicleNumber.replace(/^WP\s+/, '') : 'CAB-4521'}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {[job.header.vehicleMake, job.header.vehicleModel].filter(Boolean).join(' ') || 'Axio'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          <div className="truncate max-w-[180px]">{job.header.customerInfo || 'Walk-in Customer'}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{job.header.insuranceName || 'Direct Cash'}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge
                            variant={
                              job.docStage === 'INVOICE'
                                ? 'success'
                                : job.docStage === 'JOB_CARD'
                                ? 'info'
                                : 'warning'
                            }
                            className="text-[10px] font-semibold"
                          >
                            {job.docStage}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">
                          {job.floorStatus ? job.floorStatus.replace(/_/g, ' ') : 'In Progress'}
                        </td>
                        <td className="py-3.5 px-5 text-right font-sans tabular-nums font-bold text-slate-900">
                          {formatRs(job.financials?.grandTotalSalesRs || 0)}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <Link
                            to={`/workshop/sheet/${job.id}`}
                            className="inline-flex items-center text-xs font-medium text-[#F95700] hover:underline"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SERVICE ADVISOR (Intake, Estimation, Insurance Follow-up) */}
      {role === 'SERVICE_ADVISOR' && (
        <div className="space-y-4" data-testid="dashboard-advisor-view">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="text-xs font-medium text-slate-500">Estimates Pending Insurance</div>
              <div className="text-2xl font-bold font-sans tabular-nums text-slate-900 mt-2">4 Claims</div>
              <div className="text-xs text-slate-400 mt-1">SLIC, Ceylinco, Fairfirst</div>
            </div>
            <div className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="text-xs font-medium text-slate-500">Active Job Cards on Floor</div>
              <div className="text-2xl font-bold font-sans tabular-nums text-slate-900 mt-2">6 Vehicles</div>
              <div className="text-xs text-slate-400 mt-1">Under mechanical & body repair</div>
            </div>
            <div className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="text-xs font-medium text-slate-500">Vehicles Ready for Delivery</div>
              <div className="text-2xl font-bold font-sans tabular-nums text-slate-900 mt-2">2 Vehicles</div>
              <div className="text-xs text-slate-400 mt-1">CAB-4521, CAR-1234</div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              Service Advisor Quick Intake
            </h2>
            <p className="text-xs text-slate-500 mb-3.5">
              Enter customer details, insurance claims, and vehicle specs on-the-fly directly.
            </p>
            <div className="flex gap-2.5">
              <Link to="/workshop/sheet/demo">
                <Button variant="default" size="sm" className="bg-[#F95700] hover:bg-[#EA580C] text-white font-medium rounded-lg">
                  <Plus className="w-4 h-4 mr-1.5" /> Start New Estimate
                </Button>
              </Link>
              <Link to="/workshop/jobs">
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 rounded-lg">
                  View All Repair Sheets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CASHIER (POS Terminal & Shift Register) */}
      {role === 'CASHIER' && (
        <div className="space-y-4" data-testid="dashboard-cashier-view">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="text-xs font-medium text-slate-500">Active Register Drawer</div>
              <div className="text-2xl font-bold font-sans tabular-nums text-slate-900 mt-2">
                {activeShift ? `${activeShift.id}: ${activeShift.status}` : 'No Active Shift'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {activeShift ? `Starting Float: ${formatRs(activeShift.startingCashRs)}` : 'Register closed'}
              </div>
            </div>
            <div className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="text-xs font-medium text-slate-500">Today's Counter POS Sales</div>
              <div className="text-2xl font-bold font-sans tabular-nums text-slate-900 mt-2">
                {formatRs(38400)}
              </div>
              <div className="text-xs text-slate-400 mt-1">14 completed walk-in transactions</div>
            </div>
            <div className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="text-xs font-medium text-slate-500">Petty Cash Payouts Today</div>
              <div className="text-2xl font-bold font-sans tabular-nums text-slate-900 mt-2">
                {formatRs(1250)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Workshop tea & consumables</div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Ready for Walk-in Checkout
              </h2>
              <p className="text-xs text-slate-500">
                Scan barcodes, search lubricants and spare parts, or collect workshop invoice balances.
              </p>
            </div>
            <Link to="/pos">
              <Button variant="default" className="bg-[#0F172A] hover:bg-slate-800 text-white font-medium rounded-lg">
                <ShoppingCart className="w-4 h-4 mr-2" /> Open POS Terminal
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* VIEW 4: TECHNICIAN (Floor Operations & Job Tasks) */}
      {role === 'TECHNICIAN' && (
        <div className="space-y-4" data-testid="dashboard-technician-view">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Floor Mechanic Tasks & Checklists
            </h2>
            <p className="text-xs text-slate-500 mb-3.5">
              View assigned repair job cards, complete panel beating, mechanical, and painting milestones.
              (All pricing and margins are strictly redacted).
            </p>
            <div className="flex gap-2.5">
              <Link to="/workshop/board">
                <Button variant="default" size="sm" className="bg-[#0F172A] hover:bg-slate-800 text-white font-medium rounded-lg">
                  <Kanban className="w-4 h-4 mr-1.5" /> View Workshop Floor Board
                </Button>
              </Link>
              <Link to="/workshop/jobs">
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 rounded-lg">
                  Assigned Job Cards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
