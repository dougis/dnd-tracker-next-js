import type { SortBy, SortOrder } from '../types';

export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'archived':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'trivial':
      return 'text-gray-500';
    case 'easy':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'hard':
      return 'text-orange-600';
    case 'deadly':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

export const createSortHandler = (
  sortBy: SortBy,
  sortOrder: SortOrder,
  onSort: (_sortBy: SortBy, _sortOrder: SortOrder) => void
) => {
  return (column: SortBy) => {
    const newSortOrder = column === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newSortOrder);
  };
};

export const shouldPreventRowClick = (target: EventTarget | null): boolean => {
  return !!(
    target instanceof HTMLElement &&
    (target.closest('[data-checkbox]') || target.closest('[data-actions]'))
  );
};