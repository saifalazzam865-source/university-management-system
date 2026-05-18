/**
 * Server-side authentication guards.
 *
 * Server Components → requireAdmin() / requireStudent()  — redirect on failure
 * API Route handlers → assertAdminSession() / assertStudentSession() — throw on failure
 *
 * Typed errors (AuthError, PermissionError) are caught by withHandler()
 * and mapped to 401/403 automatically.
 */

import { getServerSession }       from 'next-auth'
import { redirect }                from 'next/navigation'
import { authOptions }             from './auth-options'
import { AuthError, PermissionError } from './errors'
import { logger }                  from './logger'

// Re-export response helpers so routes that previously imported from here work
export { apiSuccess, apiError } from './apiHandler'

// ── Raw session ───────────────────────────────────────────────────────────────

export async function getSession() {
  return getServerSession(authOptions)
}

// ── Server Component guards (redirect) ───────────────────────────────────────

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    logger.auth.unauthorized('protected-route', 'none')
    redirect('/login')
  }
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session) {
    logger.auth.unauthorized('/admin', 'none')
    redirect('/login')
  }
  if (session.user.role !== 'admin') {
    logger.auth.unauthorized('/admin', session.user.role)
    redirect('/dashboard')
  }
  return session
}

export async function requireStudent() {
  const session = await getSession()
  if (!session) {
    logger.auth.unauthorized('/dashboard', 'none')
    redirect('/login')
  }
  if (session.user.role !== 'student') {
    logger.auth.unauthorized('/dashboard', session.user.role)
    redirect('/admin')
  }
  return session
}

// ── API Route guards (throw typed errors) ────────────────────────────────────

/** Throws AuthError → 401 if no valid session */
export async function assertAuth() {
  const session = await getSession()
  if (!session) throw new AuthError()
  return session
}

/** Throws AuthError → 401 or PermissionError → 403 if not admin */
export async function assertAdminSession() {
  const session = await getSession()
  if (!session)                      throw new AuthError()
  if (session.user.role !== 'admin') throw new PermissionError('Admin access required')
  return session
}

/** Throws AuthError → 401 or PermissionError → 403 if not student */
export async function assertStudentSession() {
  const session = await getSession()
  if (!session)                        throw new AuthError()
  if (session.user.role !== 'student') throw new PermissionError('Student access required')
  return session
}

// Alias used in some routes
export const assertAdmin = assertAdminSession
