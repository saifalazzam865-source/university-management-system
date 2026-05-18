'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console in development; in production this would go to Sentry etc.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Global Error]', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: '#FAFAF8', fontFamily: 'Georgia, serif' }}>
      <div className="text-center max-w-lg">

        <div style={{ fontSize: 80, color: '#E2DED6', lineHeight: 1 }} className="mb-2">⚠</div>
        <div className="w-12 h-0.5 mx-auto mb-6" style={{ background: '#C8A951' }} />

        <h1 style={{ color: '#0F2356', fontSize: 24, fontWeight: 400, marginBottom: 16 }}>
          Something Went Wrong
        </h1>
        <p style={{ color: '#6B6B6B', lineHeight: 1.75, marginBottom: 32, fontSize: 15 }}>
          An unexpected error occurred. Our team has been notified.
          You can try refreshing the page or return to the homepage.
        </p>

        {/* Digest for support reference — never expose full error message in prod */}
        {error.digest && (
          <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 24, letterSpacing: '0.05em' }}>
            Error reference: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              background: '#0F2356', color: '#fff', border: 'none',
              padding: '12px 28px', fontFamily: 'Georgia, serif',
              fontSize: 14, cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            Try Again
          </button>
          <Link href="/"
            style={{
              border: '1px solid #0F2356', color: '#0F2356', textDecoration: 'none',
              padding: '12px 28px', fontFamily: 'Georgia, serif', fontSize: 14,
            }}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
