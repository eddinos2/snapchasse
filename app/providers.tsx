'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ToastProvider } from '@/components/ui/Toast'

const SupabaseContext = createContext<SupabaseClient | null>(null)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within Providers')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only refresh on token refresh to keep session in sync
      // Don't refresh on SIGNED_IN to avoid redirect loops
      if (event === 'TOKEN_REFRESHED') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <SupabaseContext.Provider value={supabase}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SupabaseContext.Provider>
  )
}
