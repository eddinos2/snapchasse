'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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

      log('🔵 [SIGNIN] Appel API signin...')
      // Utiliser l'API route pour gérer la connexion côté serveur
      // Cela garantit que les cookies sont correctement synchronisés
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      log('🔵 [SIGNIN] Réponse API:', { 
        status: response.status,
        hasUser: !!result.user,
        hasError: !!result.error,
        error: result.error
      })

      if (!response.ok) {
        log('❌ [SIGNIN] Erreur lors de la connexion:', result.error)
        throw new Error(result.error || 'Erreur de connexion')
      }

      log('✅ [SIGNIN] Connexion réussie via API')
      log('🔵 [SIGNIN] Redirection vers /dashboard')
      
      // Attendre un peu pour que les cookies soient bien synchronisés
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Utiliser un rechargement complet pour synchroniser la session
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
