import React from 'react';
import { EncounterGrid } from '../EncounterGrid';
import { EncounterTable } from '../EncounterTable';
import type {
  EncounterListItem,
  TableSortConfig,
  TableSelectionConfig
} from '../types';

interface ContentSectionProps {
  viewMode: 'grid' | 'table';
  encounters: EncounterListItem[];
  isLoading: boolean;
  selectedEncounters: string[];
  onSelectEncounter: (_id: string) => void;
  tableSortConfig: TableSortConfig;
  tableSelectionConfig: TableSelectionConfig;
  onRefetch: () => void;
}

export function ContentSection({
  viewMode,
  encounters,
  isLoading,
  selectedEncounters,
  onSelectEncounter,
  tableSortConfig,
  tableSelectionConfig,
  onRefetch,
}: ContentSectionProps) {
  if (viewMode === 'grid') {
    return (
      <EncounterGrid
        encounters={encounters}
        isLoading={isLoading}
        selectedEncounters={selectedEncounters}
        onSelectEncounter={onSelectEncounter}
        onRefetch={onRefetch}
      />
    );
  }

  return (
    <EncounterTable
      encounters={encounters}
      isLoading={isLoading}
      selection={tableSelectionConfig}
      sort={tableSortConfig}
      onRefetch={onRefetch}
    />
  );
}