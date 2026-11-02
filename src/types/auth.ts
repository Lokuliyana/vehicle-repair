import { UserRole } from './index';

export interface RolePermissions {
  canViewCosts: boolean;
  canViewGrossProfit: boolean;
  canManageCatalog: boolean;
  canAccessPos: boolean;
  canManageJobCards: boolean;
  canApproveEstimates: boolean;
  canAccessFinance: boolean;
  canRecordExpenses: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface PosShift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startingCashRs: number;
  openingFloatRs: number;
  totalCashSalesRs: number;
  totalCardSalesRs: number;
  totalBankTransferSalesRs: number;
  cashInRs: number;
  cashOutRs: number;
  expectedDrawerCashRs: number;
  actualDrawerCashRs?: number;
  varianceRs?: number;
  status: 'OPEN' | 'CLOSED';
}


export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  OWNER: {
    canViewCosts: true,
    canViewGrossProfit: true,
    canManageCatalog: true,
    canAccessPos: true,
    canManageJobCards: true,
    canApproveEstimates: true,
    canAccessFinance: true,
    canRecordExpenses: true,
  },
  WORKSHOP_MANAGER: {
    canViewCosts: true,
    canViewGrossProfit: true,
    canManageCatalog: true,
    canAccessPos: true,
    canManageJobCards: true,
    canApproveEstimates: true,
    canAccessFinance: true,
    canRecordExpenses: true,
  },
  SERVICE_ADVISOR: {
    canViewCosts: false,
    canViewGrossProfit: false,
    canManageCatalog: false,
    canAccessPos: false,
    canManageJobCards: true,
    canApproveEstimates: false,
    canAccessFinance: false,
    canRecordExpenses: false,
  },
  CASHIER: {
    canViewCosts: false,
    canViewGrossProfit: false,
    canManageCatalog: false,
    canAccessPos: true,
    canManageJobCards: false,
    canApproveEstimates: false,
    canAccessFinance: false,
    canRecordExpenses: true,
  },
  TECHNICIAN: {
    canViewCosts: false,
    canViewGrossProfit: false,
    canManageCatalog: false,
    canAccessPos: false,
    canManageJobCards: false,
    canApproveEstimates: false,
    canAccessFinance: false,
    canRecordExpenses: false,
  },
};

export const MOCK_USERS_BY_ROLE: Record<UserRole, UserProfile> = {
  OWNER: {
    id: 'user-owner',
    name: 'Jagath Perera',
    email: 'owner@autoworkshop.lk',
    role: 'OWNER',
  },
  WORKSHOP_MANAGER: {
    id: 'user-manager',
    name: 'Bandara Ratnayake',
    email: 'manager@autoworkshop.lk',
    role: 'WORKSHOP_MANAGER',
  },
  SERVICE_ADVISOR: {
    id: 'user-advisor',
    name: 'Nimal Jayawardena',
    email: 'advisor@autoworkshop.lk',
    role: 'SERVICE_ADVISOR',
  },
  CASHIER: {
    id: 'user-cashier',
    name: 'Kamal Fonseka',
    email: 'cashier@autoworkshop.lk',
    role: 'CASHIER',
  },
  TECHNICIAN: {
    id: 'user-technician',
    name: 'Sunil Shantha',
    email: 'tech@autoworkshop.lk',
    role: 'TECHNICIAN',
  },
};
