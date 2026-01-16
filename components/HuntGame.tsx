'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/app/providers'
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, CheckCircle, XCircle, ArrowRight, Trophy, Home, Award, Navigation, Target, Lightbulb, Clock } from 'lucide-react'
import Link from 'next/link'
import { parsePostGISPoint, calculateDistance, formatDistance } from '@/lib/utils/geolocation'
import { formatError } from '@/lib/errors'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { useToast } from '@/components/ui/Toast'
import { calculateScore } from '@/lib/utils/scoring'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Confetti } from './ui/Confetti'
import { ProximityIndicator } from './ui/ProximityIndicator'
import { RealtimeLeaderboard } from './RealtimeLeaderboard'

interface Step {
  id: string
  title: string
  description: string | null
  question: string
  answer: string
  order_index: number
  location: string | null
  radius_meters: number
  hint_1?: string | null
  hint_2?: string | null
  hint_3?: string | null
  hint_cost?: number | null
  options?: { options: string[]; correct: number } | null
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
  sessionId?: string
}

export function HuntGame({ hunt, steps, userId, completedStepIds, sessionId }: HuntGameProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())
  const [totalScore, setTotalScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hintsUsed, setHintsUsed] = useState<number[]>([]) // Track which hints (1, 2, 3) have been used
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null) // For multiple choice
  const [elapsedTime, setElapsedTime] = useState(0) // Time in seconds for current step
  const supabase = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()

  // Use geolocation hook with watch enabled
  const {
    coords: userLocation,
    requestPermission,
    permissionGranted,
    loading: geoLoading,
    error: geoError,
  } = useGeolocation({ watch: true, enableHighAccuracy: false })

  // Request permission on mount
  useEffect(() => {
    if (!permissionGranted && !geoLoading) {
      requestPermission()
    }
  }, [])

  const currentStep = steps[currentStepIndex]
  const isCompleted = currentStep && completedStepIds.has(currentStep.id)
  const isLastStep = currentStepIndex === steps.length - 1

  // Calculate distance when user location or step changes
  useEffect(() => {
    if (userLocation && currentStep?.location) {
      const stepLocation = parsePostGISPoint(currentStep.location)
      if (stepLocation) {
        const dist = calculateDistance(stepLocation, userLocation)
        setDistance(dist)
      }
    }
  }, [userLocation, currentStep])

  const handleSubmitAnswer = async () => {
    if (!currentStep) return

    setLoading(true)
    
    // Check if multiple choice or text answer
    let correct = false
    if (currentStep.options && selectedChoice !== null) {
      // Multiple choice
      correct = selectedChoice === currentStep.options.correct
    } else {
      // Text answer
      const userAnswer = answer.trim().toLowerCase()
      const correctAnswer = currentStep.answer.trim().toLowerCase()
      correct = userAnswer === correctAnswer
    }

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      const timeInSeconds = Math.floor((Date.now() - stepStartTime) / 1000)
      // Bonus vitesse : multiplier par 1.5 si résolu en moins de 2 minutes (120s)
      const speedBonus = timeInSeconds < 120 ? 1.5 : 1
      const baseScore = calculateScore(100, timeInSeconds)
      const finalScore = Math.floor(baseScore.totalScore * speedBonus)
      const newTotalScore = totalScore + finalScore
      setTotalScore(newTotalScore)

      // Save progress with completion time
      await supabase.from('user_progress').insert({
        user_id: userId,
        hunt_id: hunt.id,
        step_id: currentStep.id,
        answer_submitted: currentStep.options ? `Option ${selectedChoice}` : answer,
        is_correct: true,
        completed_time: timeInSeconds,
      })

      // Join hunt if not already joined, update score and time
      await supabase.from('hunt_participants').upsert({
        hunt_id: hunt.id,
        user_id: userId,
        score: newTotalScore,
      }, {
        onConflict: 'hunt_id,user_id',
        ignoreDuplicates: false,
      })

      // Update session participant if in a multiplayer session (realtime sync)
      if (sessionId) {
        // Calculate steps completed
        const stepsCompleted = completedStepIds.size + 1 // +1 for current step
        
        // Update or insert session participant
        const { data: existingParticipant } = await supabase
          .from('session_participants')
          .select('steps_completed, total_time, score')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .single()

        const currentTotalTime = (existingParticipant?.total_time || 0) + timeInSeconds
        const currentStepsCompleted = Math.max(existingParticipant?.steps_completed || 0, stepsCompleted)

        const { error: sessionError } = await supabase.from('session_participants').upsert({
          session_id: sessionId,
          user_id: userId,
          score: newTotalScore,
          total_time: currentTotalTime,
          steps_completed: currentStepsCompleted,
          is_active: true,
        }, {
          onConflict: 'session_id,user_id',
          ignoreDuplicates: false,
        })

        if (sessionError) {
          console.error('Error updating session participant:', sessionError)
          // Non-blocking, continue
        }
      }

      const bonusMsg = speedBonus > 1 ? ` +${Math.floor((baseScore.totalScore * speedBonus) - baseScore.totalScore)} bonus vitesse` : ''
      addToast(`Correct ! +${finalScore} points${bonusMsg}`, 'success')
      // Trigger confetti for correct answer
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
    } else {
      addToast('Réponse incorrecte, réessayez !', 'error')
    }

    setLoading(false)
  }

  const handleNext = () => {
    if (isLastStep) {
      addToast('Félicitations ! Vous avez terminé le jeu !', 'success')
      // Big confetti for completion
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      return
    }
    setCurrentStepIndex(currentStepIndex + 1)
    setAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setDistance(null)
    setStepStartTime(Date.now())
  }

  // Reset step start time when step changes
  useEffect(() => {
    setStepStartTime(Date.now())
    setHintsUsed([])
    setSelectedChoice(null)
    setElapsedTime(0)
  }, [currentStepIndex])

  // Timer for current step
  useEffect(() => {
    if (isCompleted) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - stepStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [stepStartTime, isCompleted])

  const handleRequestHint = (hintLevel: 1 | 2 | 3) => {
    if (!currentStep || hintsUsed.includes(hintLevel)) return

    const hintText = hintLevel === 1 ? currentStep.hint_1 : hintLevel === 2 ? currentStep.hint_2 : currentStep.hint_3
    const hintCost = currentStep.hint_cost || 10

    if (!hintText) {
      addToast('Aucun indice disponible pour ce niveau', 'info')
      return
    }

    setHintsUsed([...hintsUsed, hintLevel])
    setTotalScore(Math.max(0, totalScore - hintCost))
    addToast(`Indice ${hintLevel} : ${hintText} (-${hintCost} points)`, 'info')
  }

  const stepLocation = parsePostGISPoint(currentStep?.location || null)
  const mapCenter = stepLocation || userLocation || [2.3522, 48.8566] // Default to Paris

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      <Confetti trigger={showConfetti} duration={3000} />
      {/* Proximity feedback indicator - Like AirPods location finding */}
      {!isCompleted && distance !== null && currentStep && (
        <ProximityIndicator 
          distance={distance} 
          radius={currentStep.radius_meters}
          enabled={permissionGranted && !geoLoading}
        />
      )}
      <div className="flex-1 relative">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: mapCenter[0],
            latitude: mapCenter[1],
            zoom: 14,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/light-v11"
        >
          {stepLocation && (
            <Marker longitude={stepLocation[0]} latitude={stepLocation[1]}>
              <div className="relative">
                <div className="bg-primary-500 rounded-full p-2 shadow-lg">
                  <MapPin className="text-white" size={24} />
                </div>
                {distance !== null && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg shadow-medium text-xs font-semibold text-gray-900 whitespace-nowrap border border-gray-200">
                    {formatDistance(distance)}
                  </div>
                )}
              </div>
            </Marker>
          )}
          {userLocation && (
            <Marker longitude={userLocation[0]} latitude={userLocation[1]}>
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-6 h-6 bg-accent-500 rounded-full border-4 border-white shadow-lg" />
                <motion.div
                  className="absolute inset-0 w-6 h-6 bg-accent-500 rounded-full opacity-30"
                  animate={{
                    scale: [1, 2, 2],
                    opacity: [0.3, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              </motion.div>
            </Marker>
          )}
          {!permissionGranted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-24 left-4 right-4 z-20"
            >
              <Card variant="elevated" className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900">
                      Géolocalisation requise
                    </p>
                    <p className="text-xs text-yellow-700">
                      Activez votre GPS pour suivre votre position
                    </p>
                  </div>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={requestPermission}
                    disabled={geoLoading}
                  >
                    {geoLoading ? 'Activation...' : 'Activer'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </Map>

        <div className="absolute top-4 left-4 right-4 z-10 flex gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <Card variant="elevated" className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    {hunt.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Étape {currentStepIndex + 1} / {steps.length}</span>
                    {!isCompleted && (
                      <div className="flex items-center gap-1 text-primary-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {totalScore > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
                      <Award className="w-4 h-4" />
                      {totalScore}
                    </div>
                  )}
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <Home className="w-4 h-4 mr-1" />
                      Quitter
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </Card>
          </motion.div>
          
          {/* Realtime Leaderboard for multiplayer sessions */}
          {sessionId && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <RealtimeLeaderboard sessionId={sessionId} currentUserId={userId} />
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute bottom-0 left-0 right-0 z-10"
            >
              <Card variant="elevated" className="p-6 md:p-8 rounded-t-3xl border-t-4 border-primary-500">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {currentStep.title}
                  </h2>
                  {currentStep.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {currentStep.description}
                    </p>
                  )}
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-3 text-accent-600 mb-6 p-4 bg-accent-50 rounded-xl border-2 border-accent-200">
                    <CheckCircle size={24} className="flex-shrink-0" />
                    <span className="font-semibold text-lg">Étape complétée !</span>
                  </div>
                ) : (
                  <>
                    {/* Instructions du jeu */}
                    <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 mb-2">Comment jouer cette étape :</p>
                          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Suivez l&apos;indicateur de proximité (en bas à droite) pour vous approcher de l&apos;emplacement</li>
                            <li>Plus vous vous approchez, plus les bips deviennent fréquents (comme les AirPods)</li>
                            <li>Lisez l&apos;énigme ci-dessous et répondez à la question</li>
                            <li>Plus vous répondez vite, plus vous gagnez de points !</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 text-lg">
                        {currentStep.question}
                      </label>

                      {/* Multiple choice or text input */}
                      {currentStep.options && currentStep.options.options ? (
                        <div className="space-y-3">
                          {currentStep.options.options.map((option, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedChoice(index)}
                              disabled={showResult || loading}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                selectedChoice === index
                                  ? 'border-primary-500 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
                              } ${showResult || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedChoice === index
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedChoice === index && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className="font-medium">{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !loading && answer.trim() && handleSubmitAnswer()}
                          disabled={showResult || loading}
                          className="w-full px-4 py-3 input-modern text-lg"
                          placeholder="Tapez votre réponse..."
                        />
                      )}

                      {/* Hints button */}
                      {(currentStep.hint_1 || currentStep.hint_2 || currentStep.hint_3) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {currentStep.hint_1 && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRequestHint(1)}
                              disabled={hintsUsed.includes(1) || showResult || loading}
                              className="text-sm"
                            >
                              <Lightbulb className="w-4 h-4 mr-1" />
                              Indice 1 {hintsUsed.includes(1) ? '(utilisé)' : `(-${currentStep.hint_cost || 10} pts)`}
                            </Button>
                          )}
                          {currentStep.hint_2 && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRequestHint(2)}
                              disabled={hintsUsed.includes(2) || showResult || loading || !hintsUsed.includes(1)}
                              className="text-sm"
                            >
                              <Lightbulb className="w-4 h-4 mr-1" />
                              Indice 2 {hintsUsed.includes(2) ? '(utilisé)' : `(-${currentStep.hint_cost || 10} pts)`}
                            </Button>
                          )}
                          {currentStep.hint_3 && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRequestHint(3)}
                              disabled={hintsUsed.includes(3) || showResult || loading || !hintsUsed.includes(2)}
                              className="text-sm"
                            >
                              <Lightbulb className="w-4 h-4 mr-1" />
                              Indice 3 {hintsUsed.includes(3) ? '(utilisé)' : `(-${currentStep.hint_cost || 10} pts)`}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isCorrect ? [0.8, 1.05, 1] : 1,
                          y: 0,
                        }}
                        transition={{ 
                          duration: 0.5,
                          type: 'spring',
                          stiffness: 300,
                        }}
                        className={`p-5 rounded-xl mb-6 border-2 ${
                          isCorrect
                            ? 'bg-accent-50 border-accent-300 shadow-lg'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="text-accent-600" size={24} />
                              <span className="font-bold text-lg text-accent-700">
                                Correct ! 🎉
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500" size={24} />
                              <span className="font-bold text-lg text-red-600">
                                Incorrect, réessayez !
                              </span>
                            </>
                          )}
                        </div>
                        {isCorrect && (
                          <Button
                            onClick={handleNext}
                            variant="primary"
                            size="lg"
                            className="w-full"
                          >
                            {isLastStep ? (
                              <>
                                <Trophy className="w-5 h-5 mr-2" />
                                Terminer le jeu
                              </>
                            ) : (
                              <>
                                Étape suivante
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </>
                            )}
                          </Button>
                        )}
                      </motion.div>
                    )}

                    {!showResult && (
                      <Button
                        onClick={handleSubmitAnswer}
                        variant="primary"
                        size="lg"
                        disabled={loading || (currentStep.options ? selectedChoice === null : !answer.trim())}
                        className="w-full"
                      >
                        {loading ? 'Vérification...' : 'Valider la réponse'}
                      </Button>
                    )}
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
