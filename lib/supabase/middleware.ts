import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Rate limiting check (simple implementation)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitKey = `rate_limit_${ip}`
  
  // This is a basic implementation - in production, use Redis or similar
  // For now, we'll rely on Supabase RLS and Netlify's built-in DDoS protection

  // Refresh session - important pour synchroniser les cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Log pour debug (seulement en dev)
  if (process.env.NODE_ENV === 'development') {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🟠 [MIDDLEWARE]', request.url, { 
      hasUser: !!user, 
      hasSession: !!session,
      userId: user?.id 
    })
  }

  return supabaseResponse
}
