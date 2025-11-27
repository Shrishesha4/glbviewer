import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidSession } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected admin routes
  const protectedRoutes = ['/models/explore', '/media/explore'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for API key in header (allows programmatic access)
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const validApiKey = process.env.UPLOAD_API_KEY;
    
    if (apiKey && validApiKey && apiKey === validApiKey) {
      // Valid API key - allow access
      return NextResponse.next();
    }

    // Check for admin session cookie
    const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    
    if (!isValidSession(session)) {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/models/explore',
    '/media/explore',
  ],
};
