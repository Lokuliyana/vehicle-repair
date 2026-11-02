import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { UserRole } from '@/types';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { PosTerminalPage } from '@/features/pos/pages/PosTerminalPage';
import { ThermalReceiptPrint } from '@/components/print/ThermalReceiptPrint';
import { PosShiftDrawerModal } from '@/features/pos/components/PosShiftDrawerModal';
import { PosPaymentModal } from '@/features/pos/components/PosPaymentModal';
import { formatRs } from '@/utils/currency';

function TestWrapper({
  initialRole = 'OWNER',
  enableCost = true,
  children,
}: {
  initialRole?: UserRole;
  enableCost?: boolean;
  children: React.ReactNode;
}) {
  return (
    <MemoryRouter>
      <AuthProvider initialRole={initialRole}>
        <CostController enableCost={enableCost}>
          <ToastProvider>{children}</ToastProvider>
        </CostController>
      </AuthProvider>
    </MemoryRouter>
  );
}

function CostController({
  enableCost,
  children,
}: {
  enableCost: boolean;
  children: React.ReactNode;
}) {
  const { setCostProfitVisible, permissions } = useAuth();

  React.useEffect(() => {
    if (permissions.canViewCosts) {
      setCostProfitVisible(enableCost);
    }
  }, [enableCost, permissions.canViewCosts, setCostProfitVisible]);

  return <>{children}</>;
}

describe('Phase 7: Counter / Showroom POS & Shift Cash Management', () => {
  beforeEach(async () => {
    localStorage.clear();
    await catalogRepository.resetToDefaults();
    await posShiftRepository.resetToDefaults();
    await posSaleRepository.resetToDefaults();
  });

  describe('1. Domain Layer: PosShiftRepository & PosSaleRepository', () => {
    it('manages shift lifecycle: open -> cash in/out -> sales -> close with variance', async () => {
      const initialShift = await posShiftRepository.getActiveShift();
      expect(initialShift).not.toBeNull();
      expect(initialShift?.status).toBe('OPEN');
      expect(initialShift?.openingFloatRs).toBe(15000);
      expect(initialShift?.expectedDrawerCashRs).toBe(15000);

      // Record Cash In
      const afterIn = await posShiftRepository.recordCashIn(
        initialShift!.id,
        2500,
        'Additional change float'
      );
      expect(afterIn.cashInRs).toBe(2500);
      expect(afterIn.expectedDrawerCashRs).toBe(17500);

      // Record Cash Out
      const afterOut = await posShiftRepository.recordCashOut(
        initialShift!.id,
        500,
        'Staff tea allowance'
      );
      expect(afterOut.cashOutRs).toBe(500);
      expect(afterOut.expectedDrawerCashRs).toBe(17000);

      // Record Cash Sale
      const afterCashSale = await posShiftRepository.recordSale(
        initialShift!.id,
        'CASH',
        3000
      );
      expect(afterCashSale.totalCashSalesRs).toBe(3000);
      expect(afterCashSale.expectedDrawerCashRs).toBe(20000);

      // Record Card Sale (should not affect drawer cash)
      const afterCardSale = await posShiftRepository.recordSale(
        initialShift!.id,
        'CARD',
        5000
      );
      expect(afterCardSale.totalCardSalesRs).toBe(5000);
      expect(afterCardSale.expectedDrawerCashRs).toBe(20000);

      // Record Split Sale
      const afterSplitSale = await posShiftRepository.recordSale(
        initialShift!.id,
        'SPLIT',
        4000,
        {
          cashAmountRs: 1000,
          cardAmountRs: 3000,
          bankTransferAmountRs: 0,
        }
      );
      expect(afterSplitSale.totalCashSalesRs).toBe(4000);
      expect(afterSplitSale.totalCardSalesRs).toBe(8000);
      expect(afterSplitSale.expectedDrawerCashRs).toBe(21000);

      // Close shift with actual cash 21500 (+500 over)
      const closed = await posShiftRepository.closeShift(initialShift!.id, 21500);
      expect(closed.status).toBe('CLOSED');
      expect(closed.actualDrawerCashRs).toBe(21500);
      expect(closed.varianceRs).toBe(500);

      // Re-open new shift
      const newShift = await posShiftRepository.openShift('user-cashier', 'Kamal Fonseka', 18000);
      expect(newShift.status).toBe('OPEN');
      expect(newShift.openingFloatRs).toBe(18000);
      expect(newShift.expectedDrawerCashRs).toBe(18000);
    });

    it('generates sequential receipt numbers POS-YYYY-XXXX and deducts catalog inventory on sale', async () => {
      const currentYear = new Date().getFullYear();
      const nextReceipt = await posSaleRepository.getNextReceiptNumber();
      expect(nextReceipt).toMatch(new RegExp(`^POS-${currentYear}-\\d{4}$`));

      // Get initial stock for Denso Oil Filter
      const partBefore = await catalogRepository.getById('cat-prt-004');
      expect(partBefore).not.toBeNull();
      const stockBefore = partBefore!.stockQty;

      // Complete a sale of 2 filters
      const activeShift = await posShiftRepository.getActiveShift();
      const sale = await posSaleRepository.create({
        shiftId: activeShift!.id,
        cashierName: 'Kamal Fonseka',
        customerNote: 'WP CAB-1234',
        items: [
          {
            catalogItemId: 'cat-prt-004',
            description: 'Denso Oil Filter C-110',
            qty: 2,
            unitSellingPriceRs: 2200,
            unitBuyingCostRs: 1400,
          },
        ],
        paymentMethod: 'CASH',
        amountTenderedRs: 5000,
      });

      expect(sale.receiptNumber).toMatch(new RegExp(`^POS-${currentYear}-`));
      expect(sale.netSalesRs).toBe(4400);
      expect(sale.totalBuyingCostRs).toBe(2800);
      expect(sale.grossProfitRs).toBe(1600);
      expect(sale.changeGivenRs).toBe(600);

      // Verify stock was deducted in catalogRepository
      const partAfter = await catalogRepository.getById('cat-prt-004');
      expect(partAfter!.stockQty).toBe(stockBefore - 2);
    });
  });

  describe('2. Counter POS Terminal Page (/pos) User Workflows', () => {
    it('browses product catalog, searches by SKU/name, and adds items to cart', async () => {
      await act(async () => {
        render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      // Verify Catalog Grid is rendered
      expect(screen.getByTestId('pos-catalog-grid')).toBeInTheDocument();

      // Search for Denso Oil Filter
      const searchInput = screen.getByTestId('catalog-search-input');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Denso' } });
      });

      expect(screen.getByTestId('catalog-card-FLT-DEN-C110')).toBeInTheDocument();

      // Click Add to Cart
      const addBtn = screen.getByTestId('add-to-cart-btn-FLT-DEN-C110');
      await act(async () => {
        fireEvent.click(addBtn);
      });

      // Verify Cart updated
      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('1 item');
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent(formatRs(2200));
      expect(screen.getByTestId('cart-net-payable')).toHaveTextContent(formatRs(2200));
    });

    it('scans barcode or SKU and increments quantity if already in cart', async () => {
      await act(async () => {
        render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      const barcodeInput = screen.getByTestId('pos-barcode-input');
      const submitBtn = screen.getByTestId('pos-barcode-submit-btn');

      // Scan barcode for Toyota Genuine Motor Oil: 8901234567890
      await act(async () => {
        fireEvent.change(barcodeInput, { target: { value: '8901234567890' } });
        fireEvent.click(submitBtn);
      });

      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('1 item');
      expect(screen.getByTestId('cart-net-payable')).toHaveTextContent(formatRs(14500));

      // Scan the exact same barcode again -> increments quantity
      await act(async () => {
        fireEvent.change(barcodeInput, { target: { value: '8901234567890' } });
        fireEvent.click(submitBtn);
      });

      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('1 item');
      expect(screen.getByTestId('cart-net-payable')).toHaveTextContent(formatRs(29000));
    });

    it('adds on-the-fly custom items to active cart', async () => {
      await act(async () => {
        render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      // Open Custom Item Modal
      const openCustomBtn = screen.getByTestId('pos-add-custom-item-btn');
      await act(async () => {
        fireEvent.click(openCustomBtn);
      });

      expect(screen.getByTestId('pos-custom-item-form')).toBeInTheDocument();

      // Fill in details
      const descInput = screen.getByTestId('custom-item-desc-input');
      const priceInput = screen.getByTestId('custom-item-price-input');
      const costInput = screen.getByTestId('custom-item-cost-input');
      const addCustomBtn = screen.getByTestId('add-custom-item-btn');

      await act(async () => {
        fireEvent.change(descInput, { target: { value: 'Ad-hoc Radiator Cap 0.9 Bar' } });
        fireEvent.change(priceInput, { target: { value: '3500' } });
        fireEvent.change(costInput, { target: { value: '2000' } });
        fireEvent.click(addCustomBtn);
      });

      // Check item appears in cart
      expect(screen.getByText('Ad-hoc Radiator Cap 0.9 Bar')).toBeInTheDocument();
      expect(screen.getByTestId('cart-net-payable')).toHaveTextContent(formatRs(3500));
    });

    it('performs cart line adjustments, line discounts, overall discount, and clear cart', async () => {
      await act(async () => {
        render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      // Add item
      const barcodeInput = screen.getByTestId('pos-barcode-input');
      const submitBtn = screen.getByTestId('pos-barcode-submit-btn');
      await act(async () => {
        fireEvent.change(barcodeInput, { target: { value: 'FLT-DEN-C110' } });
        fireEvent.click(submitBtn);
      });

      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent(formatRs(2200));

      // Adjust overall discount
      const discountInput = screen.getByTestId('cart-overall-discount-input');
      await act(async () => {
        fireEvent.change(discountInput, { target: { value: '200' } });
      });

      expect(screen.getByTestId('cart-net-payable')).toHaveTextContent(formatRs(2000));

      // Clear cart
      const clearBtn = screen.getByTestId('clear-cart-btn');
      await act(async () => {
        fireEvent.click(clearBtn);
      });

      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('0 items');
    });
  });

  describe('3. Privacy Invariants: Margin Visibility & Cost Leakage Protection', () => {
    it('PRIVACY INVARIANT: displays internal margin & profit panel ONLY to OWNER / MANAGER when cost mode is ON', async () => {
      // 1. OWNER with cost mode ON -> panel is visible
      let unmountFn: () => void = () => {};
      await act(async () => {
        const res = render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
        unmountFn = res.unmount;
      });

      // Add custom item
      const openCustomBtn = screen.getByTestId('pos-add-custom-item-btn');
      await act(async () => {
        fireEvent.click(openCustomBtn);
      });

      const descInput = screen.getByTestId('custom-item-desc-input');
      const priceInput = screen.getByTestId('custom-item-price-input');
      const costInput = screen.getByTestId('custom-item-cost-input');
      const addCustomBtn = screen.getByTestId('add-custom-item-btn');

      await act(async () => {
        fireEvent.change(descInput, { target: { value: 'Test Part' } });
        fireEvent.change(priceInput, { target: { value: '10000' } });
        fireEvent.change(costInput, { target: { value: '6000' } });
        fireEvent.click(addCustomBtn);
      });

      expect(screen.getByTestId('cart-internal-margin-panel')).toBeInTheDocument();
      expect(screen.getByTestId('cart-internal-cost')).toHaveTextContent(formatRs(6000));
      expect(screen.getByTestId('cart-internal-profit')).toHaveTextContent(formatRs(4000));

      unmountFn();

      // 2. CASHIER -> panel MUST NEVER be rendered
      await act(async () => {
        render(
          <TestWrapper initialRole="CASHIER" enableCost={false}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      expect(screen.queryByTestId('cart-internal-margin-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-internal-cost')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-internal-profit')).not.toBeInTheDocument();
    });

    it('PRIVACY INVARIANT: 80mm thermal receipt STRICTLY excludes buying costs and gross profits', () => {
      const mockSale = {
        id: 'pos-test-1',
        receiptNumber: 'POS-2026-0099',
        date: '2026-11-02 11:00 AM',
        customerNote: 'Walk-in Counter (WP CAB-5521)',
        cashierName: 'Kamal Fonseka',
        items: [
          {
            id: 'l1',
            description: 'Denso Oil Filter C-110',
            qty: 2,
            unitSellingPriceRs: 2200,
            unitBuyingCostRs: 1400, // INTERNAL SECRET
            lineDiscountRs: 0,
            lineTotalSalesRs: 4400,
            lineTotalCostRs: 2800, // INTERNAL SECRET
            lineGrossProfitRs: 1600, // INTERNAL SECRET
          },
        ],
        subtotalRs: 4400,
        discountRs: 0,
        netTotalSalesRs: 4400,
        totalCostRs: 2800, // INTERNAL SECRET
        grossProfitRs: 1600, // INTERNAL SECRET
        paymentMethod: 'CASH' as const,
        amountTenderedRs: 5000,
        changeGivenRs: 600,
      };

      const { container } = render(<ThermalReceiptPrint receipt={mockSale} />);

      // Verify Customer visible data
      expect(screen.getByTestId('thermal-receipt-root')).toBeInTheDocument();
      expect(screen.getByText('POS-2026-0099')).toBeInTheDocument();
      expect(screen.getByText('Denso Oil Filter C-110')).toBeInTheDocument();
      expect(container).toHaveTextContent(formatRs(4400));
      expect(container).toHaveTextContent(formatRs(600)); // Change

      // Verify ZERO cost leakage
      expect(container).not.toHaveTextContent('1,400');
      expect(container).not.toHaveTextContent('2,800');
      expect(container).not.toHaveTextContent('1,600');
      expect(container).not.toHaveTextContent('Buying Cost');
      expect(container).not.toHaveTextContent('Gross Profit');
      expect(container).not.toHaveTextContent('Margin');
    });
  });

  describe('4. Payment Tender Modal & Split Payments', () => {
    it('calculates cash change and quick cash denominations correctly', () => {
      const onComplete = vi.fn();
      render(
        <PosPaymentModal
          open={true}
          onOpenChange={vi.fn()}
          netSalesRs={4200}
          customerNote="Walk-in Counter"
          isShiftOpen={true}
          onCompletePayment={onComplete}
        />
      );

      expect(screen.getByTestId('pos-modal-net-payable')).toHaveTextContent(formatRs(4200));

      // Click +Rs. 1000 button
      const plus1000Btn = screen.getByTestId('quick-cash-1000');
      act(() => {
        fireEvent.click(plus1000Btn);
      });

      // Tendered was 4200 -> now 5200 -> change should be 1000
      expect(screen.getByTestId('pos-change-due')).toHaveTextContent(formatRs(1000));

      // Complete payment
      const submitBtn = screen.getByTestId('complete-pos-payment-btn');
      act(() => {
        fireEvent.click(submitBtn);
      });

      expect(onComplete).toHaveBeenCalledWith({
        paymentMethod: 'CASH',
        amountTenderedRs: 5200,
        changeGivenRs: 1000,
      });
    });

    it('supports Split tender (Cash + Card) and validates exact total match', async () => {
      const onComplete = vi.fn();
      render(
        <PosPaymentModal
          open={true}
          onOpenChange={vi.fn()}
          netSalesRs={10000}
          customerNote="WP CAB-1234"
          isShiftOpen={true}
          onCompletePayment={onComplete}
        />
      );

      // Select Split tab
      const splitTab = screen.getByTestId('payment-method-split-tab');
      act(() => {
        fireEvent.click(splitTab);
      });

      const cashInput = screen.getByTestId('split-cash-input');
      const cardInput = screen.getByTestId('split-card-input');

      // Enter split amounts: 4000 cash + 6000 card
      act(() => {
        fireEvent.change(cashInput, { target: { value: '4000' } });
        fireEvent.change(cardInput, { target: { value: '6000' } });
      });

      expect(screen.getByTestId('split-remaining-indicator')).toHaveTextContent('Balanced');

      // Submit payment
      const submitBtn = screen.getByTestId('complete-pos-payment-btn');
      act(() => {
        fireEvent.click(submitBtn);
      });

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'SPLIT',
          splitDetails: expect.objectContaining({
            cashAmountRs: 4000,
            cardAmountRs: 6000,
          }),
        })
      );
    });
  });

  describe('5. Shift Drawer Reconciliation Modal', () => {
    it('records cash-in, cash-out, and calculates drawer variance upon shift close', async () => {
      const initialShift = await posShiftRepository.getActiveShift();
      const onUpdated = vi.fn();

      const { rerender } = render(
        <PosShiftDrawerModal
          open={true}
          onOpenChange={vi.fn()}
          activeShift={initialShift}
          onShiftUpdated={onUpdated}
        />
      );

      // Drawer Summary should show 15,000 expected cash
      expect(screen.getByTestId('expected-drawer-cash-value')).toHaveTextContent(formatRs(15000));

      // Switch to Cash In Tab
      const cashInTab = screen.getByTestId('shift-tab-cash-in');
      act(() => {
        fireEvent.click(cashInTab);
      });

      const inAmountInput = screen.getByTestId('cash-in-amount-input');
      const inReasonInput = screen.getByTestId('cash-in-reason-input');
      const inSubmitBtn = screen.getByTestId('cash-in-submit-btn');

      await act(async () => {
        fireEvent.change(inAmountInput, { target: { value: '3000' } });
        fireEvent.change(inReasonInput, { target: { value: 'Float top-up' } });
        fireEvent.click(inSubmitBtn);
      });

      expect(onUpdated).toHaveBeenCalled();

      // Fetch updated shift from repo and rerender
      const updatedShift = await posShiftRepository.getActiveShift();
      rerender(
        <PosShiftDrawerModal
          open={true}
          onOpenChange={vi.fn()}
          activeShift={updatedShift}
          onShiftUpdated={onUpdated}
        />
      );

      // Expected cash is now 18,000
      expect(screen.getByTestId('expected-drawer-cash-value')).toHaveTextContent(formatRs(18000));

      // Switch to Close Shift Tab
      const closeTab = screen.getByTestId('shift-tab-close');
      act(() => {
        fireEvent.click(closeTab);
      });

      const countedInput = screen.getByTestId('close-counted-cash-input');
      // Counted actual cash: 18,000 -> Balanced
      act(() => {
        fireEvent.change(countedInput, { target: { value: '18000' } });
      });

      expect(screen.getByTestId('shift-variance-badge')).toHaveTextContent('Balanced');

      // Counted actual cash: 17,500 -> Cash Short (-Rs. 500)
      act(() => {
        fireEvent.change(countedInput, { target: { value: '17500' } });
      });

      expect(screen.getByTestId('shift-variance-badge')).toHaveTextContent(
        `Cash Short (-${formatRs(500)})`
      );

      // Close shift
      const confirmCloseBtn = screen.getByTestId('confirm-close-shift-btn');
      await act(async () => {
        fireEvent.click(confirmCloseBtn);
      });

      // Verify closed in repo
      const finalShift = await posShiftRepository.getShiftById(initialShift!.id);
      expect(finalShift?.status).toBe('CLOSED');
      expect(finalShift?.actualDrawerCashRs).toBe(17500);
      expect(finalShift?.varianceRs).toBe(-500);
    });
  });

  describe('6. Hardware Barcode Listener & POS Sales History', () => {
    it('intercepts rapid keyboard barcode scanner events and adds product to cart', async () => {
      await act(async () => {
        render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      // Rapid keypresses simulating USB barcode scanner for FLT-DEN-C110 (barcode: 8901234567891)
      const barcodeChars = '8901234567891'.split('');
      await act(async () => {
        for (const char of barcodeChars) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        }
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('1 item');
      expect(screen.getAllByText('Denso Oil Filter C-110').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByTestId('cart-net-payable')).toHaveTextContent(formatRs(2200));
    });

    it('settles sale via CARD and BANK_TRANSFER methods', () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <PosPaymentModal
          open={true}
          onOpenChange={vi.fn()}
          netSalesRs={7500}
          customerNote="Card Customer"
          isShiftOpen={true}
          onCompletePayment={onComplete}
        />
      );

      // Select Card Tab
      const cardTab = screen.getByTestId('payment-method-card-tab');
      act(() => {
        fireEvent.click(cardTab);
      });

      const submitBtn = screen.getByTestId('complete-pos-payment-btn');
      act(() => {
        fireEvent.click(submitBtn);
      });

      expect(onComplete).toHaveBeenCalledWith({
        paymentMethod: 'CARD',
        amountTenderedRs: 7500,
        changeGivenRs: 0,
      });

      // Rerender for Bank Transfer
      rerender(
        <PosPaymentModal
          open={true}
          onOpenChange={vi.fn()}
          netSalesRs={12000}
          customerNote="Transfer Customer"
          isShiftOpen={true}
          onCompletePayment={onComplete}
        />
      );

      const transferTab = screen.getByTestId('payment-method-transfer-tab');
      act(() => {
        fireEvent.click(transferTab);
      });

      act(() => {
        fireEvent.click(submitBtn);
      });

      expect(onComplete).toHaveBeenCalledWith({
        paymentMethod: 'BANK_TRANSFER',
        amountTenderedRs: 12000,
        changeGivenRs: 0,
      });
    });

    it('searches completed sales history and opens reprint modal', async () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      await act(async () => {
        render(
          <TestWrapper initialRole="OWNER" enableCost={true}>
            <PosTerminalPage />
          </TestWrapper>
        );
      });

      // Open History Modal
      const historyBtn = screen.getByTestId('pos-open-history-btn');
      await act(async () => {
        fireEvent.click(historyBtn);
      });

      expect(screen.getByTestId('pos-sales-history-body')).toBeInTheDocument();
      expect(screen.getByText('POS-2026-0001')).toBeInTheDocument();

      // Click Reprint
      const reprintBtn = screen.getByTestId('reprint-receipt-btn-POS-2026-0001');
      await act(async () => {
        fireEvent.click(reprintBtn);
      });

      // Receipt modal is open
      const printBtn = screen.getByTestId('print-receipt-btn');
      expect(printBtn).toBeInTheDocument();

      // Trigger Print
      act(() => {
        fireEvent.click(printBtn);
      });
      expect(printSpy).toHaveBeenCalled();

      printSpy.mockRestore();
    });
  });
});

