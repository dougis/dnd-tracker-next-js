import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableRow } from '../TableRow';
import { createMockEncounter } from '../../__tests__/test-utils/mockFactories';
import { createMockTableCells } from '../../__tests__/test-utils/navigationTestHelpers';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Use centralized mock table cells with additional functionality for testing
jest.mock('../TableCells', () => {
  const { createMockTableCells } = require('../../__tests__/test-utils/navigationTestHelpers');
  const tableCellMocks = createMockTableCells();
  // Override ActionsCell to include refetch functionality for this test
  tableCellMocks.ActionsCell = ({ encounter, onRefetch }: any) => (
    <td data-testid="actions-cell">
      Actions for {encounter.name}
      <button onClick={onRefetch}>Refetch</button>
    </td>
  );
  return tableCellMocks;
});

describe('TableRow', () => {
  const mockEncounter = createMockEncounter();
  const defaultProps = {
    encounter: mockEncounter,
    isSelected: false,
    onSelect: jest.fn(),
    onRefetch: jest.fn(),
  };

  const renderTableRow = (props = {}) => {
    return render(
      <table>
        <tbody>
          <TableRow {...defaultProps} {...props} />
        </tbody>
      </table>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table row with all cells', () => {
    renderTableRow();
    
    expect(screen.getByTestId('selection-cell')).toBeInTheDocument();
    expect(screen.getByTestId('name-cell')).toBeInTheDocument();
    expect(screen.getByTestId('status-cell')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-cell')).toBeInTheDocument();
    expect(screen.getByTestId('participants-cell')).toBeInTheDocument();
    expect(screen.getByTestId('target-level-cell')).toBeInTheDocument();
    expect(screen.getByTestId('updated-cell')).toBeInTheDocument();
    expect(screen.getByTestId('actions-cell')).toBeInTheDocument();
  });

  it('should render selection checkbox', () => {
    renderTableRow();
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should show checked state when selected', () => {
    renderTableRow({ isSelected: true });
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onSelect when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderTableRow();
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockEncounter.id);
  });

  it('should pass encounter data to cell components', () => {
    renderTableRow();
    
    expect(screen.getByText('Test Encounter')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should pass onRefetch to ActionsCell', async () => {
    const user = userEvent.setup();
    renderTableRow();
    
    const refetchButton = screen.getByText('Refetch');
    await user.click(refetchButton);

    expect(defaultProps.onRefetch).toHaveBeenCalledTimes(1);
  });

  it('should handle different encounter data', () => {
    const customEncounter = createMockEncounter({
      name: 'Custom Encounter',
      difficulty: 'hard',
      targetLevel: 10,
      status: 'active',
      participantCount: 5,
    });

    renderTableRow({ encounter: customEncounter });
    
    expect(screen.getByText('Custom Encounter')).toBeInTheDocument();
    expect(screen.getByText('hard')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should apply correct styling to row', () => {
    renderTableRow();
    
    const row = screen.getByRole('row');
    expect(row).toHaveClass('border-b');
  });

  it('should apply hover styling classes', () => {
    renderTableRow({ isSelected: true });
    
    const row = screen.getByRole('row');
    expect(row).toHaveClass('hover:bg-muted/50', 'cursor-pointer', 'group');
  });

  it('should handle rapid checkbox clicks', async () => {
    const user = userEvent.setup();
    renderTableRow();
    
    const checkbox = screen.getByRole('checkbox');

    // Rapid clicks
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);

    expect(defaultProps.onSelect).toHaveBeenCalledTimes(3);
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockEncounter.id);
  });

  it('should maintain state during re-renders', () => {
    const { rerender } = renderTableRow({ isSelected: false });
    
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    rerender(
      <table>
        <tbody>
          <TableRow {...defaultProps} isSelected={true} />
        </tbody>
      </table>
    );

    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});