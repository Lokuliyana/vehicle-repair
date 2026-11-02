import { useState, type FormEvent } from 'react';
import { Barcode, Printer, DollarSign, Store } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatRs } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';
import { PosSaleReceipt } from '@/types';

const SAMPLE_RECEIPT: PosSaleReceipt = {
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
  ],
  subtotalRs: 16700,
  discountRs: 0,
  netTotalSalesRs: 16700,
  totalCostRs: 12600,
  grossProfitRs: 4100,
  paymentMethod: 'CASH',
  amountTenderedRs: 20000,
  changeGivenRs: 3300,
  cashierName: 'Kamal Fonseka',
};

export function PosTerminalPage() {
  const { activeShift } = useAuth();
  const { toast } = useToast();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const handleBarcodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    toast({
      title: 'Barcode Scanned',
      message: `Item scanned: "${barcodeInput}" added to counter cart.`,
      type: 'success',
    });
    setBarcodeInput('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" data-testid="pos-terminal-page">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            Counter POS & Quick Spare Parts Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Walk-in parts, lubricants, fast checkout, and 80mm ESC/POS thermal printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeShift && (
            <Badge variant="success" className="text-xs">
              Shift: {activeShift.id} ({activeShift.status})
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReceipt(!showReceipt)}
            className="text-xs gap-1.5"
            data-testid="toggle-pos-receipt-preview"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            {showReceipt ? 'Hide Receipt' : 'Preview 80mm Receipt'}
          </Button>
        </div>
      </div>

      {/* POS Barcode & Quick Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan barcode or type item SKU/description to add to cart..."
              className="pl-9 text-xs h-10"
              data-testid="pos-barcode-input"
            />
          </div>
          <Button type="submit" variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs">
            Add Line
          </Button>
        </form>
      </div>

      {/* Main Grid: Cart Items & Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
            Active Cart Lines ({SAMPLE_RECEIPT.items.length} items)
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SAMPLE_RECEIPT.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">{item.description}</td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3 text-right">{formatRs(item.unitSellingPriceRs)}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatRs(item.lineTotalSalesRs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Settlement Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Cart Total & Tender</h3>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatRs(SAMPLE_RECEIPT.subtotalRs)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Discount:</span>
              <span>{formatRs(SAMPLE_RECEIPT.discountRs)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Net Payable:</span>
              <span className="text-blue-600">{formatRs(SAMPLE_RECEIPT.netTotalSalesRs)}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="default"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                onClick={() =>
                  toast({
                    title: 'Payment Processed',
                    message: 'Cash tender complete. 80mm thermal receipt ready.',
                    type: 'success',
                  })
                }
              >
                <DollarSign className="w-4 h-4 mr-1.5" /> Complete Cash Sale (Rs. 20,000)
              </Button>
            </div>
          </div>

          {/* Receipt Preview Container */}
          {showReceipt && (
            <div className="p-4 bg-slate-200 rounded-xl flex justify-center">
              <ThermalReceiptPrint receipt={SAMPLE_RECEIPT} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
