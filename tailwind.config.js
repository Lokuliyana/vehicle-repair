/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 214.3 31.8% 91.4%))",
        input: "hsl(var(--input, 214.3 31.8% 91.4%))",
        ring: "hsl(var(--ring, 222.2 84% 4.9%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222.2 84% 4.9%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 222.2 47.4% 11.2%))",
          foreground: "hsl(var(--primary-foreground, 210 40% 98%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 210 40% 96.1%))",
          foreground: "hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%))",
          foreground: "hsl(var(--destructive-foreground, 210 40% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 210 40% 96.1%))",
          foreground: "hsl(var(--muted-foreground, 215.4 16.3% 46.9%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 210 40% 96.1%))",
          foreground: "hsl(var(--accent-foreground, 222.2 47.4% 11.2%))",
        },
        // 500 Labs Luxury Global Design Tokens
        canvas: {
          DEFAULT: "var(--bg-canvas, #F6F8FA)",
          warm: "var(--bg-canvas-warm, #F9F8F6)",
        },
        surface: {
          DEFAULT: "var(--bg-surface-primary, #FFFFFF)",
          subtle: "var(--bg-surface-subtle, #F8FAFC)",
          warm: "var(--bg-table-header, #FFF7ED)",
        },
        brand: {
          terracotta: "var(--brand-terracotta, #F95700)",
          "terracotta-hover": "var(--brand-terracotta-hover, #EA580C)",
          obsidian: "var(--brand-obsidian, #0F172A)",
        },
        admin: {
          "profit-tint": "var(--admin-profit-tint, #F0FDF4)",
        },
        hairline: "var(--border-hairline, rgba(15, 23, 42, 0.08))",
        // Canonical Enterprise Tokens
        app: {
          bg: "var(--color-app-bg, #F6F8FA)",
          "bg-warm": "var(--color-app-bg-warm, #F9F8F6)",
        },
        token: {
          primary: "var(--color-primary, #F95700)",
          "primary-hover": "var(--color-primary-hover, #EA580C)",
          border: "var(--color-border, rgba(15, 23, 42, 0.08))",
          "border-strong": "var(--color-border-strong, rgba(15, 23, 42, 0.16))",
          "text-primary": "var(--color-text-primary, #0F172A)",
          "text-secondary": "var(--color-text-secondary, #475569)",
          "text-muted": "var(--color-text-muted, #94A3B8)",
          success: "var(--color-success, #059669)",
          warning: "var(--color-warning, #D97706)",
          danger: "var(--color-danger, #DC2626)",
          info: "var(--color-info, #2563EB)",
        },
      },
      borderRadius: {
        control: "10px",
        "control-inner": "6px",
        card: "16px",
        modal: "22px",
        pill: "9999px",
      },
      boxShadow: {
        luxury: "0 2px 10px -2px rgba(15, 23, 42, 0.03), 0 12px 32px -4px rgba(15, 23, 42, 0.02)",
        "luxury-elevated": "0 8px 30px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
}
