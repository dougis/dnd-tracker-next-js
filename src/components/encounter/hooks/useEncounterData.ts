'use client';

import { useState, useEffect, useCallback } from 'react';
import { EncounterService } from '@/lib/services/EncounterService';
import type { EncounterListItem, EncounterFilters, SortBy, SortOrder, PaginationInfo } from '../types';
import type { IEncounter } from '@/lib/models/encounter/IEncounter';

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

  const transformEncounter = (encounter: IEncounter): EncounterListItem => {
    const participantCount = encounter.participants?.length || 0;
    const playerCount = encounter.participants?.filter(p => p.type === 'character').length || 0;

    return {
      ...encounter,
      id: encounter._id?.toString() || '',
      participantCount,
      playerCount,
    };
  };

  const fetchEncounters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build search parameters
      const searchParams = {
        query: searchQuery,
        status: filters.status,
        difficulty: filters.difficulty,
        targetLevelMin: filters.targetLevelMin,
        targetLevelMax: filters.targetLevelMax,
        tags: filters.tags,
        sortBy,
        sortOrder,
        page: currentPage,
        limit,
      };

      const result = await EncounterService.searchEncounters(searchParams);

      if (result.success && result.data) {
        const transformedEncounters = result.data.encounters.map(transformEncounter);
        setEncounters(transformedEncounters);

        setPagination({
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalItems: result.data.totalItems,
          itemsPerPage: limit,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch encounters');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setEncounters([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, sortBy, sortOrder, currentPage, limit]);

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