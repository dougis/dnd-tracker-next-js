'use client';

import { useState, useEffect, useCallback } from 'react';
import { EncounterService } from '@/lib/services/EncounterService';
import type { EncounterListItem, EncounterFilters, SortBy, SortOrder, PaginationInfo } from '../types';
import { transformEncounter } from './utils/encounterTransform';
import { buildSearchParams } from './utils/searchParams';
import { extractErrorMessage, handleServiceError } from './utils/errorHandling';
import { createPaginationInfo } from './utils/paginationHelpers';

interface UseEncounterDataParams {
  filters: EncounterFilters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page?: number;
  limit?: number;
}

interface UseEncounterDataReturn {
  encounters: EncounterListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  goToPage: (_page: number) => void;
  refetch: () => void;
}

export function useEncounterData({
  filters,
  searchQuery,
  sortBy,
  sortOrder,
  page = 1,
  limit = 20,
}: UseEncounterDataParams): UseEncounterDataReturn {
  const [encounters, setEncounters] = useState<EncounterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(page);

  const handleSuccessfulResponse = useCallback((data: any) => {
    const transformedEncounters = data.encounters.map(transformEncounter);
    setEncounters(transformedEncounters);

    const paginationInfo = createPaginationInfo(
      data.currentPage,
      data.totalPages,
      data.totalItems,
      limit
    );
    setPagination(paginationInfo);
  }, [limit]);

  const handleErrorResponse = useCallback((error: any) => {
    const errorMessage = extractErrorMessage(error);
    setError(errorMessage);
    setEncounters([]);
    setPagination(null);
  }, []);

  const fetchEncounters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
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
        handleSuccessfulResponse(result.data);
      } else {
        const errorMessage = handleServiceError(result);
        throw new Error(errorMessage);
      }
    } catch (err) {
      handleErrorResponse(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, sortBy, sortOrder, currentPage, limit, handleSuccessfulResponse, handleErrorResponse]);

  const goToPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const refetch = useCallback(() => {
    fetchEncounters();
  }, [fetchEncounters]);

  useEffect(() => {
    fetchEncounters();
  }, [fetchEncounters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy, sortOrder]);

  return {
    encounters,
    isLoading,
    error,
    pagination,
    goToPage,
    refetch,
  };
}