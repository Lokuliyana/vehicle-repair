import React, { useEffect } from 'react';
import { X, Clock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AuditTimelineItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
  fromState?: string;
  toState?: string;
}

export interface RecordDetailDrawerPatternProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  tabs?: Array<{ id: string; label: string; count?: number }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  auditTimeline?: AuditTimelineItem[];
  footerActions?: React.ReactNode;
  width?: 'default' | 'wide' | 'full';
  dataTestId?: string;
}

export function RecordDetailDrawerPattern({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  tabs,
  activeTab,
  onTabChange,
  children,
  auditTimeline,
  footerActions,
  width = 'default',
  dataTestId = 'record-detail-drawer',
}: RecordDetailDrawerPatternProps) {
  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    default: 'max-w-md md:max-w-lg',
    wide: 'max-w-xl md:max-w-2xl',
    full: 'max-w-full',
  }[width];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-modal="true"
      role="dialog"
      data-testid={dataTestId}
    >
      {/* Blurred Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        data-testid="detail-drawer-scrim"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'w-screen bg-white shadow-2xl flex flex-col border-l border-slate-200/80 animate-in slide-in-from-right duration-250',
            widthClasses
          )}
        >
          {/* 1. Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 truncate">{title}</h2>
                {badge}
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close drawer"
              data-testid="detail-drawer-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Optional Tab Navigation */}
          {tabs && tabs.length > 0 && (
            <div className="px-6 border-b border-slate-100 bg-white flex gap-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    'py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-[#F95700] text-[#F95700]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                  data-testid={`drawer-tab-${tab.id}`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600 font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 3. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}

            {/* Optional Audit Trail Timeline */}
            {auditTimeline && auditTimeline.length > 0 && (
              <div className="pt-4 border-t border-slate-100" data-testid="drawer-audit-timeline">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Audit Trail & History
                </h3>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {auditTimeline.map((entry) => (
                    <div key={entry.id} className="relative group text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white group-hover:bg-[#F95700] transition-colors" />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">{entry.timestamp}</span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <User className="w-3 h-3" />
                          {entry.actor}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {entry.action}
                        {entry.fromState && entry.toState && (
                          <span className="inline-flex items-center gap-1 ml-1 text-slate-500 font-normal">
                            ({entry.fromState} <ArrowRight className="w-2.5 h-2.5" /> {entry.toState})
                          </span>
                        )}
                      </div>
                      {entry.note && <div className="text-slate-500 mt-0.5">{entry.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Docked Footer Actions */}
          {footerActions && (
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
