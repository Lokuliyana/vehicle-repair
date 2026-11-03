import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserRole,
  UserProfile,
  RolePermissions,
  PosShift,
  ROLE_PERMISSIONS,
  MOCK_USERS_BY_ROLE,
} from '@/types';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';


interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  permissions: RolePermissions;
  setRole: (role: UserRole) => void;
  isCostProfitVisible: boolean;
  toggleCostProfitVisible: () => void;
  setCostProfitVisible: (visible: boolean) => void;
  activeShift: PosShift | null;
  openShift: (startingCashRs?: number) => void;
  closeShift: () => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_ROLE = 'antigravity_user_role';
const STORAGE_KEY_COST_MODE = 'antigravity_cost_mode_visible';

export function AuthProvider({
  children,
  initialRole,
}: {
  children: React.ReactNode;
  initialRole?: UserRole;
}) {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (initialRole) {
      return initialRole;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
      if (saved && ROLE_PERMISSIONS[saved]) {
        return saved;
      }
    }
    return 'OWNER';
  });

  const permissions = useMemo(() => ROLE_PERMISSIONS[role], [role]);

  // Privacy invariant: ONLY OWNER & WORKSHOP_MANAGER can view costs and gross profit
  const [isCostProfitVisibleState, setIsCostProfitVisibleState] = useState<boolean>(() => {
    const roleCanView = ROLE_PERMISSIONS[role].canViewCosts && ROLE_PERMISSIONS[role].canViewGrossProfit;
    if (!roleCanView) return false;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_COST_MODE);
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  // Architectural privacy invariant: Under NO circumstance can isCostProfitVisible be true
  // if the current role lacks permission to view costs and gross profit.
  const isCostProfitVisible = useMemo(() => {
    return Boolean(
      isCostProfitVisibleState &&
      permissions.canViewCosts &&
      permissions.canViewGrossProfit
    );
  }, [isCostProfitVisibleState, permissions]);

  // Automatically enforce privacy invariant when role changes:
  // Non-owner / non-manager roles MUST NEVER have cost/profit visibility active.
  useEffect(() => {
    if (!permissions.canViewCosts || !permissions.canViewGrossProfit) {
      setIsCostProfitVisibleState(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_COST_MODE, 'false');
      }
    }
  }, [permissions]);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ROLE, newRole);
    }
    // If transitioning to role without permission, force hide costs
    const targetPerms = ROLE_PERMISSIONS[newRole];
    if (!targetPerms.canViewCosts || !targetPerms.canViewGrossProfit) {
      setIsCostProfitVisibleState(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_COST_MODE, 'false');
      }
    }
  }, []);

  const toggleCostProfitVisible = useCallback(() => {
    if (!permissions.canViewCosts || !permissions.canViewGrossProfit) {
      console.warn(`[Security Alert] Role ${role} is not permitted to view buying costs or gross profit margins.`);
      setIsCostProfitVisibleState(false);
      return;
    }
    setIsCostProfitVisibleState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_COST_MODE, String(next));
      }
      return next;
    });
  }, [permissions, role]);

  const setCostProfitVisible = useCallback((visible: boolean) => {
    if ((!permissions.canViewCosts || !permissions.canViewGrossProfit) && visible) {
      console.warn(`[Security Alert] Cannot enable cost mode: role ${role} lacks permission.`);
      setIsCostProfitVisibleState(false);
      return;
    }
    setIsCostProfitVisibleState(visible);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COST_MODE, String(visible));
    }
  }, [permissions, role]);

  // POS Shift State synchronized with posShiftRepository
  const [activeShift, setActiveShift] = useState<PosShift | null>(() => {
    return posShiftRepository.getActiveShiftSync();
  });

  useEffect(() => {
    const unsubscribe = posShiftRepository.subscribe((shift) => {
      setActiveShift(shift);
    });
    return unsubscribe;
  }, []);

  const openShift = useCallback(
    (startingCashRs: number = 15000, cashierId?: string, cashierName?: string) => {
      const activeUser = MOCK_USERS_BY_ROLE[role];
      const targetCashierId = cashierId || activeUser.id;
      const targetCashierName = cashierName || activeUser.name;
      const opened = posShiftRepository.openShiftSync(
        targetCashierId,
        targetCashierName,
        startingCashRs
      );
      setActiveShift(opened);
    },
    [role]
  );

  const closeShift = useCallback(
    (actualDrawerCashRs?: number) => {
      const current = activeShift || posShiftRepository.getActiveShiftSync();
      if (!current) return;
      const counted =
        actualDrawerCashRs !== undefined ? actualDrawerCashRs : current.expectedDrawerCashRs;
      const closed = posShiftRepository.closeShiftSync(current.id, counted);
      setActiveShift(closed);
    },
    [activeShift]
  );

  const hasPermission = useCallback((permission: keyof RolePermissions) => {
    return !!permissions[permission];
  }, [permissions]);

  const user = useMemo(() => MOCK_USERS_BY_ROLE[role], [role]);

  const value = useMemo(
    () => ({
      user,
      role,
      permissions,
      setRole,
      isCostProfitVisible,
      toggleCostProfitVisible,
      setCostProfitVisible,
      activeShift,
      openShift,
      closeShift,
      hasPermission,
    }),
    [
      user,
      role,
      permissions,
      setRole,
      isCostProfitVisible,
      toggleCostProfitVisible,
      setCostProfitVisible,
      activeShift,
      openShift,
      closeShift,
      hasPermission,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
