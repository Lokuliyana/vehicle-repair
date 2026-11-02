import {
  DateRangeFilter,
  SalesGrossProfitReportData,
  InsuranceAgingReportData,
  TechnicianVelocityReportData,
  InventoryVelocityAndAlertsReportData,
} from '@/types';
import { IAnalyticsRepository } from './analytics.repository.interface';
import { workshopJobRepository } from '@/features/workshop/repository/workshop-job.repository.mock';
import { posSaleRepository } from '@/features/pos/repository/pos-sale.repository.mock';
import { catalogRepository } from '@/features/catalog/repository/catalog.repository.mock';
import {
  aggregateInsuranceAging,
  calculateTechnicianTurnaround,
  calculateFastMovingParts,
  calculateLowStockAlerts,
  aggregateSalesGrossProfit,
} from '../utils/analytics-math';

export class MockAnalyticsRepository implements IAnalyticsRepository {
  async getSalesGrossProfitReport(
    filter: DateRangeFilter = { range: 'THIS_MONTH' },
    referenceNow: Date = new Date()
  ): Promise<SalesGrossProfitReportData> {
    return this.getSalesGrossProfitReportSync(filter, referenceNow);
  }

  getSalesGrossProfitReportSync(
    filter: DateRangeFilter = { range: 'THIS_MONTH' },
    referenceNow: Date = new Date()
  ): SalesGrossProfitReportData {
    const jobs = workshopJobRepository.getAllSync();
    const posSales = posSaleRepository.getAllSync();
    return aggregateSalesGrossProfit(jobs, posSales, filter, referenceNow);
  }

  async getInsuranceAgingReport(
    referenceNow: Date = new Date()
  ): Promise<InsuranceAgingReportData> {
    return this.getInsuranceAgingReportSync(referenceNow);
  }

  getInsuranceAgingReportSync(
    referenceNow: Date = new Date()
  ): InsuranceAgingReportData {
    const jobs = workshopJobRepository.getAllSync();
    return aggregateInsuranceAging(jobs, referenceNow);
  }

  async getTechnicianVelocityReport(
    referenceNow: Date = new Date()
  ): Promise<TechnicianVelocityReportData> {
    return this.getTechnicianVelocityReportSync(referenceNow);
  }

  getTechnicianVelocityReportSync(
    referenceNow: Date = new Date()
  ): TechnicianVelocityReportData {
    const jobs = workshopJobRepository.getAllSync();
    return calculateTechnicianTurnaround(jobs, referenceNow);
  }

  async getInventoryVelocityAndAlertsReport(
    filter?: DateRangeFilter,
    referenceNow: Date = new Date()
  ): Promise<InventoryVelocityAndAlertsReportData> {
    return this.getInventoryVelocityAndAlertsReportSync(filter, referenceNow);
  }

  getInventoryVelocityAndAlertsReportSync(
    filter?: DateRangeFilter,
    referenceNow: Date = new Date()
  ): InventoryVelocityAndAlertsReportData {
    const jobs = workshopJobRepository.getAllSync();
    const posSales = posSaleRepository.getAllSync();
    const catalogItems = catalogRepository.getAllSync();

    const fastMovingParts = calculateFastMovingParts(
      jobs,
      posSales,
      catalogItems,
      filter,
      referenceNow
    );

    const lowStockAlerts = calculateLowStockAlerts(catalogItems);

    let totalOutOfStockItemsCount = 0;
    let totalLowStockItemsCount = 0;
    let totalInventoryDeficitQty = 0;

    for (const alert of lowStockAlerts) {
      if (alert.status === 'OUT_OF_STOCK') {
        totalOutOfStockItemsCount += 1;
      } else {
        totalLowStockItemsCount += 1;
      }
      totalInventoryDeficitQty += alert.deficitQty;
    }

    return {
      fastMovingParts,
      lowStockAlerts,
      totalLowStockItemsCount,
      totalOutOfStockItemsCount,
      totalInventoryDeficitQty,
    };
  }

  async resetToDefaults(): Promise<void> {
    // Reset dependent repositories
    await workshopJobRepository.resetToDefaults();
    await posSaleRepository.resetToDefaults();
    await catalogRepository.resetToDefaults();
  }
}

export const analyticsRepository = new MockAnalyticsRepository();
