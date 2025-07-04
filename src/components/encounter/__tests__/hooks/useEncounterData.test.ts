import { renderHook, act, waitFor } from '@testing-library/react';
import { useEncounterData } from '../../hooks/useEncounterData';
import { EncounterService } from '@/lib/services/EncounterService';
import { createMockFilters, mockServiceResponses, createMockEncounters } from '../test-helpers';
import {
  createDefaultParams,
  setupMockService,
  expectInitialLoadingState,
  expectErrorState,
  expectServiceCallWith,
  testSuccessfulDataFetch,
  testErrorHandling,
  testLoadingState,
  testPaginationFetch,
  testParameterChanges,
} from '../test-utils/hookTestHelpers';
// Import available for future use - currently used in other test files
// import {
//   expectLoadingState,
//   expectErrorState as expectError,
//   expectDataState
// } from '../test-utils/commonTestHelpers';

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService', () => ({
  EncounterService: {
    searchEncounters: jest.fn(),
  },
}));

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;

describe('useEncounterData', () => {
  const defaultParams = createDefaultParams();

  beforeEach(() => {
    setupMockService();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      const { result } = renderHook(() => useEncounterData(defaultParams));
      expectInitialLoadingState(result);
    });
  });

  describe('Data Fetching', () => {
    it('fetches encounters on mount', async () => {
      await testSuccessfulDataFetch(useEncounterData, defaultParams, mockEncounterService);
    });

    it('sets loading state correctly during fetch', async () => {
      await testLoadingState(useEncounterData, defaultParams, mockEncounterService);
    });

    it('handles successful data fetch with pagination', async () => {
      const paginatedParams = { ...defaultParams, page: 2 };
      await testPaginationFetch(useEncounterData, paginatedParams, mockEncounterService);
    });
  });

  describe('Error Handling', () => {
    it('handles service error correctly', async () => {
      await testErrorHandling(useEncounterData, defaultParams, mockEncounterService, 'Network error');
    });

    it('handles network error correctly', async () => {
      await testErrorHandling(useEncounterData, defaultParams, mockEncounterService, 'Network failure');
    });

    it('handles unexpected error format', async () => {
      await testErrorHandling(useEncounterData, defaultParams, mockEncounterService, 'An unexpected error occurred');
    });
  });

  describe('Search Parameters', () => {
    const testParameterPassing = async (params: any, expectedCall: any) => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      renderHook(() => useEncounterData(params));

      await waitFor(() => {
        expectServiceCallWith(mockEncounterService, expect.objectContaining(expectedCall));
      });
    };

    it('passes search query correctly', async () => {
      const params = { ...defaultParams, searchQuery: 'dragon encounter' };
      await testParameterPassing(params, { query: 'dragon encounter' });
    });

    it('passes filters correctly', async () => {
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
      await testParameterPassing(params, {
        status: ['active', 'draft'],
        difficulty: ['hard'],
        targetLevelMin: 5,
        targetLevelMax: 10,
        tags: ['combat'],
      });
    });

    it('passes sort parameters correctly', async () => {
      const params = {
        ...defaultParams,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      };
      await testParameterPassing(params, { sortBy: 'name', sortOrder: 'asc' });
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
        expectServiceCallWith(mockEncounterService, expect.objectContaining({
          page: 3,
        }));
      });
    });

    it('uses custom limit parameter', async () => {
      mockEncounterService.searchEncounters.mockResolvedValue(
        mockServiceResponses.searchSuccess()
      );

      renderHook(() => useEncounterData({ ...defaultParams, limit: 50 }));

      await waitFor(() => {
        expectServiceCallWith(mockEncounterService, expect.objectContaining({
          limit: 50,
        }));
      });
    });

    it('resets to page 1 when filters change', async () => {
      const { result, rerender } = await testParameterChanges(useEncounterData, defaultParams, mockEncounterService);

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
        expectErrorState(result, 'Initial error');
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
      const { rerender } = await testParameterChanges(useEncounterData, defaultParams, mockEncounterService);

      expect(mockEncounterService.searchEncounters).toHaveBeenCalledTimes(1);

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

      expectServiceCallWith(mockEncounterService, expect.objectContaining({
        query: 'new search',
      }));
    });
  });
});