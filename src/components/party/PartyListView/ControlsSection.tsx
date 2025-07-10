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
      <div className="flex-1 max-w-sm">
        <Input
          placeholder="Search parties..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select
        value={`${sortConfig.sortBy}-${sortConfig.sortOrder}`}
        onValueChange={(value) => {
          const [sortBy, sortOrder] = value.split('-') as [PartySortBy, SortOrder];
          onSortChange(sortBy, sortOrder);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          <SelectItem value="memberCount-desc">Most Members</SelectItem>
          <SelectItem value="memberCount-asc">Fewest Members</SelectItem>
          <SelectItem value="lastActivity-desc">Most Recent Activity</SelectItem>
          <SelectItem value="lastActivity-asc">Least Recent Activity</SelectItem>
        </SelectContent>
      </Select>
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
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="rounded-l-none"
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
  const hasActiveFilters = searchQuery || filters.memberCount.length > 0 || filters.tags.length > 0;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left side - Search and filters */}
      <div className="flex flex-1 gap-4">
        <SearchAndSort
          searchQuery={searchQuery}
          sortConfig={sortConfig}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
        />

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Right side - View mode and create button */}
      <div className="flex items-center gap-2">
        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

        <Button onClick={onCreateParty}>
          <Plus className="mr-2 h-4 w-4" />
          Create Party
        </Button>
      </div>
    </div>
  );
}