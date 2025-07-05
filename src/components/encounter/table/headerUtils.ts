// Utilities to reduce repetition in table headers
import type { SortBy, SortOrder } from '../types';

// Header configuration type
export interface HeaderConfig {
  column: SortBy | string;
  label: string;
  sortable?: boolean;
  className?: string;
}

// Standard table headers configuration
export const TABLE_HEADERS: HeaderConfig[] = [
  { column: 'name', label: 'Name', sortable: true },
  { column: 'status', label: 'Status', sortable: false },
  { column: 'difficulty', label: 'Difficulty', sortable: true },
  { column: 'participantCount', label: 'Participants', sortable: true },
  { column: 'targetLevel', label: 'Level', sortable: true },
  { column: 'updatedAt', label: 'Updated', sortable: true },
];

// Helper to get sort icon component name
export const getSortIconType = (column: SortBy, sortBy: SortBy, sortOrder: SortOrder): string => {
  if (sortBy !== column) return 'ArrowUpDown';
  return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
};

// Helper to determine if a column is currently sorted
export const isColumnSorted = (column: SortBy, sortBy: SortBy): boolean => {
  return sortBy === column;
};

// Standard cell classes
export const CELL_CLASSES = {
  default: 'p-4 text-left',
  checkbox: 'p-4 text-left w-12',
  actions: 'p-4 text-left w-12',
} as const;