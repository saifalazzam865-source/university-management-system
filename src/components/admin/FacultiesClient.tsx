'use client'
import { useState }     from 'react'
import { useRouter }    from 'next/navigation'
import { Modal, ConfirmDialog, StatusBadge, EmptyState } from './ui'

const ICONS = ['🏛','⚗️','⚖️','🏥','📐','📚','📊','🔬','💻','🌿','🎨','🌍','⚙️','🧬','📡']

interface Faculty {
  _id:         string
  name:        string
  icon:        string
  description: string
  dean:        string
  email:       string
  phone:       string
  established: number
  programs:    string[]
  isActive:    boolean
  order:       number
}

const EMPTY: Omit<Faculty, '_id'> = {
  name: '', icon: '🏛', description: '', dean: '', email: '',
  phone: '', established: 0, programs: [], isActive: true, order: 0,
}

export function FacultiesClient({ initialFaculties }: { initialFaculties: Faculty[] }) {
  const router  = useRouter()
  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState<Faculty | null>(null)
  const [delId,   setDelId]   = useState<string | null>(null)
  const [form,    setForm]    = useState<Omit<Faculty, '_id'>>(EMPTY)
  const [programs, setPrograms] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setPrograms(''); setError(''); setModal(true)
  }
  const openEdit = (f: Faculty) => {
    setEditing(f)
    setForm({ name: f.name, icon: f.icon, description: f.description, dean: f.dean,
              email: f.email, phone: f.phone, established: f.established,
              programs: f.programs, isActive: f.isActive, order: f.order })
    setPrograms(f.programs.join(', '))
    setError('')
    setModal(true)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    const payload = {
      ...form,
      established: form.established ? Number(form.established) : undefined,
      programs: programs.split(',').map(p => p.trim()).filter(Boolean),
    }
    const url    = editing ? `/api/admin/faculties/${editing._id}` : '/api/admin/faculties'
    const method = editing ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data   = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error || 'Save failed'); return }
    setModal(false)
    router.refresh()
    // Optimistic update
    if (editing) {
    setFaculties(prev => {
  if (!editing?._id) return [...prev, data.data]

  return prev.map(f =>
    f._id === editing._id
      ? { ...f, ...payload }
      : f
  )
})
  }

  const handleDelete = async () => {
    if (!delId) return
    await fetch(`/api/admin/faculties/${delId}`, { method: 'DELETE' })
    setFaculties(prev => prev.filter(f => f._id !== delId))
    setDelId(null)
  }

  const toggleActive = async (f: Faculty) => {
    await fetch(`/api/admin/faculties/${f._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !f.isActive }),
    })
    setFaculties(prev => prev.map(x => x._id === f._id ? { ...x, isActive: !x.isActive } : x))
  }

  return (
    <>
      <div className="flex justify-end mb-5">
        <button onClick={openCreate} className="btn-primary text-xs px-5 py-2.5 cursor-pointer">
          + Add Faculty
        </button>
      </div>

      {faculties.length === 0 ? (
        <EmptyState icon="🏛" title="No faculties yet"
          sub="Add your first faculty to get started."
          action={<button onClick={openCreate} className="btn-primary text-xs cursor-pointer">+ Add Faculty</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {faculties.map(f => (
            <div key={f._id} className={`bg-white border flex flex-col transition-all hover:shadow-md
              ${f.isActive ? 'border-stone-200' : 'border-stone-100 opacity-60'}`}>
              {/* Card header */}
              <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
                <span className="text-3xl">{f.icon || '🏛'}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-navy-900 font-normal truncate">{f.name}</h3>
                  {f.dean && <p className="font-serif text-xs text-gray-400 truncate">Dean: {f.dean}</p>}
                </div>
                <StatusBadge value={f.isActive ? 'active' : 'inactive'} />
              </div>

              {/* Description */}
              <div className="px-5 py-3 flex-1">
                <p className="font-serif text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {f.description || 'No description provided.'}
                </p>
                {f.programs?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {f.programs.slice(0, 3).map((p, i) => (
                      <span key={i} className="font-serif text-[10px] bg-stone-100 text-gray-500 px-2 py-0.5">{p}</span>
                    ))}
                    {f.programs.length > 3 && (
                      <span className="font-serif text-[10px] text-gray-400">+{f.programs.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-stone-100 flex gap-2">
                <button onClick={() => openEdit(f)}
                  className="flex-1 py-1.5 font-serif text-xs border border-stone-200 text-gray-600
                             hover:bg-stone-50 transition-colors cursor-pointer">
                  Edit
                </button>
                <button onClick={() => toggleActive(f)}
                  className={`flex-1 py-1.5 font-serif text-xs border transition-colors cursor-pointer ${
                    f.isActive
                      ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}>
                  {f.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setDelId(f._id)}
                  className="px-3 py-1.5 font-serif text-xs border border-red-100 text-red-500
                             hover:bg-red-50 transition-colors cursor-pointer">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? `Edit — ${editing.name}` : 'Add New Faculty'}
        width="max-w-xl">
        <div className="p-6 space-y-4">
          {/* Icon picker */}
          <div>
            <label className="form-label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 text-xl flex items-center justify-center border transition-all cursor-pointer
                    ${form.icon === ic ? 'border-navy-900 bg-stone-100' : 'border-stone-200 hover:border-stone-400'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Faculty Name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input resize-none" rows={3} value={form.description}
              onChange={set('description')} placeholder="Brief description of the faculty…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Dean / Head</label>
              <input className="form-input" value={form.dean} onChange={set('dean')} placeholder="Prof. Name" />
            </div>
            <div>
              <label className="form-label">Established</label>
              <input type="number" className="form-input" value={form.established || ''}
                onChange={set('established')} placeholder="e.g. 1985" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email}
                onChange={set('email')} placeholder="faculty@ums.edu" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone}
                onChange={set('phone')} placeholder="+962 2 xxx xxxx" />
            </div>
          </div>
          <div>
            <label className="form-label">Programs (comma-separated)</label>
            <input className="form-input" value={programs}
              onChange={e => setPrograms(e.target.value)}
              placeholder="Computer Science, Cybersecurity, Data Science" />
          </div>
          <div className="flex items-center gap-3">
            <label className="font-serif text-xs text-gray-500 uppercase tracking-widest">Active</label>
            <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                form.isActive ? 'bg-emerald-500' : 'bg-stone-300'
              }`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {error && <p className="font-serif text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)}
              className="flex-1 py-2.5 font-serif text-sm border border-stone-200 text-gray-500
                         hover:bg-stone-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 font-serif text-sm text-white transition-opacity hover:opacity-90
                         disabled:opacity-50 cursor-pointer"
              style={{ background: '#0F2356' }}>
              {saving ? 'Saving…' : editing ? 'Update Faculty' : 'Create Faculty'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        message="Permanently delete this faculty? Students assigned to it will not be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
      />
    </>
  )
}
