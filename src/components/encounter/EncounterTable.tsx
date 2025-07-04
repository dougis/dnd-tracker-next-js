'use client';

import { ListLoadingState } from './components/LoadingStates';
import { EmptyState } from './components/EmptyState';
import { TableHeader } from './table/TableHeader';
import { TableRow } from './table/TableRow';
import { createSortHandler } from './table/tableUtils';
import type { EncounterListItem, TableSortConfig, TableSelectionConfig } from './types';


interface EncounterTableProps {
  encounters: EncounterListItem[];
  isLoading: boolean;
  selection: TableSelectionConfig;
  sort: TableSortConfig;
  onRefetch: () => void;
}

export function EncounterTable({
  encounters,
  isLoading,
  selection,
  sort,
  onRefetch,
}: EncounterTableProps) {
  const { selectedEncounters, isAllSelected, onSelectAll, onSelectEncounter } = selection;
  const { sortBy, sortOrder, onSort } = sort;
  const handleSort = createSortHandler(sortBy, sortOrder, onSort);

  if (isLoading) {
    return <ListLoadingState />;
  }

  if (encounters.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader
            isAllSelected={isAllSelected}
            onSelectAll={onSelectAll}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <tbody>
            {encounters.map((encounter) => (
              <TableRow
                key={encounter.id}
                encounter={encounter}
                isSelected={selectedEncounters.includes(encounter.id)}
                onSelect={onSelectEncounter}
                onRefetch={onRefetch}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}