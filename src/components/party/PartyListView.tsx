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
    console.log('Create new party');
  };

  if (error) {
    return <ErrorFallback onRetry={refetch} error={error} />;
  }

  return (
    <div className="space-y-6">
      <ControlsSection
        filters={filters}
        searchQuery={searchQuery}
        sortConfig={{ sortBy, sortOrder }}
        filterCallbacks={{
          onFiltersChange: updateFilters,
          onSearchChange: updateSearchQuery,
          onSortChange: updateSort,
          onClearFilters: clearFilters,
        }}
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
          sortConfig: {
            sortBy,
            sortOrder,
            onSort: updateSort,
          },
          selectionConfig: {
            selectedParties,
            isAllSelected,
            onSelectAll: selectAll,
            onSelectParty: selectParty,
          },
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