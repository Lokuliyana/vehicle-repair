import React, { useState } from 'react';
import { clsx } from 'clsx';
import { X, ShieldAlert, Lock, AlertTriangle, Check } from 'lucide-react';
import { HotKeyKbdChip } from './action-triggers';

export interface LuxuryModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const LuxuryModalDialog: React.FC<LuxuryModalDialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-[22px] border border-white/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const SlideOverDrawerRight: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}> = ({ open, onClose, title, children, width = 'max-w-md' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-md">
      <div className={clsx('w-full h-full bg-white border-l border-white/40 shadow-2xl flex flex-col', width)}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

export const StageConversionConfirmDialog: React.FC<{
  open: boolean;
  fromStage: string;
  toStage: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, fromStage, toStage, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <LuxuryModalDialog
      open={open}
      onClose={onCancel}
      title="Confirm Document Stage Transition"
      description="Stage transitions create an immutable historical snapshot and update workflow status."
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            data-testid="stage-conversion-cancel-btn"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[10px] hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid="stage-conversion-confirm-btn"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-[10px] cursor-pointer"
          >
            Confirm & Transition to {toStage}
          </button>
        </>
      }
    >
      <div
        className="p-4 bg-slate-50 rounded-[12px] border border-slate-200 flex items-center justify-between text-xs font-medium"
        data-testid="stage-conversion-dialog-content"
      >
        <span className="text-slate-600">Current Stage: <strong>{fromStage}</strong></span>
        <span>➔</span>
        <span className="text-slate-900">New Stage: <strong className="text-[#F95700]">{toStage}</strong></span>
      </div>
    </LuxuryModalDialog>
  );
};

export const CostPrivacyWarningModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  return (
    <LuxuryModalDialog
      open={open}
      onClose={onClose}
      title="Cost Privacy Guard Active"
      description="Buying cost and profit margin telemetry is strictly confidential."
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-[10px]"
        >
          Acknowledge
        </button>
      }
    >
      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-[10px] border border-amber-200 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p>
          All printouts, PDF documents, WhatsApp notifications, and floor Job Cards are automatically redacted to ensure zero cost leakage to customers or external parties.
        </p>
      </div>
    </LuxuryModalDialog>
  );
};

export const VehicleHistoryLookupPopover: React.FC<{
  plateNumber: string;
  foundVehicle: { make: string; model: string; year: number | string; customerName: string; chassisNumber?: string; vehicleColor?: string };
  onApply: () => void;
  'data-testid'?: string;
}> = ({ plateNumber, foundVehicle, onApply, 'data-testid': testId = 'vehicle-history-lookup-popover' }) => {
  return (
    <div data-testid={testId} className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-[12px] shadow-sm flex items-center justify-between text-xs">
      <div>
        <span className="font-bold text-emerald-950">Found Past History ({plateNumber}):</span>
        <p className="text-emerald-800 text-[11px] mt-0.5">
          {foundVehicle.make} {foundVehicle.model} ({foundVehicle.year}) • {foundVehicle.customerName}
        </p>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
      >
        Auto-Fill
      </button>
    </div>
  );
};

export const WhatsAppSharePreviewDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  messageText: string;
  onSend: () => void;
}> = ({ open, onClose, messageText, onSend }) => {
  return (
    <LuxuryModalDialog
      open={open}
      onClose={onClose}
      title="WhatsApp Summary Share"
      description="Review customer message payload before sending via WhatsApp Web/API."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[10px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[10px]"
          >
            Open WhatsApp
          </button>
        </>
      }
    >
      <pre className="p-3 bg-slate-100 rounded-[10px] text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
        {messageText}
      </pre>
    </LuxuryModalDialog>
  );
};

export const AuditTrailTimelineDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  logs: { timestamp: string; actor: string; action: string; note?: string }[];
}> = ({ open, onClose, logs }) => {
  return (
    <SlideOverDrawerRight open={open} onClose={onClose} title="Document Audit Timeline">
      <div className="flex flex-col gap-4">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#F95700] mt-1.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{log.action}</span>
              <span className="text-[11px] text-slate-500">By {log.actor} • {log.timestamp}</span>
              {log.note && <p className="text-[11px] text-slate-600 mt-1 italic">{log.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </SlideOverDrawerRight>
  );
};

export const SessionLockPinOverlay: React.FC<{
  open: boolean;
  onUnlock: (pin: string) => boolean;
}> = ({ open, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!open) return null;

  const handleUnlock = () => {
    if (onUnlock(pin)) {
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="w-80 p-6 bg-white rounded-[22px] border border-slate-200 shadow-2xl flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">POS Register Locked</h3>
          <p className="text-xs text-slate-500 mt-0.5">Enter 4-digit Cashier PIN to unlock</p>
        </div>
        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          className="w-36 h-12 text-center text-xl font-mono tracking-widest border border-slate-200 rounded-[10px] focus:outline-none focus:border-[#F95700]"
          placeholder="••••"
        />
        {error && <span className="text-xs text-red-600 font-medium">Incorrect PIN code</span>}
        <button
          type="button"
          onClick={handleUnlock}
          className="w-full py-2.5 text-xs font-semibold text-white bg-[#F95700] hover:bg-[#EA580C] rounded-[10px]"
        >
          Unlock Terminal
        </button>
      </div>
    </div>
  );
};

export const WizardStepperModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  steps: string[];
  currentStepIndex: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, steps, currentStepIndex, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-[22px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-6 py-2.5 gap-4">
          {steps.map((st, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className={clsx(
                  'w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]',
                  i === currentStepIndex
                    ? 'bg-[#F95700] text-white'
                    : i < currentStepIndex
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {i < currentStepIndex ? <Check className="w-3 h-3 text-white" /> : i + 1}
              </span>
              <span className={clsx(i === currentStepIndex ? 'font-bold text-slate-900' : 'text-slate-500')}>
                {st}
              </span>
              {i < steps.length - 1 && <span className="text-slate-300 ml-2">›</span>}
            </div>
          ))}
        </div>
        <div className="p-6 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const ToastNotificationStack: React.FC<{
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info'; undoAction?: () => void }>;
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'p-3.5 rounded-[12px] shadow-lg border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2',
            t.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : t.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-white text-slate-900 border-slate-200'
          )}
        >
          <span className="font-medium">{t.message}</span>
          <div className="flex items-center gap-2">
            {t.undoAction && (
              <button
                type="button"
                onClick={t.undoAction}
                className="font-bold underline text-[#F95700] hover:text-orange-700"
              >
                Undo
              </button>
            )}
            <button type="button" onClick={() => onDismiss(t.id)} className="p-0.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DestructiveActionAlertModal: React.FC<{
  open: boolean;
  title: string;
  warningMessage: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}> = ({ open, title, warningMessage, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-[22px] border border-red-200 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-red-600 mt-0.5">High-risk administrative operation</p>
          </div>
        </div>
        <p className="text-xs text-slate-600">{warningMessage}</p>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-700">Mandatory Reason / Comment *</label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation or voiding..."
            className="w-full text-xs p-2.5 border border-slate-200 rounded-[10px] focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[10px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-[10px] disabled:opacity-50"
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
};

export const CatalogQuickCreateModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (item: { name: string; sellingPriceRs: number; buyingCostRs: number }) => void;
}> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [buyingCost, setBuyingCost] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[22px] border border-slate-200 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Quick Create Catalog Item</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-[10px]"
              placeholder="e.g. Front Brake Pad Set"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Selling Price (Rs.)</label>
              <input
                type="number"
                value={sellingPrice || ''}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-[10px]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Buying Cost (Rs.)</label>
              <input
                type="number"
                value={buyingCost || ''}
                onChange={(e) => setBuyingCost(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-[10px]"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-500">
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => onSave({ name, sellingPriceRs: sellingPrice, buyingCostRs: buyingCost })}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#F95700] rounded-[10px]"
          >
            Save to Catalog
          </button>
        </div>
      </div>
    </div>
  );
};

export const ImageLightboxModal: React.FC<{
  open: boolean;
  src: string;
  title?: string;
  onClose: () => void;
}> = ({ open, src, title, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white bg-slate-800/80 hover:bg-slate-700 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
        <img src={src} alt={title || 'Full Preview'} className="max-w-full max-h-[80vh] object-contain rounded-[12px]" />
        {title && <span className="text-white text-xs mt-3 font-medium">{title}</span>}
      </div>
    </div>
  );
};

export const KeyboardShortcutsCheatSheetModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  if (!open) return null;

  const shortcutGroups = [
    {
      title: 'Workshop Repair Studio',
      shortcuts: [
        { key: 'Enter ↵', desc: 'Append new row in repair section' },
        { key: '⌘M', desc: 'Toggle Admin Cost & Profit Mode' },
        { key: '⌘P', desc: 'Open Print Studio (A4 / Thermal)' },
      ],
    },
    {
      title: 'Counter POS Terminal',
      shortcuts: [
        { key: 'Space', desc: 'Open Tender Payment dialog' },
        { key: 'F2', desc: 'Quick add walk-in custom item' },
        { key: 'Esc', desc: 'Dismiss active dialog or drawer' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-[22px] border border-slate-200 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Keyboard Ergonomics</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {shortcutGroups.map((g, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{g.title}</span>
              <div className="flex flex-col gap-1.5">
                {g.shortcuts.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-slate-700">{s.desc}</span>
                    <HotKeyKbdChip keys={s.key} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UnsavedChangesGuardDialog: React.FC<{
  open: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
}> = ({ open, onDiscard, onKeepEditing }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-[20px] border border-slate-200 shadow-2xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900">Unsaved Changes</h3>
        <p className="text-xs text-slate-600">
          You have unsaved changes in this repair sheet. Leaving now will discard your modifications.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onKeepEditing}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-[8px]"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-[8px]"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export const SubletCostEntryPopover: React.FC<{
  subletCostRs: number;
  vendorName: string;
  onSave: (cost: number, vendor: string) => void;
}> = ({ subletCostRs, vendorName, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cost, setCost] = useState(subletCostRs);
  const [vendor, setVendor] = useState(vendorName);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px]"
      >
        Sublet: {cost > 0 ? `Rs. ${cost.toLocaleString()}` : '+ Add'}
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-[12px] shadow-xl p-3 z-50 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sublet Cost Entry</span>
          <input
            type="number"
            placeholder="Sublet Cost (Rs.)"
            value={cost || ''}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full text-xs p-1.5 border border-slate-200 rounded-md"
          />
          <input
            type="text"
            placeholder="Vendor Name"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="w-full text-xs p-1.5 border border-slate-200 rounded-md"
          />
          <div className="flex justify-end gap-1.5 pt-1">
            <button type="button" onClick={() => setIsOpen(false)} className="text-[11px] text-slate-500">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(cost, vendor);
                setIsOpen(false);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0F172A] rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const SupplementaryEstimateAlertBanner: React.FC<{
  supplementaryCount: number;
  totalSupplementaryRs: number;
}> = ({ supplementaryCount, totalSupplementaryRs }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200/90 rounded-[12px] mb-4 text-xs text-amber-950">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="font-bold">Supplementary Items Added:</span>
        <span>{supplementaryCount} new items totaling Rs. {totalSupplementaryRs.toLocaleString()}</span>
      </div>
      <span className="text-[10px] uppercase font-bold bg-amber-200 px-2 py-0.5 rounded-full text-amber-900">
        Requires Assessor Signoff
      </span>
    </div>
  );
};

export const MobileBottomActionDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 backdrop-blur-xs sm:hidden">
      <div className="w-full bg-white rounded-t-[22px] border-t border-slate-200 p-5 shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

