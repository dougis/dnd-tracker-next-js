'use client';

import { Plus, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PartyFilters, SortConfig, FilterCallbacks, PartySortBy, SortOrder } from '../types';

// Sort options configuration
const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'memberCount-desc', label: 'Most Members' },
  { value: 'memberCount-asc', label: 'Fewest Members' },
  { value: 'lastActivity-desc', label: 'Most Recent Activity' },
  { value: 'lastActivity-asc', label: 'Least Recent Activity' },
];

// Utility function to parse sort value
function parseSortValue(value: string): [PartySortBy, SortOrder] {
  return value.split('-') as [PartySortBy, SortOrder];
}

// Search input component
function SearchInput({ searchQuery, onSearchChange }: {
  searchQuery: string;
  onSearchChange: (_query: string) => void;
}) {
  return (
    <div className="flex-1 max-w-sm">
      <Input
        placeholder="Search parties..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}

// Sort select component
function SortSelect({ sortConfig, onSortChange }: {
  sortConfig: SortConfig;
  onSortChange: (_sortBy: PartySortBy, _sortOrder: SortOrder) => void;
}) {
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = parseSortValue(value);
    onSortChange(sortBy, sortOrder);
  };

  return (
    <Select
      value={`${sortConfig.sortBy}-${sortConfig.sortOrder}`}
      onValueChange={handleSortChange}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Search and sort controls
function SearchAndSort({
  searchQuery,
  sortConfig,
  onSearchChange,
  onSortChange
}: {
  searchQuery: string;
  sortConfig: SortConfig;
  onSearchChange: (_query: string) => void;
  onSortChange: (_sortBy: PartySortBy, _sortOrder: SortOrder) => void;
}) {
  return (
    <>
      <SearchInput searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <SortSelect sortConfig={sortConfig} onSortChange={onSortChange} />
    </>
  );
}

// View mode toggle buttons
function ViewModeToggle({
  viewMode,
  onViewModeChange
}: {
  viewMode: 'grid' | 'table';
  onViewModeChange: (_mode: 'grid' | 'table') => void;
}) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="rounded-r-none"
        aria-label="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="rounded-l-none"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ControlsSectionProps {
  filters: PartyFilters;
  searchQuery: string;
  sortConfig: SortConfig;
  filterCallbacks: FilterCallbacks;
  viewMode: 'grid' | 'table';
  onViewModeChange: (_mode: 'grid' | 'table') => void;
  onCreateParty: () => void;
}

// Utility function to check if filters are active
function hasActiveFilters(searchQuery: string, filters: PartyFilters): boolean {
  return Boolean(searchQuery || filters.memberCount.length > 0 || filters.tags.length > 0);
}

// Left section with search and filters
function LeftSection({
  searchQuery,
  sortConfig,
  filters,
  onSearchChange,
  onSortChange,
  onClearFilters
}: {
  searchQuery: string;
  sortConfig: SortConfig;
  filters: PartyFilters;
  onSearchChange: (_query: string) => void;
  onSortChange: (_sortBy: PartySortBy, _sortOrder: SortOrder) => void;
  onClearFilters: () => void;
}) {
  const showClearFilters = hasActiveFilters(searchQuery, filters);

  return (
    <div className="flex flex-1 gap-4">
      <SearchAndSort
        searchQuery={searchQuery}
        sortConfig={sortConfig}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
      />
      {showClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}

// Right section with view toggle and create button
function RightSection({
  viewMode,
  onViewModeChange,
  onCreateParty
}: {
  viewMode: 'grid' | 'table';
  onViewModeChange: (_mode: 'grid' | 'table') => void;
  onCreateParty: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      <Button onClick={onCreateParty}>
        <Plus className="mr-2 h-4 w-4" />
        Create Party
      </Button>
    </div>
  );
}

export function ControlsSection({
  filters,
  searchQuery,
  sortConfig,
  filterCallbacks,
  viewMode,
  onViewModeChange,
  onCreateParty,
}: ControlsSectionProps) {
  const { onSearchChange, onSortChange, onClearFilters } = filterCallbacks;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <LeftSection
        searchQuery={searchQuery}
        sortConfig={sortConfig}
        filters={filters}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        onClearFilters={onClearFilters}
      />
      <RightSection
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onCreateParty={onCreateParty}
      />
    </div>
  );
}