import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterListView } from '../EncounterListView';
import { mockPush, commonNavigationBeforeEach } from './test-utils/navigationTestHelpers';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock all the complex dependencies
jest.mock('../hooks/useEncounterData', () => ({
  useEncounterData: jest.fn(() => ({
    encounters: [],
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
    },
    goToPage: jest.fn(),
    refetch: jest.fn(),
  })),
}));

jest.mock('../hooks/useEncounterFilters', () => ({
  useEncounterFilters: () => ({
    filters: { status: [], difficulty: [], tags: [] },
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    updateFilters: jest.fn(),
    updateSearchQuery: jest.fn(),
    updateSort: jest.fn(),
    clearFilters: jest.fn(),
  }),
}));

jest.mock('../hooks/useEncounterSelection', () => ({
  useEncounterSelection: jest.fn(() => ({
    selectedEncounters: [],
    selectAll: jest.fn(),
    selectEncounter: jest.fn(),
    clearSelection: jest.fn(),
    isAllSelected: false,
    hasSelection: false,
  })),
}));

jest.mock('../EncounterListView/ErrorFallback', () => ({
  ErrorFallback: ({ onRetry }: any) => (
    <div data-testid="error-fallback">
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

jest.mock('../EncounterListView/ControlsSection', () => ({
  ControlsSection: ({ onCreateEncounter }: any) => (
    <div data-testid="controls-section">
      <button onClick={onCreateEncounter} data-testid="create-encounter-btn">
        Create New Encounter
      </button>
    </div>
  ),
}));

jest.mock('../EncounterListView/ContentSection', () => ({
  ContentSection: () => (
    <div data-testid="content-section">Content</div>
  ),
}));

jest.mock('../BatchActions', () => ({
  BatchActions: () => (
    <div data-testid="batch-actions">Batch Actions</div>
  ),
}));

jest.mock('@/components/shared/Pagination', () => ({
  Pagination: () => (
    <div data-testid="pagination">Pagination</div>
  ),
}));

describe('EncounterListView Navigation', () => {
  beforeEach(() => {
    commonNavigationBeforeEach();
  });

  describe('Create Encounter Navigation', () => {
    it('should navigate to encounter creation when create button is clicked', async () => {
      const user = userEvent.setup();

      render(<EncounterListView />);

      const createButton = screen.getByTestId('create-encounter-btn');
      await user.click(createButton);

      expect(mockPush).toHaveBeenCalledWith('/encounters/create');
    });

    it('should render create encounter button in controls section', () => {
      render(<EncounterListView />);

      expect(screen.getByTestId('create-encounter-btn')).toBeInTheDocument();
      expect(screen.getByText('Create New Encounter')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render main layout components', () => {
      render(<EncounterListView />);

      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not render batch actions when no selection', () => {
      render(<EncounterListView />);

      expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Reset all mocks
      commonNavigationBeforeEach();

      // Mock useEncounterData to return an error
      const { useEncounterData } = require('../hooks/useEncounterData');
      useEncounterData.mockImplementation(() => ({
        encounters: [],
        isLoading: false,
        error: new Error('Failed to load encounters'),
        pagination: null,
        goToPage: jest.fn(),
        refetch: jest.fn(),
      }));
    });

    it('should render error fallback when there is an error', () => {
      render(<EncounterListView />);

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('controls-section')).not.toBeInTheDocument();
    });

    it('should handle retry from error fallback', async () => {
      const user = userEvent.setup();

      render(<EncounterListView />);

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      // The retry functionality should be called
      // (specific implementation depends on the error fallback component)
    });
  });

  describe('Batch Actions Visibility', () => {
    beforeEach(() => {
      // Reset all mocks
      commonNavigationBeforeEach();

      // Mock useEncounterData to return normal state (no error)
      const { useEncounterData } = require('../hooks/useEncounterData');
      useEncounterData.mockImplementation(() => ({
        encounters: [],
        isLoading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
        },
        goToPage: jest.fn(),
        refetch: jest.fn(),
      }));

      // Mock useEncounterSelection to return a selection
      const { useEncounterSelection } = require('../hooks/useEncounterSelection');
      useEncounterSelection.mockImplementation(() => ({
        selectedEncounters: ['encounter-1', 'encounter-2'],
        selectAll: jest.fn(),
        selectEncounter: jest.fn(),
        clearSelection: jest.fn(),
        isAllSelected: false,
        hasSelection: true,
      }));
    });

    it('should render batch actions when encounters are selected', () => {
      render(<EncounterListView />);

      expect(screen.getByTestId('batch-actions')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      // Reset all mocks
      commonNavigationBeforeEach();

      // Mock useEncounterData to return loading state
      const { useEncounterData } = require('../hooks/useEncounterData');
      useEncounterData.mockImplementation(() => ({
        encounters: [],
        isLoading: true,
        error: null,
        pagination: null,
        goToPage: jest.fn(),
        refetch: jest.fn(),
      }));
    });

    it('should render content section even when loading', () => {
      render(<EncounterListView />);

      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
    });
  });

  describe('Pagination Visibility', () => {
    beforeEach(() => {
      // Reset all mocks to ensure clean state
      commonNavigationBeforeEach();

      // Ensure useEncounterData returns pagination data with no error
      const { useEncounterData } = require('../hooks/useEncounterData');
      useEncounterData.mockImplementation(() => ({
        encounters: [],
        isLoading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 3,
          totalItems: 45,
          itemsPerPage: 20,
        },
        goToPage: jest.fn(),
        refetch: jest.fn(),
      }));

      // Ensure no selection so BatchActions doesn't interfere
      const { useEncounterSelection } = require('../hooks/useEncounterSelection');
      useEncounterSelection.mockImplementation(() => ({
        selectedEncounters: [],
        selectAll: jest.fn(),
        selectEncounter: jest.fn(),
        clearSelection: jest.fn(),
        isAllSelected: false,
        hasSelection: false,
      }));
    });

    it('should render pagination when pagination data is available', () => {
      render(<EncounterListView />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    describe('when no pagination data', () => {
      beforeEach(() => {
        // Reset all mocks
        commonNavigationBeforeEach();

        // Mock useEncounterData to return no pagination
        const { useEncounterData } = require('../hooks/useEncounterData');
        useEncounterData.mockImplementation(() => ({
          encounters: [],
          isLoading: false,
          error: null,
          pagination: null,
          goToPage: jest.fn(),
          refetch: jest.fn(),
        }));
      });

      it('should not render pagination when pagination data is null', () => {
        render(<EncounterListView />);

        expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
      });
    });
  });
});