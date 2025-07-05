import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EncounterListView } from '../EncounterListView';
import { createMockEncounter } from './test-utils/mockFactories';
import { createConsoleSpy, commonBeforeEach, commonAfterAll } from './test-utils/mockSetup';
import { clickButton, expectFunctionToBeCalled } from './test-utils/interactionHelpers';

// Mock all the hooks
const mockUseEncounterFilters = {
  filters: {
    status: [],
    difficulty: [],
    targetLevelMin: undefined,
    targetLevelMax: undefined,
    tags: [],
  },
  searchQuery: '',
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
  updateFilters: jest.fn(),
  updateSearchQuery: jest.fn(),
  updateSort: jest.fn(),
  clearFilters: jest.fn(),
};

const mockUseEncounterData = {
  encounters: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
  },
  goToPage: jest.fn(),
  refetch: jest.fn(),
};

const mockUseEncounterSelection = {
  selectedEncounters: [],
  selectAll: jest.fn(),
  selectEncounter: jest.fn(),
  clearSelection: jest.fn(),
  isAllSelected: false,
  hasSelection: false,
};

jest.mock('../hooks/useEncounterFilters', () => ({
  useEncounterFilters: () => mockUseEncounterFilters,
}));

jest.mock('../hooks/useEncounterData', () => ({
  useEncounterData: () => mockUseEncounterData,
}));

jest.mock('../hooks/useEncounterSelection', () => ({
  useEncounterSelection: () => mockUseEncounterSelection,
}));

// Mock child components
jest.mock('../BatchActions', () => ({
  BatchActions: ({ selectedCount, onClearSelection, onRefetch }: any) => (
    <div data-testid="batch-actions">
      <div>Selected: {selectedCount}</div>
      <button onClick={onClearSelection}>Clear Selection</button>
      <button onClick={onRefetch}>Refetch</button>
    </div>
  ),
}));

jest.mock('@/components/shared/Pagination', () => ({
  Pagination: ({ currentPage, totalPages, totalItems, onPageChange }: any) => (
    <div data-testid="pagination">
      <div>Page {currentPage} of {totalPages}</div>
      <div>Total items: {totalItems}</div>
      <button onClick={() => onPageChange(2)}>Go to page 2</button>
    </div>
  ),
}));

jest.mock('../EncounterListView/ErrorFallback', () => ({
  ErrorFallback: ({ onRetry }: any) => (
    <div data-testid="error-fallback">
      <div>Error occurred</div>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

jest.mock('../EncounterListView/ControlsSection', () => ({
  ControlsSection: ({
    searchQuery,
    sortConfig,
    viewMode,
    onViewModeChange,
    onCreateEncounter,
  }: any) => (
    <div data-testid="controls-section">
      <div>View Mode: {viewMode}</div>
      <div>Search Query: {searchQuery}</div>
      <div>Sort By: {sortConfig.sortBy}</div>
      <button onClick={() => onViewModeChange('grid')}>Grid View</button>
      <button onClick={() => onViewModeChange('table')}>Table View</button>
      <button onClick={onCreateEncounter}>Create Encounter</button>
    </div>
  ),
}));

jest.mock('../EncounterListView/ContentSection', () => ({
  ContentSection: ({ viewMode, gridProps, tableProps }: any) => (
    <div data-testid="content-section">
      <div>Current View Mode: {viewMode}</div>
      <div>Encounters count: {viewMode === 'grid' ? gridProps.encounters.length : tableProps.encounters.length}</div>
      <div>Loading: {viewMode === 'grid' ? gridProps.isLoading ? 'true' : 'false' : tableProps.isLoading ? 'true' : 'false'}</div>
    </div>
  ),
}));

// Mock console.log
const consoleSpy = createConsoleSpy();

// Helper functions to reduce duplication
const resetMockFilters = () => {
  Object.assign(mockUseEncounterFilters, {
    filters: {
      status: [],
      difficulty: [],
      targetLevelMin: undefined,
      targetLevelMax: undefined,
      tags: [],
    },
    searchQuery: '',
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
  });
};

const resetMockData = () => {
  Object.assign(mockUseEncounterData, {
    encounters: [],
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 50,
      itemsPerPage: 10,
    },
  });
};

const resetMockSelection = () => {
  Object.assign(mockUseEncounterSelection, {
    selectedEncounters: [],
    isAllSelected: false,
    hasSelection: false,
  });
};

const renderEncounterListView = () => {
  render(<EncounterListView />);
  return {
    controlsSection: screen.getByTestId('controls-section'),
    contentSection: screen.getByTestId('content-section'),
    pagination: screen.getByTestId('pagination'),
  };
};

const setMockError = (error: string) => {
  Object.assign(mockUseEncounterData, {
    error,
    encounters: [],
    isLoading: false,
  });
};

const setMockSelection = (hasSelection: boolean, selectedCount = 2) => {
  Object.assign(mockUseEncounterSelection, {
    hasSelection,
    selectedEncounters: hasSelection ? Array(selectedCount).fill('id') : [],
  });
};

describe('EncounterListView', () => {
  beforeEach(() => {
    commonBeforeEach();
    resetMockFilters();
    resetMockData();
    resetMockSelection();
  });

  afterAll(() => commonAfterAll(consoleSpy));

  describe('Rendering', () => {
    it('should render the main container with proper structure', () => {
      const { controlsSection, contentSection, pagination } = renderEncounterListView();

      expect(controlsSection).toBeInTheDocument();
      expect(contentSection).toBeInTheDocument();
      expect(pagination).toBeInTheDocument();
    });

    it('should render with default grid view mode', () => {
      renderEncounterListView();

      expect(screen.getByText('View Mode: grid')).toBeInTheDocument();
      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
    });

    it('should pass correct props to ControlsSection', () => {
      renderEncounterListView();

      expect(screen.getByText('View Mode: grid')).toBeInTheDocument();
      expect(screen.getByText('Search Query:')).toBeInTheDocument();
      expect(screen.getByText('Sort By: name')).toBeInTheDocument();
    });

    it('should pass correct props to ContentSection', () => {
      const encounters = [createMockEncounter(), createMockEncounter({ id: 'encounter-2' })];
      mockUseEncounterData.encounters = encounters;

      renderEncounterListView();

      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
      expect(screen.getByText('Encounters count: 2')).toBeInTheDocument();
      expect(screen.getByText('Loading: false')).toBeInTheDocument();
    });

    it('should pass correct props to Pagination', () => {
      renderEncounterListView();

      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      expect(screen.getByText('Total items: 50')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render ErrorFallback when error occurs', () => {
      setMockError('Failed to load encounters');

      render(<EncounterListView />);

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByTestId('controls-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('content-section')).not.toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked in ErrorFallback', async () => {
      setMockError('Failed to load encounters');

      render(<EncounterListView />);

      await clickButton('Retry');
      expectFunctionToBeCalled(mockUseEncounterData.refetch);
    });
  });

  describe('View Mode Switching', () => {
    it('should switch to table view when table button is clicked', async () => {
      renderEncounterListView();

      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();

      await clickButton('Table View');

      await waitFor(() => {
        expect(screen.getByText('Current View Mode: table')).toBeInTheDocument();
      });
    });

    it('should switch back to grid view when grid button is clicked', async () => {
      renderEncounterListView();

      // Switch to table first
      await clickButton('Table View');

      await waitFor(() => {
        expect(screen.getByText('Current View Mode: table')).toBeInTheDocument();
      });

      // Switch back to grid
      await clickButton('Grid View');

      await waitFor(() => {
        expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
      });
    });
  });

  describe('Batch Actions', () => {
    it('should not render BatchActions when no selection exists', () => {
      setMockSelection(false);

      render(<EncounterListView />);

      expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
    });

    it('should render BatchActions when selection exists', () => {
      setMockSelection(true, 2);

      render(<EncounterListView />);

      expect(screen.getByTestId('batch-actions')).toBeInTheDocument();
      expect(screen.getByText('Selected: 2')).toBeInTheDocument();
    });

    it('should call clearSelection when clear button is clicked', async () => {
      setMockSelection(true, 1);

      render(<EncounterListView />);

      await clickButton('Clear Selection');
      expectFunctionToBeCalled(mockUseEncounterSelection.clearSelection);
    });

    it('should call refetch when refetch button is clicked in BatchActions', async () => {
      setMockSelection(true, 1);

      render(<EncounterListView />);

      await clickButton('Refetch');
      expectFunctionToBeCalled(mockUseEncounterData.refetch);
    });
  });

  describe('Pagination', () => {
    it('should render pagination when pagination data exists', () => {
      renderEncounterListView();

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not render pagination when pagination data is null', () => {
      Object.assign(mockUseEncounterData, { pagination: null });

      render(<EncounterListView />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should call goToPage when page change is triggered', async () => {
      renderEncounterListView();

      await clickButton('Go to page 2');
      expectFunctionToBeCalled(mockUseEncounterData.goToPage, 1, 2);
    });
  });

  describe('Create Encounter', () => {
    it('should log to console when create encounter button is clicked', async () => {
      renderEncounterListView();

      await clickButton('Create Encounter');

      expect(consoleSpy).toHaveBeenCalledWith('Create new encounter');
    });
  });

  describe('Loading States', () => {
    it('should pass loading state to ContentSection', () => {
      Object.assign(mockUseEncounterData, { isLoading: true });

      render(<EncounterListView />);

      expect(screen.getByText('Loading: true')).toBeInTheDocument();
    });

    it('should pass non-loading state to ContentSection', () => {
      Object.assign(mockUseEncounterData, { isLoading: false });

      render(<EncounterListView />);

      expect(screen.getByText('Loading: false')).toBeInTheDocument();
    });
  });

  describe('Data Integration', () => {
    it('should pass encounters data to ContentSection', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
        createMockEncounter({ id: 'encounter-3' }),
      ];
      Object.assign(mockUseEncounterData, { encounters });

      render(<EncounterListView />);

      expect(screen.getByText('Encounters count: 3')).toBeInTheDocument();
    });

    it('should handle empty encounters array', () => {
      Object.assign(mockUseEncounterData, { encounters: [] });

      render(<EncounterListView />);

      expect(screen.getByText('Encounters count: 0')).toBeInTheDocument();
    });
  });

  describe('Filter Integration', () => {
    it('should pass filters data to ControlsSection', () => {
      Object.assign(mockUseEncounterFilters, {
        searchQuery: 'test search',
        sortBy: 'createdAt'
      });

      render(<EncounterListView />);

      expect(screen.getByText('Search Query: test search')).toBeInTheDocument();
      expect(screen.getByText('Sort By: createdAt')).toBeInTheDocument();
    });

    it('should handle different sort configurations', () => {
      Object.assign(mockUseEncounterFilters, {
        sortBy: 'difficulty',
        sortOrder: 'desc'
      });

      render(<EncounterListView />);

      expect(screen.getByText('Sort By: difficulty')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all hooks returning empty/default states', () => {
      Object.assign(mockUseEncounterData, {
        encounters: [],
        pagination: null
      });
      setMockSelection(false);

      render(<EncounterListView />);

      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should handle rapid view mode changes', async () => {
      renderEncounterListView();

      // Rapid switching
      await clickButton('Table View');
      await clickButton('Grid View');
      await clickButton('Table View');

      await waitFor(() => {
        expect(screen.getByText('Current View Mode: table')).toBeInTheDocument();
      });
    });

    it('should maintain state consistency across re-renders', () => {
      const { rerender } = render(<EncounterListView />);

      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();

      rerender(<EncounterListView />);

      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
    });
  });

  describe('Config Utilities Integration', () => {
    it('should use config utilities to create proper configurations', () => {
      renderEncounterListView();

      // Verify that ControlsSection receives the expected props
      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();

      // The actual config creation is tested in the configUtils tests
      // Here we just verify the component structure is correct
    });
  });
});