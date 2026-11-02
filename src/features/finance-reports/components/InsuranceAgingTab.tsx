import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Shield,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  InsuranceAgingReportData,
  InsuranceAgingBucketKey,
} from '../types';
import { formatRs } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface InsuranceAgingTabProps {
  data: InsuranceAgingReportData;
}

export function InsuranceAgingTab({ data }: InsuranceAgingTabProps) {
  const [search, setSearch] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<InsuranceAgingBucketKey | 'ALL'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');

  const bucketCards = [
    {
      key: '0_30' as InsuranceAgingBucketKey,
      title: '0 - 30 Days',
      status: 'Current',
      icon: CheckCircle2,
      summary: data.buckets['0_30'],
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      textColor: 'text-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      key: '31_60' as InsuranceAgingBucketKey,
      title: '31 - 60 Days',
      status: 'Aging',
      icon: Clock,
      summary: data.buckets['31_60'],
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      textColor: 'text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      key: '61_90' as InsuranceAgingBucketKey,
      title: '61 - 90 Days',
      status: 'Attention Required',
      icon: AlertTriangle,
      summary: data.buckets['61_90'],
      bg: 'bg-orange-50/50',
      border: 'border-orange-200',
      textColor: 'text-orange-950',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    },
    {
      key: '90_PLUS' as InsuranceAgingBucketKey,
      title: '90+ Days',
      status: 'Critical Overdue',
      icon: Flame,
      summary: data.buckets['90_PLUS'],
      bg: 'bg-rose-50/60',
      border: 'border-rose-300',
      textColor: 'text-rose-950',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
  ];

  const filteredClaims = useMemo(() => {
    return data.itemizedClaims.filter((claim) => {
      // Bucket filter
      if (selectedBucket !== 'ALL' && claim.agingBucket !== selectedBucket) {
        return false;
      }
      // Company filter
      if (selectedCompany !== 'ALL' && claim.insuranceCompany !== selectedCompany) {
        return false;
      }
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesPlate = claim.vehiclePlate.toLowerCase().includes(q);
        const matchesJob = claim.jobNumber.toLowerCase().includes(q);
        const matchesModel = claim.vehicleMakeModel.toLowerCase().includes(q);
        const matchesIns = claim.insuranceCompany.toLowerCase().includes(q);
        return matchesPlate || matchesJob || matchesModel || matchesIns;
      }
      return true;
    });
  }, [data.itemizedClaims, selectedBucket, selectedCompany, search]);

  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    data.itemizedClaims.forEach((c) => set.add(c.insuranceCompany));
    return Array.from(set);
  }, [data.itemizedClaims]);

  return (
    <div className="space-y-6" data-testid="insurance-aging-tab">
      {/* 4 Standard Aging Buckets Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bucketCards.map((b) => {
          const Icon = b.icon;
          const isSelected = selectedBucket === b.key;

          return (
            <div
              key={b.key}
              onClick={() => setSelectedBucket(isSelected ? 'ALL' : b.key)}
              className={`p-5 rounded-xl border ${b.border} ${b.bg} shadow-xs space-y-3 cursor-pointer transition-all hover:scale-[1.01] ${
                isSelected ? 'ring-2 ring-slate-900 shadow-md' : ''
              }`}
              data-testid={`aging-bucket-card-${b.key}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-black text-slate-800">{b.title}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] font-semibold ${b.badgeColor}`}>
                  {b.status}
                </Badge>
              </div>

              <div>
                <div className={`text-2xl font-black font-mono tracking-tight ${b.textColor}`}>
                  {formatRs(b.summary.outstandingBalanceRs)}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 flex justify-between items-center">
                  <span>{b.summary.claimCount} Pending Claims</span>
                  <span className="font-mono text-[10px]">
                    Settled: {formatRs(b.summary.totalSettledRs)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Total Approved:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatRs(b.summary.totalApprovedRs)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary by Insurance Company */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        data-testid="insurance-company-summary-section"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Summary by Insurance Company
              </h3>
              <p className="text-[11px] text-slate-500">
                Outstanding claim balances, settled amounts, and oldest aging claim per insurer.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto bg-white text-indigo-900">
            Total Outstanding: {formatRs(data.totalOutstandingClaimsRs)}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="insurance-company-table">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Insurance Company</th>
                <th className="py-3 px-4 text-center">Uncollected Claims</th>
                <th className="py-3 px-4 text-right">Total Approved (Rs.)</th>
                <th className="py-3 px-4 text-right">Settled Amount (Rs.)</th>
                <th className="py-3 px-4 text-right">Outstanding Balance (Rs.)</th>
                <th className="py-3 px-4 text-right">Oldest Claim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {data.companySummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No outstanding insurance claims found.
                  </td>
                </tr>
              ) : (
                data.companySummaries.map((c) => (
                  <tr key={c.insuranceCompany} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {c.insuranceCompany}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {c.claimCount}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                      {formatRs(c.totalApprovedClaimsRs)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700">
                      {formatRs(c.settledAmountRs)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-700">
                      {formatRs(c.outstandingBalanceRs)}
                    </td>
                    <td className="py-3 px-4 text-right font-sans font-semibold">
                      <span className={c.oldestClaimDays > 60 ? 'text-rose-600' : 'text-slate-700'}>
                        {c.oldestClaimDays} Days
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {data.companySummaries.length > 0 && (
              <tfoot className="bg-slate-100 font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="py-3 px-4 font-sans">All Insurers Combined</td>
                  <td className="py-3 px-4 text-center">
                    {data.companySummaries.reduce((s, c) => s + c.claimCount, 0)}
                  </td>
                  <td className="py-3 px-4 text-right">{formatRs(data.totalApprovedClaimsRs)}</td>
                  <td className="py-3 px-4 text-right text-emerald-800">
                    {formatRs(data.totalSettledAmountRs)}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-800">
                    {formatRs(data.totalOutstandingClaimsRs)}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    {Math.max(0, ...data.companySummaries.map((c) => c.oldestClaimDays))} Days Max
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Itemized Claims Table */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        data-testid="itemized-claims-section"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Itemized Outstanding Insurance Claims
            </h3>
            <p className="text-[11px] text-slate-500">
              Detailed list of individual repair sheets with pending insurance approval balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <Input
                placeholder="Search plate, job #, insurer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs pl-8 w-56 bg-white"
                data-testid="claims-search-input"
              />
            </div>

            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value as InsuranceAgingBucketKey | 'ALL')}
              className="h-8 text-xs px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              data-testid="filter-bucket-select"
            >
              <option value="ALL">All Aging Buckets</option>
              <option value="0_30">0 - 30 Days (Current)</option>
              <option value="31_60">31 - 60 Days (Aging)</option>
              <option value="61_90">61 - 90 Days (Attention)</option>
              <option value="90_PLUS">90+ Days (Critical)</option>
            </select>

            {uniqueCompanies.length > 0 && (
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="h-8 text-xs px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                data-testid="filter-company-select"
              >
                <option value="ALL">All Insurers</option>
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="itemized-claims-table">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Job Number</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Make / Model</th>
                <th className="py-3 px-4">Insurance Company</th>
                <th className="py-3 px-4">Invoice / Sheet Date</th>
                <th className="py-3 px-4 text-center">Aging Days</th>
                <th className="py-3 px-4 text-right">Approved Claim (Rs.)</th>
                <th className="py-3 px-4 text-right">Balance Due (Rs.)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No insurance claims match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  let badgeVariant = 'outline';
                  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (claim.agingBucket === '31_60') {
                    badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  } else if (claim.agingBucket === '61_90') {
                    badgeClass = 'bg-orange-50 text-orange-800 border-orange-200';
                  } else if (claim.agingBucket === '90_PLUS') {
                    badgeClass = 'bg-rose-50 text-rose-800 border-rose-300 font-black';
                  }

                  return (
                    <tr
                      key={claim.jobId}
                      className="hover:bg-slate-50 transition-colors"
                      data-testid={`claim-row-${claim.jobId}`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <Link
                          to={`/workshop/sheet/${claim.jobId}`}
                          className="hover:text-amber-600 hover:underline"
                        >
                          {claim.jobNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{claim.vehiclePlate}</td>
                      <td className="py-3 px-4 text-slate-600">{claim.vehicleMakeModel}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {claim.insuranceCompany}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{claim.invoiceDate}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        <Badge variant={badgeVariant as any} className={`text-[10px] ${badgeClass}`}>
                          {claim.agingDays} d ({claim.bucketLabel.split(' ')[0]})
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900">
                        {formatRs(claim.approvedClaimRs)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-700">
                        {formatRs(claim.balanceDueRs)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/workshop/sheet/${claim.jobId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          data-testid={`view-invoice-link-${claim.jobId}`}
                        >
                          <span>View Invoice</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
