import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
    it('renders text input and accepts typing', () => {
      render(<Input placeholder="Registration Number" />);
      const input = screen.getByPlaceholderText('Registration Number');
      expect(input).toBeInTheDocument();
      fireEvent.change(input, { target: { value: 'WP CAD-5678' } });
      expect(input).toHaveValue('WP CAD-5678');
    });

    it('applies error styling when error prop is true', () => {
      render(<Input placeholder="Required field" error />);
      const input = screen.getByPlaceholderText('Required field');
      expect(input.className).toContain('border-red-500');
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
    it('renders semantic table structure cleanly', () => {
      render(
        <Table>
          <TableHeader>
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
