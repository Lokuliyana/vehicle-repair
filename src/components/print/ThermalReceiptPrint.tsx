import React from 'react';
import { PosSaleReceipt } from '@/types';
import { formatRs } from '@/utils/currency';
import { cn } from '@/utils/cn';

export interface ThermalReceiptPrintProps {
  receipt: PosSaleReceipt | import('@/features/pos/types').PosSaleTransaction;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  className?: string;
}

export const ThermalReceiptPrint = React.forwardRef<HTMLDivElement, ThermalReceiptPrintProps>(
  (
    {
      receipt,
      shopName = 'ANTIGRAVITY AUTO CARE & POS',
      shopAddress = 'No. 124, High Level Road, Colombo',
      shopPhone = '+94 11 234 5678 / +94 77 123 4567',
      className,
    },
    ref
  ) => {
    const subtotal = receipt.subtotalRs ?? (receipt as any).subtotalSalesRs ?? 0;
    const discount = receipt.discountRs ?? (receipt as any).overallDiscountRs ?? 0;
    const netTotal = receipt.netTotalSalesRs ?? (receipt as any).netSalesRs ?? 0;
    const split = receipt.splitDetails;

    return (
      <div
        ref={ref}
        className={cn(
          'thermal-receipt-root bg-white text-black font-mono text-[9pt] leading-tight mx-auto p-4 select-none',
          'w-[80mm] max-w-[80mm] border border-dashed border-slate-300 print:border-none print:p-0 print:m-0 shadow-sm print:shadow-none',
          className
        )}
        data-testid="thermal-receipt-root"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider">{shopName}</h2>
          <p className="text-[8pt] text-gray-700">{shopAddress}</p>
          <p className="text-[8pt] text-gray-700">Tel: {shopPhone}</p>
        </div>

        <div className="border-t border-b border-black py-1 my-1 text-[8pt] space-y-0.5">
          <div className="flex justify-between">
            <span>Receipt No:</span>
            <span className="font-bold">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span>{receipt.date}</span>
          </div>
          {receipt.cashierName && (
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{receipt.cashierName}</span>
            </div>
          )}
          {receipt.customerNote && (
            <div className="flex justify-between font-semibold gap-2">
              <span className="shrink-0">Note / Vehicle:</span>
              <span className="text-right break-words">{receipt.customerNote}</span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="my-2">
          <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1 text-[8.5pt]">
            <span className="w-1/2">Description</span>
            <span className="w-1/4 text-center">Qty x Rate</span>
            <span className="w-1/4 text-right">Total</span>
          </div>

          <div className="space-y-1">
            {receipt.items.map((item) => (
              <div key={item.id} className="text-[8.5pt]">
                <div className="font-medium break-words">{item.description}</div>
                <div className="flex justify-between text-[8pt] text-gray-700 pl-2">
                  <span>
                    {item.qty} x {formatRs(item.unitSellingPriceRs)}
                  </span>
                  <span className="font-semibold text-black">
                    {formatRs(item.lineTotalSalesRs)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Tender */}
        <div className="border-t border-black pt-1 my-1 text-[8.5pt] space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatRs(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>- {formatRs(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-[10pt] border-t border-dashed border-black pt-1">
            <span>NET TOTAL:</span>
            <span>{formatRs(netTotal)}</span>
          </div>
          <div className="flex justify-between pt-1 text-[8pt]">
            <span>Payment Method:</span>
            <span className="font-bold">{receipt.paymentMethod}</span>
          </div>

          {receipt.paymentMethod === 'SPLIT' && split && (
            <div className="text-[7.5pt] text-gray-700 pl-2 space-y-0.5 py-0.5 border-l-2 border-slate-300">
              {split.cashAmountRs > 0 && (
                <div className="flex justify-between">
                  <span>Cash Portion:</span>
                  <span>{formatRs(split.cashAmountRs)}</span>
                </div>
              )}
              {split.cardAmountRs > 0 && (
                <div className="flex justify-between">
                  <span>Card Portion:</span>
                  <span>{formatRs(split.cardAmountRs)}</span>
                </div>
              )}
              {split.bankTransferAmountRs > 0 && (
                <div className="flex justify-between">
                  <span>Bank Transfer:</span>
                  <span>{formatRs(split.bankTransferAmountRs)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between text-[8pt]">
            <span>Amount Tendered:</span>
            <span>{formatRs(receipt.amountTenderedRs)}</span>
          </div>
          <div className="flex justify-between font-bold text-[8.5pt]">
            <span>Change:</span>
            <span>{formatRs(receipt.changeGivenRs)}</span>
          </div>
        </div>

        {/* Barcode & Footer */}
        <div className="border-t border-black pt-2 mt-2 text-center text-[8pt] space-y-1">
          <div className="font-mono tracking-widest text-[11pt] font-bold py-1">
            * {receipt.receiptNumber} *
          </div>
          <p className="font-semibold">THANK YOU FOR YOUR BUSINESS!</p>
          <p className="text-[7pt] text-gray-600">Goods sold are covered under warranty.</p>
        </div>
      </div>
    );
  }
);
ThermalReceiptPrint.displayName = 'ThermalReceiptPrint';
