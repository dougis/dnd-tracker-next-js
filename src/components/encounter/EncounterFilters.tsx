'use client';

import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { EncounterFilters as Filters, SortBy, SortOrder } from './types';
import { SearchInput } from './filters/SearchInput';
import { FilterDropdown } from './filters/FilterDropdown';
import { SortDropdown } from './filters/SortDropdown';
import { statusOptions, difficultyOptions, sortOptions } from './filters/constants';
import { checkHasActiveFilters, createFilterHandlers } from './filters/filterUtils';

interface EncounterFiltersProps {
  filters: Filters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onFiltersChange: (_filters: Partial<Filters>) => void;
  onSearchChange: (_query: string) => void;
  onSortChange: (_sortBy: SortBy, _sortOrder: SortOrder) => void;
  onClearFilters: () => void;
}

export function EncounterFilters({
  filters,
  searchQuery,
  sortBy,
  sortOrder,
  onFiltersChange,
  onSearchChange,
  onSortChange,
  onClearFilters,
}: EncounterFiltersProps) {
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