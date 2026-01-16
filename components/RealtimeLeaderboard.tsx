'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { Trophy, Medal, Users, Clock } from 'lucide-react'
import { Card } from './ui/Card'

interface LeaderboardEntry {
  user_id: string
  email: string | null
  score: number
  total_time: number
  steps_completed: number
  rank: number
}

interface RealtimeLeaderboardProps {
  sessionId: string
  currentUserId?: string
}

export function RealtimeLeaderboard({ sessionId, currentUserId }: RealtimeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    loadLeaderboard()

    // Subscribe to realtime updates for session participants
    const channel = supabase
      .channel(`session-leaderboard-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Leaderboard update:', payload)
          loadLeaderboard() // Reload on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, supabase])

  const loadLeaderboard = async () => {
    try {
      // Get participants with profile email
      const { data: participants, error: participantsError } = await supabase
        .from('session_participants')
        .select('user_id, score, total_time, steps_completed')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('score', { ascending: false })
        .order('total_time', { ascending: true })

      if (participantsError) throw participantsError

      // Get profiles for emails
      const userIds = (participants || []).map(p => p.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds)

      if (profilesError) throw profilesError

      const profileMap = new Map((profiles || []).map(p => [p.id, p.email]))

      const formatted = (participants || []).map((entry: any, index: number) => ({
        user_id: entry.user_id,
        email: profileMap.get(entry.user_id) || 'Joueur anonyme',
        score: entry.score || 0,
        total_time: entry.total_time || 0,
        steps_completed: entry.steps_completed || 0,
        rank: index + 1,
      }))

      setLeaderboard(formatted)
    } catch (err) {
      console.error('Error loading leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading && leaderboard.length === 0) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-gray-900">Classement</h3>
        </div>
        <div className="text-center py-4 text-gray-500">Chargement...</div>
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-gray-900">Classement</h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          Aucun participant pour le moment
        </div>
      </Card>
    )
  }

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-bold text-gray-900">Classement en temps réel</h3>
        <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          En direct
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUserId
            return (
              <motion.div
                key={entry.user_id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrentUser
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 w-8 text-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${
                    isCurrentUser ? 'text-primary-700' : 'text-gray-900'
                  }`}>
                    {entry.email || 'Joueur anonyme'}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-primary-600">(Vous)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(entry.total_time)}
                    </span>
                    <span>{entry.steps_completed} étapes</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className={`text-right ${
                    entry.rank <= 3 ? 'text-primary-600' : 'text-gray-700'
                  }`}>
                    <p className="text-lg font-bold">{entry.score}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Card>
  )
}
