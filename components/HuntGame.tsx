'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react'
import Link from 'next/link'

interface Step {
  id: string
  title: string
  description: string | null
  question: string
  answer: string
  order_index: number
  location: string | null
  radius_meters: number
}

interface Hunt {
  id: string
  title: string
  description: string | null
  status: string
}

interface HuntGameProps {
  hunt: Hunt
  steps: Step[]
  userId: string
  completedStepIds: Set<string>
}

export function HuntGame({ hunt, steps, userId, completedStepIds }: HuntGameProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [answer, setAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()

  const currentStep = steps[currentStepIndex]
  const isCompleted = currentStep && completedStepIds.has(currentStep.id)
  const isLastStep = currentStepIndex === steps.length - 1

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude])
          if (currentStep?.location) {
            calculateDistance(currentStep.location, [
              position.coords.longitude,
              position.coords.latitude,
            ])
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
        },
        { enableHighAccuracy: true }
      )
    }
  }, [currentStep])

  const calculateDistance = (locationStr: string, userPos: [number, number]) => {
    // Parse PostGIS POINT format: "POINT(lng lat)"
    const match = locationStr.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
    if (!match) return

    const [, lng, lat] = match
    const stepPos: [number, number] = [parseFloat(lng), parseFloat(lat)]

    // Haversine formula
    const R = 6371000 // Earth radius in meters
    const dLat = ((stepPos[1] - userPos[1]) * Math.PI) / 180
    const dLon = ((stepPos[0] - userPos[0]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userPos[1] * Math.PI) / 180) *
        Math.cos((stepPos[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const dist = R * c

    setDistance(dist)
  }

  const parseLocation = (locationStr: string | null): [number, number] | null => {
    if (!locationStr) return null
    const match = locationStr.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
    if (!match) return null
    return [parseFloat(match[1]), parseFloat(match[2])]
  }

  const handleSubmitAnswer = async () => {
    if (!currentStep) return

    setLoading(true)
    const userAnswer = answer.trim().toLowerCase()
    const correctAnswer = currentStep.answer.trim().toLowerCase()
    const correct = userAnswer === correctAnswer

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // Save progress
      await supabase.from('user_progress').insert({
        user_id: userId,
        hunt_id: hunt.id,
        step_id: currentStep.id,
        answer_submitted: answer,
        is_correct: true,
      })

      // Join hunt if not already joined
      await supabase.from('hunt_participants').upsert({
        hunt_id: hunt.id,
        user_id: userId,
      })
    }

    setLoading(false)
  }

  const handleNext = () => {
    if (isLastStep) {
      router.push('/dashboard')
      return
    }
    setCurrentStepIndex(currentStepIndex + 1)
    setAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setDistance(null)
  }

  const stepLocation = parseLocation(currentStep?.location || null)
  const mapCenter = stepLocation || userLocation || [2.3522, 48.8566] // Default to Paris

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: mapCenter[0],
            latitude: mapCenter[1],
            zoom: 14,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        >
          {stepLocation && (
            <Marker longitude={stepLocation[0]} latitude={stepLocation[1]}>
              <div className="relative">
                <MapPin className="text-retro-primary" size={32} />
                {distance !== null && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-retro-dark px-2 py-1 rounded text-xs retro-border whitespace-nowrap">
                    {distance < 1000
                      ? `${Math.round(distance)}m`
                      : `${(distance / 1000).toFixed(1)}km`}
                  </div>
                )}
              </div>
            </Marker>
          )}
          {userLocation && (
            <Marker longitude={userLocation[0]} latitude={userLocation[1]}>
              <div className="w-4 h-4 bg-retro-secondary rounded-full border-2 border-retro-dark animate-pulse" />
            </Marker>
          )}
        </Map>

        <div className="absolute top-4 left-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect p-4 rounded-lg retro-border"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-2xl font-bold retro-glow">{hunt.title}</h1>
                <p className="text-sm text-retro-light/80">
                  Étape {currentStepIndex + 1} / {steps.length}
                </p>
              </div>
              <Link
                href="/dashboard"
                className="px-3 py-1 border border-retro-primary rounded hover:bg-retro-primary/20 transition-colors text-sm"
              >
                Quitter
              </Link>
            </div>
            <div className="w-full bg-retro-dark rounded-full h-2 mb-2">
              <motion.div
                className="bg-retro-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {currentStep && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-10"
            >
              <div className="glass-effect p-6 rounded-t-lg retro-border">
                <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
                {currentStep.description && (
                  <p className="text-retro-light/80 mb-4">{currentStep.description}</p>
                )}

                {isCompleted ? (
                  <div className="flex items-center gap-2 text-retro-secondary mb-4">
                    <CheckCircle size={20} />
                    <span className="font-bold">Étape complétée !</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="font-medium mb-2">{currentStep.question}</p>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                        disabled={showResult}
                        className="w-full px-4 py-2 bg-retro-dark border border-retro-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-retro-primary text-retro-light"
                        placeholder="Votre réponse..."
                      />
                    </div>

                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-lg mb-4 ${
                          isCorrect
                            ? 'bg-retro-secondary/20 border border-retro-secondary'
                            : 'bg-red-500/20 border border-red-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="text-retro-secondary" size={20} />
                              <span className="font-bold text-retro-secondary">
                                Correct ! 🎉
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-400" size={20} />
                              <span className="font-bold text-red-400">
                                Incorrect, réessayez !
                              </span>
                            </>
                          )}
                        </div>
                        {isCorrect && (
                          <button
                            onClick={handleNext}
                            className="mt-2 w-full px-4 py-2 bg-retro-primary text-retro-dark font-bold rounded-lg hover:bg-retro-primary/90 transition-colors flex items-center justify-center gap-2"
                          >
                            {isLastStep ? (
                              <>
                                <Trophy size={18} />
                                Terminer le jeu
                              </>
                            ) : (
                              <>
                                Étape suivante
                                <ArrowRight size={18} />
                              </>
                            )}
                          </button>
                        )}
                      </motion.div>
                    )}

                    {!showResult && (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={loading || !answer.trim()}
                        className="w-full px-4 py-2 bg-retro-primary text-retro-dark font-bold rounded-lg hover:bg-retro-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Vérification...' : 'Valider la réponse'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
