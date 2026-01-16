'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'

export default function TestAuthPage() {
  const supabase = useSupabase()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🧪 [TEST] Vérification de l\'auth...')
      
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      console.log('🧪 [TEST] Session:', currentSession)
      setSession(currentSession)

      if (currentSession) {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        console.log('🧪 [TEST] User:', currentUser)
        setUser(currentUser)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-effect p-6 rounded-lg retro-border">
          <h1 className="text-2xl font-bold mb-4">Test d'authentification</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-bold mb-2">Session:</h2>
              <pre className="bg-retro-dark p-4 rounded text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="font-bold mb-2">User:</h2>
              <pre className="bg-retro-dark p-4 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            {user && (
              <div>
                <p className="mb-4">✅ Vous êtes connecté en tant que: {user.email}</p>
                <button
                  onClick={() => {
                    // Forcer un rechargement complet pour synchroniser les cookies
                    window.location.href = '/dashboard'
                  }}
                  className="px-4 py-2 bg-retro-primary text-retro-dark font-bold rounded-lg mr-2"
                >
                  Aller au Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg"
                >
                  Déconnexion
                </button>
              </div>
            )}

            {!user && (
              <div>
                <p className="mb-4">❌ Vous n'êtes pas connecté</p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-4 py-2 bg-retro-primary text-retro-dark font-bold rounded-lg"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
