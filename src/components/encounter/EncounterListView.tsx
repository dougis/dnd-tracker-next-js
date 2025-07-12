'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BatchActions } from './BatchActions';
import { Pagination } from '@/components/shared/Pagination';
import { useEncounterData } from './hooks/useEncounterData';
import { useEncounterFilters } from './hooks/useEncounterFilters';
import { useEncounterSelection } from './hooks/useEncounterSelection';
import { ErrorFallback } from './EncounterListView/ErrorFallback';
import { ControlsSection } from './EncounterListView/ControlsSection';
import { ContentSection } from './EncounterListView/ContentSection';
import {
  createSortConfig,
  createFilterCallbacks,
  createTableSortConfig,
  createTableSelectionConfig,
} from './EncounterListView/configUtils';

export function EncounterListView() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const router = useRouter();

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
    router.push('/encounters/create');
  };

  if (error) {
    return <ErrorFallback onRetry={refetch} />;
  }

  const configs = {
    sort: createSortConfig(sortBy, sortOrder),
    filterCallbacks: createFilterCallbacks(updateFilters, updateSearchQuery, updateSort, clearFilters),
    tableSort: createTableSortConfig(sortBy, sortOrder, updateSort),
    tableSelection: createTableSelectionConfig(selectedEncounters, isAllSelected, selectAll, selectEncounter),
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
        onCreateEncounter={handleCreateEncounter}
      />

      {hasSelection && (
        <BatchActions
          selectedCount={selectedEncounters.length}
          onClearSelection={clearSelection}
          onRefetch={refetch}
        />
      )}

      <ContentSection
        viewMode={viewMode}
        gridProps={{
          encounters,
          isLoading,
          selectedEncounters,
          onSelectEncounter: selectEncounter,
          onRefetch: refetch,
        }}
        tableProps={{
          encounters,
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