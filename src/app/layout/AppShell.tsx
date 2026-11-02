import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Button } from '@/components/ui/button';

export function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation (Sheet Overlay) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden screen-only no-print">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
            data-testid="mobile-overlay-backdrop"
          />
          <div className="relative flex flex-col w-4/5 max-w-xs bg-slate-900 shadow-2xl z-10">
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileNavOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close Mobile Menu"
                data-testid="close-mobile-nav"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Sidebar onCloseMobile={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Content Column: Topbar + Main Scrollable Area + Global Quick Bar */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header onToggleMobile={() => setIsMobileNavOpen((prev) => !prev)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 focus:outline-none">
          <Outlet />
        </main>

        {/* Global Bottom Floating Quick-Action Bar for Mobile & Compact Screens */}
        <div className="md:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 screen-only no-print">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/workshop/sheet/demo')}
            className="shadow-lg bg-amber-600 hover:bg-amber-700 text-white rounded-full px-3.5 h-10 gap-1.5"
            data-testid="floating-new-sheet-btn"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">New Sheet</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/pos')}
            className="shadow-lg bg-slate-900 hover:bg-slate-800 text-white rounded-full px-3.5 h-10 gap-1.5"
            data-testid="floating-open-pos-btn"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold">POS</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
