import React from 'react';
import { cn } from '@/utils/cn';
import { ShoppingCart } from 'lucide-react';

export interface POSPagePatternProps {
  /**
   * Top bar controls (scanner status pill, shift timer, hold bill button, customer selector).
   */
  headerBar: React.ReactNode;
  /**
   * Left pane: Product catalog search, category ribbon, and touch product cards grid.
   */
  catalogPane: React.ReactNode;
  /**
   * Right pane: Persistent checkout cart items, discounts, totals, and tender actions.
   */
  cartPane: React.ReactNode;
  /**
   * Cart item count badge displayed on mobile floating trigger.
   */
  cartItemCount?: number;
  /**
   * Mobile/tablet cart drawer toggle state.
   */
  isMobileCartOpen?: boolean;
  onToggleMobileCart?: () => void;
  className?: string;
  dataTestId?: string;
}

export function POSPagePattern({
  headerBar,
  catalogPane,
  cartPane,
  cartItemCount = 0,
  isMobileCartOpen = false,
  onToggleMobileCart,
  className,
  dataTestId = 'pos-page-pattern',
}: POSPagePatternProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50',
        className
      )}
      data-testid={dataTestId}
    >
      {/* 1. POS Top Bar */}
      <header
        className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.02)]"
        data-testid="pos-top-bar"
      >
        {headerBar}
      </header>

      {/* 2. Workspace Split Pane (65% Catalog / 35% Checkout Cart) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product Catalog Grid & Quick Search */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          aria-label="Product Catalog Touch Grid"
          data-testid="pos-catalog-pane"
        >
          {catalogPane}
        </main>

        {/* Right: Desktop Persistent Checkout Panel */}
        <aside
          className="hidden lg:flex w-[400px] xl:w-[440px] flex-col bg-white border-l border-slate-200/80 shadow-[-4px_0_16px_rgba(15,23,42,0.03)] shrink-0"
          aria-label="Current Sale Cart"
          data-testid="pos-cart-panel"
        >
          {cartPane}
        </aside>
      </div>

      {/* 3. Mobile / Tablet Floating Cart Bar & Modal Drawer */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={onToggleMobileCart}
          className="bg-[#F95700] hover:bg-[#EA580C] text-white p-4 rounded-full shadow-2xl flex items-center gap-2.5 font-semibold text-sm transition-transform active:scale-95 cursor-pointer"
          aria-label="View shopping cart"
          data-testid="pos-mobile-cart-toggle"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="bg-white text-[#F95700] text-xs font-bold px-2 py-0.5 rounded-full font-mono">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart Sheet Overlay */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onToggleMobileCart}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            {cartPane}
          </div>
        </div>
      )}
    </div>
  );
}
