/**
 * Mock factory functions to reduce duplication in test files
 */

import { NextRequest } from 'next/server';

export function createMockRequest(pathname: string, options?: {
  queryParams?: string;
  hash?: string;
}): NextRequest {
  let url = `http://localhost:3000${pathname}`;
  if (options?.queryParams) url += `?${options.queryParams}`;
  if (options?.hash) url += `#${options.hash}`;
  
  return {
    nextUrl: { pathname },
    url,
  } as NextRequest;
}

export function createMockSession(user?: any) {
  return user ? { user } : null;
}

export function createMockUser(overrides?: Partial<any>) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  };
}

export function createSigninRedirectUrl(callbackPath: string): string {
  return `/signin?callbackUrl=${encodeURIComponent(`http://localhost:3000${callbackPath}`)}`;
}

export function createMockURLForRedirect(pathname: string) {
  const mockUrl = {
    href: `http://localhost:3000${createSigninRedirectUrl(pathname)}`,
    searchParams: {
      set: jest.fn(),
    },
  };

  const originalURL = global.URL;
  global.URL = jest.fn().mockImplementation(() => mockUrl) as any;

  return { mockUrl, originalURL };
}