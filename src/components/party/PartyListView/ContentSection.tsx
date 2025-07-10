'use client';

import { PartyGrid } from './PartyGrid';
import { PartyTable } from './PartyTable';
import type { PartyListItem, TableSortConfig, TableSelectionConfig } from '../types';

interface GridProps {
  parties: PartyListItem[];
  isLoading: boolean;
  selectedParties: string[];
  onSelectParty: (_id: string) => void;
  onRefetch: () => void;
}

interface TableProps {
  parties: PartyListItem[];
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

export function ContentSection({ viewMode, gridProps, tableProps }: ContentSectionProps) {
  if (viewMode === 'table') {
    return <PartyTable {...tableProps} />;
  }

  return <PartyGrid {...gridProps} />;
}