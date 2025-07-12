/**
 * Shared test setup utilities to reduce code duplication across test files
 */

export function createTestMocks() {
  const mockRedirect = jest.fn();
  const mockNext = jest.fn();
  const mockJson = jest.fn();
  const mockGetToken = jest.fn();

  return { mockRedirect, mockNext, mockJson, mockGetToken };
}

export function resetAllMocks(...mocks: jest.MockedFunction<any>[]) {
  jest.clearAllMocks();
  mocks.forEach(mock => mock.mockReset());
}

export function setupEnvironment() {
  const originalEnv = process.env;
  process.env.NEXTAUTH_SECRET = 'test-secret';
  return () => { process.env = originalEnv; };
}

/**
 * Consolidated test execution patterns for middleware tests
 */
export async function executeMiddlewareTest(
  pathname: string,
  setupMocks: () => void,
  expectations: (_mockGetToken: jest.MockedFunction<any>, _request: any) => void
) {
  const { middleware } = await import('../../middleware');
  const { createMockRequest } = await import('./mock-factories');

  const request = createMockRequest(pathname);
  setupMocks();

  await middleware(request);

  expectations(jest.fn(), request);
}

// Note: expectAuthenticationCall moved to middleware-test-helpers.ts as expectAuthenticationCheck
// Import from there to avoid duplication

/**
 * Reusable redirect expectation pattern
 */
export function expectRedirectCall(mockRedirect: jest.MockedFunction<any>, mockUrl?: any) {
  expect(mockRedirect).toHaveBeenCalled();
  if (mockUrl) {
    expect(mockRedirect).toHaveBeenCalledWith(mockUrl);
  }
}

// Note: Unauthenticated mock setups moved to middleware-test-helpers.ts to avoid duplication
// Use the functions there instead

// Note: Standard middleware mocks moved to shared-mocks.ts to avoid duplication
// Import nextAuthJWTMock and nextResponseMock from there instead