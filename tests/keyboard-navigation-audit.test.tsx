import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { WorkshopTable } from '@/components/workshop/WorkshopTable';
import { Header } from '@/app/layout/Header';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { WorkshopLineItem } from '@/types';
import { PosTerminalPage } from '@/features/pos/pages/PosTerminalPage';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';

function WorkshopTableTestHarness({
  initialItems,
  isCostProfitVisible = false,
  isJobCardMode = false,
}: {
  initialItems?: WorkshopLineItem[];
  isCostProfitVisible?: boolean;
  isJobCardMode?: boolean;
}) {
  const [items, setItems] = useState<WorkshopLineItem[]>(
    initialItems || [
      {
        id: 'row-1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'First Action',
        sellingPriceRs: 5000,
        buyingCostRs: 1500,
        assignedTechnician: 'Tech 1',
        isCompleted: false,
      },
      {
        id: 'row-2',
        rowNo: 2,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Second Action',
        sellingPriceRs: 8000,
        buyingCostRs: 2500,
        assignedTechnician: 'Tech 2',
        isCompleted: false,
      },
    ]
  );

  return (
    <WorkshopTable
      category="LABOR_REMOVE_REASSEMBLE"
      title="1. Labor - Remove & Reassemble"
      sectionNumber={1}
      items={items}
      isCostProfitVisible={isCostProfitVisible}
      isJobCardMode={isJobCardMode}
      onItemsChange={setItems}
    />
  );
}

describe('Keyboard Navigation & Usability Audit', () => {
  describe('1. Enter Key Cell Traversal & Enter-to-Add Row', () => {
    it('traverses cells horizontally: Description -> Amount on Enter key', () => {
      render(<WorkshopTableTestHarness isCostProfitVisible={false} />);

      const desc1 = screen.getByTestId('desc-input-row-1');
      const amount1 = screen.getByTestId('amount-input-row-1');

      desc1.focus();
      expect(document.activeElement).toBe(desc1);

      fireEvent.keyDown(desc1, { key: 'Enter', code: 'Enter' });
      expect(document.activeElement).toBe(amount1);
    });

    it('traverses cells horizontally: Description -> Tech in Job Card floor mode on Enter', () => {
      render(<WorkshopTableTestHarness isJobCardMode={true} />);

      const desc1 = screen.getByTestId('desc-input-row-1');
      const tech1 = screen.getByTestId('tech-input-row-1');

      desc1.focus();
      fireEvent.keyDown(desc1, { key: 'Enter', code: 'Enter' });
      expect(document.activeElement).toBe(tech1);
    });

    it('traverses cells horizontally: Amount -> Buying Cost when Cost Mode is active', () => {
      render(<WorkshopTableTestHarness isCostProfitVisible={true} />);

      const amount1 = screen.getByTestId('amount-input-row-1');
      const cost1 = screen.getByTestId('cost-input-row-1');

      amount1.focus();
      fireEvent.keyDown(amount1, { key: 'Enter', code: 'Enter' });
      expect(document.activeElement).toBe(cost1);
    });

    it('advances focus to the next existing row description when on an intermediate row', () => {
      render(<WorkshopTableTestHarness isCostProfitVisible={false} />);

      const amount1 = screen.getByTestId('amount-input-row-1');
      const desc2 = screen.getByTestId('desc-input-row-2');

      amount1.focus();
      fireEvent.keyDown(amount1, { key: 'Enter', code: 'Enter' });

      // Focus should move to row-2 description, not create a new row
      expect(document.activeElement).toBe(desc2);
      expect(screen.getAllByPlaceholderText('Enter repair or replacement item description...').length).toBe(2);
    });

    it('appends a new row and shifts focus when Enter is pressed on the final row', () => {
      render(<WorkshopTableTestHarness isCostProfitVisible={false} />);

      const amount2 = screen.getByTestId('amount-input-row-2');
      expect(screen.getAllByPlaceholderText('Enter repair or replacement item description...').length).toBe(2);

      amount2.focus();
      fireEvent.keyDown(amount2, { key: 'Enter', code: 'Enter' });

      // Table should now have 3 rows
      const allDescInputs = screen.getAllByPlaceholderText(
        'Enter repair or replacement item description...'
      );
      expect(allDescInputs.length).toBe(3);
    });
  });

  describe('2. ArrowUp / ArrowDown Row Navigation', () => {
    it('moves focus vertically between rows using ArrowDown and ArrowUp in Description column', () => {
      render(<WorkshopTableTestHarness isCostProfitVisible={false} />);

      const desc1 = screen.getByTestId('desc-input-row-1');
      const desc2 = screen.getByTestId('desc-input-row-2');

      desc1.focus();
      expect(document.activeElement).toBe(desc1);

      // Press ArrowDown
      fireEvent.keyDown(desc1, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(desc2);

      // Press ArrowUp
      fireEvent.keyDown(desc2, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(desc1);
    });

    it('moves focus vertically between rows using ArrowDown and ArrowUp in Amount column', () => {
      render(<WorkshopTableTestHarness isCostProfitVisible={false} />);

      const amount1 = screen.getByTestId('amount-input-row-1');
      const amount2 = screen.getByTestId('amount-input-row-2');

      amount1.focus();
      expect(document.activeElement).toBe(amount1);

      fireEvent.keyDown(amount1, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(amount2);

      fireEvent.keyDown(amount2, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(amount1);
    });
  });

  describe('3. Global Cmd+K / Ctrl+K Quick Search Shortcut', () => {
    it('focuses global search input on Cmd+K (Mac metaKey)', () => {
      render(
        <MemoryRouter>
          <AuthProvider initialRole="OWNER">
            <ToastProvider>
              <Header onToggleMobile={() => {}} />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      const searchInput = screen.getByTestId('global-search-input');
      expect(document.activeElement).not.toBe(searchInput);

      // Trigger Cmd+K
      fireEvent.keyDown(window, { key: 'k', code: 'KeyK', metaKey: true });
      expect(document.activeElement).toBe(searchInput);
    });

    it('focuses global search input on Ctrl+K (Windows/Linux ctrlKey)', () => {
      render(
        <MemoryRouter>
          <AuthProvider initialRole="OWNER">
            <ToastProvider>
              <Header onToggleMobile={() => {}} />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      const searchInput = screen.getByTestId('global-search-input');
      expect(document.activeElement).not.toBe(searchInput);

      // Trigger Ctrl+K
      fireEvent.keyDown(window, { key: 'k', code: 'KeyK', ctrlKey: true });
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('4. POS Barcode Scanning Without Focus Traps', () => {
    beforeEach(async () => {
      localStorage.clear();
      await catalogRepository.resetToDefaults();
      await posShiftRepository.resetToDefaults();
    });

    it('operates hardware barcode scanner listener without trapping normal typing or active inputs', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <AuthProvider initialRole="OWNER">
              <ToastProvider>
                <PosTerminalPage />
              </ToastProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      // 1. Verify barcode input is present and navigable
      const barcodeInput = screen.getByTestId('pos-barcode-input');
      expect(barcodeInput).toBeInTheDocument();

      // 2. Typing into an active input shouldn't trigger background scanner buffer
      barcodeInput.focus();
      expect(document.activeElement).toBe(barcodeInput);
      fireEvent.change(barcodeInput, { target: { value: 'FLT-DEN-C110' } });
      expect(barcodeInput).toHaveValue('FLT-DEN-C110');

      // 3. Clear barcode input and blur it to test background scanning without focus
      fireEvent.change(barcodeInput, { target: { value: '' } });
      barcodeInput.blur();
      expect(document.activeElement).not.toBe(barcodeInput);

      // Rapid keypresses simulating USB barcode scanner for FLT-DEN-C110 (barcode: 8901234567891)
      const barcodeChars = '8901234567891'.split('');
      await act(async () => {
        for (const char of barcodeChars) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        }
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      // Verify item was added to cart seamlessly without focus trap
      expect(screen.getByTestId('cart-count-badge')).toHaveTextContent('1 item');
    });
  });
});

