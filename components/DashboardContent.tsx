'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import type { User } from '@supabase/supabase-js'
import { LogOut, Plus, MapPin, Trophy, Settings } from 'lucide-react'
import Link from 'next/link'

interface DashboardContentProps {
  user: User
  role: string
}

export function DashboardContent({ user, role }: DashboardContentProps) {
  const [hunts, setHunts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()
  const router = useRouter()

  useEffect(() => {
    loadHunts()
  }, [])

  const loadHunts = async () => {
    try {
      const { data, error } = await supabase
        .from('hunts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setHunts(data || [])
    } catch (err) {
      console.error('Error loading hunts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 retro-glow">Dashboard</h1>
            <p className="text-retro-light/80">Bienvenue, {user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-2 px-3 py-1 bg-retro-primary text-retro-dark text-sm font-bold rounded">
                Administrateur
              </span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 md:mt-0 px-4 py-2 border border-retro-primary rounded-lg hover:bg-retro-primary/20 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </motion.div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-retro-primary text-retro-dark font-bold rounded-lg hover:bg-retro-primary/90 transition-all retro-border hover:scale-105"
            >
              <Plus size={20} />
              Créer un nouveau jeu de piste
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Chargement...</div>
          ) : hunts.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-effect rounded-lg">
              <p className="text-retro-light/80 mb-4">Aucun jeu de piste disponible</p>
              {isAdmin && (
                <Link
                  href="/dashboard/create"
                  className="text-retro-primary hover:underline"
                >
                  Créer le premier jeu
                </Link>
              )}
            </div>
          ) : (
            hunts.map((hunt, index) => (
              <HuntCard key={hunt.id} hunt={hunt} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function HuntCard({ hunt, index }: { hunt: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-effect p-6 rounded-lg retro-border hover:scale-105 transition-transform cursor-pointer"
    >
      <h3 className="text-xl font-bold mb-2">{hunt.title}</h3>
      <p className="text-retro-light/80 text-sm mb-4 line-clamp-2">
        {hunt.description}
      </p>
      <div className="flex items-center gap-4 text-sm text-retro-light/60">
        <span className="flex items-center gap-1">
          <MapPin size={16} />
          {hunt.steps_count || 0} étapes
        </span>
        {hunt.status === 'active' && (
          <span className="px-2 py-1 bg-retro-secondary text-retro-dark text-xs font-bold rounded">
            Actif
          </span>
        )}
      </div>
      <Link
        href={`/hunt/${hunt.id}`}
        className="mt-4 inline-block w-full text-center px-4 py-2 bg-retro-primary text-retro-dark font-bold rounded hover:bg-retro-primary/90 transition-colors"
      >
        {hunt.status === 'active' ? 'Jouer' : 'Voir les détails'}
      </Link>
    </motion.div>
  )
}
