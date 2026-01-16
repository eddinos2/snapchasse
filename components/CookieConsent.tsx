'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { hasConsent, saveCookieConsent, type CookieConsent } from '@/lib/gdpr/cookie-manager'
import { Button } from './ui/Button'

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<Partial<CookieConsent>>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (!hasConsent()) {
      setShowConsent(true)
    }
  }, [])

  const handleAcceptAll = () => {
    saveCookieConsent({
      essential: true,
      analytics: true,
      marketing: true,
    })
    setShowConsent(false)
  }

  const handleRejectAll = () => {
    saveCookieConsent({
      essential: true,
      analytics: false,
      marketing: false,
    })
    setShowConsent(false)
  }

  const handleSavePreferences = () => {
    saveCookieConsent(consent)
    setShowConsent(false)
  }

  const toggleCategory = (category: 'analytics' | 'marketing') => {
    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
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
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">🍪 Gestion des cookies</h3>
                  <p className="text-sm text-retro-light/80">
                    Nous utilisons des cookies pour améliorer votre expérience. Les cookies essentiels sont toujours actifs.
                    Consultez notre{' '}
                    <Link href="/privacy" className="text-retro-primary underline hover:text-retro-secondary">
                      politique de confidentialité
                    </Link>
                    .
                  </p>
                </div>
                <button
                  onClick={() => setShowConsent(false)}
                  className="p-1 hover:bg-retro-primary/20 rounded transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-retro-primary hover:text-retro-secondary transition-colors"
              >
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Personnaliser les préférences
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4 border-t border-retro-primary/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">Cookies essentiels</h4>
                          <p className="text-xs text-retro-light/70">
                            Nécessaires au fonctionnement de l'application
                          </p>
                        </div>
                        <span className="text-retro-secondary font-bold">Toujours actifs</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">Cookies analytiques</h4>
                          <p className="text-xs text-retro-light/70">
                            Nous aident à améliorer l'application
                          </p>
                        </div>
                        <button
                          onClick={() => toggleCategory('analytics')}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            consent.analytics ? 'bg-retro-primary' : 'bg-retro-dark border border-retro-primary'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                              consent.analytics ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">Cookies marketing</h4>
                          <p className="text-xs text-retro-light/70">
                            Pour personnaliser votre expérience
                          </p>
                        </div>
                        <button
                          onClick={() => toggleCategory('marketing')}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            consent.marketing ? 'bg-retro-primary' : 'bg-retro-dark border border-retro-primary'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                              consent.marketing ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-retro-primary/30">
                <Button variant="ghost" onClick={handleRejectAll} size="sm">
                  Tout refuser
                </Button>
                {showDetails && (
                  <Button variant="secondary" onClick={handleSavePreferences} size="sm">
                    Enregistrer les préférences
                  </Button>
                )}
                <Button variant="primary" onClick={handleAcceptAll} size="sm">
                  Tout accepter
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
