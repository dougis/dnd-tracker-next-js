'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EncounterFilters } from './EncounterFilters';
import { EncounterGrid } from './EncounterGrid';
import { EncounterTable } from './EncounterTable';
import { ViewModeToggle } from '@/components/shared/ViewModeToggle';
import { BatchActions } from './BatchActions';
import { Pagination } from '@/components/shared/Pagination';
import { useEncounterData } from './hooks/useEncounterData';
import { useEncounterFilters } from './hooks/useEncounterFilters';
import { useEncounterSelection } from './hooks/useEncounterSelection';

export function EncounterListView() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const {
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    updateFilters,
    updateSearchQuery,
    updateSort,
    clearFilters,
  } = useEncounterFilters();

  const {
    encounters,
    isLoading,
    error,
    pagination,
    goToPage,
    refetch,
  } = useEncounterData({
    filters,
    searchQuery,
    sortBy,
    sortOrder,
  });

  const {
    selectedEncounters,
    selectAll,
    selectEncounter,
    clearSelection,
    isAllSelected,
    hasSelection,
  } = useEncounterSelection(encounters);

  const handleCreateEncounter = () => {
    // TODO: Navigate to encounter creation
    console.log('Create new encounter');
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load encounters</p>
        <Button variant="outline" onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <EncounterFilters
          filters={filters}
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFiltersChange={updateFilters}
          onSearchChange={updateSearchQuery}
          onSortChange={updateSort}
          onClearFilters={clearFilters}
        />
        
        <div className="flex items-center space-x-4">
          <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
          <Button onClick={handleCreateEncounter}>
            <Plus className="h-4 w-4 mr-2" />
            New Encounter
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {hasSelection && (
        <BatchActions
          selectedCount={selectedEncounters.length}
          onClearSelection={clearSelection}
          onRefetch={refetch}
        />
      )}

      {/* Content */}
      {viewMode === 'grid' ? (
        <EncounterGrid
          encounters={encounters}
          isLoading={isLoading}
          selectedEncounters={selectedEncounters}
          onSelectEncounter={selectEncounter}
          onRefetch={refetch}
        />
      ) : (
        <EncounterTable
          encounters={encounters}
          isLoading={isLoading}
          selectedEncounters={selectedEncounters}
          isAllSelected={isAllSelected}
          onSelectAll={selectAll}
          onSelectEncounter={selectEncounter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={updateSort}
          onRefetch={refetch}
        />
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}