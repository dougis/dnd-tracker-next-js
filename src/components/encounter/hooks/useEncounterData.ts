'use client';

import { useState, useEffect, useCallback } from 'react';
import { EncounterService } from '@/lib/services/EncounterService';
import type { EncounterListItem, EncounterFilters, SortBy, SortOrder, PaginationInfo } from '../types';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

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
  const [_currentPage, setCurrentPage] = useState(page);

  const transformEncounter = (encounter: IEncounter): EncounterListItem => {
    const participantCount = encounter.participants?.length || 0;
    const playerCount = encounter.participants?.filter(p => p.type === 'pc').length || 0;

    return {
      id: encounter._id?.toString() || '',
      ownerId: encounter.ownerId,
      name: encounter.name,
      description: encounter.description,
      tags: encounter.tags,
      difficulty: encounter.difficulty,
      estimatedDuration: encounter.estimatedDuration,
      targetLevel: encounter.targetLevel,
      participants: encounter.participants,
      settings: encounter.settings,
      combatState: encounter.combatState,
      status: encounter.status,
      partyId: encounter.partyId,
      isPublic: encounter.isPublic,
      sharedWith: encounter.sharedWith,
      version: encounter.version,
      createdAt: encounter.createdAt,
      updatedAt: encounter.updatedAt,
      participantCount,
      playerCount,
    };
  };

  const fetchEncounters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build search parameters to match service interface
      const searchParams = {
        name: searchQuery,
        difficulty: filters.difficulty.length > 0 ? filters.difficulty[0] : undefined,
        targetLevel: filters.targetLevelMin,
        status: filters.status.length > 0 ? filters.status[0] : undefined,
      };

      const result = await EncounterService.searchEncounters(searchParams);

      if (result.success && result.data) {
        const transformedEncounters = result.data.map(transformEncounter);
        setEncounters(transformedEncounters);

        // Simple pagination - just show what we have
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: result.data.length,
          itemsPerPage: limit,
        });
      } else {
        throw new Error(result.error?.message || 'Failed to fetch encounters');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setEncounters([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, limit]);

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