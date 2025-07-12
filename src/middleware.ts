import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isProtectedApiRoute } from '@/lib/middleware';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Check if this is a protected page route
  const isProtectedPageRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/characters') ||
    pathname.startsWith('/encounters') ||
    pathname.startsWith('/parties') ||
    pathname.startsWith('/combat') ||
    pathname.startsWith('/settings');

  // Check if this is a protected API route
  const isProtectedAPI = isProtectedApiRoute(pathname);

  // If it's neither a protected page nor API route, continue
  if (!isProtectedPageRoute && !isProtectedAPI) {
    return NextResponse.next();
  }

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token and trying to access protected route
  if (!token) {
    // For API routes, return 401 JSON response
    if (isProtectedAPI) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For page routes, redirect to signin with callback URL
    const url = new URL('/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/characters/:path*',
    '/encounters/:path*',
    '/parties/:path*',
    '/combat/:path*',
    '/settings/:path*',
    '/api/users/:path*',
    '/api/characters/:path*',
    '/api/encounters/:path*',
    '/api/combat/:path*',
    '/api/parties/:path*',
  ],
};
