'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import { Plus, X, ArrowLeft, MapPin, Navigation, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { huntSchema, stepSchema, validateSchema } from '@/lib/utils/validation'
import { formatError } from '@/lib/errors'
import { useToast } from '@/components/ui/Toast'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card } from './ui/Card'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import type { z } from 'zod'

type StepInput = z.infer<typeof stepSchema>

interface Step extends StepInput {
  id: string
  latitude: number | null
  longitude: number | null
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
  const { addToast } = useToast()
  
  // Geolocation hook
  const {
    coords: userCoords,
    requestPermission,
    permissionGranted,
    loading: geoLoading,
    error: geoError,
  } = useGeolocation()

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
      // Validate all steps - filter out steps with missing coordinates
      const stepsWithCoords = steps.filter(step => step.latitude !== null && step.longitude !== null)
      if (stepsWithCoords.length === 0) {
        throw new Error('Au moins une étape avec coordonnées valides est requise')
      }
      
      const stepsToValidate = stepsWithCoords.map(step => ({
        ...step,
        latitude: step.latitude!,
        longitude: step.longitude!,
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

      // Create hunt - use default creator ID for MVP
      const defaultCreatorId = '00000000-0000-0000-0000-000000000000'

      const { data: hunt, error: huntError } = await supabase
        .from('hunts')
        .insert({
          title,
          description,
          creator_id: defaultCreatorId,
          status: 'active', // Set to active by default for MVP
        })
        .select()
        .single()

      if (huntError) {
        console.error('Error creating hunt:', huntError)
        throw new Error(formatError(huntError) || 'Erreur lors de la création du jeu')
      }

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

      if (stepsError) {
        console.error('Error creating steps:', stepsError)
        throw new Error(formatError(stepsError) || 'Erreur lors de la création des étapes')
      }

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
              // Non-blocking error, continue anyway
              addToast(`Avertissement: Erreur lors de la mise à jour de l'emplacement de l'étape ${i + 1}`, 'warning')
            }
          }
        }
      }

      addToast('Jeu de piste créé avec succès !', 'success')
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
              Créer un jeu de piste
            </h1>
            <p className="text-gray-600 mb-8">
              Créez votre parcours avec des énigmes et des emplacements géolocalisés
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Étapes / Énigmes</h2>
                  <p className="text-sm text-gray-600">
                    Ajoutez des étapes avec des énigmes et des emplacements géolocalisés
                  </p>
                </div>
                <div className="flex gap-2">
                  {!permissionGranted && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        const granted = await requestPermission()
                        if (granted) {
                          addToast('Géolocalisation activée ! Vous pouvez utiliser votre position actuelle', 'success')
                        } else if (geoError) {
                          if (geoError.includes('LocationUnknown') || geoError.includes('kCLErrorLocationUnknown')) {
                            addToast('Position temporairement indisponible. Vous pouvez saisir les coordonnées manuellement', 'info')
                          } else {
                            addToast('Géolocalisation indisponible. Vous pouvez saisir les coordonnées manuellement', 'warning')
                          }
                        } else {
                          addToast('Géolocalisation refusée. Vous pouvez toujours saisir les coordonnées manuellement', 'warning')
                        }
                      }}
                      disabled={geoLoading}
                      size="md"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      {geoLoading ? 'Activation...' : 'Activer GPS'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addStep}
                    size="md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter étape
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {steps.map((step, index) => (
                  <StepForm
                    key={step.id}
                    step={step}
                    index={index}
                    userCoords={permissionGranted && userCoords ? {
                      latitude: userCoords[1],
                      longitude: userCoords[0],
                    } : null}
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
                {loading ? 'Création en cours...' : 'Créer le jeu de piste'}
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
  userCoords,
  onUpdate,
  onRemove,
  canRemove,
}: {
  step: Step
  index: number
  userCoords: { latitude: number; longitude: number } | null
  onUpdate: (field: keyof Step, value: any) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [generatingAI, setGeneratingAI] = useState(false)
  const { addToast } = useToast()

  const handleUseCurrentLocation = () => {
    if (userCoords) {
      onUpdate('latitude', userCoords.latitude)
      onUpdate('longitude', userCoords.longitude)
    }
  }
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            {(step.latitude && step.longitude) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!step.longitude || !step.latitude) return
                  setGeneratingAI(true)
                  const coords: [number, number] = [step.longitude, step.latitude]
                  try {
                    const response = await fetch('/api/ai/generate-questions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'description',
                        coords,
                        title: step.title,
                        basicDescription: step.description,
                      }),
                    })
                    const data = await response.json()
                    if (data.success && data.data) {
                      onUpdate('description', data.data)
                      addToast('Description améliorée avec succès !', 'success')
                    } else {
                      addToast(data.error || 'Erreur lors de la génération', 'error')
                    }
                  } catch (error: any) {
                    console.error('Error generating description:', error)
                    addToast('Erreur lors de la génération de la description', 'error')
                  } finally {
                    setGeneratingAI(false)
                  }
                }}
                disabled={generatingAI}
                className="text-primary-600 hover:text-primary-700"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {generatingAI ? 'Génération...' : 'Améliorer avec IA'}
              </Button>
            )}
          </div>
          <textarea
            value={step.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 input-modern resize-none"
            placeholder="Description de l'étape (optionnel)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Question de l&apos;énigme *
            </label>
            {(step.latitude && step.longitude) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!step.longitude || !step.latitude) return
                  setGeneratingAI(true)
                  const coords: [number, number] = [step.longitude, step.latitude]
                  try {
                    const response = await fetch('/api/ai/generate-questions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'question',
                        coords,
                        title: step.title,
                        description: step.description,
                      }),
                    })
                    const data = await response.json()
                    if (data.success && data.data) {
                      onUpdate('question', data.data.question)
                      onUpdate('answer', data.data.answer)
                      addToast('Question et réponse générées avec succès !', 'success')
                      // Si hints sont générés, on pourrait les stocker (à implémenter plus tard)
                    } else {
                      addToast(data.error || 'Erreur lors de la génération', 'error')
                    }
                  } catch (error: any) {
                    console.error('Error generating question:', error)
                    addToast('Erreur lors de la génération de la question', 'error')
                  } finally {
                    setGeneratingAI(false)
                  }
                }}
                disabled={generatingAI}
                className="text-primary-600 hover:text-primary-700"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {generatingAI ? 'Génération...' : 'Générer avec IA'}
              </Button>
            )}
          </div>
          <input
            type="text"
            value={step.question}
            onChange={(e) => onUpdate('question', e.target.value)}
            required
            placeholder="Quelle est la question de l'énigme ?"
            className="w-full px-4 py-3 input-modern"
          />
        </div>

        <Input
          label="Réponse attendue"
          type="text"
          value={step.answer}
          onChange={(e) => onUpdate('answer', e.target.value)}
          required
          placeholder="La réponse attendue (non sensible à la casse)"
        />

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              <label className="text-sm font-semibold text-gray-700">Emplacement géographique</label>
            </div>
            {userCoords && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUseCurrentLocation}
                className="text-primary-600 hover:text-primary-700"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Utiliser ma position
              </Button>
            )}
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
