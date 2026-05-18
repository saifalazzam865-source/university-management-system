'use client'
import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { ConfirmDialog } from './ui'

interface Props {
  student:   any
  faculties: string[]
}

export function StudentEditForm({ student, faculties }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name:     student.name    || '',
    faculty:  student.faculty || '',
    year:     String(student.year || 1),
    gpa:      String(student.gpa  ?? ''),
    phone:    student.phone   || '',
    isActive: student.isActive !== false,
  })
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDel,  setShowDel]  = useState(false)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('')
    const res  = await fetch(`/api/admin/students/${student._id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        ...form,
        year: parseInt(form.year),
        gpa:  form.gpa ? parseFloat(form.gpa) : undefined,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error || 'Update failed'); return }
    setSuccess('Changes saved')
    router.refresh()
  }

  const handleToggleActive = async () => {
    const newVal = !form.isActive
    setForm(f => ({ ...f, isActive: newVal }))
    await fetch(`/api/admin/students/${student._id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: newVal }),
    })
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/admin/students/${student._id}`, { method: 'DELETE' })
    router.push('/admin/students')
  }

  const FIELDS = [
    { label: 'Full Name', key: 'name',  type: 'text',   placeholder: 'Full name' },
    { label: 'Phone',     key: 'phone', type: 'text',   placeholder: '+962 7x xxx xxxx' },
    { label: 'GPA',       key: 'gpa',   type: 'number', placeholder: '0.00–4.00' },
  ]

  return (
    <div className="space-y-4">
      {FIELDS.map(f => (
        <div key={f.key}>
          <label className="form-label">{f.label}</label>
          <input type={f.type} className="form-input" value={(form as any)[f.key]}
            onChange={set(f.key)} placeholder={f.placeholder}
            step={f.type === 'number' ? '0.01' : undefined}
            min={f.type === 'number' ? '0' : undefined}
            max={f.type === 'number' ? '4' : undefined} />
        </div>
      ))}

      <div>
        <label className="form-label">Faculty</label>
        <select className="form-input" value={form.faculty} onChange={set('faculty')}>
          <option value="">— Select —</option>
          {faculties.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label">Year of Study</label>
        <select className="form-input" value={form.year} onChange={set('year')}>
          {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {error   && <p className="font-serif text-xs text-red-600">{error}</p>}
      {success && <p className="font-serif text-xs text-emerald-600">✓ {success}</p>}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 font-serif text-sm text-white transition-opacity hover:opacity-90 cursor-pointer"
        style={{ background: '#0F2356' }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>

      <div className="border-t border-stone-100 pt-4 space-y-2">
        <p className="font-serif text-[10px] text-gray-400 uppercase tracking-wider mb-2">Account Actions</p>

        <button onClick={handleToggleActive}
          className={`w-full py-2 font-serif text-xs border transition-colors cursor-pointer ${
            form.isActive
              ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}>
          {form.isActive ? 'Deactivate Account' : 'Reactivate Account'}
        </button>

        <button onClick={() => setShowDel(true)}
          className="w-full py-2 font-serif text-xs border border-red-200 text-red-600
                     hover:bg-red-50 transition-colors cursor-pointer">
          Delete Student
        </button>
      </div>

      <ConfirmDialog
        open={showDel}
        message={`Permanently delete ${student.name}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDel(false)}
      />
    </div>
  )
}
