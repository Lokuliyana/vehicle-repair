import { useState, useEffect } from 'react';
import { History, Search, Printer } from 'lucide-react';

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatRs } from '@/utils/currency';
import { PosSaleTransaction } from '../types';
import { posSaleRepository } from '../repository/pos-sale.repository.mock';

export interface PosSalesHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReceipt: (receipt: PosSaleTransaction) => void;
}

export function PosSalesHistoryModal({
  open,
  onOpenChange,
  onSelectReceipt,
}: PosSalesHistoryModalProps) {
  const [sales, setSales] = useState<PosSaleTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      posSaleRepository
        .getAll()
        .then((res) => setSales(res))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const filteredSales = sales.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.receiptNumber.toLowerCase().includes(q) ||
      s.customerNote.toLowerCase().includes(q) ||
      s.cashierName.toLowerCase().includes(q) ||
      s.items.some((it) => it.description.toLowerCase().includes(q))
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl">
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-bold">
          <History className="w-5 h-5 text-blue-600" />
          POS Completed Sales & Receipt History
        </DialogTitle>
        <DialogDescription className="text-xs">
          View past counter transactions and 1-click reprint 80mm ESC/POS customer receipts.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4" data-testid="pos-sales-history-body">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt # (e.g. POS-2026-0001), customer note, cashier..."
            className="pl-9 text-xs h-9"
            data-testid="history-search-input"
          />
        </div>

        {/* Table Container */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[55vh]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Receipt #</th>
                <th className="p-2.5">Date & Time</th>
                <th className="p-2.5">Customer / Note</th>
                <th className="p-2.5">Cashier</th>
                <th className="p-2.5 text-center">Items</th>
                <th className="p-2.5 text-center">Method</th>
                <th className="p-2.5 text-right">Net Total</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                    {loading ? 'Loading sales history...' : 'No POS receipts found.'}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-mono text-blue-700">
                      {sale.receiptNumber}
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px] whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="p-2.5 font-medium text-slate-800 max-w-[160px] truncate">
                      {sale.customerNote}
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px] whitespace-nowrap">
                      {sale.cashierName}
                    </td>
                    <td className="p-2.5 text-center text-slate-600">
                      {sale.items.length}
                    </td>
                    <td className="p-2.5 text-center">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        {sale.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatRs(sale.netSalesRs)}
                    </td>
                    <td className="p-2.5 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onSelectReceipt(sale);
                        }}
                        className="h-7 text-xs px-2 gap-1 border-slate-300"
                        data-testid={`reprint-receipt-btn-${sale.receiptNumber}`}
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        Reprint
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="text-xs"
        >
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
