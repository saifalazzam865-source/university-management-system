/**
 * Typed application error hierarchy.
 *
 * Replaces the scattered `(err as any).statusCode = 4xx` pattern.
 * The withHandler wrapper catches these and maps them to HTTP responses.
 */

// ── Base ──────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name       = 'AppError'
    this.statusCode = statusCode
    // Maintains proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ── 400 Bad Request ───────────────────────────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400)
    this.name = 'BadRequestError'
  }
}

// ── 401 Unauthorized ─────────────────────────────────────────────────────────

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthError'
  }
}

// ── 403 Forbidden ─────────────────────────────────────────────────────────────

export class PermissionError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403)
    this.name = 'PermissionError'
  }
}

// ── 404 Not Found ─────────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

// ── 409 Conflict ─────────────────────────────────────────────────────────────

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

// ── 422 Unprocessable Entity ─────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422)
    this.name = 'ValidationError'
  }
}

// ── Error classification (Mongoose + App errors → HTTP) ──────────────────────


// Minimal interface for Mongoose internal error shapes (not exported by Mongoose types)
interface MongooseValidationError { message: string }
interface MongooseInternalError extends Error {
  code?:     number
  keyValue?: Record<string, unknown>
  errors?:   Record<string, MongooseValidationError>
}

export interface ClassifiedError {
  status:  number
  message: string
}

export function classifyError(err: unknown): ClassifiedError {
  // Our typed errors
  if (err instanceof AppError) {
    // Permission errors always return the safe generic message
    if (err instanceof PermissionError) {
      return { status: 403, message: 'You do not have permission to perform this action' }
    }
    return { status: err.statusCode, message: err.message }
  }

  if (err instanceof Error) {
    // Narrow Mongoose internal error shapes with minimal typed interfaces
    const mongoErr = err as MongooseInternalError

    // Mongoose validation
    if (err.name === 'ValidationError') {
      const first = Object.values(mongoErr.errors ?? {})[0]
      return { status: 422, message: first?.message ?? 'Validation failed' }
    }
    // Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return { status: 400, message: 'Invalid ID format' }
    }
    // MongoDB duplicate key (E11000)
    if (mongoErr.code === 11000) {
      const field = Object.keys(mongoErr.keyValue ?? {})[0] ?? 'field'
      return { status: 409, message: `${field} already exists` }
    }
  }

  return { status: 500, message: 'Internal server error' }
}
