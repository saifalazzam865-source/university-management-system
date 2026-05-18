'use client'
import { useState }             from 'react'
import { useRouter }             from 'next/navigation'
import { StepIndicator }         from './StepIndicator'
import { Step1Personal, Step1Data } from './Step1Personal'
import { Step2Academic, Step2Data } from './Step2Academic'
import { Step3Documents, UploadedDocInfo } from './Step3Documents'
import { Step4Review }           from './Step4Review'

const STEP_TITLES = [
  { title: 'Personal Information', sub: 'Tell us about yourself' },
  { title: 'Academic Background',  sub: 'Your education history and program choice' },
  { title: 'Upload Documents',     sub: 'Required supporting materials' },
  { title: 'Review & Submit',      sub: 'Confirm your application details' },
]

export function ApplicationForm() {
  const router = useRouter()

  const [step, setStep]           = useState(1)
  const [appId, setAppId]         = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [submitting, setSubmit]   = useState(false)
  const [error, setError]         = useState('')

  const [step1, setStep1] = useState<Step1Data>({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', nationality: '', address: '', gender: '',
  })
  const [step2, setStep2] = useState<Step2Data>({
    faculty: '', program: '', specialization: '', previousSchool: '',
    graduationYear: '', gpa: '', englishLevel: '', personalStatement: '',
  })
  const [docs, setDocs] = useState<UploadedDocInfo[]>([])

  const updateStep1 = (k: keyof Step1Data, v: string) => setStep1(s => ({ ...s, [k]: v }))
  const updateStep2 = (k: keyof Step2Data, v: string) => setStep2(s => ({ ...s, [k]: v }))

  // ── Validate current step ──────────────────────────────────────────────────

  const validateStep = (): string => {
    if (step === 1) {
      if (!step1.firstName.trim()) return 'First name is required'
      if (!step1.lastName.trim())  return 'Last name is required'
      if (!step1.email.trim())     return 'Email is required'
      if (!step1.phone.trim())     return 'Phone is required'
    }
    if (step === 2) {
      if (!step2.faculty)  return 'Faculty is required'
      if (!step2.program)  return 'Program is required'
      if (!step2.previousSchool.trim()) return 'Previous school is required'
    }
    if (step === 3) {
      const requiredKeys = ['transcript', 'nationalId', 'personalPhoto']
      const uploadedKeys = docs.map(d => d.fieldKey)
      const missing = requiredKeys.filter(k => !uploadedKeys.includes(k))
      if (missing.length > 0) return 'Please upload all required documents (marked REQUIRED)'
    }
    return ''
  }

  // ── Save step to API ───────────────────────────────────────────────────────

  const saveStep = async (stepNum: number): Promise<boolean> => {
    setSaving(true)
    setError('')

    try {
      const payload = stepNum === 1
        ? { step: 1, applicationId: appId, ...step1 }
        : { step: 2, applicationId: appId, ...step2,
            graduationYear: step2.graduationYear ? parseInt(step2.graduationYear) : undefined,
            gpa:            step2.gpa ? parseFloat(step2.gpa) : undefined }

      const res  = await fetch('/api/applications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Save failed'); return false }

      if (stepNum === 1) setAppId(data.data.applicationId)
      return true
    } catch {
      setError('Network error — please try again')
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')

    // Steps 1 & 2 persist to API before advancing
    if (step === 1 || step === 2) {
      const ok = await saveStep(step)
      if (!ok) return
    }

    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setError('')
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Final submit ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!appId) { setError('Session expired — please refresh'); return }
    setSubmit(true)
    setError('')

    try {
      const res  = await fetch('/api/applications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ step: 'submit', applicationId: appId }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Submission failed'); return }

      router.push(`/apply/success?ref=${data.data.applicationRef}`)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmit(false)
    }
  }

  const info = STEP_TITLES[step - 1]

  return (
    <div>
      <StepIndicator current={step} />

      {/* Step header */}
      <div className="mb-7">
        <h2 className="font-serif font-normal text-navy-900 text-2xl mb-1">{info.title}</h2>
        <p className="font-serif text-gray-500 text-sm">{info.sub}</p>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {step === 1 && <Step1Personal data={step1} onChange={updateStep1} />}
        {step === 2 && <Step2Academic data={step2} onChange={updateStep2} />}
        {step === 3 && appId && (
          <Step3Documents
            applicationId={appId}
            uploadedDocs={docs}
            onDocsChange={setDocs}
          />
        )}
        {step === 4 && (
          <Step4Review step1={step1} step2={step2} docs={docs} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-100 px-4 py-3 font-serif text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-5 border-t border-stone-200">
        <button type="button" onClick={handleBack} disabled={step === 1}
          className="font-serif text-sm text-gray-500 hover:text-navy-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2">
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          {(step === 1 || step === 2) && (
            <span className="font-serif text-xs text-gray-400">
              {saving ? 'Saving…' : appId ? '✓ Progress saved' : ''}
            </span>
          )}

          {step < 4 ? (
            <button type="button" onClick={handleNext} disabled={saving}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed px-10">
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
