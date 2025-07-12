/**
 * Shared test utilities to eliminate code duplication across hook tests
 */
import { act } from '@testing-library/react';

// Test constants
export const TEST_EMAIL = 'test@example.com';
export const TEST_CONTENT = 'Initial content';
export const TEST_ID = 'collaborator-123';

// Mock response creators
export function createMockResponse(ok: boolean = true, data: any = { success: true }) {
  return {
    ok,
    json: async () => data,
    status: ok ? 200 : 400,
  };
}

export function createDelayedMockResponse(delay: number = 100, ok: boolean = true) {
  return new Promise(resolve =>
    setTimeout(() => resolve(createMockResponse(ok)), delay)
  );
}

// Console spy utility
export async function withConsoleSpy<T>(fn: (_spy: jest.SpyInstance) => Promise<T>): Promise<T> {
  const spy = jest.spyOn(console, 'error').mockImplementation();
  try {
    return await fn(spy);
  } finally {
    spy.mockRestore();
  }
}

// Console spy for synchronous operations
export function createConsoleSpy() {
  return jest.spyOn(console, 'error').mockImplementation();
}

// Fetch mock utility
export function setupFetchMock(response: any = createMockResponse()) {
  global.fetch = jest.fn().mockResolvedValue(response);
  return fetch as jest.Mock;
}

// Fetch mock cleanup
export function cleanupFetchMock() {
  (fetch as jest.Mock).mockClear();
}

// Async operation helper
export async function waitForAsyncOperation(operation: () => Promise<any>) {
  return await operation();
}

// Delayed operation utility for testing async states
export function createDelayedOperation(delay: number = 100) {
  return () => new Promise(resolve => setTimeout(resolve, delay));
}

// API call assertions
export function expectApiCall(method: string, endpoint: string, body?: any) {
  const expectedCall: any = { method };

  if (method !== 'DELETE') {
    expectedCall.headers = { 'Content-Type': 'application/json' };
  }

  if (body) {
    expectedCall.body = JSON.stringify(body);
  }

  expect(fetch).toHaveBeenCalledWith(endpoint, expectedCall);
}

// Error testing helper
export async function testAsyncError(operation: () => Promise<any>, expectedError: string) {
  try {
    await operation();
    throw new Error('Expected error was not thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(expectedError);
  }
}

// API error testing pattern with console spy
export async function testApiErrorWithConsole(
  operation: () => Promise<any>,
  expectedConsoleMessage: string,
  expectedResult?: boolean
) {
  const consoleSpy = createConsoleSpy();

  let result: any;
  if (expectedResult !== undefined) {
    result = await operation();
    expect(result).toBe(expectedResult);
  } else {
    try {
      await operation();
      throw new Error('Expected operation to throw an error');
    } catch {
      // Error was thrown as expected
    }
  }

  expect(consoleSpy).toHaveBeenCalledWith(
    expectedConsoleMessage,
    expect.any(Error)
  );

  consoleSpy.mockRestore();
  return result;
}

// Test async operation with loading state
export async function testAsyncWithLoadingState<T>(
  result: { current: T },
  operation: () => Promise<any>,
  loadingKey: keyof T
) {
  // Start operation without awaiting
  const promise = operation();

  // Check loading state immediately
  expect(result.current[loadingKey]).toBe(true);

  // Wait for completion
  await promise;
  await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to ensure state update
  expect(result.current[loadingKey]).toBe(false);
}

// Test patterns for async operations with state
export async function testAsyncStateChange<T>(
  result: { current: T },
  operation: () => Promise<any>,
  stateKey: keyof T,
  expectedInitialValue: any,
  expectedFinalValue: any
) {
  // Start operation and check initial state
  operation();
  expect(result.current[stateKey]).toBe(expectedInitialValue);

  // Wait for completion and check final state
  await new Promise(resolve => setTimeout(resolve, 150));
  expect(result.current[stateKey]).toBe(expectedFinalValue);
}

// Hook state expectations
export function expectHookState(result: any, expectations: Record<string, any>) {
  Object.entries(expectations).forEach(([key, value]) => {
    expect(result.current[key]).toBe(value);
  });
}

// Function type checking
export function expectFunctionType(obj: any, funcName: string) {
  expect(typeof obj[funcName]).toBe('function');
}

// Test successful operation with API call
export async function testSuccessfulOperation<T>(
  result: { current: T },
  operation: () => Promise<boolean>,
  expectedMethod: string,
  expectedEndpoint: string,
  expectedBody?: any,
  expectedStateChanges?: Record<string, any>
) {
  let operationResult: boolean;
  await act(async () => {
    operationResult = await operation();
  });

  expectApiCall(expectedMethod, expectedEndpoint, expectedBody);
  expect(operationResult!).toBe(true);

  if (expectedStateChanges) {
    expectHookState(result, expectedStateChanges);
  }
}

// Test operation that should not make API call
export async function testNoApiCall<T>(
  result: { current: T },
  operation: () => Promise<boolean>,
  expectedResult: boolean = false
) {
  let operationResult: boolean;
  await act(async () => {
    operationResult = await operation();
  });

  expect(fetch).not.toHaveBeenCalled();
  expect(operationResult!).toBe(expectedResult);
}

// Test loading state during async operation
export async function testLoadingStateDuringOperation<T>(
  result: { current: T },
  operation: () => Promise<any>,
  loadingKey: keyof T
) {
  act(() => {
    operation();
  });

  expect(result.current[loadingKey]).toBe(true);

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
  });

  expect(result.current[loadingKey]).toBe(false);
}