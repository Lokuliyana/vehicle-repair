import { BarChart3, Clock, AlertTriangle, FileText } from 'lucide-react';

export function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="reports-page">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Executive Reports & Aging Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Claim Aging, Labor vs. Parts Revenue split, and Technician Efficiency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-slate-500">Insurance Claim Aging</h3>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">Rs. 182,500.00</div>
          <div className="text-xs text-slate-500">
            Pending across 4 insurance companies (30+ days: Rs. 42,000)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-slate-500">Labor vs. Parts Ratio</h3>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900">42% / 58%</div>
          <div className="text-xs text-slate-500">
            Labor Revenue: Rs. 145,000 | Parts: Rs. 201,000
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-slate-500">Low Stock Parts Alert</h3>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-600">3 Items</div>
          <div className="text-xs text-slate-500">
            Coolant 1L, Brake Fluid DOT4, Spark Plugs
          </div>
        </div>
      </div>
    </div>
  );
}
