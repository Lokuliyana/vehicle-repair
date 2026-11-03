import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/toast';
import { UserRole } from '@/types';
import { CatalogListPage } from '@/features/catalog/pages/CatalogListPage';
import { CatalogItemDialog } from '@/features/catalog/components/CatalogItemDialog';
import { CatalogCombobox } from '@/features/catalog/components/CatalogCombobox';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';

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

describe('Catalog Privacy Invariants & Role Access', () => {
  beforeEach(async () => {
    await catalogRepository.resetToDefaults();
  });

  it('PRIVACY INVARIANT: renders Buying Cost column on Catalog page ONLY when role is OWNER and cost mode is toggled ON', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="OWNER" enableCost={true}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-cost-header')).toBeInTheDocument();
      expect(screen.getByTestId('buying-cost-header')).toBeInTheDocument();
      expect(screen.getByTestId('profit-header')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-cost-PRT-TOY-BMP-F')).toBeInTheDocument();
    });
  });

  it('PRIVACY INVARIANT: renders Buying Cost column for WORKSHOP_MANAGER when cost mode is active', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="WORKSHOP_MANAGER" enableCost={true}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-cost-header')).toBeInTheDocument();
      expect(screen.getByTestId('profit-header')).toBeInTheDocument();
    });
  });

  it('PRIVACY INVARIANT: HIDES Buying Cost column when OWNER turns cost mode OFF', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="OWNER" enableCost={false}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-list-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('catalog-cost-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('buying-cost-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profit-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('catalog-cost-PRT-TOY-BMP-F')).not.toBeInTheDocument();
  });

  it('PRIVACY INVARIANT: COMPLETELY EXCLUDES Buying Cost column for SERVICE_ADVISOR', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="SERVICE_ADVISOR" enableCost={true}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-list-page')).toBeInTheDocument();
    });

    // Both the header and cell MUST NOT exist in the DOM
    expect(screen.queryByTestId('catalog-cost-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('buying-cost-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profit-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('catalog-cost-PRT-TOY-BMP-F')).not.toBeInTheDocument();
  });

  it('PRIVACY INVARIANT: COMPLETELY EXCLUDES Buying Cost column for CASHIER', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="CASHIER" enableCost={true}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-list-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('catalog-cost-header')).not.toBeInTheDocument();
  });

  it('PRIVACY INVARIANT: COMPLETELY EXCLUDES Buying Cost column for TECHNICIAN', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="TECHNICIAN" enableCost={true}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-list-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('catalog-cost-header')).not.toBeInTheDocument();
  });

  it('PRIVACY INVARIANT (Dialog): allows OWNER to view and set buyingCostRs in CatalogItemDialog', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="OWNER" enableCost={true}>
          <CatalogItemDialog
            open={true}
            onOpenChange={() => {}}
            onSaved={() => {}}
          />
        </TestWrapper>
      );
    });

    expect(screen.getByTestId('catalog-form-buying-cost')).toBeInTheDocument();
  });

  it('PRIVACY INVARIANT (Dialog): HIDES buyingCostRs input in CatalogItemDialog for non-management roles', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="SERVICE_ADVISOR" enableCost={true}>
          <CatalogItemDialog
            open={true}
            onOpenChange={() => {}}
            onSaved={() => {}}
          />
        </TestWrapper>
      );
    });

    expect(screen.queryByTestId('catalog-form-buying-cost')).not.toBeInTheDocument();
  });

  it('PRIVACY INVARIANT (Combobox): displays internal cost indicator only when permitted and active', async () => {
    // 1. OWNER with cost active
    const { unmount } = render(
      <TestWrapper initialRole="OWNER" enableCost={true}>
        <CatalogCombobox onSelect={() => {}} />
      </TestWrapper>
    );

    const input = screen.getByTestId('catalog-combobox-input');
    await act(async () => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Bumper' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-combobox-dropdown')).toBeInTheDocument();
    });

    // Should render internal cost
    expect(screen.getByText(/Cost: Rs. 25,000/i)).toBeInTheDocument();
    unmount();

    // 2. SERVICE_ADVISOR
    await act(async () => {
      render(
        <TestWrapper initialRole="SERVICE_ADVISOR" enableCost={true}>
          <CatalogCombobox onSelect={() => {}} />
        </TestWrapper>
      );
    });

    const advisorInput = screen.getByTestId('catalog-combobox-input');
    await act(async () => {
      fireEvent.focus(advisorInput);
      fireEvent.change(advisorInput, { target: { value: 'Bumper' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-combobox-dropdown')).toBeInTheDocument();
    });

    // MUST NOT render internal cost
    expect(screen.queryByText(/Cost: Rs. 25,000/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cost:/i)).not.toBeInTheDocument();
  });

  it('ROLE PERMISSION INVARIANT: completely hides Add, Reset, and Action buttons from non-management roles', async () => {
    await act(async () => {
      render(
        <TestWrapper initialRole="SERVICE_ADVISOR" enableCost={false}>
          <CatalogListPage />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('catalog-list-page')).toBeInTheDocument();
    });

    // Add and Reset buttons must NOT be rendered
    expect(screen.queryByTestId('add-catalog-item-btn')).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Reset to default seed/i)).not.toBeInTheDocument();

    // Row action buttons must NOT be rendered
    expect(screen.queryByTestId('adjust-stock-btn-PRT-TOY-BMP-F')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-item-btn-PRT-TOY-BMP-F')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toggle-active-btn-PRT-TOY-BMP-F')).not.toBeInTheDocument();
  });

  it('BARCODE SCANNER WEDGE: selects exact item on rapid Enter without race condition', async () => {
    let selectedItem: any = null;
    render(
      <TestWrapper initialRole="OWNER" enableCost={true}>
        <CatalogCombobox onSelect={(item) => { selectedItem = item; }} />
      </TestWrapper>
    );

    const input = screen.getByTestId('catalog-combobox-input');

    // Simulate physical scanner keystroke wedge: types barcode and hits Enter immediately
    await act(async () => {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '8901234567891' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });

    expect(selectedItem).not.toBeNull();
    expect(selectedItem.sku).toBe('FLT-DEN-C110');
    expect(selectedItem.name).toContain('Denso Oil Filter');
  });
});
