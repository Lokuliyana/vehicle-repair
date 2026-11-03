import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { AppShellMasterLayout } from '@/design-system/components/navigation-shell-components';

export function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('erp_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('erp_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile navigation on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen]);

  return (
    <AppShellMasterLayout
      sidebar={
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
        />
      }
      header={<Header onToggleMobile={() => setIsMobileNavOpen((prev) => !prev)} />}
      mobileDrawer={
        isMobileNavOpen ? (
          <div className="fixed inset-0 z-50 flex md:hidden screen-only no-print">
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
              data-testid="mobile-overlay-backdrop"
            />
            <div className="relative flex flex-col w-64 max-w-xs bg-white shadow-2xl z-10 h-full border-r border-slate-900/[0.06]">
              <div className="absolute top-3 right-3 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="text-slate-400 hover:text-slate-900"
                  aria-label="Close Mobile Menu"
                  data-testid="close-mobile-nav"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <Sidebar onCloseMobile={() => setIsMobileNavOpen(false)} />
            </div>
          </div>
        ) : null
      }
      floatingActions={
        <div className="md:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 screen-only no-print">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/workshop/sheet/demo')}
            className="shadow-lg bg-[#F95700] hover:bg-[#EA580C] text-white rounded-full px-3.5 h-10 gap-1.5"
            data-testid="floating-new-sheet-btn"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">New Sheet</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/pos')}
            className="shadow-lg bg-[#0F172A] hover:bg-slate-800 text-white rounded-full px-3.5 h-10 gap-1.5"
            data-testid="floating-open-pos-btn"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold">POS</span>
          </Button>
        </div>
      }
    >
      <Outlet />
    </AppShellMasterLayout>
  );
}
