import React from 'react';
import { render, screen } from '@testing-library/react';
import { EncounterGrid } from '../EncounterGrid';
import { createMockEncounter, createMockEncounters } from './test-utils/mockFactories';
import { commonBeforeEach } from './test-utils/mockSetup';
import { testLoadingState, testEmptyState } from './test-utils/testPatterns';

// Mock the EncounterCard component
jest.mock('../EncounterCard', () => ({
  EncounterCard: ({ encounter, isSelected, onSelect, onRefetch }: any) => (
    <div data-testid={`encounter-card-${encounter.id}`}>
      <div>Mock EncounterCard: {encounter.name}</div>
      <div>Selected: {isSelected ? 'true' : 'false'}</div>
      <button onClick={() => onSelect?.(encounter.id)}>Select</button>
      <button onClick={onRefetch}>Refetch</button>
    </div>
  ),
}));

// Mock the LoadingCard component
jest.mock('@/components/shared/LoadingCard', () => ({
  LoadingCard: ({ className }: any) => (
    <div data-testid="loading-card" className={className}>
      Mock LoadingCard
    </div>
  ),
}));


describe('EncounterGrid', () => {
  const defaultProps = {
    encounters: [],
    isLoading: false,
    selectedEncounters: [],
    onSelectEncounter: jest.fn(),
    onRefetch: jest.fn(),
  };

  beforeEach(commonBeforeEach);

  describe('Loading State', () => {
    it('should render loading cards when isLoading is true', () => {
      testLoadingState(<EncounterGrid {...defaultProps} isLoading={true} />, 8);
    });

    it('should render loading cards in a grid layout', () => {
      render(<EncounterGrid {...defaultProps} isLoading={true} />);

      const gridContainer = screen.getAllByTestId('loading-card')[0].parentElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4',
        'gap-6'
      );
    });

    it('should not render encounters when loading', () => {
      const encounters = [createMockEncounter()];

      render(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          isLoading={true}
        />
      );

      expect(screen.queryByTestId('encounter-card-test-encounter-id')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no encounters and not loading', () => {
      testEmptyState(<EncounterGrid {...defaultProps} encounters={[]} isLoading={false} />, 'No encounters found');
      render(<EncounterGrid {...defaultProps} encounters={[]} isLoading={false} />);
      expect(screen.getByText(/Create your first encounter to get started/)).toBeInTheDocument();
    });

    it('should render empty state in centered layout', () => {
      render(<EncounterGrid {...defaultProps} encounters={[]} isLoading={false} />);

      const emptyContainer = screen.getByText('No encounters found').closest('div');
      expect(emptyContainer?.parentElement).toHaveClass('text-center', 'py-12');
    });

    it('should not render empty state when loading', () => {
      render(<EncounterGrid {...defaultProps} encounters={[]} isLoading={true} />);

      expect(screen.queryByText('No encounters found')).not.toBeInTheDocument();
    });
  });

  describe('Encounters Rendering', () => {
    it('should render encounters when provided', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1', name: 'First Encounter' }),
        createMockEncounter({ id: 'encounter-2', name: 'Second Encounter' }),
      ];

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      expect(screen.getByTestId('encounter-card-encounter-1')).toBeInTheDocument();
      expect(screen.getByTestId('encounter-card-encounter-2')).toBeInTheDocument();
      expect(screen.getByText('Mock EncounterCard: First Encounter')).toBeInTheDocument();
      expect(screen.getByText('Mock EncounterCard: Second Encounter')).toBeInTheDocument();
    });

    it('should render encounters in grid layout', () => {
      const encounters = [createMockEncounter()];

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      const gridContainer = screen.getByTestId('encounter-card-test-encounter-id').parentElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4',
        'gap-6'
      );
    });

    it('should pass correct props to EncounterCard', () => {
      const encounters = [createMockEncounter({ id: 'test-id', name: 'Test Name' })];
      const selectedEncounters = ['test-id'];

      render(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          selectedEncounters={selectedEncounters}
        />
      );

      expect(screen.getByText('Mock EncounterCard: Test Name')).toBeInTheDocument();
      expect(screen.getByText('Selected: true')).toBeInTheDocument();
    });
  });

  describe('Selection Handling', () => {
    it('should show selected state for selected encounters', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
      ];
      const selectedEncounters = ['encounter-1'];

      render(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          selectedEncounters={selectedEncounters}
        />
      );

      const firstCard = screen.getByTestId('encounter-card-encounter-1');
      const secondCard = screen.getByTestId('encounter-card-encounter-2');

      expect(firstCard).toHaveTextContent('Selected: true');
      expect(secondCard).toHaveTextContent('Selected: false');
    });

    it('should call onSelectEncounter when encounter is selected', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      const selectButton = screen.getByText('Select');
      selectButton.click();

      expect(defaultProps.onSelectEncounter).toHaveBeenCalledWith('test-id');
    });

    it('should call onRefetch when refetch is triggered', () => {
      const encounters = [createMockEncounter()];

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      const refetchButton = screen.getByText('Refetch');
      refetchButton.click();

      expect(defaultProps.onRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedEncounters array', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];

      render(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          selectedEncounters={[]}
        />
      );

      expect(screen.getByText('Selected: false')).toBeInTheDocument();
    });

    it('should handle multiple selected encounters', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
        createMockEncounter({ id: 'encounter-3' }),
      ];
      const selectedEncounters = ['encounter-1', 'encounter-3'];

      render(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          selectedEncounters={selectedEncounters}
        />
      );

      const cards = screen.getAllByText(/Selected:/);
      expect(cards[0]).toHaveTextContent('Selected: true'); // encounter-1
      expect(cards[1]).toHaveTextContent('Selected: false'); // encounter-2
      expect(cards[2]).toHaveTextContent('Selected: true'); // encounter-3
    });

    it('should handle large number of encounters', () => {
      const encounters = createMockEncounters(50);

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      // Check that all encounters are rendered
      encounters.forEach((encounter) => {
        expect(screen.getByTestId(`encounter-card-${encounter.id}`)).toBeInTheDocument();
      });
    });

    it('should maintain selection state across re-renders', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];
      const selectedEncounters = ['test-id'];

      const { rerender } = render(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          selectedEncounters={selectedEncounters}
        />
      );

      expect(screen.getByText('Selected: true')).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <EncounterGrid
          {...defaultProps}
          encounters={encounters}
          selectedEncounters={selectedEncounters}
        />
      );

      expect(screen.getByText('Selected: true')).toBeInTheDocument();
    });
  });

  describe('Responsive Grid Layout', () => {
    it('should apply responsive grid classes', () => {
      const encounters = [createMockEncounter()];

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      const gridContainer = screen.getByTestId('encounter-card-test-encounter-id').parentElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',     // Mobile: 1 column
        'md:grid-cols-2',  // Medium: 2 columns
        'lg:grid-cols-3',  // Large: 3 columns
        'xl:grid-cols-4',  // Extra large: 4 columns
        'gap-6'            // Gap between items
      );
    });

    it('should apply same responsive classes for loading state', () => {
      render(<EncounterGrid {...defaultProps} isLoading={true} />);

      const gridContainer = screen.getAllByTestId('loading-card')[0].parentElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4',
        'gap-6'
      );
    });
  });

  describe('Performance Considerations', () => {
    it('should use encounter id as key for React reconciliation', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
      ];

      render(<EncounterGrid {...defaultProps} encounters={encounters} />);

      // Verify unique testids are used (which indicates proper keys)
      expect(screen.getByTestId('encounter-card-encounter-1')).toBeInTheDocument();
      expect(screen.getByTestId('encounter-card-encounter-2')).toBeInTheDocument();
    });
  });
});