import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Search, Lock, Plus, Minus, Check, ChevronDown, X, Upload, Trash2, Eye } from 'lucide-react';
import { HotKeyKbdChip } from './action-triggers';
import { globalDesignManager } from '../global-manager';

export interface InputLuxuryTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const InputLuxuryText = React.forwardRef<HTMLInputElement, InputLuxuryTextProps>(({
  className,
  error,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full h-10 px-3.5 text-sm bg-white rounded-[10px] border transition-all duration-150',
        'placeholder:text-slate-400 text-slate-900',
        error
          ? 'border-red-500 ring-2 ring-red-500/10'
          : 'border-slate-200/90 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
        className
      )}
      {...props}
    />
  );
});
InputLuxuryText.displayName = 'InputLuxuryText';

export interface InputCurrencyRsProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number | string;
  onChange: (val: number) => void;
  error?: boolean;
}

export const InputCurrencyRs = React.forwardRef<HTMLInputElement, InputCurrencyRsProps>(({
  value,
  onChange,
  className,
  error,
  disabled,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
  };

  return (
    <div className={clsx('relative flex items-center', className)}>
      <span className="absolute left-3 text-xs font-semibold text-slate-400 pointer-events-none">
        Rs.
      </span>
      <input
        ref={ref}
        type="text"
        disabled={disabled}
        value={value === 0 ? '' : value}
        onChange={handleChange}
        className={clsx(
          'w-full h-10 pl-9 pr-3 text-sm font-sans tabular-nums text-right bg-white rounded-[10px] border transition-all',
          error
            ? 'border-red-500 ring-2 ring-red-500/10'
            : 'border-slate-200/90 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
          disabled && 'bg-slate-50 text-slate-400'
        )}
        placeholder="0.00"
        {...props}
      />
    </div>
  );
});
InputCurrencyRs.displayName = 'InputCurrencyRs';

export const InputTabularNumber = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({
  className,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type="number"
      className={clsx(
        'w-full h-10 px-3 text-sm font-sans tabular-nums text-right bg-white rounded-[10px] border border-slate-200/90',
        'focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
        className
      )}
      {...props}
    />
  );
});
InputTabularNumber.displayName = 'InputTabularNumber';

export interface InputPercentageMarginProps {
  marginPercent: number;
  className?: string;
}

export const InputPercentageMargin: React.FC<InputPercentageMarginProps> = ({
  marginPercent,
  className,
}) => {
  const health = globalDesignManager.getMarginHealth(marginPercent);

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans tabular-nums font-semibold rounded-md border',
        health.badgeClass,
        className
      )}
      title={`Margin: ${health.label} (${globalDesignManager.formatPercentage(marginPercent)})`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: health.dotColor }} />
      <span>{globalDesignManager.formatPercentage(marginPercent)}</span>
    </div>
  );
};

export interface SearchInputGlobalCommandProps {
  onSearchClick: () => void;
  placeholder?: string;
}

export const SearchInputGlobalCommand: React.FC<SearchInputGlobalCommandProps> = ({
  onSearchClick,
  placeholder = 'Search plate, job, customer or SKU...',
}) => {
  return (
    <button
      type="button"
      onClick={onSearchClick}
      className="flex items-center justify-between w-full max-w-md h-10 px-3.5 text-xs text-slate-500 bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 rounded-[10px] transition-colors"
    >
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <span>{placeholder}</span>
      </div>
      <HotKeyKbdChip keys="⌘K" />
    </button>
  );
};

export interface SearchInputTableLocalProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInputTableLocal: React.FC<SearchInputTableLocalProps> = ({
  value,
  onChange,
  placeholder = 'Filter table...',
  className,
}) => {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#F95700]"
      />
    </div>
  );
};

export interface SwitchiOSTactileProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  'data-testid'?: string;
  className?: string;
}

export const SwitchiOSTactile: React.FC<SwitchiOSTactileProps> = ({
  checked,
  onChange,
  label,
  disabled,
  'data-testid': dataTestId,
  className,
}) => {
  return (
    <label className={clsx('inline-flex items-center gap-2.5 cursor-pointer', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        data-testid={dataTestId}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer',
          checked ? 'bg-[#F95700]' : 'bg-slate-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-xs font-medium text-slate-700">{label}</span>}
    </label>
  );
};

export interface InputQuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export const InputQuantityStepper: React.FC<InputQuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 999,
}) => {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-[8px] p-0.5 border border-slate-200">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-40"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center text-xs font-sans font-bold tabular-nums text-slate-800">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-40"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};

export interface PhoneInputSriLankaProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const PhoneInputSriLanka: React.FC<PhoneInputSriLankaProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <input
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="07X XXX XXXX"
      className={clsx(
        'w-full h-10 px-3.5 text-sm bg-white rounded-[10px] border border-slate-200/90 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
        className
      )}
    />
  );
};

export interface InlineCellTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const InlineCellTextInput = React.forwardRef<HTMLInputElement, InlineCellTextInputProps>(({
  className,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full bg-transparent px-2 py-1 text-xs text-slate-900 border border-transparent hover:border-slate-300 focus:border-[#F95700] focus:bg-white rounded-[6px] outline-none transition-all',
        className
      )}
      {...props}
    />
  );
});
InlineCellTextInput.displayName = 'InlineCellTextInput';

export interface InlineCellCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
}

export const InlineCellCurrencyInput = React.forwardRef<HTMLInputElement, InlineCellCurrencyInputProps>(({
  value,
  onChange,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type="number"
      disabled={disabled}
      value={value === 0 ? '' : value}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        onChange(isNaN(val) ? 0 : val);
      }}
      placeholder="0.00"
      className={clsx(
        'w-full bg-transparent px-2 py-1 text-xs font-sans tabular-nums text-right text-slate-900 border border-transparent hover:border-slate-300 focus:border-[#F95700] focus:bg-white rounded-[6px] outline-none transition-all',
        className
      )}
      {...props}
    />
  );
});
InlineCellCurrencyInput.displayName = 'InlineCellCurrencyInput';

export const FormFieldValidationWrapper: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <span className="text-[11px] font-medium text-red-600">{error}</span>}
      </div>
      {children}
    </div>
  );
};

export const ReadOnlyLockedField: React.FC<{
  label: string;
  value: string;
  className?: string;
}> = ({ label, value, className }) => {
  return (
    <div className={clsx('flex flex-col gap-1 w-full', className)}>
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center justify-between h-9 px-3 bg-slate-50 border border-slate-200/80 rounded-[8px] text-xs font-mono font-medium text-slate-700">
        <span>{value}</span>
        <Lock className="w-3 h-3 text-slate-400" />
      </div>
    </div>
  );
};

export const InputFloatingLabel: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}> = ({ label, value, onChange, className = '' }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || (value && value.length > 0);

  return (
    <div className={clsx('relative w-full', className)}>
      <label
        className={clsx(
          'absolute left-3 transition-all duration-150 pointer-events-none font-medium',
          isFloating
            ? 'top-1 text-[10px] text-orange-600 font-semibold tracking-wider uppercase'
            : 'top-2.5 text-xs text-slate-400'
        )}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full h-11 pt-4 pb-1 px-3 text-xs text-slate-900 bg-white border border-slate-200/90 rounded-[10px] focus:outline-none focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 transition-all"
      />
    </div>
  );
};

export const TextareaAutoGrow: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  onChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <textarea
      ref={textareaRef}
      rows={2}
      onChange={(e) => {
        adjustHeight();
        onChange?.(e);
      }}
      className={clsx(
        'w-full px-3.5 py-2 text-xs text-slate-900 bg-white border border-slate-200/90 rounded-[10px]',
        'focus:outline-none focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 transition-all resize-none leading-relaxed',
        className
      )}
      {...props}
    />
  );
};

export interface SelectOption {
  label: string;
  value: string;
}

export const SelectLuxuryPopover: React.FC<{
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ options, value, onChange, placeholder = 'Select an option', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={clsx('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-[10px] hover:border-slate-300 focus:outline-none focus:border-[#F95700] transition-colors"
      >
        <span>{selected ? selected.label : <span className="text-slate-400">{placeholder}</span>}</span>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-[12px] shadow-lg py-1 z-50 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors text-left',
                opt.value === value ? 'font-semibold text-[#F95700] bg-orange-50/50' : 'text-slate-700'
              )}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-[#F95700]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ComboboxVirtualized: React.FC<{
  items: Array<{ id: string; name: string; subtitle?: string }>;
  onSelect: (item: { id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
}> = ({ items, onSelect, placeholder = 'Search catalog items...', className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={clsx('relative w-full', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3 text-xs text-slate-900 bg-white border border-slate-200/90 rounded-[10px] focus:outline-none focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 transition-all"
        />
      </div>
      {isOpen && query.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-[12px] shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">No matching items</div>
          ) : (
            filtered.slice(0, 50).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  setQuery(item.name);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex flex-col"
              >
                <span className="text-xs font-medium text-slate-800">{item.name}</span>
                {item.subtitle && <span className="text-[10px] text-slate-400">{item.subtitle}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const MultiSelectTagInput: React.FC<{
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}> = ({ availableTags, selectedTags, onChange, label }) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-slate-700">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-150',
                isSelected
                  ? 'bg-orange-100 text-[#EA580C] border border-orange-300 font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              )}
            >
              <span>{tag}</span>
              {isSelected && <X className="w-3 h-3 text-[#EA580C]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const CheckboxRoundedLuxury: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label
      className={clsx(
        'inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={clsx(
          'w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-[#F95700]/30',
          checked
            ? 'bg-[#F95700] border-[#F95700] text-white'
            : 'bg-white border-slate-300 hover:border-slate-400'
        )}
      >
        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};

export interface RadioCardOption {
  id: string;
  title: string;
  description?: string;
  badge?: string;
}

export const RadioCardGroup: React.FC<{
  options: RadioCardOption[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ options, selectedId, onChange, className = '' }) => {
  return (
    <div role="radiogroup" className={clsx('grid grid-cols-1 md:grid-cols-2 gap-2.5', className)}>
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <div
            key={opt.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onChange(opt.id);
              }
            }}
            className={clsx(
              'cursor-pointer p-3.5 rounded-[12px] border transition-all duration-150 flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-[#F95700]/30',
              isSelected
                ? 'bg-orange-50/40 border-[#F95700] ring-2 ring-orange-500/15'
                : 'bg-white border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className={clsx('text-xs font-semibold', isSelected ? 'text-slate-900' : 'text-slate-700')}>
                {opt.title}
              </span>
              {opt.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {opt.badge}
                </span>
              )}
            </div>
            {opt.description && <span className="text-[11px] text-slate-500">{opt.description}</span>}
          </div>
        );
      })}
    </div>
  );
};

export const SliderDiscountRange: React.FC<{
  value: number;
  max?: number;
  onChange: (val: number) => void;
  label?: string;
}> = ({ value, max = 50, onChange, label = 'Discount %' }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-mono font-bold text-[#F95700] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F95700]"
      />
    </div>
  );
};

export const FileDropzoneDashed: React.FC<{
  onFilesSelected?: (files: FileList) => void;
  label?: string;
  hint?: string;
}> = ({ onFilesSelected, label = 'Upload vehicle collision photos or invoices', hint = 'PNG, JPG, PDF up to 10MB' }) => {
  return (
    <div className="relative border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50/60 hover:bg-orange-50/20 rounded-[14px] p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer">
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && onFilesSelected?.(e.target.files)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
        <Upload className="w-5 h-5 text-[#F95700]" />
      </div>
      <span className="text-xs font-semibold text-slate-800">{label}</span>
      <span className="text-[11px] text-slate-400 mt-0.5">{hint}</span>
    </div>
  );
};

export const ImagePreviewThumbnailCard: React.FC<{
  src: string;
  name?: string;
  onDelete?: () => void;
  onPreview?: () => void;
}> = ({ src, name, onDelete, onPreview }) => {
  return (
    <div className="relative group w-20 h-20 rounded-[10px] overflow-hidden border border-slate-200 bg-slate-100">
      <img src={src} alt={name || 'Attachment'} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {onPreview && (
          <button type="button" onClick={onPreview} className="text-white hover:text-orange-300">
            <Eye className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="text-white hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const PasswordPinMaskInput: React.FC<{
  pin: string;
  length?: number;
  onChange: (pin: string) => void;
}> = ({ pin, length = 4, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, length);
    onChange(val);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="password"
        maxLength={length}
        value={pin}
        onChange={handleChange}
        className="opacity-0 absolute -z-10"
        autoFocus
      />
      <div className="flex gap-2.5">
        {Array.from({ length }).map((_, idx) => {
          const filled = idx < pin.length;
          return (
            <div
              key={idx}
              className={clsx(
                'w-10 h-12 rounded-[10px] border flex items-center justify-center font-mono text-base font-bold transition-all',
                filled
                  ? 'border-[#0F172A] bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-transparent'
              )}
            >
              {filled ? '•' : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const UnitOfMeasureSelector: React.FC<{
  value: string;
  onChange: (uom: string) => void;
  units?: string[];
}> = ({ value, onChange, units = ['Nos', 'Liters', 'Sets', 'Hours', 'Panels'] }) => {
  return (
    <div className="inline-flex rounded-[8px] bg-slate-100 p-0.5 border border-slate-200">
      {units.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={clsx(
            'px-2 py-1 text-[11px] font-semibold rounded-[6px] transition-all',
            value === u
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {u}
        </button>
      ))}
    </div>
  );
};

