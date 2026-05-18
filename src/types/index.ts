/**
 * Global TypeScript type extensions and shared application types.
 */

import { type DefaultSession } from 'next-auth'

// ── NextAuth module augmentation ──────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id:         string
      role:       'student' | 'admin'
      studentId?: string
    } & DefaultSession['user']
  }

  interface User {
    role:       'student' | 'admin'
    studentId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:         string
    role:       'student' | 'admin'
    studentId?: string
  }
}

// ── Shared response types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  error?:  string
}

export interface PaginatedResponse<T> {
  items:   T[]
  total:   number
  page:    number
  limit:   number
}

// ── Route context (parameterised routes) ─────────────────────────────────────

export interface RouteContext<P extends Record<string, string> = { id: string }> {
  params: P
}
