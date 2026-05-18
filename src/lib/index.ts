/**
 * Core library barrel export.
 *
 * Import commonly used lib utilities from here:
 *   import { connectDB, withHandler, apiSuccess } from '@/lib'
 *
 * Heavy/rare imports (services, schemas) should still be imported
 * from their specific paths to avoid bundle size surprises.
 */

// Database
export { connectDB, disconnectDB }    from './db'

// HTTP helpers
export { withHandler, apiSuccess, apiError, apiRateLimited, getClientIP } from './apiHandler'

// Auth guards
export {
  getSession,
  requireAuth, requireAdmin, requireStudent,
  assertAuth, assertAdminSession, assertStudentSession,
} from './auth'

// Errors
export {
  AppError, BadRequestError, AuthError, PermissionError,
  NotFoundError, ConflictError, ValidationError,
  classifyError,
} from './errors'

// RBAC
export { hasPermission, assertPermission } from './rbac'
export type { UserRole, Permission }       from './rbac'

// Logger
export { logger } from './logger'

// Utils
export { cn, formatDate, formatDateShort, generateStudentId, toSlug, truncate } from './utils'
