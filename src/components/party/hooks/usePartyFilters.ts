'use client';

import { useState, useCallback } from 'react';
import type { PartyFilters, PartySortBy, SortOrder } from '../types';

interface UsePartyFiltersReturn {
  filters: PartyFilters;
  searchQuery: string;
  sortBy: PartySortBy;
  sortOrder: SortOrder;
  updateFilters: (_newFilters: Partial<PartyFilters>) => void;
  updateSearchQuery: (_query: string) => void;
  updateSort: (_sortBy: PartySortBy, _sortOrder: SortOrder) => void;
  clearFilters: () => void;
}

const defaultFilters: PartyFilters = {
  memberCount: [],
  tags: [],
};

export function usePartyFilters(): UsePartyFiltersReturn {
  const [filters, setFilters] = useState<PartyFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<PartySortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const updateFilters = useCallback((_newFilters: Partial<PartyFilters>) => {
    setFilters(prev => ({
      ...prev,
      ..._newFilters,
    }));
  }, []);

  const updateSearchQuery = useCallback((_query: string) => {
    setSearchQuery(_query);
  }, []);

  const updateSort = useCallback((_newSortBy: PartySortBy, _newSortOrder: SortOrder) => {
    setSortBy(_newSortBy);
    setSortOrder(_newSortOrder);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
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