'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, ConfirmDialog, StatusBadge, EmptyState } from './ui'

const ICONS = ['🏛','⚗️','⚖️','🏥','📐','📚','📊','🔬','💻','🌿','🎨','🌍','⚙️','🧬','📡']

interface Faculty {
  _id: string
  name: string
  icon: string
  description: string
  dean: string
  email: string
  phone: string
  established: number
  programs: string[]
  isActive: boolean
  order: number
}

const EMPTY: Omit<Faculty, '_id'> = {
  name: '',
  icon: '🏛',
  description: '',
  dean: '',
  email: '',
  phone: '',
  established: 0,
  programs: [],
  isActive: true,
  order: 0,
}

export function FacultiesClient({ initialFaculties }: { initialFaculties: Faculty[] }) {
  const router = useRouter()

  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Faculty | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Faculty, '_id'>>(EMPTY)
  const [programs, setPrograms] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setPrograms('')
    setError('')
    setModal(true)
  }

  const openEdit = (f: Faculty) => {
    setEditing(f)
    setForm({ ...f })
    setPrograms(f.programs.join(', '))
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }

    setSaving(true)

    const payload = {
      ...form,
      established: Number(form.established),
      programs: programs.split(',').map(p => p.trim()).filter(Boolean),
    }

    const url = editing
      ? `/api/admin/faculties/${editing._id}`
      : '/api/admin/faculties'

    const method = editing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setSaving(false)

    if (!data.success) {
      setError(data.error || 'Save failed')
      return
    }

    setModal(false)
    router.refresh()

    setFaculties(prev =>
      editing
        ? prev.map(f => (f._id === editing._id ? { ...f, ...payload } : f))
        : [...prev, data.data]
    )
  }

  const handleDelete = async () => {
    if (!delId) return

    await fetch(`/api/admin/faculties/${delId}`, { method: 'DELETE' })

    setFaculties(prev => prev.filter(f => f._id !== delId))
    setDelId(null)
  }

  const toggleActive = async (f: Faculty) => {
    await fetch(`/api/admin/faculties/${f._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !f.isActive }),
    })

    setFaculties(prev =>
      prev.map(x =>
        x._id === f._id ? { ...x, isActive: !x.isActive } : x
      )
    )
  }

  return (
    <>
      <div className="flex justify-end mb-5">
        <button onClick={openCreate} className="btn-primary text-xs px-5 py-2.5">
          + Add Faculty
        </button>
      </div>

      {faculties.length === 0 ? (
        <EmptyState
          icon="🏛"
          title="No faculties yet"
          sub="Add your first faculty to get started."
          action={
            <button onClick={openCreate} className="btn-primary text-xs">
              + Add Faculty
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {faculties.map(f => (
            <div key={f._id} className="bg-white border p-4">
              <div className="flex justify-between">
                <div>
                  <h3>{f.name}</h3>
                  <p className="text-xs">{f.dean}</p>
                </div>

                <StatusBadge value={f.isActive ? 'active' : 'inactive'} />
              </div>

              <p className="text-xs mt-2">{f.description}</p>

              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(f)}>Edit</button>
                <button onClick={() => toggleActive(f)}>
                  {f.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setDelId(f._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Faculty">
        <div className="p-4 space-y-2">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="form-input"
          />

          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="form-input"
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        message="Delete faculty?"
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
      />
    </>
  )
}