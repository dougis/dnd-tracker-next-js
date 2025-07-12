/**
 * Middleware Parties Route Protection Tests
 *
 * Tests that verify the middleware correctly protects parties routes.
 * These tests should fail initially and pass after middleware implementation.
 */

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mock NextAuth JWT module
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock NextResponse
const mockRedirect = jest.fn();
const mockNext = jest.fn();
const mockJson = jest.fn();

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
    json: mockJson,
  },
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

// Setup environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret';
});

afterAll(() => {
  process.env = originalEnv;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockRedirect.mockReset();
  mockNext.mockReset();
  mockJson.mockReset();
  mockGetToken.mockReset();
});

// Helper functions to reduce duplication
function createMockRequest(pathname: string): NextRequest {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
  } as NextRequest;
}

function setupUnauthenticatedMocks() {
  mockGetToken.mockResolvedValue(null);
  mockRedirect.mockReturnValue({ type: 'redirect' });
}

function setupAPIUnauthenticatedMocks() {
  mockGetToken.mockResolvedValue(null);
  mockJson.mockReturnValue({ json: { error: 'Authentication required' }, status: 401 });
}

function expectAuthenticationCall(request: NextRequest) {
  expect(mockGetToken).toHaveBeenCalledWith({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

async function testProtectedRoute(pathname: string) {
  const { middleware } = await import('../middleware');
  const request = createMockRequest(pathname);
  setupUnauthenticatedMocks();

  await middleware(request);

  expectAuthenticationCall(request);
}

describe('Middleware Parties Route Protection', () => {
  describe('Parties Page Route Protection', () => {
    const protectedRoutes = [
      '/parties',
      '/parties/create',
      '/parties/123/edit'
    ];

    protectedRoutes.forEach(pathname => {
      it(`should identify ${pathname} as a protected route`, async () => {
        await testProtectedRoute(pathname);
      });
    });

    it('should identify deeply nested parties routes as protected', async () => {
      const { middleware } = await import('../middleware');

      const nestedRoutes = [
        '/parties/123/characters/add',
        '/parties/456/settings/permissions',
        '/parties/789/members/invite',
        '/parties/abc/encounters/active',
      ];

      for (const pathname of nestedRoutes) {
        await testProtectedRoute(pathname);

        // Reset for next iteration
        jest.clearAllMocks();
        mockRedirect.mockReset();
        mockGetToken.mockReset();
      }
    });
  });

  describe('Parties API Route Protection', () => {
    async function testProtectedAPIRoute(pathname: string) {
      const { middleware } = await import('../middleware');
      const request = createMockRequest(pathname);
      setupAPIUnauthenticatedMocks();

      await middleware(request);

      expectAuthenticationCall(request);
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    it('should protect /api/parties routes', async () => {
      await testProtectedAPIRoute('/api/parties');
    });

    it('should protect nested /api/parties routes', async () => {
      const { middleware } = await import('../middleware');

      const apiRoutes = [
        '/api/parties/123',
        '/api/parties/create',
        '/api/parties/456/members',
        '/api/parties/789/characters',
      ];

      for (const pathname of apiRoutes) {
        await testProtectedAPIRoute(pathname);

        // Reset for next iteration
        jest.clearAllMocks();
        mockGetToken.mockReset();
        mockJson.mockReset();
      }
    });
  });

  describe('Authentication Flow for Parties Routes', () => {
    function createMockURLForRedirect(pathname: string) {
      const mockUrl = {
        href: `http://localhost:3000/signin?callbackUrl=${encodeURIComponent(`http://localhost:3000${pathname}`)}`,
        searchParams: {
          set: jest.fn(),
        },
      };

      const originalURL = global.URL;
      global.URL = jest.fn().mockImplementation(() => mockUrl) as any;

      return { mockUrl, originalURL };
    }

    it('should redirect unauthenticated users from /parties to signin with callback', async () => {
      const { middleware } = await import('../middleware');
      const request = createMockRequest('/parties');
      const { mockUrl, originalURL } = createMockURLForRedirect('/parties');

      mockGetToken.mockResolvedValue(null);


      mockRedirect.mockReturnValue({ type: 'redirect' });

      await middleware(request);

      expect(mockUrl.searchParams.set).toHaveBeenCalledWith(
        'callbackUrl',
        encodeURI('http://localhost:3000/parties')
      );
      expect(mockRedirect).toHaveBeenCalledWith(mockUrl);

      // Restore original URL
      global.URL = originalURL;
    });

    it('should allow authenticated users to access parties routes', async () => {
      const { middleware } = await import('../middleware');

      const request = {
        nextUrl: { pathname: '/parties' },
        url: 'http://localhost:3000/parties',
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
    });

    it('should redirect from nested parties routes with correct callback URL', async () => {
      const { middleware } = await import('../middleware');
      const pathname = '/parties/123/edit';
      const request = createMockRequest(pathname);
      const { mockUrl, originalURL } = createMockURLForRedirect(pathname);

      mockGetToken.mockResolvedValue(null);

      mockRedirect.mockReturnValue({ type: 'redirect' });

      await middleware(request);

      expect(mockUrl.searchParams.set).toHaveBeenCalledWith(
        'callbackUrl',
        encodeURI(`http://localhost:3000${pathname}`)
      );
      expect(mockRedirect).toHaveBeenCalledWith(mockUrl);

      // Restore original URL
      global.URL = originalURL;
    });
  });

  describe('Middleware Configuration Update', () => {
    it('should include parties routes in matcher configuration', async () => {
      const middlewareModule = await import('../middleware');

      expect(middlewareModule.config).toBeDefined();
      expect(middlewareModule.config.matcher).toContain('/parties/:path*');

      // Verify the complete matcher includes parties routes
      const expectedMatchers = [
        '/dashboard/:path*',
        '/characters/:path*',
        '/encounters/:path*',
        '/parties/:path*',  // This should be added
        '/combat/:path*',
        '/api/users/:path*',
        '/api/characters/:path*',
        '/api/encounters/:path*',
        '/api/combat/:path*',
        '/api/parties/:path*',
      ];

      expect(middlewareModule.config.matcher).toEqual(expectedMatchers);
    });
  });

  describe('Edge Cases for Parties Routes', () => {
    it('should handle parties routes with query parameters', async () => {
      const { middleware } = await import('../middleware');

      const request = {
        nextUrl: { pathname: '/parties' },
        url: 'http://localhost:3000/parties?filter=active&sort=name',
      } as NextRequest;

      mockGetToken.mockResolvedValue(null);
      mockRedirect.mockReturnValue({ type: 'redirect' });

      await middleware(request);

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('should handle parties routes with hash fragments', async () => {
      const { middleware } = await import('../middleware');

      const request = {
        nextUrl: { pathname: '/parties/123' },
        url: 'http://localhost:3000/parties/123#members-section',
      } as NextRequest;

      mockGetToken.mockResolvedValue(null);
      mockRedirect.mockReturnValue({ type: 'redirect' });

      await middleware(request);

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('should not interfere with similar but different routes', async () => {
      const { middleware } = await import('../middleware');

      const nonPartiesRoutes = [
        '/part',
        '/party',  // Without the 's'
        '/user/parties',   // Parties as a subpath but not the main route
      ];

      for (const pathname of nonPartiesRoutes) {
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
    });
  });
});