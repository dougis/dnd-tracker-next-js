import type { EncounterListItem, EncounterFilters, PaginationInfo } from '../types';

export const createMockEncounter = (overrides: Partial<EncounterListItem> = {}): EncounterListItem => ({
  id: '507f1f77bcf86cd799439012',
  name: 'Test Encounter',
  description: 'A test encounter for testing purposes',
  status: 'draft',
  difficulty: 'medium',
  targetLevel: 5,
  estimatedDuration: 60,
  participants: [],
  participantCount: 4,
  playerCount: 2,
  tags: ['combat', 'dungeon'],
  notes: '',
  environment: '',
  isActive: false,
  owner: '507f1f77bcf86cd799439013',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  ...overrides,
});

export const createMockEncounters = (count: number = 5): EncounterListItem[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockEncounter({
      id: `507f1f77bcf86cd79943901${index}`,
      name: `Encounter ${index + 1}`,
      difficulty: ['trivial', 'easy', 'medium', 'hard', 'deadly'][index % 5] as any,
      status: ['draft', 'active', 'completed', 'archived'][index % 4] as any,
      targetLevel: 3 + index,
      participantCount: 2 + index,
      playerCount: 1 + Math.floor(index / 2),
    })
  );
};

export const createMockFilters = (overrides: Partial<EncounterFilters> = {}): EncounterFilters => ({
  status: [],
  difficulty: [],
  targetLevelMin: undefined,
  targetLevelMax: undefined,
  tags: [],
  ...overrides,
});

export const createMockPagination = (overrides: Partial<PaginationInfo> = {}): PaginationInfo => ({
  currentPage: 1,
  totalPages: 3,
  totalItems: 25,
  itemsPerPage: 10,
  ...overrides,
});

// Helper to create standard mock functions
const createMockFunctions = () => ({
  onSelect: jest.fn(),
  onRefetch: jest.fn(),
  onFiltersChange: jest.fn(),
  onSearchChange: jest.fn(),
  onSortChange: jest.fn(),
  onClearFilters: jest.fn(),
  onSelectAll: jest.fn(),
  onSelectEncounter: jest.fn(),
  onSort: jest.fn(),
  onClearSelection: jest.fn(),
});

// Base props generator
const createBaseProps = (baseProps: any, overrides: any = {}) => ({
  ...baseProps,
  ...createMockFunctions(),
  ...overrides,
});

export const createMockProps = {
  encounterListView: (overrides = {}) => 
    createBaseProps({}, overrides),

  encounterCard: (overrides = {}) => 
    createBaseProps({
      encounter: createMockEncounter(),
      isSelected: false,
    }, overrides),

  encounterFilters: (overrides = {}) => 
    createBaseProps({
      filters: createMockFilters(),
      searchQuery: '',
      sortBy: 'updatedAt' as const,
      sortOrder: 'desc' as const,
    }, overrides),

  encounterGrid: (overrides = {}) => 
    createBaseProps({
      encounters: createMockEncounters(),
      isLoading: false,
      selectedEncounters: [],
    }, overrides),

  encounterTable: (overrides = {}) => 
    createBaseProps({
      encounters: createMockEncounters(),
      isLoading: false,
      selectedEncounters: [],
      isAllSelected: false,
      sortBy: 'updatedAt' as const,
      sortOrder: 'desc' as const,
    }, overrides),

  batchActions: (overrides = {}) => 
    createBaseProps({
      selectedCount: 3,
    }, overrides),
};

// Helper to check multiple expectations at once
const expectMultiple = (checks: Array<{ actual: any, expected: any }>) => {
  checks.forEach(({ actual, expected }) => {
    expect(actual).toEqual(expected);
  });
};

export const expectInitialState = {
  encounterData: (result: any) => {
    expectMultiple([
      { actual: result.current.encounters, expected: [] },
      { actual: result.current.isLoading, expected: false },
      { actual: result.current.error, expected: null },
      { actual: result.current.pagination, expected: null },
    ]);
  },

  encounterFilters: (result: any) => {
    expectMultiple([
      { actual: result.current.filters, expected: createMockFilters() },
      { actual: result.current.searchQuery, expected: '' },
      { actual: result.current.sortBy, expected: 'updatedAt' },
      { actual: result.current.sortOrder, expected: 'desc' },
    ]);
  },

  encounterSelection: (result: any) => {
    expectMultiple([
      { actual: result.current.selectedEncounters, expected: [] },
      { actual: result.current.isAllSelected, expected: false },
      { actual: result.current.hasSelection, expected: false },
    ]);
  },
};

export const mockServiceResponses = {
  searchSuccess: (encounters: EncounterListItem[] = createMockEncounters()) => ({
    success: true,
    data: {
      encounters,
      currentPage: 1,
      totalPages: 3,
      totalItems: encounters.length,
    },
  }),

  searchError: (error = 'Failed to search encounters') => ({
    success: false,
    error,
  }),

  deleteSuccess: () => ({
    success: true,
    data: null,
  }),

  duplicateSuccess: (encounter: EncounterListItem = createMockEncounter()) => ({
    success: true,
    data: encounter,
  }),
};

export const setupTestEnvironment = () => {
  const cleanup = () => {
    jest.clearAllMocks();
  };

  return { cleanup };
};