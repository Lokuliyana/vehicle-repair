import React, { useState, useRef, useEffect } from 'react';
import { History, CheckCircle2, X } from 'lucide-react';
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
    <div ref={containerRef} className="relative space-y-1.5 w-full">
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
            'font-mono uppercase font-bold tracking-wider text-slate-900 pr-8 h-8 text-xs bg-white border border-slate-200 rounded-lg',
            className,
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

      {/* Non-colliding, solid, non-transparent auto-fill bar */}
      {hasSuggestions && topMatch && !isCurrentlyPopulated && (
        <div
          data-testid="vehicle-suggestion-pill"
          className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-950 shadow-sm relative z-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <History className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <div className="text-xs text-amber-950 truncate">
                Previous record found for{' '}
                <span className="font-bold font-mono">{topMatch.vehicleNumber}</span>{' '}
                <span className="text-amber-800">
                  ({topMatch.vehicleMake} {topMatch.vehicleModel} · {topMatch.customerInfo || topMatch.customerName})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
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
                className="h-6 text-[11px] px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1 shadow-2xs"
                data-testid="vehicle-populate-btn"
              >
                <CheckCircle2 className="h-3 w-3" />
                Auto-Fill Vehicle Details
              </Button>
              <button
                type="button"
                onClick={dismissSuggestions}
                aria-label="Dismiss suggestion"
                className="text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-200/50 cursor-pointer"
                data-testid="vehicle-suggestion-dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expanded dropdown if multiple matches and user clicked '+other' */}
          {showAllSuggestions && suggestions.length > 1 && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-amber-200">
              {suggestions.slice(1).map((sugg) => (
                <div
                  key={sugg.vehicleNumber}
                  className="flex items-center justify-between p-1.5 rounded-md bg-white hover:bg-amber-100/40 text-[11px] transition-colors"
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
