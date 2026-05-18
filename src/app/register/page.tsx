'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FACULTIES = [
  'Science & Technology', 'Law & Political Science',
  'Medicine & Health',   'Engineering',
  'Arts & Humanities',   'Business & Economics',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    faculty: '', year: '1', phone: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const res = await fetch('/api/users/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    form.name,
        email:   form.email,
        password: form.password,
        faculty: form.faculty,
        year:    parseInt(form.year),
        phone:   form.phone,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!data.success) {
      setError(data.error || 'Registration failed')
      return
    }

    router.push(`/login?registered=1&id=${data.data.studentId}`)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FAFAF8' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12"
           style={{ background: '#0F2356' }}>
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 flex items-center justify-center text-white font-bold font-serif text-lg"
               style={{ background: '#C8A951' }}>U</div>
          <div>
            <div className="text-white font-serif tracking-widest">UMS</div>
            <div className="font-serif text-xs tracking-[0.14em]" style={{ color: '#C8A951' }}>UNIVERSITY</div>
          </div>
        </Link>

        <div>
          <h2 className="font-serif text-white font-normal text-3xl leading-snug mb-5">
            Begin your academic journey at University Management System.
          </h2>
          <div className="flex flex-col gap-3 mt-8">
            {['Access your course materials', 'Track your academic progress',
              'Stay updated with announcements', 'Connect with your faculty'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center rounded-full text-white text-xs flex-shrink-0"
                     style={{ background: '#C8A951' }}>✓</div>
                <span className="font-serif text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 font-serif text-white/40 text-sm"
             style={{ borderColor: 'rgba(200,169,81,0.3)' }}>
          Already have an account?{' '}
          <Link href="/login" className="no-underline" style={{ color: '#C8A951' }}>Sign in →</Link>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-3 no-underline mb-10 lg:hidden">
            <div className="w-9 h-9 flex items-center justify-center text-white font-bold font-serif"
                 style={{ background: '#0F2356' }}>U</div>
            <span className="font-serif text-navy-900 tracking-widest">UMS</span>
          </Link>

          <h1 className="font-serif font-normal text-navy-900 text-3xl mb-2">Create account</h1>
          <p className="font-serif text-gray-500 mb-8">Student portal registration</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Full Name *</label>
                <input required className="form-input" value={form.name} onChange={set('name')} placeholder="Jane Smith" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Email Address *</label>
                <input required type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input required type="password" className="form-input" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input required type="password" className="form-input" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Faculty *</label>
                <select required className="form-input" value={form.faculty} onChange={set('faculty')}>
                  <option value="">Select your faculty</option>
                  {FACULTIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Year of Study</label>
                <select className="form-input" value={form.year} onChange={set('year')}>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+962 7x xxx xxxx" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 px-4 py-3 font-serif text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-center mt-2" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Student Account'}
            </button>

            <p className="font-serif text-xs text-gray-400 text-center">
              By registering you agree to University Management System's terms and privacy policy.
            </p>
          </form>

          <p className="font-serif text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="no-underline" style={{ color: '#C8A951' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
