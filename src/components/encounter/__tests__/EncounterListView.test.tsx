import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterListView } from '../EncounterListView';
import type { EncounterListItem } from '../types';
import { Types } from 'mongoose';

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
    filters,
    searchQuery,
    sortConfig,
    filterCallbacks,
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
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

const createMockEncounter = (overrides: Partial<EncounterListItem> = {}): EncounterListItem => ({
  id: 'test-encounter-id',
  ownerId: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'A test encounter',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  participants: [],
  settings: {
    allowPlayerNotes: true,
    autoRollInitiative: false,
    trackResources: true,
    enableTurnTimer: false,
    turnTimerDuration: 300,
    showInitiativeToPlayers: true,
  },
  combatState: {
    isActive: false,
    currentTurn: 0,
    currentRound: 0,
    startedAt: null,
    endedAt: null,
    history: [],
  },
  status: 'draft',
  partyId: new Types.ObjectId(),
  isPublic: false,
  sharedWith: [],
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  participantCount: 0,
  playerCount: 0,
  ...overrides,
});

describe('EncounterListView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset hook return values to defaults
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

    Object.assign(mockUseEncounterSelection, {
      selectedEncounters: [],
      isAllSelected: false,
      hasSelection: false,
    });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('should render the main container with proper structure', () => {
      render(<EncounterListView />);
      
      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should render with default grid view mode', () => {
      render(<EncounterListView />);
      
      expect(screen.getByText('View Mode: grid')).toBeInTheDocument();
      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
    });

    it('should pass correct props to ControlsSection', () => {
      render(<EncounterListView />);
      
      expect(screen.getByText('View Mode: grid')).toBeInTheDocument();
      expect(screen.getByText('Search Query:')).toBeInTheDocument();
      expect(screen.getByText('Sort By: name')).toBeInTheDocument();
    });

    it('should pass correct props to ContentSection', () => {
      const encounters = [createMockEncounter(), createMockEncounter({ id: 'encounter-2' })];
      mockUseEncounterData.encounters = encounters;
      
      render(<EncounterListView />);
      
      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
      expect(screen.getByText('Encounters count: 2')).toBeInTheDocument();
      expect(screen.getByText('Loading: false')).toBeInTheDocument();
    });

    it('should pass correct props to Pagination', () => {
      render(<EncounterListView />);
      
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      expect(screen.getByText('Total items: 50')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render ErrorFallback when error occurs', () => {
      mockUseEncounterData.error = 'Failed to load encounters';
      
      render(<EncounterListView />);
      
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByTestId('controls-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('content-section')).not.toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked in ErrorFallback', async () => {
      mockUseEncounterData.error = 'Failed to load encounters';
      const user = userEvent.setup();
      
      render(<EncounterListView />);
      
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      expect(mockUseEncounterData.refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('View Mode Switching', () => {
    it('should switch to table view when table button is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
      
      const tableViewButton = screen.getByText('Table View');
      await user.click(tableViewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Current View Mode: table')).toBeInTheDocument();
      });
    });

    it('should switch back to grid view when grid button is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      // Switch to table first
      const tableViewButton = screen.getByText('Table View');
      await user.click(tableViewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Current View Mode: table')).toBeInTheDocument();
      });
      
      // Switch back to grid
      const gridViewButton = screen.getByText('Grid View');
      await user.click(gridViewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Current View Mode: grid')).toBeInTheDocument();
      });
    });
  });

  describe('Batch Actions', () => {
    it('should not render BatchActions when no selection exists', () => {
      mockUseEncounterSelection.hasSelection = false;
      
      render(<EncounterListView />);
      
      expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
    });

    it('should render BatchActions when selection exists', () => {
      mockUseEncounterSelection.hasSelection = true;
      mockUseEncounterSelection.selectedEncounters = ['encounter-1', 'encounter-2'];
      
      render(<EncounterListView />);
      
      expect(screen.getByTestId('batch-actions')).toBeInTheDocument();
      expect(screen.getByText('Selected: 2')).toBeInTheDocument();
    });

    it('should call clearSelection when clear button is clicked', async () => {
      mockUseEncounterSelection.hasSelection = true;
      mockUseEncounterSelection.selectedEncounters = ['encounter-1'];
      
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      const clearButton = screen.getByText('Clear Selection');
      await user.click(clearButton);
      
      expect(mockUseEncounterSelection.clearSelection).toHaveBeenCalledTimes(1);
    });

    it('should call refetch when refetch button is clicked in BatchActions', async () => {
      mockUseEncounterSelection.hasSelection = true;
      mockUseEncounterSelection.selectedEncounters = ['encounter-1'];
      
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      const refetchButton = screen.getByText('Refetch');
      await user.click(refetchButton);
      
      expect(mockUseEncounterData.refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pagination', () => {
    it('should render pagination when pagination data exists', () => {
      render(<EncounterListView />);
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not render pagination when pagination data is null', () => {
      mockUseEncounterData.pagination = null;
      
      render(<EncounterListView />);
      
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should call goToPage when page change is triggered', async () => {
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      const pageButton = screen.getByText('Go to page 2');
      await user.click(pageButton);
      
      expect(mockUseEncounterData.goToPage).toHaveBeenCalledWith(2);
    });
  });

  describe('Create Encounter', () => {
    it('should log to console when create encounter button is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      const createButton = screen.getByText('Create Encounter');
      await user.click(createButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Create new encounter');
    });
  });

  describe('Loading States', () => {
    it('should pass loading state to ContentSection', () => {
      mockUseEncounterData.isLoading = true;
      
      render(<EncounterListView />);
      
      expect(screen.getByText('Loading: true')).toBeInTheDocument();
    });

    it('should pass non-loading state to ContentSection', () => {
      mockUseEncounterData.isLoading = false;
      
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
      mockUseEncounterData.encounters = encounters;
      
      render(<EncounterListView />);
      
      expect(screen.getByText('Encounters count: 3')).toBeInTheDocument();
    });

    it('should handle empty encounters array', () => {
      mockUseEncounterData.encounters = [];
      
      render(<EncounterListView />);
      
      expect(screen.getByText('Encounters count: 0')).toBeInTheDocument();
    });
  });

  describe('Filter Integration', () => {
    it('should pass filters data to ControlsSection', () => {
      mockUseEncounterFilters.searchQuery = 'test search';
      mockUseEncounterFilters.sortBy = 'createdAt';
      
      render(<EncounterListView />);
      
      expect(screen.getByText('Search Query: test search')).toBeInTheDocument();
      expect(screen.getByText('Sort By: createdAt')).toBeInTheDocument();
    });

    it('should handle different sort configurations', () => {
      mockUseEncounterFilters.sortBy = 'difficulty';
      mockUseEncounterFilters.sortOrder = 'desc';
      
      render(<EncounterListView />);
      
      expect(screen.getByText('Sort By: difficulty')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all hooks returning empty/default states', () => {
      mockUseEncounterData.encounters = [];
      mockUseEncounterData.pagination = null;
      mockUseEncounterSelection.selectedEncounters = [];
      mockUseEncounterSelection.hasSelection = false;
      
      render(<EncounterListView />);
      
      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should handle rapid view mode changes', async () => {
      const user = userEvent.setup();
      render(<EncounterListView />);
      
      // Rapid switching
      const tableButton = screen.getByText('Table View');
      const gridButton = screen.getByText('Grid View');
      
      await user.click(tableButton);
      await user.click(gridButton);
      await user.click(tableButton);
      
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
      // This test verifies that the component uses the config utilities
      // by checking that the appropriate props are passed to child components
      render(<EncounterListView />);
      
      // Verify that ControlsSection receives the expected props
      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      
      // The actual config creation is tested in the configUtils tests
      // Here we just verify the component structure is correct
    });
  });
});