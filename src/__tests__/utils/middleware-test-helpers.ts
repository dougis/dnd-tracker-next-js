/**
 * Middleware-specific test helpers to reduce duplication in middleware tests
 */

import { NextRequest } from 'next/server';
import { createMockRequest, createMockURLForRedirect } from './mock-factories';

// Centralized middleware import to reduce duplication
export async function importMiddleware() {
  return await import('../../middleware');
}

export async function executeMiddlewareTest(pathname: string, setup: () => void) {
  const { middleware } = await importMiddleware();
  const request = createMockRequest(pathname);
  setup();

  await middleware(request);
  return { request, middleware };
}

export async function testRedirectFlow(pathname: string, mockGetToken: jest.MockedFunction<any>, mockRedirect: jest.MockedFunction<any>) {
  const { mockUrl, originalURL } = createMockURLForRedirect(pathname);

  setupUnauthenticatedMocks(mockGetToken, mockRedirect);

  const { request } = await executeMiddlewareTest(pathname, () => {});

  return { mockUrl, originalURL, request };
}

export function expectStandardAPIResponse(mockJson: jest.MockedFunction<any>) {
  expect(mockJson).toHaveBeenCalledWith(
    { error: 'Authentication required' },
    { status: 401 }
  );
}

export function expectAuthenticationCheck(request: NextRequest, mockGetToken: jest.MockedFunction<any>) {
  expect(mockGetToken).toHaveBeenCalledWith({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

export function expectRedirectWithCallback(mockUrl: any, pathname: string) {
  expect(mockUrl.searchParams.set).toHaveBeenCalledWith(
    'callbackUrl',
    encodeURI(`http://localhost:3000${pathname}`)
  );
}

export async function testEdgeCaseRoute(
  pathname: string,
  url: string,
  mockGetToken: jest.MockedFunction<any>,
  mockRedirect: jest.MockedFunction<any>
) {
  setupUnauthenticatedMocks(mockGetToken, mockRedirect);
  await executeMiddlewareTest(pathname, () => {});
  expect(mockGetToken).toHaveBeenCalled();
  expect(mockRedirect).toHaveBeenCalled();
}

export async function testAuthenticatedUserAccess(
  pathname: string,
  mockGetToken: jest.MockedFunction<any>,
  mockNext: jest.MockedFunction<any>,
  mockRedirect: jest.MockedFunction<any>
) {
  const mockToken = {
    email: 'test@example.com',
    sub: 'user-123',
    iat: Date.now(),
    exp: Date.now() + 3600,
  };

  mockGetToken.mockResolvedValue(mockToken);
  mockNext.mockReturnValue({ type: 'next' });

  const { request } = await executeMiddlewareTest(pathname, () => {});

  expectAuthenticationCheck(request, mockGetToken);
  expect(mockNext).toHaveBeenCalled();
  expect(mockRedirect).not.toHaveBeenCalled();
}

export async function testNonInterfenceRoutes(
  routes: string[],
  mockGetToken: jest.MockedFunction<any>,
  mockNext: jest.MockedFunction<any>
) {
  const { middleware: _middleware } = await importMiddleware();

  for (const pathname of routes) {
    mockNext.mockReturnValue({ type: 'next' });
    const { request: _request } = await executeMiddlewareTest(pathname, () => {});

    // These routes should not trigger authentication checks
    expect(mockGetToken).not.toHaveBeenCalled();

    // Reset for next iteration
    jest.clearAllMocks();
    mockNext.mockReset();
    mockGetToken.mockReset();
  }
}

export function setupUnauthenticatedMocks(mockGetToken: jest.MockedFunction<any>, mockRedirect: jest.MockedFunction<any>) {
  mockGetToken.mockResolvedValue(null);
  mockRedirect.mockReturnValue({ type: 'redirect' });
}

export function setupAPIUnauthenticatedMocks(mockGetToken: jest.MockedFunction<any>, mockJson: jest.MockedFunction<any>) {
  mockGetToken.mockResolvedValue(null);
  mockJson.mockReturnValue({ json: { error: 'Authentication required' }, status: 401 });
}

export async function expectMiddlewareMatcherConfiguration() {
  const middlewareModule = await import('../../middleware');

  expect(middlewareModule.config).toBeDefined();
  expect(middlewareModule.config.matcher).toContain('/parties/:path*');

  // Verify the complete matcher includes parties routes
  const expectedMatchers = [
    '/dashboard/:path*',
    '/characters/:path*',
    '/encounters/:path*',
    '/parties/:path*',  // This should be added
    '/combat/:path*',
    '/settings/:path*',
    '/api/users/:path*',
    '/api/characters/:path*',
    '/api/encounters/:path*',
    '/api/combat/:path*',
    '/api/parties/:path*',
  ];

  expect(middlewareModule.config.matcher).toEqual(expectedMatchers);
}

export function createProtectedRouteTestSuite(routes: string[], testFunction: (_pathname: string) => Promise<void>) {
  return routes.forEach(pathname => {
    it(`should identify ${pathname} as a protected route`, async () => {
      await testFunction(pathname);
    });
  });
}

/**
 * Generic protected route test for both page and API routes
 */
export async function createProtectedRouteTest(
  pathname: string,
  _mockGetToken: jest.MockedFunction<any>,
  _mockResponse: jest.MockedFunction<any>,
  setupMocks: (_mockGetToken: jest.MockedFunction<any>, _mockResponse: jest.MockedFunction<any>) => void,
  expectResponse?: (_mockResponse: jest.MockedFunction<any>) => void
) {
  const { request } = await executeMiddlewareTest(pathname, () => setupMocks(_mockGetToken, _mockResponse));
  expectAuthenticationCheck(request, _mockGetToken);
  if (expectResponse) {
    expectResponse(_mockResponse);
  }
}