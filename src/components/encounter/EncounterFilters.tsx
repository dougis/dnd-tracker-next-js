'use client';

import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { EncounterFilters as Filters, SortConfig, FilterCallbacks } from './types';
import { SearchInput } from './filters/SearchInput';
import { FilterDropdown } from './filters/FilterDropdown';
import { SortDropdown } from './filters/SortDropdown';
import { statusOptions, difficultyOptions, sortOptions } from './filters/constants';
import { checkHasActiveFilters, createFilterHandlers } from './filters/filterUtils';


interface EncounterFiltersProps {
  filters: Filters;
  searchQuery: string;
  sortConfig: SortConfig;
  callbacks: FilterCallbacks;
}

export function EncounterFilters({
  filters,
  searchQuery,
  sortConfig,
  callbacks,
}: EncounterFiltersProps) {
  const { sortBy, sortOrder } = sortConfig;
  const { onFiltersChange, onSearchChange, onSortChange, onClearFilters } = callbacks;

  const hasActiveFilters = checkHasActiveFilters(filters, searchQuery);
  const { handleStatusChange, handleDifficultyChange } = createFilterHandlers(filters, onFiltersChange);

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
      <SearchInput value={searchQuery} onChange={onSearchChange} />

      <div className="flex items-center space-x-2">
        <FilterDropdown
          label="Status"
          icon={<Filter className="h-4 w-4 mr-2" />}
          options={statusOptions}
          selectedValues={filters.status}
          onSelectionChange={handleStatusChange}
        />

        <FilterDropdown
          label="Difficulty"
          options={difficultyOptions}
          selectedValues={filters.difficulty}
          onSelectionChange={handleDifficultyChange}
        />

        <SortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          options={sortOptions}
          onSortChange={onSortChange}
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}