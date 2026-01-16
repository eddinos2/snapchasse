'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import type { User } from '@supabase/supabase-js'
import { Plus, MapPin, Clock, ArrowRight, Search, Filter, Share2, Edit, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Skeleton } from './ui/Skeleton'
import { Input } from './ui/Input'
import { useToast } from './ui/Toast'
import { generateShareUrl, copyToClipboard } from '@/lib/utils/share'
import { CreateSessionModal } from './CreateSessionModal'
import { JoinSessionModal } from './JoinSessionModal'
import { Users } from 'lucide-react'

interface DashboardContentProps {
  user: User
  role: string
}

export function DashboardContent({ user, role }: DashboardContentProps) {
  const [hunts, setHunts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [createSessionHuntId, setCreateSessionHuntId] = useState<string | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()

  useEffect(() => {
    loadHunts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadHunts = async () => {
    try {
      const { data, error } = await supabase
        .from('hunts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        // If table doesn't exist, show empty state
        if (error.code === 'PGRST205') {
          console.warn('Table hunts does not exist yet. Please run migrations in Supabase.')
          setHunts([])
          return
        }
        throw error
      }
      setHunts(data || [])
    } catch (err) {
      console.error('Error loading hunts:', err)
      // Don't crash if table doesn't exist
      setHunts([])
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = role === 'admin'
  const filteredHunts = hunts.filter(hunt =>
    hunt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hunt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-h1 font-extrabold mb-3 text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Explorez et créez des jeux de piste
              </p>
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                Mode démo • Accès libre
              </span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="md">
                ← Accueil
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 input-modern"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowJoinModal(true)}
                className="w-full md:w-auto"
              >
                <Users className="w-5 h-5 mr-2" />
                Rejoindre une session
              </Button>
              {isAdmin && (
                <Link href="/dashboard/create">
                  <Button variant="primary" size="lg" className="w-full md:w-auto">
                    <Plus className="w-5 h-5 mr-2" />
                    Créer un jeu
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton variant="text" lines={3} />
                <Skeleton variant="rectangular" className="h-32 mt-4 rounded-xl" />
              </Card>
            ))
          ) : filteredHunts.length === 0 ? (
            <div className="col-span-full">
              <Card variant="elevated" className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'Aucun résultat' : 'Aucun jeu disponible'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Essayez avec d\'autres mots-clés'
                    : isAdmin
                    ? 'Créez votre premier jeu de piste pour commencer'
                    : 'Les jeux seront bientôt disponibles'}
                </p>
                {isAdmin && !searchQuery && (
                  <Link href="/dashboard/create">
                    <Button variant="primary">
                      <Plus className="w-5 h-5 mr-2" />
                      Créer le premier jeu
                    </Button>
                  </Link>
                )}
              </Card>
            </div>
          ) : (
            filteredHunts.map((hunt, index) => (
              <HuntCard 
                key={hunt.id} 
                hunt={hunt} 
                index={index}
                onCreateSession={() => setCreateSessionHuntId(hunt.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {createSessionHuntId && (
        <CreateSessionModal
          huntId={createSessionHuntId}
          userId={user.id}
          isOpen={!!createSessionHuntId}
          onClose={() => setCreateSessionHuntId(null)}
          onSessionCreated={(sessionId, sessionCode) => {
            router.push(`/hunt/${createSessionHuntId}?session=${sessionId}`)
          }}
        />
      )}

      <JoinSessionModal
        userId={user.id}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  )
}

function HuntCard({ hunt, index, onCreateSession }: { hunt: any; index: number; onCreateSession?: () => void }) {
  const { addToast } = useToast()
  
  const statusColors = {
    active: 'bg-accent-100 text-accent-700 border-accent-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
    archived: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const statusLabels = {
    active: 'Actif',
    draft: 'Brouillon',
    completed: 'Terminé',
    archived: 'Archivé',
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const shareUrl = generateShareUrl(hunt.id, hunt.share_token)
    const success = await copyToClipboard(shareUrl)
    if (success) {
      addToast('Lien copié dans le presse-papiers !', 'success')
    } else {
      addToast('Erreur lors de la copie du lien', 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <Card variant="elevated" interactive className="p-6 h-full flex flex-col group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
              {hunt.title || 'Sans titre'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {hunt.description || 'Aucune description'}
            </p>
          </div>
          {hunt.status && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[hunt.status as keyof typeof statusColors] || statusColors.draft}`}
            >
              {statusLabels[hunt.status as keyof typeof statusLabels] || hunt.status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 mt-auto">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>Étapes</span>
          </div>
          {hunt.created_at && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(hunt.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/hunt/${hunt.id}`} className="flex-1">
            <Button variant="primary" className="w-full">
              {hunt.status === 'active' ? 'Jouer maintenant' : 'Voir les détails'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          {hunt.status === 'active' && onCreateSession && (
            <Button
              variant="secondary"
              size="md"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCreateSession()
              }}
              className="flex-shrink-0"
              title="Créer une session multi-joueur"
            >
              <Users className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="md"
            onClick={handleShare}
            className="flex-shrink-0"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Link href={`/hunt/${hunt.id}/edit`}>
            <Button
              variant="ghost"
              size="md"
              className="flex-shrink-0"
              title="Éditer"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
