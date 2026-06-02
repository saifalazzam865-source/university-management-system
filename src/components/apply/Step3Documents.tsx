'use client'
import { useState, useRef, useCallback } from 'react'
import { formatFileSize, getFileIcon }   from '@/lib/upload-utils'

interface DocField {
  key:      string
  label:    string
  required: boolean
  accept:   string
  hint:     string
}

const DOCUMENT_FIELDS: DocField[] = [
  { key: 'transcript',           label: 'Academic Transcript',                required: true,  accept: '.pdf,.jpg,.png', hint: 'Official transcript from your last institution (PDF or image)' },
  { key: 'nationalId',           label: 'National ID / Passport',             required: true,  accept: '.pdf,.jpg,.png', hint: 'Clear copy of your national ID or passport' },
  { key: 'personalPhoto',        label: 'Personal Photo',                     required: true,  accept: '.jpg,.jpeg,.png', hint: 'Recent passport-style photo (JPG or PNG)' },
  { key: 'englishCertificate',   label: 'English Proficiency Certificate',    required: false, accept: '.pdf,.jpg,.png', hint: 'IELTS, TOEFL, or equivalent (if applicable)' },
  { key: 'recommendationLetter', label: 'Recommendation Letter',              required: false, accept: '.pdf,.doc,.docx', hint: 'From a professor or employer (PDF or Word)' },
  { key: 'cv',                   label: 'Curriculum Vitae (CV)',              required: false, accept: '.pdf,.doc,.docx', hint: 'Your resume or academic CV' },
]

export interface UploadedDocInfo {
  fieldKey:     string
  label:        string
  originalName: string
  mimeType:     string
  sizeBytes:    number
}

interface Props {
  applicationId: string
  uploadedDocs:  UploadedDocInfo[]
  onDocsChange:  (docs: UploadedDocInfo[]) => void
}

export function Step3Documents({ applicationId, uploadedDocs, onDocsChange }: Props) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [errors,    setErrors]    = useState<Record<string, string>>({})
  const [dragOver,  setDragOver]  = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getDoc = (key: string) => uploadedDocs.find(d => d.fieldKey === key)

  const uploadFile = useCallback(async (fieldKey: string, file: File) => {
    // Client-side pre-validation
    if (file.size > 10 * 1024 * 1024) {
      setErrors(e => ({ ...e, [fieldKey]: 'File exceeds 10 MB limit' }))
      return
    }
    const allowed = ['application/pdf','image/jpeg','image/png','image/jpg',
                     'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      setErrors(e => ({ ...e, [fieldKey]: 'Only PDF, JPG, PNG, or DOCX files are allowed' }))
      return
    }

    setErrors(e => ({ ...e, [fieldKey]: '' }))
    setUploading(u => ({ ...u, [fieldKey]: true }))

    const fd = new FormData()
    fd.append('applicationId', applicationId)
    fd.append(fieldKey, file)

    const res  = await fetch('/api/applications/upload', { method: 'POST', body: fd })
    const data = await res.json()

    setUploading(u => ({ ...u, [fieldKey]: false }))

    if (!data.success) {
      setErrors(e => ({ ...e, [fieldKey]: data.error || 'Upload failed' }))
      return
    }

    onDocsChange(data.data.documents)
  }, [applicationId, onDocsChange])

  const handleFileInput = (fieldKey: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(fieldKey, file)
    e.target.value = ''
  }

  const handleDrop = (fieldKey: string) => async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) await uploadFile(fieldKey, file)
  }

  const requiredUploaded = DOCUMENT_FIELDS
    .filter(f => f.required)
    .every(f => getDoc(f.key))

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-stone-50 border border-stone-200 px-5 py-4 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="font-serif text-sm text-navy-900">Required documents</span>
          <span className="font-serif text-xs text-gray-400">
            {DOCUMENT_FIELDS.filter(f => f.required && getDoc(f.key)).length} /
            {DOCUMENT_FIELDS.filter(f => f.required).length} uploaded
          </span>
        </div>
        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-500 rounded-full"
               style={{
                 background: '#C8A951',
                 width: `${(DOCUMENT_FIELDS.filter(f => f.required && getDoc(f.key)).length /
                           DOCUMENT_FIELDS.filter(f => f.required).length) * 100}%`
               }} />
        </div>
      </div>

      {DOCUMENT_FIELDS.map(field => {
        const doc        = getDoc(field.key)
        const isUploading = uploading[field.key]
        const error      = errors[field.key]
        const isDragging = dragOver === field.key

        return (
          <div key={field.key}
               className={`border transition-all ${
                 isDragging ? 'border-gold-500 bg-amber-50'
                 : doc       ? 'border-emerald-200 bg-emerald-50'
                 : error     ? 'border-red-200 bg-red-50'
                             : 'border-stone-200 bg-white'
               }`}
               onDragOver={e => { e.preventDefault(); setDragOver(field.key) }}
               onDragLeave={() => setDragOver(null)}
               onDrop={handleDrop(field.key)}>

            <div className="flex items-start gap-4 p-4">
              {/* Status icon */}
              <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg mt-0.5 ${
                doc ? 'bg-emerald-100' : 'bg-stone-100'
              }`}>
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                ) : doc ? (
                  <span>{getFileIcon(doc.mimeType)}</span>
                ) : (
                  <span className="text-gray-400">📎</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-serif text-sm text-navy-900">{field.label}</span>
                  {field.required && (
                    <span className="font-serif text-[10px] text-red-500 tracking-wide">REQUIRED</span>
                  )}
                  {doc && (
                    <span className="font-serif text-[10px] text-emerald-600 tracking-wide">✓ UPLOADED</span>
                  )}
                </div>
                <p className="font-serif text-xs text-gray-400 mb-1">{field.hint}</p>
                {doc && (
                  <p className="font-serif text-xs text-emerald-700 truncate">
                    {doc.originalName} · {formatFileSize(doc.sizeBytes)}
                  </p>
                )}
                {error && <p className="font-serif text-xs text-red-600 mt-1">{error}</p>}
              </div>

              {/* Upload button */}
              <div className="flex-shrink-0">
                <input
                  ref={el => { inputRefs.current[field.key] = el }}
                  type="file"
                  accept={field.accept}
                  className="hidden"
                  onChange={handleFileInput(field.key)}
                />
                <button type="button" disabled={isUploading}
                  onClick={() => inputRefs.current[field.key]?.click()}
                  className={`font-serif text-xs px-3 py-1.5 border transition-colors cursor-pointer ${
                    doc
                      ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                      : 'border-stone-300 text-gray-600 hover:bg-stone-100'
                  }`}>
                  {isUploading ? 'Uploading…' : doc ? 'Replace' : 'Choose file'}
                </button>
              </div>
            </div>

            {/* Drag hint */}
            {isDragging && (
              <div className="border-t border-gold-300 px-4 py-2 text-center">
                <span className="font-serif text-xs text-gold-600">Drop file here to upload</span>
              </div>
            )}
          </div>
        )
      })}

      {/* Instructions */}
      <div className="bg-stone-50 border border-stone-200 px-5 py-4">
        <p className="font-serif text-xs text-gray-500 font-bold mb-2 tracking-wide uppercase">File Requirements</p>
        <ul className="font-serif text-xs text-gray-500 space-y-1">
          <li>• Maximum file size: <strong>10 MB</strong> per document</li>
          <li>• Accepted formats: <strong>PDF, JPG, PNG, DOCX</strong></li>
          <li>• Files should be clear and legible</li>
          <li>• You can drag & drop files onto each field</li>
        </ul>
      </div>

      {!requiredUploaded && (
        <p className="font-serif text-xs text-amber-600 text-center">
          Please upload all required documents before submitting.
        </p>
      )}
    </div>
  )
}
