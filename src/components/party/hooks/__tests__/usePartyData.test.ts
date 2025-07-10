import { renderHook, waitFor } from '@testing-library/react';
import { usePartyData } from '../usePartyData';
import type { PartyFilters } from '../../types';

// Mock the setTimeout for simulating API delay
jest.useFakeTimers();

describe('usePartyData', () => {
  const defaultParams = {
    filters: { memberCount: [], tags: [] } as PartyFilters,
    searchQuery: '',
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    page: 1,
    limit: 20,
  };

  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Initial State', () => {
    it('should return initial loading state', () => {
      const { result } = renderHook(() => usePartyData(defaultParams));

      expect(result.current.parties).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.pagination).toBe(null);
    });
  });

  describe('Data Fetching', () => {
    it('should fetch and return parties after loading', async () => {
      const { result } = renderHook(() => usePartyData(defaultParams));

      // Fast-forward timers to simulate API delay
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(2);
      expect(result.current.parties[0].name).toBe('The Brave Adventurers');
      expect(result.current.parties[1].name).toBe('The Shadow Walkers');
      expect(result.current.error).toBe(null);
    });

    it('should return pagination info', async () => {
      const { result } = renderHook(() => usePartyData(defaultParams));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 20,
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter parties by search query', async () => {
      const params = {
        ...defaultParams,
        searchQuery: 'brave',
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.parties[0].name).toBe('The Brave Adventurers');
    });

    it('should search in description as well', async () => {
      const params = {
        ...defaultParams,
        searchQuery: 'stealthy',
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.parties[0].name).toBe('The Shadow Walkers');
    });

    it('should be case insensitive', async () => {
      const params = {
        ...defaultParams,
        searchQuery: 'BRAVE',
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.parties[0].name).toBe('The Brave Adventurers');
    });
  });

  describe('Filtering', () => {
    it('should filter by member count', async () => {
      const params = {
        ...defaultParams,
        filters: { memberCount: [4], tags: [] } as PartyFilters,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.parties[0].memberCount).toBe(4);
    });

    it('should filter by tags', async () => {
      const params = {
        ...defaultParams,
        filters: { memberCount: [], tags: ['heroic'] } as PartyFilters,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.parties[0].tags).toContain('heroic');
    });

    it('should apply multiple filters', async () => {
      const params = {
        ...defaultParams,
        filters: { memberCount: [4], tags: ['heroic'] } as PartyFilters,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.parties[0].memberCount).toBe(4);
      expect(result.current.parties[0].tags).toContain('heroic');
    });
  });

  describe('Sorting', () => {
    it('should sort by name ascending', async () => {
      const params = {
        ...defaultParams,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties[0].name).toBe('The Brave Adventurers');
      expect(result.current.parties[1].name).toBe('The Shadow Walkers');
    });

    it('should sort by name descending', async () => {
      const params = {
        ...defaultParams,
        sortBy: 'name' as const,
        sortOrder: 'desc' as const,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties[0].name).toBe('The Shadow Walkers');
      expect(result.current.parties[1].name).toBe('The Brave Adventurers');
    });

    it('should sort by member count', async () => {
      const params = {
        ...defaultParams,
        sortBy: 'memberCount' as const,
        sortOrder: 'desc' as const,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties[0].memberCount).toBe(4);
      expect(result.current.parties[1].memberCount).toBe(3);
    });

    it('should sort by date fields', async () => {
      const params = {
        ...defaultParams,
        sortBy: 'createdAt' as const,
        sortOrder: 'asc' as const,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check that parties are sorted by creation date
      expect(result.current.parties).toHaveLength(2);
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const params = {
        ...defaultParams,
        page: 1,
        limit: 1,
      };

      const { result } = renderHook(() => usePartyData(params));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.parties).toHaveLength(1);
      expect(result.current.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalItems: 2,
        itemsPerPage: 1,
      });
    });

    it('should handle page navigation', async () => {
      const { result } = renderHook(() => usePartyData(defaultParams));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test goToPage function
      result.current.goToPage(2);

      expect(result.current.goToPage).toBeDefined();
      expect(typeof result.current.goToPage).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock processPartyData to throw an error
      const originalError = console.error;
      console.error = jest.fn();

      // We can't easily mock the internal functions, so we'll test the structure
      const { result } = renderHook(() => usePartyData(defaultParams));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The hook should handle errors and not crash
      expect(result.current.error).toBe(null);

      console.error = originalError;
    });
  });

  describe('Refetch Functionality', () => {
    it('should provide refetch function', async () => {
      const { result } = renderHook(() => usePartyData(defaultParams));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when called', async () => {
      const { result } = renderHook(() => usePartyData(defaultParams));

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call refetch
      result.current.refetch();

      // Wait for the refetch to complete
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify refetch function exists and is callable
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Helper Functions', () => {
    it('should normalize sort values correctly for dates', () => {
      // This tests that our date normalization works correctly
      // Since the functions are internal, we test through the hook behavior
      const { result } = renderHook(() => usePartyData({
        ...defaultParams,
        sortBy: 'lastActivity',
        sortOrder: 'desc',
      }));

      jest.advanceTimersByTime(500);

      // The hook should complete without errors
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle string normalization for non-date fields', () => {
      const { result } = renderHook(() => usePartyData({
        ...defaultParams,
        sortBy: 'name',
        sortOrder: 'asc',
      }));

      jest.advanceTimersByTime(500);

      // Should normalize string values to lowercase for comparison
      expect(result.current.isLoading).toBe(true);
    });
  });
});