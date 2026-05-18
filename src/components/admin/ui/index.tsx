'use client'
import { useEffect, useRef } from 'react'

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title:     string
  width?:    string
  children:  React.ReactNode
}

export function Modal({ open, onClose, title, width = 'max-w-lg', children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={ref} className={`relative bg-white w-full ${width} shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0"
             style={{ background: '#0F2356' }}>
          <h2 className="font-serif font-normal text-white text-lg">{title}</h2>
          <button onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none transition-colors cursor-pointer">×</button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────

interface ConfirmProps {
  open:    boolean
  message: string
  onConfirm: () => void
  onCancel:  () => void
  danger?:   boolean
}

export function ConfirmDialog({ open, message, onConfirm, onCancel, danger = true }: ConfirmProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-sm shadow-2xl p-6">
        <p className="font-serif text-gray-700 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 font-serif text-sm text-gray-500 border border-stone-200
                       hover:bg-stone-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 font-serif text-sm text-white transition-opacity hover:opacity-90 cursor-pointer
              ${danger ? 'bg-red-600' : 'bg-navy-900'}`}
            style={!danger ? { background: '#0F2356' } : {}}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon:  string
  sub?:  string
  color?: 'navy' | 'gold' | 'green' | 'red' | 'blue'
  href?: string
}

export function StatCard({ label, value, icon, sub, color = 'navy', href }: StatCardProps) {
  const accent = {
    navy:  '#0F2356',
    gold:  '#C8A951',
    green: '#059669',
    red:   '#DC2626',
    blue:  '#2563EB',
  }[color]

  const content = (
    <div className="bg-white border border-stone-200 p-5 hover:shadow-md transition-all group h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
             style={{ background: accent + '12' }}>
          {icon}
        </div>
        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: accent + '30' }} />
      </div>
      <div className="font-serif leading-none mb-1.5 transition-colors"
           style={{ fontSize: 32, color: accent }}>
        {value}
      </div>
      <div className="font-serif text-xs text-gray-400 tracking-wide uppercase">{label}</div>
      {sub && <div className="font-serif text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  )

  if (href) {
    const Link = require('next/link').default
    return <Link href={href} className="no-underline block h-full">{content}</Link>
  }
  return content
}

// ── Empty State ────────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, sub, action }: {
  icon:    string
  title:   string
  sub?:    string
  action?: React.ReactNode
}) {
  return (
    <div className="py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif font-normal text-gray-600 text-lg mb-1">{title}</h3>
      {sub && <p className="font-serif text-sm text-gray-400 mb-5">{sub}</p>}
      {action}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  draft:      'bg-stone-100 text-stone-600',
  submitted:  'bg-blue-50 text-blue-700',
  reviewing:  'bg-amber-50 text-amber-700',
  accepted:   'bg-emerald-50 text-emerald-700',
  rejected:   'bg-red-50 text-red-600',
  published:  'bg-emerald-50 text-emerald-700',
  archived:   'bg-stone-100 text-stone-500',
  active:     'bg-emerald-50 text-emerald-700',
  inactive:   'bg-red-50 text-red-500',
  research:   'bg-purple-50 text-purple-700',
  campus:     'bg-blue-50 text-blue-700',
  awards:     'bg-amber-50 text-amber-700',
  events:     'bg-emerald-50 text-emerald-700',
  academic:   'bg-indigo-50 text-indigo-700',
  general:    'bg-stone-100 text-stone-600',
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-block font-serif text-[10px] px-2.5 py-1 tracking-wide capitalize
      ${BADGE_STYLES[value] || 'bg-stone-100 text-stone-600'}`}>
      {value}
    </span>
  )
}

// ── Table shell ────────────────────────────────────────────────────────────────

export function Table({ heads, children, empty }: {
  heads:    string[]
  children: React.ReactNode
  empty?:   React.ReactNode
}) {
  return (
    <div className="bg-white border border-stone-200 overflow-x-auto">
      <table className="w-full font-serif text-sm">
        <thead>
          <tr style={{ background: '#0F2356' }}>
            {heads.map(h => (
              <th key={h} className="px-5 py-3.5 text-left text-white font-normal text-xs tracking-widest uppercase whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {children}
        </tbody>
      </table>
      {empty}
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────────────

export function PageHeader({ label, title, action }: {
  label:   string
  title:   string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p className="section-label">{label}</p>
        <h1 className="font-serif font-normal text-navy-900 text-3xl leading-none">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
