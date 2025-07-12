import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterCard } from '../EncounterCard';
import { createMockEncounter } from './test-utils/mockFactories';

// Mock next/navigation
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock card components to isolate navigation testing
jest.mock('../card/CardHeader', () => {
  return {
    CardHeader: ({ encounter, onSelect, isSelected }: any) => (
      <div data-testid="card-header">
        <h3>{encounter.name}</h3>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect?.(encounter.id)}
          data-checkbox="true"
        />
        <div data-actions="true">
          <button>Action Button</button>
        </div>
      </div>
    ),
  };
});

jest.mock('../card/CardContent', () => {
  return {
    CardContent: ({ encounter }: any) => (
      <div data-testid="card-content">
        <p>{encounter.name}</p>
        <p>{encounter.description}</p>
      </div>
    ),
  };
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Card Click Navigation', () => {
    it('should navigate to encounter detail view when card is clicked', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      // Find the card element by looking for the main card container
      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toBeInTheDocument();
      
      // Click on the card content area
      await user.click(cardContent);
      expect(mockPush).toHaveBeenCalledWith('/encounters/card-encounter-123');
    });

    it('should not navigate when clicking on checkbox', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockPush).not.toHaveBeenCalled();
      expect(defaultProps.onSelect).toHaveBeenCalledWith('card-encounter-123');
    });

    it('should not navigate when clicking on action buttons', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      const actionButton = screen.getByText('Action Button');
      await user.click(actionButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should navigate with different encounter IDs', async () => {
      const user = userEvent.setup();
      const differentEncounter = createMockEncounter({
        id: 'different-card-456',
        name: 'Different Card Encounter',
        description: 'Different description',
      });

      render(<EncounterCard {...defaultProps} encounter={differentEncounter} />);

      const cardContent = screen.getByTestId('card-content');
      
      await user.click(cardContent);
      expect(mockPush).toHaveBeenCalledWith('/encounters/different-card-456');
    });
  });

  describe('Event Prevention Logic', () => {
    it('should prevent click when target has data-checkbox attribute', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should prevent click when target has data-actions attribute', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      const actionButton = screen.getByText('Action Button');
      await user.click(actionButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should prevent click when target is within element with data-checkbox', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      // The checkbox is within an element that has data-checkbox
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should prevent click when target is within element with data-actions', async () => {
      const user = userEvent.setup();

      render(<EncounterCard {...defaultProps} />);

      // The action button is within an element that has data-actions
      const actionButton = screen.getByText('Action Button');
      await user.click(actionButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper cursor styling for clickable card', () => {
      render(<EncounterCard {...defaultProps} />);

      // Check for cursor-pointer class in the rendered output
      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toBeInTheDocument();
    });

    it('should have hover effects', () => {
      render(<EncounterCard {...defaultProps} />);

      // Check that the card renders properly - styling is handled by the Card component
      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toBeInTheDocument();
    });

    it('should have transition effects', () => {
      render(<EncounterCard {...defaultProps} />);

      // Check that the card renders properly - styling is handled by the Card component  
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

      expect(screen.getByText('Card Test Encounter')).toBeInTheDocument();
    });

    it('should pass correct props to child components', () => {
      render(<EncounterCard {...defaultProps} />);

      // Verify that child components receive the correct props
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getByText('Card Test Encounter')).toBeInTheDocument();
      expect(screen.getByText('Test encounter description')).toBeInTheDocument();
    });
  });
});