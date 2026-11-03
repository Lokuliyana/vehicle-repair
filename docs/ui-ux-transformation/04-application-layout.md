# Global Application Layout Transformation Specification

**Document ID:** `TRANSFORMATION-04-APPLICATION-LAYOUT`  
**System:** Antigravity Workshop & POS ERP System (Enterprise UI/UX Modernization)  
**Phase:** Phase 04 — Global Application Layout Transformation  
**Date:** November 2026  
**Status:** Canonical Enterprise Layout Architecture & App Shell Modernization Finalized  

---

## 1. Executive Summary & Design Vision

Phase 04 transforms the layout foundation of the Antigravity Workshop & POS ERP into a unified, coherent enterprise shell. Prior to Phase 04, individual views suffered from inconsistent outer margins, double-padded card containers, ad-hoc header heights, and visual crowding in the top navigation bar.

Through Phase 04, the application adheres to seven canonical layout patterns built on top of a centralized `PageContainer` foundation, an acrylic 64px global header, and a collapsible, structured navigation rail.

### Core Architectural Principles
1. **Holistic Shell Consistency:**  
   Every route shares the same responsive viewport ergonomics, acrylic top header bar, and structured navigation rail.
2. **Preventing Nested Layout Blowouts:**  
   `PageContainer` uses a React Context (`PageContainerContext`) to automatically detect if it is nested within another container, suppressing redundant outer padding and margin doubling.
3. **Canonical Page Layout Archetypes:**  
   Rather than forcing every screen into a single generic layout, seven specialized layout wrappers (`StandardLayout`, `FinanceLayout`, `DashboardLayout`, `DocumentLayout`, `POSLayout`, `BoardLayout`, `CatalogLayout`) provide tailor-made slots, grids, and viewport height management.
4. **Desktop, Tablet, and Mobile Adaptive Scale:**  
   Predictable horizontal padding (16px on mobile, 24px on tablet, 32px on desktop) and vertical spacing (24px to 32px) ensure optical harmony across viewports.

---

## 2. Global Shell Metrics & Visual Hierarchy

```
+------------------------------------------------------------------------------------+
|  Global Top Header (h-16 / 64px, bg-white/95, backdrop-blur-md, border-b)          |
|  [Mobile Menu] [Breadcrumbs Trail]       [⌘K Omnibox]       [Shift] [Cost Lock] [Role] |
+--------------+---------------------------------------------------------------------+
| Sidebar Rail | Active Page Viewport (Flex-1, overflow-y-auto, bg-canvas)            |
| (Expanded:   |                                                                     |
|  240-256px   |  +---------------------------------------------------------------+  |
|  Collapsed:  |  | PageContainer (max-w-7xl or max-w-[1600px], px-4/6/8, py-6/8)  |  |
|  68px)       |  |                                                               |  |
|              |  |   PageHeader / Status Badges / Primary Actions                |  |
| - Switcher   |  |   FilterToolbar / Search Omnibox / Status Tabs                |  |
| - Groups     |  |   Main Data Surface (DataTable / Kanban / Document Sections)   |  |
| - Checklist  |  |                                                               |  |
| - User Card  |  +---------------------------------------------------------------+  |
| - Collapse   |                                                                     |
+--------------+---------------------------------------------------------------------+
```

### 2.1 Metric Standards Table

| Element | Mobile (< 768px) | Tablet (768px – 1024px) | Desktop (> 1024px) |
| :--- | :--- | :--- | :--- |
| **Global Header Height** | `64px` (`h-16`) | `64px` (`h-16`) | `64px` (`h-16`) |
| **Global Header Blur** | `backdrop-blur-md` | `backdrop-blur-md` | `backdrop-blur-md` |
| **Sidebar Width** | Modal Drawer (`256px`) | Collapsed (`68px`) or Expanded (`240px`) | Expanded (`240px`–`256px`) or Collapsed (`68px`) |
| **PageContainer Padding X** | `16px` (`px-4`) | `24px` (`px-6`) | `32px` (`px-8`) |
| **PageContainer Padding Y** | `24px` (`py-6`) | `28px` (`py-7`) | `32px` (`py-8`) |
| **Standard Container Max Width** | `100%` | `100%` | `1280px` (`max-w-7xl`) |
| **Wide Container Max Width** | `100%` | `100%` | `1600px` (`max-w-[1600px]`) |
| **POS Cart Drawer Width** | Bottom drawer / full | `360px` fixed | `380px`–`420px` fixed |

---

## 3. Sidebar Navigation System (`Sidebar.tsx`)

The modern sidebar provides structured, functional categorization with dual-state operation (expanded vs collapsed) and persistent user role switching compatibility.

### 3.1 Sidebar Operating States
- **Expanded Mode (`w-60` to `w-64` / 240px–256px):**
  - Displays full company identity via `WorkshopBayStoreSwitcher` ("500 Labs — Main Workshop", active bay status).
  - Categorized under 10px uppercase section titles (`WORKSHOP`, `COUNTER POS`, `CATALOG`, `FINANCE & REPORTS`).
  - Nav items render 16px icon with 1.75 stroke width, title, and lock badge for restricted routes.
  - Setup checklist progress widget (`SetupChecklistSidebarWidget`).
  - Full user account profile with role badge (`UserAccountFooterCard`).
- **Collapsed Mode (`w-[68px]` / 68px):**
  - Shows compact centered "500" square logo badge.
  - Nav items display centered 16px icons with `title` tooltip attributes.
  - Section headers convert to subtle 1px dividers with screen-reader labels.
  - Compact setup progress strip and avatar-only user card.
  - Expand toggle trigger button (`data-testid="sidebar-collapse-toggle"`).
- **Mobile Drawer Mode (`w-64` in full-screen backdrop):**
  - Triggered by header hamburger menu (`mobile-menu-trigger`).
  - Esc key and backdrop click dismissal.
  - Always renders in full expanded view for touch ergonomics.

### 3.2 Visual Invariants & Token Mapping
- **Active Route:** `bg-[#FFF7ED]` (design token `--color-primary-light`) and `bg-[#FFF3ED]` with `text-[#F95700]` text and icon.
- **Hover State:** `hover:bg-slate-100/70 hover:text-slate-900`.
- **Restricted Route:** `text-slate-400 hover:text-slate-600 hover:bg-slate-100/60` with lock icon.
- **Icon Sizing:** Strictly `size={16}` and `strokeWidth={1.75}` across all items.

---

## 4. Top Navigation Redesign (`Header.tsx`)

The top global navigation bar standardizes application height and contextualizes primary and secondary global tools.

### 4.1 Key Header Components
1. **Height & Material:**  
   Height is standardized to `h-16` (64px) with `bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6`.
2. **Dynamic Breadcrumbs (`BreadcrumbHierarchyTrail`):**  
   Dynamically derives route ancestry based on `location.pathname`, providing clickable parent route anchors and current page bolding.
3. **Spotlight Omnibox (`⌘K`):**  
   - Global keyboard trigger (`⌘K` on Mac, `Ctrl+K` on Windows/Linux).
   - Instant search across vehicle license plates (`WP CAB-4521`), job sheet numbers (`JOB-2026-0042`), catalog SKUs (`PRT-TOY-BMP-F`), and application routes.
   - Arrow key navigation (`↑`, `↓`), `Enter` execution, and `Escape` window dismissal.
4. **Shift & Register Status:**  
   Visual register indicator (`Shift Open` / `Shift Closed`) with emerald pulse indicator, clicking navigates to the POS terminal.
5. **Cost Privacy Gate (`ToggleLockPrivacyButton`):**  
   Management padlock toggle (`data-testid="header-cost-mode-toggle"`). Only rendered for authorized management roles (`OWNER`, `WORKSHOP_MANAGER`). Unmounting or locking instantly redacts cost and margin metrics across the entire application.
6. **Perspective Role Switcher:**  
   Clickable `RolePerspectiveBadge` directly mounted on canvas in the top header for instant role cycling, accompanied by `sidebar-role-select` and `role-switcher-select` for programmatic test compatibility.

---

## 5. PageContainer Foundation (`src/components/layouts/PageContainer.tsx`)

`PageContainer` provides the structural shell for all individual views.

### 5.1 TypeScript Contract

```typescript
export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'standard' | 'wide' | 'full' | 'narrow' | 'compact';
  padding?: 'standard' | 'tight' | 'loose' | 'none';
  spacing?: 'standard' | 'tight' | 'loose' | 'none';
  fullHeight?: boolean;
  preventNestedPadding?: boolean;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}
```

### 5.2 Max Width Variants
- `standard`: `max-w-7xl mx-auto` (1280px) — Standard operations (Jobs, Repair Sheets, Settings).
- `wide`: `max-w-[1600px] mx-auto` (1600px) — Multi-column ledgers and analytics grids (Profit Ledger, Expenses).
- `full`: `w-full max-w-full` — Fluid full-width canvases (Kanban Board, Counter POS).
- `narrow`: `max-w-4xl mx-auto` (896px) — Focused single-column documents or forms.
- `compact`: `max-w-5xl mx-auto` (1024px) — Diagnostic and audit views.

### 5.3 Anti-Nesting Mechanism
Nested page containers automatically detect parent context via `PageContainerContext`:
```typescript
const isInsideParentContainer = useContext(PageContainerContext);
const effectivePadding = preventNestedPadding && isInsideParentContainer ? 'p-0' : PADDING_MAP[padding];
const effectiveMaxWidth = preventNestedPadding && isInsideParentContainer ? 'w-full' : MAX_WIDTH_MAP[maxWidth];
```
This guarantees that nesting a child component that uses `PageContainer` inside a layout wrapper will never double-pad the screen.

---

## 6. Canonical Specialized Layout Wrappers

### 6.1 `StandardLayout`
- **Purpose:** Standard operational workspaces (Workshop Jobs, Catalog List, Shop Expenses).
- **Slots:** `title`, `subtitle`, `breadcrumbs`, `actions`, `stats`, `filterBar`, `children`.
- **Default Max Width:** `standard` (`max-w-7xl`).

### 6.2 `FinanceLayout`
- **Purpose:** High-density accounting and gross margin ledgers (Profit Ledger, Shop Expenses).
- **Slots:** `title`, `subtitle`, `periodSelector`, `kpiStrip`, `filterBar`, `actions`, `children`.
- **Default Max Width:** `wide` (`max-w-[1600px]`).
- **Typography:** Enforces `tabular-nums` and monospace alignment for financial ledgers.

### 6.3 `DashboardLayout`
- **Purpose:** Role-based executive summaries and operational dashboards (RoleDashboardPage, ReportsPage).
- **Slots:** `title`, `subtitle`, `actions`, `banner`, `kpiGrid`, `chartGrid`, `children`.
- **Default Max Width:** `wide` (`max-w-[1600px]`).
- **Grid Structure:** Responsive 4-column KPI cards and 2-column balanced chart containers.

### 6.4 `DocumentLayout`
- **Purpose:** Structured business invoices and repair sheets (RepairSheetPage, WorkshopInvoicePage).
- **Slots:** `documentHeader`, `metaSummary`, `children`, `stickyFooter`.
- **Default Max Width:** `standard` (`max-w-7xl`).
- **Ergonomics:** Includes sticky action footer slot with `pb-28` safe area padding. Print-safe with automatic screen-only isolation.

### 6.5 `POSLayout`
- **Purpose:** High-speed point-of-sale touch terminal (PosTerminalPage).
- **Slots:** `topBar`, `catalogPane`, `cartPane`, `bottomSummary`.
- **Default Max Width:** `full` (100% viewport height `h-[calc(100vh-4rem)]`).
- **Workspace Split:** 65% catalog item grid / 35% persistent cart drawer (min 340px, max 420px).

### 6.6 `BoardLayout`
- **Purpose:** Workshop floor Kanban board with horizontal status lanes (WorkshopBoardPage).
- **Slots:** `boardHeader`, `children`.
- **Default Max Width:** `full` (100% viewport height).
- **Horizontal Lane Scroll:** Sticky header with `overflow-x-auto` horizontal lanes and independent vertical scroll per swimlane.

### 6.7 `CatalogLayout`
- **Purpose:** Central parts, lubricants, and labor catalog browser (CatalogListPage).
- **Slots:** `title`, `subtitle`, `categoryRibbon`, `filterSidebar`, `actions`, `children`.
- **Default Max Width:** `wide` (`max-w-[1600px]`).
- **Structure:** Category pills ribbon with persistent/collapsible filter sidebar.

---

## 7. Verification & Test Suite

All 494 tests across 27 test suites pass with 0 failures and 0 TypeScript compilation errors:
- **`tests/phase04-application-layout.test.tsx` (19 tests):**  
  Verifies sidebar expanded/collapsed modes, toggle triggers, icon stroke & sizing, tooltip attributes, header 64px metrics, dynamic breadcrumbs, `PageContainer` padding and anti-nesting behavior, and all 7 canonical layout wrappers.
- **`tests/navigation-shell.test.tsx` (38 tests):**  
  Full regression verification of desktop sidebar, mobile drawer, cost toggle privacy enforcement, Spotlight search omnibox, and role dashboard routing.
- **Full Test Suite:**  
  494 passed tests across 27 test files, 100% test isolation, strict role privacy compliance.
