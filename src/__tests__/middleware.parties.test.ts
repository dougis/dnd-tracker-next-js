/**
 * Middleware Parties Route Protection Tests
 *
 * Tests that verify the middleware correctly protects parties routes.
 * These tests should fail initially and pass after middleware implementation.
 */

import { getToken } from 'next-auth/jwt';
import { setupEnvironment, resetAllMocks } from './utils/test-setup';
import { createIterativeTestRunner } from './utils/test-runners';
import {
  executeMiddlewareTest,
  testRedirectFlow,
  expectStandardAPIResponse,
  expectAuthenticationCheck,
  expectRedirectWithCallback,
  testEdgeCaseRoute,
  testAuthenticatedUserAccess,
  testNonInterfenceRoutes,
  expectMiddlewareMatcherConfiguration,
  createProtectedRouteTestSuite,
  setupUnauthenticatedMocks as setupUnauthenticatedMocksUtil,
  setupAPIUnauthenticatedMocks as setupAPIUnauthenticatedMocksUtil
} from './utils/middleware-test-helpers';

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
const restoreEnv = setupEnvironment();

afterAll(() => {
  restoreEnv();
});

beforeEach(() => {
  resetAllMocks(mockRedirect, mockNext, mockJson, mockGetToken);
});

// Helper functions using shared mock utilities
function setupUnauthenticatedMocks() {
  setupUnauthenticatedMocksUtil(mockGetToken, mockRedirect);
}

function setupAPIUnauthenticatedMocks() {
  setupAPIUnauthenticatedMocksUtil(mockGetToken, mockJson);
}


async function testProtectedRoute(pathname: string) {
  const { request } = await executeMiddlewareTest(pathname, setupUnauthenticatedMocks);
  expectAuthenticationCheck(request, mockGetToken);
}

describe('Middleware Parties Route Protection', () => {
  describe('Parties Page Route Protection', () => {
    const protectedRoutes = [
      '/parties',
      '/parties/create',
      '/parties/123/edit'
    ];

    createProtectedRouteTestSuite(protectedRoutes, testProtectedRoute);

    it('should identify deeply nested parties routes as protected', async () => {
      const nestedRoutes = [
        '/parties/123/characters/add',
        '/parties/456/settings/permissions',
        '/parties/789/members/invite',
        '/parties/abc/encounters/active',
      ];

      const runTest = createIterativeTestRunner([mockRedirect, mockGetToken]);
      await runTest(nestedRoutes, testProtectedRoute);
    });
  });

  describe('Parties API Route Protection', () => {
    async function testProtectedAPIRoute(pathname: string) {
      const { request } = await executeMiddlewareTest(pathname, setupAPIUnauthenticatedMocks);
      expectAuthenticationCheck(request, mockGetToken);
      expectStandardAPIResponse(mockJson);
    }

    it('should protect /api/parties routes', async () => {
      await testProtectedAPIRoute('/api/parties');
    });

    it('should protect nested /api/parties routes', async () => {
      const apiRoutes = [
        '/api/parties/123',
        '/api/parties/create',
        '/api/parties/456/members',
        '/api/parties/789/characters',
      ];

      const runTest = createIterativeTestRunner([mockGetToken, mockJson]);
      await runTest(apiRoutes, testProtectedAPIRoute);
    });
  });

  describe('Authentication Flow for Parties Routes', () => {

    it('should redirect unauthenticated users from /parties to signin with callback', async () => {
      const { mockUrl, originalURL } = await testRedirectFlow('/parties', mockGetToken, mockRedirect);

      expectRedirectWithCallback(mockUrl, '/parties');
      expect(mockRedirect).toHaveBeenCalledWith(mockUrl);

      // Restore original URL
      global.URL = originalURL;
    });

    it('should allow authenticated users to access parties routes', async () => {
      await testAuthenticatedUserAccess('/parties', mockGetToken, mockNext, mockRedirect);
    });

    it('should redirect from nested parties routes with correct callback URL', async () => {
      const pathname = '/parties/123/edit';
      const { mockUrl, originalURL } = await testRedirectFlow(pathname, mockGetToken, mockRedirect);

      expectRedirectWithCallback(mockUrl, pathname);
      expect(mockRedirect).toHaveBeenCalledWith(mockUrl);

      // Restore original URL
      global.URL = originalURL;
    });
  });

  describe('Middleware Configuration Update', () => {
    it('should include parties routes in matcher configuration', async () => {
      await expectMiddlewareMatcherConfiguration();
    });
  });

  describe('Edge Cases for Parties Routes', () => {
    it('should handle parties routes with query parameters', async () => {
      await testEdgeCaseRoute('/parties', 'http://localhost:3000/parties?filter=active&sort=name', mockGetToken, mockRedirect);
    });

    it('should handle parties routes with hash fragments', async () => {
      await testEdgeCaseRoute('/parties/123', 'http://localhost:3000/parties/123#members-section', mockGetToken, mockRedirect);
    });

    it('should not interfere with similar but different routes', async () => {
      const nonPartiesRoutes = [
        '/part',
        '/party',  // Without the 's'
        '/user/parties',   // Parties as a subpath but not the main route
      ];

      await testNonInterfenceRoutes(nonPartiesRoutes, mockGetToken, mockNext);
    });
  });
});