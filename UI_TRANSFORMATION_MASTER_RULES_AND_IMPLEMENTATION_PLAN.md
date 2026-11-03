# 500 Labs — Antigravity Workshop & POS Master System
# UI Transformation Master Rules, Global Design Management & Implementation Plan

**Stack:** React 19 + TypeScript + Vite | Tailwind CSS | shadcn/ui | Vitest  
**Target:** Ultra-Luxury & High-Velocity ERP (Confidency OS + CommerceOS + Bonfol/Velvet + RestroBit)  
**Governance:** Non-Negotiable Business & Engineering Rules, Global Design Tokens Management, 210 Component Catalog (A–Z), and Phase 0–10 Execution Plan

---

## 1. Executive Visual & Architectural Laws

### 1.1 Porcelain & Chalk Layering Surface Mechanics
* **Atmospheric Canvas Backdrop:** Abandon stark white (`#FFFFFF`) or dreary gray (`#E5E7EB`). Base workspace canvas sits on atmospheric cool chalk (`#F6F8FA` / `hsl(210, 20%, 97.5%)`) or warm porcelain (`#F9F8F6`).
* **Elevated Crisp White Containers:** Cards, data tables, repair sections, and POS cart drawers rest on pure white (`#FFFFFF`) framed by **micro-hairline borders** (`1px solid rgba(15, 23, 42, 0.08)`) and diffused dual-layer ambient elevation:
  $$\text{Shadow} = \text{Tight Contact}(0\ 2\text{px}\ 10\text{px}\ -2\text{px}\ \text{rgba}(15,23,42,0.03)) + \text{Ambient Diffuse}(0\ 12\text{px}\ 32\text{px}\ -4\text{px}\ \text{rgba}(15,23,42,0.02))$$
* **Glassmorphic Scrims:** Modals, drawers, and omnibox overlays use frosted acrylic backdrops (`backdrop-filter: blur(12px)`, `rgba(15, 23, 42, 0.40)`).

### 1.2 Mathematical Corner Radii & Concentricity
Per `modern-ui-specialist` principles, nested components maintain strict geometric harmony:
$$\text{Inner Radius} = \max(0, \text{Outer Radius} - \text{Padding})$$
* **Control Radius:** `10px` (`rounded-[10px]` / `rounded-control`) for buttons, inputs, numpad keys, and steppers.
* **Card Radius:** `16px` (`rounded-[16px]` / `rounded-card`) for KPI cards, repair section containers, and tables.
* **Modal Radius:** `22px` (`rounded-[22px]` / `rounded-modal`) for dialogs and sheets.
* **Badge / Hotkey Radius:** `9999px` (`rounded-full` / `rounded-pill`).
* **Docking Law:** Any element docked to the viewport edge (drawer or sticky footer) collapses edge-touching radii to `0px` to prevent visual light leaks.

### 1.3 Swiss Editorial Typography & Optical Tabular Numerals
* **Sans Editorial Copy:** Plus Jakarta Sans / Inter Display with proportional negative letter-spacing (`letter-spacing: -0.015em` on headings, `-0.03em` on display figures).
* **Monospace Tabular Precision:** Enforced `font-mono tabular-nums` across all license plates (`CBA-1234`), chassis numbers, currency figures (`Rs. 145,000.00`), quantities, and margin percentages so decimal points align vertically to the exact pixel.

### 1.4 Single-Chroma Focal Allocation & Semantic Pastels
* **Obsidian Structural Anchor (`#0F172A`):** Deep charcoal used for primary text, active table headers, and executive dark KPI cards.
* **Terracotta / Burnt Coral Accent (`#F95700` hover `#EA580C`):** High-conversion focus color reserved exclusively for primary actions (`+ New Repair Sheet`, `Tender Payment`, active filter pills, peak histogram bars).
* **Tonal Semantic Pastels:** Status badges eliminate harsh solid fills, pairing 10% translucent pastel fills with 1px 20% borders:
  * **Emerald (Completed / Paid / Optimal Margin > 35%):** Bg `#ECFDF5`, Border `#A7F3D0`, Text `#047857`
  * **Amber (Waiting Parts / Pending Insurance / Warning 20–35%):** Bg `#FFFBEB`, Border `#FDE68A`, Text `#B45309`
  * **Cobalt (In Progress / Workshop Bay Active / Quotation):** Bg `#EFF6FF`, Border `#BFDBFE`, Text `#1D4ED8`
  * **Crimson (Cancelled / Overdue / Margin Loss < 0%):** Bg `#FEF2F2`, Border `#FECACA`, Text `#B91C1C`

---

## 2. Centralized Global Design Management Architecture

All styling, colors, tokens, and formatters are unified under a single global programmatic manager:
- **Tokens Definition:** `src/design-system/tokens.ts` (`DESIGN_TOKENS`)
- **Global Manager API:** `src/design-system/global-manager.ts` (`globalDesignManager`)
- **Tailwind Integration:** `tailwind.config.js` (`canvas`, `surface`, `brand`, `admin`, `border`, `borderRadius`, `boxShadow`, `fontFamily`)
- **CSS Custom Properties:** `src/index.css` (`:root` variables)
- **Central Barrel:** `src/design-system/index.ts`

### 2.1 Global Manager Methods & Contracts
| Method | Input Signature | Output / Behavior |
| :--- | :--- | :--- |
| `getTokens()` | `()` | Full immutable `DESIGN_TOKENS` object |
| `calculateInnerRadius(outer, padding)` | `(outer: number, pad: number)` | Concentric radius `Math.max(0, outer - pad)` |
| `getStatusBadgeClasses(stageOrStatus)` | `(status: string)` | Tonal pastel Tailwind classes |
| `getMarginHealth(marginPercent)` | `(margin: number)` | `{ level, label, badgeClass, dotColor, textColor }` |
| `formatRs(amount, options?)` | `(amt: number, opts?)` | Tabular formatted currency string `Rs. 145,000.00` |
| `canViewCosts(role, isToggled)` | `(role: UserRole, toggled: bool)` | Strict privacy invariant check |
| `sanitizePrintPayload(data)` | `(data: T)` | Deep redaction of buying costs & margins for print/export |

---

## 3. A-to-Z Master Component Inventory (210 Components Across Categories A–K)

### Category A: Action Triggers, Buttons & Micro-Controls (Components 1–20)
1. **`ButtonPrimaryLuxury`**: Solid `#F95700` fill, `10px` radius, `active:scale-[0.98]` tactile compression.
2. **`ButtonObsidianExecutive`**: Deep `#0F172A` charcoal surface with crisp white text for stage conversions.
3. **`ButtonSecondaryHairline`**: Pure `#FFFFFF` background, `1px solid rgba(15,23,42,0.08)` border.
4. **`ButtonGhostMinimal`**: Borderless slate text trigger that illuminates on hover.
5. **`ButtonDestructiveSoft`**: Translucent `#FEF2F2` background with `#DC2626` label and trash icon.
6. **`ButtonSuccessEmerald`**: Solid `#059669` trigger used for financial settlements.
7. **`ButtonIconSquare`**: `38px × 38px` rounded container with centered Lucide stroke icon.
8. **`ButtonCircleQuickAdd`**: `32px × 32px` circular `#F95700` button with a crisp `+` glyph.
9. **`SplitActionDropdownButton`**: Primary button fused with secondary format chevron (A4 vs 80mm).
10. **`SegmentedPillSwitcher`**: Sliding pill switcher inside a `#F1F5F9` track (`Quotation` vs `Estimate`).
11. **`FloatingActionQuickIntake`**: Tablet/mobile floating pill for instant floor intake.
12. **`HotKeyKbdChip`**: Monospaced micro-badge (`⌘K`, `Enter ↵`, `Esc`) with `#F1F5F9` fill.
13. **`ClipboardCopyChip`**: Clickable plate or invoice tag that morphs to an emerald checkmark.
14. **`AiAssistActionPill`**: Subtle gradient pill (`✨ Auto-Fill Specs`) for smart suggestions.
15. **`HoldToConfirmButton`**: Press-and-hold radial fill button for destructive actions (`Void Invoice`).
16. **`ToggleLockPrivacyButton`**: Header switch with padlock icon to toggle Buying Cost visibility.
17. **`WhatsAppBrandTrigger`**: Emerald outline button with WhatsApp vector glyph and phone tooltip.
18. **`PrintActionTrigger`**: Action button with live print preview trigger.
19. **`PaginationPillButton`**: Square `34px` page selector where active page takes `#0F172A`.
20. **`CollapseChevronButton`**: `180deg` rotating micro-button for expanding/collapsing repair tables.

### Category B: Precision Form Inputs & Selectors (Components 21–45)
21. **`InputLuxuryText`**: `40px` height, `#FFFFFF` background, hairline `#E2E8F0` border, orange ring focus.
22. **`InputFloatingLabel`**: Compact input with floating uppercase tracking label.
23. **`InputTabularNumber`**: Right-aligned numeric field enforcing `tabular-nums`.
24. **`InputCurrencyRs`**: Fixed `Rs.` prefix badge, live thousand-separator formatting (`145,000.00`).
25. **`InputPercentageMargin`**: Numeric badge with `%` suffix and dynamic green/amber/red color coding.
26. **`SearchInputGlobalCommand`**: Header omnibox with magnifying glass and right-aligned `⌘K` chip.
27. **`SearchInputTableLocal`**: Compact `36px` filter search bar with instant clear button.
28. **`TextareaAutoGrow`**: Seamless multi-line field for customer address and remarks.
29. **`SelectLuxuryPopover`**: Radix select trigger with soft shadow dropdown and keyboard navigation.
30. **`ComboboxVirtualized`**: High-speed searchable dropdown for 5,000+ catalog items.
31. **`MultiSelectTagInput`**: Converts selected repair natures into dismissible tonal pills.
32. **`CheckboxRoundedLuxury`**: `18px × 18px` checkbox with SVG animated checkmark.
33. **`RadioCardGroup`**: Elevated selectable cards with radio indicators.
34. **`SwitchiOSTactile`**: Smooth `44px × 24px` pill toggle switch for settings and active states.
35. **`SliderDiscountRange`**: Tactile range slider with floating percentage tooltip.
36. **`InputQuantityStepper`**: Integrated `[-]` `[ 2 ]` `[+]` pill control for cart rows.
37. **`PhoneInputSriLanka`**: Formatted phone field (`07X XXX XXXX`) with WhatsApp validation.
38. **`InlineCellTextInput`**: Borderless table cell input that reveals borders on hover/focus.
39. **`InlineCellCurrencyInput`**: Zero-chrome monetary cell input for rapid price/cost entry.
40. **`FileDropzoneDashed`**: Dashed container with upload glyph for vehicle damage photos.
41. **`ImagePreviewThumbnailCard`**: Vehicle photo container with hover zoom lightbox.
42. **`FormFieldValidationWrapper`**: Standardized wrapper with label, required asterisk, and error text.
43. **`ReadOnlyLockedField`**: Striped or slate-tinted input displaying sequential IDs with lock glyph.
44. **`PasswordPinMaskInput`**: Segmented PIN input for manager discount overrides.
45. **`UnitOfMeasureSelector`**: Inline suffix selector (`Nos`, `Liters`, `Sets`, `Hours`) fused to quantity.

### Category C: Date, Time & Turnaround Scheduling (Components 46–57)
46. **`DatePickerSingleLuxury`**: Calendar popover with clean typography and quick "Today" buttons.
47. **`DateRangePickerAnalytics`**: Dual-month calendar with presets (`Last 7 Days`, `This Month`).
48. **`CompletionDaysCounterInput`**: Header input calculating target delivery date badge.
49. **`TimeSlotPickerPopover`**: 15-minute interval time selector for vehicle intake.
50. **`AgingDurationBadge`**: Calculated pill showing open claim days (`12 Days Aging`).
51. **`ShiftDurationTimer`**: Live ticking header clock showing register shift time (`Shift: 06h 42m`).
52. **`MonthYearQuickSwitcher`**: Compact `< Nov 2026 >` pill bar for cycling monthly ledgers.
53. **`TimestampRelativeCell`**: Table cell displaying relative time with hover ISO tooltip.
54. **`DeliveryCountdownBar`**: Visual horizontal bar showing promised vs elapsed repair days.
55. **`FiscalQuarterSelector`**: Segmented quarter picker (`Q1`, `Q2`, `Q3`, `Q4`).
56. **`ManufacturingYearPicker`**: 4-digit year grid (`1990–2026`) for fast vehicle header selection.
57. **`AuditTimelineDateHeader`**: Sticky date separator pill inside vertical audit logs.

### Category D: Navigation, App Shell & Workspace Layout (Components 58–75)
58. **`AppShellMasterLayout`**: Fixed left rail + sticky top utility bar + `#F6F8FA` workspace canvas.
59. **`SidebarNavigationRail`**: Collapsible white sidebar with hairline border and section labels.
60. **`SidebarNavLinkItem`**: Navigation row with icon, label, soft coral active state, and count badge.
61. **`SidebarNestedAccordion`**: Expandable sub-menu (`Workshop` -> `All Sheets`, `Floor Board`).
62. **`WorkshopBayStoreSwitcher`**: Top-left sidebar dropdown displaying branch name and active bays.
63. **`GlobalTopHeaderBar`**: `64px` translucent header with breadcrumbs, search, and role badge.
64. **`BreadcrumbHierarchyTrail`**: Clean slash-separated route path (`Workshop` / `Job Cards` / `JOB-0042`).
65. **`RolePerspectiveBadge`**: Top-right interactive pill showing active role with privilege indicator.
66. **`QuickLaunchHeaderActions`**: Persistent pair: `[+ New Repair Sheet]` and `[Open Counter POS]`.
67. **`PageHeaderBanner`**: Title block with 24px bold heading, subtitle, and utility export buttons.
68. **`StickyBottomActionFooter`**: Elevated floating glass bar housing totals and save actions.
69. **`SplitPaneWorkspace`**: Two-column layout (`65%` Catalog Grid / `35%` Persistent POS Cart).
70. **`TabbedWorkspaceHeader`**: Clean horizontal underline tab bar with animated indicator.
71. **`CommandPaletteModal`**: Universal Spotlight-style overlay (`⌘K`) for 2-keystroke jump.
72. **`KeyboardShortcutsHelpBar`**: Footer strip displaying contextual hotkeys (`[Enter] Add Row`).
73. **`UserAccountFooterCard`**: Bottom-left sidebar card showing staff avatar, name, and role.
74. **`FullScreenPOSModeToggle`**: Header button collapsing sidebar to maximize touch screen space.
75. **`SetupChecklistSidebarWidget`**: Lower-sidebar onboarding widget with progress bar.

### Category E: High-Density Data Tables, Ledgers & Filter Bars (Components 76–100)
76. **`LuxuryDataTableWrapper`**: Rounded `16px` white card container with hairline border.
77. **`DataTableWarmHeaderRow`**: Warm sand (`#FFF7ED`) or cool slate header row with uppercase labels.
78. **`SortableColumnHeader`**: Column header with interactive ascending/descending chevrons.
79. **`DataTableInteractiveRow`**: `52px` height row with `#F8FAFC` hover state and focus ring.
80. **`TableRowSelectionCheckbox`**: Left-most column checkbox supporting shift-click selection.
81. **`FloatingBulkActionBar`**: Obsidian floating pill bar when multiple rows are checked.
82. **`TableStatusFilterPills`**: Horizontal bar of pill tabs (`All`, `Quotation`, `Estimate`, `Job Card`).
83. **`MultiFacetFilterDropdownBar`**: Inline filter strip (`Date Range`, `Nature`, `Insurance`).
84. **`ActiveFilterDismissibleChip`**: Pill tag showing active filter with `×` remove button.
85. **`TablePrimaryIdentityCell`**: Stacked cell pairing bold Job ID with muted timestamp.
86. **`TableVehicleBadgeCell`**: Miniature rectangular plate frame (`CBA-1234`) with model subtitle.
87. **`TableFinancialAmountCell`**: Right-aligned tabular currency cell with optional paid/due sub-label.
88. **`TableMarginSparkBarCell`**: Margin percentage (`42.8%`) paired with color-coded progress bar.
89. **`TableDeltaTrendChip`**: Directional pill (`↑ +12.4%` or `↓ -3.1%`) comparing periods.
90. **`TableRowQuickActionsMenu`**: Right-aligned `•••` popover (`Open`, `Convert`, `Print A4`, `Share`).
91. **`ExpandableSubRowLedger`**: Accordion row that expands inline to show 3-section repair summary.
92. **`DraggableLineItemHandle`**: Six-dot grip icon (`⋮⋮`) for reordering repair items.
93. **`DataTableFooterPagination`**: Displays record count, rows-per-page selector, and page pills.
94. **`ColumnVisibilityTogglePopover`**: Menu allowing managers to toggle optional table columns.
95. **`CsvExcelExportButton`**: Button exporting filtered table view with non-admin cost stripping.
96. **`EmptyTableStateCard`**: Minimalist illustration with contextual message and CTA button.
97. **`TableSkeletonLoaderRows`**: 8-row shimmer skeleton matching exact column geometry.
98. **`PinnedSummaryFooterRow`**: Sticky bottom row displaying live column sums to the rupee.
99. **`AttentionAlertBannerStrip`**: Alert pills highlighting `Jobs Waiting for Parts > 7 Days`.
100. **`InlineRowQuickEditPopover`**: Popover for updating catalog stock qty or selling price directly.

### Category F: Cards, KPI Metrics & Visualizations (Components 101–122)
101. **`HeroKpiCardObsidian`**: Dark charcoal (`#0F172A`) primary KPI card with white display numerals.
102. **`PastelTintedKpiCard`**: Soft pastel surface card (mint, blush, or ice blue) for secondary metrics.
103. **`MinimalistHairlineKpiStrip`**: Unified 4-column metric ribbon separated by hairline dividers.
104. **`KpiCardWithStatusDot`**: White card with colored status dot and active selection border.
105. **`SmoothedBezierAreaChart`**: Dual-series area chart (`Gross Revenue` vs `Gross Profit`).
106. **`HeroHighlightBarChart`**: Bar histogram where peak bar renders in solid `#F95700` coral.
107. **`GroupedComparisonBarChart`**: Dual bar chart (`Workshop Sales` vs `Counter POS Sales`).
108. **`MultiSegmentDonutChart`**: Multi-segment progress bar/donut showing revenue distribution.
109. **`DarkFloatingChartTooltip`**: High-contrast `#0F172A` tooltip showing date, rupee value, and delta.
110. **`PopularPartsRankedListCard`**: Dashboard card listing top-selling parts with thumbnails and sales.
111. **`TechnicianEfficiencyScorecard`**: Card displaying mechanic avatar, completed jobs, and on-time %.
112. **`InsuranceReceivablesAgingCard`**: Visual breakdown showing claims across `0–15d`, `16–30d`, `30+d`.
113. **`DailyCashFlowWaterfallCard`**: Bridges `Gross Sales` -> `Discounts` -> `Costs` -> `Net Profit`.
114. **`LowStockAlertTickerCard`**: Widget highlighting catalog items below low stock threshold.
115. **`WorkshopBayUtilizationGauge`**: Visual meter showing occupied vs available workshop bays.
116. **`ChartPeriodDropdownSelector`**: Compact `2026 v` or `Monthly v` pill selector on chart cards.
117. **`SparklineMicroTrend`**: `64px × 24px` inline SVG trend line embedded in compact KPI tiles.
118. **`ConversionFunnelMetricBar`**: Horizontal segmented bar showing conversion from quote to invoice.
119. **`AverageTicketValueCard`**: Metric tile comparing average invoice vs POS basket size.
120. **`LaborVsPartsRatioBar`**: Split bar comparing high-margin labor revenue against parts revenue.
121. **`InteractiveChartLegend`**: Clickable pill legend items toggling chart series visibility.
122. **`MetricComparisonTooltip`**: Hover popover explaining exact financial calculation formula.

### Category G: Overlays, Modals, Slide-Over Drawers & Notifications (Components 123–140)
123. **`LuxuryModalDialog`**: Centered `rounded-[22px]` white dialog over blurred dark scrim.
124. **`WizardStepperModal`**: Multi-step modal (`① Details` — `② Split Billing` — `③ Print`).
125. **`SlideOverDrawerRight`**: Right-edge sheet (`480px`) for inspecting job history or catalog items.
126. **`StageConversionConfirmDialog`**: Confirmation modal when converting `Estimate -> Job Card`.
127. **`CostPrivacyWarningModal`**: Prompt reminding staff that customer prints remain 100% cost-redacted.
128. **`ToastNotificationStack`**: Floating toast notification cards with undo action support.
129. **`DestructiveActionAlertModal`**: Modal requiring mandatory reason before voiding an invoice.
130. **`VehicleHistoryLookupPopover`**: Non-blocking card appearing when known plate (`CBA-1234`) is typed.
131. **`CatalogQuickCreateModal`**: Modal to save a new part to catalog without leaving active sheet.
132. **`ImageLightboxModal`**: Full-screen zoomable viewer for vehicle collision damage photos.
133. **`WhatsAppSharePreviewDialog`**: Displays formatted summary text before launching WhatsApp.
134. **`AuditTrailTimelineDrawer`**: Drawer rendering chronological state transitions and actor names.
135. **`KeyboardShortcutsCheatSheetModal`**: Grid of workshop and POS hotkeys triggered by `?`.
136. **`SessionLockPinOverlay`**: Blurred screen lock overlay allowing cashier to unlock with 4-digit PIN.
137. **`UnsavedChangesGuardDialog`**: Modal warning estimator before navigating away without saving.
138. **`SubletCostEntryPopover`**: Popover on labor rows to record external lathe/paint sublet bills.
139. **`SupplementaryEstimateAlertBanner`**: Amber top banner indicating supplementary parts added.
140. **`MobileBottomActionDrawer`**: Responsive touch sheet for technicians updating task checkboxes.

### Category H: Workshop Document Engine & 3-Section Repair Sheet (Components 141–165)
141. **`WorkshopDocumentStageBanner`**: Document control bar with stage pill and conversion CTA.
142. **`VehicleHeader12FieldMatrix`**: Exact 7-row, 12-field matrix matching official template.
143. **`SmartPlateAutocompleteInput`**: Plate input with Sri Lankan format and non-blocking lookup.
144. **`NatureOfRepairSelector`**: Quick selector for `Accident`, `Mechanical`, `Electrical`, `Paint`.
145. **`InsuranceAssessorAutocomplete`**: Freeform input with instant Sri Lankan insurer suggestions.
146. **`ZeroCrmCustomerBlock`**: Direct customer name, phone, and address inputs on document.
147. **`RepairSectionTableGroup`**: Reusable 3-section table (`Remove & Reassemble`, `Repair`, `Replacement`).
148. **`HybridCatalogOrFreeformCell`**: Description cell supporting 100% manual typing OR catalog search.
149. **`RepairLineAutoNumberCell`**: Sequential row index (`01`, `02`) that re-indexes automatically.
150. **`AdminInlineBuyingCostCell`**: Column visible only when Owner/Manager enables cost mode.
151. **`AdminInlineRowProfitBadge`**: Per-row badge (`+Rs. 4,500 | 38%`) showing line profit.
152. **`SectionSubtotalFooterBar`**: Right-aligned subtotal bar at the bottom of each of the 3 sections.
153. **`SupplementaryLineItemBadge`**: Amber `SUPPLEMENTARY` tag on items added after initial estimate.
154. **`OriginalEstimateSnapshotDrawer`**: Comparison viewer showing original snapshot vs supplementary.
155. **`InsuranceSplitBillingCalculator`**: Calculates `Grand Total - Advance - Insurance = Excess Due`.
156. **`AdvancePaymentReceiptRecorder`**: Logs customer advance deposits with date and payment mode.
157. **`TechnicianTaskAssignmentRow`**: In Job Card mode, renders mechanic name and task checkbox.
158. **`FloorStatusStepperBar`**: 7-stage interactive operational status bar (`DRAFT` to `COMPLETED`).
159. **`QualityCheckSignoffCard`**: Signoff checklist before transitioning to `READY_FOR_DELIVERY`.
160. **`VehicleVisualDamageAnnotator`**: Vehicle silhouette for clicking to place damage tags.
161. **`QuickPresetBundleInjector`**: One-click dropdown to insert standard repair packages.
162. **`PartConditionTagSelector`**: Inline tag for part source (`Brand New Genuine`, `OEM`, `Used`).
163. **`TaxAndDiscountSummaryBlock`**: Configurable flat or percentage discount and tax calculation.
164. **`PaymentCollectionHistoryList`**: Ledger displaying all partial payments collected.
165. **`DocumentQuickCloneButton`**: Duplicates an existing quotation into a new job sheet.

### Category I: Counter / Showroom POS & Register Shift Components (Components 166–184)
166. **`PosBarcodeScannerStatusPill`**: Header indicator (`🟢 Scanner Ready`) capturing hardware HID scans.
167. **`PosCategoryFilterRibbon`**: Horizontal pill bar for filtering lubricants, parts, and batteries.
168. **`PosProductTouchCard`**: Touch card with item name, stock count, price, and orange `+` button.
169. **`PosOnTheFlyCustomItemBar`**: Top cart row to add unlisted items with on-the-fly price and cost.
170. **`PosWalkInCustomerHeader`**: Optional single line defaulting to `Walk-in Counter Sale`.
171. **`PosCartItemCard`**: Elevated cart item row with quantity stepper and trash icon.
172. **`PosCartFinancialSummary`**: Bottom cart ledger showing Subtotal, Discounts, and Net Total.
173. **`PosPrimaryActionGrid`**: 3-button matrix (`Hold Cart`, `Quick Cash & Print`, `Tender Payment`).
174. **`PosCollectPaymentModal`**: Centered payment modal with Cash, Card, and Bank QR tiles.
175. **`PosQuickCashPresetPills`**: Denomination chips (`Rs. 1,000`, `Rs. 5,000`, `Exact Cash`).
176. **`PosTouchNumericKeypad`**: Large `3 × 4` tactile keypad (`1–9`, `.`, `0`, `⌫`).
177. **`PosChangeDueBanner`**: High-contrast banner calculating balance and change to return.
178. **`PosSplitTenderAllocator`**: Allocates counter bill across multiple payment methods.
179. **`PosShiftOpenModal`**: Start-of-day modal for entering `Opening Cash Float (Rs.)`.
180. **`PosPettyCashOutDrawer`**: Records minor garage cash-outs (tea, courier, bolts) directly.
181. **`PosShiftReconciliationSheet`**: Compares expected cash with counted cash, auditing variances.
182. **`PosHeldBillsDrawer`**: List of parked counter carts with one-click resume.
183. **`PosRecentReceiptsDrawer`**: Lookup list of today's POS sales to reprint receipts or void.
184. **`PosLowStockWarningBadge`**: Amber warning badge rendered on cards when stock is depleted.

### Category J: Embedded Finance, Gross Profit & Privacy Guards (Components 185–197)
185. **`RolePermissionGateWrapper`**: React boundary unmounting cost/margin DOM nodes for staff roles.
186. **`LiveGrossProfitRibbon`**: Executive telemetry strip showing sales, costs, profit, and margin %.
187. **`MarginHealthTrafficLight`**: Pill grading document margin (`Optimal`, `Moderate`, `Loss`).
188. **`UnenteredBuyingCostAlertPill`**: Badge alerting managers if replacement parts lack buying cost.
189. **`UnifiedProfitLedgerTable`**: Master financial table combining Workshop Invoices and POS Sales.
190. **`DailyShopExpenseEntryForm`**: Form for logging workshop rent, electricity, and consumables.
191. **`NetShopProfitSummaryCard`**: Displays `Net Shop Profit = Gross Profit - Daily Expenses`.
192. **`InsuranceVsCustomerReceivableSplitBar`**: Bar showing receivables owed by insurance vs customers.
193. **`PriceOverrideAuditPrompt`**: Prompt requiring manager approval when discounting below buying cost.
194. **`HistoricalSnapshotIntegrityBadge`**: Lock indicator confirming frozen historical line costs.
195. **`ProfitByCategoryBreakdownCard`**: Splits gross profit across labor, workshop parts, and POS items.
196. **`RedactedCipherPlaceholder`**: Masking toggle replacing sensitive figures with `Rs. ••••••`.
197. **`PrintDomPrivacySanitizer`**: Automated wrapper guaranteeing no cost props reach `@media print`.

### Category K: A4 Print & 80mm Thermal Receipt Abstractions (Components 198–210)
198. **`A4PrintCanvasContainer`**: A4 portrait wrapper (`210mm × 297mm`) with crisp black typography.
199. **`A4WorkshopServiceHeaderBanner`**: Exact top service strip from Word template.
200. **`A4WorkshopBrandTitleBlock`**: Workshop header with company name, address, and document title.
201. **`A4Vehicle12FieldPrintGrid`**: Bordered 7-row table reproducing exact intake matrix.
202. **`A4ThreeSectionPrintTable`**: High-contrast bordered tables for Sections 1, 2, and 3.
203. **`A4FinancialTotalsPrintBlock`**: Summary table showing subtotals, discounts, advance, and due balance.
204. **`A4ComputerGeneratedFooter`**: Mandatory template footer disclaimer and thank-you line.
205. **`A4PriceRedactedJobCardPrint`**: Floor sheet stripping prices and adding technician check boxes.
206. **`Thermal80mmReceiptContainer`**: `80mm` width monospace receipt container for POS counter.
207. **`ThermalReceiptHeaderBlock`**: Workshop logo, branch address, receipt number, and cashier name.
208. **`ThermalReceiptItemizedTable`**: Itemized lines (`Description`, `Qty × Price`, `Total`).
209. **`ThermalTenderSummaryBlock`**: Displays net total, tender method, cash tendered, and change.
210. **`DualPrintModePreviewDrawer`**: Interactive modal toggling between A4 and 80mm thermal preview.

---

## 4. Phase-by-Phase Implementation Plan (Phases 0 to 10)

```
[Phase 0: Governance & Architecture Setup]
    │
[Phase 1: Design System Primitives & Global Manager] ─── (COMPLETED & VERIFIED)
    │
[Phase 2: App Shell, Navigation Rail & Permission Gates]
    │
[Phase 3: Catalog Master & Vehicle History Lookup]
    │
[Phase 4: Workshop Quotations & Estimates Studio]
    │
[Phase 5: Job Card Conversion, Floor Board & Redacted Print]
    │
[Phase 6: Final Invoicing & Insurance Split Settlement]
    │
[Phase 7: High-Speed Counter POS & Shift Management]
    │
[Phase 8: Embedded Finance & Gross Profit Center]
    │
[Phase 9: Workshop Intelligence & Executive Analytics]
    │
[Phase 10: Full QA, Print Privacy Audit & Regression Verification]
```

### Phase Details & Verification Gates:

#### Phase 0: Governance & Architecture Setup (Status: Complete)
* Governance specs (`RULES.md`, `UI_GUIDELINES.md`, `DOMAIN_MODEL.md`, `REQUIREMENTS_MATRIX.md`).
* Verification: Zero TypeScript compilation errors on domain contracts.

#### Phase 1: Design Tokens, Global Manager & Atomic UI Primitives (Status: Complete)
* Central tokens (`tokens.ts`), singleton `GlobalDesignManager`, Tailwind configuration, and atomic component suite covering Categories A through K.
* Verification: 17 dedicated tests in `tests/global-design-system.test.tsx` + 22 existing test suites passing (309 total tests).

#### Phase 2: App Shell, Navigation Rail & Role Guard Integration
* Wire `AppShellMasterLayout`, `SidebarNavigationRail`, `GlobalTopHeaderBar`, `RolePerspectiveBadge`, and `RolePermissionGateWrapper` across the active application routes.
* Verification: Role switcher demo allows instant perspective change; verifies that Cashier/Advisor view completely hides cost and profit elements.

#### Phase 3: Catalog Master & Non-Blocking Vehicle History Service
* Upgrade `/catalog` with `LuxuryDataTableWrapper`, `TableMarginSparkBarCell`, and slide-over part editor.
* Connect `SmartPlateAutocompleteInput` to past vehicle job repository.
* Verification: Barcode lookup speed <16ms; plate suggestion populates header without blocking manual edits.

#### Phase 4: Workshop Quotation & Accident Estimate Studio
* Upgrade `/workshop/sheet/new` with `VehicleHeader12FieldMatrix` and 3-section line tables.
* Wire `Enter`-to-append row ergonomics and `ToggleLockPrivacyButton`.
* Integrate `A4PrintCanvasContainer` and `WhatsAppSharePreviewDialog`.
* Verification: A4 printout matches Word template; zero buying cost leakage in print DOM or WhatsApp payload.

#### Phase 5: Job Card Stage Conversion, Floor Board & Redacted Print
* Implement stage transition modal (`Estimate -> Job Card`) with immutable original estimate snapshot.
* Wire `/workshop/board` with floor status columns and mechanic task checkboxes.
* Verification: Floor view and Job Card print redact 100% of prices and monetary amounts.

#### Phase 6: Workshop Final Invoicing & Insurance Split Billing
* Build `/workshop/invoice/:id` with `InsuranceSplitBillingCalculator` and `AdvancePaymentReceiptRecorder`.
* Calculate Customer Excess vs Insurance Approved Payable to the cent.
* Verification: Split settlement math verified against multiple payment receipts.

#### Phase 7: Counter / Showroom POS Terminal & Register Shift
* Upgrade `/pos` with `PosProductTouchCard`, `PosCartItemCard`, and `PosCollectPaymentModal`.
* Wire hardware scanner listener (`PosBarcodeScannerStatusPill`), quick cash chips, and 80mm thermal receipt.
* Implement `/pos/shift` with opening float, petty cash payouts, and closing variance audit.
* Verification: POS cart lines capture buying costs behind the scenes; change calculation and shift math audited.

#### Phase 8: Embedded Finance & Unified Gross Profit Center
* Build `/finance/profit-ledger` with `DailyCashFlowWaterfallCard` and `UnifiedProfitLedgerTable`.
* Connect daily garage expenses (rent, electricity, welding consumables).
* Verification: Formula audited: Net Shop Profit = Gross Sales - Discounts - Direct Costs - Expenses.

#### Phase 9: Executive Reports & Workshop Intelligence
* Build `/reports` with `HeroHighlightBarChart`, `MultiSegmentDonutChart`, and insurance aging buckets.
* Verification: Date range filtering and CSV/PDF export verified.

#### Phase 10: End-to-End QA, Print Privacy Audit & Regression Verification
* Execute full 23-test vitest suite.
* Verify keyboard ergonomics (Enter row creation, ⌘K omnibox, Esc dismissal).
* Execute print DOM audit across all 12 screens.
