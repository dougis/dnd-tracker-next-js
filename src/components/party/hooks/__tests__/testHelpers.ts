import type { PartyFilters } from '../../types';

// Common test setup helpers

// Default test parameters
export const defaultParams = {
  filters: { memberCount: [], tags: [] } as PartyFilters,
  searchQuery: '',
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
  page: 1,
  limit: 20,
};

// Timer control helpers
export function setupTimers() {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.useFakeTimers();
  });
}

// Import waitFor
import { waitFor } from '@testing-library/react';

// Mock timer advance and wait for loading
export async function advanceTimersAndWaitForLoading(result: any, time: number = 500) {
  jest.advanceTimersByTime(time);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
}

// Re-export waitFor for convenience
export { waitFor };

// Common test parameter builders
export function createParamsWithSearchQuery(searchQuery: string) {
  return {
    ...defaultParams,
    searchQuery,
  };
}

export function createParamsWithFilters(filters: PartyFilters) {
  return {
    ...defaultParams,
    filters,
  };
}

export function createParamsWithSort(sortBy: string, sortOrder: 'asc' | 'desc') {
  return {
    ...defaultParams,
    sortBy: sortBy as any,
    sortOrder,
  };
}

export function createParamsWithPagination(page: number, limit: number) {
  return {
    ...defaultParams,
    page,
    limit,
  };
}

// Assertion helpers
export function expectBasicHookFunctions(result: any) {
  expect(result.current.goToPage).toBeDefined();
  expect(typeof result.current.goToPage).toBe('function');
  expect(result.current.refetch).toBeDefined();
  expect(typeof result.current.refetch).toBe('function');
}

export function expectPaginationInfo(result: any, expected: any) {
  expect(result.current.pagination).toEqual(expected);
}

export function expectPartyResults(result: any, expectedLength: number, expectedNames?: string[]) {
  expect(result.current.parties).toHaveLength(expectedLength);
  if (expectedNames) {
    expectedNames.forEach((name, index) => {
      expect(result.current.parties[index].name).toBe(name);
    });
  }
}

// Mock setup helpers
export function setupConsoleMock() {
  const originalError = console.error;
  console.error = jest.fn();

  return () => {
    console.error = originalError;
  };
}