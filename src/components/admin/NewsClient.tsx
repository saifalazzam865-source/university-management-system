'use client'
import { useState, useMemo } from 'react'
import { Modal, ConfirmDialog, StatusBadge, EmptyState } from './ui'

type NewsStatus   = 'draft' | 'published' | 'archived'
type NewsCategory = 'research' | 'campus' | 'awards' | 'events' | 'academic' | 'general'

interface Article {
  _id:        string
  title:      string
  excerpt:    string
  content:    string
  category:   NewsCategory
  status:     NewsStatus
  tags:       string[]
  author:     string
  featured:   boolean
  publishedAt: string | null
  views:      number
  createdAt:  string
}

const EMPTY = {
  title: '', excerpt: '', content: '', category: 'general' as NewsCategory,
  status: 'draft' as NewsStatus, tags: [] as string[], featured: false,
}

const CATEGORIES: NewsCategory[] = ['general','research','campus','awards','events','academic']
const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' },
]

export function NewsClient({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [tab,      setTab]      = useState('all')
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<Article | null>(null)
  const [delId,    setDelId]    = useState<string | null>(null)
  const [form,     setForm]     = useState(EMPTY)
  const [tags,     setTags]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const visible = useMemo(() =>
    tab === 'all' ? articles : articles.filter(a => a.status === tab),
    [articles, tab]
  )

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setTags(''); setError(''); setModal(true)
  }
  const openEdit = (a: Article) => {
    setEditing(a)
    setForm({ title: a.title, excerpt: a.excerpt, content: a.content,
              category: a.category, status: a.status, tags: a.tags, featured: a.featured })
    setTags(a.tags.join(', '))
    setError(''); setModal(true)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    const payload = { ...form, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }
    const url    = editing ? `/api/admin/news/${editing._id}` : '/api/admin/news'
    const method = editing ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data   = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error || 'Failed'); return }
    setModal(false)
    if (editing) {
      setArticles(prev => prev.map(a => a._id === editing._id ? { ...a, ...payload } : a))
    } else {
      setArticles(prev => [data.data, ...prev])
    }
  }

  const handleStatusChange = async (id: string, status: NewsStatus) => {
    const res  = await fetch(`/api/admin/news/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      setArticles(prev => prev.map(a => a._id === id ? { ...a, status } : a))
    }
  }

  const handleDelete = async () => {
    if (!delId) return
    await fetch(`/api/admin/news/${delId}`, { method: 'DELETE' })
    setArticles(prev => prev.filter(a => a._id !== delId))
    setDelId(null)
  }

  const counts = {
    all:       articles.length,
    draft:     articles.filter(a => a.status === 'draft').length,
    published: articles.filter(a => a.status === 'published').length,
    archived:  articles.filter(a => a.status === 'archived').length,
  }

  return (
    <>
      {/* Tabs + create */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap border-b border-stone-200 pb-0">
        <div className="flex gap-0">
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`px-4 py-2.5 font-serif text-sm border-b-2 -mb-px transition-colors cursor-pointer ${
                tab === t.value
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}>
              {t.label}
              <span className="ml-1.5 font-mono text-[10px] text-gray-400">
                {counts[t.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-primary text-xs px-5 py-2.5 cursor-pointer mb-0.5">
          + New Article
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="📰" title="No articles in this view"
          sub="Switch tabs or create a new article."
          action={<button onClick={openCreate} className="btn-primary text-xs cursor-pointer">+ New Article</button>} />
      ) : (
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full font-serif text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: '#0F2356' }}>
                {['Title', 'Category', 'Status', 'Author', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-white font-normal text-xs tracking-widest uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visible.map((a, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-5 py-3.5 max-w-[260px]">
                    <div className="flex items-start gap-2">
                      {a.featured && (
                        <span className="text-xs mt-0.5 flex-shrink-0" title="Featured">⭐</span>
                      )}
                      <div className="min-w-0">
                        <p className="text-navy-900 font-serif font-normal truncate">{a.title}</p>
                        {a.excerpt && (
                          <p className="text-xs text-gray-400 truncate">{a.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge value={a.category} /></td>
                  <td className="px-5 py-3.5"><StatusBadge value={a.status} /></td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{a.author}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => openEdit(a)}
                        className="font-serif text-xs text-gray-500 hover:text-navy-900 transition-colors cursor-pointer">
                        Edit
                      </button>
                      {a.status === 'draft' && (
                        <button onClick={() => handleStatusChange(a._id, 'published')}
                          className="font-serif text-xs text-emerald-600 hover:underline cursor-pointer">
                          Publish
                        </button>
                      )}
                      {a.status === 'published' && (
                        <button onClick={() => handleStatusChange(a._id, 'archived')}
                          className="font-serif text-xs text-gray-400 hover:text-gray-700 cursor-pointer">
                          Archive
                        </button>
                      )}
                      {a.status === 'archived' && (
                        <button onClick={() => handleStatusChange(a._id, 'published')}
                          className="font-serif text-xs text-blue-600 hover:underline cursor-pointer">
                          Republish
                        </button>
                      )}
                      <button onClick={() => setDelId(a._id)}
                        className="font-serif text-xs text-red-400 hover:text-red-600 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? 'Edit Article' : 'New Article'}
        width="max-w-2xl">
        <div className="p-6 space-y-4">
          <div>
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={set('title')} placeholder="Article title" />
          </div>
          <div>
            <label className="form-label">Excerpt / Summary</label>
            <textarea className="form-input resize-none" rows={2} value={form.excerpt}
              onChange={set('excerpt')} placeholder="One-line summary shown in listings…" />
          </div>
          <div>
            <label className="form-label">Full Content</label>
            <textarea className="form-input resize-y" rows={8} value={form.content}
              onChange={set('content')} placeholder="Write the full article here…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option value="draft">Draft</option>
                <option value="published">Publish Now</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="AI, research, students" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                form.featured ? 'bg-amber-400' : 'bg-stone-300'
              }`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.featured ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
            <label className="font-serif text-xs text-gray-500">Featured article</label>
          </div>

          {error && <p className="font-serif text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)}
              className="flex-1 py-2.5 font-serif text-sm border border-stone-200 text-gray-500
                         hover:bg-stone-50 cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 font-serif text-sm text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ background: '#0F2356' }}>
              {saving ? 'Saving…' : form.status === 'published' ? 'Publish' : 'Save Draft'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        message="Permanently delete this article? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
      />
    </>
  )
}
