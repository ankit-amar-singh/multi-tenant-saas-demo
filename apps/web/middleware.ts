import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Level 3 Edge & Response Cache Headers:
  // For dynamic authenticated dashboard routes, ensure private, non-cacheable client policy
  if (pathname.includes('/dashboard') || pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // For static asset requests (_next/static, images), set aggressive caching header
  if (pathname.startsWith('/_next/static') || pathname.startsWith('/public')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/image|favicon.ico).*)'],
};
