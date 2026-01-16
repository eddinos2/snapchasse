'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { Plus, X, MapPin } from 'lucide-react'
import { z } from 'zod'
import Link from 'next/link'

const stepSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  question: z.string().min(1, 'Question requise'),
  answer: z.string().min(1, 'Réponse requise'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z.number().min(10).max(1000).default(50),
})

interface Step {
  id: string
  title: string
  description: string
  question: string
  answer: string
  latitude: number | null
  longitude: number | null
  radius_meters: number
}

export function CreateHuntForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<Step[]>([
    {
      id: '1',
      title: '',
      description: '',
      question: '',
      answer: '',
      latitude: null,
      longitude: null,
      radius_meters: 50,
    },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        question: '',
        answer: '',
        latitude: null,
        longitude: null,
        radius_meters: 50,
      },
    ])
  }

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id))
    }
  }

  const updateStep = (id: string, field: keyof Step, value: any) => {
    setSteps(
      steps.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate hunt
      if (!title.trim()) {
        throw new Error('Le titre est requis')
      }

      // Validate steps
      for (const step of steps) {
        const validation = stepSchema.safeParse({
          title: step.title,
          question: step.question,
          answer: step.answer,
          latitude: step.latitude || 0,
          longitude: step.longitude || 0,
          radius_meters: step.radius_meters,
        })
        if (!validation.success) {
          throw new Error(
            `Étape "${step.title || 'sans titre'}": ${validation.error.errors[0].message}`
          )
        }
      }

      // Create hunt
      const { data: hunt, error: huntError } = await supabase
        .from('hunts')
        .insert({
          title,
          description,
          creator_id: userId,
          status: 'draft',
        })
        .select()
        .single()

      if (huntError) throw huntError

      // Create steps - we'll insert them first, then update locations
      const stepsToInsert = steps.map((step, index) => ({
        hunt_id: hunt.id,
        title: step.title,
        description: step.description,
        question: step.question,
        answer: step.answer,
        order_index: index,
        radius_meters: step.radius_meters,
      }))

      const { data: insertedSteps, error: stepsError } = await supabase
        .from('steps')
        .insert(stepsToInsert)
        .select()

      if (stepsError) throw stepsError

      // Update steps with location using PostGIS function
      if (insertedSteps) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]
          if (step.latitude !== null && step.longitude !== null && insertedSteps[i]) {
            const { error: locationError } = await supabase.rpc('update_step_location', {
              step_id_param: insertedSteps[i].id,
              lon: step.longitude,
              lat: step.latitude,
            })
            if (locationError) {
              console.error('Location update error:', locationError)
            }
          }
        }
      }

      router.push(`/dashboard`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-block mb-8 text-retro-primary hover:underline"
        >
          ← Retour au dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8 rounded-lg retro-border"
        >
          <h1 className="text-3xl font-bold mb-6 retro-glow">Créer un jeu de piste</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium">
                Titre du jeu *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
                placeholder="Mon super jeu de piste"
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
                placeholder="Description du jeu..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Étapes / Énigmes</h2>
                <button
                  type="button"
                  onClick={addStep}
                  className="px-4 py-2 bg-retro-secondary text-retro-dark font-bold rounded-lg hover:bg-retro-secondary/90 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Ajouter une étape
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <StepForm
                    key={step.id}
                    step={step}
                    index={index}
                    onUpdate={(field, value) => updateStep(step.id, field, value)}
                    onRemove={() => removeStep(step.id)}
                    canRemove={steps.length > 1}
                  />
                ))}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-retro-primary text-retro-dark font-bold rounded-lg hover:bg-retro-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer le jeu de piste'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function StepForm({
  step,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  step: Step
  index: number
  onUpdate: (field: keyof Step, value: any) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="glass-effect p-6 rounded-lg border border-retro-secondary/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Étape {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 hover:bg-red-500/20 rounded transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Titre *</label>
          <input
            type="text"
            value={step.title}
            onChange={(e) => onUpdate('title', e.target.value)}
            required
            className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
            placeholder="Titre de l'étape"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            value={step.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
            placeholder="Description de l'étape"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Question *</label>
          <input
            type="text"
            value={step.question}
            onChange={(e) => onUpdate('question', e.target.value)}
            required
            className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
            placeholder="Quelle est la question de l'énigme ?"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Réponse *</label>
          <input
            type="text"
            value={step.answer}
            onChange={(e) => onUpdate('answer', e.target.value)}
            required
            className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
            placeholder="La réponse attendue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Latitude *</label>
            <input
              type="number"
              step="any"
              value={step.latitude || ''}
              onChange={(e) => onUpdate('latitude', parseFloat(e.target.value) || null)}
              required
              className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
              placeholder="48.8566"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Longitude *</label>
            <input
              type="number"
              step="any"
              value={step.longitude || ''}
              onChange={(e) => onUpdate('longitude', parseFloat(e.target.value) || null)}
              required
              className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
              placeholder="2.3522"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Rayon de validation (mètres)
          </label>
          <input
            type="number"
            min="10"
            max="1000"
            value={step.radius_meters}
            onChange={(e) => onUpdate('radius_meters', parseInt(e.target.value) || 50)}
            className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
          />
        </div>
      </div>
    </div>
  )
}
