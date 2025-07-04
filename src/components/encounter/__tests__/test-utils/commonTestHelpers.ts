// Common test patterns and utilities to reduce code duplication
import { renderHook, act, waitFor } from '@testing-library/react';
import type { EncounterListItem } from '../../types';

// Generic test action wrapper
export const actWrapper = (action: () => void) => {
  act(() => {
    action();
  });
};

// Generic expectation helper
export const expectEqual = (actual: any, expected: any) => {
  expect(actual).toEqual(expected);
};

// Common test setup patterns
export const createHookTestSetup = <T, P>(
  hook: (_params: P) => T,
  defaultParams: P
) => {
  const setup = (_params?: Partial<P>) =>
    renderHook(() => hook({ ...defaultParams, ..._params }));

  return { setup };
};

// Common array operations for tests
export const expectArrayContains = (array: any[], item: any) => {
  expect(array).toContain(item);
};

export const expectArrayLength = (array: any[], length: number) => {
  expect(array).toHaveLength(length);
};

export const expectArrayEmpty = (array: any[]) => {
  expect(array).toEqual([]);
};

// Common state expectations
export const expectStateShape = (state: any, shape: Record<string, any>) => {
  Object.entries(shape).forEach(([key, value]) => {
    expect(state[key]).toEqual(value);
  });
};

// Mock function helpers
export const expectMockCalledWith = (mock: jest.Mock, ...args: any[]) => {
  expect(mock).toHaveBeenCalledWith(...args);
};

export const expectMockCalledTimes = (mock: jest.Mock, times: number) => {
  expect(mock).toHaveBeenCalledTimes(times);
};

// Selection state helpers
export const createSelectionStateExpectations = (encounters: EncounterListItem[]) => ({
  expectNoSelection: (result: any) => {
    expectStateShape(result.current, {
      selectedEncounters: [],
      hasSelection: false,
      isAllSelected: false,
    });
  },

  expectAllSelected: (result: any) => {
    expectStateShape(result.current, {
      selectedEncounters: encounters.map(e => e.id),
      hasSelection: true,
      isAllSelected: true,
    });
  },

  expectPartialSelection: (result: any, selectedIds: string[]) => {
    expectStateShape(result.current, {
      selectedEncounters: selectedIds,
      hasSelection: true,
      isAllSelected: false,
    });
  },
});

// Filter state helpers
export const createFilterStateExpectations = () => ({
  expectInitialFilters: (result: any, mockFilters: any) => {
    expectStateShape(result.current, {
      filters: mockFilters,
      searchQuery: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  },

  expectFiltersChanged: (result: any, expectedFilters: any) => {
    Object.entries(expectedFilters).forEach(([key, value]) => {
      expect(result.current.filters[key]).toEqual(value);
    });
  },
});

// Loading state helpers
export const expectLoadingState = (result: any, isLoading: boolean = true) => {
  expect(result.current.isLoading).toBe(isLoading);
};

export const expectErrorState = (result: any, errorMessage: string | null) => {
  expect(result.current.error).toBe(errorMessage);
};

export const expectDataState = (result: any, data: any[]) => {
  expect(result.current.encounters || result.current.data).toEqual(data);
};

// Parameter testing helper for hooks
export const createParameterTestHelper = (hook: any, mockService: any, mockResponse: any) => {
  return async (params: any, expectedCall: any) => {
    mockService.searchEncounters.mockResolvedValue(mockResponse);
    renderHook(() => hook(params));
    await waitFor(() => {
      expectMockCalledWith(mockService.searchEncounters, expect.objectContaining(expectedCall));
    });
  };
};

// Batch test generator for reducing test duplication
export const createBatchParameterTests = (testHelper: any) => {
  const tests = [
    {
      name: 'passes search query correctly',
      params: (defaultParams: any) => ({ ...defaultParams, searchQuery: 'dragon encounter' }),
      expectedCall: { query: 'dragon encounter' }
    },
    {
      name: 'passes basic sort parameters correctly',
      params: (defaultParams: any) => ({ ...defaultParams, sortBy: 'name', sortOrder: 'asc' }),
      expectedCall: { sortBy: 'name', sortOrder: 'asc' }
    }
  ];

  return tests.reduce((acc, test) => {
    acc[test.name] = async (defaultParams: any) => {
      await testHelper(test.params(defaultParams), test.expectedCall);
    };
    return acc;
  }, {} as any);
};