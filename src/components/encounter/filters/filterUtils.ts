import type { EncounterFilters as Filters } from '../types';

const hasSearchQuery = (searchQuery: string): boolean => !!searchQuery;

const hasStatusFilters = (filters: Filters): boolean => filters.status.length > 0;

const hasDifficultyFilters = (filters: Filters): boolean => filters.difficulty.length > 0;

const hasLevelFilters = (filters: Filters): boolean =>
  filters.targetLevelMin !== undefined || filters.targetLevelMax !== undefined;

const hasTagFilters = (filters: Filters): boolean => filters.tags.length > 0;

export const checkHasActiveFilters = (filters: Filters, searchQuery: string): boolean => {
  return hasSearchQuery(searchQuery) ||
    hasStatusFilters(filters) ||
    hasDifficultyFilters(filters) ||
    hasLevelFilters(filters) ||
    hasTagFilters(filters);
};

const toggleFilterValue = (currentValues: string[], value: string): string[] => {
  return currentValues.includes(value)
    ? currentValues.filter(v => v !== value)
    : [...currentValues, value];
};

export const createToggleHandler = (
  currentValues: string[],
  onFiltersChange: (_filters: Partial<Filters>) => void,
  filterKey: keyof Filters
) => {
  return (value: string) => {
    const newValues = toggleFilterValue(currentValues, value);
    onFiltersChange({ [filterKey]: newValues });
  };
};

export const createFilterHandlers = (
  filters: Filters,
  onFiltersChange: (_filters: Partial<Filters>) => void
) => {
  return {
    handleStatusChange: createToggleHandler(filters.status, onFiltersChange, 'status'),
    handleDifficultyChange: createToggleHandler(filters.difficulty, onFiltersChange, 'difficulty'),
  };
};