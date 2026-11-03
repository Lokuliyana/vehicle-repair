# 500 Labs — Antigravity Workshop & POS ERP
## Ultra-Luxury & High-Velocity UI/UX Transformation Master Plan
**Stack:** React + Vite + TypeScript | Tailwind CSS | shadcn/ui | NestJS | PostgreSQL  
**Design Paradigm:** Swiss Editorial Precision, Porcelain & Chalk Layering, Zero-Latency Keyboard Ergonomics, & Strict Cost Privacy

---

## 1. Executive Visual Philosophy: The "Luxury & Modern" Architecture

To elevate the Antigravity Vehicle Repair, Collision Estimation & Spare Parts POS System beyond generic administrative software into a flagship enterprise operating system (inspired by **Confidency OS**, **CommerceOS**, **Bonfol/Velvet**, and **RestroBit**), the design system enforces five core visual laws:

### 1.1 Porcelain & Chalk Surface Layering
* **Canvas Backdrop:** Abandon stark `#FFFFFF` or dreary `#E5E7EB` backgrounds. The base application canvas utilizes an atmospheric cool chalk (`#F6F8FA` / `hsl(210, 20%, 97.5%)`) or warm porcelain (`#F9F8F6`).
* **Elevated Containers:** Cards, tables, POS drawers, and sheets sit on pure crisp white (`#FFFFFF`) framed by razor-sharp **micro-hairline borders** (`1px solid rgba(15, 23, 42, 0.06)`) and ultra-diffused ambient elevation (`0 2px 10px -2px rgba(15, 23, 42, 0.03), 0 12px 32px -4px rgba(15, 23, 42, 0.02)`).
* **Glassmorphic Scrims:** Modal overlays, command palettes (`⌘K`), and slide-over drawers use frosted acrylic backdrops (`backdrop-filter: blur(12px)`, `background: rgba(15, 23, 42, 0.25)`).

### 1.2 Swiss Editorial Typography & Optical Numerals
* **Primary Sans Font:** **Plus Jakarta Sans** or **Inter Display** for UI headers and body copy (`letter-spacing: -0.015em` for headings, `-0.03em` for large hero KPI figures).
* **Monospace & Tabular Precision:** **JetBrains Mono** or `font-variant-numeric: tabular-nums` enforced across all license plates (`CBA-1234`), chassis numbers, SKUs, monetary columns (`Rs. 145,000.00`), quantities, and margin percentages so decimals align vertically to the pixel.

### 1.3 Single-Chroma Focal Allocation
* **Obsidian Structural Anchor (`#0F172A`):** Primary text, active table headers, and executive dark KPI cards.
* **Terracotta / Burnt Coral Accent (`#F95700` to `#EA580C`):** Reserved strictly for high-conversion primary actions (`+ New Repair Sheet`, `Complete POS Sale`, active filter pills, and peak chart bars).
* **Tonal Semantic Pastels:** Status badges never use loud solid fills. They pair a `10%` translucent pastel background with a `1px` `20%` border and deep saturated typography:
  * *Emerald (Completed / Paid / High Margin):* Bg `#ECFDF5`, Border `#A7F3D0`, Text `#047857`
  * *Amber (Waiting Parts / Pending Insurance):* Bg `#FFFBEB`, Border `#FDE68A`, Text `#B45309`
  * *Cobalt (In Progress / Workshop Bay Active):* Bg `#EFF6FF`, Border `#BFDBFE`, Text `#1D4ED8`
  * *Crimson (Cancelled / Overdue / Negative Margin):* Bg `#FEF2F2`, Border `#FECACA`, Text `#B91C1C`

### 1.4 Zero-CRM & High-Speed Keyboard Ergonomics
* Every form table and sheet is engineered for **100% keyboard-only throughput**. Pressing `Enter` in the final column of any repair section (`Labor - Remove & Reassemble`, `Labor - Repair`, `Replacement`) immediately appends a new numbered line item and focuses the description input in `<16ms`.

---

## 2. Design Token Specification (`tailwind.config.ts` & CSS Variables)

| Token Category | Token Name | CSS / Hex Value | Usage Context |
| :--- | :--- | :--- | :--- |
| **Surface** | `--bg-canvas` | `#F6F8FA` | App shell background behind main workspace |
| **Surface** | `--bg-surface-primary` | `#FFFFFF` | Cards, data tables, repair sheets, POS cart |
| **Surface** | `--bg-surface-subtle` | `#F8FAFC` | 12-field vehicle intake header, inactive tabs |
| **Surface** | `--bg-table-header` | `#FFF7ED` / `#F8FAFC` | Warm sand or crisp slate table column header row |
| **Brand** | `--brand-terracotta` | `#F95700` | Primary CTAs, active pills, hero bar chart highlight |
| **Brand** | `--brand-obsidian` | `#0F172A` | Secondary executive CTAs (`KOT / Job Print`), active KPI card |
| **Admin Privacy** | `--admin-profit-tint` | `#F0FDF4` | Subtle emerald background tint for hidden Buying Cost/Margin columns |
| **Border** | `--border-hairline` | `rgba(15, 23, 42, 0.06)` | Default card, input, and table cell dividers |
| **Border** | `--border-focus` | `#F95700` + `ring-orange-500/15` | Active keyboard focus ring across all inputs and rows |
| **Radius** | `--radius-pill` | `9999px` | Status badges, category filter tabs, hotkey chips |
| **Radius** | `--radius-control` | `10px` (`0.625rem`) | Buttons, text inputs, select triggers, numpad keys |
| **Radius** | `--radius-card` | `16px` (`1rem`) | KPI cards, catalog tiles, repair section wrappers |
| **Radius** | `--radius-modal` | `22px` (`1.375rem`) | Floating dialogs, payment numpad modals, drawers |

---

## 3. Master Inventory: 210 Luxury UI Components & Upgrade Blueprint

Below is the complete catalog of **210 distinct components** across 12 architectural domains, detailing exact instructions to transform default `shadcn/ui` primitives into a bespoke luxury design system.

### Category A: Action Triggers, Buttons & Micro-Controls (Components 1–20)
1. **`ButtonPrimaryLuxury`**: Solid `#F95700` fill, subtle top inner highlight (`inset 0 1px 0 rgba(255,255,255,0.25)`), `10px` radius, `active:scale-[0.98]` tactile compression.
2. **`ButtonObsidianExecutive`**: Deep `#0F172A` charcoal surface with crisp white text for stage conversions (`Convert to Job Card`, `Convert to Invoice`).
3. **`ButtonSecondaryHairline`**: Pure `#FFFFFF` background, `1px solid rgba(15,23,42,0.08)` border, subtle shadow, hovers to `#F8FAFC`.
4. **`ButtonGhostMinimal`**: Borderless slate text trigger that illuminates with a `rgba(15,23,42,0.04)` pill background on hover.
5. **`ButtonDestructiveSoft`**: Translucent `#FEF2F2` background with `#DC2626` label and trash icon; shifts to solid crimson only on hold/confirm.
6. **`ButtonSuccessEmerald`**: Solid `#059669` trigger used exclusively for final financial settlement (`Complete Payment & Print`).
7. **`ButtonIconSquare`**: `38px × 38px` rounded-lg container with centered `18px` Lucide stroke icon (`1.75px` stroke weight) and instant tooltip.
8. **`ButtonCircleQuickAdd`**: `32px × 32px` circular `#F95700` button positioned at the bottom-right of POS product cards with a crisp `+` glyph.
9. **`SplitActionDropdownButton`**: Primary action button fused with a right-hand chevron trigger (e.g., `Print A4 Invoice` | `v Print 80mm Thermal`).
10. **`SegmentedPillSwitcher`**: Sliding framer-motion pill background inside a `#F1F5F9` track for switching `Quotation` vs `Accident Estimate`.
11. **`FloatingActionQuickIntake`**: Tablet/mobile floating pill at bottom-right for instant floor vehicle intake.
12. **`HotKeyKbdChip`**: Monospaced micro-badge (`⌘K`, `Enter ↵`, `F2`, `Esc`) rendered inside buttons and inputs with `#F1F5F9` fill and `1px` bottom bevel.
13. **`ClipboardCopyChip`**: Clickable vehicle plate or invoice number tag that morphs its copy icon into an emerald checkmark with haptic scale.
14. **`AiAssistActionPill`**: Shimmering subtle gradient border pill (`✨ Auto-Fill Specs`) for smart catalog or history suggestions.
15. **`HoldToConfirmButton`**: Press-and-hold radial fill button for high-risk actions (`Void Invoice`, `Reopen Closed Shift`) to prevent accidental clicks.
16. **`ToggleLockPrivacyButton`**: Executive header switch with padlock icon that reveals/hides Buying Cost and Gross Profit across the active screen.
17. **`WhatsAppBrandTrigger`**: Refined emerald-tinted outline button with official WhatsApp vector glyph and pre-formatted message preview tooltip.
18. **`PrintActionTrigger`**: Action button with live print-preview status dot (`A4 Ready` / `80mm Thermal Ready`).
19. **`PaginationPillButton`**: Square `34px` numeric page selector where active page takes a solid `#F95700` or `#0F172A` fill.
20. **`CollapseChevronButton`**: Smooth `180deg` rotating micro-button for expanding/collapsing repair tables and vehicle history rows.

### Category B: Precision Form Inputs, Selectors & Field Primitives (Components 21–45)
21. **`InputLuxuryText`**: `40px` height, `#FFFFFF` background, hairline `#E2E8F0` border, smooth `ring-4 ring-orange-500/10` focus glow.
22. **`InputFloatingLabel`**: Compact input where label smoothly scales to `10px` uppercase slate tracking upon focus or value entry.
23. **`InputTabularNumber`**: Right-aligned numeric field enforcing `tabular-nums` and blocking non-numeric keystrokes.
24. **`InputCurrencyRs`**: Fixed `Rs.` prefix badge in muted slate on the left, live thousand-separator formatting (`145,000.00`), and decimal auto-pad.
25. **`InputPercentageMargin`**: Numeric input with `%` suffix badge and color-coded text (turns crimson if margin drops below threshold, emerald if healthy).
26. **`SearchInputGlobalCommand`**: Header omnibox with magnifying glass, placeholder cycling, and right-aligned `⌘K` badge.
27. **`SearchInputTableLocal`**: Compact `36px` filter search bar with instant `×` clear button and result count indicator (`14 matches`).
28. **`TextareaAutoGrow`**: Seamless multi-line field for customer address and repair remarks that expands vertically without scrollbars.
29. **`SelectLuxuryPopover`**: Custom radix select trigger with soft shadow dropdown, checkmark indicator, and keyboard type-ahead.
30. **`ComboboxVirtualized`**: High-speed searchable dropdown capable of rendering 5,000+ spare parts and labor presets at 60fps.
31. **`MultiSelectTagInput`**: Input field that converts selected repair natures (`Accident`, `Mechanical`, `Auto Paint`) into dismissible tonal pills.
32. **`CheckboxRoundedLuxury`**: `18px × 18px` `rounded-[5px]` checkbox with smooth SVG stroke-dashoffset checkmark animation.
33. **`RadioCardGroup`**: Selectable elevated cards with radio indicators for choosing payment modes or document templates.
34. **`SwitchiOSTactile`**: Smooth `44px × 24px` pill toggle switch used in pricing rules, catalog active states, and admin cost visibility.
35. **`SliderDiscountRange`**: Tactile range slider with live floating percentage tooltip for applying invoice or line-item discounts.
36. **`InputQuantityStepper`**: Integrated `[-]` `[ 2 ]` `[+]` pill control for POS cart rows and spare part quantities.
37. **`PhoneInputSriLanka`**: Formatted phone field (`07X XXX XXXX`) with automatic WhatsApp click-to-chat validation badge.
38. **`InlineCellTextInput`**: Borderless table cell input that looks like static typography until hovered or focused via `Tab`/`Enter`.
39. **`InlineCellCurrencyInput`**: Zero-chrome monetary cell input inside Repair Line Tables for ultra-fast price and buying cost entry.
40. **`FileDropzoneDashed`**: Luxury dashed container (`border-dashed border-slate-200 bg-slate-50/50`) with coral upload glyph for damage photos or expense receipts.
41. **`ImagePreviewThumbnailCard`**: Uploaded vehicle or part photo container with hover zoom lightbox and delete action.
42. **`FormFieldValidationWrapper`**: Standardized wrapper rendering label, required asterisk, input slot, and animated micro-error message below.
43. **`ReadOnlyLockedField`**: Subtle striped or slate-tinted input displaying auto-generated sequential IDs (`JOB-2026-0001`) with a lock glyph.
44. **`PasswordPinMaskInput`**: 4-digit or 6-digit segmented PIN input for manager discount overrides on the POS screen.
45. **`UnitOfMeasureSelector`**: Compact inline suffix selector (`Nos`, `Liters`, `Sets`, `Hours`, `Panels`) fused to the quantity input.

### Category C: Date, Time & Turnaround Scheduling Controls (Components 46–57)
46. **`DatePickerSingleLuxury`**: Popover calendar with clean typography, rounded day cells, and "Today / Yesterday" quick footer buttons.
47. **`DateRangePickerAnalytics`**: Dual-month calendar popover with left-hand preset sidebar (`Today`, `Last 7 Days`, `This Month`, `Quarter to Date`, `Custom`).
48. **`CompletionDaysCounterInput`**: Specialized workshop header input (`No of Days Completion: [ 5 Days ]`) that calculates and displays the target delivery date badge.
49. **`TimeSlotPickerPopover`**: 15-minute interval time selector for scheduling vehicle intake and delivery handovers.
50. **`AgingDurationBadge`**: Live calculated pill showing how many days a job or insurance claim has been open (`12 Days Aging` in amber/crimson).
51. **`ShiftDurationTimer`**: Live ticking header clock showing elapsed POS register shift time (`Shift Open: 06h 42m`).
52. **`MonthYearQuickSwitcher`**: Compact `< Nov 2026 >` pill bar for cycling monthly profit ledgers and expense logs.
53. **`TimestampRelativeCell`**: Table cell displaying `Today, 09:36 AM` with hover tooltip revealing exact ISO timestamp and actor.
54. **`DeliveryCountdownBar`**: Visual horizontal bar on Job Cards showing remaining promised repair days vs. elapsed days.
55. **`FiscalQuarterSelector`**: Segmented quarter picker (`Q1`, `Q2`, `Q3`, `Q4`) for executive financial reporting.
56. **`ManufacturingYearPicker`**: Streamlined 4-digit year grid (`1990–2026`) for fast `Year of Make` selection on the vehicle header.
57. **`AuditTimelineDateHeader`**: Sticky date separator pill (`Monday, Nov 2, 2026`) inside vertical audit logs and activity drawers.

### Category D: Navigation, App Shell & Workspace Layout (Components 58–75)
58. **`AppShellMasterLayout`**: Fixed left navigation rail + sticky top utility bar + scrollable `#F6F8FA` main workspace canvas.
59. **`SidebarNavigationRail`**: `248px` (collapsible to `68px` icon rail) pure white sidebar with `1px` right hairline border and grouped section labels (`WORKSHOP`, `COUNTER POS`, `CATALOG`, `FINANCE`).
60. **`SidebarNavLinkItem`**: Navigation row with `20px` icon, medium label, active soft coral tint (`#FFF7ED`) or obsidian pill, and right-aligned live counter badge.
61. **`SidebarNestedAccordion`**: Expandable sub-menu (e.g., `Workshop` -> `All Sheets`, `Floor Board`, `Invoices`) with vertical guide hairline.
62. **`WorkshopBayStoreSwitcher`**: Top-left sidebar dropdown card displaying workshop logo, active branch (`500 Labs — Main Workshop`), and operational status dot.
63. **`GlobalTopHeaderBar`**: `64px` height translucent sticky header (`bg-white/80 backdrop-blur-md`) housing breadcrumbs, global search, quick CTAs, and role switcher.
64. **`BreadcrumbHierarchyTrail`**: Clean slash-separated route path (`Workshop` / `Accident Estimates` / `JOB-2026-0042`) with hover links.
65. **`RolePerspectiveBadge`**: Top-right interactive pill showing active role (`Owner/Director`, `Workshop Manager`, `Service Advisor`, `Cashier`, `Technician`) with instant demo role-switching support.
66. **`QuickLaunchHeaderActions`**: Persistent top-right button pair: `[+ New Repair Sheet]` (Terracotta) and `[Open Counter POS]` (Obsidian).
67. **`PageHeaderBanner`**: Standardized screen title block with `24px` bold heading, muted subtitle, and right-aligned utility toolbar (`Export CSV`, `Print`).
68. **`StickyBottomActionFooter`**: Elevated floating glass bar at the bottom of long forms (`Repair Sheet`, `Add Catalog Item`) housing totals and `Save / Convert` actions.
69. **`SplitPaneWorkspace`**: Resizable or fixed two-column layout (`65%` Catalog Grid / `35%` Persistent POS Cart Drawer).
70. **`TabbedWorkspaceHeader`**: Clean horizontal underline tab bar (`Menu Editing`, `Print Preview`, `Audit Trail`) with animated active indicator.
71. **`CommandPaletteModal (`⌘K`)`**: Universal Spotlight-style overlay allowing staff to jump to any vehicle plate, job number, SKU, or route in 2 keystrokes.
72. **`KeyboardShortcutsHelpBar`**: Subtle footer strip displaying contextual hotkeys (`[Enter] Add Row` • `[⌘P] Print A4` • `[⌘M] Toggle Cost Mode`).
73. **`UserAccountFooterCard`**: Bottom-left sidebar profile card showing avatar, staff name, role badge, and shift/logout menu trigger.
74. **`FullScreenPOSModeToggle`**: Header icon button that collapses the main ERP sidebar to maximize touch screen real estate for the Counter POS.
75. **`SetupChecklistSidebarWidget`**: Bonfol-inspired lower-sidebar onboarding card (`Workshop Setup: 6/7 steps complete`) with slim coral progress bar.

### Category E: High-Density Data Tables, Ledgers & Filter Bars (Components 76–100)
76. **`LuxuryDataTableWrapper`**: Rounded `16px` white card container with `1px` hairline border, zero internal vertical gridlines, and horizontal scroll shadow indicators.
77. **`DataTableWarmHeaderRow`**: Distinct header row styled in warm sand (`#FFF7ED`) or cool slate (`#F8FAFC`) with `11px` uppercase semibold tracking labels.
78. **`SortableColumnHeader`**: Interactive column header button with dual up/down micro-chevrons indicating active ascending/descending sort.
79. **`DataTableInteractiveRow`**: `52px` height row with smooth `#F8FAFC` hover state, keyboard focus ring, and optional double-click to open.
80. **`TableRowSelectionCheckbox`**: Left-most column checkbox supporting shift-click range selection and header select-all.
81. **`FloatingBulkActionBar`**: Obsidian floating pill bar at the bottom of the screen when multiple rows are checked (`3 Jobs Selected` | `[Export PDF]` `[Update Status]`).
82. **`TableStatusFilterPills`**: Horizontal bar of pill tabs above tables (`All 246`, `Quotation 42`, `Estimate 18`, `Job Card 31`, `Invoiced 155`) with embedded counts.
83. **`MultiFacetFilterDropdownBar`**: CommerceOS-style inline filter strip (`Date Range v`, `Nature of Repair v`, `Insurance Co v`, `Payment Status v`, `+ More Filters`).
84. **`ActiveFilterDismissibleChip`**: Pill tag showing applied filter (`Insurance: Ceylinco VIP ×`) with a `Clear All` link.
85. **`TablePrimaryIdentityCell`**: Stacked two-line cell pairing bold primary ID (`#JOB-2026-0042` in cobalt/obsidian) with muted timestamp (`Today, 10:15 AM`).
86. **`TableVehicleBadgeCell`**: Renders license plate inside a realistic miniature rectangular plate frame (`CBA-1234`) alongside `Make / Model` subtitle.
87. **`TableFinancialAmountCell`**: Right-aligned tabular currency cell with optional secondary sub-label (`Paid: Rs. 50,000` / `Due: Rs. 20,000`).
88. **`TableMarginSparkBarCell`**: Confidency OS-inspired cell combining margin percentage (`42.8%`) with a `48px` horizontal color-coded progress bar.
89. **`TableDeltaTrendChip`**: Compact directional pill (`↑ +12.4%` in emerald or `↓ -3.1%` in crimson) comparing against last period.
90. **`TableRowQuickActionsMenu`**: Right-aligned `•••` ghost button opening a clean popover (`Open Sheet`, `Convert Stage`, `Print A4`, `Share WhatsApp`, `Audit Log`).
91. **`ExpandableSubRowLedger`**: Accordion table row that expands inline to show the 3-section repair summary or payment installment history without leaving the list.
92. **`DraggableLineItemHandle`**: Six-dot grip icon (`⋮⋮`) on the left of Repair Sheet rows allowing estimators to reorder items via drag-and-drop or `Alt+Up/Down`.
93. **`DataTableFooterPagination`**: Bottom bar displaying `Showing 1–10 of 164 records`, rows-per-page selector (`10 / 25 / 50`), and page number pills.
94. **`ColumnVisibilityTogglePopover`**: Dropdown menu allowing managers to toggle optional table columns (`Chassis No`, `Insurance`, `Buying Cost`, `Gross Profit`).
95. **`CsvExcelExportButton`**: Secondary header button with download icon that exports the currently filtered table view (strictly stripping hidden cost columns for non-admins).
96. **`EmptyTableStateCard`**: Centered minimalist illustration with contextual message (`No Accident Estimates match "CBA-9999"`) and a `[+ Create New Sheet]` CTA.
97. **`TableSkeletonLoaderRows`**: 8-row shimmer skeleton matching exact column widths during repository fetch states.
98. **`PinnedSummaryFooterRow`**: Sticky bottom table row displaying live column sums (`Total Revenue`, `Total Direct Cost`, `Total Gross Profit`).
99. **`AttentionAlertBannerStrip`**: CommerceOS-style horizontal strip above the orders table (`Needs Attention:` `[! 4 Waiting Parts > 7 Days]` `[! 6 Unpaid Insurance Claims]`).
100. **`InlineRowQuickEditPopover`**: Click-to-edit mini popover for updating a part's stock quantity or selling price directly from the `/catalog` table.

### Category F: Cards, KPI Metrics & Executive Data Visualizations (Components 101–122)
101. **`HeroKpiCardObsidian`**: Poital.flow-inspired dark charcoal (`#18181B`) primary KPI card with white display numerals, circular icon badge, and emerald trend delta.
102. **`PastelTintedKpiCard`**: Soft pastel surface card (mint `#ECFDF5`, blush `#FFF1F2`, or ice blue `#F0F9FF`) for secondary top-level metrics.
103. **`MinimalistHairlineKpiStrip`**: Bonfol/D.CC-inspired unified 4-column or 5-column white metric ribbon separated by vertical `1px` hairline dividers.
104. **`KpiCardWithStatusDot`**: CommerceOS-style white metric card with a colored status dot (`● Total Jobs`, `● In Progress`, `● Ready`) and active blue/coral selection border.
105. **`SmoothedBezierAreaChart`**: Dual-series area chart (`Gross Revenue` vs. `Gross Profit`) with vertical gradient fill and smooth cubic-bezier interpolation.
106. **`HeroHighlightBarChart`**: Bonfol-inspired bar histogram where the active/peak date bar renders in solid `#F95700` coral with a floating dark tooltip badge, while adjacent bars remain soft peach (`#FFEDD5`).
107. **`GroupedComparisonBarChart`**: Poital.flow-inspired dual bar chart (`Workshop Sales` vs. `Counter POS Sales` by month) with `6px` rounded top caps.
108. **`MultiSegmentDonutChart`**: High-radius rounded stroke donut chart (`90%` or `Rs. 2.84M Total`) centered inside a clean card with a bottom percentage legend.
109. **`DarkFloatingChartTooltip`**: High-contrast `#0F172A` floating tooltip chip displaying date header, color dots, exact rupee values, and `+5.6%` badge.
110. **`PopularPartsRankedListCard`**: Right-hand dashboard card listing top-selling parts/lubricants with miniature square thumbnails, order count, and revenue generated.
111. **`TechnicianEfficiencyScorecard`**: Card displaying mechanic avatar, completed job count, average turnaround days, and on-time percentage bar.
112. **`InsuranceReceivablesAgingCard`**: Visual breakdown bar and list showing pending claim amounts across `0–15 Days`, `16–30 Days`, and `30+ Days Overdue`.
113. **`DailyCashFlowWaterfallCard`**: Compact visual summary bridging `Gross Sales` -> `Less Discounts` -> `Less Direct Costs` -> `Less Shop Expenses` = `Net Shop Profit`.
114. **`LowStockAlertTickerCard`**: Dashboard widget highlighting catalog items below their `Low Stock Alert Level` with one-click restock note tags.
115. **`WorkshopBayUtilizationGauge`**: Visual meter showing how many physical repair bays are currently occupied vs. available.
116. **`ChartPeriodDropdownSelector`**: Compact `2026 v` or `Monthly v` pill selector in the top-right corner of chart cards.
117. **`SparklineMicroTrend`**: `64px × 24px` inline SVG trend line embedded inside compact KPI tiles.
118. **`ConversionFunnelMetricBar`**: Horizontal segmented bar showing conversion ratio from `Quotations` -> `Approved Job Cards` -> `Paid Invoices`.
119. **`AverageTicketValueCard`**: Metric tile comparing average revenue per Workshop Invoice vs. average Counter POS basket size.
120. **`LaborVsPartsRatioBar`**: Dual-color horizontal split bar comparing high-margin Labor revenue against Spare Parts revenue.
121. **`InteractiveChartLegend`**: Clickable pill legend items (`● Labor` `● Parts` `● POS`) that toggle chart series visibility on click.
122. **`MetricComparisonTooltip`**: Hover popover on any KPI card explaining the exact formula (e.g., `Gross Profit = Net Sales - Part Buying Costs - Sublet Costs`).

### Category G: Overlays, Modals, Slide-Over Drawers & Notifications (Components 123–140)
123. **`LuxuryModalDialog`**: Centered `rounded-[22px]` white dialog over a blurred dark scrim with smooth spring entrance animation.
124. **`WizardStepperModal`**: ERP-inspired modal with a top horizontal step indicator (`① Details` — `② Split Billing` — `③ Payment` — `④ Print`).
125. **`SlideOverDrawerRight`**: Full-height right-edge sheet (`480px` or `640px` width) for inspecting job history, audit logs, or editing catalog items without losing table scroll position.
126. **`StageConversionConfirmDialog`**: High-clarity confirmation modal when converting `Estimate -> Job Card` or `Job Card -> Invoice`, summarizing line totals and snapshot rules.
127. **`CostPrivacyWarningModal`**: Security prompt if an admin attempts to export a screen view while `Admin Cost Mode` is toggled on, confirming that customer exports remain 100% cost-redacted.
128. **`ToastNotificationStack`**: Bottom-right or top-right floating toast cards (`Saved Job #JOB-2026-0042`, `Added 2x Mobil 1 to Cart`) with undo action support.
129. **`DestructiveActionAlertModal`**: Modal requiring a mandatory reason comment before voiding an invoice or cancelling an active Job Card.
130. **`VehicleHistoryLookupPopover`**: Non-blocking floating card that appears below the `Vehicle Number` input when a known plate (`CBA-1234`) is typed, offering `[One-Click Auto-Fill Specs & Customer]`.
131. **`CatalogQuickCreateModal`**: Lightweight modal triggered from inside a Repair Sheet or POS screen to save a new part to the master catalog without leaving the active transaction.
132. **`ImageLightboxModal`**: Full-screen zoomable viewer for inspecting vehicle collision photos or supplier part invoices.
133. **`WhatsAppSharePreviewDialog`**: Modal displaying the exact formatted text summary (Vehicle, Job No, Total Amount, Workshop Contact) and a `[Download A4 PDF & Open WhatsApp]` CTA.
134. **`AuditTrailTimelineDrawer`**: Slide-over drawer rendering chronological state transitions (`QUOTATION -> ESTIMATE -> JOB_CARD`), actor names, timestamps, and override notes.
135. **`KeyboardShortcutsCheatSheetModal`**: Press `?` anywhere outside an input to view a categorized grid of all workshop and POS keyboard shortcuts.
136. **`SessionLockPinOverlay`**: Blurred screen lock overlay for the POS terminal allowing cashiers to step away and unlock with a quick 4-digit PIN.
137. **`UnsavedChangesGuardDialog`**: Intercept modal warning the estimator if they attempt to navigate away from a modified Repair Sheet without saving.
138. **`SubletCostEntryPopover`**: Inline popover on a `Labor - Repair` row to record external lathe, tinkering, or radiator shop sublet costs and vendor names.
139. **`SupplementaryEstimateAlertBanner`**: Prominent top banner on an active Job Card indicating supplementary parts/labor added after initial insurance stripping.
140. **`MobileBottomActionDrawer`**: Responsive touch sheet for technicians updating Job Card task checkboxes on smartphones or workshop tablets.

### Category H: Workshop Document Engine & 3-Section Repair Sheet (Components 141–165)
*Strictly mapped to the authoritative Accident Repair Quotation & Estimate templates and Section 7 & 9 rules.*

141. **`WorkshopDocumentStageBanner`**: Top document control bar displaying live stage pill (`QUOTATION`, `ACCIDENT ESTIMATE`, `WORKSHOP JOB CARD`, `FINAL INVOICE`) and sequential conversion CTA.
142. **`VehicleHeader12FieldMatrix`**: Exact 7-row, 12-field structured card matching the source template:
    * *Row 1:* `Date` | `Job Number (e.g., JOB-2026-0001)`
    * *Row 2:* `Vehicle Number (e.g., CBA-1234)` | `Nature of Repair (Accident, Mechanical, Electrical, Scanning, Tinkering, Auto Paint)`
    * *Row 3:* `Vehicle Make` | `Chassis Number`
    * *Row 4:* `Vehicle Model` | `No of Days Completion`
    * *Row 5:* `Year of Make` | `Vehicle Color`
    * *Row 6 (Full Width):* `Name of Insurance`
    * *Row 7 (Full Width):* `Customer Information (Name, Phone Number, Address typed directly)`
143. **`SmartPlateAutocompleteInput`**: Specialized license plate input with Sri Lankan formatting (`WP CBA-1234`, `CAR-8821`, `300-1234`) that queries past jobs non-blockingly while allowing 100% freeform typing.
144. **`NatureOfRepairSelector`**: Multi-tag or quick-pill selector for `Accident`, `Mechanical`, `Electrical`, `Scanning`, `Tinkering`, `Auto Paint`.
145. **`InsuranceAssessorAutocomplete`**: Freeform input for `Name of Insurance` with instant suggestions (`Sri Lanka Insurance`, `Ceylinco VIP`, `Fairfirst`, `Allianz`, `Janashakthi`, `LOLC`) + optional Assessor Name/Phone note.
146. **`ZeroCrmCustomerBlock`**: Full-width Row 7 input trio (`Customer Name`, `Phone Number`, `Address`) stored directly on the document record with zero mandatory CRM registration friction.
147. **`RepairSectionTableGroup`**: Reusable master table component instantiated exactly 3 times per sheet:
    * **Section 1:** `Labor - Remove & Reassemble`
    * **Section 2:** `Labor - Repair`
    * **Section 3:** `Replacement` (Spare Parts & Materials)
148. **`HybridCatalogOrFreeformCell`**: Description input inside each repair row that supports both **100% manual typing** (for custom collision work like *"Pull & align front RHS chassis rail"*) AND **Catalog Autocomplete** (pressing `/` or typing a part name to pull preset price and hidden buying cost).
149. **`RepairLineAutoNumberCell`**: Sequential row index (`01`, `02`, `03`) that automatically re-indexes when rows are inserted or deleted.
150. **`AdminInlineBuyingCostCell`**: Conditionally rendered column (`Buying Cost Rs.`) visible ONLY when `Admin Cost & Profit Mode` is active and user role is `Owner/Director` or `Workshop Manager`.
151. **`AdminInlineRowProfitBadge`**: Live per-row badge (`+Rs. 4,500 | 38%`) showing immediate line profitability next to the selling price in Admin Mode.
152. **`SectionSubtotalFooterBar`**: Clean right-aligned bar at the bottom of each of the 3 sections (`Subtotal Labor - Remove & Reassemble: Rs. 18,500.00`).
153. **`SupplementaryLineItemBadge`**: Distinct `SUPPLEMENTARY` amber tag attached to rows added after the original Estimate was converted to a Job Card.
154. **`OriginalEstimateSnapshotDrawer`**: Side-by-side comparison viewer showing the immutable original Estimate snapshot vs. current Job Card/Invoice with supplementary additions.
155. **`InsuranceSplitBillingCalculator`**: Dedicated invoice settlement module calculating:
    $$\text{Customer Balance Due} = \text{Grand Total} - \text{Discounts} + \text{Tax} - \text{Advance Paid} - \text{Insurance Approved Payable}$$
156. **`AdvancePaymentReceiptRecorder`**: Widget on the Estimate/Job Card/Invoice to log customer advance deposits (`Advance Paid Rs.`) with date and payment method.
157. **`TechnicianTaskAssignmentRow`**: In `Job Card` mode, replaces monetary columns with `Assigned Technician`, `Task Status Checkbox`, and `Waiting for Parts` flag.
158. **`FloorStatusStepperBar`**: Interactive 6-stage operational status bar (`DRAFT` -> `PENDING_INSURANCE_APPROVAL` -> `APPROVED_IN_PROGRESS` -> `WAITING_FOR_PARTS` -> `QUALITY_CHECK` -> `READY_FOR_DELIVERY` -> `COMPLETED_DELIVERED`).
159. **`QualityCheckSignoffCard`**: Checklist block required before transitioning a Job Card to `READY_FOR_DELIVERY` (Test drive, torque check, panel cleaning, old parts returned).
160. **`VehicleVisualDamageAnnotator`**: Optional interactive top/side vehicle silhouette where advisors can click to drop pins indicating dent, scratch, or replacement zones.
161. **`QuickPresetBundleInjector`**: One-click dropdown (`+ Insert Service Preset`) to populate standard multi-row packages (e.g., *Full Periodic Oil & Filter Service*, *Front Bumper Collision Strip & Paint*).
162. **`PartConditionTagSelector`**: Inline pill on `Replacement` rows to specify part source (`Brand New Genuine`, `OEM / Aftermarket`, `Reconditioned / Used`, `Customer Supplied`).
163. **`TaxAndDiscountSummaryBlock`**: Configurable calculation block supporting flat Rupee discount or `%` discount and optional tax calculations before final invoice total.
164. **`PaymentCollectionHistoryList`**: Ledger inside the Invoice view showing all partial payments collected (Customer Advance, Customer Final Excess, Insurance Settlement Cheque).
165. **`DocumentQuickCloneButton`**: Action to duplicate an existing Quotation into a new sheet or convert a Quotation directly into a formal Insurance Estimate.

### Category I: Counter / Showroom POS & Register Shift Components (Components 166–184)
*Inspired by RestroBit's high-speed POS catalog, right-hand cart drawer, and touch numpad modal.*

166. **`PosBarcodeScannerStatusPill`**: Live header indicator (`🟢 Barcode Scanner Ready`) that captures rapid hardware USB/Bluetooth HID keystrokes anywhere on the `/pos` screen and adds matching SKUs instantly.
167. **`PosCategoryFilterRibbon`**: Horizontal pill bar (`Show All`, `Engine Oils & Lubricants`, `Filters`, `Brake Pads`, `Batteries`, `Wipers & Bulbs`, `Quick Counter Services`) with solid `#F95700` active state.
168. **`PosProductTouchCard`**: RestroBit-inspired white card (`14px` radius) displaying isolated product image/icon, bold item title, vehicle compatibility tag, stock count pill, `#F95700` price, and circular `+` button.
169. **`PosOnTheFlyCustomItemBar`**: Quick inline input row at the top of the POS cart allowing the cashier to type a custom unlisted item description, Selling Price, and optional Buying Cost on the fly.
170. **`PosWalkInCustomerHeader`**: Optional single-line bar at the top of the POS cart (`Customer Name / Phone` and `Vehicle No`) defaulting cleanly to `Walk-in Counter Sale` with zero blocking modals.
171. **`PosCartItemCard`**: Elevated item row inside the right-hand cart drawer showing `Unit Price × Qty = Line Total` in coral (`Rs. 9,500 × 2 = Rs. 19,000`), `[-]` `[2]` `[+]` stepper, inline `Discount` pill, and red trash icon.
172. **`PosCartFinancialSummary`**: Clean bottom ledger showing `Subtotal`, `Product Discount`, `Extra Discount`, and bold `Net Total: Rs. 45,000.00`.
173. **`PosPrimaryActionGrid`**: RestroBit-inspired 3-button bottom action matrix:
    * `[Hold / Save Draft]` (Secondary outline)
    * `[Complete & Thermal Print]` (Vibrant Emerald `#10B981`)
    * `[Collect Payment (Space)]` (Vibrant Terracotta `#F95700`)
174. **`PosCollectPaymentModal`**: RestroBit-inspired centered luxury payment modal featuring `Order #` and total in top-right coral text, `Full Payment` vs `Split Tender` pills, and payment method tiles (`Cash`, `Card`, `Bank Transfer / QR`).
175. **`PosQuickCashPresetPills`**: Row of 4 smart cash denomination chips (`Rs. 1,000`, `Rs. 2,000`, `Rs. 5,000`, `Exact Cash`) above the numpad for single-tap tendering.
176. **`PosTouchNumericKeypad`**: `3 × 4` large-format tactile keypad (`1–9`, `.`, `0`, `⌫`) inside the payment modal for touch-screen or mouse operation.
177. **`PosChangeDueBanner`**: High-contrast banner inside the payment modal displaying `Total Bill`, `Amount Tendered`, and large emerald `Balance / Change to Return: Rs. 500.00`.
178. **`PosSplitTenderAllocator`**: Interface inside the payment modal to split a single counter bill across multiple methods (e.g., `Rs. 10,000 Cash` + `Rs. 14,500 Card`).
179. **`PosShiftOpenModal`**: Start-of-day dialog prompting the cashier to enter the `Opening Cash Float (Rs.)` and shift notes before unlocking the POS register.
180. **`PosPettyCashOutDrawer`**: Quick modal accessible from the POS header to record minor garage cash-outs (`Tea/Refreshments`, `Urgent Nut & Bolt Purchase`, `Courier Fee`, `Three-Wheeler Hire`) directly from the cash drawer.
181. **`PosShiftReconciliationSheet`**: End-of-shift closing screen comparing `Opening Float + Cash Sales - Cash Refunds - Petty Cash Out` against `Physical Counted Cash`, highlighting any shortage or overage.
182. **`PosHeldBillsDrawer`**: Slide-over list of parked/draft counter carts allowing a cashier to pause a customer's bill while they check a part on their vehicle and resume in one click.
183. **`PosRecentReceiptsDrawer`**: Quick lookup list of today's completed POS sales to reprint an 80mm receipt or process an authorized return/void.
184. **`PosLowStockWarningBadge`**: Subtle amber pill (`Only 2 left`) rendered directly on POS product cards when stock is running low.

### Category J: Embedded Finance, Gross Profit & Privacy Guard Components (Components 185–197)
*Enforcing the strict rule that Buying Costs and Gross Profit are computed on every transaction but strictly hidden from unauthorized staff and all customer printouts.*

185. **`RolePermissionGateWrapper`**: Declarative React security boundary (`<RequirePermission role={['OWNER', 'MANAGER']}>`) that completely strips Buying Cost and Margin DOM nodes for Cashiers, Service Advisors, and Technicians.
186. **`LiveGrossProfitRibbon`**: Sticky bottom or top executive telemetry strip on Repair Sheets and POS screens displaying:
    $$\text{Gross Sales} \longrightarrow \text{Net Revenue} \longrightarrow \text{Total Direct Cost (Parts + Labor)} \longrightarrow \text{Gross Profit (Rs.)} \longrightarrow \text{Gross Margin \%}$$
187. **`MarginHealthTrafficLight`**: Visual indicator pill that grades a document's overall margin (`🟢 Optimal > 35%`, `🟡 Moderate 20–35%`, `🔴 Low Margin < 20%`).
188. **`UnenteredBuyingCostAlertPill`**: Warning badge visible to Managers (`⚠️ 2 Replacement parts have Rs. 0 Buying Cost recorded`) so gross profit isn't artificially inflated by missing cost entries.
189. **`UnifiedProfitLedgerTable`**: Master financial table combining both `Workshop Invoices` and `Counter POS Sales` into a single chronological revenue, cost, and profit stream.
190. **`DailyShopExpenseEntryForm`**: Streamlined register for logging daily garage overheads (`Workshop Rent`, `CEB Electricity`, `Water`, `Welding Gas / Consumables`, `External Sublet Bills`).
191. **`NetShopProfitSummaryCard`**: Executive formula card displaying:
    $$\text{Net Shop Profit} = \text{Total Gross Profit (Workshop + POS)} - \text{Daily Garage Expenses}$$
192. **`InsuranceVsCustomerReceivableSplitBar`**: Financial bar showing how much unpaid revenue is owed by Insurance Companies vs. individual vehicle owners.
193. **`PriceOverrideAuditPrompt`**: Inline modal triggered when a staff member discounts an item below its catalog `Default Discount %` or below `Buying Cost`, requiring manager authorization.
194. **`HistoricalSnapshotIntegrityBadge`**: Visual lock indicator on completed Invoices confirming that Selling Prices and Buying Costs are frozen snapshots unaffected by future `/catalog` edits.
195. **`ProfitByCategoryBreakdownCard`**: Analytical card splitting Gross Profit across `Labor - R&R`, `Labor - Repair`, `Workshop Spare Parts`, `POS Lubricants`, and `POS Spare Parts`.
196. **`RedactedCipherPlaceholder`**: When an Owner toggles "Privacy Blur Mode" on a shared monitor, replaces sensitive profit figures with `Rs. ••••••` until hovered.
197. **`PrintDomPrivacySanitizer`**: Automated wrapper component that guarantees `buyingCost`, `grossProfit`, and `marginPercent` props cannot be passed into any `@media print` component tree.

### Category K: A4 Workshop Document Print & 80mm Thermal Receipt Abstractions (Components 198–210)
*Strictly isolated print-only layouts verified against the uploaded Workshop Quotation/Estimate templates and 80mm POS receipt standards.*

198. **`A4PrintCanvasContainer`**: Dedicated `@media print` wrapper formatted to exact `210mm × 297mm` A4 geometry with crisp black-on-white typography, hiding all web sidebars, buttons, and admin cost columns.
199. **`A4WorkshopServiceHeaderBanner`**: Exact top service category strip matching the uploaded templates (`MECHANICAL | ELECTRICAL | SCANNING | TINKERING | AUTO PAINT | SPARE PARTS`).
200. **`A4WorkshopBrandTitleBlock`**: Centered or structured workshop title header with company name, address, hotlines, and prominent document title (`ACCIDENT REPAIR QUOTATION`, `ACCIDENT REPAIR ESTIMATE`, `WORKSHOP JOB CARD`, or `TAX INVOICE`).
201. **`A4Vehicle12FieldPrintGrid`**: Bordered 2-column tabular header reproducing the exact 7-row layout (`Date | Job No`, `Vehicle No | Nature of Repair`, `Make | Chassis No`, `Model | No of Days Completion`, `Year | Color`, `Name of Insurance`, `Customer Information`).
202. **`A4ThreeSectionPrintTable`**: High-contrast bordered print table rendering `1. Labor - Remove & Reassemble`, `2. Labor - Repair`, and `3. Replacement` with numbered rows and clean `Amount (Rs.)` column (zero buying costs).
203. **`A4FinancialTotalsPrintBlock`**: Right-aligned summary table showing section subtotals, `Gross Total`, `Discount`, `Advance Paid`, `Insurance Approved Amount` (on split invoices), and `Net Balance Due`.
204. **`A4ComputerGeneratedFooter`**: Exact mandatory template footer: *"This is a computer generated estimate/quotation and does not carry a signature."*
205. **`A4PriceRedactedJobCardPrint`**: Specialized floor print template for `Workshop Job Card` mode that strips all `Rs.` columns and replaces them with `Assigned Technician`, `Part Issued [ ]`, and `Task Completed [ ]` sign-off boxes.
206. **`Thermal80mmReceiptContainer`**: Dedicated `80mm` (`302px` CSS width) monospace/high-contrast receipt layout for Counter POS sales and Workshop advance payment receipts.
207. **`ThermalReceiptHeaderBlock`**: Compact centered workshop logo, branch address, telephone, `Receipt #`, `Date/Time`, `Cashier`, and `Vehicle No`.
208. **`ThermalReceiptItemizedTable`**: Clean 4-column thermal table (`Item / Qty / Price / Total`) with dashed `-- -- --` separators.
209. **`ThermalTenderSummaryBlock`**: Displays `Subtotal`, `Discount`, `Net Total`, `Cash Tendered`, `Change Returned`, and item count (`Total Items: 4`).
210. **`DualPrintModePreviewDrawer`**: Interactive on-screen print preview modal allowing users to toggle between `A4 Document Preview` and `80mm Thermal Receipt Preview` before sending to the OS print dialog or saving as PDF.

---

## 4. Page-by-Page Comprehensive Luxury UI Upgrade Blueprint (12 Core Screens)

### Page 1: Role-Aware Authentication & Quick Terminal Switcher (`/login`)
* **Visual Vibe:** Minimalist centered frosted card over an architectural automotive/chalk backdrop.
* **Key Components Used:** `LuxuryModalDialog`, `RolePerspectiveBadge`, `PasswordPinMaskInput`, `ButtonPrimaryLuxury`.
* **Luxury Upgrade Details:**
  * Supports both standard email/password login and **1-Click Role Demo / Fast PIN Switching** for workshop terminals (`Owner/Director`, `Workshop Manager`, `Service Advisor`, `POS Cashier`, `Floor Technician`).
  * Displays a live preview pill of the permissions associated with each role (e.g., *Owner: Full Cost & Profit Visibility* vs *Technician: Floor Job Cards Only, Prices Redacted*).

### Page 2: Executive Operations & Gross Profit Command Center (`/dashboard`)
* **Visual Vibe:** Combines **Poital.flow**'s dark hero KPI card + pastel metric cards with **Bonfol/Velvet**'s coral highlight bar chart and donut gauge.
* **Key Components Used:** `HeroKpiCardObsidian`, `PastelTintedKpiCard`, `HeroHighlightBarChart`, `MultiSegmentDonutChart`, `AttentionAlertBannerStrip`, `PopularPartsRankedListCard`.
* **Luxury Upgrade Details:**
  * **Top KPI Ribbon:** 4 cards (`Total Net Revenue`, `Total Direct Cost`, `Net Gross Profit & Margin %`, `Active Vehicles in Workshop`). For non-manager roles, the Cost and Profit cards gracefully swap to operational counters (`Pending Estimates`, `Jobs Ready for Delivery`).
  * **Attention Strip:** CommerceOS-style alert pills highlighting `Jobs Waiting for Parts > 3 Days`, `Pending Insurance Approvals`, and `Low Stock Catalog Items`.
  * **Dual Visual Row:** Left (`65%`) features the daily Revenue & Gross Profit bar/area chart with dark hover tooltips; Right (`35%`) renders a radial donut splitting revenue across `Workshop Labor`, `Workshop Parts`, and `Counter POS`.

### Page 3: Unified Parts & Labor Catalog Master (`/catalog`)
* **Visual Vibe:** Modeled directly after **Confidency OS**'s Pricing Engine & Product Price Table.
* **Key Components Used:** `MinimalistHairlineKpiStrip`, `TableStatusFilterPills`, `LuxuryDataTableWrapper`, `TableMarginSparkBarCell`, `SlideOverDrawerRight`, `FileDropzoneDashed`.
* **Luxury Upgrade Details:**
  * **Top Quick Stats:** 4 micro-tiles (`Total Catalog SKUs`, `Avg Part Margin %`, `Labor Presets`, `Low Stock Alerts`).
  * **Segmented Filter Bar:** Instant pill tabs (`All Items`, `Spare Parts`, `Lubricants & Oils`, `Labor - R&R`, `Labor - Repair`) paired with barcode/SKU search.
  * **High-Density Margin Table:** Each row displays a tinted category icon box, `SKU / Barcode`, `Item Name & Vehicle Compatibility`, `UOM`, `Buying Cost (Rs.)` (permission-gated), `Selling Price (Rs.)`, a visual horizontal `Margin %` progress bar, `Stock Qty`, and active iOS toggle switch.

### Page 4: Workshop Documents Ledger (Quotations, Estimates, Job Cards & Invoices) (`/workshop/sheets`)
* **Visual Vibe:** Modeled after **CommerceOS** and **D.CC Orders Ledger** with warm sand table headers (`#FFF7ED`) and tonal status pills.
* **Key Components Used:** `KpiCardWithStatusDot`, `TableStatusFilterPills`, `MultiFacetFilterDropdownBar`, `TableVehicleBadgeCell`, `ExpandableSubRowLedger`, `WhatsAppBrandTrigger`.
* **Luxury Upgrade Details:**
  * **Stage Filter Ribbon:** Interactive top metric cards (`All Sheets`, `Quotations`, `Accident Estimates`, `Active Job Cards`, `Invoiced`) that filter the ledger in `<10ms`.
  * **Vehicle-First Scanning:** License plates are styled as crisp bordered badges (`CBA-1234`) beside vehicle `Make / Model / Color`, `Nature of Repair` pills, `Insurance Company`, `Document Stage`, `Floor Status`, `Total Selling Price`, and (if Owner/Manager) `Gross Profit Rs. / %`.
  * **One-Click Stage Actions:** Each row provides direct context actions (`Convert to Job Card`, `Convert to Invoice`, `Print A4`, `Share WhatsApp`).

### Page 5: The 3-Section Workshop Repair Sheet Studio (`/workshop/sheet/new` & `/workshop/sheet/:id`)
* **Visual Vibe:** High-speed editorial workspace combining **D.CC's clean form architecture** with **Confidency OS's inline financial telemetry**.
* **Key Components Used:** `WorkshopDocumentStageBanner`, `VehicleHeader12FieldMatrix`, `SmartPlateAutocompleteInput`, `RepairSectionTableGroup`, `HybridCatalogOrFreeformCell`, `AdminInlineBuyingCostCell`, `LiveGrossProfitRibbon`.
* **Luxury Upgrade Details:**
  * **Zero-CRM 12-Field Header:** Arranged in a crisp 2-column grid matching the exact 7-row source template. Typing a known `Vehicle Number` (`CBA-1234`) pops up a non-blocking emerald pill: *"Found previous job (Toyota Premio 2018 - Mr. Perera). Press [Tab] or click to auto-fill."* All fields remain 100% manually editable.
  * **Three Dynamic Section Cards:**
    1. `Labor - Remove & Reassemble`
    2. `Labor - Repair`
    3. `Replacement (Spare Parts)`
  * **Admin Cost & Profit Mode Toggle:** A prominent switch in the sheet toolbar (`🔒 Admin Cost & Profit Mode`). When toggled ON by an Owner/Manager, each of the 3 tables smoothly expands to reveal `Buying Cost (Rs.)`, `Line Profit (Rs.)`, and `Margin %` columns tinted in subtle mint (`#F0FDF4`).
  * **Sticky Executive Margin Bar:** Pinned to the bottom of the viewport, updating on every keystroke: `Gross Sales: Rs. 185,000` | `Direct Costs: Rs. 102,000` | `Gross Profit: Rs. 83,000 (44.8%)` alongside `[Print A4]`, `[Share WhatsApp]`, and `[Convert to Job Card ->]`.

### Page 6: Workshop Job Card Floor Board & Kanban (`/workshop/board`)
* **Visual Vibe:** Clean, tablet-friendly kanban swimlanes and floor status cards with **100% price redaction**.
* **Key Components Used:** `SegmentedPillSwitcher`, `FloorStatusStepperBar`, `JobCardTaskCheckbox`, `TechnicianAssignmentBadge`, `DeliveryCountdownBar`, `A4PriceRedactedJobCardPrint`.
* **Luxury Upgrade Details:**
  * **6 Operational Columns:** `Draft / Intake`, `Pending Insurance Approval`, `Approved & In Progress`, `Waiting for Parts`, `Quality Check`, `Ready for Delivery`.
  * **Floor Job Card View:** Clicking any vehicle card opens the technician-friendly Job Card drawer showing the 12-field vehicle header, promised completion countdown (`3 of 5 Days Remaining`), and the 3 repair sections with interactive completion checkboxes (`[✓] Remove front bumper`, `[✓] Panel beat RHS fender`, `[ ] Replace headlight assembly — Waiting for Part`).
  * **Strict Floor Privacy:** Zero Rupee amounts, selling prices, or buying costs are rendered on screen or on the printed Workshop Job Card.

### Page 7: Workshop Final Invoicing, Split Billing & Collections Studio (`/workshop/invoice/:id`)
* **Visual Vibe:** Precision two-column financial settlement terminal combining itemized audit tables with an interactive split-billing calculator.
* **Key Components Used:** `OriginalEstimateSnapshotDrawer`, `SupplementaryLineItemBadge`, `InsuranceSplitBillingCalculator`, `AdvancePaymentReceiptRecorder`, `PosCollectPaymentModal`.
* **Luxury Upgrade Details:**
  * **Supplementary Tracking:** Clearly highlights items from the original approved Estimate vs. `SUPPLEMENTARY` parts/labor discovered after vehicle stripping.
  * **Insurance vs. Customer Excess Split Calculator:** Interactive right-hand settlement card:
    * `Gross Invoice Total` -> `Less Discount` -> `Add Tax` = `Net Invoice Amount`
    * Input `Insurance Approved Payable (Rs.)` -> System automatically calculates `Customer Liability / Excess (Rs.)`
    * Deducts `Advance Paid (Rs.)` -> Displays bold `Customer Balance Due` and `Insurance Receivable Balance`.

### Page 8: High-Velocity Counter / Showroom POS Terminal (`/pos`)
* **Visual Vibe:** Direct evolution of **RestroBit POS** (`image_4b9648.png` & `image_4b9640.png`) engineered for spare parts, engine oils, batteries, and quick counter services.
* **Key Components Used:** `PosBarcodeScannerStatusPill`, `PosCategoryFilterRibbon`, `PosProductTouchCard`, `PosOnTheFlyCustomItemBar`, `PosCartItemCard`, `PosCollectPaymentModal`, `PosTouchNumericKeypad`.
* **Luxury Upgrade Details:**
  * **Left Catalog Workspace (`62%` width):** Top barcode/SKU omnibox (`Ctrl+K` or hardware scanner) + coral category pills (`All`, `Lubricants`, `Spare Parts`, `Batteries`, `Quick Service`) + 4-column touch card grid + inline `+ Add Custom Walk-in Item` bar.
  * **Right Cart & Checkout Drawer (`38%` width):** Optional single-line `Customer Name/Phone` & `Vehicle No` (defaults to `Walk-in Counter Sale`), scrollable item cards with quantity steppers and inline line-discounts, behind-the-scenes buying cost capture, and high-contrast action buttons (`Hold Draft`, `Collect Payment`, `Quick Cash & Print`).
  * **Touch Numpad Payment Modal:** RestroBit-inspired modal with `Full Payment` / `Split Tender`, `Cash / Card / Bank QR` tiles, quick cash chips (`Rs. 1,000`, `Rs. 5,000`), interactive numeric keypad, and live `Change Due` calculation.

### Page 9: POS Cash Drawer, Shift Management & Petty Cash Ledger (`/pos/shift`)
* **Visual Vibe:** Clean financial ledger with live balance verification cards.
* **Key Components Used:** `PosShiftOpenModal`, `PosPettyCashOutDrawer`, `PosShiftReconciliationSheet`, `MinimalistHairlineKpiStrip`, `LuxuryDataTableWrapper`.
* **Luxury Upgrade Details:**
  * **Live Drawer Telemetry:** 4 top cards (`Opening Float`, `Cash Sales Collected`, `Petty Cash / Garage Payouts`, `Expected Drawer Cash`).
  * **Instant Petty Cash Out:** Cashiers can log minor workshop expenses (`Welding rods`, `Sandpaper`, `Courier charges`) directly from the shift screen, automatically feeding into the daily shop expense ledger.

### Page 10: Embedded Finance, Cost, Gross Profit & Expense Center (`/finance/profit-ledger`)
* **Visual Vibe:** **Confidency OS** + **Bonfol** executive financial cockpit.
* **Key Components Used:** `DailyCashFlowWaterfallCard`, `UnifiedProfitLedgerTable`, `DailyShopExpenseEntryForm`, `NetShopProfitSummaryCard`, `TableMarginSparkBarCell`.
* **Luxury Upgrade Details:**
  * **Complete Profit Formula Visibility:** Displays live cards for:
    1. `Gross Sales (Workshop + POS)`
    2. `Net Sales Revenue (After Discounts)`
    3. `Total Direct Cost (Part Buying Costs + Direct Labor/Sublet Costs)`
    4. `Gross Profit (Rs. & Margin %)`
    5. `Daily Garage Expenses (Rent, Utilities, Petty Cash)`
    6. `Net Shop Profit`
  * **Unified Transaction Ledger:** Filterable table showing every Workshop Invoice and POS Sale side-by-side with `Selling Price`, `Direct Cost`, `Gross Profit`, and a visual margin bar.

### Page 11: Analytics, Insurance Aging & Workshop Intelligence (`/reports`)
* **Visual Vibe:** Executive reporting suite with interactive charts, aging buckets, and CSV/PDF export.
* **Key Components Used:** `DateRangePickerAnalytics`, `GroupedComparisonBarChart`, `InsuranceReceivablesAgingCard`, `TechnicianEfficiencyScorecard`, `LowStockAlertTickerCard`.
* **Luxury Upgrade Details:**
  * **4 Dedicated Report Tabs:**
    1. *Sales & Gross Profit Breakdown* (Workshop Labor R&R vs. Labor Repair vs. Workshop Parts vs. Counter POS).
    2. *Pending Insurance Claim Aging Report* (Grouped by Insurance Company and days outstanding: `0–15d`, `16–30d`, `30–60d`, `60d+`).
    3. *Technician Turnaround & Floor Productivity Report* (Jobs completed, average days vs. promised days).
    4. *Fast-Moving Parts & Low-Stock Replenishment Report*.

### Page 12: Print & Export Studio + Security Audit Log (`/audit-and-print`)
* **Visual Vibe:** Split-screen live print verifier and chronological security ledger.
* **Key Components Used:** `DualPrintModePreviewDrawer`, `A4PrintCanvasContainer`, `Thermal80mmReceiptContainer`, `PrintDomPrivacySanitizer`, `AuditTrailTimelineDrawer`.
* **Luxury Upgrade Details:**
  * **Interactive Print Previewer:** Allows staff to inspect the exact **A4 Workshop Quotation/Estimate/Job Card/Invoice** (matching the uploaded `.docx` templates with the top service banner, 12-field header, 3 tables, and computer-generated footer) and **80mm Thermal Receipt** with a green verification badge: `✓ Verified: Zero Buying Cost or Profit Leakage in Print DOM`.
  * **Immutable Audit Log Table:** Tracks every stage conversion (`Estimate -> Job Card -> Invoice`), discount override, buying cost edit, and invoice void with actor, timestamp, old value, new value, and comment.

---

## 5. Phase-by-Phase Implementation Plan (Phases 0 to 10)

In strict compliance with **Section 3 (Non-Negotiable Agent Rules)** and **Section 11 (Phase-by-Phase Implementation)** of the Antigravity Master Guide, implementation must proceed sequentially phase-by-phase with testing, UI review, and completion documentation gates after every phase.

---

### Phase 0 — Repository Analysis, Architecture & `.agent/` Governance Setup
**Objective:** Inspect existing repository state, verify template mappings, establish `.agent/` governance files, and define typed repository/domain contracts before writing UI feature code.

* **Deliverables & `.agent/` Artifacts:**
  1. `.agent/AGENT.md` — Master operating instructions and role definitions.
  2. `.agent/RULES.md` — Zero-CRM friction rule, 3-section repair sheet rule, cost-privacy invariant, and keyboard-navigation requirements.
  3. `.agent/WORKFLOW.md` — Phase gate checklist and testing verification flow.
  4. `.agent/ARCHITECTURE.md` — Feature-sliced frontend architecture (`src/features/{workshop,pos,catalog,finance,reports,auth,print}`) and NestJS DTO readiness.
  5. `.agent/REQUIREMENTS_MATRIX.md` — Traceability linking every field of the uploaded *Vehicle Repair Quotation* and *Vehicle Repair Estimate* templates to domain models.
  6. `.agent/DOMAIN_MODEL.md` — Explicit TypeScript interfaces for `CatalogItem`, `WorkshopSheet`, `RepairLineItem` (`LABOR_REMOVE_REASSEMBLE` | `LABOR_REPAIR` | `REPLACEMENT`), `PosSale`, `PaymentRecord`, `ShopExpense`, `AuditLog`, and the 3 state machines (`docStage`, `jobStatus`, `paymentStatus`).
  7. `.agent/UI_GUIDELINES.md` — Luxury design tokens, porcelain/chalk palette, tabular numeral rules, and print CSS isolation rules.
* **Completion Gate:** All `.agent/` documentation files verified and domain TypeScript contracts compiled with zero errors.

---

### Phase 1 — Luxury Design System Primitives & Print Abstractions
**Objective:** Configure Tailwind tokens, build foundational luxury components, keyboard-navigable table primitives, and the isolated A4 & 80mm thermal print wrappers.

* **Components Built in Phase 1 (48 Components):**
  * All **Category A** Action Triggers (`ButtonPrimaryLuxury`, `ButtonObsidianExecutive`, `SegmentedPillSwitcher`, `HotKeyKbdChip`, etc.)
  * All **Category B** Form Inputs (`InputLuxuryText`, `InputCurrencyRs`, `ComboboxVirtualized`, `InlineCellTextInput`, `InlineCellCurrencyInput`, etc.)
  * Core **Category K** Print Wrappers (`A4PrintCanvasContainer`, `A4WorkshopServiceHeaderBanner`, `A4ComputerGeneratedFooter`, `Thermal80mmReceiptContainer`, `PrintDomPrivacySanitizer`).
* **Luxury UI Execution:**
  * Configure `#F6F8FA` canvas background, `1px solid rgba(15,23,42,0.06)` card hairlines, Plus Jakarta Sans + JetBrains Mono tabular numerals, and `@media print` isolation rules that strip all application chrome and guarantee zero cost/margin leakage.
* **Verification Gate:** Test A4 print preview and 80mm receipt preview in browser print emulation; verify `Enter` key focus traversal across inline table inputs.

---

### Phase 2 — App Shell, Navigation Rail & Role-Based Permission Guards
**Objective:** Implement the luxury application shell, global command palette (`⌘K`), role switcher/authentication abstraction, and centralized cost-privacy guards.

* **Components Built in Phase 2 (28 Components):**
  * All **Category D** App Shell & Navigation components (`AppShellMasterLayout`, `SidebarNavigationRail`, `WorkshopBayStoreSwitcher`, `GlobalTopHeaderBar`, `RolePerspectiveBadge`, `QuickLaunchHeaderActions`, `CommandPaletteModal`, etc.)
  * Core **Category J** Security Boundaries (`RolePermissionGateWrapper`, `ToggleLockPrivacyButton`, `RedactedCipherPlaceholder`).
* **Luxury UI Execution:**
  * Build the collapsible white sidebar with soft coral active states (`#FFF7ED` / `#F95700`), sticky translucent top header with `+ New Repair Sheet` and `Open Counter POS` buttons, and instant role switching (`Owner/Director`, `Workshop Manager`, `Service Advisor`, `Cashier`, `Technician`) to test permission boundaries live.
* **Verification Gate:** Verify that switching to `Service Advisor`, `Cashier`, or `Technician` immediately hides all Buying Cost and Gross Profit toggles and columns across the app.

---

### Phase 3 — Unified Parts & Labor Catalog + Smart Vehicle History Lookup
**Objective:** Build the shared Parts & Labor Catalog (`/catalog`) and the non-blocking Vehicle Number history lookup service.

* **Components Built in Phase 3 (26 Components):**
  * **Category E** Table & Filter components (`LuxuryDataTableWrapper`, `DataTableWarmHeaderRow`, `TableStatusFilterPills`, `TableMarginSparkBarCell`, `SlideOverDrawerRight`, `CatalogQuickCreateModal`, etc.)
  * `SmartPlateAutocompleteInput` and `VehicleHistoryLookupPopover`.
* **Luxury UI Execution:**
  * Implement `/catalog`, `/catalog/new`, and slide-over edit drawers modeled after **Confidency OS**. Include SKU/Barcode search, item type pills (`SPAREPART`, `LUBRICANT`, `LABOR_REMOVE_REASSEMBLE`, `LABOR_REPAIR`), vehicle compatibility tags, Buying Cost (Rs.), Selling Price (Rs.), live visual Margin % bar, and stock alert thresholds.
  * Seed realistic Sri Lankan workshop catalog data (Toyota/Honda/Nissan filters, Mobil/Castrol lubricants, Exide batteries, standard bumper/fender R&R and 2K paint labor presets) and past vehicle job records (`CBA-1234`, `CAB-8891`, `WP-KD-9011`) for instant one-click header auto-fill.
* **Verification Gate:** Verify barcode/SKU lookup speed, catalog item creation, and non-blocking vehicle plate suggestion that populates Make, Model, Year, Color, Chassis, and Customer Info while keeping all fields 100% manually editable.

---

### Phase 4 — Workshop Quotations & Accident Repair Estimates (3-Section Studio)
**Objective:** Build the flagship Repair Sheet studio (`/workshop/sheet`) matching the uploaded template's 12-field header and 3 line-item tables, plus Admin Cost/Profit mode, A4 Print, and WhatsApp share.

* **Components Built in Phase 4 (32 Components):**
  * Core **Category H** Workshop Document components (`VehicleHeader12FieldMatrix`, `NatureOfRepairSelector`, `InsuranceAssessorAutocomplete`, `ZeroCrmCustomerBlock`, `RepairSectionTableGroup`, `HybridCatalogOrFreeformCell`, `AdminInlineBuyingCostCell`, `LiveGrossProfitRibbon`, `WhatsAppSharePreviewDialog`, `A4Vehicle12FieldPrintGrid`, `A4ThreeSectionPrintTable`).
* **Luxury UI Execution:**
  * Implement the exact 7-row, 12-field header (`Date | Job No`, `Vehicle No | Nature of Repair`, `Make | Chassis No`, `Model | No of Days Completion`, `Year | Color`, `Name of Insurance`, `Customer Information`).
  * Implement the 3 dynamic tables (`Labor - Remove & Reassemble`, `Labor - Repair`, `Replacement`) supporting both catalog preset selection and 100% freeform typing. Pressing `Enter` in the amount/cost field of the last row appends a new numbered row seamlessly.
  * Implement `Admin Cost & Profit Mode` to enter `Buying Cost (Rs.)` per row and view live `Gross Profit (Rs.)` and `Margin %`.
  * Build the pixel-accurate A4 print layout with the top service banner (`MECHANICAL | ELECTRICAL | SCANNING | TINKERING | AUTO PAINT | SPARE PARTS`) and the mandatory footer (*"Computer generated estimate and does not carry a signature"*).
* **Verification Gate:** Create a complete Accident Repair Estimate with zero pre-existing customer or catalog items (100% manual typing). Verify A4 print preview and WhatsApp share summary contain zero buying costs or profit figures.

---

### Phase 5 — Job Card Conversion, Price-Redacted Print & Workshop Floor Board
**Objective:** Implement one-click conversion from Quotation/Estimate to `Workshop Job Card` (preserving an immutable original estimate snapshot), price-redacted floor sheets, and the Kanban/List Workshop Status Board (`/workshop/board`).

* **Components Built in Phase 5 (18 Components):**
  * `StageConversionConfirmDialog`, `OriginalEstimateSnapshotDrawer`, `FloorStatusStepperBar`, `JobCardTaskCheckbox`, `TechnicianAssignmentBadge`, `DeliveryCountdownBar`, `A4PriceRedactedJobCardPrint`, `QualityCheckSignoffCard`.
* **Luxury UI Execution:**
  * Clicking `Convert to Job Card` freezes an immutable snapshot of the original estimated lines, switches the document title to `WORKSHOP JOB CARD`, and enables floor status tracking (`DRAFT` -> `PENDING_INSURANCE_APPROVAL` -> `APPROVED_IN_PROGRESS` -> `WAITING_FOR_PARTS` -> `QUALITY_CHECK` -> `READY_FOR_DELIVERY` -> `COMPLETED_DELIVERED`).
  * Build `/workshop/board` with Kanban swimlanes and tablet-friendly cards where technicians can check off repair tasks and flag `Waiting for Parts` with all financial values completely hidden.
* **Verification Gate:** Verify zero data loss during `Estimate -> Job Card` conversion, verify supplementary item addition during repair, and verify that the Job Card print view hides all monetary columns.

---

### Phase 6 — Workshop Final Invoicing, Insurance Split Billing & Collections
**Objective:** Implement conversion to `Final Invoice`, supplementary line billing, Discounts/Taxes/Advances, Insurance vs. Customer Excess split billing, payment collection, and invoice printouts.

* **Components Built in Phase 6 (14 Components):**
  * `InsuranceSplitBillingCalculator`, `AdvancePaymentReceiptRecorder`, `SupplementaryLineItemBadge`, `TaxAndDiscountSummaryBlock`, `PaymentCollectionHistoryList`, `A4FinancialTotalsPrintBlock`.
* **Luxury UI Execution:**
  * Build the interactive split-billing settlement console on `/workshop/invoice/:id` that computes `Grand Total - Discounts + Tax - Advance Paid - Insurance Approved Amount = Customer Excess Balance Due`.
  * Support partial payments (Advance receipt, Customer Excess payment, Insurance settlement payment) and transition `paymentStatus` (`UNPAID` -> `PARTIALLY_PAID` -> `PAID`).
* **Verification Gate:** Verify split billing math to the cent, test partial and full payment collection, and verify both A4 Tax Invoice and 80mm Advance/Payment thermal receipt outputs.

---

### Phase 7 — Counter / Showroom POS & Register Shift Cash Management
**Objective:** Build the high-speed Counter POS (`/pos`) modeled after **RestroBit** for walk-in spare parts, lubricants, batteries, and quick counter services, plus POS Shift open/close and petty cash payouts (`/pos/shift`).

* **Components Built in Phase 7 (22 Components):**
  * All **Category I** Counter POS & Register Shift components (`PosBarcodeScannerStatusPill`, `PosCategoryFilterRibbon`, `PosProductTouchCard`, `PosOnTheFlyCustomItemBar`, `PosWalkInCustomerHeader`, `PosCartItemCard`, `PosCollectPaymentModal`, `PosTouchNumericKeypad`, `PosShiftOpenModal`, `PosPettyCashOutDrawer`, `PosShiftReconciliationSheet`, `ThermalReceiptItemizedTable`, etc.).
* **Luxury UI Execution:**
  * Implement the touch-friendly product catalog grid with orange `+` buttons, instant barcode scanner listener, inline custom item entry, and persistent right-hand cart drawer.
  * Implement the centered luxury `Collect Payment` modal with `Cash / Card / Bank Transfer QR / Split Payment`, quick cash preset chips, touch numpad, change calculator, and 80mm thermal receipt print.
  * Automatically attach catalog `Buying Cost` (or inline cost for custom items) behind the scenes on every POS cart line so every counter sale feeds directly into the Gross Profit engine.
* **Verification Gate:** Test barcode scan to cart, custom POS item entry, split payment tender, 80mm receipt rendering, and POS shift opening float / petty cash out / closing reconciliation math.

---

### Phase 8 — Embedded Finance, Sales, Cost, Gross Profit & Expense Center
**Objective:** Build the unified Financial & Gross Profit cockpit (`/finance/profit-ledger` & `/finance/expenses`) combining Workshop Invoices, Counter POS Sales, and Daily Garage Expenses.

* **Components Built in Phase 8 (12 Components):**
  * `DailyCashFlowWaterfallCard`, `UnifiedProfitLedgerTable`, `DailyShopExpenseEntryForm`, `NetShopProfitSummaryCard`, `ProfitByCategoryBreakdownCard`, `UnenteredBuyingCostAlertPill`.
* **Luxury UI Execution:**
  * Render the executive waterfall cards showing `Gross Sales` -> `Net Sales Revenue` -> `Total Direct Cost (Parts + Sublet/Labor)` -> `Gross Profit & Margin %` -> `Daily Garage Expenses` -> `Net Shop Profit`.
  * Build the unified ledger table with **Confidency OS** margin progress bars and quick expense logging (Rent, Electricity, Consumables, Sublet Lathe/Paint bills).
* **Verification Gate:** Verify that completing a Workshop Invoice or a Counter POS Sale immediately updates Gross Sales, Total Direct Cost, and Gross Profit to the exact rupee across the financial dashboard.

---

### Phase 9 — Executive Reports & Workshop Intelligence Dashboards
**Objective:** Implement the 4 analytical report views (`/reports`) and the Executive Overview Dashboard (`/dashboard`).

* **Components Built in Phase 9 (10 Components):**
  * `HeroKpiCardObsidian`, `PastelTintedKpiCard`, `HeroHighlightBarChart`, `SmoothedBezierAreaChart`, `MultiSegmentDonutChart`, `InsuranceReceivablesAgingCard`, `TechnicianEfficiencyScorecard`, `LowStockAlertTickerCard`.
* **Luxury UI Execution:**
  * Build the **Poital.flow / Bonfol** inspired executive charts: Date-Range Sales & Gross Profit Report (broken down by Workshop Labor, Workshop Replacements, and Counter POS), Pending Insurance Claim Aging Report, Technician Turnaround Report, and Fast-Moving Parts / Low-Stock Alert Report with one-click CSV/PDF export.
* **Verification Gate:** Test date-range filtering across all 4 reports and verify chart tooltip accuracy and export formatting.

---

### Phase 10 — Full QA, Print Privacy Audit, Keyboard Ergonomics & API Contract Verification
**Objective:** Execute the complete end-to-end QA suite, verify the Cost Privacy Invariant across all print/export surfaces, audit keyboard navigation speed, and validate NestJS/PostgreSQL repository contracts.

* **Mandatory Verification Checklist:**
  1. **Zero-CRM Manual Entry Test:** Create a full Accident Repair Estimate typing a brand-new Vehicle Number, Customer Name/Phone/Address, Insurance Company, and 10 custom repair rows across all 3 sections without touching any separate CRM or Catalog screen.
  2. **Lifecycle State Machine Test:** Transition `Quotation -> Estimate -> Job Card -> Final Invoice` and verify zero data loss across all 12 header fields and 3 line-item tables, plus full audit log recording.
  3. **Cost Privacy Invariant Audit:** Inspect DOM and `@media print` trees for A4 Quotations, A4 Estimates, A4 Job Cards, A4 Invoices, 80mm POS Receipts, and WhatsApp share payloads to confirm `Buying Cost`, `Gross Profit`, and `Margin %` never leak to customers or unauthorized staff roles.
  4. **Gross Profit & Split Billing Math Audit:** Verify `Net Sales - Direct Cost = Gross Profit` across combined Workshop + POS transactions, and verify `Grand Total - Advance - Insurance Approved = Customer Excess Due`.
  5. **High-Speed Keyboard Ergonomics Test:** Confirm `Enter` in the last row appends a new row, `⌘K` opens universal lookup, and POS barcode scanning operates without focus traps.