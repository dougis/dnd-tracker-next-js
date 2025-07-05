import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EncounterFilters } from '../EncounterFilters';
import { ViewModeToggle } from '@/components/shared/ViewModeToggle';
import type {
  EncounterFilters as Filters,
  SortConfig,
  FilterCallbacks
} from '../types';

interface ControlsSectionProps {
  filters: Filters;
  searchQuery: string;
  sortConfig: SortConfig;
  filterCallbacks: FilterCallbacks;
  viewMode: 'grid' | 'table';
  onViewModeChange: (_mode: 'grid' | 'table') => void;
  onCreateEncounter: () => void;
}

export function ControlsSection({
  filters,
  searchQuery,
  sortConfig,
  filterCallbacks,
  viewMode,
  onViewModeChange,
  onCreateEncounter,
}: ControlsSectionProps) {
  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <EncounterFilters
        filters={filters}
        searchQuery={searchQuery}
        sortConfig={sortConfig}
        callbacks={filterCallbacks}
      />

      <div className="flex items-center space-x-4">
        <ViewModeToggle value={viewMode} onValueChange={onViewModeChange} />
        <Button onClick={onCreateEncounter}>
          <Plus className="h-4 w-4 mr-2" />
          New Encounter
        </Button>
      </div>
    </div>
  );
}