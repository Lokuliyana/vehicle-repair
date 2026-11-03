import React, { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './button';

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-md transition-opacity"
        onClick={() => !isLoading && onCancel()}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-md rounded-[22px] border border-white/40 bg-white p-6 shadow-2xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="flex items-start gap-3.5 mb-4">
          {isDestructive && (
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="compact"
            disabled={isLoading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'primary'}
            size="compact"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  children,
  isLoading = false,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-md transition-opacity"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 w-full rounded-[22px] border border-white/40 bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]',
          widthClass
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto space-y-4 flex-1">{children}</div>

          {/* Footer */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="compact"
              disabled={isLoading}
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              isLoading={isLoading}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export interface DetailDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: React.ReactNode;
  description?: string;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl';
}

export const DetailDialog: React.FC<DetailDialogProps> = ({
  open,
  onClose,
  title,
  badge,
  description,
  tabs,
  children,
  footerActions,
  maxWidth = 'xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 w-full rounded-[22px] border border-white/40 bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]',
          widthClass
        )}
      >
        <div className="p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {badge}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          {tabs && <div className="mt-3 -mb-2">{tabs}</div>}
        </div>

        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {footerActions && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};

export interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = 'right',
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 z-50 w-full bg-white border-white/40 shadow-2xl flex flex-col transition ease-in-out duration-300',
          side === 'right' ? 'right-0 border-l rounded-l-[22px]' : 'left-0 border-r rounded-r-[22px]',
          widthClass
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 shrink-0 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface ActionPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const ActionPopover: React.FC<ActionPopoverProps> = ({
  trigger,
  children,
  align = 'end',
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

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }[align];

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-flex">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute top-full mt-1.5 w-48 bg-white border border-slate-200/90 rounded-xl shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95',
            alignClass,
            className
          )}
        >
          {typeof children === 'function' ? (children as any)({ close: () => setIsOpen(false) }) : children}
        </div>
      )}
    </div>
  );
};
