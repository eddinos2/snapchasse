import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // S'assurer que les cookies sont accessibles depuis le client
              cookieStore.set(name, value, {
                ...options,
                httpOnly: false, // Permettre l'accès depuis JavaScript
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
              })
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )
}
