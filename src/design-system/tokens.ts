/**
 * 500 Labs — Antigravity Workshop & POS Master System
 * Global Design Tokens Definition (Central Management)
 *
 * Single Source of Truth for:
 * - Porcelain & Chalk Layering surfaces
 * - Obsidian structural anchors & Terracotta primary actions
 * - Tonal semantic pastels (Emerald, Amber, Cobalt, Crimson)
 * - Concentric corner radii (Inner = Outer - Padding)
 * - Micro-hairline borders and multi-layered diffused elevation
 * - Tabular numerals and Swiss editorial typography
 */

export const DESIGN_TOKENS = {
  surfaces: {
    canvas: '#F6F8FA', // Atmospheric cool chalk backdrop
    canvasWarm: '#F9F8F6', // Warm porcelain alternative
    surfacePrimary: '#FFFFFF', // Elevated cards, tables, POS drawers
    surfaceSubtle: '#F8FAFC', // Vehicle intake header, inactive tabs
    tableHeaderWarm: '#FFF7ED', // Warm sand table column header
    tableHeaderCool: '#F8FAFC', // Crisp slate table column header
    adminProfitTint: '#F0FDF4', // Subtle emerald tint for internal cost columns
    adminWarningTint: '#FFFBEB', // Subtle amber tint for cost alert columns
    overlayScrim: 'rgba(15, 23, 42, 0.45)', // Frosted acrylic modal backdrop
  },
  brand: {
    terracotta: '#F95700', // Vibrant Terracotta primary CTA
    terracottaHover: '#EA580C', // Deep Burnt Coral hover
    terracottaLight: '#FFF7ED', // Soft coral active pill background
    obsidian: '#0F172A', // Obsidian structural anchor & dark KPI card
    obsidianHover: '#1E293B', // Slate 800 hover
    obsidianSurface: '#18181B', // Dark neutral charcoal
  },
  semantic: {
    emerald: {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#047857',
      solid: '#10B981',
      label: 'Completed / Paid / Optimal Margin',
    },
    amber: {
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#B45309',
      solid: '#F59E0B',
      label: 'Waiting Parts / Pending Insurance / Warning',
    },
    cobalt: {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1D4ED8',
      solid: '#3B82F6',
      label: 'In Progress / Active Workshop Bay',
    },
    crimson: {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#B91C1C',
      solid: '#EF4444',
      label: 'Cancelled / Overdue / Negative Margin',
    },
    neutral: {
      bg: '#F8FAFC',
      border: '#E2E8F0',
      text: '#475569',
      solid: '#64748B',
      label: 'Draft / Unassigned / Inactive',
    },
    quotation: {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1E40AF',
      solid: '#2563EB',
      label: 'Quotation',
    },
    estimate: {
      bg: '#EEF2FF',
      border: '#C7D2FE',
      text: '#3730A3',
      solid: '#4F46E5',
      label: 'Insurance Estimate',
    },
    jobCard: {
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#92400E',
      solid: '#D97706',
      label: 'Workshop Job Card',
    },
    invoice: {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#065F46',
      solid: '#059669',
      label: 'Tax Invoice',
    },
  },
  borders: {
    hairline: 'rgba(15, 23, 42, 0.08)',
    hairlineSubtle: 'rgba(15, 23, 42, 0.05)',
    hairlineDark: 'rgba(255, 255, 255, 0.12)',
    focus: '#F95700',
    focusRing: 'rgba(249, 87, 0, 0.18)',
    printHairline: '#1E293B',
  },
  radii: {
    pill: '9999px',
    control: '10px', // 0.625rem for buttons, inputs, steppers
    card: '16px', // 1.0rem for KPI cards, tables, sections
    modal: '22px', // 1.375rem for dialogs and sheets
    controlInner: '6px', // Concentric inner radius
  },
  shadows: {
    card: '0 2px 10px -2px rgba(15, 23, 42, 0.03), 0 12px 32px -4px rgba(15, 23, 42, 0.02)',
    elevated: '0 8px 30px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
    modal: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    innerHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  },
  typography: {
    fontSans: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: '"JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, monospace',
    tabularNums: 'tabular-nums',
  },
  animation: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
    spring: '350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  print: {
    a4Width: '210mm',
    a4Height: '297mm',
    thermalWidth: '80mm',
    thermalCssWidth: '302px',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
  density: {
    compact: {
      tableRowHeight: '40px',
      cellPaddingY: '6px',
      cellPaddingX: '10px',
      inputHeight: '34px',
      buttonHeight: '32px',
      badgeHeight: '20px',
    },
    standard: {
      tableRowHeight: '48px',
      cellPaddingY: '10px',
      cellPaddingX: '14px',
      inputHeight: '40px',
      buttonHeight: '38px',
      badgeHeight: '22px',
    },
    comfortable: {
      tableRowHeight: '56px',
      cellPaddingY: '14px',
      cellPaddingX: '16px',
      inputHeight: '44px',
      buttonHeight: '42px',
      badgeHeight: '26px',
    },
  },
  interaction: {
    hoverTint: 'rgba(15, 23, 42, 0.04)',
    focusRing: '0 0 0 3px rgba(249, 87, 0, 0.15)',
    activeScale: 0.98,
    disabledOpacity: 0.45,
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
