import type { EncounterFilters, SortBy, SortOrder } from '../../types';

export interface SearchParams {
  query: string;
  difficulty: string[];
  targetLevelMin?: number;
  targetLevelMax?: number;
  status: string[];
  tags: string[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export const buildSearchParams = (
  filters: EncounterFilters,
  searchQuery: string,
  sortBy: SortBy,
  sortOrder: SortOrder,
  currentPage: number,
  limit: number
): SearchParams => ({
  query: searchQuery,
  difficulty: filters.difficulty,
  targetLevelMin: filters.targetLevelMin,
  targetLevelMax: filters.targetLevelMax,
  status: filters.status,
  tags: filters.tags,
  sortBy,
  sortOrder,
  page: currentPage,
  limit,
});