import React, { useState, useRef, useEffect, useId } from 'react';
import { AlertCircle, Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  borderBottom?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  borderBottom = true,
  className,
  children,
  ...props
}) => {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 py-4',
        borderBottom && 'border-b border-slate-200/70',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col gap-0.5">
          {title && <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
};

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  description,
  error,
  htmlFor,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <FormLabel htmlFor={htmlFor} required={required}>
          {label}
        </FormLabel>
      )}
      {children}
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <FormError>{error}</FormError>}
    </div>
  );
};

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  required,
  className,
  children,
  ...props
}) => {
  return (
    <label
      className={cn('text-xs font-semibold text-slate-700 select-none flex items-center gap-1', className)}
      {...props}
    >
      <span>{children}</span>
      {required && <span className="text-red-500 font-bold" aria-hidden="true">*</span>}
    </label>
  );
};

export const FormDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-[11px] text-slate-500 leading-normal', className)} {...props}>
      {children}
    </p>
  );
};

export const FormError: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      role="alert"
      className={cn('text-xs text-red-600 flex items-center gap-1 font-medium mt-0.5 animate-in fade-in-50', className)}
      {...props}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
};

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sizeVariant?: 'default' | 'compact';
  error?: boolean;
  icon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, sizeVariant = 'default', error, icon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full bg-white border rounded-[10px] text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150',
            sizeVariant === 'compact' ? 'h-[34px] px-3 text-xs' : 'h-10 px-3.5',
            icon && 'pl-9',
            error
              ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 focus:outline-none'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number | string;
  onChange?: (val: number) => void;
  sizeVariant?: 'default' | 'compact';
  error?: boolean;
  align?: 'left' | 'right';
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, sizeVariant = 'default', error, align = 'right', disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      onChange?.(isNaN(parsed) ? 0 : parsed);
    };

    return (
      <input
        ref={ref}
        type="number"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'w-full bg-white border rounded-[10px] text-sm font-sans tabular-nums text-slate-900 transition-all',
          align === 'right' ? 'text-right' : 'text-left',
          sizeVariant === 'compact' ? 'h-[34px] px-3 text-xs' : 'h-10 px-3.5',
          error
            ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 focus:outline-none'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
          disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sizeVariant?: 'default' | 'compact';
  error?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, sizeVariant = 'default', error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="date"
          className={cn(
            'w-full bg-white border rounded-[10px] text-sm text-slate-900 transition-all font-sans',
            sizeVariant === 'compact' ? 'h-[34px] px-3 text-xs' : 'h-10 px-3.5',
            error
              ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 focus:outline-none'
              : 'border-slate-200/90 hover:border-slate-300 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
DateInput.displayName = 'DateInput';

export interface InputGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  prefix,
  suffix,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('relative flex items-center w-full', className)} {...props}>
      {prefix && (
        <span className="absolute left-3 text-xs font-semibold text-slate-400 pointer-events-none z-10">
          {prefix}
        </span>
      )}
      <div className={cn('w-full', prefix && '[&_input]:pl-9', suffix && '[&_input]:pr-9')}>
        {children}
      </div>
      {suffix && (
        <span className="absolute right-3 text-xs font-semibold text-slate-400 pointer-events-none z-10">
          {suffix}
        </span>
      )}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full bg-white border rounded-[10px] p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all',
          error
            ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 focus:outline-none'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
          disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onChange, label, description, disabled, id: explicitId, ...props }, ref) => {
    const generatedId = useId();
    const id = explicitId || generatedId;

    return (
      <div className="flex items-start gap-2.5 select-none">
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              'w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer',
              checked
                ? 'bg-[#F95700] border-[#F95700] text-white shadow-2xs'
                : 'bg-white border-slate-300 hover:border-slate-400',
              disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              className
            )}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </label>
        </div>
        {(label || description) && (
          <label htmlFor={id} className="flex flex-col cursor-pointer">
            {label && <span className="text-xs font-semibold text-slate-800">{label}</span>}
            {description && <span className="text-[11px] text-slate-500">{description}</span>}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value: string;
  onChange: (val: string) => void;
  options: RadioOption[];
  variant?: 'standard' | 'cards';
  name?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
  variant = 'standard',
  name: explicitName,
  className,
}) => {
  const generatedName = useId();
  const name = explicitName || generatedName;

  return (
    <div
      role="radiogroup"
      className={cn(
        variant === 'cards' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'flex flex-col gap-2',
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <label
            key={opt.value}
            className={cn(
              'flex items-start gap-3 cursor-pointer transition-all select-none',
              variant === 'cards'
                ? cn(
                    'p-3.5 rounded-[12px] border',
                    isSelected
                      ? 'border-[#F95700] bg-orange-50/30 ring-2 ring-orange-500/10'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  )
                : 'items-center',
              opt.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
            )}
          >
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
                  isSelected ? 'border-[#F95700] bg-[#F95700]' : 'border-slate-300 bg-white'
                )}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">{opt.label}</span>
              {opt.description && <span className="text-[11px] text-slate-500 mt-0.5">{opt.description}</span>}
            </div>
          </label>
        );
      })}
    </div>
  );
};

export interface SearchableSelectOption {
  value: string;
  label: string;
  sub?: string;
}

export interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search...',
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen]);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sub && o.sub.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((o) => o.value === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        onChange(filtered[activeIndex].value);
        setIsOpen(false);
        setSearch('');
      } else if (filtered.length === 1) {
        onChange(filtered[0].value);
        setIsOpen(false);
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} onKeyDown={handleKeyDown}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setActiveIndex(-1);
        }}
        className={cn(
          'w-full h-10 px-3.5 bg-white border rounded-[10px] text-left text-sm flex items-center justify-between transition-all cursor-pointer',
          error
            ? 'border-red-500 ring-2 ring-red-500/10'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-[#F95700] focus:ring-4 focus:ring-orange-500/10 focus:outline-none',
          disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-slate-400')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in-0 zoom-in-95">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              autoFocus
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
              placeholder={searchPlaceholder}
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#F95700]"
            />
          </div>

          <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
            {filtered.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">No options found</div>
            ) : (
              filtered.map((opt, idx) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer',
                    idx === activeIndex && 'bg-orange-50/70',
                    opt.value === value
                      ? 'bg-orange-50 text-[#F95700] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex flex-col truncate">
                    <span className="truncate">{opt.label}</span>
                    {opt.sub && <span className="text-[10px] text-slate-400 truncate">{opt.sub}</span>}
                  </div>
                  {opt.value === value && <Check className="w-3.5 h-3.5 text-[#F95700] shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export interface ComboboxOption {
  value: string;
  label: string;
  sub?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  value?: string;
  onChange: (val: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = (props) => {
  return <SearchableSelect {...props} value={props.value || ''} />;
};

export { Switch } from './switch';
export type { SwitchProps } from './switch';
