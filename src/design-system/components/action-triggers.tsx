import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Lock, Unlock, Printer, Copy, Check, MessageSquare, AlertTriangle, ChevronDown, Plus, Sparkles } from 'lucide-react';

export interface ButtonPrimaryLuxuryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ButtonPrimaryLuxury = React.forwardRef<HTMLButtonElement, ButtonPrimaryLuxuryProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-[10px]',
          'bg-[#F95700] hover:bg-[#EA580C] active:scale-[0.98] shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-150',
          'focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonPrimaryLuxury.displayName = 'ButtonPrimaryLuxury';

export interface ButtonObsidianExecutiveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ButtonObsidianExecutive = React.forwardRef<HTMLButtonElement, ButtonObsidianExecutiveProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-[10px]',
          'bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] shadow-sm transition-all duration-150',
          'focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonObsidianExecutive.displayName = 'ButtonObsidianExecutive';

export interface ButtonSecondaryHairlineProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ButtonSecondaryHairline = React.forwardRef<HTMLButtonElement, ButtonSecondaryHairlineProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white rounded-[10px]',
          'border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all duration-150',
          'shadow-xs focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonSecondaryHairline.displayName = 'ButtonSecondaryHairline';

export const ButtonGhostMinimal = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 rounded-[8px]',
          'hover:bg-slate-100/70 hover:text-slate-900 active:scale-[0.98] transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonGhostMinimal.displayName = 'ButtonGhostMinimal';

export const ButtonDestructiveSoft = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-[10px]',
          'border border-red-200 hover:bg-red-600 hover:text-white transition-all duration-150 active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonDestructiveSoft.displayName = 'ButtonDestructiveSoft';

export const ButtonSuccessEmerald = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-[10px]',
          'hover:bg-emerald-700 active:scale-[0.98] shadow-sm transition-all duration-150',
          'focus:outline-none focus:ring-4 focus:ring-emerald-500/20',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonSuccessEmerald.displayName = 'ButtonSuccessEmerald';

export const ButtonIconSquare = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] text-slate-600 bg-white border border-slate-200/80',
          'hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all shadow-xs',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonIconSquare.displayName = 'ButtonIconSquare';

export const ButtonCircleQuickAdd = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label="Quick Add"
        className={clsx(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F95700] text-white',
          'hover:bg-[#EA580C] active:scale-90 transition-transform shadow-xs',
          className
      )}
      {...props}
    >
      <span className="text-lg font-bold leading-none">+</span>
      </button>
    );
  }
);
ButtonCircleQuickAdd.displayName = 'ButtonCircleQuickAdd';

export interface SegmentedPillSwitcherProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedPillSwitcher: React.FC<SegmentedPillSwitcherProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className="inline-flex p-1 bg-slate-100/90 rounded-full border border-slate-200/60">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-150',
              isActive
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export const HotKeyKbdChip: React.FC<{ keys: string }> = ({ keys }) => {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 rounded border border-slate-200 shadow-xs">
      {keys}
    </kbd>
  );
};

export const ClipboardCopyChip: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
      title="Click to copy"
    >
      <span>{text}</span>
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
    </button>
  );
};

export interface ToggleLockPrivacyButtonProps {
  isLocked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  dataTestId?: string;
  lockedLabel?: string;
  unlockedLabel?: string;
  className?: string;
  title?: string;
  'data-testid'?: string;
}

export const ToggleLockPrivacyButton: React.FC<ToggleLockPrivacyButtonProps> = ({
  isLocked,
  onToggle,
  disabled,
  dataTestId,
  lockedLabel,
  unlockedLabel,
  className,
  title = "Toggle Admin Cost Visibility",
  ...rest
}) => {
  const resolvedTestId = dataTestId || rest['data-testid'];
  const tooltip = isLocked ? (lockedLabel || "Cost Visibility: OFF") : (unlockedLabel || "Cost Visibility: ON");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      data-testid={resolvedTestId}
      className={clsx(
        'h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-150 cursor-pointer select-none',
        isLocked
          ? 'bg-white hover:bg-slate-50 hover:text-slate-900'
          : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={tooltip}
      aria-label={tooltip}
    >
      {isLocked ? (
        <>
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span className="sr-only">{lockedLabel || 'Cost Hidden'}</span>
        </>
      ) : (
        <>
          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="sr-only">{unlockedLabel || 'Cost Visible'}</span>
        </>
      )}
    </button>
  );
};

export const WhatsAppBrandTrigger: React.FC<{ phone: string; onClick?: () => void }> = ({
  phone,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-[10px] hover:bg-emerald-100 transition-colors"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      <span>Share via WhatsApp ({phone})</span>
    </button>
  );
};

export const PrintActionTrigger: React.FC<{ label?: string; onClick: () => void }> = ({
  label = 'Print Document',
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[10px] hover:bg-slate-50 transition-colors shadow-xs"
    >
      <Printer className="w-3.5 h-3.5 text-slate-500" />
      <span>{label}</span>
    </button>
  );
};

export interface HoldToConfirmButtonProps {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  holdDurationMs?: number;
}

export const HoldToConfirmButton: React.FC<HoldToConfirmButtonProps> = ({
  label,
  confirmLabel,
  onConfirm,
}) => {
  const [holding, setHolding] = useState(false);

  return (
    <button
      type="button"
      onMouseDown={() => setHolding(true)}
      onMouseUp={() => {
        if (holding) {
          onConfirm();
          setHolding(false);
        }
      }}
      onMouseLeave={() => setHolding(false)}
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-[10px] hover:bg-red-100 transition-all active:scale-95"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
      <span>{holding ? confirmLabel : label}</span>
    </button>
  );
};

export interface SplitActionDropdownButtonProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  options: Array<{ label: string; onClick: () => void }>;
  className?: string;
}

export const SplitActionDropdownButton: React.FC<SplitActionDropdownButtonProps> = ({
  primaryLabel,
  onPrimaryClick,
  options,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={clsx('relative inline-flex rounded-[10px] shadow-sm', className)}>
      <button
        type="button"
        onClick={onPrimaryClick}
        className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-l-[10px] border-r border-slate-700 transition-colors"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle options"
        className="inline-flex items-center px-2 py-2 text-white bg-[#0F172A] hover:bg-slate-800 rounded-r-[10px] transition-colors"
      >
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200/80 rounded-[12px] shadow-lg py-1.5 z-50">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                opt.onClick();
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FloatingActionQuickIntake: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = 'New Intake',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#F95700] hover:bg-[#EA580C] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-40"
    >
      <Plus className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

export const AiAssistActionPill: React.FC<{ label?: string; onClick: () => void; isProcessing?: boolean }> = ({
  label = '✨ Auto-Fill Specs',
  onClick,
  isProcessing = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isProcessing}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-900 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-full hover:border-amber-300 transition-all duration-150 active:scale-95 disabled:opacity-60"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
      <span>{label}</span>
    </button>
  );
};

export interface PaginationPillButtonProps {
  page: number;
  isActive?: boolean;
  onClick: (page: number) => void;
}

export const PaginationPillButton: React.FC<PaginationPillButtonProps> = ({ page, isActive = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      className={clsx(
        'w-[34px] h-[34px] inline-flex items-center justify-center text-xs font-semibold rounded-[8px] transition-all duration-150',
        isActive
          ? 'bg-[#0F172A] text-white shadow-xs'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
      )}
    >
      {page}
    </button>
  );
};

export const CollapseChevronButton: React.FC<{ isCollapsed: boolean; onToggle: () => void; label?: string }> = ({
  isCollapsed,
  onToggle,
  label,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors p-1 rounded-[6px] hover:bg-slate-100"
    >
      <ChevronDown
        className={clsx('w-3.5 h-3.5 transition-transform duration-200', isCollapsed && '-rotate-90')}
      />
      {label && <span>{label}</span>}
    </button>
  );
};

