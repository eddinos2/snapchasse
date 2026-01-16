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
        userId: session?.user?.id,
        currentPath: window.location.pathname
      })
      
      // Ne pas refresh si on est sur la page de signin/signup (la redirection va se faire)
      if (event === 'SIGNED_IN') {
        const currentPath = window.location.pathname
        if (currentPath === '/auth/signin' || currentPath === '/auth/signup') {
          console.log('🟡 [PROVIDERS] SIGNED_IN sur page auth, on laisse la redirection se faire')
          return
        }
        console.log('🟡 [PROVIDERS] Refresh de la page pour synchroniser la session')
        router.refresh()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🟡 [PROVIDERS] Refresh de la page pour synchroniser la session')
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
