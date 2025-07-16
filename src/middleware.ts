import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isProtectedApiRoute } from '@/lib/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPageRoute = checkProtectedPageRoute(pathname);
  const isProtectedAPI = isProtectedApiRoute(pathname);

  if (!isProtectedPageRoute && !isProtectedAPI) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return handleUnauthenticatedRequest(request, isProtectedAPI);
  }

  return NextResponse.next();
}

function checkProtectedPageRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/characters',
    '/encounters',
    '/parties',
    '/combat',
    '/settings'
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
}

function handleUnauthenticatedRequest(request: NextRequest, isAPI: boolean): NextResponse {
  if (isAPI) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const url = new URL('/signin', request.url);
  url.searchParams.set('callbackUrl', encodeURI(request.url));
  return NextResponse.redirect(url);
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
