import { PosCartLine } from '../types';

export interface PosHeldCart {
  id: string;
  customer: string;
  phone?: string;
  vehicleNo?: string;
  items: PosCartLine[];
  overallDiscountRs: number;
  totalRs: number;
  time: string;
  createdAt: number;
}

const STORAGE_KEY = 'antigravity_pos_held_carts_v1';

export const posHeldCartsManager = {
  getAll(): PosHeldCart[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart: Omit<PosHeldCart, 'id' | 'createdAt' | 'time'>): PosHeldCart {
    const all = this.getAll();
    const now = new Date();
    const newCart: PosHeldCart = {
      ...cart,
      id: `HELD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    };
    const updated = [newCart, ...all];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newCart;
  },

  removeCart(id: string): void {
    const all = this.getAll().filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  },

  clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
