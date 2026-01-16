'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface ConfettiProps {
  trigger: boolean
  duration?: number
}

export function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return

    // Create confetti elements
    const confettiCount = 50
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
    
    const confettiElements: HTMLElement[] = []
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.style.position = 'fixed'
      confetti.style.width = '10px'
      confetti.style.height = '10px'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.top = '-10px'
      confetti.style.borderRadius = '50%'
      confetti.style.pointerEvents = 'none'
      confetti.style.zIndex = '9999'
      confetti.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)'
      
      document.body.appendChild(confetti)
      confettiElements.push(confetti)
      
      // Animate
      const angle = Math.random() * 360
      const velocity = 50 + Math.random() * 50
      const rotation = Math.random() * 720
      
      confetti.animate(
        [
          {
            transform: 'translate(0, 0) rotate(0deg)',
            opacity: 1,
          },
          {
            transform: `translate(${Math.cos(angle) * velocity}px, ${window.innerHeight + 100}px) rotate(${rotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: duration,
          easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
        }
      )
    }
    
    // Cleanup
    const timer = setTimeout(() => {
      confettiElements.forEach(el => el.remove())
    }, duration + 100)
    
    return () => {
      clearTimeout(timer)
      confettiElements.forEach(el => el.remove())
    }
  }, [trigger, duration])

  return null
}
