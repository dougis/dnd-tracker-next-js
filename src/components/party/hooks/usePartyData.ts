'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PartyListItem, PartyFilters, PartySortBy, SortOrder, PaginationInfo } from '../types';

interface UsePartyDataParams {
  filters: PartyFilters;
  searchQuery: string;
  sortBy: PartySortBy;
  sortOrder: SortOrder;
  page?: number;
  limit?: number;
}

interface UsePartyDataReturn {
  parties: PartyListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  goToPage: (_page: number) => void;
  refetch: () => void;
}

// Utility function to check if text matches search query
function matchesSearchQuery(text: string, searchQuery: string): boolean {
  return text.toLowerCase().includes(searchQuery.toLowerCase());
}

// Utility function to apply search filter
function applySearchFilter(parties: PartyListItem[], searchQuery: string): PartyListItem[] {
  if (!searchQuery.trim()) return parties;
  
  return parties.filter(party =>
    matchesSearchQuery(party.name, searchQuery) ||
    matchesSearchQuery(party.description, searchQuery)
  );
}

// Utility function to apply member count filter
function applyMemberCountFilter(parties: PartyListItem[], memberCountFilter: number[]): PartyListItem[] {
  if (memberCountFilter.length === 0) return parties;
  return parties.filter(party => memberCountFilter.includes(party.memberCount));
}

// Utility function to apply tags filter
function applyTagsFilter(parties: PartyListItem[], tagsFilter: string[]): PartyListItem[] {
  if (tagsFilter.length === 0) return parties;
  return parties.filter(party => tagsFilter.some(tag => party.tags.includes(tag)));
}

// Utility function to apply filters to parties
function applyFilters(parties: PartyListItem[], searchQuery: string, filters: PartyFilters): PartyListItem[] {
  let filtered = [...parties];
  filtered = applySearchFilter(filtered, searchQuery);
  filtered = applyMemberCountFilter(filtered, filters.memberCount);
  filtered = applyTagsFilter(filtered, filters.tags);
  return filtered;
}

// Date field types for sort normalization
const DATE_FIELDS = ['createdAt', 'updatedAt', 'lastActivity'] as const;

// Utility function to normalize sort values
function normalizeSortValue(value: any, sortBy: PartySortBy): any {
  if (DATE_FIELDS.includes(sortBy as any)) {
    return new Date(value).getTime();
  }
  return typeof value === 'string' ? value.toLowerCase() : value;
}

// Utility function to sort parties
function sortParties(parties: PartyListItem[], sortBy: PartySortBy, sortOrder: SortOrder): void {
  const multiplier = sortOrder === 'asc' ? 1 : -1;
  parties.sort((a, b) => {
    const aVal = normalizeSortValue(a[sortBy], sortBy);
    const bVal = normalizeSortValue(b[sortBy], sortBy);
    return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * multiplier;
  });
}

// Utility function to simulate API delay
async function simulateApiDelay(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Utility function to create pagination info
function createPaginationInfo(currentPage: number, totalItems: number, limit: number): PaginationInfo {
  return {
    currentPage,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };
}

// Utility function to paginate items
function paginateItems<T>(items: T[], currentPage: number, limit: number): T[] {
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
}

// Utility function to process party data with filtering, sorting, and pagination
async function processPartyData({
  parties,
  searchQuery,
  filters,
  sortBy,
  sortOrder,
  currentPage,
  limit,
}: {
  parties: PartyListItem[];
  searchQuery: string;
  filters: PartyFilters;
  sortBy: PartySortBy;
  sortOrder: SortOrder;
  currentPage: number;
  limit: number;
}): Promise<{ items: PartyListItem[]; pagination: PaginationInfo }> {
  const filteredParties = applyFilters(parties, searchQuery, filters);
  sortParties(filteredParties, sortBy, sortOrder);
  
  const totalItems = filteredParties.length;
  const paginatedParties = paginateItems(filteredParties, currentPage, limit);

  return {
    items: paginatedParties,
    pagination: createPaginationInfo(currentPage, totalItems, limit),
  };
}

// Mock data for development - this will be replaced with real API calls
const mockParties: PartyListItem[] = [
  {
    id: 'party-1',
    ownerId: 'user-123' as any,
    name: 'The Brave Adventurers',
    description: 'A party of brave heroes ready to face any challenge',
    members: [],
    tags: ['heroic', 'balanced'],
    isPublic: false,
    sharedWith: [],
    settings: { allowJoining: true, requireApproval: false, maxMembers: 6 },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    lastActivity: new Date('2023-01-01'),
    memberCount: 4,
    playerCharacterCount: 4,
    averageLevel: 5,
  },
  {
    id: 'party-2',
    ownerId: 'user-123' as any,
    name: 'The Shadow Walkers',
    description: 'Stealthy rogues and assassins operating in the shadows',
    members: [],
    tags: ['stealth', 'urban'],
    isPublic: false,
    sharedWith: [],
    settings: { allowJoining: false, requireApproval: true, maxMembers: 4 },
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    lastActivity: new Date('2023-01-02'),
    memberCount: 3,
    playerCharacterCount: 3,
    averageLevel: 7,
  },
];

// Hook for managing party data state
function usePartyState(initialPage: number = 1) {
  const [parties, setParties] = useState<PartyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  return {
    parties, setParties,
    isLoading, setIsLoading,
    error, setError,
    pagination, setPagination,
    currentPage, setCurrentPage,
  };
}

// Hook for party data operations
function usePartyOperations(state: ReturnType<typeof usePartyState>, params: UsePartyDataParams) {
  const { filters, searchQuery, sortBy, sortOrder, limit = 20 } = params;
  const { setParties, setIsLoading, setError, setPagination, currentPage, setCurrentPage } = state;

  const fetchParties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await simulateApiDelay();
      const paginatedResult = await processPartyData({
        parties: mockParties,
        searchQuery,
        filters,
        sortBy,
        sortOrder,
        currentPage,
        limit,
      });

      setParties(paginatedResult.items);
      setPagination(paginatedResult.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching parties');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, sortBy, sortOrder, currentPage, limit, setParties, setIsLoading, setError, setPagination]);

  const goToPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, [setCurrentPage]);

  const refetch = useCallback(() => {
    fetchParties();
  }, [fetchParties]);

  return { fetchParties, goToPage, refetch };
}

export function usePartyData({
  filters,
  searchQuery,
  sortBy,
  sortOrder,
  page: _page = 1,
  limit = 20,
}: UsePartyDataParams): UsePartyDataReturn {
  const state = usePartyState(_page);
  const { fetchParties, goToPage, refetch } = usePartyOperations(state, {
    filters, searchQuery, sortBy, sortOrder, page: _page, limit
  });

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  return {
    parties: state.parties,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,
    goToPage,
    refetch,
  };
}