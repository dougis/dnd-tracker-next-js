import type { PaginationInfo } from '../../types';

export const createPaginationInfo = (
  currentPage: number,
  totalPages: number,
  totalItems: number,
  limit: number
): PaginationInfo => ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage: limit,
});