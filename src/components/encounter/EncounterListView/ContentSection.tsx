import React from 'react';
import { EncounterGrid } from '../EncounterGrid';
import { EncounterTable } from '../EncounterTable';
import type {
  EncounterListItem,
  TableSortConfig,
  TableSelectionConfig
} from '../types';

interface GridProps {
  encounters: EncounterListItem[];
  isLoading: boolean;
  selectedEncounters: string[];
  onSelectEncounter: (_id: string) => void;
  onRefetch: () => void;
}

interface TableProps {
  encounters: EncounterListItem[];
  isLoading: boolean;
  sortConfig: TableSortConfig;
  selectionConfig: TableSelectionConfig;
  onRefetch: () => void;
}

interface ContentSectionProps {
  viewMode: 'grid' | 'table';
  gridProps: GridProps;
  tableProps: TableProps;
}

export function ContentSection({
  viewMode,
  gridProps,
  tableProps,
}: ContentSectionProps) {
  if (viewMode === 'grid') {
    return (
      <EncounterGrid
        encounters={gridProps.encounters}
        isLoading={gridProps.isLoading}
        selectedEncounters={gridProps.selectedEncounters}
        onSelectEncounter={gridProps.onSelectEncounter}
        onRefetch={gridProps.onRefetch}
      />
    );
  }

  return (
    <EncounterTable
      encounters={tableProps.encounters}
      isLoading={tableProps.isLoading}
      selection={tableProps.selectionConfig}
      sort={tableProps.sortConfig}
      onRefetch={tableProps.onRefetch}
    />
  );
}