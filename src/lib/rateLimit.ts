/**
 * In-memory rate limiter.
 *
 * Process-local — for multi-region production, replace with Upstash Redis.
 * Configurable via RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS env vars.
 */

import { RATE_LIMIT_CONFIG } from '@/config/app.config'

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>()

// Periodic cleanup — unref() so it doesn't block process exit
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, RATE_LIMIT_CONFIG.cleanupMs).unref?.()
}

export interface RateLimitResult {
  allowed:   boolean
  remaining: number
  resetAt:   number
}

export function rateLimit(ip: string, max: number, windowMs: number): RateLimitResult {
  const now   = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    const next: Entry = { count: 1, resetAt: now + windowMs }
    store.set(ip, next)
    return { allowed: true, remaining: max - 1, resetAt: next.resetAt }
  }

  entry.count++
  return {
    allowed:   entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt:   entry.resetAt,
  }
}

const window = () => RATE_LIMIT_CONFIG.windowMs()

export const rateLimitPublic = (ip: string) => rateLimit(ip, RATE_LIMIT_CONFIG.public(), window())
export const rateLimitAuth   = (ip: string) => rateLimit(ip, RATE_LIMIT_CONFIG.auth,     window())
export const rateLimitAdmin  = (ip: string) => rateLimit(ip, RATE_LIMIT_CONFIG.admin,    window())
