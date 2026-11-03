import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Car, Lock, Plus, Trash2, Copy, CheckCircle2, X, Shield, Printer, CreditCard } from 'lucide-react';
import { globalDesignManager } from '../global-manager';
import { DocumentStage, WorkshopFloorStatus } from '@/types';

export const WorkshopDocumentStageBanner: React.FC<{
  stage: DocumentStage;
  jobNumber: string;
  onConvert?: () => void;
  convertLabel?: string;
}> = ({ stage, jobNumber, onConvert, convertLabel }) => {
  const badgeClasses = globalDesignManager.getStatusBadgeClasses(stage);

  return (
    <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-[16px] border border-slate-200/80 shadow-xs gap-3">
      <div className="flex items-center gap-3">
        <span className={clsx('px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', badgeClasses)}>
          {stage.replace('_', ' ')}
        </span>
        <span className="text-sm font-mono font-bold text-slate-900">{jobNumber}</span>
      </div>
      {onConvert && convertLabel && (
        <button
          type="button"
          onClick={onConvert}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-[10px] transition-all shadow-xs"
        >
          {convertLabel} ➔
        </button>
      )}
    </div>
  );
};

export interface VehicleHeader12FieldMatrixProps {
  data: {
    date: string;
    jobNumber: string;
    vehicleNumber: string;
    natureOfRepair: string;
    make: string;
    chassisNumber: string;
    model: string;
    completionDays: number;
    yearOfMake: number | string;
    vehicleColor: string;
    insuranceName: string;
    customerInfo: string;
  };
  onChange: (field: string, val: any) => void;
  disabled?: boolean;
}

export const VehicleHeader12FieldMatrix: React.FC<VehicleHeader12FieldMatrixProps> = ({
  data,
  onChange,
  disabled,
}) => {
  return (
    <div className="p-5 bg-white rounded-[16px] border border-slate-200/80 shadow-xs flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
        <Car className="w-4 h-4 text-[#F95700]" />
        <span>Vehicle & Intake Identification Matrix</span>
      </h3>
      {/* 7-Row Strict Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Row 1 */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Date</label>
          <input
            type="date"
            disabled={disabled}
            value={data.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-[8px] font-mono text-slate-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Job Number</label>
          <input
            type="text"
            readOnly
            value={data.jobNumber}
            className="h-9 px-3 bg-slate-100 border border-slate-200 rounded-[8px] font-mono font-bold text-slate-700"
          />
        </div>

        {/* Row 2 */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Vehicle Number</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="e.g. CBA-1234"
            value={data.vehicleNumber}
            onChange={(e) => onChange('vehicleNumber', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px] font-mono font-bold text-slate-900 uppercase"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Nature of Repair</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Accident / Mechanical / Paint"
            value={data.natureOfRepair}
            onChange={(e) => onChange('natureOfRepair', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px] text-slate-900"
          />
        </div>

        {/* Row 3 */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Vehicle Make</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Toyota / Honda"
            value={data.make}
            onChange={(e) => onChange('make', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Chassis Number</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Chassis / VIN"
            value={data.chassisNumber}
            onChange={(e) => onChange('chassisNumber', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px] font-mono uppercase"
          />
        </div>

        {/* Row 4 */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Vehicle Model</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Prius / Premio / Aqua"
            value={data.model}
            onChange={(e) => onChange('model', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">No of Days Completion</label>
          <input
            type="number"
            disabled={disabled}
            value={data.completionDays}
            onChange={(e) => onChange('completionDays', parseInt(e.target.value) || 0)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px] font-mono"
          />
        </div>

        {/* Row 5 */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Year of Make</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="2018"
            value={data.yearOfMake}
            onChange={(e) => onChange('yearOfMake', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px] font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Vehicle Color</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Pearl White / Black"
            value={data.vehicleColor}
            onChange={(e) => onChange('vehicleColor', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px]"
          />
        </div>

        {/* Row 6: Insurance (Full Width) */}
        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Name of Insurance</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Ceylinco VIP / Sri Lanka Insurance / Allianz"
            value={data.insuranceName}
            onChange={(e) => onChange('insuranceName', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px]"
          />
        </div>

        {/* Row 7: Customer Info (Full Width) */}
        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="font-semibold text-slate-600">Customer Information (Name, Phone, Address)</label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Direct typing: Mr. Perera, 077 123 4567, Colombo 03"
            value={data.customerInfo}
            onChange={(e) => onChange('customerInfo', e.target.value)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-[8px]"
          />
        </div>
      </div>
    </div>
  );
};

export const SmartPlateAutocompleteInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (plate: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
  'data-testid'?: string;
}> = ({
  value,
  onChange,
  onSelectSuggestion,
  suggestions = [],
  placeholder = 'CBA-1234',
  className,
  'data-testid': testId = 'smart-plate-autocomplete-input',
}) => {
  return (
    <div className={clsx('relative', className)}>
      <input
        type="text"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
        className="h-10 px-3.5 bg-white border border-slate-200 rounded-[10px] font-mono font-bold text-sm uppercase text-slate-900 focus:outline-none focus:border-[#F95700] w-full"
      />
      {suggestions.length > 0 && (
        <div
          data-testid={`${testId}-dropdown`}
          className="absolute z-10 top-full mt-1 left-0 w-48 bg-white border border-slate-200 rounded-[10px] shadow-lg p-1"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSelectSuggestion?.(s)}
              className="w-full text-left px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 hover:bg-slate-50 rounded-md"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LiveGrossProfitRibbon: React.FC<{
  grossSalesRs: number;
  directCostRs: number;
  grossProfitRs: number;
  marginPercent: number;
  isCostVisible: boolean;
}> = ({ grossSalesRs, directCostRs, grossProfitRs, marginPercent, isCostVisible }) => {
  if (!isCostVisible) return null;

  const health = globalDesignManager.getMarginHealth(marginPercent);

  return (
    <div className="flex flex-wrap items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-[12px] text-xs">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-emerald-700" />
        <span className="font-bold text-emerald-950">Internal Profit Telemetry</span>
      </div>
      <div className="flex items-center gap-6 font-mono text-xs">
        <div>
          <span className="text-slate-500 block text-[10px]">Gross Sales</span>
          <span className="font-bold text-slate-900">{globalDesignManager.formatRs(grossSalesRs)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Direct Cost</span>
          <span className="font-bold text-slate-700">{globalDesignManager.formatRs(directCostRs)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Gross Profit</span>
          <span className="font-bold text-emerald-800">{globalDesignManager.formatRs(grossProfitRs)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Margin %</span>
          <span className={clsx('font-bold', health.textColor)}>{marginPercent.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export const FloorStatusStepperBar: React.FC<{
  currentStatus: WorkshopFloorStatus;
  onStatusSelect?: (st: WorkshopFloorStatus) => void;
}> = ({ currentStatus, onStatusSelect }) => {
  const steps: WorkshopFloorStatus[] = [
    'DRAFT',
    'PENDING_INSURANCE_APPROVAL',
    'APPROVED_IN_PROGRESS',
    'WAITING_FOR_PARTS',
    'QUALITY_CHECK',
    'READY_FOR_DELIVERY',
    'COMPLETED_DELIVERED',
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2" data-testid="floor-status-stepper-bar">
      {steps.map((st, i) => {
        const isCurrent = st === currentStatus;
        return (
          <button
            key={st}
            type="button"
            onClick={() => onStatusSelect?.(st)}
            data-testid={`stepper-step-${st.toLowerCase()}`}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
              isCurrent
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {i + 1}. {st.replace(/_/g, ' ')}
          </button>
        );
      })}
    </div>
  );
};

export const InsuranceSplitBillingCalculator: React.FC<{
  grandTotal: number;
  insuranceApproved: number;
  advancePaid: number;
  onInsuranceChange: (val: number) => void;
  onAdvanceChange: (val: number) => void;
  grossTotal?: number;
  discount?: number;
  tax?: number;
  insuranceSettled?: number;
  onDiscountChange?: (val: number) => void;
  onTaxChange?: (val: number) => void;
  onCollectPayment?: () => void;
  onCollectInsurance?: () => void;
  isReadOnly?: boolean;
  className?: string;
}> = ({
  grandTotal,
  insuranceApproved,
  advancePaid,
  onInsuranceChange,
  onAdvanceChange,
  grossTotal,
  discount = 0,
  tax = 0,
  insuranceSettled = 0,
  onDiscountChange,
  onTaxChange,
  onCollectPayment,
  onCollectInsurance,
  isReadOnly = false,
  className,
}) => {
  const actualGross = grossTotal !== undefined ? grossTotal : (grandTotal + discount - tax);
  const netInvoiceTotal = grandTotal;
  const customerPayable = Math.max(0, netInvoiceTotal - insuranceApproved);
  const balanceDue = Math.max(0, customerPayable - advancePaid);
  const isOverpaid = customerPayable < advancePaid;
  const refundDue = isOverpaid ? advancePaid - customerPayable : 0;
  const insuranceBalance = Math.max(0, insuranceApproved - insuranceSettled);

  return (
    <div
      className={clsx(
        'rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col gap-5 text-xs',
        className
      )}
      data-testid="insurance-split-billing-card"
    >
      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Insurance & Excess Settlement</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Step-down invoice settlement terminal & live balance ledger
          </p>
        </div>
      </div>

      {/* Step-down Waterfall */}
      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-2">
        <div className="flex justify-between items-center text-slate-600">
          <span className="font-medium">Gross Total</span>
          <span className="font-sans tabular-nums font-bold text-slate-800" data-testid="split-gross-total">
            {globalDesignManager.formatRs(actualGross)}
          </span>
        </div>

        <div className="flex justify-between items-center text-red-600">
          <span className="flex items-center gap-1">
            <span>− Less Discount</span>
          </span>
          <div className="flex items-center gap-1" data-testid="split-discount">
            {onDiscountChange && !isReadOnly ? (
              <>
                <span className="text-slate-400 font-sans tabular-nums">Rs.</span>
                <input
                  type="number"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  data-testid="discount-input"
                  className="w-24 h-7 px-2 text-right bg-white border border-slate-200 rounded font-sans tabular-nums text-xs font-semibold text-red-600"
                />
              </>
            ) : (
              <span className="font-sans tabular-nums font-semibold">
                − {globalDesignManager.formatRs(discount)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1">
            <span>+ Add Tax / VAT</span>
          </span>
          <div className="flex items-center gap-1" data-testid="split-tax">
            {onTaxChange && !isReadOnly ? (
              <>
                <span className="text-slate-400 font-sans tabular-nums">Rs.</span>
                <input
                  type="number"
                  value={tax === 0 ? '' : tax}
                  onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  data-testid="tax-input"
                  className="w-24 h-7 px-2 text-right bg-white border border-slate-200 rounded font-sans tabular-nums text-xs font-semibold text-slate-800"
                />
              </>
            ) : (
              <span className="font-sans tabular-nums font-semibold">
                + {globalDesignManager.formatRs(tax)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-slate-900 font-bold">
          <span className="text-xs uppercase tracking-wider">= Net Invoice Total</span>
          <span className="font-sans tabular-nums text-sm text-slate-900" data-testid="split-net-total">
            {globalDesignManager.formatRs(netInvoiceTotal)}
          </span>
        </div>
      </div>

      {/* Interactive Inputs for Split Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-blue-900 block">
            Insurance Approved Payable (Rs.)
          </label>
          <input
            type="number"
            value={insuranceApproved === 0 ? '' : insuranceApproved}
            onChange={(e) => onInsuranceChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={isReadOnly}
            data-testid="insurance-approved-input"
            className="w-full h-9 px-3 bg-blue-50/40 border border-blue-200 rounded-lg font-sans tabular-nums font-bold text-blue-900 text-right focus:outline-none focus:border-blue-500"
          />
          <span className="text-[10px] text-slate-400 block">
            Claim liability borne by insurer
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-emerald-900 block">
            Customer Advance Paid (Rs.)
          </label>
          <input
            type="number"
            value={advancePaid === 0 ? '' : advancePaid}
            onChange={(e) => onAdvanceChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={isReadOnly}
            data-testid="advance-paid-input"
            className="w-full h-9 px-3 bg-emerald-50/40 border border-emerald-200 rounded-lg font-sans tabular-nums font-bold text-emerald-900 text-right focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block">
            Direct deposit credited to date
          </span>
        </div>
      </div>

      {/* Large Bold Tabular Numerals Section */}
      <div className="space-y-3 pt-2">
        {/* Customer Excess Card */}
        <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Customer Excess Balance Due
            </span>
            <span className="text-[10px] font-sans tabular-nums text-slate-500">
              Liability: {globalDesignManager.formatRs(customerPayable)}
            </span>
          </div>
          <div
            className="font-sans tabular-nums font-extrabold text-2xl sm:text-3xl text-[#F95700] tracking-tight"
            data-testid="customer-balance-due"
          >
            {globalDesignManager.formatRs(balanceDue)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Net Total − Insurance Approved − Advance Paid
          </p>
          {isOverpaid && (
            <div
              className="mt-2.5 p-2 bg-emerald-100/80 border border-emerald-300 rounded-lg flex items-center justify-between text-emerald-900 font-semibold text-[11px]"
              data-testid="customer-refund-indicator"
            >
              <span>Refund / Credit Due:</span>
              <span className="font-sans tabular-nums font-bold">{globalDesignManager.formatRs(refundDue)}</span>
            </div>
          )}
        </div>

        {/* Insurance Balance Card */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-blue-900 text-[11px] uppercase tracking-wider">
              Insurance Receivable Balance
            </span>
            <span className="text-[10px] font-sans tabular-nums text-slate-500">
              Approved: {globalDesignManager.formatRs(insuranceApproved)}
            </span>
          </div>
          <div
            className="font-sans tabular-nums font-bold text-xl text-blue-800"
            data-testid="insurance-balance-due"
          >
            {globalDesignManager.formatRs(insuranceBalance)}
          </div>
          {insuranceSettled > 0 && (
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans tabular-nums">
              Collected: {globalDesignManager.formatRs(insuranceSettled)}
            </p>
          )}
          {insuranceBalance > 0 && onCollectInsurance && !isReadOnly && (
            <button
              type="button"
              onClick={onCollectInsurance}
              data-testid="collect-insurance-cheque-btn"
              className="mt-2.5 w-full py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Insurance Cheque ({globalDesignManager.formatRs(insuranceBalance)})</span>
            </button>
          )}
        </div>
      </div>

      {onCollectPayment && !isReadOnly && (
        <button
          type="button"
          onClick={onCollectPayment}
          data-testid="open-collect-payment-modal-btn"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          <CreditCard className="w-4 h-4" />
          <span>Collect Settlement Payment</span>
        </button>
      )}
    </div>
  );
};

export const NatureOfRepairSelector: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options?: string[];
}> = ({
  value,
  onChange,
  options = ['Accident', 'Mechanical', 'Electrical', 'Scanning', 'Tinkering', 'Auto Paint'],
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={clsx(
            'px-2.5 py-1 text-xs font-semibold rounded-full border transition-all',
            value === opt
              ? 'bg-[#0F172A] text-white border-[#0F172A]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export const InsuranceAssessorAutocomplete: React.FC<{
  value: string;
  onChange: (val: string) => void;
  companies?: string[];
}> = ({
  value,
  onChange,
  companies = ['Sri Lanka Insurance', 'Ceylinco VIP', 'Fairfirst', 'Allianz', 'Janashakthi', 'LOLC General'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const filtered = companies.filter((c) => c.toLowerCase().includes(value.toLowerCase()));

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Type or select Insurance Company..."
        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#F95700]"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-[10px] shadow-lg py-1 z-50 max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setIsOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>{c}</span>
              <Shield className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ZeroCrmCustomerBlock: React.FC<{
  name: string;
  phone: string;
  address: string;
  onChange: (field: 'name' | 'phone' | 'address', val: string) => void;
}> = ({ name, phone, address, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-[12px] border border-slate-200/80">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Mr. K. Perera"
          className="w-full mt-0.5 h-8 px-2 text-xs bg-white border border-slate-200 rounded-[6px]"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="07X XXX XXXX"
          className="w-full mt-0.5 h-8 px-2 text-xs bg-white border border-slate-200 rounded-[6px]"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase">Address / Town</label>
        <input
          type="text"
          value={address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="e.g. Kandy Road, Kelaniya"
          className="w-full mt-0.5 h-8 px-2 text-xs bg-white border border-slate-200 rounded-[6px]"
        />
      </div>
    </div>
  );
};

export const RepairLineAutoNumberCell: React.FC<{ index: number }> = ({ index }) => {
  const formatted = String(index).padStart(2, '0');
  return <span className="font-mono text-xs font-bold text-slate-400">{formatted}</span>;
};

export const HybridCatalogOrFreeformCell: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Description or type / to search catalog...' }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-8 px-2 text-xs bg-transparent border-0 focus:ring-1 focus:ring-orange-500 rounded text-slate-800 placeholder:text-slate-400"
    />
  );
};

export const AdminInlineBuyingCostCell: React.FC<{
  buyingCostRs: number;
  onChange: (cost: number) => void;
  isVisible: boolean;
}> = ({ buyingCostRs, onChange, isVisible }) => {
  if (!isVisible) return null;

  return (
    <td className="p-2 bg-emerald-50/40 border-l border-emerald-100">
      <input
        type="number"
        value={buyingCostRs === 0 ? '' : buyingCostRs}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder="Cost"
        className="w-20 h-7 px-1.5 text-xs font-sans tabular-nums text-right bg-white border border-emerald-200 rounded text-emerald-800 focus:outline-none"
      />
    </td>
  );
};

export const AdminInlineRowProfitBadge: React.FC<{
  sellingPrice: number;
  buyingCost: number;
  isVisible: boolean;
}> = ({ sellingPrice, buyingCost, isVisible }) => {
  if (!isVisible) return null;

  const profit = sellingPrice - buyingCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const isLoss = profit < 0;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans tabular-nums font-bold',
        isLoss ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
      )}
    >
      {isLoss ? '-' : '+'}Rs. {Math.abs(profit).toLocaleString()} ({margin.toFixed(0)}%)
    </span>
  );
};

export const SectionSubtotalFooterBar: React.FC<{
  sectionTitle: string;
  subtotalRs: number;
  itemCount: number;
}> = ({ sectionTitle, subtotalRs, itemCount }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 border-t border-slate-200 text-xs">
      <span className="font-semibold text-slate-600">
        Subtotal {sectionTitle} ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
      </span>
      <span className="font-sans tabular-nums font-bold text-slate-900">
        {globalDesignManager.formatRs(subtotalRs)}
      </span>
    </div>
  );
};

export const SupplementaryLineItemBadge: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <span
      className={clsx(
        'px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider inline-flex items-center gap-1',
        className
      )}
      data-testid="supplementary-badge"
    >
      SUPPLEMENTARY
    </span>
  );
};

export const OriginalEstimateSnapshotDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  originalEstimate: any;
  currentDocument?: any;
}> = ({ open, onClose, originalEstimate, currentDocument }) => {
  if (!open) return null;

  const parsedEstimate = React.useMemo(() => {
    if (!originalEstimate) return null;
    if (typeof originalEstimate === 'string') {
      try {
        return JSON.parse(originalEstimate);
      } catch (e) {
        return null;
      }
    }
    return originalEstimate;
  }, [originalEstimate]);

  const origTotal =
    parsedEstimate?.grandTotalSalesRs ??
    parsedEstimate?.grandTotal ??
    parsedEstimate?.financials?.grandTotalSalesRs ??
    0;

  const currTotal =
    currentDocument?.grandTotalSalesRs ??
    currentDocument?.grandTotal ??
    currentDocument?.financials?.grandTotalSalesRs ??
    0;

  const lines: any[] = parsedEstimate?.lines || [];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
      data-testid="original-estimate-snapshot-drawer"
    >
      <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Original Estimate Snapshot</span>
            </h3>
            <p className="text-xs text-slate-500">
              Immutable baseline frozen upon conversion to Job Card
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            data-testid="close-snapshot-drawer-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs space-y-4 flex-1">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
              <span className="font-bold block text-slate-700 text-[11px] uppercase tracking-wider">
                Baseline Frozen Total
              </span>
              <span
                className="font-sans tabular-nums font-bold text-lg text-blue-900 block mt-1"
                data-testid="snapshot-baseline-total"
              >
                {globalDesignManager.formatRs(origTotal)}
              </span>
              <span className="text-[10px] text-slate-500">
                {lines.length} baseline line items
              </span>
            </div>

            {currentDocument && (
              <div className="p-3.5 bg-orange-50/70 rounded-xl border border-orange-200">
                <span className="font-bold block text-slate-700 text-[11px] uppercase tracking-wider">
                  Current Sheet Total
                </span>
                <span
                  className="font-sans tabular-nums font-bold text-lg text-[#F95700] block mt-1"
                  data-testid="snapshot-current-total"
                >
                  {globalDesignManager.formatRs(currTotal)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Includes supplementary additions
                </span>
              </div>
            )}
          </div>

          {/* Frozen Timestamp & Metadata */}
          {originalEstimate?.frozenAt && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <strong>Frozen At:</strong> {new Date(originalEstimate.frozenAt).toLocaleString()}
            </div>
          )}

          {/* Baseline Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Frozen Baseline Line Items ({lines.length})
            </h4>
            {lines.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 italic">
                No items recorded in original estimate snapshot
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left w-24">Category</th>
                      <th className="p-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l: any, idx: number) => (
                      <tr key={l.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2 text-slate-900 font-medium">{l.description}</td>
                        <td className="p-2 text-slate-500 text-[10px]">
                          {(l.category || '').replace('LABOR_', '').replace('_', ' ')}
                        </td>
                        <td className="p-2 text-right font-sans tabular-nums font-semibold text-slate-800">
                          {globalDesignManager.formatRs(l.sellingPriceRs || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdvancePaymentReceiptRecorder: React.FC<{
  advancePaid: number;
  onRecord: (amount: number, method: string, notes?: string) => void;
  className?: string;
}> = ({ advancePaid, onRecord, className }) => {
  const [amt, setAmt] = useState(0);
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  return (
    <div
      className={clsx(
        'p-4 bg-slate-50 rounded-[14px] border border-slate-200 flex flex-col gap-3 text-xs shadow-2xs',
        className
      )}
      data-testid="advance-payment-receipt-recorder"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-800 text-sm block">Customer Advance Deposit</span>
          <span className="text-[11px] text-slate-500">Record fast cash/card deposit against this sheet</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">Total Advance Recorded</span>
          <span className="font-sans tabular-nums font-bold text-emerald-700 text-sm" data-testid="advance-recorder-total">
            {globalDesignManager.formatRs(advancePaid)}
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="number"
          placeholder="Deposit Amount (Rs.)"
          value={amt || ''}
          onChange={(e) => setAmt(Number(e.target.value))}
          data-testid="advance-recorder-amount"
          className="h-9 px-3 text-xs border border-slate-200 rounded-[8px] flex-1 bg-white font-sans tabular-nums"
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          data-testid="advance-recorder-method"
          className="h-9 px-2 text-xs border border-slate-200 rounded-[8px] bg-white font-medium text-slate-700"
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cheque">Cheque</option>
        </select>
        <button
          type="button"
          onClick={() => {
            if (amt > 0) {
              onRecord(amt, method, notes);
              setAmt(0);
              setNotes('');
            }
          }}
          disabled={!amt || amt <= 0}
          data-testid="advance-recorder-btn"
          className="h-9 px-4 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-[8px] transition-all cursor-pointer whitespace-nowrap"
        >
          Record Deposit
        </button>
      </div>
    </div>
  );
};

export const TechnicianTaskAssignmentRow: React.FC<{
  itemIndex: number;
  description: string;
  technicianName?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}> = ({ itemIndex, description, technicianName, isCompleted = false, onToggleComplete }) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 text-xs">
      <td className="p-3 text-center">
        <RepairLineAutoNumberCell index={itemIndex} />
      </td>
      <td className="p-3 font-medium text-slate-800">{description}</td>
      <td className="p-3 text-slate-600">{technicianName || 'Unassigned'}</td>
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={onToggleComplete}
          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
        />
      </td>
    </tr>
  );
};

export const QualityCheckSignoffCard: React.FC<{
  checklist: Array<{ id: string; label: string; checked: boolean }>;
  onToggle: (id: string) => void;
  onSignoff: () => void;
}> = ({ checklist, onToggle, onSignoff }) => {
  const allPassed = checklist.every((c) => c.checked);

  return (
    <div
      className="p-4 bg-white rounded-[16px] border border-slate-200 shadow-xs flex flex-col gap-3 text-xs"
      data-testid="quality-check-signoff-card"
    >
      <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Pre-Delivery Quality Inspection</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checklist.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="rounded text-emerald-600 cursor-pointer"
              data-testid={`qc-check-${item.id}`}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={!allPassed}
        onClick={onSignoff}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[8px] disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
        data-testid="qc-signoff-btn"
      >
        Signoff & Mark Ready for Delivery
      </button>
    </div>
  );
};

export const VehicleVisualDamageAnnotator: React.FC<{
  damagePins: Array<{ id: string; x: number; y: number; label: string }>;
  onAddPin?: (x: number, y: number) => void;
}> = ({ damagePins, onAddPin }) => {
  return (
    <div className="p-4 bg-white rounded-[16px] border border-slate-200 flex flex-col gap-2">
      <span className="text-xs font-bold text-slate-800">Visual Vehicle Damage Matrix</span>
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
          onAddPin?.(x, y);
        }}
        className="relative w-full h-44 bg-slate-100 rounded-[12px] border border-dashed border-slate-300 flex items-center justify-center cursor-crosshair overflow-hidden"
      >
        <Car className="w-24 h-24 text-slate-300" />
        {damagePins.map((pin) => (
          <div
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md"
            title={pin.label}
          >
            !
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuickPresetBundleInjector: React.FC<{
  presets: Array<{ name: string; itemsCount: number }>;
  onSelect: (presetName: string) => void;
}> = ({ presets, onSelect }) => {
  return (
    <div className="relative inline-block">
      <select
        onChange={(e) => e.target.value && onSelect(e.target.value)}
        defaultValue=""
        className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[8px] focus:outline-none"
      >
        <option value="" disabled>
          + Insert Service Preset...
        </option>
        {presets.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name} ({p.itemsCount} items)
          </option>
        ))}
      </select>
    </div>
  );
};

export const PartConditionTagSelector: React.FC<{
  condition: string;
  onChange: (c: string) => void;
}> = ({ condition, onChange }) => {
  const conditions = ['Brand New Genuine', 'OEM / Aftermarket', 'Reconditioned / Used', 'Customer Supplied'];
  return (
    <select
      value={condition}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 px-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none"
    >
      {conditions.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
};

export const TaxAndDiscountSummaryBlock: React.FC<{
  subtotalRs: number;
  discountRs: number;
  taxRs: number;
  onDiscountChange: (d: number) => void;
  onTaxChange: (t: number) => void;
}> = ({ subtotalRs, discountRs, taxRs, onDiscountChange, onTaxChange }) => {
  const net = subtotalRs - discountRs + taxRs;

  return (
    <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80 flex flex-col gap-2 text-xs">
      <div className="flex justify-between font-medium text-slate-600">
        <span>Section Subtotal</span>
        <span className="font-sans tabular-nums">{globalDesignManager.formatRs(subtotalRs)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span>Discount (Rs.)</span>
        <input
          type="number"
          value={discountRs || ''}
          onChange={(e) => onDiscountChange(Number(e.target.value))}
          className="w-24 h-7 text-right px-1.5 bg-white border border-slate-200 rounded font-sans tabular-nums"
        />
      </div>
      <div className="flex justify-between items-center">
        <span>Tax / VAT (Rs.)</span>
        <input
          type="number"
          value={taxRs || ''}
          onChange={(e) => onTaxChange(Number(e.target.value))}
          className="w-24 h-7 text-right px-1.5 bg-white border border-slate-200 rounded font-sans tabular-nums"
        />
      </div>
      <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-2">
        <span>Net Total</span>
        <span className="font-sans tabular-nums text-[#F95700]">{globalDesignManager.formatRs(net)}</span>
      </div>
    </div>
  );
};

export const PaymentCollectionHistoryList: React.FC<{
  payments: Array<any>;
  onPrintThermal?: (payment: any) => void;
  className?: string;
}> = ({ payments = [], onPrintThermal, className }) => {
  return (
    <div
      className={clsx('p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 text-xs', className)}
      data-testid="payment-collection-history-list"
    >
      <div className="flex items-center justify-between border-b pb-2 border-slate-100">
        <div>
          <span className="font-bold text-slate-900 text-sm uppercase tracking-wider block">
            Payment & Settlement History
          </span>
          <span className="text-[11px] text-slate-500">
            {payments.length} {payments.length === 1 ? 'receipt' : 'receipts'} recorded
          </span>
        </div>
      </div>
      {payments.length === 0 ? (
        <div
          className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200"
          data-testid="no-payments-message"
        >
          No payments or settlement receipts recorded yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((p) => {
            const method = p.paymentMethod || p.method || 'CASH';
            const category = p.paymentType
              ? p.paymentType.toLowerCase().replace('_', ' ')
              : 'payment';
            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-200/70"
                data-testid={`payment-row-${p.id}`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {p.receiptNumber || 'REC'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-200 text-slate-700">
                      {category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600">
                      via {method}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{p.date}</span>
                    {p.referenceNumber && (
                      <span className="font-mono font-medium">Ref: {p.referenceNumber}</span>
                    )}
                    {p.notes && <span className="italic">"{p.notes}"</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-sans tabular-nums font-bold text-sm text-emerald-700 block">
                      {globalDesignManager.formatRs(p.amountRs)}
                    </span>
                    {p.balanceAfterRs !== undefined && (
                      <span className="text-[10px] text-slate-400 font-sans tabular-nums">
                        Rem: {globalDesignManager.formatRs(p.balanceAfterRs)}
                      </span>
                    )}
                  </div>
                  {onPrintThermal && (
                    <button
                      type="button"
                      onClick={() => onPrintThermal(p)}
                      title="Print 80mm Thermal Receipt"
                      data-testid={`print-payment-receipt-${p.id}`}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const DocumentQuickCloneButton: React.FC<{
  onClone: () => void;
  label?: string;
}> = ({ onClone, label = 'Clone to New Sheet' }) => {
  return (
    <button
      type="button"
      onClick={onClone}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors shadow-2xs"
    >
      <Copy className="w-3.5 h-3.5 text-slate-400" />
      <span>{label}</span>
    </button>
  );
};

export const RepairSectionTableGroup: React.FC<{
  title: string;
  items: Array<{ id: string; description: string; amountRs: number; buyingCostRs?: number }>;
  onAddItem: () => void;
  onUpdateItem: (id: string, field: string, val: any) => void;
  onDeleteItem: (id: string) => void;
  isCostMode?: boolean;
}> = ({ title, items, onAddItem, onUpdateItem, onDeleteItem, isCostMode = false }) => {
  const subtotal = items.reduce((acc, it) => acc + (it.amountRs || 0), 0);

  return (
    <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0F172A] rounded-[6px]"
        >
          <Plus className="w-3 h-3" />
          <span>Add Line</span>
        </button>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-[#FFF7ED]/50 border-b border-orange-100/70 text-slate-700 text-[11px] uppercase font-bold">
          <tr>
            <th className="py-2 px-3 text-center w-12">#</th>
            <th className="py-2 px-3 text-left">Description</th>
            {isCostMode && <th className="py-2 px-3 text-right w-24">Buying Cost</th>}
            <th className="py-2 px-3 text-right w-28">Amount (Rs.)</th>
            <th className="py-2 px-2 text-center w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50/60">
              <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
              <td className="p-2">
                <input
                  type="text"
                  value={it.description}
                  onChange={(e) => onUpdateItem(it.id, 'description', e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none"
                  placeholder="Line item description..."
                />
              </td>
              {isCostMode && (
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={it.buyingCostRs || ''}
                    onChange={(e) => onUpdateItem(it.id, 'buyingCostRs', Number(e.target.value))}
                    className="w-20 text-xs font-sans tabular-nums text-right bg-white border border-emerald-200 rounded px-1"
                  />
                </td>
              )}
              <td className="p-2 text-right">
                <input
                  type="number"
                  value={it.amountRs || ''}
                  onChange={(e) => onUpdateItem(it.id, 'amountRs', Number(e.target.value))}
                  className="w-24 text-xs font-sans tabular-nums text-right bg-white border border-slate-200 rounded px-1 font-bold"
                />
              </td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => onDeleteItem(it.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end p-3 bg-slate-50 border-t border-slate-200 font-bold text-xs text-slate-800">
        Subtotal: {globalDesignManager.formatRs(subtotal)}
      </div>
    </div>
  );
};

