'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { X, Users, Gamepad2, Trophy, Copy, Check } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { useToast } from './ui/Toast'
import { copyToClipboard } from '@/lib/utils/share'

interface CreateSessionModalProps {
  huntId: string
  userId: string
  isOpen: boolean
  onClose: () => void
  onSessionCreated: (sessionId: string, sessionCode: string) => void
}

export function CreateSessionModal({
  huntId,
  userId,
  isOpen,
  onClose,
  onSessionCreated,
}: CreateSessionModalProps) {
  const [sessionType, setSessionType] = useState<'multiplayer' | 'competitive'>('multiplayer')
  const [maxPlayers, setMaxPlayers] = useState(50)
  const [loading, setLoading] = useState(false)
  const [sessionCode, setSessionCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = useSupabase()
  const { addToast } = useToast()

  const handleCreate = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('create_game_session', {
        hunt_id_param: huntId,
        organizer_id_param: userId,
        session_type_param: sessionType,
        max_players_param: maxPlayers,
      })

      if (error) throw error

      // Get session code
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('session_code')
        .eq('id', data)
        .single()

      if (sessionData) {
        setSessionCode(sessionData.session_code)
        onSessionCreated(data, sessionData.session_code)
        addToast('Session créée avec succès !', 'success')
      }
    } catch (err: any) {
      console.error('Error creating session:', err)
      addToast(`Erreur: ${err.message || 'Impossible de créer la session'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (sessionCode) {
      const success = await copyToClipboard(sessionCode)
      if (success) {
        setCopied(true)
        addToast('Code de session copié !', 'success')
        setTimeout(() => setCopied(false), 2000)
      }
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
              <h2 className="text-2xl font-bold text-gray-900">Créer une session</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {sessionCode ? (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4"
                >
                  <Check className="w-8 h-8 text-accent-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Session créée !</h3>
                <p className="text-gray-600 mb-6">Partagez ce code pour inviter des joueurs :</p>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border-2 border-primary-500">
                    <p className="text-3xl font-bold text-primary-600 tracking-widest text-center">
                      {sessionCode}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleCopyCode}
                    className="px-4"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-accent-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      onSessionCreated(huntId, sessionCode)
                      onClose()
                    }}
                    className="flex-1"
                  >
                    Démarrer la partie
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de session
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSessionType('multiplayer')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          sessionType === 'multiplayer'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Users className={`w-6 h-6 mx-auto mb-2 ${
                          sessionType === 'multiplayer' ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold text-sm ${
                          sessionType === 'multiplayer' ? 'text-primary-700' : 'text-gray-600'
                        }`}>
                          Multi-joueur
                        </p>
                      </button>
                      <button
                        onClick={() => setSessionType('competitive')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          sessionType === 'competitive'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Trophy className={`w-6 h-6 mx-auto mb-2 ${
                          sessionType === 'competitive' ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold text-sm ${
                          sessionType === 'competitive' ? 'text-primary-700' : 'text-gray-600'
                        }`}>
                          Compétitif
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre maximum de joueurs
                    </label>
                    <Input
                      type="number"
                      min="2"
                      max="100"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    {loading ? 'Création...' : 'Créer la session'}
                  </Button>
                  <Button variant="ghost" onClick={onClose} disabled={loading}>
                    Annuler
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
