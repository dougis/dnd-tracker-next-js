/**
 * Test utilities for hook testing to eliminate code duplication
 */

// Test constants
export const TEST_EMAIL = 'test@example.com';
export const TEST_CONTENT = 'Initial content';
export const TEST_ID = 'collaborator-123';

// Mock Response Utilities
export function createMockResponse(ok: boolean = true, data: any = { success: true }) {
  return {
    ok,
    json: async () => data,
  };
}

export function createMockErrorResponse(status: number = 400) {
  return {
    ok: false,
    status,
  };
}

// Mock Setup Utilities
export function mockFetch(response: any) {
  (global.fetch as jest.Mock).mockResolvedValueOnce(response);
}

export function mockFetchWithDelay(response: any, delay: number = 100) {
  (global.fetch as jest.Mock).mockImplementation(
    () => new Promise(resolve => setTimeout(() => resolve(response), delay))
  );
}

export function clearFetchMock() {
  (global.fetch as jest.Mock).mockClear();
}

// Console Spy Utilities
export function setupConsoleSpy() {
  return jest.spyOn(console, 'error').mockImplementation();
}

export function restoreConsoleSpy(spy: jest.SpyInstance) {
  spy.mockRestore();
}

export function expectConsoleError(spy: jest.SpyInstance, message: string) {
  expect(spy).toHaveBeenCalledWith(message, expect.any(Error));
}

// API Call Assertions
export function expectApiCall(method: string, endpoint: string, body?: any) {
  const expectedCall: any = {
    method,
    ...(method !== 'DELETE' && {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  };

  if (body) {
    expectedCall.body = JSON.stringify(body);
  }

  expect(fetch).toHaveBeenCalledWith(endpoint, expectedCall);
}

// Function Type Checking
export function expectFunctionTypes(result: any, functionNames: string[]) {
  functionNames.forEach(name => {
    expect(typeof result[name]).toBe('function');
  });
}

// Async Testing Utilities
export async function testAsyncOperation(operation: () => Promise<any>) {
  return await operation();
}

// State Change Testing
export function testStateChange(action: () => void, expectations: () => void) {
  action();
  expectations();
}