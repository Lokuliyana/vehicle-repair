import { useState, useEffect, useRef } from 'react';
import { VehicleHistoricalRecord } from '../types';
import { IVehicleHistoryRepository } from '../repository/vehicle-history.repository.interface';
import { vehicleHistoryRepository } from '../repository/vehicle-history.repository.mock';

export interface UseVehicleLookupOptions {
  repository?: IVehicleHistoryRepository;
  debounceMs?: number;
  enabled?: boolean;
}

export function useVehicleLookup(
  query: string,
  options?: UseVehicleLookupOptions
) {
  const repo = options?.repository || vehicleHistoryRepository;
  const debounceMs = options?.debounceMs ?? 150;
  const enabled = options?.enabled ?? true;

  const [suggestions, setSuggestions] = useState<VehicleHistoricalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const lastQueryRef = useRef(query);

  useEffect(() => {
    // If the query text actually changes, re-enable suggestions
    if (query !== lastQueryRef.current) {
      setIsDismissed(false);
      lastQueryRef.current = query;
    }

    if (!enabled || !query || query.trim().length < 2 || isDismissed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await repo.lookupByPlate(query);
        setSuggestions(matches);
      } catch (err) {
        console.error('Error looking up vehicle history:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, enabled, isDismissed, repo, debounceMs]);

  const dismissSuggestions = () => {
    setIsDismissed(true);
    setSuggestions([]);
  };

  return {
    suggestions,
    isLoading,
    isDismissed,
    dismissSuggestions,
    hasSuggestions: suggestions.length > 0 && !isDismissed,
  };
}
