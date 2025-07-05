import React from 'react';
import { render, screen } from '@testing-library/react';
import { EncounterGrid } from '../EncounterGrid';
import { createMockEncounter, createMockEncounters } from './test-utils/mockFactories';
import { commonBeforeEach } from './test-utils/mockSetup';
import { testLoadingState } from './test-utils/testPatterns';
import { assertGridLayout, assertEncounterCard, assertSelectionState, assertEmptyState } from './test-utils/testAssertions';
import { expectFunctionToBeCalled } from './test-utils/interactionHelpers';

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

  // Helper functions to reduce duplication
  const renderEncounterGrid = (props = {}) => {
    return render(<EncounterGrid {...defaultProps} {...props} />);
  };

  const createTestEncounters = (count = 1, prefix = 'encounter') => {
    return Array.from({ length: count }, (_, i) =>
      createMockEncounter({
        id: `${prefix}-${i + 1}`,
        name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${i + 1}`
      })
    );
  };

  const assertMultipleEncounterCards = (encounters: any[]) => {
    encounters.forEach(encounter => {
      assertEncounterCard(encounter.id, encounter.name);
    });
  };

  const assertMultipleSelectionStates = (encounters: any[], selectedIds: string[]) => {
    encounters.forEach(encounter => {
      const isSelected = selectedIds.includes(encounter.id);
      assertSelectionState(encounter.id, isSelected);
    });
  };

  describe('Loading State', () => {
    it('should render loading cards when isLoading is true', () => {
      testLoadingState(<EncounterGrid {...defaultProps} isLoading={true} />, 8);
    });

    it('should render loading cards in a grid layout', () => {
      renderEncounterGrid({ isLoading: true });
      assertGridLayout();
    });

    it('should not render encounters when loading', () => {
      const encounters = [createMockEncounter()];
      renderEncounterGrid({ encounters, isLoading: true });
      expect(screen.queryByTestId('encounter-card-test-encounter-id')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no encounters and not loading', () => {
      renderEncounterGrid({ encounters: [], isLoading: false });
      assertEmptyState('No encounters found', 'Create your first encounter to get started');
    });

    it('should render empty state in centered layout', () => {
      renderEncounterGrid({ encounters: [], isLoading: false });
      const emptyContainer = screen.getByText('No encounters found').closest('div');
      expect(emptyContainer?.parentElement).toHaveClass('text-center', 'py-12');
    });

    it('should not render empty state when loading', () => {
      renderEncounterGrid({ encounters: [], isLoading: true });
      expect(screen.queryByText('No encounters found')).not.toBeInTheDocument();
    });
  });

  describe('Encounters Rendering', () => {
    it('should render encounters when provided', () => {
      const encounters = createTestEncounters(2);
      renderEncounterGrid({ encounters });
      assertMultipleEncounterCards(encounters);
    });

    it('should render encounters in grid layout', () => {
      const encounters = [createMockEncounter()];
      renderEncounterGrid({ encounters });
      assertGridLayout();
    });

    it('should pass correct props to EncounterCard', () => {
      const encounters = [createMockEncounter({ id: 'test-id', name: 'Test Name' })];
      const selectedEncounters = ['test-id'];
      renderEncounterGrid({ encounters, selectedEncounters });
      assertEncounterCard('test-id', 'Test Name');
      assertSelectionState('test-id', true);
    });
  });

  describe('Selection Handling', () => {
    it('should show selected state for selected encounters', () => {
      const encounters = createTestEncounters(2);
      const selectedEncounters = ['encounter-1'];
      renderEncounterGrid({ encounters, selectedEncounters });
      assertMultipleSelectionStates(encounters, selectedEncounters);
    });

    it('should call onSelectEncounter when encounter is selected', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];
      renderEncounterGrid({ encounters });

      const selectButton = screen.getByText('Select');
      selectButton.click();

      expectFunctionToBeCalled(defaultProps.onSelectEncounter, 1, 'test-id');
    });

    it('should call onRefetch when refetch is triggered', () => {
      const encounters = [createMockEncounter()];
      renderEncounterGrid({ encounters });

      const refetchButton = screen.getByText('Refetch');
      refetchButton.click();

      expectFunctionToBeCalled(defaultProps.onRefetch, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedEncounters array', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];
      renderEncounterGrid({ encounters, selectedEncounters: [] });
      assertSelectionState('test-id', false);
    });

    it('should handle multiple selected encounters', () => {
      const encounters = createTestEncounters(3);
      const selectedEncounters = ['encounter-1', 'encounter-3'];
      renderEncounterGrid({ encounters, selectedEncounters });
      assertMultipleSelectionStates(encounters, selectedEncounters);
    });

    it('should handle large number of encounters', () => {
      const encounters = createMockEncounters(50);
      renderEncounterGrid({ encounters });

      // Check that all encounters are rendered
      encounters.forEach((encounter) => {
        expect(screen.getByTestId(`encounter-card-${encounter.id}`)).toBeInTheDocument();
      });
    });

    it('should maintain selection state across re-renders', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];
      const selectedEncounters = ['test-id'];
      const props = { encounters, selectedEncounters };

      const { rerender } = renderEncounterGrid(props);
      assertSelectionState('test-id', true);

      // Re-render with same props
      rerender(<EncounterGrid {...defaultProps} {...props} />);
      assertSelectionState('test-id', true);
    });
  });

  describe('Responsive Grid Layout', () => {
    it('should apply responsive grid classes', () => {
      const encounters = [createMockEncounter()];
      renderEncounterGrid({ encounters });
      assertGridLayout();
    });

    it('should apply same responsive classes for loading state', () => {
      renderEncounterGrid({ isLoading: true });
      assertGridLayout();
    });
  });

  describe('Performance Considerations', () => {
    it('should use encounter id as key for React reconciliation', () => {
      const encounters = createTestEncounters(2);
      renderEncounterGrid({ encounters });

      // Verify unique testids are used (which indicates proper keys)
      encounters.forEach(encounter => {
        expect(screen.getByTestId(`encounter-card-${encounter.id}`)).toBeInTheDocument();
      });
    });
  });
});