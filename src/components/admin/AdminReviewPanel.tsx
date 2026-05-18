'use client'
import { useState }    from 'react'
import { useRouter }   from 'next/navigation'

interface Props {
  id:            string
  currentStatus: string
  reviewNote:    string
}

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted — awaiting review' },
  { value: 'reviewing', label: 'Reviewing — under consideration' },
  { value: 'accepted',  label: 'Accepted — offer extended' },
  { value: 'rejected',  label: 'Rejected — not proceeding' },
]

const STATUS_STYLES: Record<string, string> = {
  submitted: 'border-blue-200 text-blue-700 bg-blue-50',
  reviewing: 'border-amber-200 text-amber-700 bg-amber-50',
  accepted:  'border-emerald-200 text-emerald-700 bg-emerald-50',
  rejected:  'border-red-200 text-red-600 bg-red-50',
}

export function AdminReviewPanel({ id, currentStatus, reviewNote: initialNote }: Props) {
  const router = useRouter()
  const [status, setStatus]   = useState(currentStatus)
  const [note,   setNote]     = useState(initialNote)
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [error,  setError]    = useState('')

  const isDirty = status !== currentStatus || note !== initialNote

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    const res  = await fetch('/api/applications', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status, note }),
    })
    const data = await res.json()
    setSaving(false)

    if (!data.success) {
      setError(data.error || 'Update failed')
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <div className="bg-white border border-stone-200 p-5 min-w-[280px] max-w-sm">
      <p className="font-serif text-[11px] text-gray-400 tracking-widest uppercase mb-4">Review Decision</p>

      {/* Status selector */}
      <div className="mb-4">
        <label className="form-label">Status</label>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map(opt => (
            <label key={opt.value}
              className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-all
                ${status === opt.value
                  ? STATUS_STYLES[opt.value]
                  : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
              <input type="radio" name="status" value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                className="accent-navy-900" />
              <span className="font-serif text-xs">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="form-label">Internal Review Note</label>
        <textarea className="form-input resize-none text-sm" rows={3}
          value={note} onChange={e => setNote(e.target.value)}
          placeholder="Add notes about this application (visible to admins only)…" />
      </div>

      {/* Actions */}
      {error && (
        <p className="font-serif text-xs text-red-600 mb-3">{error}</p>
      )}

      <button onClick={handleSave} disabled={saving || !isDirty}
        className={`w-full font-serif text-sm py-3 transition-all cursor-pointer
          ${isDirty && !saving
            ? 'text-white hover:opacity-90'
            : 'bg-stone-100 text-gray-400 cursor-not-allowed'}`}
        style={isDirty && !saving ? { background: '#0F2356' } : {}}>
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Decision'}
      </button>

      {saved && (
        <p className="font-serif text-xs text-emerald-600 text-center mt-2">Decision updated successfully</p>
      )}
    </div>
  )
}
