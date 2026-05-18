/**
 * MongoDB connection — singleton for Next.js serverless.
 *
 * Uses a global cache so the connection survives hot-reloads in dev
 * and is reused across requests within the same serverless instance.
 */

import mongoose from 'mongoose'
import { validateEnv }  from './env'
import { logger }       from './logger'
import { DB_CONFIG }    from '@/config/app.config'

interface MongooseCache {
  conn:    typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined
}

function getCache(): MongooseCache {
  if (!global.__mongooseCache) {
    global.__mongooseCache = { conn: null, promise: null }
  }
  return global.__mongooseCache
}

export async function connectDB(): Promise<typeof mongoose> {
  validateEnv()

  const cache = getCache()
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    // Register event listeners once, before the first connection
    mongoose.connection.once('connected',   () => logger.db.connected())
    mongoose.connection.on('disconnected',  () => {
      logger.db.disconnected()
      cache.conn    = null
      cache.promise = null
    })
    mongoose.connection.on('error', err => {
      logger.db.error(err)
      cache.conn    = null
      cache.promise = null
    })

    cache.promise = mongoose.connect(DB_CONFIG.uri(), {
      bufferCommands:           false,
      maxPoolSize:              DB_CONFIG.maxPoolSize,
      serverSelectionTimeoutMS: DB_CONFIG.serverSelectionTimeout,
      socketTimeoutMS:          DB_CONFIG.socketTimeout,
      connectTimeoutMS:         DB_CONFIG.connectTimeout,
    } as mongoose.ConnectOptions)
  }

  try {
    cache.conn = await cache.promise
  } catch (err) {
    cache.promise = null
    logger.db.error(err)
    throw err
  }

  return cache.conn
}

export async function disconnectDB(): Promise<void> {
  const cache = getCache()
  if (!cache.conn) return
  await mongoose.disconnect()
  cache.conn    = null
  cache.promise = null
}
