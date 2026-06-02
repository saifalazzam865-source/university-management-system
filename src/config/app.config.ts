/**
 * Application configuration.
 *
 * Single source of truth for all environment-dependent values and
 * application-level constants. Import from here, never from process.env directly.
 *
 * Values are read lazily so Next.js Edge Runtime doesn't blow up
 * on import before environment is ready.
 */

export const APP_CONFIG = {
  name:    'University Management System',
  version: '1.0.0',
  url:     () => process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
} as const

export const DB_CONFIG = {
  uri:                    () => process.env.MONGODB_URI!,
  dbName:                 'university-management-system',
  maxPoolSize:            10,
  serverSelectionTimeout: 10_000,
  socketTimeout:          45_000,
  connectTimeout:         10_000,
} as const

export const AUTH_CONFIG = {
  sessionMaxAge:  30 * 24 * 60 * 60,   // 30 days
  sessionUpdate:  24 * 60 * 60,         // refresh daily
  secretMinLen:   32,
  cookieName:     () =>
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
} as const

export const UPLOAD_CONFIG = {
  maxBytes:     () => parseInt(process.env.UPLOAD_MAX_BYTES ?? String(10 * 1024 * 1024), 10),
  allowedMimes: new Set([
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
} as const

// Cloud storage (Cloudinary). Read lazily so a missing var never breaks the build.
export const CLOUDINARY_CONFIG = {
  cloudName: () => process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey:    () => process.env.CLOUDINARY_API_KEY!,
  apiSecret: () => process.env.CLOUDINARY_API_SECRET!,
  folder:    () => process.env.CLOUDINARY_FOLDER ?? 'university-management-system/applications',
} as const

export const RATE_LIMIT_CONFIG = {
  windowMs:    () => parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
  public:      () => parseInt(process.env.RATE_LIMIT_MAX       ?? '100',   10),
  auth:        10,
  admin:       300,
  cleanupMs:   5 * 60 * 1000,
} as const

export const PAGINATION_CONFIG = {
  defaultPage:  1,
  defaultLimit: 50,
  maxLimit:     100,
} as const
