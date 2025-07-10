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

// Utility function to apply filters to parties
function applyFilters(parties: PartyListItem[], searchQuery: string, filters: PartyFilters): PartyListItem[] {
  let filtered = [...parties];

  // Apply search filter
  if (searchQuery.trim()) {
    filtered = filtered.filter(party =>
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply member count filter
  if (filters.memberCount.length > 0) {
    filtered = filtered.filter(party =>
      filters.memberCount.includes(party.memberCount)
    );
  }

  // Apply tags filter
  if (filters.tags.length > 0) {
    filtered = filtered.filter(party =>
      filters.tags.some(tag => party.tags.includes(tag))
    );
  }

  return filtered;
}

// Utility function to normalize sort values
function normalizeSortValue(value: any, sortBy: PartySortBy): any {
  if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastActivity') {
    return new Date(value).getTime();
  }

  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  return value;
}

// Utility function to sort parties - simplified to avoid parser issues
function sortParties(parties: PartyListItem[], sortBy: PartySortBy, sortOrder: SortOrder): void {
  const ascending = sortOrder === 'asc';
  parties.sort((a, b) => {
    const aVal = normalizeSortValue(a[sortBy], sortBy);
    const bVal = normalizeSortValue(b[sortBy], sortBy);
    return ascending ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) : (aVal > bVal ? -1 : aVal < bVal ? 1 : 0);
  });
}

// Factory function to create mock party data
function createMockParty(
  id: string,
  name: string,
  description: string,
  tags: string[],
  settings: { allowJoining: boolean; requireApproval: boolean; maxMembers: number },
  date: string,
  memberCount: number,
  averageLevel: number
): PartyListItem {
  return {
    id,
    ownerId: 'user-123' as any,
    name,
    description,
    members: [],
    tags,
    isPublic: false,
    sharedWith: [],
    settings,
    createdAt: new Date(date),
    updatedAt: new Date(date),
    lastActivity: new Date(date),
    memberCount,
    playerCharacterCount: memberCount,
    averageLevel,
  };
}

// Mock data for development - this will be replaced with real API calls
const mockParties: PartyListItem[] = [
  createMockParty(
    'party-1',
    'The Brave Adventurers',
    'A party of brave heroes ready to face any challenge',
    ['heroic', 'balanced'],
    { allowJoining: true, requireApproval: false, maxMembers: 6 },
    '2023-01-01',
    4,
    5
  ),
  createMockParty(
    'party-2',
    'The Shadow Walkers',
    'Stealthy rogues and assassins operating in the shadows',
    ['stealth', 'urban'],
    { allowJoining: false, requireApproval: true, maxMembers: 4 },
    '2023-01-02',
    3,
    7
  ),
];

export function usePartyData({
  filters,
  searchQuery,
  sortBy,
  sortOrder,
  page: _page = 1,
  limit = 20,
}: UsePartyDataParams): UsePartyDataReturn {
  const [parties, setParties] = useState<PartyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(_page);

  const fetchParties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Apply filters and sorting (mock implementation)
      const filteredParties = applyFilters(mockParties, searchQuery, filters);
      sortParties(filteredParties, sortBy, sortOrder);

      // Apply pagination
      const totalItems = filteredParties.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedParties = filteredParties.slice(startIndex, endIndex);

      setParties(paginatedParties);
      setPagination({
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching parties');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, sortBy, sortOrder, currentPage, limit]);

  const goToPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const refetch = useCallback(() => {
    fetchParties();
  }, [fetchParties]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  return {
    parties,
    isLoading,
    error,
    pagination,
    goToPage,
    refetch,
  };
}