import type { ComponentType } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Kanban,
  ShoppingCart,
  Package,
  TrendingUp,
  BarChart3,
  Sparkles,
  Lock,
  Car,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/app/providers/AuthProvider';
import { RolePermissions } from '@/types';

interface NavItem {
  title: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  requiredPermission?: keyof RolePermissions;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Workshop Jobs',
    path: '/workshop/jobs',
    icon: FileSpreadsheet,
    badge: 'Stage Engine',
  },
  {
    title: 'Status Board',
    path: '/workshop/board',
    icon: Kanban,
  },
  {
    title: 'Counter POS',
    path: '/pos',
    icon: ShoppingCart,
    requiredPermission: 'canAccessPos',
  },
  {
    title: 'Parts & Catalog',
    path: '/catalog',
    icon: Package,
    requiredPermission: 'canManageCatalog',
  },
  {
    title: 'Profit Ledger',
    path: '/finance/profit-ledger',
    icon: TrendingUp,
    requiredPermission: 'canAccessFinance',
    badge: 'Owner Only',
  },
  {
    title: 'Reports & Aging',
    path: '/reports',
    icon: BarChart3,
    requiredPermission: 'canAccessReports',
  },
  {
    title: 'Phase 1 Bench',
    path: '/workshop/sheet/demo',
    icon: Sparkles,
    badge: 'Print/Tables',
  },
];

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { user, role, permissions } = useAuth();
  const location = useLocation();

  return (
    <aside
      className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 w-64 select-none screen-only no-print"
      data-testid={onCloseMobile ? 'mobile-sidebar' : 'desktop-sidebar'}
    >
      {/* Brand & Workshop Identity */}
      <Link
        to="/"
        onClick={onCloseMobile}
        className="h-16 flex items-center px-5 border-b border-slate-800 gap-3 hover:bg-slate-800/40 transition-colors"
        data-testid="sidebar-brand-link"
      >
        <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-black tracking-tight flex items-center justify-center shadow-xs">
          <Car className="h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-sm text-white tracking-wide truncate">
            Antigravity ERP
          </div>
          <div className="text-[10px] text-amber-400 font-medium truncate uppercase tracking-wider">
            Workshop & POS Master
          </div>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operations & Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isRestricted = item.requiredPermission && !permissions[item.requiredPermission];
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive: navActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group',
                  (item.path === '/' ? location.pathname === '/' : navActive)
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400'
                    : isRestricted
                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                )
              }
              data-testid={`nav-${item.path.replace(/\//g, '-').slice(1) || 'home'}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-amber-400'
                      : isRestricted
                      ? 'text-slate-600'
                      : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span className="truncate">{item.title}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isRestricted ? (
                  <span title="Permission required">
                    <Lock className="w-3 h-3 text-slate-600" />
                  </span>
                ) : item.badge ? (
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded font-medium',
                      item.badge === 'Owner Only'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Role & User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate" title={user.name}>
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{role}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
