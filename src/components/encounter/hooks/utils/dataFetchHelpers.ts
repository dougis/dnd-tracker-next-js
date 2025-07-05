// Helper utilities to reduce complexity in useEncounterData hook
import { EncounterService } from '@/lib/services/EncounterService';
import type { EncounterListItem, EncounterFilters, SortBy, SortOrder, PaginationInfo } from '../../types';
import { transformEncounter } from './encounterTransform';
import { buildSearchParams } from './searchParams';
import { extractErrorMessage, handleServiceError } from './errorHandling';
import { createPaginationInfo } from './paginationHelpers';

// Response processing helpers
export const processSuccessfulResponse = (
  data: any,
  limit: number
): { encounters: EncounterListItem[]; pagination: PaginationInfo } => {
  const transformedEncounters = data.encounters.map(transformEncounter);
  const paginationInfo = createPaginationInfo(
    data.currentPage,
    data.totalPages,
    data.totalItems,
    limit
  );

  return {
    encounters: transformedEncounters,
    pagination: paginationInfo,
  };
};

export const processErrorResponse = (error: any): { errorMessage: string } => {
  const errorMessage = extractErrorMessage(error);
  return { errorMessage };
};

// Service interaction helper
export const fetchEncountersData = async (
  filters: EncounterFilters,
  searchQuery: string,
  sortBy: SortBy,
  sortOrder: SortOrder,
  currentPage: number,
  limit: number
) => {
  const searchParams = buildSearchParams(
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    currentPage,
    limit
  );

  const result = await EncounterService.searchEncounters(searchParams);

  if (result.success && result.data) {
    return { success: true, data: result.data };
  } else {
    const errorMessage = handleServiceError(result);
    throw new Error(errorMessage);
  }
};

// State update helper factory
export const createStateUpdaters = (
  setEncounters: (_encounters: EncounterListItem[]) => void,
  setPagination: (_pagination: PaginationInfo | null) => void,
  setError: (_error: string | null) => void
) => {
  const updateSuccessState = (encounters: EncounterListItem[], pagination: PaginationInfo) => {
    setEncounters(encounters);
    setPagination(pagination);
    setError(null);
  };

  const updateErrorState = (errorMessage: string) => {
    setError(errorMessage);
    setEncounters([]);
    setPagination(null);
  };

  const resetState = () => {
    setError(null);
  };

  return {
    updateSuccessState,
    updateErrorState,
    resetState,
  };
};