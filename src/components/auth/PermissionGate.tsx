import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { RolePermissions, UserRole } from '@/types';

export interface PermissionGateProps {
  permission?: keyof RolePermissions | Array<keyof RolePermissions>;
  role?: UserRole | UserRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGate conditionally renders UI elements based on the current user's role
 * and/or granular permissions.
 */
export function PermissionGate({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { role: currentRole, permissions } = useAuth();

  // Role check
  let roleMatch = true;
  if (role) {
    if (Array.isArray(role)) {
      roleMatch = role.includes(currentRole);
    } else {
      roleMatch = currentRole === role;
    }
  }

  // Permission check
  let permMatch = true;
  if (permission) {
    if (Array.isArray(permission)) {
      if (requireAll) {
        permMatch = permission.every((p) => Boolean(permissions[p]));
      } else {
        permMatch = permission.some((p) => Boolean(permissions[p]));
      }
    } else {
      permMatch = Boolean(permissions[permission]);
    }
  }

  const isAllowed = roleMatch && permMatch;

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
