import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Eye,
  EyeOff,
  Search,
  Plus,
  ShoppingCart,
  Shield,
  CircleDot,
  Command,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    if (!searchQuery.trim()) return;
    toast({
      title: 'Global Search',
      message: `Searching for: "${searchQuery}" (Quick lookup)`,
      type: 'info',
    });
    // In Phase 2, can route to /workshop/jobs or show lookup
    navigate(`/workshop/jobs?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs screen-only no-print"
      data-testid="app-header"
    >
      {/* Left: Mobile Menu Trigger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobile}
          className="md:hidden text-slate-700"
          aria-label="Toggle Navigation Menu"
          data-testid="mobile-menu-trigger"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Global Fast Search (Zero CRM Friction vehicle plate / job lookup) */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle plate (e.g. CAB-4521), Job #, or Part... (⌘K)"
            className="w-full h-9 pl-9 pr-12 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 border border-slate-200 focus:border-amber-500 rounded-lg outline-none transition-all"
            data-testid="global-search-input"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </form>
      </div>

      {/* Right Controls: Shift Pill, Cost Mode, Role Switcher, Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Active POS Shift Pill */}
        {activeShift && (
          <div
            className={cn(
              "hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors",
              activeShift.status === 'OPEN'
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                : "bg-slate-100 text-slate-700 border border-slate-300"
            )}
            onClick={() => navigate('/pos')}
            title={
              activeShift.status === 'OPEN'
                ? `Active Register: ${activeShift.id} (${activeShift.cashierName})`
                : `Closed Register: ${activeShift.id}`
            }
            data-testid="active-shift-pill"
          >
            <CircleDot
              className={cn(
                "w-3.5 h-3.5",
                activeShift.status === 'OPEN' ? "text-emerald-600 animate-pulse" : "text-slate-400"
              )}
            />
            <span className="font-semibold">{activeShift.id}:</span>
            <span
              className={
                activeShift.status === 'OPEN' ? "text-[11px] text-emerald-700" : "text-[11px] text-slate-500"
              }
            >
              {activeShift.status}
            </span>
          </div>
        )}

        {/* Cost & Profit Mode Indicator & Toggle: VISIBLE ONLY IF PERMITTED (Owner / Manager) */}
        {permissions.canViewCosts && permissions.canViewGrossProfit && (
          <Button
            variant={isCostProfitVisible ? 'warning' : 'outline'}
            size="sm"
            onClick={toggleCostProfitVisible}
            className="text-xs h-8 cursor-pointer font-medium"
            title="Owner & Manager Margin Visibility Control"
            data-testid="header-cost-mode-toggle"
          >
            {isCostProfitVisible ? (
              <>
                <Eye className="w-3.5 h-3.5 mr-1 text-amber-900" />
                <span className="hidden sm:inline">Costs & Margin:</span>
                <span className="font-bold ml-1">ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span className="hidden sm:inline">Costs & Margin:</span>
                <span className="text-slate-500 font-medium ml-1">OFF</span>
              </>
            )}
          </Button>
        )}

        {/* Role Switcher Select */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
          <Shield className="w-3.5 h-3.5 ml-1.5 text-slate-500 hidden sm:inline" />
          <select
            value={role}
            onChange={handleRoleChange}
            aria-label="Active User Role"
            className="bg-transparent text-xs font-semibold text-slate-800 border-none outline-none cursor-pointer pr-1 py-0.5"
            data-testid="role-switcher-select"
          >
            <option value="OWNER">OWNER</option>
            <option value="WORKSHOP_MANAGER">WORKSHOP MANAGER</option>
            <option value="SERVICE_ADVISOR">SERVICE ADVISOR</option>
            <option value="CASHIER">CASHIER</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-1.5" data-testid="global-quick-actions">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/workshop/sheet')}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-xs gap-1"
            data-testid="quick-new-sheet-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+ New Repair Sheet</span>
            <span className="md:hidden">New</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pos')}
            className="text-xs h-8 text-slate-800 border-slate-300 font-semibold cursor-pointer gap-1"
            data-testid="quick-open-pos-btn"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Open POS</span>
            <span className="md:hidden">POS</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
