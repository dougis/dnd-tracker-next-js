/**
 * Centralized test setup utilities to reduce duplication across encounter tests
 */
import React from 'react';
import { render } from '@testing-library/react';
import { BatchActions } from '../../BatchActions';
import { commonBeforeEach } from './mockSetup';
import { COMMON_TEST_COUNT, COMMON_TEST_ENCOUNTERS } from './batchActionsSharedMocks';

export interface BatchActionsTestProps {
  selectedCount?: number;
  selectedEncounters?: string[];
  onClearSelection?: jest.Mock;
  onRefetch?: jest.Mock;
}

// Common render wrapper for components requiring table structure
export const renderInTable = (component: React.ReactElement) => {
  const { render } = require('@testing-library/react');
  return render(
    React.createElement('table', null,
      React.createElement('tbody', null,
        React.createElement('tr', null, component)
      )
    )
  );
};

// Common render wrapper for components requiring full table structure
export const renderInFullTable = (component: React.ReactElement) => {
  const { render } = require('@testing-library/react');
  return render(
    React.createElement('table', null, component)
  );
};

// Common test data factory
export const createTestData = (overrides = {}) => ({
  encounters: [],
  isLoading: false,
  selectedEncounters: [],
  onSelectEncounter: jest.fn(),
  onRefetch: jest.fn(),
  ...overrides,
});

// Common mock service setup
export const createMockServices = () => ({
  EncounterService: {
    cloneEncounter: jest.fn(),
    deleteEncounter: jest.fn(),
    searchEncounters: jest.fn(),
  },
  toast: jest.fn(),
});

// Common action handlers mock
export const createMockActionHandlers = () => ({
  navigation: {
    handleView: jest.fn(),
    handleEdit: jest.fn(),
    handleStartCombat: jest.fn(),
    handleShare: jest.fn(),
  },
  service: {
    handleDuplicate: jest.fn(),
    handleDelete: jest.fn(),
  },
});

// Common table configuration mocks
export const createMockSelectionConfig = (overrides = {}) => ({
  selectedEncounters: [],
  isAllSelected: false,
  onSelectAll: jest.fn(),
  onSelectEncounter: jest.fn(),
  ...overrides,
});

export const createMockSortConfig = (overrides = {}) => ({
  sortBy: 'name',
  sortOrder: 'asc',
  onSort: jest.fn(),
  ...overrides,
});

// Common test expectations helper
export const expectElementsToBeInDocument = (elements: string[]) => {
  const { screen } = require('@testing-library/react');
  elements.forEach(element => {
    expect(screen.getByText(element)).toBeInTheDocument();
  });
};

// Common CSS class assertion helper
export const expectElementToHaveClasses = (element: HTMLElement, classes: string[]) => {
  classes.forEach(className => {
    expect(element).toHaveClass(className);
  });
};

// BatchActions-specific test utilities

/**
 * Create default props for BatchActions component
 */
export const createDefaultBatchActionsProps = (): BatchActionsTestProps => ({
  selectedCount: COMMON_TEST_COUNT,
  selectedEncounters: COMMON_TEST_ENCOUNTERS,
  onClearSelection: jest.fn(),
  onRefetch: jest.fn(),
});

/**
 * Render BatchActions component with default props
 */
export const createBatchActionsRenderer = (defaultProps: BatchActionsTestProps) => {
  return (props: Partial<BatchActionsTestProps> = {}) => {
    return render(React.createElement(BatchActions, { ...defaultProps, ...props }));
  };
};

/**
 * Common beforeEach setup for BatchActions tests
 */
export const setupBatchActionsBeforeEach = (mockFetch: jest.Mock) => {
  commonBeforeEach();
  mockFetch.mockClear();
};

/**
 * Common expectation for callback functions being called
 */
export const expectCallbacksInvoked = (onClearSelection: jest.Mock, onRefetch: jest.Mock) => {
  expect(onClearSelection).toHaveBeenCalledTimes(1);
  expect(onRefetch).toHaveBeenCalledTimes(1);
};

/**
 * Common toast expectation helpers
 */
export const expectSuccessToast = (
  mockToast: jest.Mock,
  operation: string,
  count: number | string
) => {
  expect(mockToast).toHaveBeenCalledWith({
    title: `Encounters ${operation}d`,
    description: `${count} encounters have been ${operation}d successfully.`,
  });
};

export const expectErrorToast = (mockToast: jest.Mock, message: string) => {
  expect(mockToast).toHaveBeenCalledWith({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
};