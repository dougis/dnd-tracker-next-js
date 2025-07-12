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
  expectations: (mockGetToken: jest.MockedFunction<any>, request: any) => void
) {
  const { middleware } = await import('../../middleware');
  const { createMockRequest } = await import('./mock-factories');
  
  const request = createMockRequest(pathname);
  setupMocks();
  
  await middleware(request);
  
  expectations(jest.fn(), request);
}

/**
 * Reusable authentication expectation pattern
 */
export function expectAuthenticationCall(mockGetToken: jest.MockedFunction<any>, request: any) {
  expect(mockGetToken).toHaveBeenCalledWith({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

/**
 * Reusable redirect expectation pattern
 */
export function expectRedirectCall(mockRedirect: jest.MockedFunction<any>, mockUrl?: any) {
  expect(mockRedirect).toHaveBeenCalled();
  if (mockUrl) {
    expect(mockRedirect).toHaveBeenCalledWith(mockUrl);
  }
}

/**
 * Consolidated mock setup for unauthenticated scenarios
 */
export function createUnauthenticatedMockSetup(mockGetToken: jest.MockedFunction<any>, mockRedirect: jest.MockedFunction<any>) {
  return () => {
    mockGetToken.mockResolvedValue(null);
    mockRedirect.mockReturnValue({ type: 'redirect' });
  };
}

/**
 * Consolidated mock setup for API unauthenticated scenarios
 */
export function createAPIUnauthenticatedMockSetup(mockGetToken: jest.MockedFunction<any>, mockJson: jest.MockedFunction<any>) {
  return () => {
    mockGetToken.mockResolvedValue(null);
    mockJson.mockReturnValue({ json: { error: 'Authentication required' }, status: 401 });
  };
}