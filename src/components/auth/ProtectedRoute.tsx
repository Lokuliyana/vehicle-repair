import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { RolePermissions, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ProtectedRouteProps {
  requiredPermission?: keyof RolePermissions;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({
  requiredPermission,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { role, permissions, setRole } = useAuth();

  const isRoleAllowed = !allowedRoles || allowedRoles.includes(role);
  const isPermAllowed = !requiredPermission || Boolean(permissions[requiredPermission]);

  if (!isRoleAllowed || !isPermAllowed) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-red-200 rounded-xl shadow-xs text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <Badge variant="destructive" className="mb-3 uppercase tracking-wider text-[11px]">
          Access Restricted
        </Badge>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Insufficient Permissions for this Section
        </h2>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your current active role is <strong className="text-slate-900">{role}</strong>.
          {requiredPermission && (
            <span>
              {' '}This module requires the <code className="px-1.5 py-0.5 bg-slate-100 rounded text-red-700 font-mono text-xs">{requiredPermission}</code> capability.
            </span>
          )}
          {allowedRoles && (
            <span>
              {' '}Allowed roles:{' '}
              {allowedRoles.map((r) => (
                <span key={r} className="inline-block px-1.5 py-0.5 mx-1 bg-slate-100 rounded text-slate-800 text-xs font-semibold">
                  {r}
                </span>
              ))}
            </span>
          )}
        </p>

        {/* Quick Role Elevation for Development / Operations */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-left">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-600" />
            Quick Switch for Development & Testing:
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRole('OWNER')}
              className="text-xs"
            >
              Switch to OWNER
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRole('WORKSHOP_MANAGER')}
              className="text-xs"
            >
              Switch to WORKSHOP_MANAGER
            </Button>
            {requiredPermission === 'canAccessPos' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRole('CASHIER')}
                className="text-xs"
              >
                Switch to CASHIER
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Link to="/">
            <Button variant="default" size="sm" className="gap-2 bg-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Return to Role Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
