import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard']

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if accessing public route with token
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}