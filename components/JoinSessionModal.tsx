'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { X, Users, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { useToast } from './ui/Toast'

interface JoinSessionModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function JoinSessionModal({ userId, isOpen, onClose }: JoinSessionModalProps) {
  const [sessionCode, setSessionCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()

  const handleJoin = async () => {
    if (!sessionCode.trim()) {
      setError('Veuillez entrer un code de session')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: sessionId, error: joinError } = await supabase.rpc('join_game_session', {
        session_code_param: sessionCode.trim().toUpperCase(),
        user_id_param: userId,
      })

      if (joinError) {
        if (joinError.message.includes('not found') || joinError.message.includes('full')) {
          setError('Session introuvable ou complète')
        } else {
          setError(joinError.message)
        }
        return
      }

      // Get session and hunt info
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('hunt_id, status')
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        setError('Erreur lors de la récupération de la session')
        return
      }

      addToast('Session rejointe avec succès !', 'success')
      
      // Navigate to hunt game page with session context
      router.push(`/hunt/${sessionData.hunt_id}?session=${sessionId}`)
      onClose()
    } catch (err: any) {
      console.error('Error joining session:', err)
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md"
        >
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rejoindre une session</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code de session
                </label>
                <Input
                  type="text"
                  placeholder="ABC123"
                  value={sessionCode}
                  onChange={(e) => {
                    setSessionCode(e.target.value.toUpperCase())
                    setError(null)
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-bold"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Entrez le code à 6 caractères partagé par l&apos;organisateur
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={loading || !sessionCode.trim()}
                  className="flex-1"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {loading ? 'Connexion...' : 'Rejoindre'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
