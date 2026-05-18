/**
 * API handler factory.
 *
 * Provides:
 *  - apiSuccess / apiError  — consistent JSON response shapes
 *  - withHandler()          — rate-limiting + error classification + logging
 *  - classifyError()        — re-exported from lib/errors for convenience
 */

import { type NextRequest }              from 'next/server'
import { rateLimitAuth, rateLimitAdmin, rateLimitPublic } from './rateLimit'
import { classifyError }                 from './errors'
import { logger }                        from './logger'

export { classifyError } from './errors'

// ── Response factories ────────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status })
}

export function apiRateLimited(resetAt: number): Response {
  return Response.json(
    { success: false, error: 'Too many requests — please slow down.' },
    {
      status: 429,
      headers: {
        'Retry-After':       String(Math.ceil((resetAt - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(resetAt),
      },
    }
  )
}

// ── IP extraction ─────────────────────────────────────────────────────────────

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

// ── Route wrapper ─────────────────────────────────────────────────────────────

export type RouteKind = 'public' | 'auth' | 'admin'
export type HandlerFn = (req: NextRequest) => Promise<Response>

/**
 * Wraps a handler with:
 *  1. Per-IP rate limiting (10 / 100 / 300 req/min by kind)
 *  2. Unified typed error → HTTP mapping
 *  3. Structured request logging
 *
 * @example
 *   export const POST = withHandler('auth', async (req) => { ... })
 *
 * Parameterised routes ([id]) — params are captured via closure:
 *   export async function PATCH(req: NextRequest, { params }: RouteCtx) {
 *     return withHandler('admin', async (r) => {
 *       const data = await r.json()
 *       // params.id is accessible from outer scope
 *     })(req)
 *   }
 */
export function withHandler(kind: RouteKind, handler: HandlerFn): HandlerFn {
  return async (req: NextRequest): Promise<Response> => {
    const ip    = getClientIP(req)
    const start = Date.now()
    const path  = req.nextUrl.pathname

    const limiter =
      kind === 'auth'  ? rateLimitAuth(ip)   :
      kind === 'admin' ? rateLimitAdmin(ip)   :
                         rateLimitPublic(ip)

    if (!limiter.allowed) {
      logger.warn('Rate limit exceeded', { context: 'api', path, meta: { kind } })
      return apiRateLimited(limiter.resetAt)
    }

    try {
      const res = await handler(req)
      if (res.status >= 400) {
        logger.api.request(req.method, path, res.status, Date.now() - start)
      }
      return res
    } catch (err) {
      const { status, message } = classifyError(err)
      if (status >= 500) logger.api.error(req.method, path, err)
      else logger.warn(`${status} ${req.method} ${path}: ${message}`, { context: 'api' })
      return apiError(message, status)
    }
  }
}

// Backward-compat alias (older routes may still import this)
export const withRateLimit = withHandler
