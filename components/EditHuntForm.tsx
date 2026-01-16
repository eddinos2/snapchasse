'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { Plus, X, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import { huntSchema, stepSchema, validateSchema } from '@/lib/utils/validation'
import { formatError } from '@/lib/errors'
import { useToast } from '@/components/ui/Toast'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card } from './ui/Card'
import type { z } from 'zod'

type StepInput = z.infer<typeof stepSchema>

interface Step extends StepInput {
  id: string
  latitude: number | null
  longitude: number | null
}

interface EditHuntFormProps {
  hunt: any
  initialSteps: any[]
  userId: string
}

export function EditHuntForm({ hunt, initialSteps, userId }: EditHuntFormProps) {
  const [title, setTitle] = useState(hunt.title || '')
  const [description, setDescription] = useState(hunt.description || '')
  const [steps, setSteps] = useState<Step[]>(() =>
    initialSteps.map(step => ({
      id: step.id,
      title: step.title || '',
      description: step.description || '',
      question: step.question || '',
      answer: step.answer || '',
      latitude: null,
      longitude: null,
      radius_meters: step.radius_meters || 50,
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()

  // Parse locations from PostGIS format
  useEffect(() => {
    const parseLocations = async () => {
      const parsedSteps = await Promise.all(
        initialSteps.map(async (step) => {
          if (step.location) {
            try {
              // PostGIS returns location as a string like "POINT(lon lat)"
              const match = step.location.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
              if (match) {
                return {
                  ...step,
                  longitude: parseFloat(match[1]),
                  latitude: parseFloat(match[2]),
                }
              }
            } catch (e) {
              console.error('Error parsing location:', e)
            }
          }
          return { ...step, longitude: null, latitude: null }
        })
      )
      
      setSteps(parsedSteps.map(step => ({
        id: step.id,
        title: step.title || '',
        description: step.description || '',
        question: step.question || '',
        answer: step.answer || '',
        latitude: step.latitude || null,
        longitude: step.longitude || null,
        radius_meters: step.radius_meters || 50,
      })))
    }
    
    parseLocations()
  }, [])

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
      // Validate all steps
      const stepsToValidate = steps.map(step => ({
        ...step,
        latitude: step.latitude ?? 0,
        longitude: step.longitude ?? 0,
      }))

      for (const step of stepsToValidate) {
        const validation = validateSchema(stepSchema, step)
        if (!validation.success) {
          throw new Error(
            `Étape "${step.title || 'sans titre'}": ${validation.error}`
          )
        }
      }

      // Validate hunt
      const huntValidation = validateSchema(huntSchema, { title, description })
      if (!huntValidation.success) {
        throw new Error(huntValidation.error)
      }

      // Update hunt
      const { error: huntError } = await supabase
        .from('hunts')
        .update({
          title,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hunt.id)

      if (huntError) throw huntError

      // Delete old steps
      const { error: deleteError } = await supabase
        .from('steps')
        .delete()
        .eq('hunt_id', hunt.id)

      if (deleteError) throw deleteError

      // Insert new steps
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

      // Update step locations
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

      addToast('Jeu de piste mis à jour avec succès !', 'success')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = formatError(err)
      setError(errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" className="p-8 md:p-10">
            <h1 className="text-3xl md:text-h2 font-extrabold mb-2 gradient-text">
              Éditer le jeu de piste
            </h1>
            <p className="text-gray-600 mb-8">
              Modifiez votre parcours et vos énigmes
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                id="title"
                label="Titre du jeu"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Mon super jeu de piste"
              />

              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 input-modern resize-none"
                  placeholder="Décrivez votre jeu de piste, son thème et son parcours..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Étapes / Énigmes</h2>
                    <p className="text-sm text-gray-600">
                      Modifiez les étapes existantes ou ajoutez-en de nouvelles
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addStep}
                    size="md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-6">
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

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full sm:w-auto sm:ml-auto"
                >
                  {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </Button>
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
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
    <Card variant="default" className="p-6 border-2 border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <h3 className="text-lg font-bold text-gray-900">Étape {index + 1}</h3>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-5">
        <Input
          label="Titre de l'étape"
          type="text"
          value={step.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          required
          placeholder="Titre de l'étape"
        />

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={step.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 input-modern resize-none"
            placeholder="Description de l'étape (optionnel)"
          />
        </div>

        <Input
          label="Question de l'énigme"
          type="text"
          value={step.question}
          onChange={(e) => onUpdate('question', e.target.value)}
          required
          placeholder="Quelle est la question de l'énigme ?"
        />

        <Input
          label="Réponse attendue"
          type="text"
          value={step.answer}
          onChange={(e) => onUpdate('answer', e.target.value)}
          required
          placeholder="La réponse attendue (non sensible à la casse)"
        />

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary-500" />
            <label className="text-sm font-semibold text-gray-700">Emplacement géographique</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={step.latitude || ''}
              onChange={(e) => onUpdate('latitude', parseFloat(e.target.value) || null)}
              required
              placeholder="48.8566"
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={step.longitude || ''}
              onChange={(e) => onUpdate('longitude', parseFloat(e.target.value) || null)}
              required
              placeholder="2.3522"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Rayon de validation (mètres)
          </label>
          <input
            type="number"
            min="10"
            max="1000"
            value={step.radius_meters}
            onChange={(e) => onUpdate('radius_meters', parseInt(e.target.value) || 50)}
            className="w-full px-4 py-3 input-modern"
          />
          <p className="mt-1 text-xs text-gray-500">
            Distance maximale (en mètres) pour valider l&apos;emplacement
          </p>
        </div>
      </div>
    </Card>
  )
}
