import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterListView } from '../EncounterListView';
import {
  mockPush,
  commonNavigationBeforeEach,
  expectNavigation
} from './test-utils/navigationTestHelpers';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Use centralized mock setup
jest.mock('../hooks/useEncounterData', () => {
  const { createListViewMocks } = require('./test-utils/navigationTestHelpers');
  return {
    useEncounterData: createListViewMocks().useEncounterData,
  };
});

jest.mock('../hooks/useEncounterFilters', () => {
  const { createListViewMocks } = require('./test-utils/navigationTestHelpers');
  return {
    useEncounterFilters: createListViewMocks().useEncounterFilters,
  };
});

jest.mock('../hooks/useEncounterSelection', () => {
  const { createListViewMocks } = require('./test-utils/navigationTestHelpers');
  return {
    useEncounterSelection: createListViewMocks().useEncounterSelection,
  };
});

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
  const renderComponent = () => render(<EncounterListView />);

  const getElements = () => ({
    createButton: () => screen.getByTestId('create-encounter-btn'),
    retryButton: () => screen.getByText('Retry')
  });

  beforeEach(() => {
    commonNavigationBeforeEach();
  });

  describe('Create Encounter Navigation', () => {
    it('should navigate to encounter creation when create button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(getElements().createButton());
      expectNavigation('/encounters/create');
    });

    it('should render create encounter button in controls section', () => {
      renderComponent();
      expect(getElements().createButton()).toBeInTheDocument();
      expect(screen.getByText('Create New Encounter')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render main layout components', () => {
      renderComponent();
      expect(screen.getByTestId('controls-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not render batch actions when no selection', () => {
      renderComponent();
      expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      commonNavigationBeforeEach();
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
    });
  });

  describe('Batch Actions Visibility', () => {
    beforeEach(() => {
      commonNavigationBeforeEach();
      const { useEncounterData } = require('../hooks/useEncounterData');
      const { useEncounterSelection } = require('../hooks/useEncounterSelection');
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
      commonNavigationBeforeEach();
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
      commonNavigationBeforeEach();
      const { useEncounterData } = require('../hooks/useEncounterData');
      const { useEncounterSelection } = require('../hooks/useEncounterSelection');
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
  });

  describe('No Pagination Data', () => {
    beforeEach(() => {
      commonNavigationBeforeEach();
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