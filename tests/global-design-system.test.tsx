import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  globalDesignManager,
  DESIGN_TOKENS,
  // Category A: Action Triggers & Buttons
  ButtonPrimaryLuxury,
  ButtonObsidianExecutive,
  ButtonSecondaryHairline,
  ButtonGhostMinimal,
  ButtonDestructiveSoft,
  ButtonSuccessEmerald,
  ButtonIconSquare,
  ButtonCircleQuickAdd,
  SplitActionDropdownButton,
  SegmentedPillSwitcher,
  FloatingActionQuickIntake,
  HotKeyKbdChip,
  ClipboardCopyChip,
  AiAssistActionPill,
  HoldToConfirmButton,
  ToggleLockPrivacyButton,
  WhatsAppBrandTrigger,
  PrintActionTrigger,
  PaginationPillButton,
  CollapseChevronButton,
  // Category B: Form Inputs & Selectors
  InputLuxuryText,
  InputFloatingLabel,
  InputTabularNumber,
  InputCurrencyRs,
  InputPercentageMargin,
  SearchInputGlobalCommand,
  SearchInputTableLocal,
  TextareaAutoGrow,
  SelectLuxuryPopover,
  ComboboxVirtualized,
  MultiSelectTagInput,
  CheckboxRoundedLuxury,
  RadioCardGroup,
  SwitchiOSTactile,
  SliderDiscountRange,
  InputQuantityStepper,
  PhoneInputSriLanka,
  InlineCellTextInput,
  InlineCellCurrencyInput,
  FileDropzoneDashed,
  ImagePreviewThumbnailCard,
  FormFieldValidationWrapper,
  ReadOnlyLockedField,
  PasswordPinMaskInput,
  UnitOfMeasureSelector,
  // Category C
  DateRangePickerAnalytics,
  CompletionDaysCounterInput,
  TimeSlotPickerPopover,
  FiscalQuarterSelector,
  ManufacturingYearPicker,
  AuditTimelineDateHeader,
  // Category D
  SidebarNavLinkItem,
  PageHeaderBanner,
  TabbedWorkspaceHeader,
  FullScreenPOSModeToggle,
  // Category E
  SortableColumnHeader,
  TableRowSelectionCheckbox,
  FloatingBulkActionBar,
  ActiveFilterDismissibleChip,
  TablePrimaryIdentityCell,
  TableFinancialAmountCell,
  DataTableFooterPagination,
  AttentionAlertBannerStrip,
  // Category F
  SmoothedBezierAreaChart,
  GroupedComparisonBarChart,
  DarkFloatingChartTooltip,
  LowStockAlertTickerCard,
  WorkshopBayUtilizationGauge,
  ConversionFunnelMetricBar,
  AverageTicketValueCard,
  LaborVsPartsRatioBar,
  // Category G
  WizardStepperModal,
  ToastNotificationStack,
  DestructiveActionAlertModal,
  CatalogQuickCreateModal,
  UnsavedChangesGuardDialog,
  SubletCostEntryPopover,
  SupplementaryEstimateAlertBanner,
  // Category H
  NatureOfRepairSelector,
  InsuranceAssessorAutocomplete,
  ZeroCrmCustomerBlock,
  SectionSubtotalFooterBar,
  SupplementaryLineItemBadge,
  AdvancePaymentReceiptRecorder,
  QualityCheckSignoffCard,
  VehicleVisualDamageAnnotator,
  TaxAndDiscountSummaryBlock,
  // Category I
  PosOnTheFlyCustomItemBar,
  PosWalkInCustomerHeader,
  PosCartFinancialSummary,
  PosCollectPaymentModal,
  PosSplitTenderAllocator,
  PosShiftOpenModal,
  PosShiftReconciliationSheet,
  PosLowStockWarningBadge,
  // Category J
  UnifiedProfitLedgerTable,
  DailyShopExpenseEntryForm,
  NetShopProfitSummaryCard,
  InsuranceVsCustomerReceivableSplitBar,
  HistoricalSnapshotIntegrityBadge,
  ProfitByCategoryBreakdownCard,
  RedactedCipherPlaceholder,
  // Category K: Print & Thermal Receipts
  A4PrintCanvasContainer,
  A4WorkshopServiceHeaderBanner,
  A4WorkshopBrandTitleBlock,
  A4Vehicle12FieldPrintGrid,
  A4ThreeSectionPrintTable,
  A4FinancialTotalsPrintBlock,
  A4ComputerGeneratedFooter,
  A4PriceRedactedJobCardPrint,
  Thermal80mmReceiptContainer,
  ThermalReceiptHeaderBlock,
  ThermalReceiptItemizedTable,
  ThermalTenderSummaryBlock,
  DualPrintModePreviewDrawer,
  PrintDomPrivacySanitizer,
} from '@/design-system';

describe('Global Design System & Central Manager', () => {
  describe('GlobalDesignManager Unit Tests', () => {
    it('provides immutable design tokens for porcelain surfaces, brand, and radii', () => {
      const tokens = globalDesignManager.getTokens();
      expect(tokens.surfaces.canvas).toBe(DESIGN_TOKENS.surfaces.canvas);
      expect(tokens.surfaces.canvas).toBe('#F6F8FA');
      expect(tokens.brand.terracotta).toBe('#F95700');
      expect(tokens.brand.obsidian).toBe('#0F172A');
      expect(tokens.radii.card).toBe('16px');
      expect(tokens.radii.control).toBe('10px');
    });

    it('calculates concentric inner corner radius (Inner = Outer - Padding) with zero-radius fallback', () => {
      expect(globalDesignManager.calculateInnerRadius(16, 4)).toBe(12);
      expect(globalDesignManager.calculateInnerRadius(10, 12)).toBe(0);
      expect(globalDesignManager.calculateInnerRadius(10, 10)).toBe(0);
    });

    it('returns tonal pastel badge classes for document stages', () => {
      expect(globalDesignManager.getStatusBadgeClasses('QUOTATION')).toContain('bg-blue-50');
      expect(globalDesignManager.getStatusBadgeClasses('ESTIMATE')).toContain('bg-indigo-50');
      expect(globalDesignManager.getStatusBadgeClasses('JOB_CARD')).toContain('bg-amber-50');
      expect(globalDesignManager.getStatusBadgeClasses('INVOICE')).toContain('bg-emerald-50');
      expect(globalDesignManager.getStatusBadgeClasses('UNPAID')).toContain('bg-red-50');
    });

    it('evaluates margin health thresholds correctly', () => {
      const optimal = globalDesignManager.getMarginHealth(42);
      expect(optimal.level).toBe('optimal');
      expect(optimal.textColor).toBe('text-emerald-700');

      const moderate = globalDesignManager.getMarginHealth(28);
      expect(moderate.level).toBe('moderate');
      expect(moderate.textColor).toBe('text-amber-700');

      const low = globalDesignManager.getMarginHealth(14);
      expect(low.level).toBe('low');
      expect(low.textColor).toBe('text-rose-600');

      const negative = globalDesignManager.getMarginHealth(-5);
      expect(negative.level).toBe('negative');
      expect(negative.textColor).toBe('text-red-700');
    });

    it('formats Sri Lankan Rupees with tabular numbers', () => {
      const formatted = globalDesignManager.formatRs(145000);
      expect(formatted).toContain('Rs.');
      expect(formatted).toContain('145,000.00');

      const noDec = globalDesignManager.formatRs(5000, { showDecimal: false });
      expect(noDec).toBe('Rs. 5,000');
    });

    it('enforces cost privacy permission rules', () => {
      expect(globalDesignManager.canViewCosts('CASHIER', true)).toBe(false);
      expect(globalDesignManager.canViewCosts('SERVICE_ADVISOR', true)).toBe(false);
      expect(globalDesignManager.canViewCosts('TECHNICIAN', true)).toBe(false);

      expect(globalDesignManager.canViewCosts('OWNER', true)).toBe(true);
      expect(globalDesignManager.canViewCosts('OWNER', false)).toBe(false);
      expect(globalDesignManager.canViewCosts('WORKSHOP_MANAGER', true)).toBe(true);
      expect(globalDesignManager.canViewCosts('WORKSHOP_MANAGER', false)).toBe(false);
    });

    it('sanitizes print payloads by stripping all internal buying costs and margins recursively across workshop and pos schemas', () => {
      const rawPayload = {
        jobNumber: 'JOB-2026-0001',
        customerName: 'Mr. Silva',
        sellingPriceRs: 50000,
        buyingCostRs: 28000,
        totalBuyingCostRs: 35209,
        totalCostRs: 35209,
        directCostRs: 5000,
        subletCostRs: 2500,
        grossProfitRs: 22000,
        lineGrossProfitRs: 12000,
        grossMarginPct: 44,
        marginPercent: 44,
        netShopProfit: 15000,
        items: [
          {
            description: 'Front Bumper Replacement',
            sellingPriceRs: 35000,
            buyingCostRs: 20000,
            unitBuyingCostRs: 20000,
            lineTotalCostRs: 20000,
            directCost: 20000,
            subletCost: 3000,
          },
        ],
      };

      const sanitized = globalDesignManager.sanitizePrintPayload(rawPayload);

      expect(sanitized.jobNumber).toBe('JOB-2026-0001');
      expect(sanitized.customerName).toBe('Mr. Silva');
      expect(sanitized.sellingPriceRs).toBe(50000);
      expect((sanitized as any).buyingCostRs).toBeUndefined();
      expect((sanitized as any).totalBuyingCostRs).toBeUndefined();
      expect((sanitized as any).totalCostRs).toBeUndefined();
      expect((sanitized as any).directCostRs).toBeUndefined();
      expect((sanitized as any).subletCostRs).toBeUndefined();
      expect((sanitized as any).grossProfitRs).toBeUndefined();
      expect((sanitized as any).lineGrossProfitRs).toBeUndefined();
      expect((sanitized as any).grossMarginPct).toBeUndefined();
      expect((sanitized as any).marginPercent).toBeUndefined();
      expect((sanitized as any).netShopProfit).toBeUndefined();
      expect((sanitized as any).items[0].buyingCostRs).toBeUndefined();
      expect((sanitized as any).items[0].unitBuyingCostRs).toBeUndefined();
      expect((sanitized as any).items[0].lineTotalCostRs).toBeUndefined();
      expect((sanitized as any).items[0].directCost).toBeUndefined();
      expect((sanitized as any).items[0].subletCost).toBeUndefined();
      expect((sanitized as any).items[0].sellingPriceRs).toBe(35000);
    });

    it('handles circular references in sanitizePrintPayload without throwing RangeError', () => {
      const circularPayload: any = {
        jobNumber: 'JOB-2026-9999',
        sellingPriceRs: 85000,
        buyingCostRs: 40000,
      };
      circularPayload.self = circularPayload;
      circularPayload.child = { parent: circularPayload, buyingCost: 15000, name: 'Part' };

      expect(() => globalDesignManager.sanitizePrintPayload(circularPayload)).not.toThrow();
      const sanitized = globalDesignManager.sanitizePrintPayload(circularPayload);
      expect(sanitized.jobNumber).toBe('JOB-2026-9999');
      expect((sanitized as any).buyingCostRs).toBeUndefined();
      expect((sanitized as any).child.buyingCost).toBeUndefined();
      expect((sanitized as any).child.name).toBe('Part');
    });

    it('resolves colors, concentric styles, percentages, and masked figures centrally', () => {
      expect(globalDesignManager.getColor('brand.terracotta')).toBe('#F95700');
      expect(globalDesignManager.getColor('surfaces.canvas')).toBe('#F6F8FA');
      expect(globalDesignManager.getBrandColor('obsidian')).toBe('#0F172A');
      expect(globalDesignManager.getSurfaceColor('surfacePrimary')).toBe('#FFFFFF');
      expect(globalDesignManager.getSemanticColor('emerald').text).toBe('#047857');

      expect(globalDesignManager.getConcentricStyle(16, 4)).toEqual({ borderRadius: '12px' });
      expect(globalDesignManager.getConcentricStyle(10, 10)).toEqual({ borderRadius: '0px' });

      expect(globalDesignManager.formatPercentage(42.345)).toBe('42.3%');
      expect(globalDesignManager.formatPlateNumber(' cba 1234 ')).toBe('CBA 1234');
      expect(globalDesignManager.maskSensitiveFigure(50000, true)).toBe('Rs. ••••••');
      expect(globalDesignManager.maskSensitiveFigure(50000, false)).toContain('Rs. 50,000.00');
    });
  });

  describe('Component Library Integration Tests across Categories A–K', () => {
    it('renders all 20 Category A Action Triggers with tokens and interaction handling', () => {
      const onPrimary = vi.fn();
      const onObsidian = vi.fn();
      const onSecondary = vi.fn();
      const onGhost = vi.fn();
      const onDestructive = vi.fn();
      const onSuccess = vi.fn();
      const onIcon = vi.fn();
      const onQuickAdd = vi.fn();
      const onSegment = vi.fn();
      const onIntake = vi.fn();
      const onAi = vi.fn();
      const onConfirm = vi.fn();
      const onTogglePrivacy = vi.fn();
      const onWhatsApp = vi.fn();
      const onPrint = vi.fn();
      const onPage = vi.fn();
      const onCollapse = vi.fn();

      render(
        <div>
          <ButtonPrimaryLuxury onClick={onPrimary}>Primary Luxury Action</ButtonPrimaryLuxury>
          <ButtonObsidianExecutive onClick={onObsidian}>Obsidian Stage Action</ButtonObsidianExecutive>
          <ButtonSecondaryHairline onClick={onSecondary}>Secondary Hairline</ButtonSecondaryHairline>
          <ButtonGhostMinimal onClick={onGhost}>Ghost Action</ButtonGhostMinimal>
          <ButtonDestructiveSoft onClick={onDestructive}>Delete Line</ButtonDestructiveSoft>
          <ButtonSuccessEmerald onClick={onSuccess}>Settle Invoice</ButtonSuccessEmerald>
          <ButtonIconSquare onClick={onIcon} aria-label="Square Icon Action"><span>★</span></ButtonIconSquare>
          <ButtonCircleQuickAdd onClick={onQuickAdd} />
          <SplitActionDropdownButton
            primaryLabel="Print A4"
            onPrimaryClick={vi.fn()}
            options={[{ label: 'Print 80mm', onClick: vi.fn() }]}
          />
          <SegmentedPillSwitcher
            options={[{ label: 'Quotation', value: 'quote' }, { label: 'Estimate', value: 'est' }]}
            value="quote"
            onChange={onSegment}
          />
          <FloatingActionQuickIntake onClick={onIntake} label="New Intake" />
          <HotKeyKbdChip keys="⌘K" />
          <ClipboardCopyChip text="WP CAD-1234" />
          <AiAssistActionPill onClick={onAi} label="✨ Auto-Fill Specs" />
          <HoldToConfirmButton label="Hold to Void" confirmLabel="Confirm Void" onConfirm={onConfirm} />
          <ToggleLockPrivacyButton isLocked={true} onToggle={onTogglePrivacy} />
          <WhatsAppBrandTrigger phone="0771234567" onClick={onWhatsApp} />
          <PrintActionTrigger onClick={onPrint} label="Print Document Preview" />
          <PaginationPillButton page={2} isActive={true} onClick={onPage} />
          <CollapseChevronButton isCollapsed={false} onToggle={onCollapse} label="Hide Rows" />
        </div>
      );

      const primaryBtn = screen.getByText('Primary Luxury Action');
      expect(primaryBtn).toBeInTheDocument();
      expect(primaryBtn.className).toContain('bg-[#F95700]');
      expect(primaryBtn.className).toContain('shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]');

      const obsidianBtn = screen.getByText('Obsidian Stage Action');
      expect(obsidianBtn).toBeInTheDocument();
      expect(obsidianBtn.className).toContain('bg-[#0F172A]');

      expect(screen.getByText('Secondary Hairline')).toBeInTheDocument();
      expect(screen.getByText('Ghost Action')).toBeInTheDocument();
      expect(screen.getByText('Delete Line')).toBeInTheDocument();
      expect(screen.getByText('Settle Invoice')).toBeInTheDocument();
      expect(screen.getByLabelText('Square Icon Action')).toBeInTheDocument();
      expect(screen.getByLabelText('Quick Add')).toBeInTheDocument();
      expect(screen.getByText('Print A4')).toBeInTheDocument();
      expect(screen.getByText('Quotation')).toBeInTheDocument();
      expect(screen.getByText('New Intake')).toBeInTheDocument();
      expect(screen.getByText('⌘K')).toBeInTheDocument();
      expect(screen.getByText('WP CAD-1234')).toBeInTheDocument();
      expect(screen.getByText('✨ Auto-Fill Specs')).toBeInTheDocument();
      expect(screen.getByText('Hold to Void')).toBeInTheDocument();
      expect(screen.getByText('Cost Hidden')).toBeInTheDocument();
      expect(screen.getByText(/Share via WhatsApp/)).toBeInTheDocument();
      expect(screen.getByText('Print Document Preview')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Hide Rows')).toBeInTheDocument();

      fireEvent.click(primaryBtn);
      expect(onPrimary).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('Quotation'));
      expect(onSegment).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Cost Hidden'));
      expect(onTogglePrivacy).toHaveBeenCalledTimes(1);
    });

    it('renders all 25 Category B Form Inputs and supports refs and Enter key keyboard navigation', () => {
      const onChange = vi.fn();
      const onEnterKeyDown = vi.fn();
      let textInputRef: HTMLInputElement | null = null;
      let currencyInputRef: HTMLInputElement | null = null;

      render(
        <div>
          <InputLuxuryText
            placeholder="Luxury Text Input"
            ref={(el) => { textInputRef = el; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEnterKeyDown('text');
            }}
          />
          <InputFloatingLabel label="Customer Phone" value="0771234567" onChange={onChange} />
          <InputTabularNumber placeholder="Tabular Qty" />
          <InputCurrencyRs value={45000} onChange={onChange} />
          <InputPercentageMargin marginPercent={38.5} />
          <SearchInputGlobalCommand onSearchClick={vi.fn()} placeholder="Search plate or job..." />
          <SearchInputTableLocal value="" onChange={onChange} />
          <TextareaAutoGrow placeholder="Vehicle collision damage remarks..." />
          <SelectLuxuryPopover options={[{ label: 'Cash', value: 'cash' }]} value="cash" onChange={onChange} />
          <ComboboxVirtualized items={[{ id: '1', name: 'Brake Pad Set' }]} onSelect={onChange} />
          <MultiSelectTagInput availableTags={['Accident', 'Mechanical']} selectedTags={['Accident']} onChange={onChange} />
          <CheckboxRoundedLuxury checked={true} onChange={onChange} label="Verified Checkbox" />
          <RadioCardGroup
            options={[{ id: 'insurance', title: 'Insurance Claim' }]}
            selectedId="insurance"
            onChange={onChange}
          />
          <SwitchiOSTactile checked={true} onChange={onChange} label="iOS Switch" />
          <SliderDiscountRange value={15} onChange={onChange} />
          <InputQuantityStepper value={2} onChange={onChange} />
          <PhoneInputSriLanka value="0771234567" onChange={onChange} />
          <InlineCellTextInput
            placeholder="Inline Description"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEnterKeyDown('inline-text');
            }}
          />
          <InlineCellCurrencyInput
            value={5000}
            onChange={onChange}
            ref={(el) => { currencyInputRef = el; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEnterKeyDown('inline-currency');
            }}
          />
          <FileDropzoneDashed onFilesSelected={vi.fn()} />
          <ImagePreviewThumbnailCard src="data:image/png;base64," name="Damage View" onDelete={vi.fn()} />
          <FormFieldValidationWrapper label="Job Number" required error="Job number required">
            <input type="text" defaultValue="JOB-01" />
          </FormFieldValidationWrapper>
          <ReadOnlyLockedField label="Sequential ID" value="SEC-2026-99" />
          <PasswordPinMaskInput pin="1234" onChange={onChange} />
          <UnitOfMeasureSelector value="Nos" onChange={onChange} />
        </div>
      );

      expect(screen.getByPlaceholderText('Luxury Text Input')).toBeInTheDocument();
      expect(screen.getByText('Customer Phone')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tabular Qty')).toBeInTheDocument();
      expect(screen.getByDisplayValue('45000')).toBeInTheDocument();
      expect(screen.getByText('38.5%')).toBeInTheDocument();
      expect(screen.getByText('Search plate or job...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Filter table/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Vehicle collision damage/)).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search catalog items/)).toBeInTheDocument();
      expect(screen.getByText('Accident')).toBeInTheDocument();
      expect(screen.getByText('Verified Checkbox')).toBeInTheDocument();
      expect(screen.getByText('Insurance Claim')).toBeInTheDocument();
      expect(screen.getByText('iOS Switch')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('0771234567').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText('Inline Description')).toBeInTheDocument();
      expect(screen.getByText(/Upload vehicle collision photos or invoices/)).toBeInTheDocument();
      expect(screen.getByText('Job Number')).toBeInTheDocument();
      expect(screen.getByText('Job number required')).toBeInTheDocument();
      expect(screen.getByText('Sequential ID')).toBeInTheDocument();
      expect(screen.getByText('Nos')).toBeInTheDocument();

      // Verify ref forwarding on InputLuxuryText and InlineCellCurrencyInput
      expect(textInputRef).not.toBeNull();
      expect(currencyInputRef).not.toBeNull();

      // Verify Enter key keyboard navigation on inputs
      const textInput = screen.getByPlaceholderText('Luxury Text Input');
      fireEvent.keyDown(textInput, { key: 'Enter', code: 'Enter' });
      expect(onEnterKeyDown).toHaveBeenCalledWith('text');

      const inlineTextInput = screen.getByPlaceholderText('Inline Description');
      fireEvent.keyDown(inlineTextInput, { key: 'Enter', code: 'Enter' });
      expect(onEnterKeyDown).toHaveBeenCalledWith('inline-text');

      const inlineCurrencyInput = screen.getByDisplayValue('5000');
      fireEvent.keyDown(inlineCurrencyInput, { key: 'Enter', code: 'Enter' });
      expect(onEnterKeyDown).toHaveBeenCalledWith('inline-currency');
    });

    it('renders Category C Scheduling Controls (DateRangePickerAnalytics, CompletionDaysCounterInput, TimeSlotPickerPopover, FiscalQuarterSelector, ManufacturingYearPicker, AuditTimelineDateHeader)', () => {
      render(
        <div>
          <DateRangePickerAnalytics startDate="2026-11-01" endDate="2026-11-02" onChange={vi.fn()} />
          <CompletionDaysCounterInput days={5} onChange={vi.fn()} startDate="2026-11-01" />
          <TimeSlotPickerPopover value="10:00 AM" onChange={vi.fn()} />
          <FiscalQuarterSelector quarter="Q3" onChange={vi.fn()} />
          <ManufacturingYearPicker value={2022} onChange={vi.fn()} />
          <AuditTimelineDateHeader dateLabel="Nov 2, 2026" />
        </div>
      );

      expect(screen.getByText('5 Days')).toBeInTheDocument();
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('Q3')).toBeInTheDocument();
      expect(screen.getByText('Nov 2, 2026')).toBeInTheDocument();
    });

    it('renders Category D Navigation Shell (SidebarNavLinkItem, PageHeaderBanner, TabbedWorkspaceHeader, FullScreenPOSModeToggle)', () => {
      render(
        <div>
          <SidebarNavLinkItem icon={<span>⚙</span>} label="Workshop Jobs" isActive={true} count={12} />
          <PageHeaderBanner title="Accident Estimates" subtitle="Active insurance claims" />
          <TabbedWorkspaceHeader tabs={[{ id: '1', label: 'Estimates', count: 5 }]} activeTabId="1" onTabChange={vi.fn()} />
          <FullScreenPOSModeToggle isFullScreen={false} onToggle={vi.fn()} />
        </div>
      );

      expect(screen.getByText('Workshop Jobs')).toBeInTheDocument();
      expect(screen.getByText('Accident Estimates')).toBeInTheDocument();
      expect(screen.getByText('Active insurance claims')).toBeInTheDocument();
      expect(screen.getByText('Estimates')).toBeInTheDocument();
    });

    it('renders Category E Tables & Ledgers (SortableColumnHeader, TableRowSelectionCheckbox, FloatingBulkActionBar, ActiveFilterDismissibleChip, TablePrimaryIdentityCell, TableFinancialAmountCell, DataTableFooterPagination, AttentionAlertBannerStrip)', () => {
      render(
        <div>
          <table>
            <thead>
              <tr>
                <SortableColumnHeader label="Vehicle Plate" isSorted={true} sortDirection="asc" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <TableRowSelectionCheckbox checked={true} onChange={vi.fn()} />
                  <TablePrimaryIdentityCell id="JOB-2026-0042" timestamp="Today 10:00 AM" />
                  <TableFinancialAmountCell amountRs={120000} subLabel="Customer Liability" />
                </td>
              </tr>
            </tbody>
          </table>
          <FloatingBulkActionBar selectedCount={3} actions={[{ label: 'Export', onClick: vi.fn() }]} onClear={vi.fn()} />
          <ActiveFilterDismissibleChip label="Status" value="Approved" onDismiss={vi.fn()} />
          <DataTableFooterPagination totalRecords={100} currentPage={1} pageSize={10} onPageChange={vi.fn()} />
          <AttentionAlertBannerStrip message="4 Parts Waiting" count={4} />
        </div>
      );

      expect(screen.getByText('Vehicle Plate')).toBeInTheDocument();
      expect(screen.getByText('JOB-2026-0042')).toBeInTheDocument();
      expect(screen.getByText(/120,000/)).toBeInTheDocument();
      expect(screen.getByText('3 items selected')).toBeInTheDocument();
      expect(screen.getByText('4 Parts Waiting')).toBeInTheDocument();
    });

    it('renders Category F Visualizations & Cards (SmoothedBezierAreaChart, GroupedComparisonBarChart, DarkFloatingChartTooltip, LowStockAlertTickerCard, WorkshopBayUtilizationGauge, ConversionFunnelMetricBar, AverageTicketValueCard, LaborVsPartsRatioBar)', () => {
      render(
        <div>
          <SmoothedBezierAreaChart
            title="Revenue vs Profit"
            data={[{ label: 'Mon', revenue: 100000, profit: 45000 }]}
          />
          <GroupedComparisonBarChart
            title="Workshop vs POS"
            data={[{ month: 'Nov', workshopSales: 200000, posSales: 80000 }]}
          />
          <DarkFloatingChartTooltip
            dateHeader="Nov 2, 2026"
            items={[{ label: 'Sales', valueRs: 50000, colorHex: '#F95700' }]}
            deltaText="+8.4%"
          />
          <LowStockAlertTickerCard alerts={[{ name: 'Oil Filter', sku: 'OF-01', stockQty: 2, minQty: 5 }]} />
          <WorkshopBayUtilizationGauge occupiedBays={3} totalBays={4} />
          <ConversionFunnelMetricBar quotationCount={10} jobCardCount={8} invoicedCount={6} />
          <AverageTicketValueCard workshopAvgRs={75000} posAvgRs={12000} />
          <LaborVsPartsRatioBar laborRevenueRs={60000} partsRevenueRs={40000} />
        </div>
      );

      expect(screen.getByText('Revenue vs Profit')).toBeInTheDocument();
      expect(screen.getByText('Workshop vs POS')).toBeInTheDocument();
      expect(screen.getByText('+8.4%')).toBeInTheDocument();
      expect(screen.getByText(/Low Stock Alerts/)).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Job Conversion Funnel')).toBeInTheDocument();
    });

    it('renders Category G Overlays & Modals (WizardStepperModal, ToastNotificationStack, DestructiveActionAlertModal, CatalogQuickCreateModal, UnsavedChangesGuardDialog, SubletCostEntryPopover, SupplementaryEstimateAlertBanner)', () => {
      render(
        <div>
          <WizardStepperModal open={true} onClose={vi.fn()} title="Intake Wizard" steps={['1. Details', '2. Parts']} currentStepIndex={0}>
            <div>Step 1 content</div>
          </WizardStepperModal>
          <ToastNotificationStack toasts={[{ id: 't1', message: 'Job Created', type: 'success' }]} onDismiss={vi.fn()} />
          <DestructiveActionAlertModal open={false} title="Void" warningMessage="Irreversible" onConfirm={vi.fn()} onCancel={vi.fn()} />
          <CatalogQuickCreateModal open={false} onClose={vi.fn()} onSave={vi.fn()} />
          <UnsavedChangesGuardDialog open={false} onDiscard={vi.fn()} onKeepEditing={vi.fn()} />
          <SubletCostEntryPopover subletCostRs={5000} vendorName="Lathe Works" onSave={vi.fn()} />
          <SupplementaryEstimateAlertBanner supplementaryCount={2} totalSupplementaryRs={25000} />
        </div>
      );

      expect(screen.getByText('Intake Wizard')).toBeInTheDocument();
      expect(screen.getByText('1. Details')).toBeInTheDocument();
      expect(screen.getByText('Job Created')).toBeInTheDocument();
      expect(screen.getByText(/Sublet: Rs. 5,000/)).toBeInTheDocument();
      expect(screen.getByText(/Supplementary Items Added:/)).toBeInTheDocument();
    });

    it('renders Category H Workshop Engine (NatureOfRepairSelector, InsuranceAssessorAutocomplete, ZeroCrmCustomerBlock, SectionSubtotalFooterBar, SupplementaryLineItemBadge, AdvancePaymentReceiptRecorder, QualityCheckSignoffCard, VehicleVisualDamageAnnotator, TaxAndDiscountSummaryBlock)', () => {
      render(
        <div>
          <NatureOfRepairSelector value="Accident" onChange={vi.fn()} />
          <InsuranceAssessorAutocomplete value="Ceylinco" onChange={vi.fn()} />
          <ZeroCrmCustomerBlock name="Mr. K. Perera" phone="0771234567" address="Colombo" onChange={vi.fn()} />
          <SectionSubtotalFooterBar sectionTitle="Labor R&R" subtotalRs={25000} itemCount={2} />
          <SupplementaryLineItemBadge />
          <AdvancePaymentReceiptRecorder advancePaid={10000} onRecord={vi.fn()} />
          <QualityCheckSignoffCard
            checklist={[{ id: 'qc1', label: 'Torque bolts', checked: true }]}
            onToggle={vi.fn()}
            onSignoff={vi.fn()}
          />
          <VehicleVisualDamageAnnotator damagePins={[{ id: 'p1', x: 20, y: 30, label: 'Dent' }]} />
          <TaxAndDiscountSummaryBlock subtotalRs={50000} discountRs={2000} taxRs={0} onDiscountChange={vi.fn()} onTaxChange={vi.fn()} />
        </div>
      );

      expect(screen.getByText('Accident')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mr. K. Perera')).toBeInTheDocument();
      expect(screen.getByText(/Subtotal Labor R&R/)).toBeInTheDocument();
      expect(screen.getByText('SUPPLEMENTARY')).toBeInTheDocument();
      expect(screen.getByText('Pre-Delivery Quality Inspection')).toBeInTheDocument();
      expect(screen.getByText('Visual Vehicle Damage Matrix')).toBeInTheDocument();
    });

    it('renders Category I POS Counter (PosOnTheFlyCustomItemBar, PosWalkInCustomerHeader, PosCartFinancialSummary, PosCollectPaymentModal, PosSplitTenderAllocator, PosShiftOpenModal, PosShiftReconciliationSheet, PosLowStockWarningBadge)', () => {
      render(
        <div>
          <PosOnTheFlyCustomItemBar onAddCustomItem={vi.fn()} />
          <PosWalkInCustomerHeader customerName="Mr. Walkin" vehicleNo="CBA-1234" />
          <PosCartFinancialSummary subtotalRs={10000} discountRs={500} totalRs={9500} itemCount={2} />
          <PosCollectPaymentModal open={false} orderNumber="ORD-01" totalRs={9500} onClose={vi.fn()} onComplete={vi.fn()} />
          <PosSplitTenderAllocator totalRs={9500} cashAmount={5000} cardAmount={4500} onCashChange={vi.fn()} onCardChange={vi.fn()} />
          <PosShiftOpenModal open={false} onOpenShift={vi.fn()} />
          <PosShiftReconciliationSheet openingFloatRs={5000} cashSalesRs={15000} pettyCashOutRs={1000} onCloseShift={vi.fn()} />
          <PosLowStockWarningBadge stockQty={3} />
        </div>
      );

      expect(screen.getByText('Mr. Walkin')).toBeInTheDocument();
      expect(screen.getByText('CBA-1234')).toBeInTheDocument();
      expect(screen.getByText(/9,500/)).toBeInTheDocument();
      expect(screen.getByText('Split Tender Allocation')).toBeInTheDocument();
      expect(screen.getByText('End of Shift Reconciliation')).toBeInTheDocument();
      expect(screen.getByText('Only 3 Left')).toBeInTheDocument();
    });

    it('renders Category J Finance & Privacy (UnifiedProfitLedgerTable, DailyShopExpenseEntryForm, NetShopProfitSummaryCard, InsuranceVsCustomerReceivableSplitBar, HistoricalSnapshotIntegrityBadge, ProfitByCategoryBreakdownCard, RedactedCipherPlaceholder)', () => {
      render(
        <div>
          <UnifiedProfitLedgerTable
            transactions={[
              {
                id: 'tx-1',
                type: 'WORKSHOP',
                date: '2026-11-02',
                reference: 'INV-2026-001',
                sellingPriceRs: 50000,
                directCostRs: 25000,
                grossProfitRs: 25000,
                marginPercent: 50,
              },
            ]}
          />
          <DailyShopExpenseEntryForm onAddExpense={vi.fn()} />
          <NetShopProfitSummaryCard totalGrossProfitRs={80000} totalExpensesRs={20000} />
          <InsuranceVsCustomerReceivableSplitBar insuranceReceivableRs={150000} customerReceivableRs={50000} />
          <HistoricalSnapshotIntegrityBadge isLocked={true} />
          <ProfitByCategoryBreakdownCard
            categories={[{ category: 'Labor R&R', grossProfitRs: 30000, marginPercent: 75 }]}
          />
          <RedactedCipherPlaceholder value={75000} isRedacted={true} />
          <RedactedCipherPlaceholder value={75000} isRedacted={false} />
        </div>
      );

      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
      expect(screen.getByText('Record Daily Garage Expense')).toBeInTheDocument();
      expect(screen.getByText(/60,000/)).toBeInTheDocument();
      expect(screen.getByText('Receivable Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Frozen Cost Snapshot')).toBeInTheDocument();
      expect(screen.getByText('Labor R&R')).toBeInTheDocument();
      expect(screen.getByText('Rs. ••••••')).toBeInTheDocument();
      expect(screen.getByText(/75,000/)).toBeInTheDocument();
    });

    it('renders all 13 Category K Print & Thermal Receipt Abstractions with zero cost leaks', () => {
      const handleCloseDrawer = vi.fn();

      render(
        <div>
          <PrintDomPrivacySanitizer>
            <A4PrintCanvasContainer>
              <A4WorkshopServiceHeaderBanner />
              <A4WorkshopBrandTitleBlock title="ESTIMATE / INVOICE" workshopName="500 Labs Engineering" />
              <A4Vehicle12FieldPrintGrid
                data={{
                  date: '2026-11-02',
                  jobNumber: 'JOB-2026-999',
                  vehicleNumber: 'WP CAD-5678',
                  natureOfRepair: 'Collision repair',
                  make: 'Toyota',
                  chassisNumber: 'NZE141-1234567',
                  model: 'Corolla',
                  completionDays: 3,
                  yearOfMake: '2018',
                  vehicleColor: 'Silver Metallic',
                  insuranceName: 'Ceylinco General Insurance',
                  customerInfo: 'Mr. Silva - 077 123 4567',
                }}
              />
              <A4ThreeSectionPrintTable
                sections={[
                  {
                    title: 'Labor - Remove & Reassemble',
                    items: [{ description: 'Remove Front Bumper', amountRs: 4500 }],
                    subtotalRs: 4500,
                  },
                ]}
              />
              <A4FinancialTotalsPrintBlock
                grossTotalRs={45000}
                discountRs={2000}
                taxRs={0}
                advancePaidRs={10000}
                insuranceApprovedRs={25000}
                balanceDueRs={8000}
              />
              <A4ComputerGeneratedFooter />
              <A4PriceRedactedJobCardPrint tasks={[{ id: 't1', description: 'Strip Bumper', section: 'R&R' }]} />
            </A4PrintCanvasContainer>

            <Thermal80mmReceiptContainer>
              <ThermalReceiptHeaderBlock receiptNumber="RCP-88" dateTime="2026-11-02 10:00 AM" cashierName="Kamal" />
              <ThermalReceiptItemizedTable items={[{ name: 'Engine Oil 4L', qty: 1, unitPriceRs: 8500, totalRs: 8500 }]} />
              <ThermalTenderSummaryBlock subtotalRs={8500} netTotalRs={8500} cashTenderedRs={10000} changeRs={1500} totalItems={1} />
            </Thermal80mmReceiptContainer>
          </PrintDomPrivacySanitizer>

          <DualPrintModePreviewDrawer
            open={true}
            onClose={handleCloseDrawer}
            a4Content={<div>A4 Canvas Mode Content</div>}
            thermalContent={<div>80mm Monospace Thermal Content</div>}
          />
        </div>
      );

      // Verify A4 Print components
      expect(screen.getByText('MECHANICAL | ELECTRICAL | SCANNING | TINKERING | AUTO PAINT | SPARE PARTS')).toBeInTheDocument();
      expect(screen.getByText('500 Labs Engineering')).toBeInTheDocument();
      expect(screen.getByText('ESTIMATE / INVOICE')).toBeInTheDocument();
      expect(screen.getByText('WP CAD-5678')).toBeInTheDocument();
      expect(screen.getByText('NZE141-1234567')).toBeInTheDocument();
      expect(screen.getAllByText(/Labor - Remove & Reassemble/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Remove Front Bumper')).toBeInTheDocument();
      expect(screen.getByText('Gross Total:')).toBeInTheDocument();
      expect(screen.getByText('Net Balance Due:')).toBeInTheDocument();
      expect(screen.getByText(/computer generated document/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero Prices Redacted/)).toBeInTheDocument();

      // Verify Thermal Receipt components
      expect(screen.getByText('500 LABS WORKSHOP & POS')).toBeInTheDocument();
      expect(screen.getByText(/Cashier: Kamal/)).toBeInTheDocument();
      expect(screen.getByText('Engine Oil 4L')).toBeInTheDocument();
      expect(screen.getByText('CHANGE DUE:')).toBeInTheDocument();

      // Verify Dual Print Mode Drawer and toggle
      expect(screen.getByText('Print Preview Studio')).toBeInTheDocument();
      expect(screen.getByText('A4 Canvas Mode Content')).toBeInTheDocument();
      expect(screen.queryByText('80mm Monospace Thermal Content')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('80mm Thermal Receipt'));
      expect(screen.getByText('80mm Monospace Thermal Content')).toBeInTheDocument();
    });
  });
});
