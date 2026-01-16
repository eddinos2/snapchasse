'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oups ! Une erreur s&apos;est produite
        </h1>
        <p className="text-gray-600 mb-6">
          {error.message || 'Une erreur inattendue s&apos;est produite'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            variant="primary"
          >
            Réessayer
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="secondary"
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </Card>
    </div>
  )
}
