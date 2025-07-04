import { renderHook, waitFor } from '@testing-library/react';
import { EncounterService } from '@/lib/services/EncounterService';
import { createMockFilters, mockServiceResponses, createMockEncounters } from '../test-helpers';

// Common test setup utilities
export const createDefaultParams = () => ({
  filters: createMockFilters(),
  searchQuery: '',
  sortBy: 'updatedAt' as const,
  sortOrder: 'desc' as const,
});

export const setupMockService = () => {
  jest.clearAllMocks();
  return EncounterService as jest.Mocked<typeof EncounterService>;
};

// Common assertion patterns
export const expectInitialLoadingState = (result: any) => {
  expect(result.current.encounters).toEqual([]);
  expect(result.current.isLoading).toBe(true);
  expect(result.current.error).toBe(null);
  expect(result.current.pagination).toBe(null);
};

export const expectLoadedState = (result: any, encounterCount: number) => {
  expect(result.current.encounters).toHaveLength(encounterCount);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBe(null);
};

export const expectErrorState = (result: any, errorMessage?: string) => {
  expect(result.current.encounters).toEqual([]);
  expect(result.current.isLoading).toBe(false);
  if (errorMessage) {
    expect(result.current.error).toBe(errorMessage);
  } else {
    expect(result.current.error).not.toBe(null);
  }
  expect(result.current.pagination).toBe(null);
};

export const expectPaginationState = (result: any, currentPage: number, totalPages: number, totalItems: number) => {
  expect(result.current.pagination).toEqual({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: 20,
  });
};

// Service call expectations
export const expectServiceCallWith = (mockService: any, expectedParams: any) => {
  expect(mockService.searchEncounters).toHaveBeenCalledWith(expectedParams);
};

export const expectDefaultServiceCall = (mockService: any) => {
  expectServiceCallWith(mockService, {
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
};

// Common test patterns
export const testSuccessfulDataFetch = async (hook: any, params: any, mockService: any, expectedCount: number = 3) => {
  const mockEncounters = createMockEncounters(expectedCount);
  mockService.searchEncounters.mockResolvedValue(
    mockServiceResponses.searchSuccess(mockEncounters)
  );

  const { result } = renderHook(() => hook(params));

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expectLoadedState(result, expectedCount);
  expectDefaultServiceCall(mockService);

  return { result, mockEncounters };
};

export const testErrorHandling = async (hook: any, params: any, mockService: any, errorMessage: string = 'Test error') => {
  mockService.searchEncounters.mockResolvedValue(
    mockServiceResponses.searchError(errorMessage)
  );

  const { result } = renderHook(() => hook(params));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expectErrorState(result, errorMessage);

  return { result };
};

export const testLoadingState = async (hook: any, params: any, mockService: any) => {
  mockService.searchEncounters.mockImplementation(
    () => new Promise(resolve => setTimeout(() => resolve(mockServiceResponses.searchSuccess()), 100))
  );

  const { result } = renderHook(() => hook(params));

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  return { result };
};

export const testPaginationFetch = async (hook: any, params: any, mockService: any) => {
  const mockEncounters = createMockEncounters(10);
  mockService.searchEncounters.mockResolvedValue({
    success: true,
    data: {
      encounters: mockEncounters,
      currentPage: 2,
      totalPages: 5,
      totalItems: 50,
    },
  });

  const { result } = renderHook(() => hook(params));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expectLoadedState(result, 10);
  expectPaginationState(result, 2, 5, 50);

  return { result, mockEncounters };
};

// Parameter testing utilities
export const testParameterChanges = async (hook: any, initialParams: any, mockService: any) => {
  mockService.searchEncounters.mockResolvedValue(mockServiceResponses.searchSuccess());

  const { result, rerender } = renderHook(
    ({ params }) => hook(params),
    { initialProps: { params: initialParams } }
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  return { result, rerender };
};