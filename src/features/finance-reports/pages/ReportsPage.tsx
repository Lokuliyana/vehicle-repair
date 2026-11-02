import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Package,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateRangeOption, DateRangeFilter } from '../types';
import { analyticsRepository } from '../repository/analytics.repository.mock';
import { DateRangeSalesProfitTab } from '../components/DateRangeSalesProfitTab';
import { InsuranceAgingTab } from '../components/InsuranceAgingTab';
import { TechnicianVelocityTab } from '../components/TechnicianVelocityTab';
import { FastMovingPartsAlertsTab } from '../components/FastMovingPartsAlertsTab';

export type ReportsTabType =
  | 'sales-profit'
  | 'insurance-aging'
  | 'tech-velocity'
  | 'inventory-alerts';

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ReportsTabType) || 'sales-profit';
  const [activeTab, setActiveTab] = useState<ReportsTabType>(initialTab);

  // Sales & Profit Date Filter State
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('THIS_MONTH');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Report Data States
  const [salesData, setSalesData] = useState(() =>
    analyticsRepository.getSalesGrossProfitReportSync({ range: 'THIS_MONTH' })
  );
  const [insuranceData, setInsuranceData] = useState(() =>
    analyticsRepository.getInsuranceAgingReportSync()
  );
  const [technicianData, setTechnicianData] = useState(() =>
    analyticsRepository.getTechnicianVelocityReportSync()
  );
  const [inventoryData, setInventoryData] = useState(() =>
    analyticsRepository.getInventoryVelocityAndAlertsReportSync({ range: 'THIS_MONTH' })
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAllReports = useCallback(() => {
    setIsRefreshing(true);
    const filter: DateRangeFilter = {
      range: dateRangeOption,
      startDate: customStart || undefined,
      endDate: customEnd || undefined,
    };

    setSalesData(analyticsRepository.getSalesGrossProfitReportSync(filter));
    setInsuranceData(analyticsRepository.getInsuranceAgingReportSync());
    setTechnicianData(analyticsRepository.getTechnicianVelocityReportSync());
    setInventoryData(analyticsRepository.getInventoryVelocityAndAlertsReportSync(filter));

    setTimeout(() => {
      setIsRefreshing(false);
    }, 250);
  }, [dateRangeOption, customStart, customEnd]);

  // Synchronize on mount and when filter changes
  useEffect(() => {
    refreshAllReports();
  }, [refreshAllReports]);

  // Synchronize tab with searchParams on URL change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as ReportsTabType;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const handleTabSwitch = (tab: ReportsTabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleDateRangeChange = (range: DateRangeOption) => {
    setDateRangeOption(range);
  };

  const handleCustomDatesChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setDateRangeOption('CUSTOM');
  };

  const TABS_CONFIG = [
    {
      id: 'sales-profit' as ReportsTabType,
      label: 'Sales & Gross Profit',
      icon: TrendingUp,
      badge: `${salesData.grossMarginPct.toFixed(0)}% Margin`,
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'insurance-aging' as ReportsTabType,
      label: 'Insurance Claim Aging',
      icon: Clock,
      badge: `${insuranceData.itemizedClaims.length} Claims`,
      badgeClass: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'tech-velocity' as ReportsTabType,
      label: 'Technician Velocity',
      icon: Users,
      badge: `${technicianData.totalActiveTechnicians} Techs`,
      badgeClass: 'bg-blue-100 text-blue-900',
    },
    {
      id: 'inventory-alerts' as ReportsTabType,
      label: 'Inventory Velocity & Alerts',
      icon: Package,
      badge: inventoryData.lowStockAlerts.length > 0 ? `${inventoryData.lowStockAlerts.length} Alerts` : 'Healthy',
      badgeClass: inventoryData.lowStockAlerts.length > 0 ? 'bg-rose-100 text-rose-900' : 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="reports-page">
      {/* Executive Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Executive Reports & Analytics Dashboards
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-stream sales margins, uncollected insurance claim aging, mechanic turnaround velocity, and fast-moving spare parts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link to="/finance/profit-ledger">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-bold">
              <span>View Profit Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllReports}
            disabled={isRefreshing}
            className="text-xs gap-1.5"
            data-testid="refresh-reports-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div
        className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5"
        data-testid="reports-tab-nav"
      >
        {TABS_CONFIG.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleTabSwitch(t.id)}
              className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              data-testid={`tab-btn-${t.id}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ml-2 ${
                  isActive ? 'bg-slate-800 text-amber-300 border-slate-700' : t.badgeClass
                }`}
              >
                {t.badge}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'sales-profit' && (
        <DateRangeSalesProfitTab
          data={salesData}
          activeRange={dateRangeOption}
          customStartDate={customStart}
          customEndDate={customEnd}
          onRangeChange={handleDateRangeChange}
          onCustomDatesChange={handleCustomDatesChange}
        />
      )}

      {activeTab === 'insurance-aging' && (
        <InsuranceAgingTab data={insuranceData} />
      )}

      {activeTab === 'tech-velocity' && (
        <TechnicianVelocityTab data={technicianData} />
      )}

      {activeTab === 'inventory-alerts' && (
        <FastMovingPartsAlertsTab data={inventoryData} activeRange={dateRangeOption} />
      )}
    </div>
  );
}
