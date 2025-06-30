import { NextRequest, NextResponse } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';

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
 * Check if an API route requires authentication
 */
export function isProtectedApiRoute(pathname: string): boolean {
  // Return false for non-API routes
  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // Check if it's explicitly public
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }

  // Check if it's explicitly protected
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
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
 * Verify authentication for API routes
 * Returns null if authenticated, or error response if not
 */
export async function requireAuthentication(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return null; // Authentication successful
  } catch (error) {
    console.error('Authentication verification error:', error);
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
}

/**
 * Higher-order function to create authenticated API handlers
 */
// eslint-disable-next-line no-unused-vars
export function createAuthenticatedHandler(
  handler: (request: NextRequest, token: JWT) => Promise<NextResponse>
) {
  return async function authenticatedHandler(request: NextRequest): Promise<NextResponse> {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Call the original handler with the token
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

    const tierHierarchy = ['free', 'basic', 'premium', 'pro', 'enterprise'];
    const userTier = (token as any).subscriptionTier || 'free';
    const userTierIndex = tierHierarchy.indexOf(userTier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

    return userTierIndex >= requiredTierIndex;
  }

  /**
   * Get user ID from token
   */
  static getUserId(token: JWT | null): string | null {
    if (!token || !token.sub) return null;
    return token.sub;
  }

  /**
   * Get user email from token
   */
  static getUserEmail(token: JWT | null): string | null {
    if (!token || !token.email) return null;
    return token.email;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: JWT | null): boolean {
    if (!token || !token.exp) return true;
    return Date.now() >= token.exp * 1000;
  }
}
