'use client'

interface Props {
  className?: string
}

/** Single animated skeleton bar */
export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse bg-stone-200 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

/** Full-width table skeleton with configurable rows */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-stone-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-5 py-4 bg-stone-100">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-stone-300 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-t border-stone-100">
          <div className="w-8 h-8 rounded-full bg-stone-200 flex-shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <div key={j} className="h-3 bg-stone-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Card grid skeleton */
export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  const colClass = cols === 2 ? 'grid-cols-1 sm:grid-cols-2'
                 : cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                 :              'grid-cols-2 lg:grid-cols-4'
  return (
    <div className={`grid ${colClass} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-stone-200 p-6">
          <div className="w-10 h-10 bg-stone-200 rounded mb-4" />
          <div className="h-3 w-8 bg-stone-200 rounded mb-3" />
          <div className="h-5 w-36 bg-stone-100 rounded mb-2" />
          <div className="h-3 w-full bg-stone-100 rounded mb-1" />
          <div className="h-3 w-4/5 bg-stone-100 rounded" />
        </div>
      ))}
    </div>
  )
}

/** Inline spinner */
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-4' }[size]
  return (
    <div
      className={`${s} border-stone-300 border-t-navy-900 rounded-full animate-spin ${className}`}
      style={{ borderTopColor: '#0F2356' }}
      role="status"
      aria-label="Loading"
    />
  )
}

/** Full-page centered loading state */
export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="lg" />
      <p className="font-serif text-sm text-gray-400">{message}</p>
    </div>
  )
}
