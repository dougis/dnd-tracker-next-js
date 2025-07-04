import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableRow } from '../TableRow';
import { createMockEncounter } from '../../__tests__/test-utils/mockFactories';

// Mock table cell components
jest.mock('../TableCells', () => ({
  SelectionCell: ({ encounter, isSelected, onSelect }: any) => (
    <td data-testid="selection-cell">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(encounter.id)}
      />
    </td>
  ),
  NameCell: ({ encounter }: any) => <td data-testid="name-cell">{encounter.name}</td>,
  StatusCell: ({ encounter }: any) => <td data-testid="status-cell">{encounter.status}</td>,
  DifficultyCell: ({ encounter }: any) => <td data-testid="difficulty-cell">{encounter.difficulty}</td>,
  ParticipantsCell: ({ encounter }: any) => <td data-testid="participants-cell">{encounter.participantCount}</td>,
  TargetLevelCell: ({ encounter }: any) => <td data-testid="target-level-cell">{encounter.targetLevel}</td>,
  UpdatedCell: ({ encounter }: any) => <td data-testid="updated-cell">Updated</td>,
  ActionsCell: ({ encounter, onRefetch }: any) => (
    <td data-testid="actions-cell">
      Actions for {encounter.name}
      <button onClick={onRefetch}>Refetch</button>
    </td>
  ),
}));

describe('TableRow', () => {
  const mockEncounter = createMockEncounter();
  const defaultProps = {
    encounter: mockEncounter,
    isSelected: false,
    onSelect: jest.fn(),
    onRefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table row with all cells', () => {
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

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
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should show checked state when selected', () => {
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} isSelected={true} />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onSelect when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockEncounter.id);
  });

  it('should pass encounter data to cell components', () => {
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test Encounter')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should pass onRefetch to ActionsCell', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

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

    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} encounter={customEncounter} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Custom Encounter')).toBeInTheDocument();
    expect(screen.getByText('hard')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should apply correct styling to row', () => {
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

    const row = screen.getByRole('row');
    expect(row).toHaveClass('border-b');
  });

  it('should apply hover styling classes', () => {
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} isSelected={true} />
        </tbody>
      </table>
    );

    const row = screen.getByRole('row');
    expect(row).toHaveClass('hover:bg-muted/50', 'cursor-pointer', 'group');
  });

  it('should handle rapid checkbox clicks', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <TableRow {...defaultProps} />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox');

    // Rapid clicks
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);

    expect(defaultProps.onSelect).toHaveBeenCalledTimes(3);
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockEncounter.id);
  });

  it('should maintain state during re-renders', () => {
    const { rerender } = render(
      <table>
        <tbody>
          <TableRow {...defaultProps} isSelected={false} />
        </tbody>
      </table>
    );

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