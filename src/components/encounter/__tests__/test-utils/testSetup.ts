/**
 * Centralized test setup utilities to reduce duplication across encounter tests
 */
import React from 'react';

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