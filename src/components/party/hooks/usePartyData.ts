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
    settings: {
      allowJoining: true,
      requireApproval: false,
      maxMembers: 6,
    },
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
    settings: {
      allowJoining: false,
      requireApproval: true,
      maxMembers: 4,
    },
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    lastActivity: new Date('2023-01-02'),
    memberCount: 3,
    playerCharacterCount: 3,
    averageLevel: 7,
  },
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

      // Apply filters and search (mock implementation)
      let filteredParties = [...mockParties];

      // Apply search filter
      if (searchQuery.trim()) {
        filteredParties = filteredParties.filter(party =>
          party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          party.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply member count filter
      if (filters.memberCount.length > 0) {
        filteredParties = filteredParties.filter(party =>
          filters.memberCount.includes(party.memberCount)
        );
      }

      // Apply tags filter
      if (filters.tags.length > 0) {
        filteredParties = filteredParties.filter(party =>
          filters.tags.some(tag => party.tags.includes(tag))
        );
      }

      // Apply sorting
      filteredParties.sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastActivity') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

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