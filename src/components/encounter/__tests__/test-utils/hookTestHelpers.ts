import { renderHook, act, waitFor } from '@testing-library/react';
import { EncounterService } from '@/lib/services/EncounterService';
import { mockServiceResponses } from '../test-helpers';

// Mock setup helpers for hooks
export const createDefaultParams = () => ({
  searchQuery: '',
  filters: {},
  sortBy: 'updatedAt' as const,
  sortOrder: 'desc' as const,
  page: 1,
  limit: 20,
});

export const setupMockService = () => {
  jest.clearAllMocks();
};

// Expectation helpers for hook states
export const expectInitialLoadingState = (result: any) => {
  expect(result.current.isLoading).toBe(true);
  expect(result.current.encounters).toEqual([]);
  expect(result.current.error).toBe(null);
};

export const expectErrorState = (result: any, errorMessage: string) => {
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBe(errorMessage);
  expect(result.current.encounters).toEqual([]);
};

export const expectServiceCallWith = (mockService: any, expectedParams: any) => {
  expect(mockService.searchEncounters).toHaveBeenCalledWith(expectedParams);
};

// Reusable test functions
export const testSuccessfulDataFetch = async (hook: any, params: any, mockService: any) => {
  const mockData = mockServiceResponses.searchSuccess();
  mockService.searchEncounters.mockResolvedValue(mockData);

  const { result } = renderHook(() => hook(params));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.encounters).toHaveLength(mockData.data.encounters.length);
  expect(result.current.error).toBe(null);
};

export const testErrorHandling = async (hook: any, params: any, mockService: any, errorMessage: string) => {
  if (errorMessage === 'Network failure') {
    mockService.searchEncounters.mockRejectedValue(new Error(errorMessage));
  } else if (errorMessage === 'An unexpected error occurred') {
    mockService.searchEncounters.mockRejectedValue('String error');
  } else {
    mockService.searchEncounters.mockResolvedValue(
      mockServiceResponses.searchError(errorMessage)
    );
  }

  const { result } = renderHook(() => hook(params));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expectErrorState(result, errorMessage);
};export const testLoadingState = async (hook: any, params: any, mockService: any) => {
  let resolveSearch: (value: any) => void;
  const searchPromise = new Promise((resolve) => {
    resolveSearch = resolve;
  });

  mockService.searchEncounters.mockReturnValue(searchPromise);

  const { result } = renderHook(() => hook(params));
  
  expect(result.current.isLoading).toBe(true);

  resolveSearch!(mockServiceResponses.searchSuccess());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
};

export const testPaginationFetch = async (hook: any, params: any, mockService: any) => {
  mockService.searchEncounters.mockResolvedValue(
    mockServiceResponses.searchSuccess()
  );

  renderHook(() => hook(params));

  await waitFor(() => {
    expectServiceCallWith(mockService, expect.objectContaining({
      page: params.page,
    }));
  });
};

export const testParameterChanges = async (hook: any, defaultParams: any, mockService: any) => {
  mockService.searchEncounters.mockResolvedValue(
    mockServiceResponses.searchSuccess()
  );

  const { result, rerender } = renderHook(
    ({ params }) => hook(params),
    { initialProps: { params: defaultParams } }
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  return { result, rerender };
};