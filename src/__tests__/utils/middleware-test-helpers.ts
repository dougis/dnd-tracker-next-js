/**
 * Middleware-specific test helpers to reduce duplication in middleware tests
 */

import { NextRequest } from 'next/server';
import { createMockRequest, createMockURLForRedirect } from './mock-factories';

export async function executeMiddlewareTest(pathname: string, setup: () => void) {
  const { middleware } = await import('../../middleware');
  const request = createMockRequest(pathname);
  setup();

  await middleware(request);
  return { request, middleware };
}

export async function testRedirectFlow(pathname: string, mockGetToken: jest.MockedFunction<any>, mockRedirect: jest.MockedFunction<any>) {
  const { mockUrl, originalURL } = createMockURLForRedirect(pathname);

  mockGetToken.mockResolvedValue(null);
  mockRedirect.mockReturnValue({ type: 'redirect' });

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
  const { middleware } = await import('../../middleware');

  const request = {
    nextUrl: { pathname },
    url,
  } as NextRequest;

  mockGetToken.mockResolvedValue(null);
  mockRedirect.mockReturnValue({ type: 'redirect' });

  await middleware(request);

  expect(mockGetToken).toHaveBeenCalled();
  expect(mockRedirect).toHaveBeenCalled();
}

export async function testAuthenticatedUserAccess(
  pathname: string,
  mockGetToken: jest.MockedFunction<any>,
  mockNext: jest.MockedFunction<any>,
  mockRedirect: jest.MockedFunction<any>
) {
  const { middleware } = await import('../../middleware');

  const request = {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
  } as NextRequest;

  const mockToken = {
    email: 'test@example.com',
    sub: 'user-123',
    iat: Date.now(),
    exp: Date.now() + 3600,
  };

  mockGetToken.mockResolvedValue(mockToken);
  mockNext.mockReturnValue({ type: 'next' });

  await middleware(request);

  expect(mockGetToken).toHaveBeenCalledWith({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  expect(mockNext).toHaveBeenCalled();
  expect(mockRedirect).not.toHaveBeenCalled();
}

export async function testNonInterfenceRoutes(
  routes: string[],
  mockGetToken: jest.MockedFunction<any>,
  mockNext: jest.MockedFunction<any>
) {
  const { middleware } = await import('../../middleware');

  for (const pathname of routes) {
    mockNext.mockReturnValue({ type: 'next' });

    const request = {
      nextUrl: { pathname },
      url: `http://localhost:3000${pathname}`,
    } as NextRequest;

    const result = await middleware(request);

    // These routes should not trigger authentication checks
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(result).toBeDefined();

    // Reset for next iteration
    jest.clearAllMocks();
    mockNext.mockReset();
    mockGetToken.mockReset();
  }
}