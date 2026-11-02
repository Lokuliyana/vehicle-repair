import React, { useState, useRef, useEffect } from 'react';
import { Car, CheckCircle2, X, Sparkles } from 'lucide-react';
import { VehicleHistoricalRecord } from '../types';
import { useVehicleLookup } from '../hooks/useVehicleLookup';
import { normalizePlate } from '../repository/vehicle-history.repository.mock';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface VehicleLookupInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onPopulate: (record: VehicleHistoricalRecord) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function VehicleLookupInput({
  value,
  onChange,
  onPopulate,
  label,
  error,
  className,
  placeholder = 'e.g. CBA-1234 or WP CAB-4521',
  ...props
}: VehicleLookupInputProps) {
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const populatedPlateRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, hasSuggestions, dismissSuggestions, isLoading } =
    useVehicleLookup(value);

  const isCurrentlyPopulated =
    populatedPlateRef.current !== null &&
    normalizePlate(value) === populatedPlateRef.current;

  const topMatch = suggestions[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        dismissSuggestions();
        setShowAllSuggestions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissSuggestions();
        setShowAllSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismissSuggestions]);

  const handlePopulate = (record: VehicleHistoricalRecord) => {
    populatedPlateRef.current = normalizePlate(record.vehicleNumber);
    onPopulate(record);
    dismissSuggestions();
    setShowAllSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (populatedPlateRef.current && normalizePlate(val) !== populatedPlateRef.current) {
      populatedPlateRef.current = null;
    }
    onChange(val);
  };

  return (
    <div ref={containerRef} className={cn('relative space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            'font-mono uppercase font-bold tracking-wider text-slate-900 pr-8',
            error && 'border-rose-500 focus-visible:ring-rose-400'
          )}
          data-testid="vehicle-lookup-input"
          {...props}
        />
        {isLoading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div
              className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
              data-testid="vehicle-lookup-spinner"
            />
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}

      {/* Non-blocking suggestion pill */}
      {hasSuggestions && topMatch && !isCurrentlyPopulated && (
        <div
          data-testid="vehicle-suggestion-pill"
          className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/90 p-2.5 text-xs text-amber-950 shadow-xs animate-in fade-in-50 slide-in-from-top-1"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-md bg-amber-200/80 p-1 text-amber-900">
                <Car className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5 leading-snug">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-amber-950 font-mono">
                    {topMatch.vehicleNumber}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    ({topMatch.vehicleMake} {topMatch.vehicleModel} · {topMatch.yearOfMake})
                  </span>
                </div>
                <div className="text-[11px] text-amber-900 truncate max-w-sm">
                  Customer: <span className="font-semibold">{topMatch.customerInfo}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissSuggestions}
              aria-label="Dismiss suggestion"
              className="text-amber-700 hover:text-amber-950 p-0.5 rounded-md hover:bg-amber-200/50 cursor-pointer"
              data-testid="vehicle-suggestion-dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
            <div className="flex items-center gap-1 text-[10px] text-amber-700 font-medium">
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span>Found previous repair job in records</span>
            </div>

            <div className="flex items-center gap-1.5">
              {suggestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="text-[10px] text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  +{suggestions.length - 1} other
                </button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => handlePopulate(topMatch)}
                className="h-6 text-[11px] px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1 shadow-xs"
                data-testid="vehicle-populate-btn"
              >
                <CheckCircle2 className="h-3 w-3" />
                Populate Details
              </Button>
            </div>
          </div>

          {/* Expanded dropdown if multiple matches and user clicked '+other' */}
          {showAllSuggestions && suggestions.length > 1 && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-amber-200">
              {suggestions.slice(1).map((sugg) => (
                <div
                  key={sugg.vehicleNumber}
                  className="flex items-center justify-between p-1.5 rounded-md bg-white/70 hover:bg-white text-[11px] transition-colors"
                >
                  <div>
                    <span className="font-bold font-mono text-slate-800 mr-2">
                      {sugg.vehicleNumber}
                    </span>
                    <span className="text-slate-600">
                      {sugg.vehicleMake} {sugg.vehicleModel} ({sugg.customerName || sugg.customerInfo})
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handlePopulate(sugg)}
                    className="h-5 text-[10px] px-2 text-slate-700"
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
