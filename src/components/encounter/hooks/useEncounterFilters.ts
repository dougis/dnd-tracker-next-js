'use client';

import { useState, useCallback } from 'react';
import type { EncounterFilters, SortBy, SortOrder } from '../types';

interface UseEncounterFiltersReturn {
  filters: EncounterFilters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  updateFilters: (newFilters: Partial<EncounterFilters>) => void;
  updateSearchQuery: (query: string) => void;
  updateSort: (sortBy: SortBy, sortOrder: SortOrder) => void;
  clearFilters: () => void;
}

const initialFilters: EncounterFilters = {
  status: [],
  difficulty: [],
  targetLevelMin: undefined,
  targetLevelMax: undefined,
  tags: [],
};

export function useEncounterFilters(): UseEncounterFiltersReturn {
  const [filters, setFilters] = useState<EncounterFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const updateFilters = useCallback((newFilters: Partial<EncounterFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const updateSort = useCallback((newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery('');
    setSortBy('updatedAt');
    setSortOrder('desc');
  }, []);

  return {
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    updateFilters,
    updateSearchQuery,
    updateSort,
    clearFilters,
  };
}