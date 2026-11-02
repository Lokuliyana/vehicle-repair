import React from 'react';
import { WorkshopJobSheet } from '@/types';
import { formatRs } from '@/utils/currency';
import { cn } from '@/utils/cn';

export interface A4WorkshopPrintProps {
  jobSheet: WorkshopJobSheet;
  className?: string;
}

export const A4WorkshopPrint = React.forwardRef<HTMLDivElement, A4WorkshopPrintProps>(
  ({ jobSheet, className }, ref) => {
    const { header, lines, financials, docStage } = jobSheet;
    const isJobCard = docStage === 'JOB_CARD';

    const removeReassembleLines = lines.filter(
      (l) => l.category === 'LABOR_REMOVE_REASSEMBLE'
    );
    const repairLines = lines.filter((l) => l.category === 'LABOR_REPAIR');
    const replacementLines = lines.filter((l) => l.category === 'REPLACEMENT');

    const getStageTitle = () => {
      switch (docStage) {
        case 'QUOTATION':
          return 'VEHICLE REPAIR QUOTATION';
        case 'JOB_CARD':
          return 'WORKSHOP JOB CARD';
        case 'INVOICE':
          return 'VEHICLE REPAIR INVOICE';
        case 'ESTIMATE':
        default:
          return 'VEHICLE REPAIR ESTIMATE';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'a4-print-document bg-white text-black font-sans mx-auto text-[11px] leading-tight select-none',
          'w-[210mm] min-h-[297mm] p-[10mm] box-border shadow-md print:shadow-none print:w-full print:p-0 print:m-0',
          className
        )}
        data-testid="a4-workshop-print-root"
      >
        {/* Top Service Banner */}
        <div className="border-b-2 border-black pb-2 mb-3 text-center">
          <p className="text-[10px] font-bold tracking-wider text-black uppercase">
            ALL KIND OF VEHICLE, ELECTRICAL & MECHANICAL REPAIRS, SCANNING, TINKERING,
            ACCIDENT REPAIR & AUTO PAINT
          </p>
        </div>

        {/* Document Header & Title */}
        <div className="flex items-center justify-between mb-3 border-b border-black pb-2">
          <div>
            <h1 className="text-xl font-extrabold tracking-wide text-black uppercase">
              ANTIGRAVITY AUTO CARE
            </h1>
            <p className="text-[10px] text-gray-700">
              High-Precision Collision Estimation & Mechanical Workshop
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold border border-black px-3 py-1 bg-gray-100 uppercase inline-block">
              {getStageTitle()}
            </h2>
          </div>
        </div>

        {/* 12-Field Workshop Header Grid */}
        <div className="border border-black mb-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Date:</span>
              <span className="font-semibold text-black">{header.date || '-'}</span>
            </div>
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Job Number:</span>
              <span className="font-bold text-black">{header.jobNumber || '-'}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Vehicle Number:</span>
              <span className="font-bold text-black uppercase">{header.vehicleNumber || '-'}</span>
            </div>
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Nature of Repair:</span>
              <span className="text-black">{header.natureOfRepair || '-'}</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Vehicle Make:</span>
              <span className="text-black">{header.vehicleMake || '-'}</span>
            </div>
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Chassis Number:</span>
              <span className="font-mono text-black">{header.chassisNumber || '-'}</span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Vehicle Model:</span>
              <span className="text-black">{header.vehicleModel || '-'}</span>
            </div>
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">No of Days Completion:</span>
              <span className="text-black">{header.daysForCompletion || '-'}</span>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Year of Make:</span>
              <span className="text-black">{header.yearOfMake || '-'}</span>
            </div>
            <div className="p-1.5 flex">
              <span className="font-bold w-36 shrink-0">Vehicle Color:</span>
              <span className="text-black">{header.vehicleColor || '-'}</span>
            </div>
          </div>

          {/* Row 6: Insurance (Full-width) */}
          <div className="p-1.5 border-b border-black flex">
            <span className="font-bold w-36 shrink-0">Name of Insurance:</span>
            <span className="text-black font-semibold">{header.insuranceName || 'None / Direct Customer'}</span>
          </div>

          {/* Row 7: Customer Info (Full-width) */}
          <div className="p-1.5 flex">
            <span className="font-bold w-36 shrink-0">Customer Information:</span>
            <span className="text-black">{header.customerInfo || '-'}</span>
          </div>
        </div>

        {/* 3 Numbered Line-Item Tables */}

        {/* Section 1: LABOR - REMOVE & REASSEMBLE */}
        <div className="mb-3">
          <div className="bg-gray-200 border-x border-t border-black px-2 py-1 font-bold text-[10px] uppercase">
            1. Labor - Remove & Reassemble
          </div>
          <table className="w-full border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="border-b border-black bg-gray-50 text-[10px]">
                <th className="w-10 border-r border-black p-1 text-center font-bold">No.</th>
                <th className="border-r border-black p-1 text-left font-bold">Description</th>
                {isJobCard ? (
                  <>
                    <th className="w-36 border-r border-black p-1 text-left font-bold">
                      Assigned Tech
                    </th>
                    <th className="w-20 p-1 text-center font-bold">Done</th>
                  </>
                ) : (
                  <th className="w-28 p-1 text-right font-bold">Amount (Rs.)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {removeReassembleLines.length === 0 ? (
                <tr className="border-b border-black">
                  <td colSpan={isJobCard ? 4 : 3} className="p-1.5 text-center text-gray-500 italic">
                    - Nil -
                  </td>
                </tr>
              ) : (
                removeReassembleLines.map((line, idx) => (
                  <tr key={line.id} className="border-b border-black">
                    <td className="border-r border-black p-1 text-center">{idx + 1}</td>
                    <td className="border-r border-black p-1 break-words">{line.description}</td>
                    {isJobCard ? (
                      <>
                        <td className="border-r border-black p-1">{line.assignedTechnician || '-'}</td>
                        <td className="p-1 text-center font-mono">
                          {line.isCompleted ? '[X]' : '[ ]'}
                        </td>
                      </>
                    ) : (
                      <td className="p-1 text-right font-medium">
                        {formatRs(line.sellingPriceRs)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {!isJobCard && (
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={2} className="border-r border-black p-1 text-right">
                    Sub Total (Remove & Reassemble):
                  </td>
                  <td className="p-1 text-right">
                    {formatRs(financials.subtotalRemoveReassembleRs)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Section 2: LABOR - REPAIR */}
        <div className="mb-3">
          <div className="bg-gray-200 border-x border-t border-black px-2 py-1 font-bold text-[10px] uppercase">
            2. Labor - Repair
          </div>
          <table className="w-full border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="border-b border-black bg-gray-50 text-[10px]">
                <th className="w-10 border-r border-black p-1 text-center font-bold">No.</th>
                <th className="border-r border-black p-1 text-left font-bold">Description</th>
                {isJobCard ? (
                  <>
                    <th className="w-36 border-r border-black p-1 text-left font-bold">
                      Assigned Tech
                    </th>
                    <th className="w-20 p-1 text-center font-bold">Done</th>
                  </>
                ) : (
                  <th className="w-28 p-1 text-right font-bold">Amount (Rs.)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {repairLines.length === 0 ? (
                <tr className="border-b border-black">
                  <td colSpan={isJobCard ? 4 : 3} className="p-1.5 text-center text-gray-500 italic">
                    - Nil -
                  </td>
                </tr>
              ) : (
                repairLines.map((line, idx) => (
                  <tr key={line.id} className="border-b border-black">
                    <td className="border-r border-black p-1 text-center">{idx + 1}</td>
                    <td className="border-r border-black p-1 break-words">{line.description}</td>
                    {isJobCard ? (
                      <>
                        <td className="border-r border-black p-1">{line.assignedTechnician || '-'}</td>
                        <td className="p-1 text-center font-mono">
                          {line.isCompleted ? '[X]' : '[ ]'}
                        </td>
                      </>
                    ) : (
                      <td className="p-1 text-right font-medium">
                        {formatRs(line.sellingPriceRs)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {!isJobCard && (
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={2} className="border-r border-black p-1 text-right">
                    Sub Total (Repair):
                  </td>
                  <td className="p-1 text-right">
                    {formatRs(financials.subtotalRepairRs)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Section 3: REPLACEMENT */}
        <div className="mb-4">
          <div className="bg-gray-200 border-x border-t border-black px-2 py-1 font-bold text-[10px] uppercase">
            3. Replacement
          </div>
          <table className="w-full border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="border-b border-black bg-gray-50 text-[10px]">
                <th className="w-10 border-r border-black p-1 text-center font-bold">No.</th>
                <th className="border-r border-black p-1 text-left font-bold">Description</th>
                {isJobCard ? (
                  <>
                    <th className="w-36 border-r border-black p-1 text-left font-bold">
                      Assigned Tech
                    </th>
                    <th className="w-20 p-1 text-center font-bold">Done</th>
                  </>
                ) : (
                  <th className="w-28 p-1 text-right font-bold">Amount (Rs.)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {replacementLines.length === 0 ? (
                <tr className="border-b border-black">
                  <td colSpan={isJobCard ? 4 : 3} className="p-1.5 text-center text-gray-500 italic">
                    - Nil -
                  </td>
                </tr>
              ) : (
                replacementLines.map((line, idx) => (
                  <tr key={line.id} className="border-b border-black">
                    <td className="border-r border-black p-1 text-center">{idx + 1}</td>
                    <td className="border-r border-black p-1 break-words">{line.description}</td>
                    {isJobCard ? (
                      <>
                        <td className="border-r border-black p-1">{line.assignedTechnician || '-'}</td>
                        <td className="p-1 text-center font-mono">
                          {line.isCompleted ? '[X]' : '[ ]'}
                        </td>
                      </>
                    ) : (
                      <td className="p-1 text-right font-medium">
                        {formatRs(line.sellingPriceRs)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {!isJobCard && (
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={2} className="border-r border-black p-1 text-right">
                    Sub Total (Replacement):
                  </td>
                  <td className="p-1 text-right">
                    {formatRs(financials.subtotalReplacementRs)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Financial Summary Box (Redacted completely on Job Card) */}
        {!isJobCard && (
          <div className="flex justify-end mb-6">
            <div className="w-72 border border-black text-[11px]">
              <div className="flex justify-between p-1.5 border-b border-black">
                <span className="font-semibold">Gross Total:</span>
                <span>
                  {formatRs(
                    financials.subtotalRemoveReassembleRs +
                      financials.subtotalRepairRs +
                      financials.subtotalReplacementRs
                  )}
                </span>
              </div>
              {financials.discountRs > 0 && (
                <div className="flex justify-between p-1.5 border-b border-black text-red-700">
                  <span className="font-semibold">Discount:</span>
                  <span>- {formatRs(financials.discountRs)}</span>
                </div>
              )}
              {financials.taxRs > 0 && (
                <div className="flex justify-between p-1.5 border-b border-black">
                  <span className="font-semibold">Tax:</span>
                  <span>+ {formatRs(financials.taxRs)}</span>
                </div>
              )}
              <div className="flex justify-between p-1.5 border-b border-black bg-gray-100 font-bold text-[12px]">
                <span>Grand Total:</span>
                <span>{formatRs(financials.grandTotalSalesRs)}</span>
              </div>

              {/* Split billing if Insurance Claim */}
              {financials.insuranceApprovedRs > 0 && (
                <>
                  <div className="flex justify-between p-1.5 border-b border-black text-blue-900">
                    <span className="font-semibold">Insurance Approved:</span>
                    <span>{formatRs(financials.insuranceApprovedRs)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-black font-semibold">
                    <span>Customer Payable:</span>
                    <span>{formatRs(financials.customerPayableRs)}</span>
                  </div>
                </>
              )}
              {financials.advancePaidRs > 0 && (
                <div className="flex justify-between p-1.5 border-b border-black text-emerald-800">
                  <span className="font-semibold">Advance Paid:</span>
                  <span>{formatRs(financials.advancePaidRs)}</span>
                </div>
              )}
              {financials.balanceDueRs !== undefined &&
                (financials.insuranceApprovedRs > 0 ||
                  financials.advancePaidRs > 0 ||
                  docStage === 'INVOICE') && (
                  <div className="flex justify-between p-1.5 font-bold bg-amber-50 text-amber-950">
                    <span>Balance Due:</span>
                    <span>{formatRs(financials.balanceDueRs)}</span>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Signatures & Job Card Floor Section */}
        {isJobCard && (
          <div className="grid grid-cols-2 gap-8 border-t border-black pt-8 my-8">
            <div className="text-center">
              <div className="border-t border-black w-48 mx-auto pt-1 font-bold">
                Floor Supervisor Signature
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-48 mx-auto pt-1 font-bold">
                Technician Lead Signature
              </div>
            </div>
          </div>
        )}

        {/* Bottom Disclaimers */}
        <div className="print-footer mt-auto pt-4 border-t border-black text-center space-y-1">
          <p className="text-[10px] italic text-gray-700">
            Computer generated estimate and does not carry a signature.
          </p>
          <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-black pt-1">
            T H A N K &nbsp; Y O U
          </p>
        </div>
      </div>
    );
  }
);
A4WorkshopPrint.displayName = 'A4WorkshopPrint';
