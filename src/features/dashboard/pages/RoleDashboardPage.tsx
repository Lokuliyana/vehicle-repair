import { Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Kanban,
  ShoppingCart,
  TrendingUp,
  Plus,
  Car,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function RoleDashboardPage() {
  const { user, role, permissions, isCostProfitVisible } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="role-dashboard">
      {/* Role Greeting & Operational Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Welcome back, {user.name}
            </h1>
            <Badge
              variant={
                role === 'OWNER'
                  ? 'quotation'
                  : role === 'WORKSHOP_MANAGER'
                  ? 'estimate'
                  : role === 'SERVICE_ADVISOR'
                  ? 'info'
                  : role === 'CASHIER'
                  ? 'success'
                  : 'secondary'
              }
              className="text-xs font-bold"
            >
              {role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Automotive Workshop, Accident Estimation & Counter POS Management Desk
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/workshop/sheet/demo')}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            data-testid="dash-new-sheet-btn"
          >
            <Plus className="w-4 h-4" />
            + New Repair Sheet
          </Button>

          {permissions.canAccessPos && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pos')}
              className="gap-1.5"
              data-testid="dash-open-pos-btn"
            >
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Counter POS
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: OWNER & WORKSHOP MANAGER (Executive & Financial Overview) */}
      {(role === 'OWNER' || role === 'WORKSHOP_MANAGER') && (
        <div className="space-y-6" data-testid="dashboard-owner-view">
          {/* Executive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today's Gross Sales</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {formatRs(102900)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">+14.2%</span> vs yesterday
              </div>
            </div>

            {/* Direct Costs (Visible ONLY if isCostProfitVisible) */}
            {isCostProfitVisible ? (
              <>
                <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-200 shadow-xs">
                  <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                    <span>Direct Buying Costs</span>
                    <Badge variant="outline" className="border-amber-300 text-amber-800 text-[10px]">
                      Parts + Sublet
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-amber-950 mt-2">
                    {formatRs(66200)}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    Direct material & outsourced costs
                  </div>
                </div>

                <div className="bg-emerald-50/80 p-5 rounded-xl border border-emerald-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                    <span>Gross Profit & Margin</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-950 mt-2">
                    {formatRs(36700)}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1 font-bold">
                    Margin: 35.66%
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-1 sm:col-span-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 flex items-center justify-center text-xs text-slate-400 italic">
                Internal Buying Costs & Gross Profit hidden. Toggle 'Costs & Margin: ON' in header to reveal.
              </div>
            )}

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Active Floor Jobs</span>
                <Car className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                8 Vehicles
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-medium">
                3 Pending Insurance Approval
              </div>
            </div>
          </div>

          {/* Quick Hub Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/workshop/jobs"
              className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-500 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Workshop Repair Sheets
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage Quotations, Accident Repair Estimates, Job Cards, and Invoices.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-amber-600 font-semibold gap-1">
                <span>View Job Sheets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/workshop/board"
              className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Kanban className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Workshop Floor Status Board
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kanban tracking across In Progress, Waiting for Parts, QC, and Ready for Delivery.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-blue-600 font-semibold gap-1">
                <span>Open Floor Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/finance/profit-ledger"
              className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Profit & Financial Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sales, Direct Cost, Gross Profit, and Daily Shop Operating Expenses ledger.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                <span>Review Profit Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* VIEW 2: SERVICE ADVISOR (Intake, Estimation, Insurance Follow-up) */}
      {role === 'SERVICE_ADVISOR' && (
        <div className="space-y-6" data-testid="dashboard-advisor-view">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Estimates Pending Insurance</div>
              <div className="text-2xl font-black text-amber-600 mt-2">4 Claims</div>
              <div className="text-xs text-slate-500 mt-1">SLIC, Ceylinco, Fairfirst</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Active Job Cards on Floor</div>
              <div className="text-2xl font-black text-blue-600 mt-2">6 Vehicles</div>
              <div className="text-xs text-slate-500 mt-1">Under mechanical & body repair</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Vehicles Ready for Delivery</div>
              <div className="text-2xl font-black text-emerald-600 mt-2">2 Vehicles</div>
              <div className="text-xs text-slate-500 mt-1">CAB-4521, CAR-1234</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Service Advisor Quick Intake
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter customer details, insurance claims, and vehicle specs on-the-fly with Zero CRM friction.
            </p>
            <div className="flex gap-3">
              <Link to="/workshop/sheet/demo">
                <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-1.5" /> Start New Estimate
                </Button>
              </Link>
              <Link to="/workshop/jobs">
                <Button variant="outline" size="sm">
                  View All Repair Sheets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CASHIER (POS Terminal & Shift Register) */}
      {role === 'CASHIER' && (
        <div className="space-y-6" data-testid="dashboard-cashier-view">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Active Register Drawer</div>
              <div className="text-2xl font-black text-emerald-600 mt-2">Shift #001: OPEN</div>
              <div className="text-xs text-slate-500 mt-1">Starting Float: Rs. 15,000.00</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Today's Counter POS Sales</div>
              <div className="text-2xl font-black text-slate-900 mt-2">Rs. 38,400.00</div>
              <div className="text-xs text-slate-500 mt-1">14 completed walk-in transactions</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Petty Cash Payouts Today</div>
              <div className="text-2xl font-black text-slate-700 mt-2">Rs. 1,250.00</div>
              <div className="text-xs text-slate-500 mt-1">Workshop tea & consumables</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Ready for Walk-in Checkout
              </h2>
              <p className="text-xs text-slate-500">
                Scan barcodes, search lubricants and spare parts, or collect workshop invoice balances.
              </p>
            </div>
            <Link to="/pos">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="w-4 h-4 mr-2" /> Open POS Terminal
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* VIEW 4: TECHNICIAN (Floor Operations & Job Tasks) */}
      {role === 'TECHNICIAN' && (
        <div className="space-y-6" data-testid="dashboard-technician-view">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Floor Mechanic Tasks & Checklists
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              View assigned repair job cards, complete panel beating, mechanical, and painting milestones.
              (All pricing and margins are strictly redacted).
            </p>
            <div className="flex gap-3">
              <Link to="/workshop/board">
                <Button variant="default" size="sm" className="bg-slate-900">
                  <Kanban className="w-4 h-4 mr-1.5" /> View Workshop Floor Board
                </Button>
              </Link>
              <Link to="/workshop/jobs">
                <Button variant="outline" size="sm">
                  Assigned Job Cards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
