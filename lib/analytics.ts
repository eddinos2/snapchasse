/**
 * Analytics utilities - only track if user has consented
 */

import { isCookieAllowed } from './gdpr/cookie-manager'

/**
 * Track an event (only if analytics consent is given)
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!isCookieAllowed('analytics')) {
    return
  }
  
  // In production, integrate with your analytics service (e.g., Google Analytics, Plausible)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, properties)
  }
  
  // Example: Google Analytics 4
  // if (typeof window !== 'undefined' && (window as any).gtag) {
  //   (window as any).gtag('event', eventName, properties)
  // }
}

/**
 * Track page view (only if analytics consent is given)
 */
export function trackPageView(path: string): void {
  if (!isCookieAllowed('analytics')) {
    return
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Page View:', path)
  }
  
  // Example: Google Analytics 4
  // if (typeof window !== 'undefined' && (window as any).gtag) {
  //   (window as any).gtag('config', 'GA_MEASUREMENT_ID', { page_path: path })
  // }
}

/**
 * Check if Do Not Track is enabled
 */
export function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === 'undefined') return false
  
  // Check DNT header
  if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
    return true
  }
  
  // Check for DNT cookie
  if (typeof document !== 'undefined') {
    const dntCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('dnt='))
    if (dntCookie) {
      return true
    }
  }
  
  return false
}

/**
 * Should track - checks both consent and DNT
 */
export function shouldTrack(): boolean {
  if (isDoNotTrackEnabled()) {
    return false
  }
  
  return isCookieAllowed('analytics')
}
