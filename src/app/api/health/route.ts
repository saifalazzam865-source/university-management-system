/**
 * GET /api/health
 * Returns system health. Used by monitoring tools and Vercel deployment checks.
 * Never cached — always fresh.
 */

import { type NextRequest } from 'next/server'
import mongoose              from 'mongoose'
import { connectDB }         from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const start = Date.now()

  let dbStatus    = 'disconnected'
  let dbLatencyMs = -1

  try {
    await connectDB()
    const t0 = Date.now()
    await mongoose.connection.db!.admin().ping()
    dbLatencyMs = Date.now() - t0
    dbStatus    = 'connected'
  } catch (err: unknown) {
    dbStatus = 'error'
    console.error('[health] DB ping failed:', err instanceof Error ? err.message : String(err))
  }

  const healthy    = dbStatus === 'connected'
  const httpStatus = healthy ? 200 : 503

  return Response.json(
    {
      status:     healthy ? 'healthy' : 'degraded',
      version:    process.env.npm_package_version ?? '1.0.0',
      env:        process.env.NODE_ENV ?? 'unknown',
      uptime:     Math.round(process.uptime()),
      responseMs: Date.now() - start,
      checks: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
      },
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus }
  )
}
