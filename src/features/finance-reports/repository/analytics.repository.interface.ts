import {
  DateRangeFilter,
  SalesGrossProfitReportData,
  InsuranceAgingReportData,
  TechnicianVelocityReportData,
  InventoryVelocityAndAlertsReportData,
} from '@/types';

export interface IAnalyticsRepository {
  getSalesGrossProfitReport(
    filter?: DateRangeFilter,
    referenceNow?: Date
  ): Promise<SalesGrossProfitReportData>;

  getSalesGrossProfitReportSync(
    filter?: DateRangeFilter,
    referenceNow?: Date
  ): SalesGrossProfitReportData;

  getInsuranceAgingReport(referenceNow?: Date): Promise<InsuranceAgingReportData>;

  getInsuranceAgingReportSync(referenceNow?: Date): InsuranceAgingReportData;

  getTechnicianVelocityReport(referenceNow?: Date): Promise<TechnicianVelocityReportData>;

  getTechnicianVelocityReportSync(referenceNow?: Date): TechnicianVelocityReportData;

  getInventoryVelocityAndAlertsReport(
    filter?: DateRangeFilter,
    referenceNow?: Date
  ): Promise<InventoryVelocityAndAlertsReportData>;

  getInventoryVelocityAndAlertsReportSync(
    filter?: DateRangeFilter,
    referenceNow?: Date
  ): InventoryVelocityAndAlertsReportData;
}
