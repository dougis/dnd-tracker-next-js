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

export const createMockProps = {
  encounterListView: (overrides = {}) => ({
    // Mock props for EncounterListView
    ...overrides,
  }),

  encounterCard: (overrides = {}) => ({
    encounter: createMockEncounter(),
    isSelected: false,
    onSelect: jest.fn(),
    onRefetch: jest.fn(),
    ...overrides,
  }),

  encounterFilters: (overrides = {}) => ({
    filters: createMockFilters(),
    searchQuery: '',
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
    onFiltersChange: jest.fn(),
    onSearchChange: jest.fn(),
    onSortChange: jest.fn(),
    onClearFilters: jest.fn(),
    ...overrides,
  }),

  encounterGrid: (overrides = {}) => ({
    encounters: createMockEncounters(),
    isLoading: false,
    selectedEncounters: [],
    onSelectEncounter: jest.fn(),
    onRefetch: jest.fn(),
    ...overrides,
  }),

  encounterTable: (overrides = {}) => ({
    encounters: createMockEncounters(),
    isLoading: false,
    selectedEncounters: [],
    isAllSelected: false,
    onSelectAll: jest.fn(),
    onSelectEncounter: jest.fn(),
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
    onSort: jest.fn(),
    onRefetch: jest.fn(),
    ...overrides,
  }),

  batchActions: (overrides = {}) => ({
    selectedCount: 3,
    onClearSelection: jest.fn(),
    onRefetch: jest.fn(),
    ...overrides,
  }),
};

export const expectInitialState = {
  encounterData: (result: any) => {
    expect(result.current.encounters).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.pagination).toBe(null);
  },

  encounterFilters: (result: any) => {
    expect(result.current.filters).toEqual(createMockFilters());
    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('updatedAt');
    expect(result.current.sortOrder).toBe('desc');
  },

  encounterSelection: (result: any) => {
    expect(result.current.selectedEncounters).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);
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