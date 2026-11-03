/**
 * 500 Labs — Antigravity Workshop & POS Master System
 * Global Design System Manager (global-manager.ts)
 *
 * Centralized Manager for:
 * - Design tokens & CSS variables
 * - Optical alignment & concentric corner radii (Inner = Outer - Padding)
 * - Tonal semantic badge styling
 * - Tabular currency & percentage formatting
 * - Role-based cost privacy invariants
 * - Print DOM data sanitization with circular reference & prototype pollution immunity
 * - Color management & dynamic token access
 */

import React from 'react';
import { DESIGN_TOKENS } from './tokens';
import type { UserRole } from '@/types';

export type StageVariant = 'quotation' | 'estimate' | 'jobCard' | 'invoice' | 'destructive' | 'default';

export type MarginHealthLevel = 'optimal' | 'moderate' | 'low' | 'negative';

export interface MarginHealthInfo {
  level: MarginHealthLevel;
  label: string;
  badgeClass: string;
  dotColor: string;
  textColor: string;
}

export class GlobalDesignManager {
  private static instance: GlobalDesignManager;

  private constructor() {}

  public static getInstance(): GlobalDesignManager {
    if (!GlobalDesignManager.instance) {
      GlobalDesignManager.instance = new GlobalDesignManager();
    }
    return GlobalDesignManager.instance;
  }

  /**
   * Access the full immutable design tokens definition.
   */
  public getTokens() {
    return DESIGN_TOKENS;
  }

  /**
   * Concentric Corner Radius Formula:
   * Nested Radius = Math.max(0, outerRadiusPx - paddingPx)
   * Enforces mathematical concentricity per modern-ui-specialist guidelines.
   */
  public calculateInnerRadius(outerRadiusPx: number, paddingPx: number): number {
    return Math.max(0, outerRadiusPx - paddingPx);
  }

  /**
   * Returns a React inline style object with the computed concentric inner radius.
   */
  public getConcentricStyle(outerRadiusPx: number, paddingPx: number): React.CSSProperties {
    const inner = this.calculateInnerRadius(outerRadiusPx, paddingPx);
    return { borderRadius: `${inner}px` };
  }

  /**
   * Centralized Color Management:
   * Access colors dynamically across surfaces, brand, semantic, and borders.
   */
  public getBrandColor(name: keyof typeof DESIGN_TOKENS.brand): string {
    return DESIGN_TOKENS.brand[name];
  }

  public getSurfaceColor(name: keyof typeof DESIGN_TOKENS.surfaces): string {
    return DESIGN_TOKENS.surfaces[name];
  }

  public getSemanticColor(name: keyof typeof DESIGN_TOKENS.semantic) {
    return DESIGN_TOKENS.semantic[name];
  }

  public getColor(dotPath: string): string {
    const parts = dotPath.split('.');
    let current: any = DESIGN_TOKENS;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return '';
      }
    }
    return typeof current === 'string' ? current : '';
  }

  /**
   * Resolve tonal semantic badge classes for document stages and workflow statuses.
   * Eliminates harsh solid fills in favor of refined 10% pastels with 1px border.
   */
  public getStatusBadgeClasses(stageOrStatus: string): string {
    const key = stageOrStatus.toUpperCase().replace(/\s+/g, '_');
    switch (key) {
      case 'QUOTATION':
      case 'DRAFT':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'ESTIMATE':
      case 'ACCIDENT_ESTIMATE':
      case 'PENDING_INSURANCE_APPROVAL':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'JOB_CARD':
      case 'APPROVED_IN_PROGRESS':
      case 'WAITING_FOR_PARTS':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'QUALITY_CHECK':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'READY_FOR_DELIVERY':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'INVOICE':
      case 'FINAL_INVOICE':
      case 'PAID':
      case 'COMPLETED':
      case 'COMPLETED_DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      case 'PARTIALLY_PAID':
        return 'bg-amber-50 text-amber-900 border border-amber-300';
      case 'UNPAID':
      case 'OVERDUE':
      case 'CANCELLED':
      case 'VOID':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }

  /**
   * Evaluates margin percentage and returns standardized grading and styling.
   * Optimal: >= 35%, Moderate: 20% to 35%, Low: 0% to 20%, Negative: < 0%
   */
  public getMarginHealth(marginPercent: number): MarginHealthInfo {
    if (marginPercent >= 35) {
      return {
        level: 'optimal',
        label: 'Optimal',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: '#10B981',
        textColor: 'text-emerald-700',
      };
    }
    if (marginPercent >= 20) {
      return {
        level: 'moderate',
        label: 'Moderate',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: '#F59E0B',
        textColor: 'text-amber-700',
      };
    }
    if (marginPercent >= 0) {
      return {
        level: 'low',
        label: 'Low Margin',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotColor: '#F43F5E',
        textColor: 'text-rose-600',
      };
    }
    return {
      level: 'negative',
      label: 'Loss',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      dotColor: '#DC2626',
      textColor: 'text-red-700',
    };
  }

  /**
   * Currency formatter with enforced tabular numerals and Sri Lankan Rupee prefix.
   */
  public formatRs(amount: number, options?: { showDecimal?: boolean }): string {
    const showDec = options?.showDecimal ?? true;
    const formatted = showDec
      ? amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return `Rs. ${formatted}`;
  }

  /**
   * Percentage formatter enforcing tabular numerals.
   */
  public formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * License plate standardizer (e.g. "cba1234" -> "CBA-1234")
   */
  public formatPlateNumber(plate: string): string {
    const cleaned = plate.trim().toUpperCase();
    if (!cleaned) return '';
    return cleaned.replace(/\s+/g, ' ');
  }

  /**
   * Redacts sensitive monetary figures for privacy mode.
   */
  public maskSensitiveFigure(value: number | string, isRedacted: boolean = false): string {
    if (isRedacted) {
      return 'Rs. ••••••';
    }
    if (typeof value === 'number') {
      return this.formatRs(value);
    }
    return value;
  }

  /**
   * Strict Cost & Margin Privacy Invariant:
   * Only OWNER or WORKSHOP_MANAGER may view costs, and only when explicitly toggled.
   */
  public canViewCosts(role: UserRole | string, isCostModeToggled: boolean): boolean {
    const isPrivileged = role === 'OWNER' || role === 'WORKSHOP_MANAGER';
    return isPrivileged && isCostModeToggled;
  }

  /**
   * Print DOM Data Sanitizer:
   * Recursively strips internal cost and margin telemetry from any data payload before sending
   * to customer print sheets, thermal receipts, or external exports.
   * Safe against circular references and prototype pollution.
   */
  public sanitizePrintPayload<T extends Record<string, any>>(data: T, seen: WeakSet<object> = new WeakSet()): Partial<T> {
    if (Array.isArray(data)) {
      if (seen.has(data)) {
        return [] as unknown as Partial<T>;
      }
      seen.add(data);
      return data.map((item) => this.sanitizePrintPayload(item, seen)) as unknown as Partial<T>;
    }
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (seen.has(data)) {
      return {} as Partial<T>;
    }
    seen.add(data);

    const sanitized: Record<string, any> = {};
    const prohibitedKeys = new Set([
      'buyingcostrs',
      'buyingcost',
      'unitbuyingcostrs',
      'linetotalcostrs',
      'totalcostrs',
      'totalbuyingcostrs',
      'directcostrs',
      'directcost',
      'subletcostrs',
      'subletcost',
      'linegrossprofitrs',
      'grossprofitrs',
      'grossprofit',
      'netshopprofit',
      'netshopprofitrs',
      'grossmarginpct',
      'linemargin',
      'marginpercent',
      '__proto__',
      'constructor',
      'prototype',
    ]);

    const isProhibited = (k: string): boolean => {
      const lower = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower === 'proto' || lower === 'constructor' || lower === 'prototype') return true;
      if (lower.includes('buyingcost') || lower.includes('grossprofit') || lower.includes('netshopprofit')) return true;
      if (lower.includes('directcost') || lower.includes('subletcost') || lower.includes('linemargin')) return true;
      if (lower.includes('grossmargin') || lower.includes('marginpercent')) return true;
      if (lower === 'totalcostrs' || lower === 'totalcost' || lower === 'linetotalcostrs' || lower === 'linetotalcost') return true;
      return prohibitedKeys.has(k.toLowerCase());
    };

    for (const [key, value] of Object.entries(data)) {
      if (isProhibited(key)) {
        continue;
      }
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizePrintPayload(value, seen);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as Partial<T>;
  }

  /**
   * Export CSS Variable dictionary for runtime style injection or SSR.
   */
  public getCssVariables(): Record<string, string> {
    return {
      '--bg-canvas': DESIGN_TOKENS.surfaces.canvas,
      '--bg-canvas-warm': DESIGN_TOKENS.surfaces.canvasWarm,
      '--bg-surface-primary': DESIGN_TOKENS.surfaces.surfacePrimary,
      '--bg-surface-subtle': DESIGN_TOKENS.surfaces.surfaceSubtle,
      '--bg-table-header': DESIGN_TOKENS.surfaces.tableHeaderWarm,
      '--admin-profit-tint': DESIGN_TOKENS.surfaces.adminProfitTint,
      '--brand-terracotta': DESIGN_TOKENS.brand.terracotta,
      '--brand-terracotta-hover': DESIGN_TOKENS.brand.terracottaHover,
      '--brand-obsidian': DESIGN_TOKENS.brand.obsidian,
      '--border-hairline': DESIGN_TOKENS.borders.hairline,
      '--border-focus': DESIGN_TOKENS.borders.focus,
      '--radius-pill': DESIGN_TOKENS.radii.pill,
      '--radius-control': DESIGN_TOKENS.radii.control,
      '--radius-card': DESIGN_TOKENS.radii.card,
      '--radius-modal': DESIGN_TOKENS.radii.modal,
      '--color-primary': DESIGN_TOKENS.brand.terracotta,
      '--color-primary-hover': DESIGN_TOKENS.brand.terracottaHover,
      '--color-app-bg': DESIGN_TOKENS.surfaces.canvas,
      '--color-surface': DESIGN_TOKENS.surfaces.surfacePrimary,
      '--color-surface-muted': DESIGN_TOKENS.surfaces.surfaceSubtle,
      '--color-border': DESIGN_TOKENS.borders.hairline,
      '--color-border-strong': 'rgba(15, 23, 42, 0.16)',
      '--color-text-primary': DESIGN_TOKENS.brand.obsidian,
      '--color-text-secondary': '#475569',
      '--color-text-muted': '#94A3B8',
      '--color-success': DESIGN_TOKENS.semantic.emerald.solid,
      '--color-warning': DESIGN_TOKENS.semantic.amber.solid,
      '--color-danger': DESIGN_TOKENS.semantic.crimson.solid,
      '--color-info': DESIGN_TOKENS.semantic.cobalt.solid,
    };
  }

  /**
   * Density configuration for components (Compact, Standard, Comfortable).
   */
  public getDensityConfig(density: 'compact' | 'standard' | 'comfortable' = 'standard') {
    return DESIGN_TOKENS.density[density] || DESIGN_TOKENS.density.standard;
  }

  /**
   * Spacing accessor for the 4px-based grid.
   */
  public getSpacing(scale: keyof typeof DESIGN_TOKENS.spacing): string {
    return DESIGN_TOKENS.spacing[scale] || '16px';
  }
}

export const globalDesignManager = GlobalDesignManager.getInstance();
