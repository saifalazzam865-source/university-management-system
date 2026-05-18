'use client'
import { useState } from 'react'

export function ContactFormClient() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]     = useState(false)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState('')

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoad(true)
    setError('')

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to send message. Please try again.')
        return
      }

      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoad(false)
    }
  }

  if (sent) return (
    <div className="bg-stone-50 p-10 text-center border border-stone-200">
      <div className="text-4xl mb-4">✓</div>
      <h3 className="font-serif text-navy-900 text-xl mb-3">Message Sent</h3>
      <p className="text-gray-500 font-serif leading-relaxed mb-6">
        Thank you for reaching out. A member of our team will respond within 2 business days.
      </p>
      <button className="btn-primary" onClick={() => setSent(false)}>Send Another</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input required className="form-input" value={form.name} onChange={set('name')} placeholder="John Smith" />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input required type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="john@example.com" />
        </div>
      </div>
      <div>
        <label className="form-label">Subject *</label>
        <select required className="form-input" value={form.subject} onChange={set('subject')}>
          <option value="">Select a subject</option>
          <option>Undergraduate Admissions</option>
          <option>Postgraduate Admissions</option>
          <option>Scholarships & Financial Aid</option>
          <option>International Students</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <div>
        <label className="form-label">Message *</label>
        <textarea required className="form-input resize-y" rows={6}
          value={form.message} onChange={set('message')} placeholder="Write your message here..." />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 px-4 py-3 font-serif text-sm text-red-600">
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary self-start" disabled={loading}>
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
