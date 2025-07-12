import React from 'react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';

// Shared mock for Next.js router
export const mockPush = jest.fn();

export const createRouterMock = () => ({
  useRouter: () => ({
    push: mockPush,
  }),
});

// Common beforeEach for navigation tests
export const commonNavigationBeforeEach = () => {
  jest.clearAllMocks();
};

// Common assertion helpers
export const expectNavigation = (path: string) => {
  expect(mockPush).toHaveBeenCalledWith(path);
};

export const expectNoNavigation = () => {
  expect(mockPush).not.toHaveBeenCalled();
};

// Helper to reduce duplication in test patterns
const createUserInteractionTest = (renderComponent: () => void, getElement: () => HTMLElement, action: (_user: any, _element: HTMLElement) => Promise<void>) => {
  return async () => {
    const user = userEvent.setup();
    renderComponent();
    const element = getElement();
    await action(user, element);
  };
};

// Centralized navigation test patterns
export const createNavigationTests = (config: {
  componentName: string;
  renderComponent: () => void;
  getClickableElement: () => HTMLElement;
  expectedNavigationPath: string;
  getCheckbox?: () => HTMLElement;
  getActionButton?: () => HTMLElement;
  shouldTestKeyboard?: boolean;
}) => {
  const {
    componentName,
    renderComponent,
    getClickableElement,
    expectedNavigationPath,
    getCheckbox,
    getActionButton,
    shouldTestKeyboard = false
  } = config;

  const createClickTest = (testName: string, elementGetter: () => HTMLElement, assertion: () => void) =>
    createUserInteractionTest(renderComponent, elementGetter, async (user, element) => {
      await user.click(element);
      assertion();
    });

  return {
    [`should navigate to encounter detail when ${componentName.toLowerCase()} is clicked`]:
      createClickTest('navigation', getClickableElement, () => expectNavigation(expectedNavigationPath)),

    ...(getCheckbox && {
      [`should not navigate when clicking on checkbox in ${componentName.toLowerCase()}`]:
        createClickTest('checkbox prevention', getCheckbox, () => expectNoNavigation())
    }),

    ...(getActionButton && {
      [`should not navigate when clicking on action button in ${componentName.toLowerCase()}`]:
        createClickTest('action prevention', getActionButton, () => expectNoNavigation())
    }),

    ...(shouldTestKeyboard && {
      [`should handle keyboard navigation in ${componentName.toLowerCase()}`]:
        createUserInteractionTest(renderComponent, getClickableElement, async (user, element) => {
          element.focus();
          await user.keyboard('{Enter}');
          // Note: Keyboard navigation implementation pending
        })
    })
  };
};

// Common mock component patterns
export const createMockCardHeader = () => ({
  CardHeader: ({ encounter, onSelect, isSelected }: any) => (
    <div data-testid="card-header">
      <h3>{encounter.name}</h3>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect?.(encounter.id)}
        data-checkbox="true"
      />
      <div data-actions="true">
        <button>Action Button</button>
      </div>
    </div>
  ),
});

export const createMockCardContent = () => ({
  CardContent: ({ encounter }: any) => (
    <div data-testid="card-content">
      <p>{encounter.name}</p>
      <p>{encounter.description}</p>
    </div>
  ),
});

export const createMockTableCells = () => ({
  SelectionCell: ({ encounter, isSelected, onSelect }: any) => (
    <td data-testid="selection-cell">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(encounter.id)}
        data-checkbox="true"
      />
    </td>
  ),
  NameCell: ({ encounter }: any) => <td data-testid="name-cell">{encounter.name}</td>,
  StatusCell: ({ encounter }: any) => <td data-testid="status-cell">{encounter.status}</td>,
  DifficultyCell: ({ encounter }: any) => <td data-testid="difficulty-cell">{encounter.difficulty}</td>,
  ParticipantsCell: ({ encounter }: any) => <td data-testid="participants-cell">{encounter.participantCount || 0}</td>,
  TargetLevelCell: ({ encounter }: any) => <td data-testid="target-level-cell">{encounter.targetLevel}</td>,
  UpdatedCell: () => <td data-testid="updated-cell">Updated</td>,
  ActionsCell: ({ encounter }: any) => (
    <td data-testid="actions-cell" data-actions="true">
      <button>Actions for {encounter.name}</button>
    </td>
  ),
});

// Common test data patterns
export const createNavigationTestEncounter = (overrides = {}) => ({
  id: 'nav-test-encounter-123',
  name: 'Navigation Test Encounter',
  description: 'Test encounter for navigation',
  status: 'draft',
  difficulty: 'medium',
  targetLevel: 5,
  participantCount: 0,
  playerCount: 0,
  tags: [],
  notes: '',
  environment: '',
  isActive: false,
  owner: 'test-owner',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Common mock function generator
const createMockFunctions = (functionNames: string[]) =>
  functionNames.reduce((acc, name) => ({ ...acc, [name]: jest.fn() }), {});

// Default mock configurations
const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 20,
};

// Common mock patterns for list view tests
export const createListViewMocks = () => ({
  useEncounterData: jest.fn(() => ({
    encounters: [],
    isLoading: false,
    error: null,
    pagination: defaultPagination,
    ...createMockFunctions(['goToPage', 'refetch']),
  })),
  useEncounterFilters: () => ({
    filters: { status: [], difficulty: [], tags: [] },
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    ...createMockFunctions(['updateFilters', 'updateSearchQuery', 'updateSort', 'clearFilters']),
  }),
  useEncounterSelection: jest.fn(() => ({
    selectedEncounters: [],
    isAllSelected: false,
    hasSelection: false,
    ...createMockFunctions(['selectAll', 'selectEncounter', 'clearSelection']),
  }))
});

// Common test patterns for prevent navigation scenarios
export const createPreventNavigationTests = (config: {
  renderComponent: () => void;
  getCheckbox?: () => HTMLElement;
  getActionButton?: () => HTMLElement;
  additionalPreventElements?: Array<() => HTMLElement>;
}) => {
  const { renderComponent, getCheckbox, getActionButton, additionalPreventElements = [] } = config;

  const tests: Record<string, () => Promise<void>> = {};

  const createPreventTest = (testName: string, elementGetter: () => HTMLElement) =>
    createUserInteractionTest(renderComponent, elementGetter, async (user, element) => {
      await user.click(element);
      expectNoNavigation();
    });

  if (getCheckbox) {
    tests['should prevent navigation when clicking checkbox'] = createPreventTest('checkbox', getCheckbox);
  }

  if (getActionButton) {
    tests['should prevent navigation when clicking action button'] = createPreventTest('action button', getActionButton);
  }

  additionalPreventElements.forEach((getElement, index) => {
    tests[`should prevent navigation when clicking prevent element ${index + 1}`] =
      createPreventTest(`prevent element ${index + 1}`, getElement);
  });

  return tests;
};