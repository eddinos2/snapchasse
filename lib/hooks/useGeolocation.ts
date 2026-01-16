/**
 * Hook for geolocation with permission handling
 */

import { useState, useEffect, useCallback } from 'react'

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

interface GeolocationState {
  coords: [number, number] | null // [longitude, latitude]
  accuracy: number | null
  error: GeolocationPositionError | null
  loading: boolean
  permissionGranted: boolean | null // null = not requested yet
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = false, // Désactivé par défaut pour éviter les erreurs CoreLocation
    timeout = 15000, // Augmenté à 15 secondes
    maximumAge = 300000, // 5 minutes - permet d'utiliser une position récente
    watch = false,
  } = options

  const [state, setState] = useState<GeolocationState>({
    coords: null,
    accuracy: null,
    error: null,
    loading: false,
    permissionGranted: null,
  })

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
        loading: false,
        permissionGranted: false,
      }))
      return false
    }

    setState(prev => ({ ...prev, loading: true }))

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ]
          setState({
            coords,
            accuracy: position.coords.accuracy || null,
            error: null,
            loading: false,
            permissionGranted: true,
          })
          resolve(true)
        },
        (error) => {
          // kCLErrorLocationUnknown est une erreur temporaire, on considère quand même que la permission est accordée
          const isLocationUnknown = error.message?.includes('LocationUnknown') || 
                                   error.message?.includes('kCLErrorLocationUnknown') ||
                                   error.code === 2 // POSITION_UNAVAILABLE
          
          setState({
            coords: null,
            accuracy: null,
            error,
            loading: false,
            // Si c'est LocationUnknown, on considère que la permission est accordée mais qu'on n'a pas de position
            permissionGranted: error.code !== 1 && isLocationUnknown ? true : false,
          })
          resolve(false)
        },
        { enableHighAccuracy, timeout, maximumAge }
      )
    })
  }, [enableHighAccuracy, timeout, maximumAge])

  useEffect(() => {
    if (!watch || !state.permissionGranted) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ]
        setState(prev => ({
          ...prev,
          coords,
          accuracy: position.coords.accuracy || null,
          error: null,
        }))
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
        }))
      },
      { enableHighAccuracy, timeout, maximumAge }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [watch, state.permissionGranted, enableHighAccuracy, timeout, maximumAge])

  return {
    coords: state.coords,
    requestPermission,
    permissionGranted: state.permissionGranted ?? false,
    loading: state.loading,
    error: state.error?.message ?? null,
  }
}
