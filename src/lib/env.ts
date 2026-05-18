/**
 * Environment variable validation.
 * Called once; throws with a clear message if any required var is missing.
 * The module-level flag ensures it runs at most once per process.
 */

import { AUTH_CONFIG, DB_CONFIG } from '@/config/app.config'

const REQUIRED = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const

let validated = false

export function validateEnv(): void {
  if (validated) return
  validated = true

  const missing = REQUIRED.filter(k => !process.env[k]?.trim())

  if (missing.length > 0) {
    console.error('\n🚨  Missing required environment variables:\n')
    missing.forEach(k => console.error(`    ❌  ${k}`))
    console.error('\n  → Copy .env.example to .env.local and fill in all values.\n')
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }

  if (process.env.NEXTAUTH_SECRET!.length < AUTH_CONFIG.secretMinLen) {
    throw new Error(
      `NEXTAUTH_SECRET must be at least ${AUTH_CONFIG.secretMinLen} characters. ` +
      'Generate one with: openssl rand -base64 32'
    )
  }

  const uri = process.env.MONGODB_URI!
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://')
  }
}
