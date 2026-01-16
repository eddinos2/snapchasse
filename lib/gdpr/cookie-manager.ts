/**
 * Cookie Manager for GDPR compliance
 * Manages cookie consent and tracks which cookies are allowed
 */

export type CookieCategory = 'essential' | 'analytics' | 'marketing'

export interface CookieConsent {
  essential: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: string
}

const CONSENT_STORAGE_KEY = 'cookie-consent'
const CONSENT_VERSION = '1.0'

/**
 * Get current cookie consent
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!stored) return null
  
  try {
    const consent = JSON.parse(stored) as CookieConsent
    // Check if consent is still valid (not expired after 1 year)
    const consentDate = new Date(consent.timestamp)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    if (consentDate < oneYearAgo) {
      // Consent expired, remove it
      localStorage.removeItem(CONSENT_STORAGE_KEY)
      return null
    }
    
    return consent
  } catch {
    return null
  }
}

/**
 * Save cookie consent
 */
export function saveCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === 'undefined') return
  
  const fullConsent: CookieConsent = {
    essential: true, // Always true
    analytics: consent.analytics ?? false,
    marketing: consent.marketing ?? false,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  }
  
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullConsent))
  
  // Dispatch event for other parts of the app
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: fullConsent }))
}

/**
 * Check if a cookie category is allowed
 */
export function isCookieAllowed(category: CookieCategory): boolean {
  const consent = getCookieConsent()
  if (!consent) return false
  
  // Essential cookies are always allowed
  if (category === 'essential') return true
  
  return consent[category] ?? false
}

/**
 * Check if user has given any consent
 */
export function hasConsent(): boolean {
  return getCookieConsent() !== null
}

/**
 * Set a cookie (only if consent is given)
 */
export function setCookie(
  name: string,
  value: string,
  category: CookieCategory,
  days: number = 365
): boolean {
  if (!isCookieAllowed(category)) {
    return false
  }
  
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  return true
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  
  return null
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}
