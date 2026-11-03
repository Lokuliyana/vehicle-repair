import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Printer, X } from 'lucide-react';
import { globalDesignManager } from '../global-manager';

export const A4PrintCanvasContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto p-[10mm] bg-white text-black font-sans box-border shadow-md print:shadow-none print:m-0 print:p-0 print:w-full">
      {children}
    </div>
  );
};

export const A4WorkshopServiceHeaderBanner: React.FC = () => {
  return (
    <div className="w-full text-center py-1.5 px-2 bg-slate-900 text-white font-bold text-[9pt] tracking-wider uppercase mb-3 print:bg-black">
      MECHANICAL | ELECTRICAL | SCANNING | TINKERING | AUTO PAINT | SPARE PARTS
    </div>
  );
};

export const A4WorkshopBrandTitleBlock: React.FC<{
  title: string;
  workshopName?: string;
  address?: string;
  phone?: string;
}> = ({
  title,
  workshopName = '500 LABS AUTOMOTIVE ENGINEERING',
  address = 'No. 124, High Level Road, Maharagama, Sri Lanka',
  phone = 'Hotline: +94 11 285 5500 / +94 77 123 4567',
}) => {
  return (
    <div className="text-center mb-4">
      <h1 className="text-[16pt] font-black tracking-tight text-black">{workshopName}</h1>
      <p className="text-[8.5pt] text-slate-600 print:text-black">{address} • {phone}</p>
      <div className="inline-block mt-2 px-4 py-1 border-2 border-black font-black text-[11pt] uppercase tracking-wide">
        {title}
      </div>
    </div>
  );
};

export const A4Vehicle12FieldPrintGrid: React.FC<{
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
}> = ({ data }) => {
  return (
    <table className="w-full border-collapse border border-black text-[8.5pt] mb-4">
      <tbody>
        <tr className="border-b border-black">
          <td className="w-1/4 p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Date:</td>
          <td className="w-1/4 p-1.5 font-mono border-r border-black">{data.date}</td>
          <td className="w-1/4 p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Job Number:</td>
          <td className="w-1/4 p-1.5 font-mono font-bold">{data.jobNumber}</td>
        </tr>
        <tr className="border-b border-black">
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Vehicle Number:</td>
          <td className="p-1.5 font-mono font-bold border-r border-black">{data.vehicleNumber}</td>
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Nature of Repair:</td>
          <td className="p-1.5">{data.natureOfRepair}</td>
        </tr>
        <tr className="border-b border-black">
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Vehicle Make:</td>
          <td className="p-1.5 border-r border-black">{data.make}</td>
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Chassis Number:</td>
          <td className="p-1.5 font-mono">{data.chassisNumber}</td>
        </tr>
        <tr className="border-b border-black">
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Vehicle Model:</td>
          <td className="p-1.5 border-r border-black">{data.model}</td>
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Completion Days:</td>
          <td className="p-1.5 font-mono">{data.completionDays} Days</td>
        </tr>
        <tr className="border-b border-black">
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Year of Make:</td>
          <td className="p-1.5 font-mono border-r border-black">{data.yearOfMake}</td>
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Vehicle Color:</td>
          <td className="p-1.5">{data.vehicleColor}</td>
        </tr>
        <tr className="border-b border-black">
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Insurance Name:</td>
          <td colSpan={3} className="p-1.5 font-semibold">{data.insuranceName || 'Self / Customer Direct'}</td>
        </tr>
        <tr>
          <td className="p-1.5 font-bold border-r border-black bg-slate-100 print:bg-transparent">Customer Info:</td>
          <td colSpan={3} className="p-1.5">{data.customerInfo}</td>
        </tr>
      </tbody>
    </table>
  );
};

export const A4ComputerGeneratedFooter: React.FC = () => {
  return (
    <div className="mt-6 pt-3 border-t border-black text-center text-[7.5pt] text-slate-700 print:text-black">
      <p className="font-semibold uppercase tracking-wider">
        This is a computer generated document and does not carry a physical signature.
      </p>
      <p className="mt-1 font-mono tracking-widest text-[8pt]">T H A N K   Y O U</p>
    </div>
  );
};

export const Thermal80mmReceiptContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="thermal-receipt-root w-[80mm] max-w-[80mm] mx-auto p-4 bg-white text-black font-mono text-[9pt] border border-dashed border-slate-300 print:border-none shadow-sm print:shadow-none">
      {children}
    </div>
  );
};

export const ThermalReceiptHeaderBlock: React.FC<{
  receiptNumber: string;
  dateTime: string;
  cashierName: string;
}> = ({ receiptNumber, dateTime, cashierName }) => {
  return (
    <div className="text-center pb-2 mb-2 border-b border-dashed border-black">
      <h2 className="text-[11pt] font-black tracking-tight">500 LABS WORKSHOP & POS</h2>
      <p className="text-[7.5pt]">Maharagama, Sri Lanka • Tel: 011 285 5500</p>
      <div className="flex justify-between text-[7.5pt] mt-2 pt-1 border-t border-slate-200">
        <span>Receipt: {receiptNumber}</span>
        <span>{dateTime}</span>
      </div>
      <div className="text-left text-[7.5pt] text-slate-600">Cashier: {cashierName}</div>
    </div>
  );
};

export const DualPrintModePreviewDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  a4Content: React.ReactNode;
  thermalContent: React.ReactNode;
}> = ({ open, onClose, a4Content, thermalContent }) => {
  const [mode, setMode] = useState<'A4' | 'THERMAL'>('A4');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-md print:static print:p-0 print:bg-transparent">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-[22px] border border-white/40 flex flex-col shadow-2xl overflow-hidden print:h-auto print:max-w-none print:border-none print:shadow-none print:p-0 print:rounded-none">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 no-print print:hidden">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900">Print Preview Studio</h3>
            <div className="inline-flex p-0.5 bg-slate-200 rounded-full">
              <button
                type="button"
                onClick={() => setMode('A4')}
                className={clsx(
                  'px-3 py-1 text-xs font-semibold rounded-full',
                  mode === 'A4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                )}
              >
                A4 Document
              </button>
              <button
                type="button"
                onClick={() => setMode('THERMAL')}
                className={clsx(
                  'px-3 py-1 text-xs font-semibold rounded-full',
                  mode === 'THERMAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                )}
              >
                80mm Thermal Receipt
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-[10px] flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
            <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 print:bg-transparent print:p-0 flex justify-center">
          {mode === 'A4' ? a4Content : thermalContent}
        </div>
      </div>
    </div>
  );
};

export const A4ThreeSectionPrintTable: React.FC<{
  sections: Array<{
    title: string;
    items: Array<{ description: string; amountRs: number }>;
    subtotalRs: number;
  }>;
}> = ({ sections }) => {
  return (
    <div className="w-full mb-4">
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="mb-3">
          <div className="bg-slate-100 print:bg-slate-200 border-x border-t border-black px-2 py-1 font-bold text-[9pt] uppercase">
            {sIdx + 1}. {sec.title}
          </div>
          <table className="w-full border-collapse border border-black text-[8.5pt]">
            <thead>
              <tr className="bg-slate-50 print:bg-slate-100 border-b border-black font-bold">
                <th className="border-r border-black p-1 text-center w-8">#</th>
                <th className="border-r border-black p-1 text-left">Description</th>
                <th className="p-1 text-right w-28">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-2 text-center text-slate-500 italic">
                    No items in this section
                  </td>
                </tr>
              ) : (
                sec.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="border-r border-black p-1 text-center font-mono">{idx + 1}</td>
                    <td className="border-r border-black p-1">{it.description}</td>
                    <td className="p-1 text-right font-mono font-medium">
                      {globalDesignManager.formatRs(it.amountRs)}
                    </td>
                  </tr>
                ))
              )}
              <tr className="font-bold border-t border-black bg-slate-50 print:bg-slate-100">
                <td colSpan={2} className="border-r border-black p-1 text-right">
                  Subtotal {sec.title}:
                </td>
                <td className="p-1 text-right font-mono">
                  {globalDesignManager.formatRs(sec.subtotalRs)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export const A4FinancialTotalsPrintBlock: React.FC<{
  grossTotalRs: number;
  discountRs?: number;
  taxRs?: number;
  advancePaidRs?: number;
  insuranceApprovedRs?: number;
  customerPayableRs?: number;
  balanceDueRs: number;
  className?: string;
}> = ({
  grossTotalRs,
  discountRs = 0,
  taxRs = 0,
  advancePaidRs = 0,
  insuranceApprovedRs = 0,
  customerPayableRs,
  balanceDueRs,
  className,
}) => {
  const payable =
    customerPayableRs !== undefined
      ? customerPayableRs
      : insuranceApprovedRs > 0
      ? Math.max(0, grossTotalRs - discountRs + taxRs - insuranceApprovedRs)
      : undefined;

  return (
    <div className={clsx("flex justify-end mb-4", className)} data-testid="a4-financial-totals-print-block">
      <table className="border-collapse border border-black text-[8.5pt] w-72">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 font-bold">Gross Total:</td>
            <td className="p-1.5 text-right font-mono">{globalDesignManager.formatRs(grossTotalRs)}</td>
          </tr>
          {discountRs > 0 && (
            <tr className="border-b border-black text-red-700">
              <td className="border-r border-black p-1.5">Less Discount:</td>
              <td className="p-1.5 text-right font-mono">- {globalDesignManager.formatRs(discountRs)}</td>
            </tr>
          )}
          {taxRs > 0 && (
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5">Add Tax/VAT:</td>
              <td className="p-1.5 text-right font-mono">+ {globalDesignManager.formatRs(taxRs)}</td>
            </tr>
          )}
          <tr className="border-b border-black bg-slate-50 font-bold">
            <td className="border-r border-black p-1.5 font-bold">Grand Total:</td>
            <td className="p-1.5 text-right font-mono">
              {globalDesignManager.formatRs(Math.max(0, grossTotalRs - discountRs) + taxRs)}
            </td>
          </tr>
          {insuranceApprovedRs > 0 && (
            <tr className="border-b border-black text-blue-900">
              <td className="border-r border-black p-1.5 font-bold">Insurance Approved:</td>
              <td className="p-1.5 text-right font-mono">- {globalDesignManager.formatRs(insuranceApprovedRs)}</td>
            </tr>
          )}
          {payable !== undefined && insuranceApprovedRs > 0 && (
            <tr className="border-b border-black font-semibold">
              <td className="border-r border-black p-1.5">Customer Payable:</td>
              <td className="p-1.5 text-right font-mono">{globalDesignManager.formatRs(payable)}</td>
            </tr>
          )}
          {advancePaidRs > 0 && (
            <tr className="border-b border-black text-emerald-800">
              <td className="border-r border-black p-1.5">Advance Paid:</td>
              <td className="p-1.5 text-right font-mono">- {globalDesignManager.formatRs(advancePaidRs)}</td>
            </tr>
          )}
          <tr className="bg-slate-100 print:bg-slate-200 font-black text-[9.5pt]">
            <td className="border-r border-black p-2 uppercase">
              <span>Net Balance Due:</span>
              <span className="sr-only">Balance Due:</span>
            </td>
            <td className="p-2 text-right font-mono">{globalDesignManager.formatRs(balanceDueRs)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const A4PriceRedactedJobCardPrint: React.FC<{
  tasks: Array<{ id: string; description: string; section: string }>;
}> = ({ tasks }) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-black text-white px-3 py-1 font-bold text-[9pt] uppercase mb-2">
        Workshop Floor Job Card & Task Checklist (Zero Prices Redacted)
      </div>
      <table className="w-full border-collapse border border-black text-[8.5pt]">
        <thead>
          <tr className="bg-slate-100 border-b border-black font-bold">
            <th className="border-r border-black p-1.5 text-center w-8">#</th>
            <th className="border-r border-black p-1.5 text-left">Task / Operation Description</th>
            <th className="border-r border-black p-1.5 text-left w-36">Technician Sign</th>
            <th className="border-r border-black p-1.5 text-center w-20">Part Issued</th>
            <th className="p-1.5 text-center w-20">QC Passed</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, idx) => (
            <tr key={t.id} className="border-b border-black">
              <td className="border-r border-black p-2 text-center font-mono">{idx + 1}</td>
              <td className="border-r border-black p-2 font-medium">
                <span className="block text-[7.5pt] text-slate-500 font-bold uppercase">{t.section}</span>
                {t.description}
              </td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2 text-center">
                <div className="w-4 h-4 border border-black inline-block" />
              </td>
              <td className="p-2 text-center">
                <div className="w-4 h-4 border border-black inline-block" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ThermalReceiptItemizedTable: React.FC<{
  items: Array<{ name: string; qty: number; unitPriceRs: number; totalRs: number }>;
}> = ({ items }) => {
  return (
    <div className="w-full my-2 text-[9pt] font-mono">
      <div className="border-b border-dashed border-black pb-1 mb-1 grid grid-cols-12 font-bold">
        <span className="col-span-6">Item</span>
        <span className="col-span-2 text-center">Qty</span>
        <span className="col-span-4 text-right">Total</span>
      </div>
      {items.map((it, idx) => (
        <div key={idx} className="grid grid-cols-12 py-0.5">
          <span className="col-span-6 truncate">{it.name}</span>
          <span className="col-span-2 text-center">{it.qty}</span>
          <span className="col-span-4 text-right">{it.totalRs.toLocaleString()}</span>
        </div>
      ))}
      <div className="border-b border-dashed border-black mt-1" />
    </div>
  );
};

export const ThermalTenderSummaryBlock: React.FC<{
  subtotalRs: number;
  discountRs?: number;
  netTotalRs: number;
  cashTenderedRs: number;
  changeRs: number;
  totalItems: number;
}> = ({ subtotalRs, discountRs = 0, netTotalRs, cashTenderedRs, changeRs, totalItems }) => {
  return (
    <div className="w-full my-2 text-[9pt] font-mono flex flex-col gap-0.5">
      <div className="flex justify-between">
        <span>Total Items:</span>
        <span>{totalItems}</span>
      </div>
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>{subtotalRs.toLocaleString()}</span>
      </div>
      {discountRs > 0 && (
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>-{discountRs.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-[10.5pt] border-y border-dashed border-black py-1 my-1">
        <span>NET TOTAL:</span>
        <span>Rs. {netTotalRs.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Cash Tendered:</span>
        <span>{cashTenderedRs.toLocaleString()}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>CHANGE DUE:</span>
        <span>Rs. {changeRs.toLocaleString()}</span>
      </div>
    </div>
  );
};

export { PrintDomPrivacySanitizer } from './finance-privacy-components';


