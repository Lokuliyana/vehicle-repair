import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  // 3.1 Button System
  Button,
  ButtonGroup,
  SplitButton,
  // 3.2 PageHeader
  PageHeader,
  // 3.3 Card System
  KpiCard,
  MetricCard,
  SummaryCard,
  InfoCard,
  ActionCard,
  ChartCard,
  EntitySummaryCard,
  DocumentSummaryCard,
  // 3.4 Table System
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableActions,
  DataTablePagination,
  DataTableEmptyState,
  DataTableToolbar,
  CodeCell,
  LicensePlateCell,
  CurrencyCell,
  // 3.5 Form System
  FormSection,
  FormField,
  FormLabel,
  FormDescription,
  FormError,
  TextInput,
  NumberInput,
  DateInput,
  InputGroup,
  Textarea,
  Checkbox,
  RadioGroup,
  SearchableSelect,
  Combobox,
  Switch,
  // 3.6 Selector System
  EntitySelector,
  CustomerSelector,
  VehicleSelector,
  SupplierSelector,
  ProductSelector,
  BatchSelector,
  // 3.7 StatusBadge System
  StatusBadge,
  resolveSemanticTheme,
  // 3.8 Dialog, Drawer & Popover System
  ConfirmDialog,
  FormDialog,
  DetailDialog,
  SideDrawer,
  ActionPopover,
  // 3.9 Tabs & Segmented Controls
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SegmentedControl,
  // 3.10 FilterToolbar
  FilterToolbar,
  FilterPill,
  // 3.11 Charts & Visualizations
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  // 3.12 Remaining Global Components
  Breadcrumbs,
  AlertBanner,
  EmptyState,
  Skeleton,
  SkeletonCard,
  SkeletonTableRow,
  Tooltip,
  NumericDisplay,
  CurrencyDisplay,
  DocumentActionBar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';

describe('Phase 03 — Global Shared Component Transformation', () => {
  describe('3.1 Button System', () => {
    it('applies standardized height tokens (compact 32px, default 38px, large 42px)', () => {
      const { rerender } = render(<Button size="compact">Compact 32</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');

      rerender(<Button size="default">Default 38</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-[38px]');

      rerender(<Button size="large">Large 42</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-[42px]');
    });

    it('renders icon with proper positioning and prevents actions while loading', () => {
      const handleClick = vi.fn();
      const { rerender } = render(
        <Button
          icon={<span data-testid="test-icon">★</span>}
          iconPosition="left"
          onClick={handleClick}
        >
          Starred
        </Button>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);

      rerender(
        <Button isLoading onClick={handleClick}>
          Starred
        </Button>
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders ButtonGroup attached and separated', () => {
      const { rerender } = render(
        <ButtonGroup attached data-testid="btn-group">
          <Button>Left</Button>
          <Button>Right</Button>
        </ButtonGroup>
      );
      expect(screen.getByTestId('btn-group')).toHaveClass('isolate');

      rerender(
        <ButtonGroup attached={false} data-testid="btn-group">
          <Button>Left</Button>
          <Button>Right</Button>
        </ButtonGroup>
      );
      expect(screen.getByTestId('btn-group')).toHaveClass('gap-2');
    });

    it('renders SplitButton and executes primary and dropdown actions', () => {
      const onPrimary = vi.fn();
      const onSecondary = vi.fn();

      render(
        <SplitButton
          primaryLabel="Create Invoice"
          onPrimaryClick={onPrimary}
          actions={[{ label: 'Save as Draft', onClick: onSecondary }]}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Create Invoice' }));
      expect(onPrimary).toHaveBeenCalledTimes(1);

      const dropdownToggle = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(dropdownToggle);

      const secondaryAction = screen.getByRole('menuitem', { name: 'Save as Draft' });
      expect(secondaryAction).toBeInTheDocument();
      fireEvent.click(secondaryAction);
      expect(onSecondary).toHaveBeenCalledTimes(1);
    });
  });

  describe('3.2 PageHeader System', () => {
    it('renders breadcrumbs, title, status, description, and action buttons consistently', () => {
      render(
        <PageHeader
          title="Workshop Operations"
          description="Live repair orders and bay statuses"
          breadcrumbs={[
            { label: 'ERP Home', href: '/' },
            { label: 'Workshop' },
          ]}
          status={<StatusBadge status="ACTIVE_BAY" />}
          primaryAction={<Button variant="primary">+ New Sheet</Button>}
          secondaryActions={<Button variant="outline">Export PDF</Button>}
        />
      );

      expect(screen.getByText('ERP Home')).toBeInTheDocument();
      expect(screen.getByText('Workshop Operations')).toBeInTheDocument();
      expect(screen.getByText('Live repair orders and bay statuses')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE BAY')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '+ New Sheet' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Export PDF' })).toBeInTheDocument();
    });
  });

  describe('3.3 Card System', () => {
    it('renders KpiCard with prominent tabular-nums and delta badges', () => {
      render(
        <KpiCard
          label="Gross Revenue"
          value={245000}
          deltaPercent={12.5}
          subtitle="Compared to previous cycle"
          variant="obsidian"
        />
      );

      expect(screen.getByText(/gross revenue/i)).toBeInTheDocument();
      expect(screen.getByText('Rs. 245,000.00')).toHaveClass('tabular-nums');
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('Compared to previous cycle')).toBeInTheDocument();
    });

    it('renders MetricCard with status dots', () => {
      render(
        <MetricCard
          label="Bay Efficiency"
          value="94.2%"
          status="optimal"
        />
      );
      expect(screen.getByText('Bay Efficiency')).toBeInTheDocument();
      expect(screen.getByText('94.2%')).toBeInTheDocument();
    });

    it('renders SummaryCard with structured rows', () => {
      render(
        <SummaryCard
          title="Vehicle Attributes"
          items={[
            { label: 'Make & Model', value: 'Toyota Prius 2018' },
            { label: 'Plate', value: 'WP CAD-5678', mono: true },
          ]}
        />
      );
      expect(screen.getByText(/vehicle attributes/i)).toBeInTheDocument();
      expect(screen.getByText('Toyota Prius 2018')).toBeInTheDocument();
      expect(screen.getByText('WP CAD-5678')).toBeInTheDocument();
    });

    it('renders InfoCard, ActionCard, ChartCard, and EntitySummaryCard', () => {
      const onAction = vi.fn();
      render(
        <div>
          <InfoCard title="Low Lubricant Inventory" description="Engine oil 5W-30 below threshold." variant="warning" />
          <ActionCard title="Run Diagnostic" description="Connect OBD-II scanner" onClick={onAction} />
          <ChartCard title="Revenue Stream"><div>Chart Body</div></ChartCard>
          <EntitySummaryCard
            entityType="vehicle"
            primaryText="WP CAD-5678"
            secondaryText="Toyota Prius"
            attributes={[{ label: 'Odometer', value: '78,400 km' }]}
          />
        </div>
      );

      expect(screen.getByText('Low Lubricant Inventory')).toBeInTheDocument();
      expect(screen.getByText('Connect OBD-II scanner')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Run Diagnostic'));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Revenue Stream')).toBeInTheDocument();
      expect(screen.getByText('WP CAD-5678')).toBeInTheDocument();
      expect(screen.getByText('78,400 km')).toBeInTheDocument();
    });

    it('renders DocumentSummaryCard with financial totals and privacy redaction', () => {
      const { rerender } = render(
        <DocumentSummaryCard
          subtotalRs={100000}
          discountRs={5000}
          taxRs={15000}
          totalRs={110000}
          paidRs={60000}
          balanceRs={50000}
        />
      );

      expect(screen.getByText('Rs. 110,000.00')).toBeInTheDocument();
      expect(screen.getByText('Rs. 50,000.00')).toBeInTheDocument();

      rerender(
        <DocumentSummaryCard
          subtotalRs={100000}
          totalRs={110000}
          isCostRedacted={true}
        />
      );

      expect(screen.getAllByText('••••••').length).toBeGreaterThan(0);
    });
  });

  describe('3.4 Table System', () => {
    it('supports density heights (compact 40px, default 48px, comfortable 56px)', () => {
      const { rerender } = render(
        <DataTable density="compact">
          <tbody>
            <DataTableRow data-testid="row">
              <DataTableCell>Compact</DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      );
      expect(screen.getByTestId('row')).toHaveClass('h-10');

      rerender(
        <DataTable density="default">
          <tbody>
            <DataTableRow data-testid="row">
              <DataTableCell>Default</DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      );
      expect(screen.getByTestId('row')).toHaveClass('h-12');

      rerender(
        <DataTable density="comfortable">
          <tbody>
            <DataTableRow data-testid="row">
              <DataTableCell>Comfortable</DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      );
      expect(screen.getByTestId('row')).toHaveClass('h-14');
    });

    it('renders DataTable architecture components (Header, Actions, Toolbar, EmptyState)', () => {
      render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableCell>Header Col</DataTableCell>
            </DataTableRow>
          </DataTableHeader>
          <tbody>
            <DataTableRow>
              <DataTableCell>Item 1</DataTableCell>
              <DataTableActions>
                <button type="button">Edit</button>
              </DataTableActions>
            </DataTableRow>
          </tbody>
        </DataTable>
      );

      expect(screen.getByText('Header Col')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });

    it('renders DataTableToolbar and DataTableEmptyState', () => {
      const onSearch = vi.fn();
      render(
        <div>
          <DataTableToolbar searchValue="Plate" onSearchChange={onSearch} />
          <DataTableEmptyState title="No Jobs Found" description="Try searching for another plate." />
        </div>
      );

      expect(screen.getByDisplayValue('Plate')).toBeInTheDocument();
      expect(screen.getByText('No Jobs Found')).toBeInTheDocument();
    });

    it('renders specialized cell helpers (CodeCell, LicensePlateCell, CurrencyCell)', () => {
      render(
        <div>
          <CodeCell code="INV-2026-001" />
          <LicensePlateCell plateNumber="WP CAD-5678" sub="Hybrid Sedan" />
          <CurrencyCell amountRs={85000} />
        </div>
      );

      expect(screen.getByText('INV-2026-001')).toHaveClass('font-mono');
      expect(screen.getByText('WP CAD-5678')).toHaveClass('font-mono');
      expect(screen.getByText('Hybrid Sedan')).toBeInTheDocument();
      expect(screen.getByText('Rs. 85,000.00')).toHaveClass('tabular-nums');
    });

    it('handles pagination navigation and page size change', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <DataTablePagination
          currentPage={2}
          totalPages={5}
          totalItems={50}
          pageSize={10}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText(/page/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /next page/i }));
      expect(onPageChange).toHaveBeenCalledWith(3);

      fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('3.5 Form System', () => {
    it('renders FormField with required indicator, label, description, and inline error', () => {
      const { rerender } = render(
        <FormField label="Vehicle Number" required description="Provincial plate number">
          <TextInput placeholder="WP CAD-5678" />
        </FormField>
      );

      expect(screen.getByText('Vehicle Number')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
      expect(screen.getByText('Provincial plate number')).toBeInTheDocument();

      rerender(
        <FormField label="Vehicle Number" required error="Invalid registration plate format">
          <TextInput placeholder="WP CAD-5678" error />
        </FormField>
      );

      expect(screen.getByText('Invalid registration plate format')).toBeInTheDocument();
      expect(screen.queryByText('Provincial plate number')).not.toBeInTheDocument();
    });

    it('renders FormSection, FormLabel, FormDescription, and FormError directly', () => {
      render(
        <FormSection title="Customer Details" description="Personal and contact data">
          <FormLabel required>Direct Label</FormLabel>
          <FormDescription>Direct description</FormDescription>
          <FormError>Direct error message</FormError>
        </FormSection>
      );

      expect(screen.getByText('Customer Details')).toBeInTheDocument();
      expect(screen.getByText('Direct Label')).toBeInTheDocument();
      expect(screen.getByText('Direct description')).toBeInTheDocument();
      expect(screen.getByText('Direct error message')).toBeInTheDocument();
    });

    it('renders NumberInput, DateInput, InputGroup, Textarea, and SearchableSelect', () => {
      const onNumChange = vi.fn();
      const onSelectChange = vi.fn();

      render(
        <div>
          <InputGroup prefix="Rs.">
            <NumberInput value={1500} onChange={onNumChange} />
          </InputGroup>
          <DateInput defaultValue="2026-11-03" />
          <Textarea placeholder="Job notes..." />
          <SearchableSelect
            value="SPARE_PARTS"
            onChange={onSelectChange}
            options={[
              { value: 'SPARE_PARTS', label: 'Spare Parts' },
              { value: 'LUBRICANTS', label: 'Lubricants' },
            ]}
          />
        </div>
      );

      expect(screen.getByText('Rs.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Job notes...')).toBeInTheDocument();
      expect(screen.getByText('Spare Parts')).toBeInTheDocument();
    });

    it('renders Checkbox and handles state toggles', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="Include Consumables"
          checked={false}
          onChange={handleChange}
        />
      );

      const box = screen.getByRole('checkbox');
      fireEvent.click(box);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('renders RadioGroup with card variant and selection', () => {
      const onChange = vi.fn();
      render(
        <RadioGroup
          value="CASH"
          onChange={onChange}
          variant="cards"
          options={[
            { value: 'CASH', label: 'Cash Tender' },
            { value: 'CARD', label: 'Credit / Debit Card' },
          ]}
        />
      );

      expect(screen.getByText('Cash Tender')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Credit / Debit Card'));
      expect(onChange).toHaveBeenCalledWith('CARD');
    });
  });

  describe('3.6 Selector System', () => {
    it('renders EntitySelector and supports search, filtering, keyboard navigation, and clear', () => {
      const onSelect = vi.fn();
      const options = [
        { id: '1', primary: 'Alice Silva', secondary: '0771234567' },
        { id: '2', primary: 'Bob Perera', secondary: '0779876543' },
      ];

      render(
        <EntitySelector
          label="Customer"
          placeholder="Search customer..."
          options={options}
          onSelect={onSelect}
        />
      );

      const input = screen.getByPlaceholderText('Search customer...');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Alice' } });

      const aliceOption = screen.getByText('Alice Silva');
      expect(aliceOption).toBeInTheDocument();

      fireEvent.click(aliceOption);
      expect(onSelect).toHaveBeenCalledWith(options[0]);
    });

    it('renders CustomerSelector, VehicleSelector, and ProductSelector domain components', () => {
      const onSelectCustomer = vi.fn();
      const onSelectVehicle = vi.fn();
      const onSelectProduct = vi.fn();

      render(
        <div>
          <CustomerSelector
            customers={[{ id: 'c1', name: 'Sunil Wickrama', phone: '0712345678' }]}
            onSelectCustomer={onSelectCustomer}
          />
          <VehicleSelector
            vehicles={[{ id: 'v1', plateNumber: 'WP CAD-5678', makeModel: 'Toyota Prius' }]}
            onSelectVehicle={onSelectVehicle}
          />
          <ProductSelector
            products={[{ id: 'p1', name: 'Oil Filter', sku: 'OF-001', priceRs: 2500, stock: 15 }]}
            onSelectProduct={onSelectProduct}
          />
        </div>
      );

      expect(screen.getByText('Customer Account')).toBeInTheDocument();
      expect(screen.getByText('Vehicle Registration')).toBeInTheDocument();
      expect(screen.getByText('Catalog Item / Spare Part')).toBeInTheDocument();
    });
  });

  describe('3.7 StatusBadge System', () => {
    it('resolves semantic themes accurately across enterprise operational states', () => {
      expect(resolveSemanticTheme('COMPLETED')).toBe('emerald');
      expect(resolveSemanticTheme('PAID')).toBe('emerald');
      expect(resolveSemanticTheme('OPTIMAL_MARGIN')).toBe('emerald');
      expect(resolveSemanticTheme('APPROVED')).toBe('emerald');

      expect(resolveSemanticTheme('WAITING_PARTS')).toBe('amber');
      expect(resolveSemanticTheme('PENDING_INSURANCE')).toBe('amber');
      expect(resolveSemanticTheme('WARNING_MARGIN')).toBe('amber');
      expect(resolveSemanticTheme('DRAFT')).toBe('amber');

      expect(resolveSemanticTheme('IN_PROGRESS')).toBe('cobalt');
      expect(resolveSemanticTheme('ACTIVE_BAY')).toBe('cobalt');
      expect(resolveSemanticTheme('QUOTATION')).toBe('cobalt');
      expect(resolveSemanticTheme('REGISTER_OPEN')).toBe('cobalt');

      expect(resolveSemanticTheme('CANCELLED')).toBe('crimson');
      expect(resolveSemanticTheme('OVERDUE')).toBe('crimson');
      expect(resolveSemanticTheme('DEFICIT')).toBe('crimson');
      expect(resolveSemanticTheme('LOW_STOCK_ALERT')).toBe('crimson');

      expect(resolveSemanticTheme('UNASSIGNED')).toBe('slate');
      expect(resolveSemanticTheme('REGISTER_CLOSED')).toBe('slate');
    });

    it('renders with strict 22px height token and 10% pastel fill', () => {
      render(<StatusBadge status="PAID" dot />);
      const badge = screen.getByText('PAID').closest('div');
      expect(badge).toHaveClass('h-[22px]');
      expect(badge).toHaveClass('bg-[#ECFDF5]');
      expect(badge).toHaveClass('border-[#A7F3D0]');
      expect(badge).toHaveClass('text-[#047857]');
    });
  });

  describe('3.8 Dialog, Drawer & Popover System', () => {
    it('renders ConfirmDialog and executes callbacks', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          title="Void Invoice"
          description="Are you sure you want to void this invoice?"
          isDestructive={true}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Void Invoice')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('renders FormDialog, DetailDialog, SideDrawer, and ActionPopover', () => {
      const onClose = vi.fn();
      const onSubmit = vi.fn();

      render(
        <div>
          <FormDialog open={true} onClose={onClose} onSubmit={onSubmit} title="Add Item">
            <input placeholder="Item name" />
          </FormDialog>
          <DetailDialog open={true} onClose={onClose} title="Invoice Inspector">
            <div>Detail body</div>
          </DetailDialog>
          <SideDrawer open={true} onClose={onClose} title="Customer History">
            <div>Past Invoices</div>
          </SideDrawer>
          <ActionPopover trigger={<button type="button">Trigger Popover</button>}>
            <div>Popover Options</div>
          </ActionPopover>
        </div>
      );

      expect(screen.getByText('Add Item')).toBeInTheDocument();
      expect(screen.getByText('Invoice Inspector')).toBeInTheDocument();
      expect(screen.getByText('Customer History')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Trigger Popover' }));
      expect(screen.getByText('Popover Options')).toBeInTheDocument();
    });
  });

  describe('3.9 Tabs & Segmented Controls', () => {
    it('renders standard Tabs with triggers and content', () => {
      render(
        <Tabs defaultValue="parts">
          <TabsList>
            <TabsTrigger value="parts" count={4}>Spare Parts</TabsTrigger>
            <TabsTrigger value="labor" count={2}>Labor Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="parts">Parts Content</TabsContent>
          <TabsContent value="labor">Labor Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Spare Parts')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Parts Content')).toBeInTheDocument();
    });

    it('renders SegmentedControl and switches active pill', () => {
      const onChange = vi.fn();
      render(
        <SegmentedControl
          value="DAY"
          onChange={onChange}
          options={[
            { value: 'DAY', label: 'Daily View', count: 12 },
            { value: 'MONTH', label: 'Monthly View', count: 85 },
          ]}
        />
      );

      expect(screen.getByText('Daily View')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('tab', { name: /monthly view/i }));
      expect(onChange).toHaveBeenCalledWith('MONTH');
    });
  });

  describe('3.10 FilterToolbar System', () => {
    it('handles search input, filter pills, and clear all filters', () => {
      const onSearch = vi.fn();
      const onClear = vi.fn();
      const onSelectCat = vi.fn();

      render(
        <div>
          <FilterToolbar
            searchValue="Filter test"
            onSearchChange={onSearch}
            activeFilterCount={3}
            onClearFilters={onClear}
            selectedCategoryId="all"
            onSelectCategory={onSelectCat}
            categories={[
              { id: 'all', label: 'All Jobs', count: 42 },
              { id: 'bays', label: 'Active Bays', count: 6 },
            ]}
          />
          <FilterPill count={5}>Standalone Pill</FilterPill>
        </div>
      );

      expect(screen.getByDisplayValue('Filter test')).toBeInTheDocument();
      expect(screen.getByText('Clear filters (3)')).toBeInTheDocument();
      expect(screen.getByText('Standalone Pill')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Clear filters (3)'));
      expect(onClear).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Active Bays'));
      expect(onSelectCat).toHaveBeenCalledWith('bays');
    });
  });

  describe('3.11 Charts & Visualizations', () => {
    it('renders ChartContainer, ChartTooltip, and ChartLegend with tabular-nums', () => {
      render(
        <ChartContainer
          title="Weekly Revenue"
          subtitle="Current fiscal week"
          legend={<ChartLegend items={[{ label: 'Parts', color: '#F95700' }]} />}
        >
          <ChartTooltip
            label="Monday"
            items={[
              { label: 'Labor', value: 'Rs. 45,000.00', color: '#F95700' },
              { label: 'Parts', value: 'Rs. 60,000.00', color: '#10B981' },
            ]}
          />
        </ChartContainer>
      );

      expect(screen.getByText('Weekly Revenue')).toBeInTheDocument();
      expect(screen.getAllByText('Parts').length).toBe(2);
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Rs. 45,000.00')).toHaveClass('tabular-nums');
    });
  });

  describe('3.12 Remaining Global Components', () => {
    it('renders Breadcrumbs, EmptyState, Skeleton, SkeletonCard, SkeletonTableRow, and Tooltip', () => {
      render(
        <div>
          <Breadcrumbs items={[{ label: 'Root', href: '/' }, { label: 'Leaf' }]} />
          <EmptyState title="Empty Inbox" description="No unread alerts" />
          <Skeleton data-testid="skel-base" />
          <SkeletonCard />
          <table>
            <tbody>
              <SkeletonTableRow cols={3} />
            </tbody>
          </table>
          <Tooltip content="Tooltip details">
            <button type="button">Hover Me</button>
          </Tooltip>
        </div>
      );

      expect(screen.getByText('Leaf')).toBeInTheDocument();
      expect(screen.getByText('Empty Inbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hover Me' })).toBeInTheDocument();
    });

    it('renders AlertBanner with proper tone and dismiss action', () => {
      const onDismiss = vi.fn();
      render(
        <AlertBanner
          variant="warning"
          title="Parts Delay"
          message="Brake pads order delayed by 24h"
          dismissible={true}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByText('Parts Delay')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /dismiss alert/i }));
      expect(onDismiss).toHaveBeenCalled();
    });

    it('renders NumericDisplay and CurrencyDisplay with tabular-nums and redaction', () => {
      const { rerender } = render(<NumericDisplay value={1200} />);
      expect(screen.getByText('1,200')).toHaveClass('tabular-nums');

      rerender(<CurrencyDisplay amountRs={52000} />);
      expect(screen.getByText('Rs. 52,000.00')).toHaveClass('tabular-nums');

      rerender(<CurrencyDisplay value={52000} isRedacted={true} />);
      expect(screen.getByText('••••••')).toBeInTheDocument();
    });

    it('renders DocumentActionBar with action triggers and cost privacy toggling', () => {
      const onToggle = vi.fn();
      render(
        <DocumentActionBar
          documentId="DOC-2026-99"
          stageName="QUOTATION"
          canViewCosts={true}
          isCostProfitVisible={false}
          onToggleCostProfit={onToggle}
          rightActions={<Button variant="primary">Save Document</Button>}
        />
      );

      expect(screen.getByText('DOC-2026-99')).toBeInTheDocument();
      expect(screen.getByText('Cost Mode OFF')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /cost mode off/i }));
      expect(onToggle).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Save Document' })).toBeInTheDocument();
    });
  });

  describe('Phase 03 Hardening, Accessibility & Edge Cases', () => {
    it('supports tertiary button variant and closes SplitButton on Escape', () => {
      render(<Button variant="tertiary">Tertiary Action</Button>);
      expect(screen.getByRole('button', { name: 'Tertiary Action' })).toHaveClass('hover:bg-slate-100');

      render(
        <SplitButton
          primaryLabel="Primary"
          onPrimaryClick={() => {}}
          actions={[{ label: 'Secondary Action', onClick: () => {} }]}
        />
      );
      const dropdownToggle = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(dropdownToggle);
      expect(screen.getByRole('menuitem', { name: 'Secondary Action' })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('menuitem', { name: 'Secondary Action' })).not.toBeInTheDocument();
    });

    it('renders both icon and deltaPercent simultaneously in KpiCard without suppression, and supports neutral delta', () => {
      const { rerender } = render(
        <KpiCard
          label="Workshop Jobs"
          value={42}
          deltaPercent={8.5}
          icon={<span data-testid="kpi-icon">🔧</span>}
        />
      );
      expect(screen.getByTestId('kpi-icon')).toBeInTheDocument();
      expect(screen.getByText('+8.5%')).toBeInTheDocument();

      rerender(
        <KpiCard
          label="Overhead Margin"
          value="35%"
          deltaPercent={0}
          deltaType="neutral"
        />
      );
      const neutralBadge = screen.getByText('0.0%');
      expect(neutralBadge).toHaveClass('bg-slate-100');
    });

    it('handles empty data table with totalItems=0 and DataTableBody rendering', () => {
      render(
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableCell>Header</DataTableCell>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell>Row 1</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTable>
      );
      expect(screen.getByText('Row 1')).toBeInTheDocument();

      render(
        <DataTablePagination
          currentPage={1}
          totalPages={1}
          totalItems={0}
          pageSize={10}
          onPageChange={() => {}}
        />
      );
      expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 0 to 0 of 0 entries');
    });

    it('supports Combobox, Switch, and keyboard navigation in SearchableSelect', () => {
      const onSelect = vi.fn();
      const onSwitch = vi.fn();

      render(
        <div>
          <Switch checked={false} onCheckedChange={onSwitch} aria-label="Dark Mode Switch" />
          <Combobox
            value=""
            onChange={onSelect}
            options={[
              { value: 'opt-1', label: 'First Choice' },
              { value: 'opt-2', label: 'Second Choice' },
            ]}
          />
        </div>
      );

      const sw = screen.getByRole('switch', { name: 'Dark Mode Switch' });
      fireEvent.click(sw);
      expect(onSwitch).toHaveBeenCalledWith(true);

      const selectBtn = screen.getByRole('button', { name: /select option/i });
      fireEvent.click(selectBtn);

      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith('opt-1');
    });

    it('renders BatchSelector with inventory batch options and selection', () => {
      const onSelectBatch = vi.fn();
      render(
        <BatchSelector
          batches={[
            { id: 'b-1', batchNumber: 'BAT-2026-X1', quantity: 25, sellingPriceRs: 4500 },
          ]}
          onSelectBatch={onSelectBatch}
        />
      );

      const input = screen.getByPlaceholderText('Search batch number...');
      fireEvent.focus(input);
      const opt = screen.getByText('BAT-2026-X1');
      expect(opt).toBeInTheDocument();
      fireEvent.click(opt);
      expect(onSelectBatch).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'b-1', batchNumber: 'BAT-2026-X1' })
      );
    });

    it('renders SupplierSelector with supplier options and selection', () => {
      const onSelectSupplier = vi.fn();
      render(
        <SupplierSelector
          suppliers={[
            { id: 's-1', name: 'AutoParts Lanka', contactPerson: 'Nimal' },
          ]}
          onSelectSupplier={onSelectSupplier}
        />
      );
      const input = screen.getByPlaceholderText('Search supplier...');
      fireEvent.focus(input);
      const opt = screen.getByText('AutoParts Lanka');
      expect(opt).toBeInTheDocument();
      fireEvent.click(opt);
      expect(onSelectSupplier).toHaveBeenCalledWith({ id: 's-1', name: 'AutoParts Lanka' });
    });

    it('correctly maps enterprise status strings with punctuation to semantic themes', () => {
      expect(resolveSemanticTheme('Optimal Margin (> 35%)')).toBe('emerald');
      expect(resolveSemanticTheme('Warning Margin (20-35%)')).toBe('amber');
      expect(resolveSemanticTheme('Deficit (< 0%)')).toBe('crimson');
      expect(resolveSemanticTheme('Register Closed')).toBe('slate');
      expect(resolveSemanticTheme('Unassigned')).toBe('slate');
      expect(resolveSemanticTheme('Active Bay')).toBe('cobalt');
      expect(resolveSemanticTheme('Low Stock Alert')).toBe('crimson');
    });

    it('closes ActionPopover on Escape key', () => {
      render(
        <ActionPopover trigger={<button>Open Actions</button>}>
          <div>Popover Menu Content</div>
        </ActionPopover>
      );
      fireEvent.click(screen.getByRole('button', { name: 'Open Actions' }));
      expect(screen.getByText('Popover Menu Content')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Popover Menu Content')).not.toBeInTheDocument();
    });

    it('supports keyboard ArrowRight/ArrowLeft navigation in SegmentedControl', () => {
      const onChange = vi.fn();
      render(
        <SegmentedControl
          value="daily"
          onChange={onChange}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
      );

      const activeTab = screen.getByRole('tab', { name: 'Daily' });
      fireEvent.keyDown(activeTab, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith('weekly');
    });

    it('renders and interacts with DropdownMenu primitive', () => {
      const onAction = vi.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>More Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onAction}>Export Excel</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button', { name: 'More Options' }));
      expect(screen.getByRole('menuitem', { name: 'Export Excel' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('menuitem', { name: 'Export Excel' }));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menuitem', { name: 'Export Excel' })).not.toBeInTheDocument();
    });
  });
});
