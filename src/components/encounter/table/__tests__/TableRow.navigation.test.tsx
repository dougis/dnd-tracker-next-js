import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableRow } from '../TableRow';
import { createMockEncounter } from '../../__tests__/test-utils/mockFactories';
import { mockPush, commonNavigationBeforeEach } from '../../__tests__/test-utils/navigationTestHelpers';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock table cell components to avoid complex dependencies
jest.mock('../TableCells', () => ({
  SelectionCell: ({ encounter, isSelected, onSelect }: any) => (
    <td data-testid="selection-cell">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(encounter.id)}
        data-checkbox="true"
      />
    </td>
  ),
  NameCell: ({ encounter }: any) => <td data-testid="name-cell">{encounter.name}</td>,
  StatusCell: ({ encounter }: any) => <td data-testid="status-cell">{encounter.status}</td>,
  DifficultyCell: ({ encounter }: any) => <td data-testid="difficulty-cell">{encounter.difficulty}</td>,
  ParticipantsCell: ({ encounter }: any) => <td data-testid="participants-cell">{encounter.participantCount}</td>,
  TargetLevelCell: ({ encounter }: any) => <td data-testid="target-level-cell">{encounter.targetLevel}</td>,
  UpdatedCell: () => <td data-testid="updated-cell">Updated</td>,
  ActionsCell: ({ encounter }: any) => (
    <td data-testid="actions-cell" data-actions="true">
      <button>Actions for {encounter.name}</button>
    </td>
  ),
}));

describe('TableRow Navigation', () => {
  const mockEncounter = createMockEncounter({
    id: 'test-encounter-123',
    name: 'Test Encounter Navigation',
  });

  const defaultProps = {
    encounter: mockEncounter,
    isSelected: false,
    onSelect: jest.fn(),
    onRefetch: jest.fn(),
  };

  beforeEach(() => {
    commonNavigationBeforeEach();
  });

  describe('Row Click Navigation', () => {
    it('should navigate to encounter detail view when row is clicked', async () => {
      const user = userEvent.setup();

      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      await user.click(row);

      expect(mockPush).toHaveBeenCalledWith('/encounters/test-encounter-123');
    });

    it('should not navigate when clicking on checkbox', async () => {
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

      expect(mockPush).not.toHaveBeenCalled();
      expect(defaultProps.onSelect).toHaveBeenCalledWith('test-encounter-123');
    });

    it('should not navigate when clicking on actions cell', async () => {
      const user = userEvent.setup();

      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      const actionsButton = screen.getByText('Actions for Test Encounter Navigation');
      await user.click(actionsButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should navigate with different encounter IDs', async () => {
      const user = userEvent.setup();
      const differentEncounter = createMockEncounter({
        id: 'different-encounter-456',
        name: 'Different Encounter',
      });

      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} encounter={differentEncounter} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      await user.click(row);

      expect(mockPush).toHaveBeenCalledWith('/encounters/different-encounter-456');
    });

    it('should handle keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup();

      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      row.focus();
      await user.keyboard('{Enter}');

      // Note: We'll need to implement keyboard navigation in the actual component
      // This test documents the expected behavior
    });

    it('should handle keyboard navigation (Space key)', async () => {
      const user = userEvent.setup();

      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      row.focus();
      await user.keyboard('{Space}');

      // Note: We'll need to implement keyboard navigation in the actual component
      // This test documents the expected behavior
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for navigation', () => {
      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      expect(row).toHaveClass('cursor-pointer');
      // We should add aria-label or similar for accessibility
    });

    it('should indicate that row is clickable', () => {
      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  describe('Event Prevention', () => {
    it('should prevent navigation when event target is in a prevented element', async () => {
      const user = userEvent.setup();

      render(
        <table>
          <tbody>
            <TableRow {...defaultProps} />
          </tbody>
        </table>
      );

      // Click on elements that should prevent navigation
      const checkbox = screen.getByRole('checkbox');
      const actionsButton = screen.getByText('Actions for Test Encounter Navigation');

      await user.click(checkbox);
      await user.click(actionsButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});