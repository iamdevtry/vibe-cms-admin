import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/register',
  '/api/forgot-password',
  '/api/reset-password',
];

// Define protected path prefixes
const protectedPrefixes = [
  '/dashboard',
  '/api/users',
  '/api/media',
  '/api/content',
  '/api/taxonomy',
  '/api/settings',
];

/**
 * Check if the path is public
 */
const isPublicPath = (path: string): boolean => {
  return publicPaths.some(publicPath => path === publicPath) || 
         path.startsWith('/api/auth/') ||
         path.startsWith('/_next/') ||
         path.includes('/favicon.') ||
         path.includes('.svg') ||
         path.includes('.png') ||
         path.includes('.jpg') ||
         path.includes('.jpeg') ||
         path.includes('.css') ||
         path.includes('.js');
};

/**
 * Check if the path is protected
 */
const isProtectedPath = (path: string): boolean => {
  return protectedPrefixes.some(prefix => path.startsWith(prefix));
};

/**
 * Middleware function to handle authentication
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is public - allow access without authentication
  if (isPublicPath(path)) {
    return NextResponse.next();
  }
  
  // Check if the path needs protection
  if (isProtectedPath(path)) {
    // Get the session token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // If there's no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user is active
    if (token.status !== 'ACTIVE') {
      // Redirect to an account suspended page
      return NextResponse.redirect(new URL('/account-suspended', request.url));
    }
    
    // Add user role as a header for role-based authorization on API routes
    if (path.startsWith('/api/')) {
      const response = NextResponse.next();
      if (token.role) {
        response.headers.set('x-user-role', token.role as string);
      }
      return response;
    }
  }
  
  // For all other paths, just continue
  return NextResponse.next();
}

// Configure the matcher to only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image).*)',
  ],
};
