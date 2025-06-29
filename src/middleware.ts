import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/characters') ||
    pathname.startsWith('/encounters') ||
    pathname.startsWith('/combat');

  // If it's not a protected route, continue
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token and trying to access protected route, redirect to signin
  if (!token) {
    const url = new URL('/auth/signin', request.url);
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
    '/combat/:path*',
  ],
};
