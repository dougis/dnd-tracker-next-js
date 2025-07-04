import { renderHook, act, waitFor } from '@testing-library/react';
import { useEncounterData } from '../../hooks/useEncounterData';
import { EncounterService } from '@/lib/services/EncounterService';
import { createMockFilters, mockServiceResponses, createMockEncounters } from '../test-helpers';

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService', () => ({
  EncounterService: {
    searchEncounters: jest.fn(),
  },
}));

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;

describe('useEncounterData', () => {
  const defaultParams = {
    filters: createMockFilters(),
    searchQuery: '',
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      expect(result.current.encounters).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.pagination).toBe(null);
    });
  });

  describe('Data Fetching', () => {
    it('fetches encounters on mount', async () => {
      const mockEncounters = createMockEncounters(3);
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess(mockEncounters)
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.encounters).toHaveLength(3);
      expect(result.current.error).toBe(null);
      expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith({
        query: '',
        status: [],
        difficulty: [],
        targetLevelMin: undefined,
        targetLevelMax: undefined,
        tags: [],
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      });
    });

    it('sets loading state correctly during fetch', async () => {
      mockEncounterService.searchEncounters.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockServiceResponses.searchSuccess()), 100))
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('handles successful data fetch with pagination', async () => {
      const mockEncounters = createMockEncounters(10);
      mockEncounterService.searchEncounters.mockResolvedValue({
        success: true,
        data: {
          encounters: mockEncounters,
          currentPage: 2,
          totalPages: 5,
          totalItems: 50,
        },
      });

      const { result } = renderHook(() => useEncounterData({
        ...defaultParams,
        page: 2,
      }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.encounters).toHaveLength(10);
      expect(result.current.pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 20,
      });
    });
  });

  describe('Error Handling', () => {
    it('handles service error correctly', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchError('Network error')
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.encounters).toEqual([]);
      expect(result.current.pagination).toBe(null);
    });

    it('handles network error correctly', async () => {
      mockEncounterService.searchEncounters.mockRejectedValue(
        new Error('Network failure')
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network failure');
      expect(result.current.encounters).toEqual([]);
    });

    it('handles unexpected error format', async () => {
      mockEncounterService.searchEncounters.mockRejectedValue('String error');

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('An unexpected error occurred');
    });
  });

  describe('Search Parameters', () => {
    it('passes search query correctly', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const params = {
        ...defaultParams,
        searchQuery: 'dragon encounter',
      };

      renderHook(() => useEncounterData(params));

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'dragon encounter',
          })
        );
      });
    });

    it('passes filters correctly', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const params = {
        ...defaultParams,
        filters: createMockFilters({
          status: ['active', 'draft'],
          difficulty: ['hard'],
          targetLevelMin: 5,
          targetLevelMax: 10,
          tags: ['combat'],
        }),
      };

      renderHook(() => useEncounterData(params));

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith(
          expect.objectContaining({
            status: ['active', 'draft'],
            difficulty: ['hard'],
            targetLevelMin: 5,
            targetLevelMax: 10,
            tags: ['combat'],
          })
        );
      });
    });

    it('passes sort parameters correctly', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const params = {
        ...defaultParams,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      };

      renderHook(() => useEncounterData(params));

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'name',
            sortOrder: 'asc',
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('handles page changes correctly', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.goToPage(3);
      });

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 3,
          })
        );
      });
    });

    it('uses custom limit parameter', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      renderHook(() => useEncounterData({
        ...defaultParams,
        limit: 50,
      }));

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 50,
          })
        );
      });
    });

    it('resets to page 1 when filters change', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const { result, rerender } = renderHook(
        ({ params }) => useEncounterData(params),
        { initialProps: { params: defaultParams } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Go to page 2
      act(() => {
        result.current.goToPage(2);
      });

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenLastCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });

      // Change filters - should reset to page 1
      rerender({
        params: {
          ...defaultParams,
          filters: createMockFilters({ status: ['active'] }),
        },
      });

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenLastCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('Data Transformation', () => {
    it('transforms encounters with participant counts', async () => {
      const mockRawEncounters = createMockEncounters(1);
      // Simulate raw encounter data from service
      const rawEncounter = {
        ...mockRawEncounters[0],
        _id: 'raw-id',
        participants: [
          { type: 'pc', name: 'Player 1' },
          { type: 'pc', name: 'Player 2' },
          { type: 'npc', name: 'Monster 1' },
        ],
      };

      mockEncounterService.searchEncounters.mockResolvedValue({
        success: true,
        data: {
          encounters: [rawEncounter as any],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
        },
      });

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.encounters).toHaveLength(1);
      expect(result.current.encounters[0]).toEqual(
        expect.objectContaining({
          id: 'raw-id',
          participantCount: 3,
          playerCount: 2,
        })
      );
    });
  });

  describe('Refetch Functionality', () => {
    it('refetches data when refetch is called', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockEncounterService.searchEncounters).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledTimes(2);
      });
    });

    it('clears error state on refetch', async () => {
      // First call fails
      mockEncounterService.searchEncounters.mockResolvedValueOnce(
        mockServiceResponses.searchError('Initial error')
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      // Second call succeeds
      mockEncounterService.searchEncounters.mockResolvedValueOnce(
        mockServiceResponses.searchSuccess()
      );

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('Dependencies and Effects', () => {
    it('refetches when parameters change', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const { rerender } = renderHook(
        ({ params }) => useEncounterData(params),
        { initialProps: { params: defaultParams } }
      );

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledTimes(1);
      });

      // Change search query
      rerender({
        params: {
          ...defaultParams,
          searchQuery: 'new search',
        },
      });

      await waitFor(() => {
        expect(mockEncounterService.searchEncounters).toHaveBeenCalledTimes(2);
      });

      expect(mockEncounterService.searchEncounters).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: 'new search',
        })
      );
    });
  });
});