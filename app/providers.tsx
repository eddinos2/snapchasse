'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

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
    console.log('🟡 [PROVIDERS] Initialisation du listener auth')
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🟡 [PROVIDERS] Auth state change:', { 
        event, 
        hasSession: !!session,
        userId: session?.user?.id 
      })
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🟡 [PROVIDERS] Refresh de la page pour synchroniser la session')
        // Refresh the page to update server-side session
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}
