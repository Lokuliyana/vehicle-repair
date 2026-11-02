import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ROLE_PERMISSIONS } from '@/types';

describe('Auth & Role Permissions Matrix', () => {

  it('CRITICAL PRIVACY INVARIANT: only OWNER and WORKSHOP_MANAGER have canViewCosts = true', () => {
    expect(ROLE_PERMISSIONS.OWNER.canViewCosts).toBe(true);
    expect(ROLE_PERMISSIONS.WORKSHOP_MANAGER.canViewCosts).toBe(true);

    // All other operational staff MUST be false
    expect(ROLE_PERMISSIONS.SERVICE_ADVISOR.canViewCosts).toBe(false);
    expect(ROLE_PERMISSIONS.CASHIER.canViewCosts).toBe(false);
    expect(ROLE_PERMISSIONS.TECHNICIAN.canViewCosts).toBe(false);
  });

  it('CRITICAL PRIVACY INVARIANT: only OWNER and WORKSHOP_MANAGER have canViewGrossProfit = true', () => {
    expect(ROLE_PERMISSIONS.OWNER.canViewGrossProfit).toBe(true);
    expect(ROLE_PERMISSIONS.WORKSHOP_MANAGER.canViewGrossProfit).toBe(true);

    // All other operational staff MUST be false
    expect(ROLE_PERMISSIONS.SERVICE_ADVISOR.canViewGrossProfit).toBe(false);
    expect(ROLE_PERMISSIONS.CASHIER.canViewGrossProfit).toBe(false);
    expect(ROLE_PERMISSIONS.TECHNICIAN.canViewGrossProfit).toBe(false);
  });

  it('verifies POS access is restricted to OWNER, WORKSHOP_MANAGER, and CASHIER', () => {
    expect(ROLE_PERMISSIONS.OWNER.canAccessPos).toBe(true);
    expect(ROLE_PERMISSIONS.WORKSHOP_MANAGER.canAccessPos).toBe(true);
    expect(ROLE_PERMISSIONS.CASHIER.canAccessPos).toBe(true);

    expect(ROLE_PERMISSIONS.SERVICE_ADVISOR.canAccessPos).toBe(false);
    expect(ROLE_PERMISSIONS.TECHNICIAN.canAccessPos).toBe(false);
  });

  it('verifies Finance ledger access is restricted strictly to OWNER and WORKSHOP_MANAGER', () => {
    expect(ROLE_PERMISSIONS.OWNER.canAccessFinance).toBe(true);
    expect(ROLE_PERMISSIONS.WORKSHOP_MANAGER.canAccessFinance).toBe(true);

    expect(ROLE_PERMISSIONS.SERVICE_ADVISOR.canAccessFinance).toBe(false);
    expect(ROLE_PERMISSIONS.CASHIER.canAccessFinance).toBe(false);
    expect(ROLE_PERMISSIONS.TECHNICIAN.canAccessFinance).toBe(false);
  });

  it('verifies Job Card management is available to OWNER, WORKSHOP_MANAGER, and SERVICE_ADVISOR', () => {
    expect(ROLE_PERMISSIONS.OWNER.canManageJobCards).toBe(true);
    expect(ROLE_PERMISSIONS.WORKSHOP_MANAGER.canManageJobCards).toBe(true);
    expect(ROLE_PERMISSIONS.SERVICE_ADVISOR.canManageJobCards).toBe(true);

    expect(ROLE_PERMISSIONS.CASHIER.canManageJobCards).toBe(false);
    expect(ROLE_PERMISSIONS.TECHNICIAN.canManageJobCards).toBe(false);
  });
});

describe('AuthProvider & useAuth Context Execution', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default role and updates state when setRole is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider initialRole="OWNER">{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.role).toBe('OWNER');
    expect(result.current.user.name).toBe('Jagath Perera');
    expect(result.current.permissions.canViewCosts).toBe(true);

    act(() => {
      result.current.setRole('TECHNICIAN');
    });

    expect(result.current.role).toBe('TECHNICIAN');
    expect(result.current.user.name).toBe('Sunil Shantha');
    expect(result.current.permissions.canViewCosts).toBe(false);
    expect(result.current.permissions.canViewGrossProfit).toBe(false);
    expect(result.current.isCostProfitVisible).toBe(false);
  });

  it('ENFORCES PRIVACY RULE: cannot toggle isCostProfitVisible when role lacks permission', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider initialRole="SERVICE_ADVISOR">{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.role).toBe('SERVICE_ADVISOR');
    expect(result.current.isCostProfitVisible).toBe(false);

    // Attempt to toggle cost visibility
    act(() => {
      result.current.toggleCostProfitVisible();
    });

    // MUST remain false
    expect(result.current.isCostProfitVisible).toBe(false);

    // Attempt to explicitly set to true
    act(() => {
      result.current.setCostProfitVisible(true);
    });

    // MUST remain false
    expect(result.current.isCostProfitVisible).toBe(false);
  });

  it('allows OWNER or WORKSHOP_MANAGER to toggle Cost & Profit visibility', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider initialRole="WORKSHOP_MANAGER">{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.role).toBe('WORKSHOP_MANAGER');
    expect(result.current.isCostProfitVisible).toBe(true);

    act(() => {
      result.current.toggleCostProfitVisible();
    });

    expect(result.current.isCostProfitVisible).toBe(false);

    act(() => {
      result.current.toggleCostProfitVisible();
    });

    expect(result.current.isCostProfitVisible).toBe(true);
  });

  it('manages active POS cash drawer shift', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider initialRole="CASHIER">{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.activeShift).not.toBeNull();
    expect(result.current.activeShift?.status).toBe('OPEN');

    act(() => {
      result.current.closeShift();
    });

    expect(result.current.activeShift?.status).toBe('CLOSED');

    act(() => {
      result.current.openShift(20000);
    });

    expect(result.current.activeShift?.status).toBe('OPEN');
    expect(result.current.activeShift?.startingCashRs).toBe(20000);
  });
});

describe('PermissionGate UI Guard', () => {
  it('renders children when single permission is granted', () => {
    render(
      <AuthProvider initialRole="OWNER">
        <PermissionGate permission="canViewCosts" fallback={<div>Access Denied</div>}>
          <div data-testid="protected-content">Secret Buying Cost: Rs. 15,000</div>
        </PermissionGate>
      </AuthProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('renders fallback when single permission is denied', () => {
    render(
      <AuthProvider initialRole="SERVICE_ADVISOR">
        <PermissionGate permission="canViewCosts" fallback={<div data-testid="fallback">Access Denied</div>}>
          <div data-testid="protected-content">Secret Buying Cost: Rs. 15,000</div>
        </PermissionGate>
      </AuthProvider>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('guards by role array correctly', () => {
    render(
      <AuthProvider initialRole="CASHIER">
        <PermissionGate role={['OWNER', 'WORKSHOP_MANAGER']} fallback={<div>Not Manager</div>}>
          <div>Management Controls</div>
        </PermissionGate>
      </AuthProvider>
    );

    expect(screen.getByText('Not Manager')).toBeInTheDocument();
    expect(screen.queryByText('Management Controls')).not.toBeInTheDocument();
  });

  it('supports multiple permissions with requireAll flag', () => {
    render(
      <AuthProvider initialRole="CASHIER">
        <PermissionGate
          permission={['canAccessPos', 'canRecordExpenses']}
          requireAll={true}
          fallback={<div>Missing perms</div>}
        >
          <div data-testid="cashier-actions">Cashier Checkout & Petty Cash</div>
        </PermissionGate>
      </AuthProvider>
    );

    // CASHIER has both canAccessPos and canRecordExpenses
    expect(screen.getByTestId('cashier-actions')).toBeInTheDocument();
  });
});

describe('usePermissions Hook Convenience & Role Checks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes direct boolean capability flags and isRole helper', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider initialRole="SERVICE_ADVISOR">{children}</AuthProvider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.role).toBe('SERVICE_ADVISOR');
    expect(result.current.canViewCosts).toBe(false);
    expect(result.current.canViewGrossProfit).toBe(false);
    expect(result.current.canManageJobCards).toBe(true);
    expect(result.current.canAccessPos).toBe(false);
    expect(result.current.canAccessFinance).toBe(false);
    expect(result.current.isCostProfitVisible).toBe(false);

    // Test isRole helper
    expect(result.current.isRole('SERVICE_ADVISOR')).toBe(true);
    expect(result.current.isRole('OWNER')).toBe(false);
    expect(result.current.isRole(['OWNER', 'SERVICE_ADVISOR'])).toBe(true);
    expect(result.current.isRole(['OWNER', 'WORKSHOP_MANAGER'])).toBe(false);
  });

  it('guarantees isCostProfitVisible remains false for TECHNICIAN even if setCostProfitVisible is attempted', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider initialRole="TECHNICIAN">{children}</AuthProvider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.canViewCosts).toBe(false);
    expect(result.current.isCostProfitVisible).toBe(false);

    act(() => {
      result.current.setCostProfitVisible(true);
    });

    expect(result.current.isCostProfitVisible).toBe(false);

    act(() => {
      result.current.toggleCostProfitVisible();
    });

    expect(result.current.isCostProfitVisible).toBe(false);
  });
});
