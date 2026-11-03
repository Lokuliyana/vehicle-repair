import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export type HeaderGlowColor =
  | 'blue'
  | 'emerald'
  | 'orange'
  | 'indigo'
  | 'purple'
  | 'teal'
  | 'amber'
  | 'slate';

export interface PageHeaderProps {
  /**
   * Primary title of the page (e.g. "Workshop Jobs & Collision Estimates")
   */
  title: string;
  /**
   * Uppercase micro-category kicker tag above the title (e.g. "WORKSHOP OPERATIONS")
   */
  kicker?: string;
  /**
   * Domain squircle icon node (e.g. <Wrench className="w-5 h-5 text-[#F95700]" />)
   */
  icon?: React.ReactNode;
  /**
   * Custom classes for the icon container squircle
   */
  iconClassName?: string;
  /**
   * Ambient atmospheric glow color in the card background
   */
  glowColor?: HeaderGlowColor;
  /**
   * Status pill or count badge beside the title (e.g. "5 Records", "[OWNER]", "Live Bay Monitor")
   */
  badge?: React.ReactNode;
  /**
   * Optional breadcrumb navigation array
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Secondary description text explaining the page's purpose
   */
  description?: string;
  /**
   * Backward-compatibility alias for badge
   */
  status?: React.ReactNode;
  /**
   * Primary action button
   */
  primaryAction?: React.ReactNode;
  /**
   * Secondary action buttons
   */
  secondaryActions?: React.ReactNode;
  /**
   * Unified right-aligned action cluster
   */
  actions?: React.ReactNode;
  /**
   * Optional filter toolbar or quick-stats row
   */
  toolbar?: React.ReactNode;
  /**
   * Optional contextual tab strip
   */
  tabs?: React.ReactNode;
  /**
   * Display mode: 'card' (modern floating command bento card) or 'plain' (flat divider)
   */
  variant?: 'card' | 'plain';
  /**
   * Custom header wrapper classes
   */
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

const GLOW_COLOR_MAP: Record<HeaderGlowColor, string> = {
  blue: 'from-blue-500/10 via-indigo-500/5 to-transparent',
  emerald: 'from-emerald-500/10 via-teal-500/5 to-transparent',
  orange: 'from-orange-500/12 via-amber-500/5 to-transparent',
  indigo: 'from-indigo-500/10 via-purple-500/5 to-transparent',
  purple: 'from-purple-500/10 via-fuchsia-500/5 to-transparent',
  teal: 'from-teal-500/10 via-cyan-500/5 to-transparent',
  amber: 'from-amber-500/12 via-orange-500/5 to-transparent',
  slate: 'from-slate-500/8 via-slate-400/5 to-transparent',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  kicker,
  icon,
  iconClassName,
  glowColor = 'slate',
  badge,
  breadcrumbs,
  description,
  status,
  primaryAction,
  secondaryActions,
  actions,
  toolbar,
  tabs,
  variant = 'card',
  className,
  dataTestId,
  ...rest
}) => {
  const resolvedBadge = badge || status;
  const resolvedActions =
    actions ||
    (primaryAction || secondaryActions ? (
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
        {secondaryActions}
        {primaryAction}
      </div>
    ) : null);

  const testId = rest['data-testid'] || dataTestId;

  if (variant === 'plain') {
    return (
      <header
        data-testid={testId}
        className={cn(
          'flex flex-col gap-2 pb-3.5 mb-4 border-b border-slate-200/70 select-none no-print transition-all',
          className
        )}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                  {isLast ? (
                    <span className="font-semibold text-slate-900 truncate" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <span className="text-slate-500 truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div
                className={cn(
                  'w-8.5 h-8.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 ring-1 ring-slate-100 [&>svg]:w-4 [&>svg]:h-4',
                  iconClassName
                )}
              >
                {icon}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              {kicker && (
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{kicker}</span>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-snug">
                  {title}
                </h1>
                {resolvedBadge && <div className="shrink-0">{resolvedBadge}</div>}
              </div>
              {description && (
                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 max-w-2xl mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          {resolvedActions && (
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
              {resolvedActions}
            </div>
          )}
        </div>
        {toolbar && <div className="pt-2">{toolbar}</div>}
        {tabs && <div className="-mb-3.5 mt-1.5">{tabs}</div>}
      </header>
    );
  }

  // World-Class Executive Command Bar Header (Stripe / Linear / macOS inspired)
  return (
    <header
      data-testid={testId}
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/95 border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_1px_2px_rgba(15,23,42,0.02)] px-4 sm:px-5 py-2.5 sm:py-3 mb-3 sm:mb-3.5 select-none no-print transition-all',
        className
      )}
    >
      {/* Ambient Domain Glow Accent */}
      <div
        className={cn(
          'absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none blur-xl opacity-25 bg-gradient-to-br',
          GLOW_COLOR_MAP[glowColor]
        )}
      />

      {/* Top Hairline Light Reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" />

      {/* Optional Breadcrumb Trail inside card */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumbs"
          className="relative z-10 flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-slate-800 truncate" aria-current="page">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-slate-800 hover:underline transition-colors font-medium text-slate-500 truncate"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-400 truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Command Bar Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Elevated Icon + Identity Cluster */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          {icon && (
            <div
              className={cn(
                'w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg bg-slate-50/90 border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0 ring-1 ring-slate-100 transition-transform [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0',
                iconClassName
              )}
            >
              {icon}
            </div>
          )}

          <div className="flex flex-col min-w-0 justify-center">
            {kicker && (
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{kicker}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-snug">
                {title}
              </h1>
              {resolvedBadge && <div className="shrink-0">{resolvedBadge}</div>}
            </div>

            {description && (
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 max-w-2xl mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Tactile Actions Cluster */}
        {resolvedActions && (
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap pt-1 lg:pt-0">
            {resolvedActions}
          </div>
        )}
      </div>

      {/* Optional Integrated Toolbar */}
      {toolbar && (
        <div className="relative z-10 border-t border-slate-100/90 pt-2.5 mt-2.5">
          {toolbar}
        </div>
      )}

      {/* Optional Contextual Tabs */}
      {tabs && (
        <div className="relative z-10 border-t border-slate-100/90 pt-2 mt-2 -mb-0.5">
          {tabs}
        </div>
      )}
    </header>
  );
};
