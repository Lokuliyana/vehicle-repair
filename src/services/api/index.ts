/**
 * Backend API Integration Layer
 * Exports typed REST API adapters implementing the domain repository interfaces.
 */

export * from './api-client';
export * from './catalog.api.adapter';
export * from './workshop-job.api.adapter';
export * from './vehicle-history.api.adapter';
export * from './pos-sale.api.adapter';
export * from './pos-shift.api.adapter';
export * from './finance.api.adapter';
export * from './analytics.api.adapter';

import { catalogApiAdapter } from './catalog.api.adapter';
import { workshopJobApiAdapter } from './workshop-job.api.adapter';
import { vehicleHistoryApiAdapter } from './vehicle-history.api.adapter';
import { posSaleApiAdapter } from './pos-sale.api.adapter';
import { posShiftApiAdapter } from './pos-shift.api.adapter';
import { financeApiAdapter } from './finance.api.adapter';
import { analyticsApiAdapter } from './analytics.api.adapter';

import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { vehicleHistoryRepository } from '@/features/workshop/repository/vehicle-history.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { posShiftRepository } from '@/features/pos/repository/pos-shift.repository.mock';
import { financeRepository } from '@/features/finance-reports/repository/finance.repository.mock';
import { analyticsRepository } from '@/features/finance-reports/repository/analytics.repository.mock';

/**
 * Service Registry / Provider
 * Determines whether to use LocalStorage mock repositories or live NestJS REST endpoints
 * based on the VITE_USE_API environment variable.
 */
export const isApiBackendEnabled = (): boolean => {
  return import.meta.env?.VITE_USE_API === 'true';
};

export const getRepositories = () => {
  const useApi = isApiBackendEnabled();

  return {
    catalogRepository: useApi ? catalogApiAdapter : catalogRepository,
    workshopJobRepository: useApi ? workshopJobApiAdapter : workshopJobRepository,
    vehicleHistoryRepository: useApi ? vehicleHistoryApiAdapter : vehicleHistoryRepository,
    posSaleRepository: useApi ? posSaleApiAdapter : posSaleRepository,
    posShiftRepository: useApi ? posShiftApiAdapter : posShiftRepository,
    financeRepository: useApi ? financeApiAdapter : financeRepository,
    analyticsRepository: useApi ? analyticsApiAdapter : analyticsRepository,
  };
};
