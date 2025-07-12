/**
 * Shared test utilities for hook testing
 */
import { act } from '@testing-library/react';

/**
 * Mock fetch response helper
 */
export const createMockResponse = (ok: boolean, data?: any, status = 200) => ({
  ok,
  status,
  json: async () => data || { success: ok },
});

/**
 * Mock fetch with delay for testing loading states
 */
export const createDelayedMockResponse = (ok: boolean, delay = 100, data?: any) =>
  jest.fn().mockImplementation(
    () => new Promise(resolve =>
      setTimeout(() => resolve(createMockResponse(ok, data)), delay)
    )
  );

/**
 * Setup and cleanup console spy for error testing
 */
export const withConsoleSpy = (testFn: (_consoleSpy: jest.SpyInstance) => Promise<void> | void) => {
  return async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    try {
      await testFn(consoleSpy);
    } finally {
      consoleSpy.mockRestore();
    }
  };
};

/**
 * Helper for testing async operations that should complete
 */
export const waitForAsyncOperation = async (duration = 150) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, duration));
  });
};

/**
 * Helper for testing API calls with expected parameters
 */
export const expectApiCall = (
  method: string,
  url: string,
  body?: any
) => {
  const expectedCall = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  };

  expect(fetch).toHaveBeenCalledWith(url, expectedCall);
};

/**
 * Helper for testing error handling in async operations
 */
export const testAsyncError = async (
  operation: () => Promise<any>,
  expectedError: string,
  consoleSpy: jest.SpyInstance
) => {
  try {
    await operation();
    // If no error was thrown, the test should fail
    throw new Error('Expected operation to throw an error');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(expectedError);
  }

  expect(consoleSpy).toHaveBeenCalled();
};

/**
 * Helper for testing state updates in hooks
 */
export const expectHookState = (
  hookResult: any,
  expectedState: Record<string, any>
) => {
  Object.entries(expectedState).forEach(([key, value]) => {
    expect(hookResult.current[key]).toBe(value);
  });
};