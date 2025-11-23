import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Refresh session if expired - required for Server Components
  // This ensures the session is always fresh
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes that always require authentication
  const protectedPaths = ['/dashboard', '/profile', '/journey']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  // Public routes that should never be protected (even without auth)
  const publicPaths = [
    '/',
    '/auth',
    '/api',
    '/privacy-policy',
    '/terms',
    '/reset-password',
    '/update-password',
    '/verify-email',
  ]
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  
  // If it's a protected path and user is not authenticated, redirect to home
  if (!user && isProtectedPath) {
    console.log('[Middleware] Redirecting protected path:', pathname)
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return supabaseResponse
  }
  
  // If it matches username/journeyId pattern, it's a public profile/journey
  // Pattern: /{username} or /{username}/{journeyId}
  // JourneyId is typically a UUID format (lowercase with hyphens)
  const usernamePattern = /^\/[a-z0-9_-]+$/i
  const usernameJourneyPattern = /^\/[a-z0-9_-]+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
  const isPublicProfileOrJourney = (usernamePattern.test(pathname) || usernameJourneyPattern.test(pathname)) && !isProtectedPath && !isPublicPath
  
  // Allow public profile/journey pages
  if (isPublicProfileOrJourney) {
    console.log('[Middleware] Allowing public profile/journey:', pathname)
    return supabaseResponse
  }

  console.log('[Middleware] Default allow for:', pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
