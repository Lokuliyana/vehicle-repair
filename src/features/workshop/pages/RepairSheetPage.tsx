import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Printer,
  Share2,
  Save,
  ArrowLeft,
  Lock,
  RefreshCw,
  Sparkles,
  Shield,
} from 'lucide-react';
import {
  WorkshopJobSheet,
  WorkshopLineItem,
  DocumentStage,
  WorkshopFloorStatus,
  RepairLineCategory,
  CatalogItem,
  VehicleHistoricalRecord,
} from '@/types';
import { calculateWorkshopFinancials, formatRs } from '@/utils/currency';
import { useAuth } from '@/app/providers/AuthProvider';
import { workshopJobRepository } from '../repository/workshop-job.repository.mock';
import { WorkshopTable } from '@/components/workshop/WorkshopTable';
import { VehicleLookupInput } from '../components/VehicleLookupInput';
import { CatalogCombobox } from '@/features/catalog/components/CatalogCombobox';
import { A4WorkshopPrint } from '@/components/print/A4WorkshopPrint';
import { buildWhatsAppShareUrl } from '@/utils/whatsapp';
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
import { cn } from '@/utils/cn';

const NATURE_OF_REPAIR_PRESETS = [
  'Accident Repair',
  'Mechanical',
  'Electrical',
  'Scanning',
  'Tinkering',
  'Auto Paint',
];

const INSURANCE_PRESETS = [
  'Sri Lanka Insurance Corporation (SLIC)',
  'Ceylinco General Insurance',
  'Fairfirst Insurance',
  'Allianz Insurance Lanka',
  'AIA Insurance',
  'Direct Cash Customer',
];

export function RepairSheetPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { permissions, isCostProfitVisible } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(id);

  // Core Job Sheet State
  const [jobNumber, setJobNumber] = useState('');
  const [docStage, setDocStage] = useState<DocumentStage>('QUOTATION');
  const [floorStatus, setFloorStatus] = useState<WorkshopFloorStatus>('DRAFT');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [natureOfRepair, setNatureOfRepair] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [daysForCompletion, setDaysForCompletion] = useState('');
  const [yearOfMake, setYearOfMake] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [insuranceName, setInsuranceName] = useState('');
  const [customerInfo, setCustomerInfo] = useState('');

  // Line items
  const [lines, setLines] = useState<WorkshopLineItem[]>([]);

  // Financial inputs
  const [discountRs, setDiscountRs] = useState<number>(0);
  const [taxRs, setTaxRs] = useState<number>(0);
  const [insuranceApprovedRs, setInsuranceApprovedRs] = useState<number>(0);
  const [advancePaidRs, setAdvancePaidRs] = useState<number>(0);
  const [originalSnapshot, setOriginalSnapshot] = useState<string | undefined>();

  // Fetch or initialize job sheet
  useEffect(() => {
    let isCancelled = false;

    const loadSheet = async () => {
      setIsLoading(true);
      try {
        if (id && id !== 'new') {
          const existing = await workshopJobRepository.getById(id);
          if (existing && !isCancelled) {
            setCurrentId(existing.id);
            setJobNumber(existing.jobNumber);
            setDocStage(existing.docStage);
            setFloorStatus(existing.floorStatus);
            setDate(existing.header.date);
            setVehicleNumber(existing.header.vehicleNumber || '');
            setNatureOfRepair(existing.header.natureOfRepair || '');
            setVehicleMake(existing.header.vehicleMake || '');
            setChassisNumber(existing.header.chassisNumber || '');
            setVehicleModel(existing.header.vehicleModel || '');
            setDaysForCompletion(existing.header.daysForCompletion || '');
            setYearOfMake(existing.header.yearOfMake || '');
            setVehicleColor(existing.header.vehicleColor || '');
            setInsuranceName(existing.header.insuranceName || '');
            setCustomerInfo(existing.header.customerInfo || '');
            setLines(existing.lines || []);
            setDiscountRs(existing.financials?.discountRs || 0);
            setTaxRs(existing.financials?.taxRs || 0);
            setInsuranceApprovedRs(existing.financials?.insuranceApprovedRs || 0);
            setAdvancePaidRs(existing.financials?.advancePaidRs || 0);
            setOriginalSnapshot(existing.originalEstimateSnapshot);
            setIsLoading(false);
            return;
          }
        }

        // New sheet initialization
        const nextJobNo = await workshopJobRepository.getNextJobNumber();
        if (!isCancelled) {
          setCurrentId(undefined);
          setJobNumber(nextJobNo);
          setDocStage('QUOTATION');
          setFloorStatus('DRAFT');
          setDate(new Date().toISOString().split('T')[0]);
          setVehicleNumber('');
          setNatureOfRepair('');
          setVehicleMake('');
          setChassisNumber('');
          setVehicleModel('');
          setDaysForCompletion('');
          setYearOfMake('');
          setVehicleColor('');
          setInsuranceName('');
          setCustomerInfo('');
          setLines([]);
          setDiscountRs(0);
          setTaxRs(0);
          setInsuranceApprovedRs(0);
          setAdvancePaidRs(0);
          setOriginalSnapshot(undefined);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading workshop sheet:', err);
        if (!isCancelled) {
          toast({
            title: 'Error',
            message: 'Failed to load repair sheet details',
            type: 'error',
          });
          setIsLoading(false);
        }
      }
    };

    loadSheet();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Recalculate financials dynamically whenever lines or finance inputs change
  const financials = useMemo(() => {
    return calculateWorkshopFinancials(
      lines,
      discountRs,
      taxRs,
      insuranceApprovedRs,
      advancePaidRs
    );
  }, [lines, discountRs, taxRs, insuranceApprovedRs, advancePaidRs]);

  // Auto-populate from vehicle lookup history
  const handleVehiclePopulate = (record: VehicleHistoricalRecord) => {
    setVehicleNumber(record.vehicleNumber);
    if (record.vehicleMake) setVehicleMake(record.vehicleMake);
    if (record.vehicleModel) setVehicleModel(record.vehicleModel);
    if (record.yearOfMake) setYearOfMake(record.yearOfMake);
    if (record.vehicleColor) setVehicleColor(record.vehicleColor);
    if (record.chassisNumber) setChassisNumber(record.chassisNumber);
    if (record.insuranceName) setInsuranceName(record.insuranceName);
    if (record.customerInfo) setCustomerInfo(record.customerInfo);

    toast({
      title: 'Vehicle Details Loaded',
      message: `Loaded details for ${record.vehicleNumber} (${record.vehicleMake} ${record.vehicleModel})`,
      type: 'info',
    });
  };

  // Preset addition from CatalogCombobox
  const handleAddCatalogPreset = (item: CatalogItem) => {
    let targetCategory: RepairLineCategory = 'REPLACEMENT';
    if (item.itemType === 'LABOR_REMOVE_REASSEMBLE') {
      targetCategory = 'LABOR_REMOVE_REASSEMBLE';
    } else if (item.itemType === 'LABOR_REPAIR') {
      targetCategory = 'LABOR_REPAIR';
    }

    const sectionItems = lines.filter((l) => l.category === targetCategory);
    const newLine: WorkshopLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rowNo: sectionItems.length + 1,
      category: targetCategory,
      catalogItemId: item.id,
      description: item.name,
      sellingPriceRs: item.sellingPriceRs,
      buyingCostRs: item.buyingCostRs,
      assignedTechnician: '',
      isCompleted: false,
    };

    // Insert cleanly in group
    const lastCategoryIdx = lines.map((l) => l.category).lastIndexOf(targetCategory);
    let updated: WorkshopLineItem[];
    if (lastCategoryIdx >= 0) {
      updated = [
        ...lines.slice(0, lastCategoryIdx + 1),
        newLine,
        ...lines.slice(lastCategoryIdx + 1),
      ];
    } else {
      updated = [...lines, newLine];
    }

    // Renumber
    let count = 1;
    const renumbered = updated.map((it) => {
      if (it.category === targetCategory) {
        return { ...it, rowNo: count++ };
      }
      return it;
    });

    setLines(renumbered);
    toast({
      title: 'Preset Added',
      message: `Added "${item.name}" to ${targetCategory.replace(/_/g, ' ')}`,
      type: 'success',
    });
  };

  const handleAddCustomCatalogItem = (customDesc: string) => {
    const targetCategory: RepairLineCategory = 'REPLACEMENT';
    const sectionItems = lines.filter((l) => l.category === targetCategory);
    const newLine: WorkshopLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rowNo: sectionItems.length + 1,
      category: targetCategory,
      description: customDesc,
      sellingPriceRs: 0,
      buyingCostRs: 0,
      assignedTechnician: '',
      isCompleted: false,
    };
    setLines([...lines, newLine]);
    toast({
      title: 'Custom Item Added',
      message: `Added custom line "${customDesc}". Please enter the selling price.`,
      type: 'info',
    });
  };

  // Convert Document Stage
  const handleStageTransition = (newStage: DocumentStage) => {
    if (newStage === docStage) return;

    // Snapshot locking rule for Estimate / Quotation -> Job Card
    let snapshot = originalSnapshot;
    if ((docStage === 'ESTIMATE' || docStage === 'QUOTATION') && newStage === 'JOB_CARD' && !originalSnapshot) {
      const currentSheetToLock: WorkshopJobSheet = {
        id: currentId || 'temp-id',
        jobNumber,
        docStage,
        floorStatus,
        paymentStatus: 'UNPAID',
        header: {
          date,
          jobNumber,
          vehicleNumber,
          natureOfRepair,
          vehicleMake,
          chassisNumber,
          vehicleModel,
          daysForCompletion,
          yearOfMake,
          vehicleColor,
          insuranceName,
          customerInfo,
        },
        lines,
        financials,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      snapshot = JSON.stringify(currentSheetToLock);
      setOriginalSnapshot(snapshot);
    }

    setDocStage(newStage);

    // Contextual floor status adjustment
    if (newStage === 'JOB_CARD' && floorStatus === 'DRAFT') {
      setFloorStatus('APPROVED_IN_PROGRESS');
    } else if (newStage === 'INVOICE' && floorStatus !== 'COMPLETED_DELIVERED') {
      setFloorStatus('READY_FOR_DELIVERY');
    }

    toast({
      title: 'Document Stage Converted',
      message: `Document transitioned to ${newStage} with zero data loss.`,
      type: 'info',
    });
  };

  // Save to repository
  const handleSave = async () => {
    if (!vehicleNumber.trim()) {
      toast({
        title: 'Vehicle Number Required',
        message: 'Please enter a vehicle registration number before saving.',
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      const header = {
        date,
        jobNumber,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        natureOfRepair: natureOfRepair.trim(),
        vehicleMake: vehicleMake.trim(),
        chassisNumber: chassisNumber.trim(),
        vehicleModel: vehicleModel.trim(),
        daysForCompletion: daysForCompletion.trim(),
        yearOfMake: yearOfMake.trim(),
        vehicleColor: vehicleColor.trim(),
        insuranceName: insuranceName.trim(),
        customerInfo: customerInfo.trim(),
      };

      if (currentId) {
        // Update existing
        const updated = await workshopJobRepository.update(currentId, {
          jobNumber,
          docStage,
          floorStatus,
          header,
          lines,
          discountRs,
          taxRs,
          insuranceApprovedRs,
          advancePaidRs,
          originalEstimateSnapshot: originalSnapshot,
        });
        setCurrentId(updated.id);
        toast({
          title: 'Repair Sheet Updated',
          message: `Saved ${updated.jobNumber} successfully.`,
          type: 'success',
        });
      } else {
        // Create new
        const created = await workshopJobRepository.create({
          jobNumber,
          docStage,
          floorStatus,
          paymentStatus: 'UNPAID',
          header,
          lines,
          discountRs,
          taxRs,
          insuranceApprovedRs,
          advancePaidRs,
          originalEstimateSnapshot: originalSnapshot,
        });
        setCurrentId(created.id);
        setJobNumber(created.jobNumber);
        toast({
          title: 'Repair Sheet Created',
          message: `Created ${created.jobNumber} successfully.`,
          type: 'success',
        });
        navigate(`/workshop/sheet/${created.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Save Failed',
        message: 'Could not save the repair sheet to repository.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Build current JobSheet object for printing / sharing
  const activeJobSheet: WorkshopJobSheet = useMemo(() => {
    return {
      id: currentId || 'temp',
      jobNumber: jobNumber || 'DRAFT',
      docStage,
      floorStatus,
      paymentStatus: financials.balanceDueRs <= 0 ? 'PAID' : 'UNPAID',
      header: {
        date,
        jobNumber: jobNumber || 'DRAFT',
        vehicleNumber: vehicleNumber.toUpperCase(),
        natureOfRepair,
        vehicleMake,
        chassisNumber,
        vehicleModel,
        daysForCompletion,
        yearOfMake,
        vehicleColor,
        insuranceName,
        customerInfo,
      },
      lines,
      financials,
      originalEstimateSnapshot: originalSnapshot,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    currentId,
    jobNumber,
    docStage,
    floorStatus,
    date,
    vehicleNumber,
    natureOfRepair,
    vehicleMake,
    chassisNumber,
    vehicleModel,
    daysForCompletion,
    yearOfMake,
    vehicleColor,
    insuranceName,
    customerInfo,
    lines,
    financials,
    originalSnapshot,
  ]);

  const handleShareWhatsApp = () => {
    const url = buildWhatsAppShareUrl(activeJobSheet);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerPrint = () => {
    setIsPrintModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-500" />
          <p className="text-xs text-slate-500 font-medium">Loading repair sheet...</p>
        </div>
      </div>
    );
  }

  const canShowCostProfit = isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit;
  const isJobCardMode = docStage === 'JOB_CARD';

  return (
    <div
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      data-testid="repair-sheet-page"
    >
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <Link to="/workshop/jobs">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
              <ArrowLeft className="w-4 h-4" />
              <span>Jobs History</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                {currentId ? `Edit Sheet: ${jobNumber}` : `New Repair Sheet (${jobNumber})`}
              </h1>
              <Badge
                variant={
                  docStage === 'INVOICE'
                    ? 'success'
                    : docStage === 'JOB_CARD'
                    ? 'info'
                    : 'warning'
                }
                className="font-bold uppercase tracking-wider text-[10px]"
                data-testid="sheet-stage-badge"
              >
                {docStage}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Zero-CRM high-speed collision estimation & workshop billing
            </p>
          </div>
        </div>

        {/* Right Actions: Conversion buttons, Print, WhatsApp, Save */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Document Stage Conversion Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(['QUOTATION', 'ESTIMATE', 'JOB_CARD', 'INVOICE'] as DocumentStage[]).map(
              (stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleStageTransition(stage)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                    docStage === stage
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                  data-testid={`stage-toggle-${stage.toLowerCase()}`}
                >
                  {stage === 'JOB_CARD' ? 'Job Card' : stage.charAt(0) + stage.slice(1).toLowerCase()}
                </button>
              )
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerPrint}
            className="text-xs h-8 border-slate-300 font-semibold gap-1.5"
            data-testid="print-sheet-btn"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print A4</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShareWhatsApp}
            className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold gap-1.5"
            data-testid="whatsapp-share-btn"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-xs"
            data-testid="save-sheet-btn"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Sheet'}</span>
          </Button>
        </div>
      </div>

      {/* 12-Field Vehicle / Insurance / Customer Header Form Grid */}
      <div
        className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4 no-print"
        data-testid="sheet-header-grid"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Vehicle, Insurance & Customer Information (12-Field Header)
            </h2>
            <span className="text-[11px] text-slate-400">
              • Direct freeform entry (No CRM pre-registration required)
            </span>
          </div>
          {floorStatus && (
            <Badge variant="outline" className="text-[11px] font-mono">
              Status: {floorStatus.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Row 1: Date | Job Number */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Date:
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-xs font-medium"
              data-testid="header-date"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Job Number:
            </label>
            <Input
              type="text"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value.toUpperCase())}
              className="h-8 text-xs font-bold font-mono text-slate-800 bg-slate-50"
              data-testid="header-job-number"
            />
          </div>

          {/* Row 2: Vehicle Number (Integrated VehicleLookupInput) | Nature of Repair */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Vehicle Number:
            </label>
            <VehicleLookupInput
              value={vehicleNumber}
              onChange={setVehicleNumber}
              onPopulate={handleVehiclePopulate}
              placeholder="e.g. CAB-4521 or WP CBA-1234"
              className="h-8 text-xs font-bold font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Nature of Repair:
              </label>
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {NATURE_OF_REPAIR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNatureOfRepair(preset)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 whitespace-nowrap cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <Input
              type="text"
              value={natureOfRepair}
              onChange={(e) => setNatureOfRepair(e.target.value)}
              placeholder="e.g. Accident Damage Front Left Side & Bumper Replacement"
              className="h-8 text-xs"
              data-testid="header-nature-of-repair"
            />
          </div>

          {/* Row 3: Vehicle Make | Chassis Number */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Vehicle Make:
            </label>
            <Input
              type="text"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              placeholder="e.g. Toyota, Honda, Nissan, Suzuki"
              className="h-8 text-xs"
              data-testid="header-vehicle-make"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Chassis Number:
            </label>
            <Input
              type="text"
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
              placeholder="e.g. NZE141-9034821"
              className="h-8 text-xs font-mono"
              data-testid="header-chassis-number"
            />
          </div>

          {/* Row 4: Vehicle Model | No of Days Completion */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Vehicle Model:
            </label>
            <Input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="e.g. Corolla Axio, Vezel Hybrid, Wagon R"
              className="h-8 text-xs"
              data-testid="header-vehicle-model"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              No of Days Completion:
            </label>
            <Input
              type="text"
              value={daysForCompletion}
              onChange={(e) => setDaysForCompletion(e.target.value)}
              placeholder="e.g. 4 Days or 1 Week"
              className="h-8 text-xs"
              data-testid="header-days-for-completion"
            />
          </div>

          {/* Row 5: Year of Make | Vehicle Color */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Year of Make:
            </label>
            <Input
              type="text"
              value={yearOfMake}
              onChange={(e) => setYearOfMake(e.target.value)}
              placeholder="e.g. 2018"
              className="h-8 text-xs font-mono"
              data-testid="header-year-of-make"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Vehicle Color:
            </label>
            <Input
              type="text"
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              placeholder="e.g. Pearl White (070), Silver Metallic"
              className="h-8 text-xs"
              data-testid="header-vehicle-color"
            />
          </div>

          {/* Row 6 (Full Width): Name of Insurance */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Name of Insurance:
              </label>
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {INSURANCE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInsuranceName(preset)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 whitespace-nowrap cursor-pointer"
                  >
                    {preset.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <Input
              type="text"
              value={insuranceName}
              onChange={(e) => setInsuranceName(e.target.value)}
              placeholder="e.g. Sri Lanka Insurance Corporation (SLIC) or Direct Cash"
              className="h-8 text-xs font-medium"
              data-testid="header-insurance-name"
            />
          </div>

          {/* Row 7 (Full Width): Customer Information */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Customer Information:
            </label>
            <Input
              type="text"
              value={customerInfo}
              onChange={(e) => setCustomerInfo(e.target.value)}
              placeholder="Type customer name, phone number, and address directly (e.g. Kasun Perera - 077 889 1234 / No 45, Galle Road)"
              className="h-8 text-xs"
              data-testid="header-customer-info"
            />
          </div>
        </div>
      </div>

      {/* Preset Insertion Area: CatalogCombobox */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-2 no-print">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Quick Preset Insertion (Parts & Labor Catalog)
          </label>
          <span className="text-[11px] text-slate-400">
            Auto-routes to Remove/Reassemble, Repair, or Replacement table
          </span>
        </div>
        <CatalogCombobox
          onSelect={handleAddCatalogPreset}
          onSelectCustom={handleAddCustomCatalogItem}
          placeholder="Search catalog by SKU, part name, labor preset, or vehicle model..."
        />
      </div>

      {/* 3 Dynamic Line-Item Tables */}
      <div className="space-y-6 no-print">
        {/* Table 1: Labor - Remove & Reassemble */}
        <WorkshopTable
          category="LABOR_REMOVE_REASSEMBLE"
          title="Labor - Remove & Reassemble"
          sectionNumber={1}
          items={lines}
          isCostProfitVisible={canShowCostProfit}
          isJobCardMode={isJobCardMode}
          onItemsChange={setLines}
        />

        {/* Table 2: Labor - Repair */}
        <WorkshopTable
          category="LABOR_REPAIR"
          title="Labor - Repair"
          sectionNumber={2}
          items={lines}
          isCostProfitVisible={canShowCostProfit}
          isJobCardMode={isJobCardMode}
          onItemsChange={setLines}
        />

        {/* Table 3: Replacement (Spare Parts & Materials) */}
        <WorkshopTable
          category="REPLACEMENT"
          title="Replacement"
          sectionNumber={3}
          items={lines}
          isCostProfitVisible={canShowCostProfit}
          isJobCardMode={isJobCardMode}
          onItemsChange={setLines}
        />
      </div>

      {/* Financials & Embedded Profit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Customer & Insurance Settlement Card */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
            Invoice & Settlement Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Sub Total (Remove & Reassemble):</span>
              <span className="font-semibold text-slate-900">
                {formatRs(financials.subtotalRemoveReassembleRs)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Sub Total (Repair):</span>
              <span className="font-semibold text-slate-900">
                {formatRs(financials.subtotalRepairRs)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Sub Total (Replacement):</span>
              <span className="font-semibold text-slate-900">
                {formatRs(financials.subtotalReplacementRs)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 font-bold border-b border-slate-200 text-slate-800">
              <span>Gross Sales:</span>
              <span>
                {formatRs(
                  financials.subtotalRemoveReassembleRs +
                    financials.subtotalRepairRs +
                    financials.subtotalReplacementRs
                )}
              </span>
            </div>

            {/* Discount & Tax inputs */}
            <div className="grid grid-cols-2 gap-3 py-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Discount (Rs.):
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountRs === 0 ? '' : discountRs}
                  onChange={(e) => setDiscountRs(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-8 text-xs text-right text-red-700"
                  data-testid="finance-discount-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Tax / VAT (Rs.):
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRs === 0 ? '' : taxRs}
                  onChange={(e) => setTaxRs(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-8 text-xs text-right"
                  data-testid="finance-tax-input"
                />
              </div>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-slate-900 bg-slate-50 px-2 rounded font-black text-sm text-slate-900">
              <span>Grand Total Sales:</span>
              <span className="text-emerald-700" data-testid="grand-total-amount">
                {formatRs(financials.grandTotalSalesRs)}
              </span>
            </div>

            {/* Insurance Split Billing */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Insurance Split Billing
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">
                    Insurance Approved:
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={insuranceApprovedRs === 0 ? '' : insuranceApprovedRs}
                    onChange={(e) => setInsuranceApprovedRs(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="h-8 text-xs text-right text-blue-900 font-semibold"
                    data-testid="finance-insurance-approved-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">
                    Customer Excess / Payable:
                  </label>
                  <div className="h-8 px-2 flex items-center justify-end rounded border border-slate-200 bg-slate-50 font-bold text-slate-900">
                    {formatRs(financials.customerPayableRs)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">
                    Advance Paid:
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePaidRs === 0 ? '' : advancePaidRs}
                    onChange={(e) => setAdvancePaidRs(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="h-8 text-xs text-right text-emerald-800 font-medium"
                    data-testid="finance-advance-paid-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">
                    Balance Due:
                  </label>
                  <div
                    className={cn(
                      'h-8 px-2 flex items-center justify-end rounded border font-black',
                      financials.balanceDueRs > 0
                        ? 'border-amber-300 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    )}
                    data-testid="finance-balance-due-display"
                  >
                    {formatRs(financials.balanceDueRs)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost & Gross Profit Card (Visible ONLY for Owner / Manager when toggle is ON) */}
        {isCostProfitVisible && permissions.canViewCosts && permissions.canViewGrossProfit ? (
          <div
            className="bg-amber-50/70 rounded-xl border border-amber-300 p-5 shadow-xs space-y-4"
            data-testid="cost-profit-panel"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Embedded Workshop Gross Profit & Direct Cost
              </h3>
              <Badge variant="warning" className="text-[10px] font-bold">
                INTERNAL PRIVACY
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-amber-900 font-medium">Net Sales Revenue:</span>
                <span className="font-bold text-slate-900">
                  {formatRs(
                    financials.subtotalRemoveReassembleRs +
                      financials.subtotalRepairRs +
                      financials.subtotalReplacementRs -
                      financials.discountRs
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-amber-900 font-medium">
                  Total Buying / Direct Cost (Parts & Sublet):
                </span>
                <span className="font-bold text-red-900" data-testid="total-buying-cost-display">
                  {formatRs(financials.totalBuyingCostRs)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-y-2 border-amber-400 bg-white/70 px-3 rounded font-black text-sm">
                <span className="text-amber-950">Workshop Gross Profit:</span>
                <span
                  className={cn(
                    financials.grossProfitRs >= 0 ? 'text-emerald-700' : 'text-red-700'
                  )}
                  data-testid="gross-profit-amount"
                >
                  {formatRs(financials.grossProfitRs)}
                </span>
              </div>

              <div className="flex justify-between py-1 px-1">
                <span className="text-amber-900 font-bold">Gross Margin %:</span>
                <span className="font-black text-slate-900" data-testid="gross-margin-pct">
                  {financials.grossMarginPct}%
                </span>
              </div>

              <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded border border-amber-200 flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Privacy Invariant:</strong> Buying costs and gross profit margins
                  are strictly excluded from the printout, PDF, WhatsApp share, and technician Job
                  Cards.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <Lock className="w-6 h-6 text-slate-400" />
            <h4 className="text-xs font-bold text-slate-700">Internal Cost Mode Disabled</h4>
            <p className="text-[11px] text-slate-500 max-w-sm">
              {permissions.canViewCosts
                ? 'Toggle "Costs & Margin: ON" in top bar to audit buying costs and gross profit.'
                : 'Role lacks authorization to view internal buying costs and profit margins.'}
            </p>
          </div>
        )}
      </div>

      {/* A4 Print Modal / Document */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <div className="p-4 sm:p-6 space-y-4 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <Printer className="w-4 h-4 text-slate-700" />
                  A4 Print Layout Preview ({docStage})
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Exact match to standard workshop estimate templates with 1px black borders.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-black text-white text-xs h-8 font-bold gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Now
                </Button>
                <DialogClose onClick={() => setIsPrintModalOpen(false)} />
              </div>
            </div>
          </DialogHeader>

          {/* Render the printable component */}
          <div className="border border-slate-300 rounded shadow-inner p-2 sm:p-4 bg-slate-100 flex justify-center print:border-none print:shadow-none print:p-0 print:bg-transparent">
            <A4WorkshopPrint jobSheet={activeJobSheet} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
