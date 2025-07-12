import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterCard } from '../EncounterCard';
import { createMockEncounter } from './test-utils/mockFactories';
import { 
  mockPush, 
  commonNavigationBeforeEach,
  createMockCardHeader,
  createMockCardContent,
  expectNavigation,
  expectNoNavigation
} from './test-utils/navigationTestHelpers';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Use centralized mock components
jest.mock('../card/CardHeader', () => {
  const { createMockCardHeader } = require('./test-utils/navigationTestHelpers');
  return createMockCardHeader();
});
jest.mock('../card/CardContent', () => {
  const { createMockCardContent } = require('./test-utils/navigationTestHelpers');
  return createMockCardContent();
});

describe('EncounterCard Navigation', () => {
  const mockEncounter = createMockEncounter({
    id: 'card-encounter-123',
    name: 'Card Test Encounter',
    description: 'Test encounter description',
  });

  const defaultProps = {
    encounter: mockEncounter,
    isSelected: false,
    onSelect: jest.fn(),
    onRefetch: jest.fn(),
  };

  const renderCard = (props = {}) => {
    return render(<EncounterCard {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    commonNavigationBeforeEach();
  });

  describe('Card Click Navigation', () => {
    it('should navigate to encounter detail view when card is clicked', async () => {
      const user = userEvent.setup();
      renderCard();
      const cardContent = screen.getByTestId('card-content');
      await user.click(cardContent);
      expectNavigation('/encounters/card-encounter-123');
    });

    it('should not navigate when clicking on checkbox', async () => {
      const user = userEvent.setup();
      renderCard();
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expectNoNavigation();
      expect(defaultProps.onSelect).toHaveBeenCalledWith('card-encounter-123');
    });

    it('should not navigate when clicking on action buttons', async () => {
      const user = userEvent.setup();
      renderCard();
      const actionButton = screen.getByText('Action Button');
      await user.click(actionButton);
      expectNoNavigation();
    });

    it('should navigate with different encounter IDs', async () => {
      const user = userEvent.setup();
      const differentEncounter = createMockEncounter({
        id: 'different-card-456',
        name: 'Different Card Encounter',
        description: 'Different description',
      });
      renderCard({ encounter: differentEncounter });
      const cardContent = screen.getByTestId('card-content');
      await user.click(cardContent);
      expectNavigation('/encounters/different-card-456');
    });
  });

  describe('Event Prevention Logic', () => {
    it('should prevent click when target has data-checkbox attribute', async () => {
      const user = userEvent.setup();
      renderCard();
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expectNoNavigation();
    });

    it('should prevent click when target has data-actions attribute', async () => {
      const user = userEvent.setup();
      renderCard();
      const actionButton = screen.getByText('Action Button');
      await user.click(actionButton);
      expectNoNavigation();
    });
  });

  describe('Accessibility', () => {
    it('should render card components properly', () => {
      renderCard();
      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle optional props correctly', () => {
      const minimalProps = {
        encounter: mockEncounter,
      };
      render(<EncounterCard {...minimalProps} />);
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('should pass correct props to child components', () => {
      renderCard();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getAllByText('Card Test Encounter')).toHaveLength(2);
      expect(screen.getByText('Test encounter description')).toBeInTheDocument();
    });
  });
});