import type { SortBy, SortOrder } from '../types';
import { getStatusVariant as getCardStatusVariant, getDifficultyColor as getCardDifficultyColor } from '../card/badgeUtils';

// Re-export from badgeUtils to avoid duplication
export const getStatusVariant = getCardStatusVariant;
export const getDifficultyColor = getCardDifficultyColor;

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