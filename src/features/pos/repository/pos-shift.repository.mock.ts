import { PosShift, PosShiftDrawerEntry, PaymentMethod, SplitPaymentDetails } from '../types';
import { IPosShiftRepository } from './pos-shift.repository.interface';

const STORAGE_KEY_SHIFTS = 'antigravity_pos_shifts_v1';
const STORAGE_KEY_DRAWER_ENTRIES = 'antigravity_pos_drawer_entries_v1';

export const INITIAL_SHIFT_SEED: PosShift = {
  id: 'SHIFT-2026-001',
  cashierId: 'user-cashier',
  cashierName: 'Kamal Fonseka',
  openedAt: '2026-11-02 08:00 AM',
  startingCashRs: 15000,
  openingFloatRs: 15000,
  totalCashSalesRs: 0,
  totalCardSalesRs: 0,
  totalBankTransferSalesRs: 0,
  cashInRs: 0,
  cashOutRs: 0,
  expectedDrawerCashRs: 15000,
  status: 'OPEN',
};

export class MockPosShiftRepository implements IPosShiftRepository {
  private listeners = new Set<(shift: PosShift | null) => void>();

  private loadShifts(): PosShift[] {
    if (typeof window === 'undefined') {
      return [INITIAL_SHIFT_SEED];
    }
    const raw = localStorage.getItem(STORAGE_KEY_SHIFTS);
    if (!raw) {
      this.saveShifts([INITIAL_SHIFT_SEED]);
      return [INITIAL_SHIFT_SEED];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_SHIFT_SEED];
    } catch {
      return [INITIAL_SHIFT_SEED];
    }
  }

  private saveShifts(shifts: PosShift[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
    }
    const current = shifts.find((s) => s.status === 'OPEN') || shifts[0] || null;
    this.notify(current);
  }

  private loadDrawerEntries(): PosShiftDrawerEntry[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY_DRAWER_ENTRIES);
    if (!raw) return [];
    try {
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  private saveDrawerEntries(entries: PosShiftDrawerEntry[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DRAWER_ENTRIES, JSON.stringify(entries));
    }
  }

  subscribe(listener: (shift: PosShift | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(currentShift: PosShift | null): void {
    this.listeners.forEach((fn) => {
      try {
        fn(currentShift);
      } catch (err) {
        console.error('Error in shift repository listener:', err);
      }
    });
  }

  async getActiveShift(): Promise<PosShift | null> {
    return this.getActiveShiftSync();
  }

  getActiveShiftSync(): PosShift | null {
    const shifts = this.loadShifts();
    return shifts.find((s) => s.status === 'OPEN') || shifts[0] || null;
  }

  async getAllShifts(): Promise<PosShift[]> {
    const shifts = this.loadShifts();
    return [...shifts].sort(
      (a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
    );
  }

  async getShiftById(id: string): Promise<PosShift | null> {
    const shifts = this.loadShifts();
    return shifts.find((s) => s.id === id) || null;
  }

  openShiftSync(
    cashierId: string,
    cashierName: string,
    openingFloatRs: number = 15000
  ): PosShift {
    const shifts = this.loadShifts();

    // Close any currently open shift before opening a new one
    shifts.forEach((s) => {
      if (s.status === 'OPEN') {
        s.status = 'CLOSED';
        s.closedAt = new Date().toISOString();
        if (s.actualDrawerCashRs === undefined) {
          s.actualDrawerCashRs = s.expectedDrawerCashRs;
          s.varianceRs = 0;
        }
      }
    });

    const now = new Date();
    const year = now.getFullYear();
    const nextSeq = shifts.length + 1;
    const shiftId = `SHIFT-${year}-${String(nextSeq).padStart(3, '0')}`;

    const newShift: PosShift = {
      id: shiftId,
      cashierId,
      cashierName,
      openedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      startingCashRs: openingFloatRs,
      openingFloatRs,
      totalCashSalesRs: 0,
      totalCardSalesRs: 0,
      totalBankTransferSalesRs: 0,
      cashInRs: 0,
      cashOutRs: 0,
      expectedDrawerCashRs: openingFloatRs,
      status: 'OPEN',
    };

    shifts.unshift(newShift);
    this.saveShifts(shifts);
    return newShift;
  }

  async openShift(
    cashierId: string,
    cashierName: string,
    openingFloatRs: number = 15000
  ): Promise<PosShift> {
    return this.openShiftSync(cashierId, cashierName, openingFloatRs);
  }

  async recordCashIn(
    shiftId: string,
    amountRs: number,
    reason: string,
    recordedBy?: string
  ): Promise<PosShift> {
    if (amountRs <= 0) {
      throw new Error('Cash in amount must be greater than zero.');
    }
    const shifts = this.loadShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) {
      throw new Error(`Shift ${shiftId} not found.`);
    }
    if (shift.status !== 'OPEN') {
      throw new Error(`Cannot record cash in on a closed shift.`);
    }

    shift.cashInRs += amountRs;
    shift.expectedDrawerCashRs += amountRs;
    this.saveShifts(shifts);

    const entries = this.loadDrawerEntries();
    const newEntry: PosShiftDrawerEntry = {
      id: `entry-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shiftId,
      type: 'CASH_IN',
      amountRs,
      reason: reason.trim() || 'Float Top-up',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedBy: recordedBy || shift.cashierName,
    };
    entries.unshift(newEntry);
    this.saveDrawerEntries(entries);

    return shift;
  }

  async recordCashOut(
    shiftId: string,
    amountRs: number,
    reason: string,
    recordedBy?: string
  ): Promise<PosShift> {
    if (amountRs <= 0) {
      throw new Error('Cash out amount must be greater than zero.');
    }
    const shifts = this.loadShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) {
      throw new Error(`Shift ${shiftId} not found.`);
    }
    if (shift.status !== 'OPEN') {
      throw new Error(`Cannot record cash out on a closed shift.`);
    }

    shift.cashOutRs += amountRs;
    shift.expectedDrawerCashRs = Math.max(0, shift.expectedDrawerCashRs - amountRs);
    this.saveShifts(shifts);

    const entries = this.loadDrawerEntries();
    const newEntry: PosShiftDrawerEntry = {
      id: `entry-out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shiftId,
      type: 'CASH_OUT',
      amountRs,
      reason: reason.trim() || 'Petty Cash Expense',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedBy: recordedBy || shift.cashierName,
    };
    entries.unshift(newEntry);
    this.saveDrawerEntries(entries);

    return shift;
  }

  async recordSale(
    shiftId: string,
    paymentMethod: PaymentMethod,
    netSalesRs: number,
    splitDetails?: SplitPaymentDetails
  ): Promise<PosShift> {
    const shifts = this.loadShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) {
      throw new Error(`Shift ${shiftId} not found.`);
    }
    if (shift.status !== 'OPEN') {
      throw new Error(`Cannot record sale to a closed shift.`);
    }

    if (paymentMethod === 'CASH') {
      shift.totalCashSalesRs += netSalesRs;
      shift.expectedDrawerCashRs += netSalesRs;
    } else if (paymentMethod === 'CARD') {
      shift.totalCardSalesRs += netSalesRs;
    } else if (paymentMethod === 'BANK_TRANSFER') {
      shift.totalBankTransferSalesRs += netSalesRs;
    } else if (paymentMethod === 'SPLIT') {
      const cash = splitDetails?.cashAmountRs || 0;
      const card = splitDetails?.cardAmountRs || 0;
      const transfer = splitDetails?.bankTransferAmountRs || 0;
      shift.totalCashSalesRs += cash;
      shift.expectedDrawerCashRs += cash;
      shift.totalCardSalesRs += card;
      shift.totalBankTransferSalesRs += transfer;
    }

    this.saveShifts(shifts);
    return shift;
  }

  closeShiftSync(shiftId: string, actualDrawerCashRs: number): PosShift {
    const shifts = this.loadShifts();
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) {
      throw new Error(`Shift ${shiftId} not found.`);
    }

    shift.actualDrawerCashRs = actualDrawerCashRs;
    shift.varianceRs = actualDrawerCashRs - shift.expectedDrawerCashRs;
    shift.closedAt = new Date().toISOString();
    shift.status = 'CLOSED';

    this.saveShifts(shifts);
    return shift;
  }

  async closeShift(shiftId: string, actualDrawerCashRs: number): Promise<PosShift> {
    return this.closeShiftSync(shiftId, actualDrawerCashRs);
  }

  async getShiftDrawerEntries(shiftId: string): Promise<PosShiftDrawerEntry[]> {
    const entries = this.loadDrawerEntries();
    return entries.filter((e) => e.shiftId === shiftId);
  }

  async resetToDefaults(): Promise<void> {
    this.saveShifts([JSON.parse(JSON.stringify(INITIAL_SHIFT_SEED))]);
    this.saveDrawerEntries([]);
  }
}

export const posShiftRepository = new MockPosShiftRepository();
