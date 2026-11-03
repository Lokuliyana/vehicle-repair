import { useState, useRef, useEffect, useMemo, type FormEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  ShoppingCart,
  Car,
  FileSpreadsheet,
  Package,
  TrendingUp,
  LayoutDashboard,
  Kanban,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';
import {
  BreadcrumbHierarchyTrail,
  RolePerspectiveBadge,
  GlobalTopHeaderBar,
  QuickLaunchHeaderActions,
} from '@/design-system/components/navigation-shell-components';
import {
  RolePermissionGateWrapper,
} from '@/design-system/components/finance-privacy-components';
import { ToggleLockPrivacyButton } from '@/design-system/components/action-triggers';

interface SearchResultItem {
  id: string;
  category: 'VEHICLE' | 'JOB' | 'CATALOG' | 'ROUTE' | 'ACTION';
  title: string;
  subtitle: string;
  badge?: string;
  icon: typeof Car;
  action: () => void;
}

export function Header({
  onToggleMobile,
}: {
  onToggleMobile: () => void;
}) {
  const {
    role,
    setRole,
    permissions,
    isCostProfitVisible,
    toggleCostProfitVisible,
    activeShift,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus global search and open Spotlight
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setIsSpotlightOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Escape key handler to close Spotlight from anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isSpotlightOpen) {
        setIsSpotlightOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSpotlightOpen]);

  // Close Spotlight when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSpotlightOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute clean breadcrumbs based on location with clickable parent links
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return [{ label: 'Workshop' }, { label: 'Dashboard' }];
    if (path.startsWith('/workshop/jobs')) return [{ label: 'Workshop', href: '/' }, { label: 'Job Cards' }];
    if (path.startsWith('/workshop/board')) return [{ label: 'Workshop', href: '/workshop/jobs' }, { label: 'Floor Status Board' }];
    if (path.startsWith('/workshop/sheet/demo')) return [{ label: 'Workshop', href: '/workshop/jobs' }, { label: 'Interactive Sheet' }];
    if (path.startsWith('/workshop/sheet')) return [{ label: 'Workshop', href: '/workshop/jobs' }, { label: 'New Repair Sheet' }];
    if (path.startsWith('/pos/shift')) return [{ label: 'Counter POS', href: '/pos' }, { label: 'Register Shift & Drawer' }];
    if (path.startsWith('/pos')) return [{ label: 'Counter POS', href: '/' }, { label: 'Terminal' }];
    if (path.startsWith('/catalog')) return [{ label: 'Catalog', href: '/' }, { label: 'Parts & Labor' }];
    if (path.startsWith('/finance')) return [{ label: 'Finance & Reports', href: '/' }, { label: 'Profit Ledger' }];
    if (path.startsWith('/reports')) return [{ label: 'Finance & Reports', href: '/' }, { label: 'Reports & Aging' }];
    return [{ label: 'Antigravity ERP' }, { label: 'Overview' }];
  }, [location.pathname]);

  // Master Spotlight Search Catalog
  const allSearchItems: SearchResultItem[] = useMemo(() => [
    // Routes & Quick Navigation
    {
      id: 'route-dashboard',
      category: 'ROUTE',
      title: 'Dashboard',
      subtitle: 'Executive KPIs, daily revenue & floor overview',
      badge: 'Home',
      icon: LayoutDashboard,
      action: () => navigate('/'),
    },
    {
      id: 'route-jobs',
      category: 'ROUTE',
      title: 'Workshop Job Cards',
      subtitle: 'Quotation, estimate, job card, and invoice lifecycle',
      badge: 'Workshop',
      icon: FileSpreadsheet,
      action: () => navigate('/workshop/jobs'),
    },
    {
      id: 'route-board',
      category: 'ROUTE',
      title: 'Status Board',
      subtitle: 'Workshop floor kanban swimlanes & mechanic tasks',
      badge: 'Floor',
      icon: Kanban,
      action: () => navigate('/workshop/board'),
    },
    {
      id: 'route-bench',
      category: 'ROUTE',
      title: 'Interactive Sheet Studio',
      subtitle: '3-Section interactive spreadsheet & A4 print preview',
      badge: 'Studio',
      icon: Sparkles,
      action: () => navigate('/workshop/sheet/demo'),
    },
    {
      id: 'route-pos',
      category: 'ROUTE',
      title: 'Counter POS Terminal',
      subtitle: 'High-speed touch desk & register shift drawer',
      badge: 'POS',
      icon: ShoppingCart,
      action: () => navigate('/pos'),
    },
    {
      id: 'route-catalog',
      category: 'ROUTE',
      title: 'Parts & Labor Catalog',
      subtitle: 'Central spare parts, lubricants & labor presets',
      badge: 'Catalog',
      icon: Package,
      action: () => navigate('/catalog'),
    },
    {
      id: 'route-finance',
      category: 'ROUTE',
      title: 'Profit & Financial Ledger',
      subtitle: 'Unified gross profit, direct costs & shop overheads',
      badge: 'Finance',
      icon: TrendingUp,
      action: () => navigate('/finance/profit-ledger'),
    },
    {
      id: 'route-reports',
      category: 'ROUTE',
      title: 'Reports & Insurance Aging',
      subtitle: 'Claims aging buckets & business intelligence',
      badge: 'Reports',
      icon: BarChart3,
      action: () => navigate('/reports'),
    },

    // Vehicle Plates (Realistic Sri Lankan Workshop Data)
    {
      id: 'veh-cab-4521',
      category: 'VEHICLE',
      title: 'WP CAB-4521',
      subtitle: 'Toyota Corolla Axio 2018 (Pearl White) — Job #JOB-2026-0042',
      badge: 'Axio',
      icon: Car,
      action: () => navigate('/workshop/jobs?q=CAB-4521'),
    },
    {
      id: 'veh-cba-1234',
      category: 'VEHICLE',
      title: 'WP CBA-1234',
      subtitle: 'Honda Civic 2020 (Rallye Red) — Periodic Maintenance',
      badge: 'Civic',
      icon: Car,
      action: () => navigate('/workshop/jobs?q=CBA-1234'),
    },
    {
      id: 'veh-cad-8891',
      category: 'VEHICLE',
      title: 'WP CAD-8891',
      subtitle: 'Nissan Leaf Electric 2019 — Battery Cooling Overhaul',
      badge: 'Leaf',
      icon: Car,
      action: () => navigate('/workshop/jobs?q=CAD-8891'),
    },
    {
      id: 'veh-cac-7712',
      category: 'VEHICLE',
      title: 'WP CAC-7712',
      subtitle: 'Toyota Premio NZT260 — Paint & Tinkering Accident Repair',
      badge: 'Premio',
      icon: Car,
      action: () => navigate('/workshop/jobs?q=CAC-7712'),
    },
    {
      id: 'veh-kd-9011',
      category: 'VEHICLE',
      title: 'WP KD-9011',
      subtitle: 'Mitsubishi Outlander PHEV — Transmission & Hybrid Diagnostic',
      badge: 'Outlander',
      icon: Car,
      action: () => navigate('/workshop/jobs?q=KD-9011'),
    },

    // Job Cards & Estimates
    {
      id: 'job-0042',
      category: 'JOB',
      title: 'JOB-2026-0042',
      subtitle: 'Accident Damage Front Left Side & Bumper Replacement',
      badge: 'Estimate',
      icon: FileSpreadsheet,
      action: () => navigate('/workshop/jobs?q=JOB-2026-0042'),
    },
    {
      id: 'job-0041',
      category: 'JOB',
      title: 'JOB-2026-0041',
      subtitle: 'Brake Disc Skimming & Front Suspension Bush Replacement',
      badge: 'Job Card',
      icon: FileSpreadsheet,
      action: () => navigate('/workshop/jobs?q=JOB-2026-0041'),
    },

    // Catalog SKUs & Spare Parts
    {
      id: 'sku-bumper',
      category: 'CATALOG',
      title: 'PRT-TOY-BMP-F',
      subtitle: 'Front Bumper Cover (Primer Coated) — Toyota Premio/Allion',
      badge: 'Part',
      icon: Package,
      action: () => navigate('/catalog?q=PRT-TOY-BMP-F'),
    },
    {
      id: 'sku-headlight',
      category: 'CATALOG',
      title: 'PRT-TOY-HDL-RH',
      subtitle: 'Headlight Assembly RH (Halogen/LED) — Corolla Axio',
      badge: 'Part',
      icon: Package,
      action: () => navigate('/catalog?q=PRT-TOY-HDL-RH'),
    },
    {
      id: 'sku-oil',
      category: 'CATALOG',
      title: 'LUB-MOB-5W30',
      subtitle: 'Mobil Super 3000 5W-30 Full Synthetic Engine Oil (4L)',
      badge: 'Lubricant',
      icon: Package,
      action: () => navigate('/catalog?q=LUB-MOB-5W30'),
    },
    {
      id: 'sku-filter',
      category: 'CATALOG',
      title: 'FLT-TY-OIL',
      subtitle: 'Toyota Genuine Oil Filter (90915-YZZE1)',
      badge: 'Filter',
      icon: Package,
      action: () => navigate('/catalog?q=FLT-TY-OIL'),
    },
    {
      id: 'sku-brake-pads',
      category: 'CATALOG',
      title: 'BRK-PAD-001',
      subtitle: 'Front Ceramic Brake Pads (Akebono Japan)',
      badge: 'Brakes',
      icon: Package,
      action: () => navigate('/catalog?q=BRK-PAD-001'),
    },

    // Quick Actions
    {
      id: 'act-new-sheet',
      category: 'ACTION',
      title: '+ New Repair Sheet',
      subtitle: 'Create a new vehicle accident estimate or quotation',
      badge: 'Create',
      icon: Plus,
      action: () => navigate('/workshop/sheet'),
    },
  ], [navigate]);

  // Filtered Spotlight Results
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Default recommended quick jumps when query is empty
      return allSearchItems.slice(0, 7);
    }
    return allSearchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q)
    );
  }, [allSearchItems, searchQuery]);

  const handleCycleRole = () => {
    const roles: UserRole[] = ['OWNER', 'WORKSHOP_MANAGER', 'SERVICE_ADVISOR', 'CASHIER', 'TECHNICIAN'];
    const currentIdx = roles.indexOf(role as UserRole);
    const nextRole = roles[(currentIdx + 1) % roles.length];
    setRole(nextRole);
    toast({
      title: 'Active Role Switched',
      message: `Operational view updated to: ${nextRole}`,
      type: 'info',
    });
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setRole(newRole);
    toast({
      title: 'Active Role Switched',
      message: `Operational view updated to: ${newRole}`,
      type: 'info',
    });
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (filteredResults.length > 0 && selectedIndex < filteredResults.length) {
      filteredResults[selectedIndex].action();
      setIsSpotlightOpen(false);
      setSearchQuery('');
      return;
    }
    if (!searchQuery.trim()) return;
    setIsSpotlightOpen(false);
    toast({
      title: 'Global Search',
      message: `Searching for: "${searchQuery}"`,
      type: 'info',
    });
    navigate(`/workshop/jobs?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const handleKeyDownSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && selectedIndex < filteredResults.length) {
        filteredResults[selectedIndex].action();
        setIsSpotlightOpen(false);
        setSearchQuery('');
      } else if (searchQuery.trim()) {
        setIsSpotlightOpen(false);
        navigate(`/workshop/jobs?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsSpotlightOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <GlobalTopHeaderBar
      leftContent={
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobile}
            className="md:hidden text-slate-700 hover:text-slate-950 shrink-0"
            aria-label="Toggle Navigation Menu"
            data-testid="mobile-menu-trigger"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsSpotlightOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="md:hidden text-slate-700 hover:text-slate-950 shrink-0"
            aria-label="Search and Command Palette"
            data-testid="mobile-search-trigger"
          >
            <Search className="w-5 h-5" />
          </Button>

          <div className="hidden sm:block min-w-0">
            <BreadcrumbHierarchyTrail items={breadcrumbs} />
          </div>
        </>
      }
      centerContent={
        <div ref={searchContainerRef} className="relative w-80 lg:w-96">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSpotlightOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsSpotlightOpen(true)}
              onKeyDown={handleKeyDownSearch}
              placeholder="Search vehicle plate, job #, part SKU..."
              className="w-full h-8 pl-8 pr-9 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg text-xs transition-all outline-none"
              data-testid="global-search-input"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          </form>

          {/* Universal Spotlight Overlay Dropdown */}
          {isSpotlightOpen && (
            <div
              className="absolute left-0 right-0 top-10 bg-white rounded-[16px] border border-slate-200/90 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
              data-testid="spotlight-command-palette"
            >
              <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/50">
                <span className="font-semibold text-slate-600">Spotlight Omnibox</span>
                <span className="flex items-center gap-1">
                  <span>Navigate</span>
                  <kbd className="px-1 py-0.5 bg-white border rounded text-[9px]">↑↓</kbd>
                  <span>Select</span>
                  <kbd className="px-1 py-0.5 bg-white border rounded text-[9px]">↵</kbd>
                  <span>Close</span>
                  <kbd className="px-1 py-0.5 bg-white border rounded text-[9px]">Esc</kbd>
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                {filteredResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No records or routes matching "{searchQuery}". Press Enter to search job database.
                  </div>
                ) : (
                  filteredResults.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setIsSpotlightOpen(false);
                          setSearchQuery('');
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-[10px] text-xs cursor-pointer transition-colors group',
                          isSelected
                            ? 'bg-[#FFF7ED] text-[#F95700]'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition-colors',
                              isSelected
                                ? 'bg-[#F95700] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <div
                              className={cn(
                                'font-bold truncate',
                                isSelected ? 'text-[#F95700]' : 'text-slate-900'
                              )}
                            >
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && (
                            <span
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                                isSelected
                                  ? 'bg-orange-100 text-[#F95700]'
                                  : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight
                            className={cn(
                              'w-3.5 h-3.5 transition-transform',
                              isSelected
                                ? 'text-[#F95700] translate-x-0.5'
                                : 'text-slate-300'
                            )}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      }
      rightContent={
        <div className="flex items-center gap-3">
          {/* Shift Status */}
          {activeShift && (
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 px-2 py-1 cursor-pointer transition-colors hover:text-slate-900 hover:bg-slate-100 rounded-md"
              onClick={() => navigate('/pos')}
              title={
                activeShift.status === 'OPEN'
                  ? `Active Register: ${activeShift.id} (${activeShift.cashierName})`
                  : `Closed Register: ${activeShift.id}`
              }
              data-testid="active-shift-pill"
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  activeShift.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-400'
                )}
              />
              <span className="font-semibold text-slate-700">
                {activeShift.status === 'OPEN' ? 'Shift Open' : 'Shift Closed'}
              </span>
            </div>
          )}

          {/* Centralized Cost & Profit Mode Privacy Gate: VISIBLE ONLY TO OWNER & MANAGER */}
          <RolePermissionGateWrapper allowedRoles={['OWNER', 'WORKSHOP_MANAGER']}>
            {permissions.canViewCosts && permissions.canViewGrossProfit && (
              <div className="shrink-0">
                <ToggleLockPrivacyButton
                  isLocked={!isCostProfitVisible}
                  onToggle={toggleCostProfitVisible}
                  dataTestId="header-cost-mode-toggle"
                  lockedLabel="Cost Visibility: OFF"
                  unlockedLabel="Cost Visibility: ON"
                  title="Toggle Admin Cost Visibility"
                  className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600"
                />
              </div>
            )}
          </RolePermissionGateWrapper>

          {/* Role Perspective Switcher Pill (Interactive on canvas) */}
          <div className="hidden sm:inline-flex items-center">
            <RolePerspectiveBadge role={role} onClick={handleCycleRole} />
          </div>

          {/* Hidden helper for test compatibility (select) */}
          <div className="sr-only">
            <select
              value={role}
              onChange={handleRoleChange}
              aria-label="Active User Role"
              data-testid="role-switcher-select"
            >
              <option value="OWNER">OWNER</option>
              <option value="WORKSHOP_MANAGER">WORKSHOP MANAGER</option>
              <option value="SERVICE_ADVISOR">SERVICE ADVISOR</option>
              <option value="CASHIER">CASHIER</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
            </select>
          </div>

          {/* Global Primary Quick CTAs via QuickLaunchHeaderActions */}
          <QuickLaunchHeaderActions
            onNewRepairSheet={() => navigate('/workshop/sheet')}
            onOpenCounterPos={() => navigate('/pos')}
          />
        </div>
      }
    />
  );
}
