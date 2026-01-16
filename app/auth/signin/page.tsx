'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Sauvegarder les logs dans localStorage pour qu'ils persistent
    const log = (message: string, data?: any) => {
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`
      console.log(logEntry)
      const existingLogs = localStorage.getItem('auth_debug_logs') || '[]'
      const logs = JSON.parse(existingLogs)
      logs.push(logEntry)
      localStorage.setItem('auth_debug_logs', JSON.stringify(logs.slice(-50))) // Garder les 50 derniers
    }

    log('🔵 [SIGNIN] Début de la connexion')
    log('🔵 [SIGNIN] Email:', email)

    try {
      const validation = signInSchema.safeParse({ email, password })
      if (!validation.success) {
        log('❌ [SIGNIN] Erreur de validation:', validation.error.errors[0].message)
        setError(validation.error.errors[0].message)
        setLoading(false)
        return
      }

      log('🔵 [SIGNIN] Appel signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      log('🔵 [SIGNIN] Réponse signInWithPassword:', { 
        hasData: !!data, 
        hasError: !!error,
        error: error?.message 
      })

      if (error) {
        log('❌ [SIGNIN] Erreur lors de la connexion:', error.message)
        throw error
      }

      log('🔵 [SIGNIN] Vérification de la session...')
      // Vérifier que la session est bien créée
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      log('🔵 [SIGNIN] Session:', { 
        hasSession: !!session, 
        sessionError: sessionError?.message,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      })
      
      if (!session) {
        log('❌ [SIGNIN] Aucune session trouvée')
        throw new Error('La session n\'a pas pu être créée')
      }
      
      log('✅ [SIGNIN] Session créée avec succès')
      log('🔵 [SIGNIN] Attente 500ms pour laisser les cookies se synchroniser...')
      
      // Attendre un peu pour que les cookies soient bien écrits
      await new Promise(resolve => setTimeout(resolve, 500))
      
      log('🔵 [SIGNIN] Redirection vers /dashboard')
      // Forcer un rechargement complet pour synchroniser la session serveur
      window.location.href = '/dashboard'
    } catch (err: any) {
      log('❌ [SIGNIN] Erreur catch:', err.message)
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect p-8 rounded-lg retro-border">
          <h1 className="text-3xl font-bold mb-6 text-center retro-glow">Connexion</h1>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-retro-primary text-retro-dark font-bold rounded-lg hover:bg-retro-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-retro-light/80">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-retro-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
