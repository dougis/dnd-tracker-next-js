import type { EncounterFilters as Filters } from '../types';

export const checkHasActiveFilters = (filters: Filters, searchQuery: string): boolean => {
  return !!(
    searchQuery ||
    filters.status.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.targetLevelMin !== undefined ||
    filters.targetLevelMax !== undefined ||
    filters.tags.length > 0
  );
};

export const createToggleHandler = (
  currentValues: string[],
  onFiltersChange: (_filters: Partial<Filters>) => void,
  filterKey: keyof Filters
) => {
  return (value: string) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
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