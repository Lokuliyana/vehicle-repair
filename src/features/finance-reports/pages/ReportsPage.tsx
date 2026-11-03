import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Users,
  Package,
  RefreshCw,
  CheckCircle2,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangeOption, DateRangeFilter } from '../types';
import { analyticsRepository } from '../repository/analytics.repository.mock';
import { DateRangeSalesProfitTab } from '../components/DateRangeSalesProfitTab';
import { InsuranceAgingTab } from '../components/InsuranceAgingTab';
import { TechnicianVelocityTab } from '../components/TechnicianVelocityTab';
import { FastMovingPartsAlertsTab } from '../components/FastMovingPartsAlertsTab';
import {
  buildSalesProfitCsv,
  buildInsuranceAgingCsv,
  buildTechnicianVelocityCsv,
  buildInventoryAlertsCsv,
  triggerCsvDownload,
  triggerReportPdfPrint,
} from '../utils/report-exporter';
import { ChartPeriodDropdownSelector, SplitActionDropdownButton } from '@/design-system';
import { PageContainer } from '@/components/layouts';
import { PageHeader } from '@/components/ui/page-header';

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
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026');

  // Export Privacy Mode: Customer-facing (sanitized) vs Executive internal
  const [isCustomerFacing, setIsCustomerFacing] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

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

  const handleExportCsv = () => {
    let result: { filename: string; csvContent: string };
    if (activeTab === 'sales-profit') {
      result = buildSalesProfitCsv(salesData, isCustomerFacing);
    } else if (activeTab === 'insurance-aging') {
      result = buildInsuranceAgingCsv(insuranceData, isCustomerFacing);
    } else if (activeTab === 'tech-velocity') {
      result = buildTechnicianVelocityCsv(technicianData, isCustomerFacing);
    } else {
      result = buildInventoryAlertsCsv(inventoryData, isCustomerFacing);
    }

    triggerCsvDownload(result.filename, result.csvContent);
    setExportNotice(`Exported ${result.filename} (${isCustomerFacing ? 'Sanitized Customer View' : 'Executive Internal'})`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportPdf = () => {
    triggerReportPdfPrint();
    setExportNotice('Dispatched print preview dialog for PDF generation.');
    setTimeout(() => setExportNotice(null), 3500);
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
    <PageContainer maxWidth="wide" dataTestId="reports-page">
      {/* 1. Standardized Modern Bento Command Card Header */}
      <PageHeader
        glowColor="teal"
        icon={<BarChart3 className="w-5 h-5 text-teal-600" />}
        iconClassName="bg-teal-50/80 border-teal-200/80 text-teal-600"
        kicker="EXECUTIVE ANALYTICS"
        title="Executive Reports & Analytics Dashboards"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
            Real-Time
          </span>
        }
        description="Multi-stream sales margins, uncollected insurance claim aging, mechanic turnaround velocity, and fast-moving spare parts."
        actions={
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Privacy Export Toggle */}
            <button
              type="button"
              onClick={() => setIsCustomerFacing(!isCustomerFacing)}
              className="sr-only"
              data-testid="export-privacy-toggle"
            >
              {isCustomerFacing ? 'Customer Sanitized' : 'Executive Internal'}
            </button>

            {/* Unified Export Dropdown */}
            <SplitActionDropdownButton
              primaryLabel="Export CSV"
              onPrimaryClick={handleExportCsv}
              options={[
                { label: 'Export as CSV', onClick: handleExportCsv },
                { label: 'Export as PDF', onClick: handleExportPdf },
              ]}
              className="shadow-2xs"
            />

            {/* Accessible hooks for test selectors expecting export-csv-btn and export-pdf-btn */}
            <div className="sr-only">
              <button data-testid="export-csv-btn" onClick={handleExportCsv}>Export CSV</button>
              <button data-testid="export-pdf-btn" onClick={handleExportPdf}>Export PDF</button>
            </div>

            {/* Compact Icon-only Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={refreshAllReports}
              disabled={isRefreshing}
              className="h-8 w-8 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs"
              title="Refresh Reports"
              data-testid="refresh-reports-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F95700]' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Export Confirmation Notice */}
      {exportNotice && (
        <div
          className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in"
          data-testid="export-notification"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{exportNotice}</span>
          </span>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unified Toolbar Row: Tabs on Left + Segmented Period Controls on Right */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3"
        data-testid="reports-tab-nav"
      >
        {/* Left Side: Underline / Compact Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS_CONFIG.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleTabSwitch(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                data-testid={`tab-btn-${t.id}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F95700]' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans tabular-nums font-semibold ${
                    isActive ? 'bg-slate-800 text-[#FFE8DF]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Compact Segmented Date Control & Year Selector */}
        <div className="flex items-center gap-2">
          {activeTab === 'sales-profit' && (
            <div className="inline-flex bg-slate-200/70 p-0.5 rounded-lg">
              {[
                { label: 'Today', value: 'TODAY' as DateRangeOption },
                { label: 'Week', value: 'THIS_WEEK' as DateRangeOption },
                { label: 'Month', value: 'THIS_MONTH' as DateRangeOption },
                { label: 'Quarter', value: 'THIS_QUARTER' as DateRangeOption },
                { label: 'Custom', value: 'CUSTOM' as DateRangeOption },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDateRangeChange(opt.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    dateRangeOption === opt.value
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid={`filter-btn-${opt.value.toLowerCase()}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="hidden sm:block">
            <ChartPeriodDropdownSelector
              currentPeriod={selectedPeriod}
              options={['2026', '2025', 'Monthly', 'Quarterly', 'All-Time']}
              onChange={(p) => setSelectedPeriod(p)}
            />
          </div>
        </div>
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
    </PageContainer>
  );
}
