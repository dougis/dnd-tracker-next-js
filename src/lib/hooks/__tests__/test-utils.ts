/**
 * Shared test utilities to eliminate code duplication across hook tests
 */

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

// Async operation helper
export async function waitForAsyncOperation(operation: () => Promise<any>) {
  return await operation();
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