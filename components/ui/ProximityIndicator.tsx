'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Radio } from 'lucide-react'
import { calculateProximityFeedback, createProximityBeep, triggerHapticFeedback } from '@/lib/utils/proximity-feedback'

interface ProximityIndicatorProps {
  distance: number | null // Distance in meters
  radius: number // Validation radius in meters
  enabled?: boolean
}

export function ProximityIndicator({ distance, radius, enabled = true }: ProximityIndicatorProps) {
  const audioRef = useRef<AudioContext | null>(null)
  const lastBeepTime = useRef<number>(0)
  const feedback = calculateProximityFeedback(distance, radius)

  // Generate audio feedback
  useEffect(() => {
    if (!enabled || feedback.intensity === 0 || feedback.audioFrequency === 0) {
      return
    }

    // Throttle beeps: faster when closer
    const beepInterval = feedback.intensity > 0.8 
      ? 500  // Very close: every 0.5s
      : feedback.intensity > 0.5
      ? 1000 // Close: every 1s
      : feedback.intensity > 0.2
      ? 2000 // Medium: every 2s
      : 3000 // Far: every 3s

    const now = Date.now()
    if (now - lastBeepTime.current < beepInterval) {
      return
    }

    // Stop previous audio if still playing
    if (audioRef.current && audioRef.current.state !== 'closed') {
      try {
        audioRef.current.close()
      } catch (e) {
        // Ignore errors when closing
      }
    }

    // Create new beep
    const audioContext = createProximityBeep(
      feedback.audioFrequency,
      feedback.intensity > 0.7 ? 150 : 100, // Longer beep when close
      Math.min(0.5, feedback.intensity * 0.5) // Volume based on intensity
    )
    
    audioRef.current = audioContext
    lastBeepTime.current = now

    // Trigger haptic feedback
    if (feedback.hapticStrength !== 'none') {
      triggerHapticFeedback(feedback.hapticStrength)
    }
  }, [feedback.intensity, feedback.audioFrequency, feedback.hapticStrength, enabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.state !== 'closed') {
        try {
          audioRef.current.close()
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }, [])

  if (distance === null || feedback.intensity === 0) {
    return null
  }

  return (
    <div className="fixed bottom-32 right-4 z-30 pointer-events-none">
      <motion.div
        className="relative flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: feedback.intensity > 0.2 ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Visual pulse indicator */}
        <div className="relative">
          {/* Pulsing rings */}
          {feedback.intensity > 0.3 && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary-400 opacity-30"
                animate={{
                  scale: [1, 1 + feedback.visualPulse * 0.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 1 + (1 - feedback.visualPulse),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-accent-400 opacity-30"
                animate={{
                  scale: [1, 1 + feedback.visualPulse * 0.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 0.8 + (1 - feedback.visualPulse) * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              />
            </>
          )}

          {/* Center icon */}
          <motion.div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
              feedback.intensity > 0.7
                ? 'bg-accent-500 text-white'
                : feedback.intensity > 0.4
                ? 'bg-primary-500 text-white'
                : 'bg-white text-primary-600 border-2 border-primary-300'
            }`}
            animate={{
              scale: [1, 1 + feedback.visualPulse * 0.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {feedback.intensity > 0.7 ? (
              <Radio className="w-6 h-6" />
            ) : (
              <MapPin className="w-6 h-6" />
            )}
          </motion.div>
        </div>

        {/* Intensity bar */}
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              feedback.intensity > 0.7
                ? 'bg-accent-500'
                : feedback.intensity > 0.4
                ? 'bg-primary-500'
                : 'bg-primary-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${feedback.intensity * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Distance display */}
        {distance !== null && (
          <motion.div
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              feedback.intensity > 0.7
                ? 'bg-accent-100 text-accent-700'
                : feedback.intensity > 0.4
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700'
            }`}
            animate={{
              scale: feedback.intensity > 0.7 ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: feedback.intensity > 0.7 ? Infinity : 0,
            }}
          >
            {distance < 1000 
              ? `${Math.round(distance)}m` 
              : `${(distance / 1000).toFixed(1)}km`
            }
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
