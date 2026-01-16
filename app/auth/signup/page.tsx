'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const validation = signUpSchema.safeParse({ email, password, confirmPassword })
      if (!validation.success) {
        setError(validation.error.errors[0].message)
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Vérifier que la session est bien créée (même si email confirmation est requise)
      if (data.session) {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 200)
        } else {
          setError('Veuillez vérifier votre email pour confirmer votre compte')
        }
      } else {
        setError('Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail.')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
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
          <h1 className="text-3xl font-bold mb-6 text-center retro-glow">Inscription</h1>
          
          <form onSubmit={handleSignUp} className="space-y-4">
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

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              className="w-full px-4 py-2 bg-retro-secondary text-retro-dark font-bold rounded-lg hover:bg-retro-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-retro-light/80">
            Déjà un compte ?{' '}
            <Link href="/auth/signin" className="text-retro-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
