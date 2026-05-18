'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const LABELS: Record<string, string> = {
  '/admin':                'Dashboard',
  '/admin/students':       'Students',
  '/admin/applications':   'Applications',
  '/admin/faculties':      'Faculties',
  '/admin/news':           'News',
  '/admin/announcements':  'Announcements',
}

export function AdminTopbar() {
  const path    = usePathname()
  const label   = LABELS[path] ?? LABELS[Object.keys(LABELS).find(k => path.startsWith(k) && k !== '/admin') ?? ''] ?? 'Admin'
  const isDetail = !LABELS[path]

  const crumbs = [
    { label: 'Admin', href: '/admin' },
    ...(isDetail
      ? [{ label: label, href: path }]
      : path !== '/admin'
        ? [{ label, href: path }]
        : []
    ),
  ]

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 flex items-center h-14 px-6 gap-4">
      {/* Mobile spacer for hamburger */}
      <div className="w-8 lg:hidden flex-shrink-0" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 min-w-0">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-stone-300 text-sm flex-shrink-0">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="font-serif text-xs text-gray-400 hover:text-gray-700 no-underline flex-shrink-0">
                {c.label}
              </Link>
            ) : (
              <span className="font-serif text-sm text-navy-900 truncate">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <Link href="/apply" target="_blank"
          className="hidden sm:flex items-center gap-1.5 font-serif text-xs text-gray-500
                     hover:text-navy-900 no-underline transition-colors px-3 py-1.5 border border-stone-200
                     hover:border-navy-900">
          <span>↗</span> Apply Form
        </Link>
        <Link href="/" target="_blank"
          className="hidden sm:flex items-center gap-1.5 font-serif text-xs text-gray-500
                     hover:text-navy-900 no-underline transition-colors px-3 py-1.5 border border-stone-200
                     hover:border-navy-900">
          <span>🌐</span> Site
        </Link>
      </div>
    </header>
  )
}
