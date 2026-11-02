import { IPosShiftRepository } from '@/features/pos/repository/pos-shift.repository.interface';
import {
  PosShift,
  PosShiftDrawerEntry,
  PaymentMethod,
  SplitPaymentDetails,
} from '@/features/pos/types';
import { ApiClient, apiClient } from './api-client';

/**
 * NestJS REST API Adapter for PosShiftRepository
 * Maps IPosShiftRepository calls to NestJS `/api/v1/pos/shifts` endpoints.
 */
export class PosShiftApiAdapter implements IPosShiftRepository {
  constructor(private client: ApiClient = apiClient) {}

  async getActiveShift(): Promise<PosShift | null> {
    try {
      return await this.client.get<PosShift>('/pos/shifts/active');
    } catch {
      return null;
    }
  }

  async getAllShifts(): Promise<PosShift[]> {
    const res = await this.client.get<{ shifts: PosShift[]; total: number }>('/pos/shifts');
    return res.shifts || [];
  }

  async getShiftById(id: string): Promise<PosShift | null> {
    try {
      return await this.client.get<PosShift>(`/pos/shifts/${id}`);
    } catch {
      return null;
    }
  }

  async openShift(
    cashierId: string,
    cashierName: string,
    openingFloatRs: number = 0
  ): Promise<PosShift> {
    return this.client.post<PosShift>('/pos/shifts/open', {
      cashierId,
      cashierName,
      openingFloatRs,
    });
  }

  async closeShift(
    shiftId: string,
    actualDrawerCashRs: number,
    note?: string
  ): Promise<PosShift> {
    return this.client.post<PosShift>(`/pos/shifts/${shiftId}/close`, {
      actualDrawerCashRs,
      note,
    });
  }

  async recordCashIn(
    shiftId: string,
    amountRs: number,
    reason: string,
    recordedBy?: string
  ): Promise<PosShift> {
    return this.client.post<PosShift>(`/pos/shifts/${shiftId}/cash-in`, {
      amountRs,
      reason,
      recordedBy,
    });
  }

  async recordCashOut(
    shiftId: string,
    amountRs: number,
    reason: string,
    recordedBy?: string
  ): Promise<PosShift> {
    return this.client.post<PosShift>(`/pos/shifts/${shiftId}/cash-out`, {
      amountRs,
      reason,
      recordedBy,
    });
  }

  async recordSale(
    shiftId: string,
    paymentMethod: PaymentMethod,
    netSalesRs: number,
    splitDetails?: SplitPaymentDetails
  ): Promise<PosShift> {
    return this.client.post<PosShift>(`/pos/shifts/${shiftId}/record-sale`, {
      paymentMethod,
      netSalesRs,
      splitDetails,
    });
  }

  async getShiftDrawerEntries(shiftId: string): Promise<PosShiftDrawerEntry[]> {
    const res = await this.client.get<{ entries: PosShiftDrawerEntry[] }>(
      `/pos/shifts/${shiftId}/drawer-entries`
    );
    return res.entries || [];
  }

  async resetToDefaults(): Promise<void> {
    await this.client.post('/pos/shifts/reset');
  }
}

export const posShiftApiAdapter = new PosShiftApiAdapter();
