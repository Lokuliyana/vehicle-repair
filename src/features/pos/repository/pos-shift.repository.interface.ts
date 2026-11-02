import { PosShift, PosShiftDrawerEntry, PaymentMethod, SplitPaymentDetails } from '../types';

export interface IPosShiftRepository {
  getActiveShift(): Promise<PosShift | null>;
  getActiveShiftSync?(): PosShift | null;
  getAllShifts(): Promise<PosShift[]>;
  getShiftById(id: string): Promise<PosShift | null>;
  getShiftByIdSync?(id: string): PosShift | null;
  openShiftSync?(cashierId: string, cashierName: string, openingFloatRs?: number): PosShift;
  openShift(cashierId: string, cashierName: string, openingFloatRs?: number): Promise<PosShift>;
  closeShiftSync?(shiftId: string, actualDrawerCashRs: number, note?: string): PosShift;
  recordCashIn(
    shiftId: string,
    amountRs: number,
    reason: string,
    recordedBy?: string
  ): Promise<PosShift>;
  recordCashOut(
    shiftId: string,
    amountRs: number,
    reason: string,
    recordedBy?: string
  ): Promise<PosShift>;
  recordSale(
    shiftId: string,
    paymentMethod: PaymentMethod,
    netSalesRs: number,
    splitDetails?: SplitPaymentDetails
  ): Promise<PosShift>;
  closeShift(shiftId: string, actualDrawerCashRs: number, note?: string): Promise<PosShift>;
  getShiftDrawerEntries(shiftId: string): Promise<PosShiftDrawerEntry[]>;
  resetToDefaults(): Promise<void>;
}
