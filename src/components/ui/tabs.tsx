import React, { createContext, useContext, useState, useRef } from 'react';
import { cn } from '@/utils/cn';

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  const activeValue = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (val: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!listRef.current) return;
    const tabs = Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const activeIndex = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (activeIndex + 1) % tabs.length;
      tabs[next]?.focus();
      tabs[next]?.click();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (activeIndex - 1 + tabs.length) % tabs.length;
      tabs[prev]?.focus();
      tabs[prev]?.click();
    }
  };

  return (
    <div
      ref={(node) => {
        listRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-[10px] bg-slate-100/80 p-1 text-slate-500 gap-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, count, icon, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        tabIndex={isActive ? 0 : -1}
        onClick={() => context?.onValueChange(value)}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] px-3.5 py-1.5 text-xs font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          isActive
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
          className
        )}
        {...props}
      >
        {icon && <span className="w-3.5 h-3.5 shrink-0">{icon}</span>}
        <span>{children}</span>
        {count !== undefined && (
          <span
            className={cn(
              'px-1.5 py-0.2 text-[10px] font-bold rounded-full font-sans tabular-nums',
              isActive ? 'bg-orange-100 text-[#F95700]' : 'bg-slate-200 text-slate-600'
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (context?.value !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state="active"
        className={cn('mt-2 ring-offset-white focus-visible:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export interface SegmentedControlOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (val: string) => void;
  options: SegmentedControlOption[];
  size?: 'compact' | 'default';
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  options,
  size = 'default',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((o) => o.value === value);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex].value);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + options.length) % options.length;
      onChange(options[prevIndex].value);
    }
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 select-none gap-0.5',
        size === 'compact' ? 'h-8' : 'h-10',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
              size === 'compact' ? 'h-6 text-[11px]' : 'h-8 text-xs',
              isActive
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
          >
            {opt.icon && <span className="w-3.5 h-3.5 shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] font-bold rounded-full font-sans tabular-nums',
                  isActive ? 'bg-orange-100 text-[#F95700]' : 'bg-slate-200 text-slate-600'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
