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