'use client';

import { useState } from 'react';
import { BatchActions } from './BatchActions';
import { Pagination } from '@/components/shared/Pagination';
import { usePartyData } from './hooks/usePartyData';
import { usePartyFilters } from './hooks/usePartyFilters';
import { usePartySelection } from './hooks/usePartySelection';
import { ErrorFallback } from './PartyListView/ErrorFallback';
import { ControlsSection } from './PartyListView/ControlsSection';
import { ContentSection } from './PartyListView/ContentSection';
import type { PartySortBy, SortOrder } from './types';

// Configuration utility functions
const createSortConfig = (sortBy: PartySortBy, sortOrder: SortOrder) => ({
  sortBy,
  sortOrder,
});

const createFilterCallbacks = (
  updateFilters: any,
  updateSearchQuery: any,
  updateSort: any,
  clearFilters: any
) => ({
  onFiltersChange: updateFilters,
  onSearchChange: updateSearchQuery,
  onSortChange: updateSort,
  onClearFilters: clearFilters,
});

const createTableSortConfig = (
  sortBy: PartySortBy,
  sortOrder: SortOrder,
  updateSort: any
) => ({
  sortBy,
  sortOrder,
  onSort: updateSort,
});

const createTableSelectionConfig = (
  selectedParties: string[],
  isAllSelected: boolean,
  selectAll: any,
  selectParty: any
) => ({
  selectedParties,
  isAllSelected,
  onSelectAll: selectAll,
  onSelectParty: selectParty,
});

export function PartyListView() {
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
  } = usePartyFilters();

  const {
    parties,
    isLoading,
    error,
    pagination,
    goToPage,
    refetch,
  } = usePartyData({
    filters,
    searchQuery,
    sortBy,
    sortOrder,
  });

  const {
    selectedParties,
    selectAll,
    selectParty,
    clearSelection,
    isAllSelected,
    hasSelection,
  } = usePartySelection(parties);

  const handleCreateParty = () => {
    // TODO: Navigate to party creation
    console.log('Create new party');
  };

  if (error) {
    return <ErrorFallback onRetry={refetch} error={error} />;
  }

  const configs = {
    sort: createSortConfig(sortBy, sortOrder),
    filterCallbacks: createFilterCallbacks(updateFilters, updateSearchQuery, updateSort, clearFilters),
    tableSort: createTableSortConfig(sortBy, sortOrder, updateSort),
    tableSelection: createTableSelectionConfig(selectedParties, isAllSelected, selectAll, selectParty),
  };

  return (
    <div className="space-y-6">
      <ControlsSection
        filters={filters}
        searchQuery={searchQuery}
        sortConfig={configs.sort}
        filterCallbacks={configs.filterCallbacks}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateParty={handleCreateParty}
      />

      {hasSelection && (
        <BatchActions
          selectedCount={selectedParties.length}
          onClearSelection={clearSelection}
          onRefetch={refetch}
        />
      )}

      <ContentSection
        viewMode={viewMode}
        gridProps={{
          parties,
          isLoading,
          selectedParties,
          onSelectParty: selectParty,
          onRefetch: refetch,
        }}
        tableProps={{
          parties,
          isLoading,
          sortConfig: configs.tableSort,
          selectionConfig: configs.tableSelection,
          onRefetch: refetch,
        }}
      />

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