import React from 'react';
import { WorkshopJobSheet, WorkshopPaymentRecord } from '@/types';
import { formatRs } from '@/utils/currency';
import { cn } from '@/utils/cn';

export interface WorkshopPaymentThermalReceiptProps {
  jobSheet: WorkshopJobSheet;
  payment: WorkshopPaymentRecord;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  className?: string;
}

export const WorkshopPaymentThermalReceipt = React.forwardRef<
  HTMLDivElement,
  WorkshopPaymentThermalReceiptProps
>(
  (
    {
      jobSheet,
      payment,
      shopName = 'ANTIGRAVITY AUTO CARE',
      shopAddress = 'No. 124, High Level Road, Colombo',
      shopPhone = '+94 11 234 5678 / +94 77 123 4567',
      className,
    },
    ref
  ) => {
    const { header, financials } = jobSheet;
    const isInsurance = financials.insuranceApprovedRs > 0;

    return (
      <div
        ref={ref}
        className={cn(
          'thermal-receipt-root bg-white text-black font-mono text-[9pt] leading-tight mx-auto p-4 select-none',
          'w-[80mm] max-w-[80mm] border border-dashed border-slate-300 print:border-none print:p-0 print:m-0 shadow-sm print:shadow-none',
          className
        )}
        data-testid="workshop-thermal-receipt-root"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider">{shopName}</h2>
          <p className="text-[8pt] text-gray-700">{shopAddress}</p>
          <p className="text-[8pt] text-gray-700">Tel: {shopPhone}</p>
          <div className="mt-1 border-t border-b border-black py-0.5 text-[8.5pt] font-extrabold uppercase">
            {payment.paymentType === 'ADVANCE'
              ? 'WORKSHOP ADVANCE RECEIPT'
              : payment.paymentType === 'CUSTOMER_EXCESS'
              ? 'CUSTOMER EXCESS PAYMENT RECEIPT'
              : payment.paymentType === 'INSURANCE_SETTLEMENT'
              ? 'INSURANCE SETTLEMENT VOUCHER'
              : 'WORKSHOP PAYMENT RECEIPT'}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-b border-black pb-1 mb-1 text-[8pt] space-y-0.5">
          <div className="flex justify-between">
            <span>Receipt No:</span>
            <span className="font-bold">{payment.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span>{payment.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Job Number:</span>
            <span className="font-bold">{jobSheet.jobNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Vehicle No:</span>
            <span className="font-bold uppercase">{header.vehicleNumber || '-'}</span>
          </div>
          {header.vehicleMake && (
            <div className="flex justify-between">
              <span>Vehicle:</span>
              <span>
                {header.vehicleMake} {header.vehicleModel}
              </span>
            </div>
          )}
          {header.customerInfo && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="line-clamp-1 max-w-[50mm] text-right font-medium">
                {header.customerInfo}
              </span>
            </div>
          )}
          {payment.recordedBy && (
            <div className="flex justify-between">
              <span>Cashier / Staff:</span>
              <span>{payment.recordedBy}</span>
            </div>
          )}
        </div>

        {/* Payment Line Details */}
        <div className="my-2 border-b border-black pb-2 text-[8.5pt] space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Payment Category:</span>
            <span className="font-bold capitalize">
              {payment.paymentType.toLowerCase().replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Payment Method:</span>
            <span className="font-bold">{payment.paymentMethod}</span>
          </div>
          {payment.referenceNumber && (
            <div className="flex justify-between text-[8pt] text-gray-800">
              <span>Ref / Cheque #:</span>
              <span className="font-mono">{payment.referenceNumber}</span>
            </div>
          )}
          {payment.notes && (
            <div className="text-[7.5pt] text-gray-700 italic">
              Note: {payment.notes}
            </div>
          )}
          <div className="flex justify-between items-center pt-1 border-t border-dashed border-black font-extrabold text-[10pt]">
            <span>AMOUNT RECEIVED:</span>
            <span>{formatRs(payment.amountRs)}</span>
          </div>
        </div>

        {/* Account Statement */}
        <div className="text-[8pt] space-y-0.5 border-b border-black pb-2 mb-2">
          <div className="flex justify-between">
            <span>Repair Grand Total:</span>
            <span>{formatRs(financials.grandTotalSalesRs)}</span>
          </div>
          {isInsurance && (
            <>
              <div className="flex justify-between text-blue-900">
                <span>Insurance Approved:</span>
                <span>{formatRs(financials.insuranceApprovedRs)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Customer Excess / Payable:</span>
                <span>{formatRs(financials.customerPayableRs)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-emerald-800 font-semibold">
            <span>Total Advance / Paid to Date:</span>
            <span>{formatRs(financials.advancePaidRs)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-dashed border-black font-extrabold text-[9.5pt]">
            <span>BALANCE DUE:</span>
            <span>{formatRs(payment.balanceAfterRs)}</span>
          </div>
        </div>

        {/* Barcode & Footer */}
        <div className="text-center text-[8pt] space-y-1">
          <div className="font-mono tracking-widest text-[11pt] font-bold py-1">
            * {payment.receiptNumber} *
          </div>
          <p className="font-semibold">THANK YOU FOR YOUR PAYMENT!</p>
          <p className="text-[7pt] text-gray-600">
            Please retain this receipt for workshop gate release.
          </p>
        </div>
      </div>
    );
  }
);

WorkshopPaymentThermalReceipt.displayName = 'WorkshopPaymentThermalReceipt';
