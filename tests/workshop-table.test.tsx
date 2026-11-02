import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkshopTable } from '@/components/workshop/WorkshopTable';
import { WorkshopLineItem } from '@/types';

function TestWorkshopTableWrapper({
  isCostProfitVisible = false,
  isJobCardMode = false,
}: {
  isCostProfitVisible?: boolean;
  isJobCardMode?: boolean;
}) {
  const [items, setItems] = useState<WorkshopLineItem[]>([
    {
      id: 'item-1',
      rowNo: 1,
      category: 'LABOR_REMOVE_REASSEMBLE',
      description: 'Remove Front Bumper',
      sellingPriceRs: 3500,
      buyingCostRs: 1000,
      assignedTechnician: 'Tech A',
      isCompleted: false,
    },
  ]);

  return (
    <WorkshopTable
      category="LABOR_REMOVE_REASSEMBLE"
      title="1. Labor - Remove & Reassemble"
      sectionNumber={1}
      items={items}
      isCostProfitVisible={isCostProfitVisible}
      isJobCardMode={isJobCardMode}
      onItemsChange={setItems}
    />
  );
}

describe('WorkshopTable Component & Keyboard Ergonomics', () => {
  it('renders section header, row items, and subtotal correctly', () => {
    render(<TestWorkshopTableWrapper />);

    expect(screen.getByText(/1\. Labor - Remove & Reassemble/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Remove Front Bumper')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3500')).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 3,500.00').length).toBeGreaterThan(0);
  });

  it('hides Buying Cost and Profit columns when isCostProfitVisible is false', () => {
    render(<TestWorkshopTableWrapper isCostProfitVisible={false} />);

    expect(screen.queryByText(/Buying Cost/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Line Profit/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('cost-input-item-1')).not.toBeInTheDocument();
  });

  it('reveals Buying Cost and Profit columns when isCostProfitVisible is true', () => {
    render(<TestWorkshopTableWrapper isCostProfitVisible={true} />);

    expect(screen.getByText(/Buying Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Line Profit/i)).toBeInTheDocument();
    expect(screen.getByTestId('cost-input-item-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('appends a new row when Enter key is pressed in the amount field', async () => {
    render(<TestWorkshopTableWrapper isCostProfitVisible={false} />);

    const amountInput = screen.getByTestId('amount-input-item-1');
    expect(amountInput).toBeInTheDocument();

    // Initial count: 1 row
    expect(screen.getAllByRole('row').length).toBe(3); // thead + 1 tbody row + tfoot

    // Press Enter in amount field
    fireEvent.keyDown(amountInput, { key: 'Enter', code: 'Enter' });

    // Should now have 2 items in table
    const descInputs = screen.getAllByPlaceholderText(
      'Enter repair or replacement item description...'
    );
    expect(descInputs.length).toBe(2);
  });

  it('switches to Job Card mode: hides monetary columns and shows technician inputs', () => {
    render(<TestWorkshopTableWrapper isJobCardMode={true} />);

    expect(screen.queryByText('Amount (Rs.)')).not.toBeInTheDocument();
    expect(screen.getByText('Assigned Technician')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByTestId('tech-input-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('completed-check-item-1')).toBeInTheDocument();
  });
});
