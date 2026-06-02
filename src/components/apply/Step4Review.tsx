'use client'
import { formatFileSize, getFileIcon } from '@/lib/upload-utils'
import type { Step1Data }              from './Step1Personal'
import type { Step2Data }              from './Step2Academic'
import type { UploadedDocInfo }        from './Step3Documents'

interface Props {
  step1: Step1Data
  step2: Step2Data
  docs:  UploadedDocInfo[]
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-4 py-3 border-b border-stone-100 last:border-none">
      <span className="font-serif text-[11px] text-gray-400 tracking-widest uppercase w-36 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="font-serif text-gray-700 text-sm leading-relaxed">{value}</span>
    </div>
  )
}

export function Step4Review({ step1, step2, docs }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 px-5 py-4">
        <p className="font-serif text-sm text-amber-800">
          <strong>Please review your application carefully.</strong> Once submitted, you cannot edit it.
          Ensure all information is accurate and all required documents are uploaded.
        </p>
      </div>

      {/* Personal */}
      <div className="bg-white border border-stone-200">
        <div className="px-5 py-3 border-b border-stone-200 flex items-center gap-2"
             style={{ background: '#0F2356' }}>
          <span className="font-serif text-white text-sm tracking-wide">Personal Information</span>
        </div>
        <div className="px-5">
          <Row label="Full Name"    value={`${step1.firstName} ${step1.lastName}`} />
          <Row label="Email"        value={step1.email} />
          <Row label="Phone"        value={step1.phone} />
          <Row label="Date of Birth" value={step1.dateOfBirth} />
          <Row label="Nationality"  value={step1.nationality} />
          <Row label="Gender"       value={step1.gender} />
          <Row label="Address"      value={step1.address} />
        </div>
      </div>

      {/* Academic */}
      <div className="bg-white border border-stone-200">
        <div className="px-5 py-3 border-b border-stone-200 flex items-center gap-2"
             style={{ background: '#0F2356' }}>
          <span className="font-serif text-white text-sm tracking-wide">Academic Information</span>
        </div>
        <div className="px-5">
          <Row label="Faculty"         value={step2.faculty} />
          <Row label="Program"         value={step2.program === 'undergraduate' ? "Undergraduate (Bachelor's)" : "Postgraduate (Master's/PhD)"} />
          <Row label="Specialization"  value={step2.specialization} />
          <Row label="Previous School" value={step2.previousSchool} />
          <Row label="Graduation Year" value={step2.graduationYear} />
          <Row label="GPA"             value={step2.gpa ? `${step2.gpa} / 4.0` : undefined} />
          <Row label="English Level"   value={step2.englishLevel} />
        </div>
        {step2.personalStatement && (
          <div className="px-5 py-4 border-t border-stone-100">
            <p className="font-serif text-[11px] text-gray-400 tracking-widest uppercase mb-2">Personal Statement</p>
            <p className="font-serif text-sm text-gray-700 leading-relaxed">{step2.personalStatement}</p>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white border border-stone-200">
        <div className="px-5 py-3 border-b border-stone-200" style={{ background: '#0F2356' }}>
          <span className="font-serif text-white text-sm tracking-wide">Uploaded Documents</span>
        </div>
        <div className="divide-y divide-stone-100">
          {docs.length === 0 ? (
            <p className="px-5 py-4 font-serif text-sm text-gray-400">No documents uploaded</p>
          ) : docs.map((d, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{getFileIcon(d.mimeType)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm text-navy-900">{d.label}</p>
                <p className="font-serif text-xs text-gray-400 truncate">
                  {d.originalName} · {formatFileSize(d.sizeBytes)}
                </p>
              </div>
              <span className="font-serif text-xs text-emerald-600 flex-shrink-0">✓ Uploaded</span>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration */}
      <div className="bg-stone-50 border border-stone-200 px-5 py-4">
        <p className="font-serif text-xs text-gray-500 leading-relaxed">
          By submitting this application, I confirm that all information provided is accurate and complete.
          I understand that providing false information may result in disqualification. I agree to the University Management System
          University's admissions terms and privacy policy.
        </p>
      </div>
    </div>
  )
}
