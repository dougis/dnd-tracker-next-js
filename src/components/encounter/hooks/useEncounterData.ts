'use client';

import { useState, useEffect, useCallback } from 'react';
import { EncounterService } from '@/lib/services/EncounterService';
import type { EncounterListItem, EncounterFilters, SortBy, SortOrder, PaginationInfo } from '../types';
<<<<<<< HEAD
import type { IEncounter } from '@/lib/models/encounter/interfaces';
=======
import type { IEncounter } from '@/lib/models/encounter/IEncounter';
>>>>>>> origin/feature/issue-29-encounter-list-interface

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

<<<<<<< HEAD
  const transformEncounter = useCallback((encounter: IEncounter): EncounterListItem => {
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
  }, []);
=======
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
>>>>>>> origin/feature/issue-29-encounter-list-interface

  const fetchEncounters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
<<<<<<< HEAD
      const result = await EncounterService.searchEncounters({
        query: searchQuery,
        difficulty: filters.difficulty,
        targetLevelMin: filters.targetLevelMin,
        targetLevelMax: filters.targetLevelMax,
        status: filters.status,
=======
      // Build search parameters
      const searchParams = {
        query: searchQuery,
        status: filters.status,
        difficulty: filters.difficulty,
        targetLevelMin: filters.targetLevelMin,
        targetLevelMax: filters.targetLevelMax,
>>>>>>> origin/feature/issue-29-encounter-list-interface
        tags: filters.tags,
        sortBy,
        sortOrder,
        page: currentPage,
        limit,
<<<<<<< HEAD
      });
=======
      };

      const result = await EncounterService.searchEncounters(searchParams);
>>>>>>> origin/feature/issue-29-encounter-list-interface

      if (result.success && result.data) {
        const transformedEncounters = result.data.encounters.map(transformEncounter);
        setEncounters(transformedEncounters);
<<<<<<< HEAD
=======

>>>>>>> origin/feature/issue-29-encounter-list-interface
        setPagination({
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalItems: result.data.totalItems,
          itemsPerPage: limit,
        });
      } else {
<<<<<<< HEAD
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to fetch encounters');
=======
        throw new Error(result.error || 'Failed to fetch encounters');
>>>>>>> origin/feature/issue-29-encounter-list-interface
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setEncounters([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
<<<<<<< HEAD
  }, [filters, searchQuery, sortBy, sortOrder, currentPage, limit, transformEncounter]);
=======
  }, [filters, searchQuery, sortBy, sortOrder, currentPage, limit]);
>>>>>>> origin/feature/issue-29-encounter-list-interface

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