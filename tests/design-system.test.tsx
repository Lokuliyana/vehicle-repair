import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ToastProvider, useToast } from '@/components/ui/toast';

describe('Design System Primitives (Phase 1 Atomic Components)', () => {
  describe('Button Primitive', () => {
    it('renders with default variant and size classes', () => {
      render(<Button>Click Me</Button>);
      const btn = screen.getByRole('button', { name: 'Click Me' });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain('bg-slate-900');
      expect(btn.className).toContain('rounded-[10px]');
    });

    it('applies variant classes for outline, warning, destructive, and ghost', () => {
      const { rerender } = render(<Button variant="warning">Warning Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-amber-500');

      rerender(<Button variant="destructive">Delete Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');

      rerender(<Button variant="outline">Outline Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-slate-300');

      rerender(<Button variant="ghost">Ghost Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-slate-700');
    });

    it('supports luxury primary, obsidian, and soft-destructive variants with top inner highlight', () => {
      const { rerender } = render(<Button variant="primary">Primary Luxury</Button>);
      const primaryBtn = screen.getByRole('button');
      expect(primaryBtn.className).toContain('bg-[#F95700]');
      expect(primaryBtn.className).toContain('shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]');

      rerender(<Button variant="obsidian">Obsidian Exec</Button>);
      const obsidianBtn = screen.getByRole('button');
      expect(obsidianBtn.className).toContain('bg-[#0F172A]');

      rerender(<Button variant="soft-destructive">Remove Row</Button>);
      const softDestructiveBtn = screen.getByRole('button');
      expect(softDestructiveBtn.className).toContain('bg-red-50');
      expect(softDestructiveBtn.className).toContain('text-red-700');
    });

    it('disables interactions when disabled attribute is present', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const btn = screen.getByRole('button');
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
      expect(btn).toBeDisabled();
    });
  });

  describe('Input Primitive', () => {
    it('renders text input and accepts typing with h-10 and rounded-[10px]', () => {
      render(<Input placeholder="Registration Number" />);
      const input = screen.getByPlaceholderText('Registration Number');
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('h-10');
      expect(input.className).toContain('rounded-[10px]');
      fireEvent.change(input, { target: { value: 'WP CAD-5678' } });
      expect(input).toHaveValue('WP CAD-5678');
    });

    it('applies error styling when error prop is true', () => {
      render(<Input placeholder="Required field" error />);
      const input = screen.getByPlaceholderText('Required field');
      expect(input.className).toContain('border-red-500');
    });
  });

  describe('Select Primitive', () => {
    it('renders select with h-10, rounded-[10px], and hairline border', () => {
      render(
        <Select aria-label="Repair Stage" defaultValue="ESTIMATE">
          <option value="QUOTATION">Quotation</option>
          <option value="ESTIMATE">Estimate</option>
        </Select>
      );
      const select = screen.getByRole('combobox', { name: 'Repair Stage' });
      expect(select).toBeInTheDocument();
      expect(select.className).toContain('h-10');
      expect(select.className).toContain('rounded-[10px]');
      expect(select.className).toContain('border-slate-200/80');
      expect(select).toHaveValue('ESTIMATE');
    });
  });

  describe('Card Primitive', () => {
    it('enforces rounded-2xl bg-white border border-slate-900/[0.06] and shadow', () => {
      render(
        <Card data-testid="test-card">
          <CardHeader>
            <CardTitle>Repair Sheet Overview</CardTitle>
            <CardDescription>Job status and telemetry</CardDescription>
          </CardHeader>
          <CardContent>Body content</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );
      const card = screen.getByTestId('test-card');
      expect(card.className).toContain('rounded-2xl');
      expect(card.className).toContain('bg-white');
      expect(card.className).toContain('border-slate-900/[0.06]');
      expect(screen.getByText('Repair Sheet Overview')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
      expect(screen.getByText('Footer actions')).toBeInTheDocument();
    });
  });

  describe('Badge Primitive', () => {
    it('renders stage badges with proper color schemes', () => {
      const { rerender } = render(<Badge variant="quotation">QUOTATION</Badge>);
      expect(screen.getByText('QUOTATION')).toHaveClass('bg-blue-50');

      rerender(<Badge variant="estimate">ESTIMATE</Badge>);
      expect(screen.getByText('ESTIMATE')).toHaveClass('bg-indigo-50');

      rerender(<Badge variant="jobCard">JOB CARD</Badge>);
      expect(screen.getByText('JOB CARD')).toHaveClass('bg-amber-50');

      rerender(<Badge variant="invoice">INVOICE</Badge>);
      expect(screen.getByText('INVOICE')).toHaveClass('bg-emerald-50');

      rerender(<Badge variant="destructive">UNPAID</Badge>);
      expect(screen.getByText('UNPAID')).toHaveClass('bg-red-100');
    });

    it('renders luxury tonal pastel pills for emerald, amber, cobalt, crimson, and terracotta', () => {
      const { rerender } = render(<Badge variant="terracotta">PRIMARY</Badge>);
      expect(screen.getByText('PRIMARY')).toHaveClass('bg-[#FFF7ED]');
      expect(screen.getByText('PRIMARY')).toHaveClass('text-[#F95700]');

      rerender(<Badge variant="emerald">OPTIMAL</Badge>);
      expect(screen.getByText('OPTIMAL')).toHaveClass('bg-emerald-50');

      rerender(<Badge variant="amber">PENDING</Badge>);
      expect(screen.getByText('PENDING')).toHaveClass('bg-amber-50');

      rerender(<Badge variant="cobalt">IN PROGRESS</Badge>);
      expect(screen.getByText('IN PROGRESS')).toHaveClass('bg-blue-50');

      rerender(<Badge variant="crimson">OVERDUE</Badge>);
      expect(screen.getByText('OVERDUE')).toHaveClass('bg-red-50');
    });
  });

  describe('Dialog Primitive', () => {
    function DialogHarness() {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogClose onClick={() => setIsOpen(false)} />
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>Are you sure you want to proceed?</DialogDescription>
            </DialogHeader>
            <div data-testid="dialog-body">Dialog Content Area</div>
            <DialogFooter>
              <Button onClick={() => setIsOpen(false)}>Close Modal</Button>
            </DialogFooter>
          </Dialog>
        </div>
      );
    }

    it('renders dialog header, title, and body when open is true', () => {
      render(<DialogHarness />);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-body')).toBeInTheDocument();
    });

    it('closes dialog on escape key press', () => {
      render(<DialogHarness />);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });

    it('closes dialog on close button click', () => {
      render(<DialogHarness />);
      const closeBtn = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeBtn);
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });
  });

  describe('Sheet Primitive', () => {
    function SheetHarness() {
      const [open, setOpen] = useState(true);
      return (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetHeader>
            <SheetTitle>Slide Drawer</SheetTitle>
            <SheetDescription>Drawer description details</SheetDescription>
          </SheetHeader>
          <div data-testid="sheet-body">Slide-over content</div>
          <SheetFooter>
            <Button onClick={() => setOpen(false)}>Dismiss Sheet</Button>
          </SheetFooter>
        </Sheet>
      );
    }

    it('renders slide drawer and closes on escape key', () => {
      render(<SheetHarness />);
      expect(screen.getByText('Slide Drawer')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-body')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByText('Slide Drawer')).not.toBeInTheDocument();
    });
  });

  describe('Tabs Primitive', () => {
    it('switches between tab panels cleanly', () => {
      render(
        <Tabs defaultValue="quotation">
          <TabsList>
            <TabsTrigger value="quotation">Quotation Mode</TabsTrigger>
            <TabsTrigger value="jobcard">Job Card Mode</TabsTrigger>
          </TabsList>
          <TabsContent value="quotation">Quotation View Active</TabsContent>
          <TabsContent value="jobcard">Job Card View Active</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Quotation View Active')).toBeInTheDocument();
      expect(screen.queryByText('Job Card View Active')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Job Card Mode' }));
      expect(screen.queryByText('Quotation View Active')).not.toBeInTheDocument();
      expect(screen.getByText('Job Card View Active')).toBeInTheDocument();
    });
  });

  describe('Switch Primitive', () => {
    it('toggles switch state and triggers onCheckedChange', () => {
      const handleToggle = vi.fn();
      const { rerender } = render(
        <Switch checked={false} onCheckedChange={handleToggle} aria-label="Cost Privacy" />
      );

      const toggle = screen.getByRole('switch', { name: 'Cost Privacy' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(toggle);
      expect(handleToggle).toHaveBeenCalledWith(true);

      rerender(<Switch checked={true} onCheckedChange={handleToggle} aria-label="Cost Privacy" />);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Toast Primitive', () => {
    function ToastTriggerHarness() {
      const { toast } = useToast();
      return (
        <button
          onClick={() =>
            toast({
              title: 'Saved Successfully',
              message: 'Quotation created without errors.',
              type: 'success',
              duration: 1000,
            })
          }
        >
          Send Toast
        </button>
      );
    }

    it('triggers and renders a toast notification', () => {
      render(
        <ToastProvider>
          <ToastTriggerHarness />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Send Toast'));
      expect(screen.getByText('Saved Successfully')).toBeInTheDocument();
      expect(screen.getByText('Quotation created without errors.')).toBeInTheDocument();
    });

    it('dismisses toast when close icon is clicked', () => {
      render(
        <ToastProvider>
          <ToastTriggerHarness />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Send Toast'));
      expect(screen.getByText('Saved Successfully')).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /dismiss toast/i });
      fireEvent.click(dismissBtn);

      expect(screen.queryByText('Saved Successfully')).not.toBeInTheDocument();
    });
  });

  describe('Table Primitive', () => {
    it('renders semantic table structure cleanly with warm sand header', () => {
      render(
        <Table>
          <TableHeader variant="warm">
            <TableRow>
              <TableHead>Col 1</TableHead>
              <TableHead>Col 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Val 1</TableCell>
              <TableCell>Val 2</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Col 1')).toBeInTheDocument();
      expect(screen.getByText('Val 1')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });
});

