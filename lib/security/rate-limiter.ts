/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar for distributed systems
 * 
 * Note: This is a simplified version for Edge Runtime compatibility
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()

  constructor() {
    // Note: No cleanup interval in Edge Runtime
    // Entries will be cleaned up on access
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (e.g., IP address)
   * @param maxRequests - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    // Cleanup expired entry
    if (entry && now > entry.resetTime) {
      this.store.delete(key)
    }

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }

    if (entry.count >= maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests
    }
    return Math.max(0, maxRequests - entry.count)
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number | null {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return null
    }
    return entry.resetTime
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear(): void {
    this.store.clear()
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Rate limit configuration per route
 */
export const rateLimitConfig = {
  auth: {
    maxRequests: 20, // Increased for normal usage
    windowMs: 60 * 1000, // 1 minute
  },
  api: {
    maxRequests: 100, // Increased for API calls
    windowMs: 60 * 1000, // 1 minute
  },
  default: {
    maxRequests: 200, // Increased for page requests
    windowMs: 60 * 1000, // 1 minute
  },
}

/**
 * Get rate limit config for a route
 */
export function getRateLimitConfig(path: string): { maxRequests: number; windowMs: number } {
  if (path.includes('/auth/')) {
    return rateLimitConfig.auth
  }
  if (path.startsWith('/api/')) {
    return rateLimitConfig.api
  }
  return rateLimitConfig.default
}
