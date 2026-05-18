/**
 * Structured logger for production.
 *
 * Rules:
 *  - NEVER log passwords, tokens, raw session objects, or full request bodies
 *  - In production, output JSON for log aggregators (Vercel, Datadog, etc.)
 *  - In development, output readable human text
 *  - Log levels: debug (dev only) | info | warn | error
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level:     LogLevel
  message:   string
  context?:  string          // e.g. 'auth', 'db', 'api'
  userId?:   string          // obfuscated — never raw email
  path?:     string
  method?:   string
  status?:   number
  durationMs?: number
  error?:    string          // error.message only — no stack in prod
  meta?:     Record<string, unknown>
}

const IS_PROD = process.env.NODE_ENV === 'production'
const IS_TEST = process.env.NODE_ENV === 'test'

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const BLOCKED = new Set(['password', 'token', 'secret', 'authorization', 'cookie', 'jwt'])
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    result[k] = BLOCKED.has(k.toLowerCase()) ? '[REDACTED]' : v
  }
  return result
}

function emit(entry: LogEntry): void {
  if (IS_TEST) return  // silent in tests

  if (IS_PROD) {
    // Structured JSON for log aggregators
    const line = JSON.stringify({
      ts:      new Date().toISOString(),
      ...entry,
      meta: entry.meta ? sanitize(entry.meta) : undefined,
    })
    if (entry.level === 'error' || entry.level === 'warn') {
      console.error(line)
    } else {
      console.log(line)
    }
    return
  }

  // Human-readable for development
  const ts    = new Date().toTimeString().slice(0, 8)
  const ctx   = entry.context ? `[${entry.context}]` : ''
  const route = entry.path ? ` ${entry.method ?? 'GET'} ${entry.path}` : ''
  const dur   = entry.durationMs != null ? ` (${entry.durationMs}ms)` : ''
  const uid   = entry.userId ? ` uid:${entry.userId}` : ''
  const err   = entry.error ? ` | ${entry.error}` : ''

  const prefix: Record<LogLevel, string> = {
    debug: '\x1b[90m[DEBUG]\x1b[0m',
    info:  '\x1b[36m[INFO ]\x1b[0m',
    warn:  '\x1b[33m[WARN ]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
  }

  const msg = `${prefix[entry.level]} ${ts} ${ctx}${route}${dur}${uid} ${entry.message}${err}`

  if (entry.level === 'error') console.error(msg)
  else if (entry.level === 'warn') console.warn(msg)
  else if (entry.level === 'debug') console.debug(msg)
  else console.log(msg)
}

// ── Public API ────────────────────────────────────────────────────────────────

export const logger = {
  debug: (message: string, meta?: Partial<LogEntry>) =>
    emit({ level: 'debug', message, ...meta }),

  info: (message: string, meta?: Partial<LogEntry>) =>
    emit({ level: 'info', message, ...meta }),

  warn: (message: string, meta?: Partial<LogEntry>) =>
    emit({ level: 'warn', message, ...meta }),

  error: (message: string, err?: unknown, meta?: Partial<LogEntry>) => {
    const errorMsg = err instanceof Error ? err.message : String(err ?? '')
    emit({ level: 'error', message, error: errorMsg, ...meta })
  },

  // ── Specialized loggers ───────────────────────────────────────────────────

  auth: {
    loginSuccess: (userId: string, role: string) =>
      emit({ level: 'info', context: 'auth', message: 'Login successful', userId, meta: { role } }),

    loginFailure: (reason: string, email?: string) =>
      emit({ level: 'warn', context: 'auth', message: 'Login failed',
             meta: { reason, emailDomain: email?.split('@')[1] } }),  // log domain only

    logout: (userId: string) =>
      emit({ level: 'info', context: 'auth', message: 'User logged out', userId }),

    unauthorized: (path: string, role?: string) =>
      emit({ level: 'warn', context: 'auth', message: 'Unauthorized access attempt',
             path, meta: { role: role ?? 'none' } }),
  },

  api: {
    request: (method: string, path: string, status: number, durationMs: number, userId?: string) => {
      if (!IS_PROD && status >= 400) {
        emit({ level: 'warn', context: 'api', message: `${status} ${method} ${path}`,
               method, path, status, durationMs, userId })
      }
    },

    error: (method: string, path: string, err: unknown, userId?: string) =>
      emit({ level: 'error', context: 'api',
             message: `API error ${method} ${path}`,
             method, path, userId,
             error: err instanceof Error ? err.message : String(err) }),
  },

  db: {
    connected: () =>
      emit({ level: 'info', context: 'db', message: 'MongoDB connected ✓' }),

    disconnected: () =>
      emit({ level: 'warn', context: 'db', message: 'MongoDB disconnected' }),

    error: (err: unknown) =>
      emit({ level: 'error', context: 'db', message: 'MongoDB error',
             error: err instanceof Error ? err.message : String(err) }),

    queryError: (operation: string, err: unknown) =>
      emit({ level: 'error', context: 'db', message: `Query failed: ${operation}`,
             error: err instanceof Error ? err.message : String(err) }),
  },
}
