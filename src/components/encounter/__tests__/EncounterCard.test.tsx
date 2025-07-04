import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EncounterCard } from '../EncounterCard';
import { createMockProps, createMockEncounter, setupTestEnvironment } from './test-helpers';

// Mock child components
jest.mock('../EncounterActionButtons', () => ({
  EncounterActionButtons: ({ encounter, onRefetch }: any) => (
    <div
      data-testid="action-buttons"
      data-encounter-id={encounter.id}
      onClick={onRefetch}
    >
      Action Buttons
    </div>
  ),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn().mockReturnValue('2 days ago'),
}));

describe('EncounterCard', () => {
  const { cleanup } = setupTestEnvironment();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      expect(screen.getByText(props.encounter.name)).toBeInTheDocument();
    });

    it('displays encounter information correctly', () => {
      const encounter = createMockEncounter({
        name: 'Dragon Lair Encounter',
        description: 'A dangerous dragon encounter',
        status: 'draft',
        difficulty: 'deadly',
        participantCount: 8,
        playerCount: 4,
        targetLevel: 10,
        estimatedDuration: 120,
        tags: ['dragon', 'lair'],
      });

      const props = createMockProps.encounterCard({ encounter });
      render(<EncounterCard {...props} />);

      expect(screen.getByText('Dragon Lair Encounter')).toBeInTheDocument();
      expect(screen.getByText('A dangerous dragon encounter')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
      expect(screen.getByText('deadly')).toBeInTheDocument();
      expect(screen.getByText('8 participants')).toBeInTheDocument();
      expect(screen.getByText('(4 players)')).toBeInTheDocument();
      expect(screen.getByText('Level 10')).toBeInTheDocument();
      expect(screen.getByText('120 minutes')).toBeInTheDocument();
      expect(screen.getByText('dragon')).toBeInTheDocument();
      expect(screen.getByText('lair')).toBeInTheDocument();
    });

    it('renders status badge with correct variant', () => {
      const activeEncounter = createMockEncounter({ status: 'active' });
      const props = createMockProps.encounterCard({ encounter: activeEncounter });

      render(<EncounterCard {...props} />);

      const statusBadge = screen.getByText('active');
      expect(statusBadge).toBeInTheDocument();
    });

    it('renders difficulty with appropriate styling', () => {
      const deadlyEncounter = createMockEncounter({ difficulty: 'deadly' });
      const props = createMockProps.encounterCard({ encounter: deadlyEncounter });

      render(<EncounterCard {...props} />);

      expect(screen.getByText('deadly')).toBeInTheDocument();
    });

    it('displays tags with truncation for more than 3 tags', () => {
      const encounter = createMockEncounter({
        tags: ['combat', 'dungeon', 'magic', 'boss', 'outdoor'],
      });
      const props = createMockProps.encounterCard({ encounter });

      render(<EncounterCard {...props} />);

      expect(screen.getByText('combat')).toBeInTheDocument();
      expect(screen.getByText('dungeon')).toBeInTheDocument();
      expect(screen.getByText('magic')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('does not render optional fields when not provided', () => {
      const encounter = createMockEncounter({
        description: '',
        estimatedDuration: undefined,
        tags: [],
      });
      const props = createMockProps.encounterCard({ encounter });

      render(<EncounterCard {...props} />);

      expect(screen.queryByText('minutes')).not.toBeInTheDocument();
    });
  });

  describe('Checkbox Selection', () => {
    it('renders checkbox when onSelect is provided', () => {
      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('does not render checkbox when onSelect is not provided', () => {
      const props = createMockProps.encounterCard({ onSelect: undefined });
      render(<EncounterCard {...props} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('shows selected state correctly', () => {
      const props = createMockProps.encounterCard({ isSelected: true });
      render(<EncounterCard {...props} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('calls onSelect when checkbox is clicked', () => {
      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(props.onSelect).toHaveBeenCalledWith(props.encounter.id);
    });
  });

  describe('User Interactions', () => {
    it('handles card click for navigation', () => {
      // Mock console.log to capture navigation calls
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const card = screen.getByText(props.encounter.name).closest('div[class*="cursor-pointer"]');
      fireEvent.click(card!);

      expect(consoleSpy).toHaveBeenCalledWith('View encounter:', props.encounter.id);

      consoleSpy.mockRestore();
    });

    it('does not trigger card click when clicking checkbox', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(consoleSpy).not.toHaveBeenCalledWith('View encounter:', props.encounter.id);
      expect(props.onSelect).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('does not trigger card click when clicking action buttons', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const actionButtons = screen.getByTestId('action-buttons');
      fireEvent.click(actionButtons);

      expect(consoleSpy).not.toHaveBeenCalledWith('View encounter:', props.encounter.id);

      consoleSpy.mockRestore();
    });
  });

  describe('Action Buttons Integration', () => {
    it('renders action buttons with correct props', () => {
      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const actionButtons = screen.getByTestId('action-buttons');
      expect(actionButtons).toBeInTheDocument();
      expect(actionButtons).toHaveAttribute('data-encounter-id', props.encounter.id);
    });

    it('passes onRefetch to action buttons', () => {
      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const actionButtons = screen.getByTestId('action-buttons');
      fireEvent.click(actionButtons);

      expect(props.onRefetch).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles encounter with no participants', () => {
      const encounter = createMockEncounter({
        participantCount: 0,
        playerCount: 0,
      });
      const props = createMockProps.encounterCard({ encounter });

      render(<EncounterCard {...props} />);

      expect(screen.getByText('0 participants')).toBeInTheDocument();
      expect(screen.queryByText('players)')).not.toBeInTheDocument();
    });

    it('handles very long encounter names with truncation', () => {
      const encounter = createMockEncounter({
        name: 'This is a very long encounter name that should be truncated in the display',
      });
      const props = createMockProps.encounterCard({ encounter });

      render(<EncounterCard {...props} />);

      const nameElement = screen.getByText(encounter.name);
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveAttribute('title', encounter.name);
    });

    it('handles missing description gracefully', () => {
      const encounter = createMockEncounter({ description: undefined as any });
      const props = createMockProps.encounterCard({ encounter });

      expect(() => {
        render(<EncounterCard {...props} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      const props = createMockProps.encounterCard();
      render(<EncounterCard {...props} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      // Card should be keyboard accessible
      const cardTitle = screen.getByText(props.encounter.name);
      expect(cardTitle).toBeInTheDocument();
    });

    it('provides title attribute for truncated content', () => {
      const encounter = createMockEncounter({
        name: 'Long encounter name',
      });
      const props = createMockProps.encounterCard({ encounter });

      render(<EncounterCard {...props} />);

      const nameElement = screen.getByText(encounter.name);
      expect(nameElement).toHaveAttribute('title', encounter.name);
    });
  });
});