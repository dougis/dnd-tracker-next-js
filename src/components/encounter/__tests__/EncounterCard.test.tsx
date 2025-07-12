import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EncounterCard } from '../EncounterCard';
import { createMockProps, createMockEncounter, setupTestEnvironment } from './test-helpers';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Test helpers
const renderCard = (overrides?: any) => {
  const props = createMockProps.encounterCard(overrides);
  render(<EncounterCard {...props} />);
  return props;
};

const expectText = (text: string) => expect(screen.getByText(text)).toBeInTheDocument();
const expectTexts = (texts: string[]) => texts.forEach(expectText);

const withConsoleSpy = (callback: (_spy: jest.SpyInstance) => void) => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  try {
    callback(consoleSpy);
  } finally {
    consoleSpy.mockRestore();
  }
};

const clickCheckbox = (_props: any) => {
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);
  return checkbox;
};

const clickActionButtons = () => {
  const actionButtons = screen.getByTestId('action-buttons');
  fireEvent.click(actionButtons);
  return actionButtons;
};

const testNavigationClick = (props: any) => {
  withConsoleSpy((spy) => {
    const card = screen.getByText(props.encounter.name).closest('div[class*="cursor-pointer"]');
    fireEvent.click(card!);
    expect(spy).toHaveBeenCalledWith('View encounter:', props.encounter.id);
  });
};

const testNoNavigationClick = (props: any, clickAction: () => void) => {
  withConsoleSpy((spy) => {
    clickAction();
    expect(spy).not.toHaveBeenCalledWith('View encounter:', props.encounter.id);
  });
};

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
      const props = renderCard();
      expectText(props.encounter.name);
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

      renderCard({ encounter });

      expectTexts(['Dragon Lair Encounter', 'A dangerous dragon encounter', 'draft', 'deadly',
       '8 participants', '(4 players)', 'Level 10', '120 minutes', 'dragon', 'lair']);
    });

    it('renders status badge with correct variant', () => {
      const activeEncounter = createMockEncounter({ status: 'active' });
      renderCard({ encounter: activeEncounter });
      expectText('active');
    });

    it('renders difficulty with appropriate styling', () => {
      const deadlyEncounter = createMockEncounter({ difficulty: 'deadly' });
      renderCard({ encounter: deadlyEncounter });
      expectText('deadly');
    });

    it('displays tags with truncation for more than 3 tags', () => {
      const encounter = createMockEncounter({
        tags: ['combat', 'dungeon', 'magic', 'boss', 'outdoor'],
      });
      renderCard({ encounter });

      expectTexts(['combat', 'dungeon', 'magic', '+2']);
    });

    it('does not render optional fields when not provided', () => {
      const encounter = createMockEncounter({
        description: '',
        estimatedDuration: undefined,
        tags: [],
      });
      renderCard({ encounter });

      expect(screen.queryByText('minutes')).not.toBeInTheDocument();
    });
  });

  describe('Checkbox Selection', () => {
    it('renders checkbox when onSelect is provided', () => {
      renderCard();
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
      const props = renderCard();
      clickCheckbox(props);

      expect(props.onSelect).toHaveBeenCalledWith(props.encounter.id);
    });
  });

  describe('User Interactions', () => {
    it('handles card click for navigation', () => {
      const props = renderCard();
      testNavigationClick(props);
    });

    it('does not trigger card click when clicking checkbox', () => {
      const props = renderCard();
      testNoNavigationClick(props, () => {
        clickCheckbox(props);
        expect(props.onSelect).toHaveBeenCalled();
      });
    });

    it('does not trigger card click when clicking action buttons', () => {
      const props = renderCard();
      testNoNavigationClick(props, () => clickActionButtons());
    });
  });

  describe('Action Buttons Integration', () => {
    it('renders action buttons with correct props', () => {
      const props = renderCard();

      const actionButtons = screen.getByTestId('action-buttons');
      expect(actionButtons).toBeInTheDocument();
      expect(actionButtons).toHaveAttribute('data-encounter-id', props.encounter.id);
    });

    it('passes onRefetch to action buttons', () => {
      const props = renderCard();
      clickActionButtons();

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