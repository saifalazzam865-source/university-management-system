'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole]       = useState<'student' | 'admin'>('student')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email, password, role,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError(res.error === 'CredentialsSignin'
        ? 'Invalid email or password'
        : res.error)
      return
    }

    router.push(role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
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
          <div className="font-serif text-5xl mb-5" style={{ color: '#C8A951' }}>❝</div>
          <p className="text-white/80 font-serif italic text-xl leading-loose mb-6">
            The beautiful thing about learning is that no one can take it away from you.
          </p>
          <p className="font-serif text-sm" style={{ color: '#C8A951' }}>B.B. King</p>
        </div>

        <div className="border-t pt-6 font-serif text-white/40 text-sm"
             style={{ borderColor: 'rgba(200,169,81,0.3)' }}>
          © {new Date().getFullYear()} University Management System
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 no-underline mb-10 lg:hidden">
            <div className="w-9 h-9 flex items-center justify-center text-white font-bold font-serif"
                 style={{ background: '#0F2356' }}>U</div>
            <span className="font-serif text-navy-900 tracking-widest">UMS</span>
          </Link>

          <h1 className="font-serif font-normal text-navy-900 text-3xl mb-2">Welcome back</h1>
          <p className="font-serif text-gray-500 mb-8">Sign in to your university portal</p>

          {/* Role tabs */}
          <div className="flex border border-stone-200 mb-8">
            {(['student', 'admin'] as const).map(r => (
              <button key={r} onClick={() => { setRole(r); setError('') }}
                className={`flex-1 py-3 font-serif text-sm tracking-wide transition-colors capitalize
                  ${role === r
                    ? 'text-white'
                    : 'bg-white text-gray-500 hover:bg-stone-50'}`}
                style={role === r ? { background: '#0F2356' } : {}}>
                {r === 'student' ? '🎓 Student Portal' : '🛡 Admin Portal'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Email Address</label>
              <input required type="email" className="form-input"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@ums.edu' : 'student@ums.edu'} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input required type="password" className="form-input"
                value={password} onChange={e => setPass(e.target.value)}
                placeholder="Enter your password" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 px-4 py-3 font-serif text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-center mt-1" disabled={loading}>
              {loading ? 'Signing in…' : `Sign In as ${role === 'admin' ? 'Administrator' : 'Student'}`}
            </button>
          </form>

          {role === 'student' && (
            <p className="font-serif text-sm text-gray-500 text-center mt-6">
              New student?{' '}
              <Link href="/register" className="no-underline" style={{ color: '#C8A951' }}>
                Create your account →
              </Link>
            </p>
          )}

          {/* Demo credentials hint */}
          <div className="mt-8 border border-stone-200 p-4 bg-stone-50">
            <p className="font-serif text-xs text-gray-400 mb-2 tracking-wide uppercase">Demo Credentials</p>
            <p className="font-serif text-xs text-gray-500">
              Admin: <span className="text-navy-900">admin@ums.edu</span> / <span className="text-navy-900">Admin@1234</span>
            </p>
            <p className="font-serif text-xs text-gray-500">
              Student: <span className="text-navy-900">student@ums.edu</span> / <span className="text-navy-900">Student@1234</span>
            </p>
            <p className="font-serif text-xs text-gray-400 mt-1">(Run <code className="text-navy-900">npm run seed</code> to create these accounts)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
