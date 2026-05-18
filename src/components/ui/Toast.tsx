'use client'
import { useState, useEffect, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id:      string
  type:    ToastType
  message: string
}

// ── Singleton event bus ───────────────────────────────────────────────────────

type ToastListener = (toast: Toast) => void
const listeners: ToastListener[] = []

function emit(type: ToastType, message: string) {
  const toast: Toast = { id: Date.now().toString(36), type, message }
  listeners.forEach(fn => fn(toast))
}

export const toast = {
  success: (msg: string) => emit('success', msg),
  error:   (msg: string) => emit('error',   msg),
  info:    (msg: string) => emit('info',    msg),
  warning: (msg: string) => emit('warning', msg),
}

// ── Component ─────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
}

const STYLES: Record<ToastType, { border: string; bg: string; text: string }> = {
  success: { border: '#059669', bg: '#ECFDF5', text: '#065F46' },
  error:   { border: '#DC2626', bg: '#FEF2F2', text: '#991B1B' },
  info:    { border: '#2563EB', bg: '#EFF6FF', text: '#1D4ED8' },
  warning: { border: '#D97706', bg: '#FFFBEB', text: '#92400E' },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 4000)
  }, [])

  useEffect(() => {
    listeners.push(add)
    return () => {
      const idx = listeners.indexOf(add)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [add])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const s = STYLES[t.type]
        return (
          <div key={t.id}
               className="pointer-events-auto flex items-start gap-3 px-4 py-3 shadow-lg border-l-4"
               style={{ background: s.bg, borderColor: s.border, color: s.text }}>
            <span className="font-bold text-sm flex-shrink-0 mt-0.5">{ICONS[t.type]}</span>
            <p className="font-serif text-sm leading-relaxed">{t.message}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Inline feedback component (for forms) ─────────────────────────────────────

interface FeedbackProps {
  type?:    ToastType
  message?: string
  className?: string
}

export function InlineFeedback({ type = 'error', message, className = '' }: FeedbackProps) {
  if (!message) return null
  const s = STYLES[type]
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-l-4 ${className}`}
         style={{ background: s.bg, borderColor: s.border }}>
      <span className="font-bold text-xs flex-shrink-0">{ICONS[type]}</span>
      <p className="font-serif text-sm" style={{ color: s.text }}>{message}</p>
    </div>
  )
}
