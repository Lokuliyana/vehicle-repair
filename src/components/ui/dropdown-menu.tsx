import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = useContext(DropdownContext);
    if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="menu"
        aria-expanded={context.isOpen}
        onClick={(e) => {
          context.setIsOpen((prev) => !prev);
          onClick?.(e);
        }}
        className={cn('inline-flex items-center justify-center cursor-pointer', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'end', children, ...props }, ref) => {
    const context = useContext(DropdownContext);
    if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

    if (!context.isOpen) return null;

    const alignClass = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }[align];

    return (
      <div
        ref={ref}
        role="menu"
        className={cn(
          'absolute top-full mt-1.5 w-48 bg-white border border-slate-200/90 rounded-xl shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95',
          alignClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
  icon?: React.ReactNode;
}

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, destructive = false, icon, children, onClick, disabled, ...props }, ref) => {
    const context = useContext(DropdownContext);

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          context?.close();
          onClick?.(e);
        }}
        className={cn(
          'w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer select-none',
          destructive
            ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {icon && <span className="w-3.5 h-3.5 shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
      </button>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={cn('h-px bg-slate-100 my-1', className)} {...props} />;
};
