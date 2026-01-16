/**
 * Custom error types for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Format error for user display
 */
export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Une erreur est survenue'
}

/**
 * Log error (in production, send to error tracking service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, context)
  }
  // In production, send to error tracking service (e.g., Sentry)
}
