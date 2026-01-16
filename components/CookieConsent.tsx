'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShowConsent(false)
  }

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowConsent(false)
  }

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="glass-effect max-w-4xl mx-auto rounded-lg p-6 retro-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">🍪 Gestion des cookies</h3>
                <p className="text-sm text-retro-light/80">
                  Nous utilisons des cookies pour améliorer votre expérience et assurer la sécurité de l'application.
                  En continuant, vous acceptez notre{' '}
                  <Link href="/privacy" className="text-retro-primary underline">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={rejectCookies}
                  className="px-4 py-2 text-sm border border-retro-primary rounded hover:bg-retro-primary/20 transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-4 py-2 text-sm bg-retro-primary text-retro-dark rounded hover:bg-retro-primary/90 transition-colors font-bold"
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
