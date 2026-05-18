'use client'
import { useState } from 'react'
import { ConfirmDialog, StatusBadge } from './ui'

type Category = 'academic' | 'general' | 'event' | 'urgent'

interface Announcement {
  _id:       string
  title:     string
  content:   string
  category:  Category
  createdBy: string
  createdAt: string
}

const CATEGORIES: Category[] = ['general', 'academic', 'event', 'urgent']

export function AnnouncementsClient({ initialItems }: { initialItems: Announcement[] }) {
  const [items,   setItems]   = useState<Announcement[]>(initialItems)
  const [form,    setForm]    = useState({ title: '', content: '', category: 'general' as Category })
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const [delId,   setDelId]   = useState<string | null>(null)

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return }
    setSaving(true); setError(''); setSuccess(false)
    const res  = await fetch('/api/admin/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error || 'Failed'); return }
    setItems(prev => [data.data, ...prev])
    setForm({ title: '', content: '', category: 'general' })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleDelete = async () => {
    if (!delId) return
    // Using PATCH on announcements route doesn't have delete — call directly
    await fetch('/api/admin/announcements', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: delId }),
    })
    setItems(prev => prev.filter(a => a._id !== delId))
    setDelId(null)
  }

  return (
    <>
      {/* Create form */}
      <div className="bg-white border border-stone-200 mb-6">
        <div className="px-5 py-3.5 border-b border-stone-100" style={{ background: '#0F2356' }}>
          <span className="font-serif text-white text-sm">Post Announcement</span>
        </div>
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Title *</label>
              <input required className="form-input" value={form.title} onChange={set('title')}
                placeholder="Announcement title" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Content *</label>
            <textarea required className="form-input resize-y" rows={3}
              value={form.content} onChange={set('content')} placeholder="Write the announcement…" />
          </div>
          {error   && <p className="font-serif text-xs text-red-600">{error}</p>}
          {success && <p className="font-serif text-xs text-emerald-600">✓ Announcement posted successfully</p>}
          <button type="submit" className="btn-primary text-xs px-6 py-2.5 cursor-pointer" disabled={saving}>
            {saving ? 'Posting…' : 'Post Announcement'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="bg-white border border-stone-200 py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-serif text-gray-400">No announcements yet.</p>
          </div>
        )}
        {items.map((a, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5 flex gap-4 group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <StatusBadge value={a.category} />
                <span className="font-serif text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="font-serif text-xs text-gray-400">· by {a.createdBy}</span>
              </div>
              <h3 className="font-serif text-navy-900 font-normal mb-1">{a.title}</h3>
              <p className="font-serif text-sm text-gray-600 leading-relaxed">{a.content}</p>
            </div>
            <button onClick={() => setDelId(a._id)}
              className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors font-serif
                         text-xl leading-none opacity-0 group-hover:opacity-100 cursor-pointer h-5">
              ×
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!delId}
        message="Delete this announcement? Students will no longer see it."
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
      />
    </>
  )
}
