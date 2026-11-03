import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'tertiary'
    | 'ghost'
    | 'link'
    | 'warning'
    | 'primary'
    | 'terracotta'
    | 'obsidian'
    | 'soft-destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'compact' | 'large';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none',
          {
            // Variants
            'bg-slate-900 text-slate-50 hover:bg-slate-800 shadow-sm active:scale-[0.98]':
              variant === 'default',
            'bg-[#F95700] text-white hover:bg-[#EA580C] shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.98]':
              variant === 'primary' || variant === 'terracotta',
            'bg-[#0F172A] text-white hover:bg-slate-800 shadow-sm active:scale-[0.98] border border-slate-800/80':
              variant === 'obsidian',
            'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/80 active:scale-[0.98]':
              variant === 'soft-destructive',
            'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]':
              variant === 'destructive',
            'border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-xs active:scale-[0.98]':
              variant === 'outline',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]':
              variant === 'secondary',
            'hover:bg-slate-100 text-slate-700 hover:text-slate-900':
              variant === 'ghost' || variant === 'tertiary',
            'text-blue-600 underline-offset-4 hover:underline p-0 h-auto':
              variant === 'link',
            'bg-amber-500 text-white hover:bg-amber-600 shadow-sm active:scale-[0.98]':
              variant === 'warning',
          },
          {
            // Standardized heights: Compact 32px (h-8), Default 38px (h-[38px]), Large 42px (h-[42px])
            'h-[38px] px-4 py-2 text-sm': size === 'default',
            'h-8 rounded-[10px] px-3 text-xs': size === 'sm' || size === 'compact',
            'h-[42px] rounded-[10px] px-6 text-base': size === 'lg' || size === 'large',
            'h-[38px] w-[38px] p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && iconPosition === 'left' && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        )}
        {children}
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  attached?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  className,
  attached = false,
  children,
  ...props
}) => {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center',
        attached
          ? 'isolate [&>button]:rounded-none first:[&>button]:rounded-l-[10px] last:[&>button]:rounded-r-[10px] [&>button:not(:first-child)]:-ml-px'
          : 'gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SplitButtonAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface SplitButtonProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  primaryIcon?: React.ReactNode;
  actions: SplitButtonAction[];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  primaryLabel,
  onPrimaryClick,
  primaryIcon,
  actions,
  variant = 'primary',
  size = 'default',
  disabled = false,
  isLoading = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className={cn('relative inline-flex items-center isolate', className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        isLoading={isLoading}
        icon={primaryIcon}
        onClick={onPrimaryClick}
        className="rounded-r-none border-r border-black/10 focus:z-10"
      >
        {primaryLabel}
      </Button>
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More actions"
        className="rounded-l-none px-2 focus:z-10"
      >
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-150', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200/90 shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95"
        >
          {actions.map((act, idx) => (
            <button
              key={idx}
              type="button"
              role="menuitem"
              disabled={act.disabled}
              onClick={() => {
                setIsOpen(false);
                act.onClick();
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer',
                act.destructive
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                act.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
              )}
            >
              {act.icon && <span className="w-3.5 h-3.5 shrink-0">{act.icon}</span>}
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
