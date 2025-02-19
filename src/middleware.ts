import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn');
  const isConfigurationRoute = request.nextUrl.pathname.startsWith('/configuration');

  if (isConfigurationRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isLoggedIn && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/configuration', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/configuration/:path*'],
};
