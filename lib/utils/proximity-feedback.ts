/**
 * Proximity feedback system - Like AirPods location finding
 * Provides audio and visual feedback that increases as you get closer
 */

export interface ProximityFeedback {
  intensity: number // 0-1, how close you are (1 = very close)
  audioFrequency: number // Hz frequency for beep
  visualPulse: number // 0-1 pulse intensity
  hapticStrength: 'none' | 'light' | 'medium' | 'strong'
}

/**
 * Calculate proximity feedback based on distance and radius
 * @param distance Distance in meters
 * @param radius Radius in meters (the validation zone)
 * @returns Proximity feedback configuration
 */
export function calculateProximityFeedback(
  distance: number | null,
  radius: number
): ProximityFeedback {
  if (distance === null || distance > radius * 3) {
    return {
      intensity: 0,
      audioFrequency: 0,
      visualPulse: 0,
      hapticStrength: 'none',
    }
  }

  // Calculate intensity: 1 when very close, 0 when far
  // Use exponential decay for more dramatic effect near target
  const normalizedDistance = Math.max(0, Math.min(1, 1 - (distance / (radius * 3))))
  const intensity = Math.pow(normalizedDistance, 0.5) // Square root for smooth curve

  // Audio frequency: higher when closer (like radar ping)
  // Range: 200Hz (far) to 2000Hz (close)
  const audioFrequency = 200 + intensity * 1800

  // Visual pulse: stronger when closer
  const visualPulse = intensity

  // Haptic feedback based on intensity
  let hapticStrength: 'none' | 'light' | 'medium' | 'strong' = 'none'
  if (intensity > 0.8) {
    hapticStrength = 'strong'
  } else if (intensity > 0.5) {
    hapticStrength = 'medium'
  } else if (intensity > 0.2) {
    hapticStrength = 'light'
  }

  return {
    intensity,
    audioFrequency,
    visualPulse,
    hapticStrength,
  }
}

/**
 * Generate beep sound for proximity feedback
 */
export function createProximityBeep(
  frequency: number,
  duration: number = 100,
  volume: number = 0.3
): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine' // Smooth sine wave

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)

    return audioContext
  } catch (error) {
    console.warn('Could not create proximity beep:', error)
    return null
  }
}

/**
 * Trigger haptic feedback (if supported)
 */
export function triggerHapticFeedback(strength: 'light' | 'medium' | 'strong'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return
  }

  const patterns = {
    light: [10],
    medium: [20, 10, 20],
    strong: [30, 15, 30, 15, 30],
  }

  navigator.vibrate(patterns[strength])
}
