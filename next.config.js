/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Server Actions body limit (for file uploads) ───────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  // ── TypeScript / ESLint — still surface errors but don't block builds ──────
  // Remove these two lines once all type errors are resolved
  typescript:  { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },

  // ── Powered-by header — remove for security ────────────────────────────────
  poweredByHeader: false,

  // ── Compression ───────────────────────────────────────────────────────────
  compress: true,

  // ── Security & cache headers ──────────────────────────────────────────────
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options',         value: 'DENY' },
      { key: 'X-Content-Type-Options',  value: 'nosniff' },
      { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
      // Only set HSTS in production (breaks HTTP local dev if set globally)
      ...(process.env.NODE_ENV === 'production'
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
        : []),
    ]

    return [
      // Apply security headers to all routes
      {
        source:  '/(.*)',
        headers: securityHeaders,
      },
      // Uploaded files — private, no public cache
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control',         value: 'private, no-cache, no-store, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      // Static assets — long cache
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /admin/applications/new → /apply for convenience
      {
        source:      '/apply/new',
        destination: '/apply',
        permanent:   false,
      },
    ]
  },
}

module.exports = nextConfig
