import { useAuth } from '@/app/providers/AuthProvider';
import { UserRole } from '@/types';

export function usePermissions() {
  const {
    role,
    permissions,
    hasPermission,
    isCostProfitVisible,
    toggleCostProfitVisible,
    setCostProfitVisible,
  } = useAuth();

  return {
    role,
    permissions,
    hasPermission,
    canViewCosts: permissions.canViewCosts,
    canViewGrossProfit: permissions.canViewGrossProfit,
    canManageCatalog: permissions.canManageCatalog,
    canAccessPos: permissions.canAccessPos,
    canManageJobCards: permissions.canManageJobCards,
    canApproveEstimates: permissions.canApproveEstimates,
    canAccessFinance: permissions.canAccessFinance,
    canRecordExpenses: permissions.canRecordExpenses,
    canAccessReports: permissions.canAccessReports,
    isCostProfitVisible,
    toggleCostProfitVisible,
    setCostProfitVisible,
    isRole: (targetRole: UserRole | UserRole[]) => {
      if (Array.isArray(targetRole)) {
        return targetRole.includes(role);
      }
      return role === targetRole;
    },
  };
}
