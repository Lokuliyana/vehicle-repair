import { IAnalyticsRepository } from '@/features/finance-reports/repository/analytics.repository.interface';
import {
  DateRangeFilter,
  SalesGrossProfitReportData,
  InsuranceAgingReportData,
  TechnicianVelocityReportData,
  InventoryVelocityAndAlertsReportData,
} from '@/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for AnalyticsRepository
 * Maps IAnalyticsRepository calls to NestJS `/api/v1/analytics` & `/api/v1/finance` endpoints.
 */
export class AnalyticsApiAdapter implements IAnalyticsRepository {
  constructor(private client: ApiClient = apiClient) {}

  async getSalesGrossProfitReport(
    filter?: DateRangeFilter,
    referenceNow?: Date
  ): Promise<SalesGrossProfitReportData> {
    return this.client.get<SalesGrossProfitReportData>('/analytics/sales-profit', {
      range: filter?.range,
      startDate: filter?.startDate,
      endDate: filter?.endDate,
      referenceNow: referenceNow?.toISOString(),
    });
  }

  getSalesGrossProfitReportSync(
    _filter?: DateRangeFilter,
    _referenceNow?: Date
  ): SalesGrossProfitReportData {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async getInsuranceAgingReport(referenceNow?: Date): Promise<InsuranceAgingReportData> {
    return this.client.get<InsuranceAgingReportData>('/analytics/insurance-aging', {
      referenceNow: referenceNow?.toISOString(),
    });
  }

  getInsuranceAgingReportSync(_referenceNow?: Date): InsuranceAgingReportData {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async getTechnicianVelocityReport(referenceNow?: Date): Promise<TechnicianVelocityReportData> {
    return this.client.get<TechnicianVelocityReportData>('/analytics/technician-velocity', {
      referenceNow: referenceNow?.toISOString(),
    });
  }

  getTechnicianVelocityReportSync(_referenceNow?: Date): TechnicianVelocityReportData {
    throw new Error('Synchronous operation not supported in REST API mode');
  }

  async getInventoryVelocityAndAlertsReport(
    filter?: DateRangeFilter,
    referenceNow?: Date
  ): Promise<InventoryVelocityAndAlertsReportData> {
    return this.client.get<InventoryVelocityAndAlertsReportData>('/analytics/inventory-alerts', {
      range: filter?.range,
      startDate: filter?.startDate,
      endDate: filter?.endDate,
      referenceNow: referenceNow?.toISOString(),
    });
  }

  getInventoryVelocityAndAlertsReportSync(
    _filter?: DateRangeFilter,
    _referenceNow?: Date
  ): InventoryVelocityAndAlertsReportData {
    throw new Error('Synchronous operation not supported in REST API mode');
  }
}

export const analyticsApiAdapter = new AnalyticsApiAdapter();
