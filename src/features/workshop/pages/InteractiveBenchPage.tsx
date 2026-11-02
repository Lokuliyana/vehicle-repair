import { useState } from 'react';
import {
  Printer,
  Receipt,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  Lock,
  Plus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  WorkshopJobSheet,
  WorkshopLineItem,
  DocumentStage,
  PosSaleReceipt,
} from '@/types';
import { calculateWorkshopFinancials, formatRs } from '@/utils/currency';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { WorkshopTable } from '@/components/workshop/WorkshopTable';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';

const INITIAL_JOB_SHEET: WorkshopJobSheet = {
  id: 'job-001',
  jobNumber: 'JOB-2026-0042',
  docStage: 'ESTIMATE',
  floorStatus: 'APPROVED_IN_PROGRESS',
  paymentStatus: 'UNPAID',
  header: {
    date: '2026-11-02',
    jobNumber: 'JOB-2026-0042',
    vehicleNumber: 'WP CAB-4521',
    natureOfRepair: 'Accident Damage Front Left Side & Bumper Replacement',
    vehicleMake: 'Toyota',
    chassisNumber: 'NZE141-9034821',
    vehicleModel: 'Corolla Axio',
    daysForCompletion: '4 Days',
    yearOfMake: '2018',
    vehicleColor: 'Pearl White (070)',
    insuranceName: 'Sri Lanka Insurance Corporation (SLIC)',
    customerInfo: 'Kasun Perera - 077 889 1234 / No 45, Galle Road, Colombo 03',
  },
  lines: [
    {
      id: 'l1',
      rowNo: 1,
      category: 'LABOR_REMOVE_REASSEMBLE',
      description: 'Front bumper & lower grill removal & reassembly',
      sellingPriceRs: 4500,
      buyingCostRs: 1200,
      assignedTechnician: 'Nimal Bandara',
      isCompleted: true,
    },
    {
      id: 'l2',
      rowNo: 2,
      category: 'LABOR_REMOVE_REASSEMBLE',
      description: 'Left headlight & fog lamp assembly removal',
      sellingPriceRs: 2500,
      buyingCostRs: 600,
      assignedTechnician: 'Nimal Bandara',
      isCompleted: true,
    },
    {
      id: 'l3',
      rowNo: 1,
      category: 'LABOR_REPAIR',
      description: 'Front left fender panel beating & alignment repair',
      sellingPriceRs: 12000,
      buyingCostRs: 3000,
      assignedTechnician: 'Sunil Shantha',
      isCompleted: false,
    },
    {
      id: 'l4',
      rowNo: 2,
      category: 'LABOR_REPAIR',
      description: 'Bumper bracket correction & radiator support check',
      sellingPriceRs: 6000,
      buyingCostRs: 1500,
      assignedTechnician: 'Sunil Shantha',
      isCompleted: false,
    },
    {
      id: 'l5',
      rowNo: 1,
      category: 'REPLACEMENT',
      description: 'OEM Front Bumper Cover Axio 141 (Painted)',
      sellingPriceRs: 38500,
      buyingCostRs: 29000,
      assignedTechnician: 'Store / Sublet',
      isCompleted: true,
    },
    {
      id: 'l6',
      rowNo: 2,
      category: 'REPLACEMENT',
      description: 'Left Headlamp Unit LED Genuine Used',
      sellingPriceRs: 24000,
      buyingCostRs: 17500,
      assignedTechnician: 'Store / Sublet',
      isCompleted: false,
    },
  ],
  financials: {
    subtotalRemoveReassembleRs: 7000,
    subtotalRepairRs: 18000,
    subtotalReplacementRs: 62500,
    discountRs: 2500,
    taxRs: 0,
    grandTotalSalesRs: 85000,
    totalBuyingCostRs: 52800,
    grossProfitRs: 32200,
    grossMarginPct: 37.88,
    insuranceApprovedRs: 70000,
    customerPayableRs: 15000,
    advancePaidRs: 5000,
    balanceDueRs: 10000,
  },
  createdAt: '2026-11-02T08:00:00Z',
  updatedAt: '2026-11-02T10:00:00Z',
};

const SAMPLE_POS_RECEIPT: PosSaleReceipt = {
  id: 'pos-101',
  receiptNumber: 'POS-2026-0891',
  date: '2026-11-02 10:15 AM',
  customerNote: 'Walk-in Counter (WP GA-9090)',
  items: [
    {
      id: 'p1',
      description: 'Toyota Genuine Motor Oil 5W-30 (4L)',
      qty: 1,
      unitSellingPriceRs: 14500,
      unitBuyingCostRs: 11200,
      lineDiscountRs: 0,
      lineTotalSalesRs: 14500,
      lineTotalCostRs: 11200,
      lineGrossProfitRs: 3300,
    },
    {
      id: 'p2',
      description: 'Denso Oil Filter C-110',
      qty: 1,
      unitSellingPriceRs: 2200,
      unitBuyingCostRs: 1400,
      lineDiscountRs: 0,
      lineTotalSalesRs: 2200,
      lineTotalCostRs: 1400,
      lineGrossProfitRs: 800,
    },
    {
      id: 'p3',
      description: 'Wurth Windshield Washer Fluid 250ml',
      qty: 2,
      unitSellingPriceRs: 650,
      unitBuyingCostRs: 400,
      lineDiscountRs: 100,
      lineTotalSalesRs: 1200,
      lineTotalCostRs: 800,
      lineGrossProfitRs: 400,
    },
  ],
  subtotalRs: 18000,
  discountRs: 100,
  netTotalSalesRs: 17900,
  totalCostRs: 13400,
  grossProfitRs: 4500,
  paymentMethod: 'CASH',
  amountTenderedRs: 20000,
  changeGivenRs: 2100,
  cashierName: 'Kamal (Counter 1)',
};

export function InteractiveBenchPage() {
  const { toast } = useToast();
  const { isCostProfitVisible, permissions } = useAuth();
  const [activeTab, setActiveTab] = useState<'tables' | 'a4print' | 'posreceipt' | 'design-system'>('tables');
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState<boolean>(false);

  // Workshop Sheet State
  const [jobSheet, setJobSheet] = useState<WorkshopJobSheet>(INITIAL_JOB_SHEET);

  const handleLinesChange = (newLines: WorkshopLineItem[]) => {
    const updatedFinancials = calculateWorkshopFinancials(
      newLines,
      jobSheet.financials.discountRs,
      jobSheet.financials.taxRs,
      jobSheet.financials.insuranceApprovedRs,
      jobSheet.financials.advancePaidRs
    );

    setJobSheet((prev) => ({
      ...prev,
      lines: newLines,
      financials: updatedFinancials,
    }));
  };

  const handleStageChange = (newStage: DocumentStage) => {
    setJobSheet((prev) => ({
      ...prev,
      docStage: newStage,
    }));
    toast({
      title: 'Stage Changed',
      message: `Document stage switched to ${newStage}`,
      type: 'info',
    });
  };

  const handleFinancialFieldChange = (
    field: 'discountRs' | 'taxRs' | 'insuranceApprovedRs' | 'advancePaidRs',
    val: string
  ) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const recalc = calculateWorkshopFinancials(
      jobSheet.lines,
      field === 'discountRs' ? num : jobSheet.financials.discountRs,
      field === 'taxRs' ? num : jobSheet.financials.taxRs,
      field === 'insuranceApprovedRs' ? num : jobSheet.financials.insuranceApprovedRs,
      field === 'advancePaidRs' ? num : jobSheet.financials.advancePaidRs
    );
    setJobSheet((prev) => ({
      ...prev,
      financials: recalc,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-12" data-testid="interactive-bench-page">
      {/* Workbench Sub-Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 screen-only no-print">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-300 pb-3 mb-6 gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'tables' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('tables')}
              className="text-xs font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              1. Editable Workshop Tables (Keyboard Ready)
            </Button>
            <Button
              variant={activeTab === 'a4print' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('a4print')}
              className="text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              2. A4 Workshop Print Preview
            </Button>
            <Button
              variant={activeTab === 'posreceipt' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('posreceipt')}
              className="text-xs font-semibold"
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              3. 80mm POS Thermal Receipt
            </Button>
            <Button
              variant={activeTab === 'design-system' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('design-system')}
              className="text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              4. Design System Primitives
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              data-testid="print-trigger-btn"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Layout
            </Button>
            <div className="hidden sm:flex items-center space-x-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy Guard Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: EDITABLE WORKSHOP TABLES */}
      {activeTab === 'tables' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 screen-only no-print">
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    Workshop Repair Sheet: {jobSheet.header.vehicleNumber}
                  </h2>
                  <Badge
                    variant={
                      jobSheet.docStage === 'QUOTATION'
                        ? 'quotation'
                        : jobSheet.docStage === 'ESTIMATE'
                        ? 'estimate'
                        : jobSheet.docStage === 'JOB_CARD'
                        ? 'jobCard'
                        : 'invoice'
                    }
                  >
                    {jobSheet.docStage}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {jobSheet.header.vehicleMake} {jobSheet.header.vehicleModel} |{' '}
                  {jobSheet.header.natureOfRepair}
                </p>
              </div>

              {/* Stage Switcher */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-md text-xs">
                <span className="px-2 text-slate-500 font-medium">Stage:</span>
                {(['QUOTATION', 'ESTIMATE', 'JOB_CARD', 'INVOICE'] as DocumentStage[]).map(
                  (stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer',
                        jobSheet.docStage === stage
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {stage}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
                <div className="text-slate-500 font-medium">Customer Selling Total</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {formatRs(jobSheet.financials.grandTotalSalesRs)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Discount: {formatRs(jobSheet.financials.discountRs)}
                </div>
              </div>

              {/* Internal Buying Cost & Gross Profit: Strictly Enforced */}
              {isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit ? (
                <>
                  <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-md">
                    <div className="text-amber-800 font-medium flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Total Direct Buying Cost
                    </div>
                    <div className="text-base font-bold text-amber-950 mt-1">
                      {formatRs(jobSheet.financials.totalBuyingCostRs)}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-0.5">Parts + Sublet direct cost</div>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-md">
                    <div className="text-emerald-800 font-medium">Gross Profit & Margin</div>
                    <div className="text-base font-bold text-emerald-950 mt-1">
                      {formatRs(jobSheet.financials.grossProfitRs)}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Margin: <span className="font-bold">{jobSheet.financials.grossMarginPct}%</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 bg-slate-50 border border-dashed border-slate-300 p-3 rounded-md flex items-center justify-center text-slate-400 italic">
                  Internal Buying Costs & Profit hidden (Staff View)
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                <div className="text-blue-800 font-medium">Split Billing Balance Due</div>
                <div className="text-base font-bold text-blue-950 mt-1">
                  {formatRs(jobSheet.financials.balanceDueRs)}
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Ins. Approved: {formatRs(jobSheet.financials.insuranceApprovedRs)}
                </div>
              </div>
            </div>

            {/* Split Billing Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-200 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Overall Discount (Rs.)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={jobSheet.financials.discountRs || ''}
                  onChange={(e) => handleFinancialFieldChange('discountRs', e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs text-right"
                  data-testid="summary-discount-input"
                />
              </div>
              <div>
                <label className="font-semibold text-blue-900 block mb-1">
                  Insurance Approved Amount (Rs.)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={jobSheet.financials.insuranceApprovedRs || ''}
                  onChange={(e) => handleFinancialFieldChange('insuranceApprovedRs', e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs text-right border-blue-300"
                  data-testid="summary-insurance-input"
                />
              </div>
              <div>
                <label className="font-semibold text-emerald-900 block mb-1">
                  Customer Advance Paid (Rs.)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={jobSheet.financials.advancePaidRs || ''}
                  onChange={(e) => handleFinancialFieldChange('advancePaidRs', e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs text-right border-emerald-300"
                  data-testid="summary-advance-input"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-slate-600 bg-slate-200/70 px-4 py-2 rounded-md">
            <span>
              💡 <strong>Keyboard Ergonomics:</strong> Type amounts in any row and press{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">
                Enter
              </kbd>{' '}
              to automatically append a new row and focus its description field.
            </span>
            <span className="font-semibold text-slate-700">
              {jobSheet.lines.length} Total Lines Active
            </span>
          </div>

          {/* Section 1: Labor - Remove & Reassemble */}
          <WorkshopTable
            category="LABOR_REMOVE_REASSEMBLE"
            title="1. Labor - Remove & Reassemble"
            sectionNumber={1}
            items={jobSheet.lines}
            isCostProfitVisible={isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit}
            isJobCardMode={jobSheet.docStage === 'JOB_CARD'}
            onItemsChange={handleLinesChange}
          />

          {/* Section 2: Labor - Repair */}
          <WorkshopTable
            category="LABOR_REPAIR"
            title="2. Labor - Repair"
            sectionNumber={2}
            items={jobSheet.lines}
            isCostProfitVisible={isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit}
            isJobCardMode={jobSheet.docStage === 'JOB_CARD'}
            onItemsChange={handleLinesChange}
          />

          {/* Section 3: Replacement */}
          <WorkshopTable
            category="REPLACEMENT"
            title="3. Replacement Parts"
            sectionNumber={3}
            items={jobSheet.lines}
            isCostProfitVisible={isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit}
            isJobCardMode={jobSheet.docStage === 'JOB_CARD'}
            onItemsChange={handleLinesChange}
          />
        </main>
      )}

      {/* TAB 2: A4 WORKSHOP PRINT PREVIEW */}
      {activeTab === 'a4print' && (
        <div className="max-w-4xl mx-auto px-4 screen-only no-print mb-8">
          <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                A4 Laser Print Layout ({jobSheet.docStage})
              </h3>
              <p className="text-xs text-slate-500">
                12-Field Grid, 3-Section Format, Top Service Banner & Cost Redaction Active
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStageChange(
                    jobSheet.docStage === 'JOB_CARD' ? 'ESTIMATE' : 'JOB_CARD'
                  )
                }
                className="text-xs"
              >
                Toggle {jobSheet.docStage === 'JOB_CARD' ? 'Estimate Mode' : 'Job Card Mode'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                className="text-xs bg-slate-900"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print A4 Sheet
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto p-4 bg-slate-200 rounded-lg flex justify-center">
            <A4WorkshopPrint jobSheet={jobSheet} />
          </div>
        </div>
      )}

      {/* TAB 3: 80MM POS THERMAL RECEIPT PREVIEW */}
      {activeTab === 'posreceipt' && (
        <div className="max-w-xl mx-auto px-4 screen-only no-print mb-8">
          <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                80mm POS Thermal Receipt Preview
              </h3>
              <p className="text-xs text-slate-500">
                Standard ESC/POS thermal printer layout (Zero cost leakage)
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="text-xs bg-slate-900"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Receipt
            </Button>
          </div>

          <div className="p-6 bg-slate-200 rounded-lg flex justify-center">
            <ThermalReceiptPrint receipt={SAMPLE_POS_RECEIPT} />
          </div>
        </div>
      )}

      {/* TAB 4: DESIGN SYSTEM PRIMITIVES GALLERY */}
      {activeTab === 'design-system' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 screen-only no-print space-y-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Phase 1 Design System Primitives
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Tailwind CSS & shadcn/ui compliant reusable atoms with high contrast and optical alignment.
            </p>

            {/* Buttons */}
            <div className="space-y-3 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Buttons & Sizes
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="default">Default Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="warning">Warning / Internal</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link Style</Button>
                <Button size="sm">Small (sm)</Button>
                <Button size="lg">Large (lg)</Button>
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Inputs & Validation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Standard Text Input
                  </label>
                  <Input placeholder="Enter vehicle registration number..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Currency Numeric Input
                  </label>
                  <Input type="number" placeholder="0.00" className="text-right" />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-600 block mb-1">
                    Input with Error State
                  </label>
                  <Input error placeholder="Missing required field" />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Status & Stage Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="quotation">QUOTATION</Badge>
                <Badge variant="estimate">ESTIMATE</Badge>
                <Badge variant="jobCard">JOB CARD</Badge>
                <Badge variant="invoice">INVOICE</Badge>
                <Badge variant="success">PAID / APPROVED</Badge>
                <Badge variant="warning">WAITING FOR PARTS</Badge>
                <Badge variant="destructive">UNPAID / VOID</Badge>
                <Badge variant="info">IN PROGRESS</Badge>
                <Badge variant="secondary">DRAFT</Badge>
              </div>
            </div>

            {/* Dialog Trigger */}
            <div className="space-y-3 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Dialog / Modal Primitive
              </h3>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setIsDemoDialogOpen(true)}
                  className="cursor-pointer"
                >
                  Open Test Dialog
                </Button>
              </div>
            </div>

            {/* Toast Triggers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Toast Notifications
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: 'Success Notification',
                      message: 'Job Sheet saved successfully without CRM friction.',
                      type: 'success',
                    })
                  }
                >
                  Trigger Success Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: 'Validation Error',
                      message: 'Chassis number is required for insurance claims.',
                      type: 'error',
                    })
                  }
                >
                  Trigger Error Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: 'Security Alert',
                      message: 'Cost & Profit view is locked for non-manager roles.',
                      type: 'warning',
                    })
                  }
                >
                  Trigger Warning Toast
                </Button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Dialog Component Instance */}
      <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
        <DialogClose onClick={() => setIsDemoDialogOpen(false)} />
        <DialogHeader>
          <DialogTitle>Dialog Primitive Test</DialogTitle>
          <DialogDescription>
            High-contrast modal for confirmation and quick data intake.
          </DialogDescription>
        </DialogHeader>
      </Dialog>
    </div>
  );
}
