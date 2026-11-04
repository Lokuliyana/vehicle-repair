import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronRight, Shield, Plus, ShoppingCart, Maximize2, Minimize2, LogOut, ChevronDown, Search } from 'lucide-react';
import { UserRole } from '@/types';
import { HotKeyKbdChip } from './action-triggers';

export interface RolePerspectiveBadgeProps {
  role: UserRole | string;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
  onClick?: () => void;
}

export const RolePerspectiveBadge: React.FC<RolePerspectiveBadgeProps> = ({
  role,
  className,
  dataTestId = 'role-perspective-badge',
  onClick,
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  const isPrivileged = role === 'OWNER' || role === 'WORKSHOP_MANAGER';

  const roleLabels: Record<string, string> = {
    OWNER: 'Owner / Director',
    WORKSHOP_MANAGER: 'Workshop Manager',
    SERVICE_ADVISOR: 'Service Advisor',
    CASHIER: 'Cashier',
    TECHNICIAN: 'Technician',
  };

  const roleStyles: Record<string, { bg: string; text: string; border: string; tag: string }> = {
    OWNER: { bg: 'bg-[#FFF7ED]', text: 'text-[#F95700]', border: 'border-orange-200/80', tag: 'Executive' },
    WORKSHOP_MANAGER: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200/80', tag: 'Manager' },
    SERVICE_ADVISOR: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200/80', tag: 'Advisor' },
    CASHIER: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200/80', tag: 'Cashier' },
    TECHNICIAN: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200/80', tag: 'Technician' },
  };

  const style = roleStyles[role] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    tag: 'Staff',
  };

  return (
    <div
      data-testid={resolvedTestId}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={onClick ? 'Click to cycle perspective role' : undefined}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shadow-2xs select-none transition-all',
        onClick && 'cursor-pointer hover:shadow-xs active:scale-95',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <Shield className={clsx('w-3.5 h-3.5 shrink-0', isPrivileged ? 'text-[#F95700]' : 'text-slate-500')} />
      <span className="font-semibold text-slate-900">{roleLabels[role] || role.replace('_', ' ')}</span>
      <span
        className={clsx(
          'text-[10px] px-1.5 py-0.2 rounded font-medium',
          isPrivileged
            ? 'bg-emerald-100/90 text-emerald-800 font-semibold'
            : 'bg-slate-200/80 text-slate-700'
        )}
      >
        {isPrivileged ? 'Privileged' : style.tag}
      </span>
    </div>
  );
};

export const BreadcrumbHierarchyTrail: React.FC<{
  items: { label: string; href?: string }[];
  className?: string;
}> = ({ items, className }) => {
  return (
    <nav className={clsx('flex items-center gap-1.5 text-xs text-slate-500', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
            {isLast ? (
              <span className="font-semibold text-slate-900">{item.label}</span>
            ) : item.href ? (
              <a
                href={item.href}
                className="hover:text-slate-900 hover:underline transition-colors font-medium text-slate-600"
              >
                {item.label}
              </a>
            ) : (
              <span className="hover:text-slate-800 transition-colors">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export interface QuickLaunchHeaderActionsProps {
  onNewRepairSheet: () => void;
  onOpenCounterPos: () => void;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const QuickLaunchHeaderActions: React.FC<QuickLaunchHeaderActionsProps> = ({
  onNewRepairSheet,
  onOpenCounterPos,
  className,
  dataTestId = 'global-quick-actions',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  return (
    <div className={clsx('flex items-center gap-3', className)} data-testid={resolvedTestId}>
      <button
        type="button"
        onClick={onNewRepairSheet}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-[#F95700] hover:bg-[#E04E00] text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
        data-testid="quick-new-sheet-btn"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden md:inline">New Repair Sheet</span>
        <span className="md:hidden">New</span>
      </button>
      <button
        type="button"
        onClick={onOpenCounterPos}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
        data-testid="quick-open-pos-btn"
      >
        <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden md:inline">Open POS</span>
        <span className="md:hidden">POS</span>
      </button>
    </div>
  );
};

export interface WorkshopBayStoreSwitcherProps {
  branchName?: string;
  activeBays?: number;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
  onClick?: () => void;
}

export const WorkshopBayStoreSwitcher: React.FC<WorkshopBayStoreSwitcherProps> = ({
  branchName = '500 Labs — Main Workshop',
  activeBays = 4,
  className,
  dataTestId = 'sidebar-brand-link',
  onClick,
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative p-2 rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-2.5 group select-none cursor-pointer',
        className
      )}
      data-testid={resolvedTestId}
    >
      {/* Automotive Monogram / Brand Icon */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs border border-slate-700/60 relative">
        <span className="font-black text-xs tracking-wider text-white">500</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#F95700] absolute -top-0.5 -right-0.5" />
      </div>

      {/* Workshop Branch & Live Active Bays Status */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-900 truncate leading-snug group-hover:text-[#F95700] transition-colors">
          {branchName}
        </div>
        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5 truncate mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{activeBays} Active Bays Operating</span>
        </div>
      </div>

      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 mr-1" />
    </div>
  );
};

export const KeyboardShortcutsHelpBar: React.FC = () => {
  return (
    <div className="flex items-center gap-4 text-[11px] text-slate-500 bg-white border-t border-slate-200/80 px-4 py-2">
      <span className="font-semibold text-slate-700">Ergonomics:</span>
      <div className="flex items-center gap-1.5">
        <HotKeyKbdChip keys="Enter ↵" />
        <span>Append Repair Row</span>
      </div>
      <div className="flex items-center gap-1.5">
        <HotKeyKbdChip keys="⌘K" />
        <span>Global Omni-Search</span>
      </div>
      <div className="flex items-center gap-1.5">
        <HotKeyKbdChip keys="Esc" />
        <span>Close Modal</span>
      </div>
    </div>
  );
};

export const SetupChecklistSidebarWidget: React.FC<{
  completedCount: number;
  totalCount: number;
}> = ({ completedCount, totalCount }) => {
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-semibold text-slate-700">Workshop Setup</span>
        <span className="font-bold text-[#F95700]">{completedCount}/{totalCount}</span>
      </div>
      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#F95700] rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export interface AppShellMasterLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  mobileDrawer?: React.ReactNode;
  floatingActions?: React.ReactNode;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const AppShellMasterLayout: React.FC<AppShellMasterLayoutProps> = ({
  sidebar,
  header,
  children,
  mobileDrawer,
  floatingActions,
  className,
  dataTestId = 'app-shell-master-layout',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  return (
    <div
      className={clsx('flex h-screen w-screen overflow-hidden bg-canvas text-brand-obsidian', className)}
      data-testid={resolvedTestId}
    >
      <div className="hidden md:flex shrink-0">
        {sidebar}
      </div>
      {mobileDrawer}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {header}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-canvas focus:outline-none">
          {children}
        </main>
        {floatingActions}
      </div>
    </div>
  );
};

export interface SidebarNavigationRailProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const SidebarNavigationRail: React.FC<SidebarNavigationRailProps> = ({
  children,
  isCollapsed = false,
  className,
  dataTestId = 'desktop-sidebar',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-white text-slate-800 border-r border-slate-900/[0.06] select-none screen-only no-print justify-between transition-all duration-200 z-30',
        isCollapsed ? 'w-[68px]' : 'w-60',
        className
      )}
      data-testid={resolvedTestId}
    >
      {children}
    </aside>
  );
};

export const SidebarNavLinkItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  count?: number;
  onClick?: () => void;
  isCollapsed?: boolean;
}> = ({ icon, label, isActive = false, count, onClick, isCollapsed = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-[10px] transition-all',
        isActive
          ? 'bg-orange-50 text-[#F95700] border border-orange-200/70 shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      )}
      title={isCollapsed ? label : undefined}
    >
      <span className={clsx('w-4 h-4', isActive ? 'text-[#F95700]' : 'text-slate-400')}>{icon}</span>
      {!isCollapsed && <span className="flex-1 text-left truncate">{label}</span>}
      {!isCollapsed && count !== undefined && (
        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold', isActive ? 'bg-orange-200/70 text-orange-800' : 'bg-slate-100 text-slate-500')}>
          {count}
        </span>
      )}
    </button>
  );
};

export const SidebarNestedAccordion: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ label, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 text-slate-400">{icon}</span>
          <span>{label}</span>
        </div>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="pl-6 flex flex-col gap-1 border-l-2 border-slate-100 ml-4">{children}</div>}
    </div>
  );
};

export interface GlobalTopHeaderBarProps {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const GlobalTopHeaderBar: React.FC<GlobalTopHeaderBarProps> = ({
  leftContent,
  centerContent,
  rightContent,
  className,
  dataTestId = 'app-header',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  return (
    <header
      className={clsx(
        'sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs screen-only no-print',
        className
      )}
      data-testid={resolvedTestId}
    >
      <div className="flex items-center gap-3 shrink-0">{leftContent}</div>
      {centerContent && <div className="flex-1 max-w-lg mx-2 flex justify-center">{centerContent}</div>}
      <div className="flex items-center gap-3 shrink-0">{rightContent}</div>
    </header>
  );
};

export const PageHeaderBanner: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export const StickyBottomActionFooter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 p-3 shadow-lg flex items-center justify-between z-30">
      {children}
    </div>
  );
};

export const SplitPaneWorkspace: React.FC<{
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  leftRatioPercent?: number;
}> = ({ leftPane, rightPane, leftRatioPercent = 65 }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
      <div style={{ flex: leftRatioPercent }} className="w-full min-w-0">
        {leftPane}
      </div>
      <div style={{ flex: 100 - leftRatioPercent }} className="w-full min-w-0">
        {rightPane}
      </div>
    </div>
  );
};

export const TabbedWorkspaceHeader: React.FC<{
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTabId: string;
  onTabChange: (id: string) => void;
}> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <div className="flex items-center gap-1 border-b border-slate-200 mb-4">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'px-3.5 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5',
              isActive
                ? 'border-[#F95700] text-[#F95700]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export interface SpotlightSearchItem {
  id: string;
  category: 'VEHICLE' | 'JOB' | 'CATALOG' | 'ROUTE' | 'ACTION';
  title: string;
  subtitle: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: string) => void;
  items?: SpotlightSearchItem[];
  query?: string;
  onQueryChange?: (query: string) => void;
  dataTestId?: string;
  'data-testid'?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  items,
  query: controlledQuery,
  onQueryChange,
  dataTestId = 'spotlight-command-palette',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  const [internalQuery, setInternalQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const query = controlledQuery !== undefined ? controlledQuery : internalQuery;
  const setQuery = (val: string) => {
    if (onQueryChange) onQueryChange(val);
    else setInternalQuery(val);
  };

  const defaultItems: SpotlightSearchItem[] = [
    {
      id: 'veh-cab-4521',
      category: 'VEHICLE',
      title: 'WP CAB-4521',
      subtitle: 'Toyota Corolla Axio 2018 (Pearl White)',
      badge: 'Axio',
      action: () => onSelectResult?.('WP CAB-4521'),
    },
    {
      id: 'job-0042',
      category: 'JOB',
      title: 'JOB-2026-0042',
      subtitle: 'Accident Damage Front Left Side & Bumper Replacement',
      badge: 'Estimate',
      action: () => onSelectResult?.('JOB-2026-0042'),
    },
    {
      id: 'sku-bumper',
      category: 'CATALOG',
      title: 'PRT-TOY-BMP-F',
      subtitle: 'Front Bumper Cover (Primer Coated)',
      badge: 'Part',
      action: () => onSelectResult?.('PRT-TOY-BMP-F'),
    },
  ];

  const searchList = items || defaultItems;
  const filtered = query.trim()
    ? searchList.filter(
        (it) =>
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          it.badge?.toLowerCase().includes(query.toLowerCase())
      )
    : searchList.slice(0, 7);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-[16px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        data-testid={resolvedTestId}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type vehicle plate, invoice #, or catalog item..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered.length > 0 && selectedIndex < filtered.length) {
                  filtered[selectedIndex].action();
                  onClose();
                } else if (query.trim()) {
                  onSelectResult?.(query.trim());
                  onClose();
                }
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            className="flex-1 text-xs text-slate-900 focus:outline-none"
            autoFocus
          />
          <HotKeyKbdChip keys="Esc" />
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching records for "{query}". Press Enter to search database.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 rounded-[10px] text-xs cursor-pointer transition-colors',
                    isSelected ? 'bg-[#FFF7ED] text-[#F95700]' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="truncate">
                    <div className={clsx('font-bold truncate', isSelected ? 'text-[#F95700]' : 'text-slate-900')}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                  {item.badge && (
                    <span
                      className={clsx(
                        'text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2',
                        isSelected ? 'bg-orange-100 text-[#F95700]' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export interface UserAccountFooterCardProps {
  name: string;
  role: string;
  onLogout?: () => void;
  isCollapsed?: boolean;
  roleSelector?: React.ReactNode;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

export const UserAccountFooterCard: React.FC<UserAccountFooterCardProps> = ({
  name,
  role,
  onLogout,
  isCollapsed = false,
  roleSelector,
  className,
  dataTestId = 'user-account-footer-card',
  ...rest
}) => {
  const resolvedTestId = rest['data-testid'] || dataTestId;
  return (
    <div
      className={clsx('pt-2 border-t border-slate-200/80 mt-auto', className)}
      data-testid={resolvedTestId}
    >
      <div className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between gap-2 cursor-pointer">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 truncate" title={name}>
                {name}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="truncate">{role.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1 shrink-0">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        )}
      </div>

      {!isCollapsed && roleSelector && (
        <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between gap-1">
          {roleSelector}
        </div>
      )}
    </div>
  );
};

export const FullScreenPOSModeToggle: React.FC<{
  isFullScreen: boolean;
  onToggle: () => void;
}> = ({ isFullScreen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Touch Mode'}
      className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors shadow-xs"
    >
      {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </button>
  );
};

