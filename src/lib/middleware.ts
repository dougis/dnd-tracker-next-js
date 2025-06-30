import { NextRequest, NextResponse } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { hasRequiredTier, getUserTier, extractUserId, extractUserEmail } from './session-shared';

/**
 * List of protected API route prefixes that require authentication
 */
const PROTECTED_API_ROUTES = [
  '/api/users',
  '/api/characters',
  '/api/encounters',
  '/api/combat',
  '/api/parties',
];

/**
 * List of public API routes that don't require authentication
 */
const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/health',
  '/api/public',
];

/**
 * Check if a route matches any in the given list
 */
function routeMatches(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname.startsWith(route));
}

/**
 * Check if an API route requires authentication
 */
export function isProtectedApiRoute(pathname: string): boolean {
  if (!pathname.startsWith('/api/')) return false;
  if (routeMatches(pathname, PUBLIC_API_ROUTES)) return false;
  return routeMatches(pathname, PROTECTED_API_ROUTES);
}

/**
 * Extract Bearer token from request headers
 */
export function extractBearerToken(headers: Headers): string | null {
  const authorization = headers.get('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice(7).trim();
  return token || null;
}

/**
 * Extract and validate JWT token from request
 */
async function getValidatedToken(request: NextRequest): Promise<JWT | null> {
  try {
    return await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

/**
 * Create unauthorized response
 */
function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}

/**
 * Verify authentication for API routes
 * Returns null if authenticated, or error response if not
 */
export async function requireAuthentication(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = await getValidatedToken(request);
  return token ? null : createUnauthorizedResponse();
}

/**
 * Type for authenticated handler functions
 */
type AuthenticatedHandler = (_request: NextRequest, _token: JWT) => Promise<NextResponse>;

/**
 * Higher-order function to create authenticated API handlers
 */
export function createAuthenticatedHandler(handler: AuthenticatedHandler) {
  return async function authenticatedHandler(request: NextRequest): Promise<NextResponse> {
    const token = await getValidatedToken(request);

    if (!token) {
      return createUnauthorizedResponse();
    }

    try {
      return await handler(request, token);
    } catch (error) {
      console.error('Authenticated handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Utility class for creating consistent API responses
 */
export class ApiResponse {

  /**
   * Create a success response
   */
  static success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
  }

  /**
   * Create an error response
   */
  static error(message: string, status: number = 400): NextResponse {
    return NextResponse.json({ error: message }, { status });
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message: string = 'Authentication required'): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  /**
   * Create a forbidden response
   */
  static forbidden(message: string = 'Access denied'): NextResponse {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  /**
   * Create a not found response
   */
  static notFound(message: string = 'Resource not found'): NextResponse {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  /**
   * Create a server error response
   */
  static serverError(message: string = 'Internal server error'): NextResponse {
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Session utilities for checking authentication state
 */
export class SessionUtils {

  /**
   * Check if user has required subscription tier
   */
  static hasSubscriptionTier(
    token: JWT | null,
    requiredTier: string
  ): boolean {
    if (!token) return false;
    const userTier = getUserTier(token);
    return hasRequiredTier(userTier, requiredTier);
  }

  /**
   * Get user ID from token
   */
  static getUserId(token: JWT | null): string | null {
    if (!token) return null;
    return extractUserId(token);
  }

  /**
   * Get user email from token
   */
  static getUserEmail(token: JWT | null): string | null {
    if (!token) return null;
    return extractUserEmail(token);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: JWT | null): boolean {
    if (!token || !token.exp) return true;
    return Date.now() >= token.exp * 1000;
  }
}
