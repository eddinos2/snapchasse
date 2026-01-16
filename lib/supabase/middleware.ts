import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimiter, getRateLimitConfig } from '@/lib/security/rate-limiter'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Rate limiting - only apply to API routes and auth routes, not page requests
  const path = new URL(request.url).pathname
  
  // Skip rate limiting for static assets and page requests (GET requests that are not API)
  const isApiRoute = path.startsWith('/api/')
  const isAuthRoute = path.startsWith('/auth/')
  
  // Only apply rate limiting to API and auth routes
  if (isApiRoute || isAuthRoute) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const config = getRateLimitConfig(path)
    
    if (!rateLimiter.check(ip, config.maxRequests, config.windowMs)) {
      const resetTime = rateLimiter.getResetTime(ip)
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': resetTime ? Math.ceil((resetTime - Date.now()) / 1000).toString() : '60',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
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

  // Refresh session - this updates the cookies automatically
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Add rate limit headers to response (only for API/auth routes)
  if (isApiRoute || isAuthRoute) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const config = getRateLimitConfig(path)
    const remaining = rateLimiter.getRemaining(ip, config.maxRequests)
    supabaseResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    supabaseResponse.headers.set('X-RateLimit-Remaining', remaining.toString())
  }

  return supabaseResponse
}
