import type {
  SortConfig,
  FilterCallbacks,
  TableSortConfig,
  TableSelectionConfig
} from '../types';
import type { SortBy, SortOrder, EncounterFilters } from '../types';

export const createSortConfig = (sortBy: SortBy, sortOrder: SortOrder): SortConfig => ({
  sortBy,
  sortOrder,
});

export const createFilterCallbacks = (
  updateFilters: (_filters: Partial<EncounterFilters>) => void,
  updateSearchQuery: (_query: string) => void,
  updateSort: (_sortBy: SortBy, _sortOrder: SortOrder) => void,
  clearFilters: () => void
): FilterCallbacks => ({
  onFiltersChange: updateFilters,
  onSearchChange: updateSearchQuery,
  onSortChange: updateSort,
  onClearFilters: clearFilters,
});

export const createTableSortConfig = (
  sortBy: SortBy,
  sortOrder: SortOrder,
  onSort: (_sortBy: SortBy, _sortOrder: SortOrder) => void
): TableSortConfig => ({
  sortBy,
  sortOrder,
  onSort,
});

export const createTableSelectionConfig = (
  selectedEncounters: string[],
  isAllSelected: boolean,
  onSelectAll: () => void,
  onSelectEncounter: (_id: string) => void
): TableSelectionConfig => ({
  selectedEncounters,
  isAllSelected,
  onSelectAll,
  onSelectEncounter,
});