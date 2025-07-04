'use client';

import { LoadingCard } from '@/components/shared/LoadingCard';
import { TableHeader } from './table/TableHeader';
import { TableRow } from './table/TableRow';
import { createSortHandler } from './table/tableUtils';
import type { EncounterListItem, SortBy, SortOrder } from './types';

interface EncounterTableProps {
  encounters: EncounterListItem[];
  isLoading: boolean;
  selectedEncounters: string[];
  isAllSelected: boolean;
  onSelectAll: () => void;
  onSelectEncounter: (_id: string) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (_sortBy: SortBy, _sortOrder: SortOrder) => void;
  onRefetch: () => void;
}

export function EncounterTable({
  encounters,
  isLoading,
  selectedEncounters,
  isAllSelected,
  onSelectAll,
  onSelectEncounter,
  sortBy,
  sortOrder,
  onSort,
  onRefetch,
}: EncounterTableProps) {
  const handleSort = createSortHandler(sortBy, sortOrder, onSort);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingCard key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-medium mb-2">No encounters found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first encounter to get started organizing your combat sessions.
          </p>
        </div>
      </div>
    );
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