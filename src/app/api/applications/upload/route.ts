import { type NextRequest } from 'next/server'
import { connectDB }         from '@/lib/db'
import { ApplicationModel }  from '@/models'
import type { IUploadedDoc } from '@/models/Application'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { saveFile, validateFile } from '@/lib/storage'
import { DOCUMENT_FIELDS }   from '@/constants'

export const POST = withHandler('public', async (req: NextRequest) => {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return apiError('Invalid multipart form data', 400)
  }

  const applicationId = formData.get('applicationId')
  if (!applicationId || typeof applicationId !== 'string') {
    return apiError('applicationId is required', 422)
  }

  await connectDB()

  const app = await ApplicationModel.findById(applicationId)
  if (!app) return apiError('Application not found', 404)
  if (app.status !== 'draft') {
    return apiError('Cannot upload documents to a submitted application', 409)
  }

  const uploaded: Array<{ fieldKey: string; label: string; originalName: string }> = []
  const errors:   Array<{ field: string; message: string }> = []

  for (const [fieldKey, value] of formData.entries()) {
    if (fieldKey === 'applicationId') continue
    if (!(value instanceof File) || value.size === 0) continue

    const err = validateFile(value)
    if (err) { errors.push(err); continue }

    const saved = await saveFile(value)

    // Replace any existing upload for the same field key
    app.documents = app.documents.filter((d: IUploadedDoc) => d.fieldKey !== fieldKey) as typeof app.documents

    app.documents.push({
      label:        DOCUMENT_FIELDS[fieldKey] ?? fieldKey,
      fieldKey,
      originalName: saved.originalName,
      storedName:   saved.storedName,
      mimeType:     saved.mimeType,
      sizeBytes:    saved.sizeBytes,
      uploadedAt:   new Date(),
    })

    uploaded.push({ fieldKey, label: DOCUMENT_FIELDS[fieldKey] ?? fieldKey, originalName: saved.originalName })
  }

  await app.save()

  if (errors.length > 0 && uploaded.length === 0) {
    return apiError(errors[0].message, 422)
  }

  return apiSuccess({
    uploaded,
    errors,
    documents: app.documents.map((d: IUploadedDoc) => ({
      fieldKey:     d.fieldKey,
      label:        d.label,
      originalName: d.originalName,
      mimeType:     d.mimeType,
      sizeBytes:    d.sizeBytes,
      uploadedAt:   d.uploadedAt,
    })),
  })
})
