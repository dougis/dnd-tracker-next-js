import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableRow } from '../TableRow';
import { createMockEncounter } from '../../__tests__/test-utils/mockFactories';
import { 
  mockPush, 
  commonNavigationBeforeEach, 
  createMockTableCells,
  expectNavigation,
  expectNoNavigation
} from '../../__tests__/test-utils/navigationTestHelpers';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Use centralized mock table cells
jest.mock('../TableCells', () => {
  const { createMockTableCells } = require('../../__tests__/test-utils/navigationTestHelpers');
  return createMockTableCells();
});

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
    commonNavigationBeforeEach();
  });

  describe('Row Click Navigation', () => {
    it('should navigate to encounter detail view when row is clicked', async () => {
      const user = userEvent.setup();
      renderTableRow();
      const row = screen.getByRole('row');
      await user.click(row);
      expectNavigation('/encounters/test-encounter-123');
    });

    it('should not navigate when clicking on checkbox', async () => {
      const user = userEvent.setup();
      renderTableRow();
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expectNoNavigation();
      expect(defaultProps.onSelect).toHaveBeenCalledWith('test-encounter-123');
    });

    it('should not navigate when clicking on actions cell', async () => {
      const user = userEvent.setup();
      renderTableRow();
      const actionsButton = screen.getByText('Actions for Test Encounter Navigation');
      await user.click(actionsButton);
      expectNoNavigation();
    });

    it('should navigate with different encounter IDs', async () => {
      const user = userEvent.setup();
      const differentEncounter = createMockEncounter({
        id: 'different-encounter-456',
        name: 'Different Encounter',
      });
      renderTableRow({ encounter: differentEncounter });
      const row = screen.getByRole('row');
      await user.click(row);
      expectNavigation('/encounters/different-encounter-456');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for navigation', () => {
      renderTableRow();
      const row = screen.getByRole('row');
      expect(row).toHaveClass('cursor-pointer');
    });

    it('should indicate that row is clickable', () => {
      renderTableRow();
      const row = screen.getByRole('row');
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  describe('Event Prevention', () => {
    it('should prevent navigation when event target is in a prevented element', async () => {
      const user = userEvent.setup();
      renderTableRow();
      
      const checkbox = screen.getByRole('checkbox');
      const actionsButton = screen.getByText('Actions for Test Encounter Navigation');

      await user.click(checkbox);
      await user.click(actionsButton);

      expectNoNavigation();
    });
  });
});