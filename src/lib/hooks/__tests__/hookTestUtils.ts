/**
 * Test utilities for React hook testing
 * Eliminates code duplication across hook test files
 */

import { renderHook, act } from '@testing-library/react';

/**
 * Common mock response patterns
 */
export const createMockResponse = (success: boolean = true, status: number = 200, data: any = { success: true }) => ({
  ok: success,
  status,
  json: async () => data,
});

export const createMockErrorResponse = (status: number = 500) => ({
  ok: false,
  status,
});

/**
 * Console spy utilities
 */
export const setupConsoleSpy = () => {
  return jest.spyOn(console, 'error').mockImplementation();
};

export const restoreConsoleSpy = (spy: jest.SpyInstance) => {
  spy.mockRestore();
};

/**
 * Fetch mock utilities
 */
export const mockFetch = (response: any) => {
  global.fetch = jest.fn().mockResolvedValue(response);
};

export const mockFetchWithDelay = (response: any, delay: number = 100) => {
  global.fetch = jest.fn().mockImplementation(
    () => new Promise(resolve =>
      setTimeout(() => resolve(response), delay)
    )
  );
};

export const clearFetchMock = () => {
  (fetch as jest.Mock).mockClear();
};

/**
 * Hook rendering utilities with common patterns
 */
export const renderHookWithAct = <T extends (..._args: any[]) => any>(
  hook: T,
  ..._args: Parameters<T>
) => {
  return renderHook(() => hook(..._args));
};

/**
 * Common test assertion patterns
 */
export const expectFunctionTypes = (result: any, functionNames: string[]) => {
  functionNames.forEach(name => {
    expect(typeof result[name]).toBe('function');
  });
};

export const expectApiCall = (
  url: string,
  method: string = 'GET',
  expectedBody?: any
) => {
  const expectedCall: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (expectedBody) {
    expectedCall.body = JSON.stringify(expectedBody);
  }

  expect(fetch).toHaveBeenCalledWith(url, expectedCall);
};

export const expectConsoleError = (spy: jest.SpyInstance, message: string) => {
  expect(spy).toHaveBeenCalledWith(message, expect.any(Error));
};

/**
 * Common async test patterns
 */
export const testAsyncOperation = async (
  operation: () => Promise<any>,
  expectations?: () => void
) => {
  await act(async () => {
    await operation();
  });

  if (expectations) {
    expectations();
  }
};

/**
 * State change testing utilities
 */
export const testStateChange = <T>(
  result: { current: T },
  stateProperty: keyof T,
  initialValue: any,
  newValue: any,
  changeAction: () => void
) => {
  // Verify initial state
  expect(result.current[stateProperty]).toBe(initialValue);

  // Apply change
  act(() => {
    changeAction();
  });

  // Verify new state
  expect(result.current[stateProperty]).toBe(newValue);
};

/**
 * Common test data patterns
 */
export const TEST_EMAIL = 'test@example.com';
export const TEST_CONTENT = 'Test content';
export const TEST_ID = 'test-id-123';

/**
 * Error testing utilities
 */
export const testErrorHandling = async (
  operation: () => Promise<any>,
  expectedError: string,
  consoleSpy: jest.SpyInstance
) => {
  try {
    await operation();
    // If we reach here, the operation didn't throw as expected
    fail('Expected operation to throw an error');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(expectedError);
  }

  expect(consoleSpy).toHaveBeenCalled();
};

/**
 * Save operation testing pattern
 */
export const testSaveOperation = async (
  hookResult: any,
  saveFn: string,
  expectations: {
    beforeSave?: () => void;
    duringSave?: () => void;
    afterSave?: () => void;
  } = {}
) => {
  if (expectations.beforeSave) {
    expectations.beforeSave();
  }

  // Start save operation
  const savePromise = act(async () => {
    await hookResult.current[saveFn]();
  });

  if (expectations.duringSave) {
    expectations.duringSave();
  }

  await savePromise;

  if (expectations.afterSave) {
    expectations.afterSave();
  }
};

/**
 * Loading state testing utility
 */
export const testLoadingState = async (
  hookResult: any,
  operation: () => Promise<void>,
  loadingProperty: string = 'isSaving'
) => {
  // Start operation
  act(() => {
    operation();
  });

  expect(hookResult.current[loadingProperty]).toBe(true);

  // Wait for operation to complete
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
  });

  expect(hookResult.current[loadingProperty]).toBe(false);
};