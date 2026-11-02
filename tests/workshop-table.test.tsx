import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkshopTable } from '@/components/workshop/WorkshopTable';
import { WorkshopLineItem } from '@/types';

function TestWorkshopTableWrapper({
  initialItems,
  isCostProfitVisible = false,
  isJobCardMode = false,
}: {
  initialItems?: WorkshopLineItem[];
  isCostProfitVisible?: boolean;
  isJobCardMode?: boolean;
}) {
  const [items, setItems] = useState<WorkshopLineItem[]>(
    initialItems || [
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
    ]
  );

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

  it('appends a new row when Enter key is pressed in the amount field (Staff View)', async () => {
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

  it('advances focus from Description to Amount on Enter key', () => {
    render(<TestWorkshopTableWrapper isCostProfitVisible={false} />);

    const descInput = screen.getByTestId('desc-input-item-1');
    const amountInput = screen.getByTestId('amount-input-item-1');

    descInput.focus();
    expect(document.activeElement).toBe(descInput);

    fireEvent.keyDown(descInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(amountInput);
  });

  it('advances focus from Amount to Buying Cost on Enter key when isCostProfitVisible is true', () => {
    render(<TestWorkshopTableWrapper isCostProfitVisible={true} />);

    const amountInput = screen.getByTestId('amount-input-item-1');
    const costInput = screen.getByTestId('cost-input-item-1');

    amountInput.focus();
    expect(document.activeElement).toBe(amountInput);

    fireEvent.keyDown(amountInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(costInput);

    // Pressing Enter in cost input appends a new row
    fireEvent.keyDown(costInput, { key: 'Enter', code: 'Enter' });
    const descInputs = screen.getAllByPlaceholderText(
      'Enter repair or replacement item description...'
    );
    expect(descInputs.length).toBe(2);
  });

  it('navigates vertically across rows with ArrowUp and ArrowDown keys', () => {
    const twoRows: WorkshopLineItem[] = [
      {
        id: 'row-1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'First Task',
        sellingPriceRs: 2000,
        buyingCostRs: 500,
        assignedTechnician: 'Tech 1',
        isCompleted: false,
      },
      {
        id: 'row-2',
        rowNo: 2,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Second Task',
        sellingPriceRs: 4000,
        buyingCostRs: 1000,
        assignedTechnician: 'Tech 2',
        isCompleted: false,
      },
    ];

    render(<TestWorkshopTableWrapper initialItems={twoRows} isCostProfitVisible={false} />);

    const desc1 = screen.getByTestId('desc-input-row-1');
    const desc2 = screen.getByTestId('desc-input-row-2');

    desc1.focus();
    expect(document.activeElement).toBe(desc1);

    // Arrow down moves to desc2
    fireEvent.keyDown(desc1, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(document.activeElement).toBe(desc2);

    // Arrow up moves back to desc1
    fireEvent.keyDown(desc2, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(document.activeElement).toBe(desc1);
  });

  it('switches to Job Card mode: hides monetary columns and advances Description to Tech on Enter', () => {
    render(<TestWorkshopTableWrapper isJobCardMode={true} />);

    expect(screen.queryByText('Amount (Rs.)')).not.toBeInTheDocument();
    expect(screen.getByText('Assigned Technician')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    const descInput = screen.getByTestId('desc-input-item-1');
    const techInput = screen.getByTestId('tech-input-item-1');

    descInput.focus();
    fireEvent.keyDown(descInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(techInput);

    // Pressing Enter on tech input in Job Card mode creates new row
    fireEvent.keyDown(techInput, { key: 'Enter', code: 'Enter' });
    const descInputs = screen.getAllByPlaceholderText(
      'Enter repair or replacement item description...'
    );
    expect(descInputs.length).toBe(2);
  });

  it('deletes a row and renumbers remaining rows sequentially', () => {
    const twoRows: WorkshopLineItem[] = [
      {
        id: 'del-1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Task to keep',
        sellingPriceRs: 2000,
        buyingCostRs: 500,
        isCompleted: false,
      },
      {
        id: 'del-2',
        rowNo: 2,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Task to delete',
        sellingPriceRs: 4000,
        buyingCostRs: 1000,
        isCompleted: false,
      },
    ];

    render(<TestWorkshopTableWrapper initialItems={twoRows} />);

    const deleteBtn = screen.getByTestId('delete-btn-del-2');
    fireEvent.click(deleteBtn);

    expect(screen.queryByDisplayValue('Task to delete')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Task to keep')).toBeInTheDocument();
  });

  it('advances focus to next existing row on Enter when editing an intermediate row', () => {
    const twoRows: WorkshopLineItem[] = [
      {
        id: 'r1',
        rowNo: 1,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'First',
        sellingPriceRs: 2000,
        buyingCostRs: 500,
        assignedTechnician: '',
        isCompleted: false,
      },
      {
        id: 'r2',
        rowNo: 2,
        category: 'LABOR_REMOVE_REASSEMBLE',
        description: 'Second',
        sellingPriceRs: 4000,
        buyingCostRs: 1000,
        assignedTechnician: '',
        isCompleted: false,
      },
    ];

    render(<TestWorkshopTableWrapper initialItems={twoRows} isCostProfitVisible={false} />);

    const amount1 = screen.getByTestId('amount-input-r1');
    const desc2 = screen.getByTestId('desc-input-r2');

    amount1.focus();
    expect(document.activeElement).toBe(amount1);

    // Press Enter in row 1 amount: should advance focus to row 2 description, NOT append a 3rd row
    fireEvent.keyDown(amount1, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(desc2);
    expect(screen.getAllByPlaceholderText('Enter repair or replacement item description...').length).toBe(2);
  });

  it('renders correct colSpan for empty table state across all modes', () => {
    // Normal mode: No (1), Desc (1), Amount (1), Action (1) = 4
    const { rerender } = render(<TestWorkshopTableWrapper initialItems={[]} isCostProfitVisible={false} isJobCardMode={false} />);
    let emptyCell = screen.getByText(/No line items in this section/i);
    expect(emptyCell).toHaveAttribute('colSpan', '4');

    // Cost mode: No (1), Desc (1), Amount (1), Buying Cost (1), Profit (1), Action (1) = 6
    rerender(<TestWorkshopTableWrapper initialItems={[]} isCostProfitVisible={true} isJobCardMode={false} />);
    emptyCell = screen.getByText(/No line items in this section/i);
    expect(emptyCell).toHaveAttribute('colSpan', '6');

    // Job Card mode: No (1), Desc (1), Tech (1), Completed (1), Action (1) = 5
    rerender(<TestWorkshopTableWrapper initialItems={[]} isCostProfitVisible={false} isJobCardMode={true} />);
    emptyCell = screen.getByText(/No line items in this section/i);
    expect(emptyCell).toHaveAttribute('colSpan', '5');
  });
});
