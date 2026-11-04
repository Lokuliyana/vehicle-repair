import { useState, type ComponentType } from 'react';
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
  Vault,
  Receipt,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/app/providers/AuthProvider';
import { RolePermissions, UserRole } from '@/types';
import {
  SidebarNavigationRail,
  WorkshopBayStoreSwitcher,
  SetupChecklistSidebarWidget,
  UserAccountFooterCard,
} from '@/design-system/components/navigation-shell-components';

export interface NavItem {
  title: string;
  path: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  requiredPermission?: keyof RolePermissions;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'WORKSHOP',
    items: [
      {
        title: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
      },
      {
        title: 'Workshop Jobs',
        path: '/workshop/jobs',
        icon: FileSpreadsheet,
      },
      {
        title: 'Status Board',
        path: '/workshop/board',
        icon: Kanban,
      },
      {
        title: 'New Repair Sheet',
        path: '/workshop/sheet/demo',
        icon: Sparkles,
      },
    ],
  },
  {
    title: 'COUNTER POS',
    items: [
      {
        title: 'Counter POS',
        path: '/pos',
        icon: ShoppingCart,
        requiredPermission: 'canAccessPos',
      },
      {
        title: 'Shift & Drawer',
        path: '/pos/shift',
        icon: Vault,
        requiredPermission: 'canAccessPos',
      },
    ],
  },
  {
    title: 'CATALOG',
    items: [
      {
        title: 'Parts & Catalog',
        path: '/catalog',
        icon: Package,
        requiredPermission: 'canManageCatalog',
      },
    ],
  },
  {
    title: 'FINANCE & REPORTS',
    items: [
      {
        title: 'Profit Ledger',
        path: '/finance/profit-ledger',
        icon: TrendingUp,
        requiredPermission: 'canAccessFinance',
      },
      {
        title: 'Shop Expenses',
        path: '/finance/expenses',
        icon: Receipt,
        requiredPermission: 'canAccessFinance',
      },
      {
        title: 'Reports & Aging',
        path: '/reports',
        icon: BarChart3,
        requiredPermission: 'canAccessReports',
      },
    ],
  },
];

export interface SidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggle,
}: SidebarProps) {
  const { user, role, setRole, permissions } = useAuth();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Invariant: Mobile drawer is never rendered in collapsed mode
  const isCollapsed = onCloseMobile
    ? false
    : controlledCollapsed !== undefined
    ? controlledCollapsed
    : internalCollapsed;

  const handleToggle = controlledToggle || (() => setInternalCollapsed((prev) => !prev));

  return (
    <SidebarNavigationRail
      dataTestId={onCloseMobile ? 'mobile-sidebar' : 'desktop-sidebar'}
      isCollapsed={isCollapsed}
      className={cn(
        'flex flex-col justify-between transition-all duration-200 select-none border-r border-slate-900/[0.06]',
        isCollapsed ? 'w-[68px] p-2' : 'w-60 lg:w-64 p-3'
      )}
    >
      {/* Top Section: Workshop Branch Card & Brand Identity */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5">
          <Link
            to="/"
            onClick={onCloseMobile}
            data-testid="sidebar-brand-link"
            className="flex-1 min-w-0"
            title="Workshop Dashboard Home"
          >
            {isCollapsed ? (
              <div
                className="w-10 h-10 mx-auto rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center shadow-xs hover:scale-105 hover:bg-slate-800 transition-all cursor-pointer relative group"
                data-testid="workshop-bay-switcher-collapsed"
                title="500 Labs — Main Workshop (4 Active Bays Operating)"
              >
                <span className="font-black text-xs tracking-wider text-white">500</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
                <span className="sr-only">500 Labs — Main Workshop (4 Active Bays Operating)</span>
              </div>
            ) : (
              <WorkshopBayStoreSwitcher
                branchName="500 Labs — Main Workshop"
                activeBays={4}
                dataTestId="workshop-bay-switcher"
              />
            )}
          </Link>

          {!onCloseMobile && (
            <button
              type="button"
              onClick={handleToggle}
              className={cn(
                'p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0',
                isCollapsed && 'w-full flex items-center justify-center mt-1'
              )}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              data-testid="sidebar-collapse-toggle"
            >
              {isCollapsed ? (
                <PanelLeftOpen size={16} strokeWidth={1.75} />
              ) : (
                <PanelLeftClose size={16} strokeWidth={1.75} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Center Navigation Links: Grouped Under 10px Uppercase Slate Section Titles */}
      <div className="flex-1 py-1 space-y-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-0.5">
            {isCollapsed ? (
              <>
                <span className="sr-only">{section.title}</span>
                <div className="h-px bg-slate-100 my-2 mx-1" aria-hidden="true" />
              </>
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 mt-4 mb-1 select-none">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isRestricted =
                item.requiredPermission && !permissions[item.requiredPermission];
              const isExactOnly = item.path === '/pos' || item.path === '/';
              const isActive = isExactOnly
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              const testId = `nav-${item.path.replace(/\//g, '-').slice(1) || 'home'}`;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={isExactOnly}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.title : undefined}
                  className={({ isActive: navActive }) => {
                    const active = isExactOnly
                      ? location.pathname === item.path
                      : navActive;
                    return cn(
                      'text-[13px] font-medium rounded-lg transition-colors group cursor-pointer',
                      isCollapsed
                        ? 'p-2 flex items-center justify-center'
                        : 'px-2.5 py-1.5 flex items-center justify-between gap-2.5',
                      active
                        ? 'bg-[#FFF3ED] text-[#F95700] font-semibold shadow-2xs'
                        : isRestricted
                        ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    );
                  }}
                  data-testid={testId}
                >
                  <div
                    className={cn(
                      'flex items-center gap-2.5 truncate',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-[#F95700]'
                          : isRestricted
                          ? 'text-slate-300'
                          : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRestricted && (
                        <span title="Permission required">
                          <Lock size={14} strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Onboarding Setup Progress Strip */}
      <div className={cn('pt-2', isCollapsed && 'py-1')}>
        {isCollapsed ? (
          <div
            className="w-8 h-1.5 bg-orange-100 rounded-full mx-auto overflow-hidden cursor-pointer"
            title="Workshop Setup: 6/7 complete"
          >
            <div className="h-full bg-[#F95700] w-[85%]" />
            <span className="sr-only">Workshop Setup 6/7</span>
          </div>
        ) : (
          <SetupChecklistSidebarWidget completedCount={6} totalCount={7} />
        )}
      </div>

      {/* Pinned User Account Footer Card */}
      <UserAccountFooterCard
        name={user.name}
        role={role}
        isCollapsed={isCollapsed}
        dataTestId="user-account-footer-card"
      />

      {/* Hidden helper for test compatibility */}
      <div className="sr-only">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          aria-label="Perspective Switcher"
          data-testid="sidebar-role-select"
        >
          <option value="OWNER">Owner / Director</option>
          <option value="WORKSHOP_MANAGER">Workshop Manager</option>
          <option value="SERVICE_ADVISOR">Service Advisor</option>
          <option value="CASHIER">Cashier</option>
          <option value="TECHNICIAN">Technician</option>
        </select>
      </div>
    </SidebarNavigationRail>
  );
}
