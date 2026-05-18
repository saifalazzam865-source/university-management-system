import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: '#FAFAF8' }}>
      <div className="text-center max-w-lg">

        {/* Status code */}
        <div className="font-serif font-normal mb-2 leading-none"
             style={{ fontSize: 120, color: '#E2DED6' }}>
          404
        </div>

        <div className="w-12 h-0.5 mx-auto mb-6" style={{ background: '#C8A951' }} />

        <h1 className="font-serif font-normal text-navy-900 text-2xl mb-4">
          Page Not Found
        </h1>
        <p className="font-serif text-gray-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
          Double-check the URL or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary no-underline">
            Return Home
          </Link>
          <Link href="/login"
            className="btn-outline-navy no-underline font-serif text-sm px-6 py-3">
            Sign In
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 border-t border-stone-200 pt-8">
          <p className="font-serif text-xs text-gray-400 tracking-widest uppercase mb-4">
            Quick Links
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { href: '/#about',      label: 'About'      },
              { href: '/#faculties',  label: 'Faculties'  },
              { href: '/apply',       label: 'Apply'      },
              { href: '/#contact',    label: 'Contact'    },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="font-serif text-sm no-underline hover:underline"
                style={{ color: '#C8A951' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
