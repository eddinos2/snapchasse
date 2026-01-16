/**
 * Security validation utilities
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if string contains only safe characters
 */
export function isSafeString(input: string): boolean {
  // Allow alphanumeric, spaces, and common punctuation
  const safeRegex = /^[a-zA-Z0-9\s.,!?\-_()]+$/
  return safeRegex.test(input)
}

/**
 * Validate and sanitize text input
 */
export function validateTextInput(input: string, maxLength: number = 1000): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  if (input.length > maxLength) {
    return null
  }

  return sanitizeInput(input)
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  )
}

/**
 * Validate request body size (prevent DoS)
 */
export function validateBodySize(body: string, maxSize: number = 100000): boolean {
  return body.length <= maxSize
}
