/**
 * File storage — SERVER-ONLY.
 *
 * The `server-only` import below is a hard build-time guard: if this module is
 * ever (even transitively) imported into a Client Component, the build fails
 * with a clear error instead of leaking Node/Cloudinary internals into the
 * browser bundle. This is what prevents the `Can't resolve 'fs'` class of bug
 * from ever happening again.
 *
 * Storage backend: Cloudinary (works in Vercel's ephemeral serverless FS).
 * To switch to S3, only `saveFile()` needs to change — the interface is stable.
 */

import 'server-only'

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { UPLOAD_CONFIG, CLOUDINARY_CONFIG } from '@/config/app.config'
import type { SavedFile, FileValidationError } from '@/lib/upload-utils'

// ── Lazy, one-time SDK configuration ──────────────────────────────────────────
// Configured on first use so importing this module never throws at build time
// when env vars are absent.

let configured = false
function configureCloudinary(): void {
  if (configured) return
  cloudinary.config({
    cloud_name: CLOUDINARY_CONFIG.cloudName(),
    api_key:    CLOUDINARY_CONFIG.apiKey(),
    api_secret: CLOUDINARY_CONFIG.apiSecret(),
    secure:     true,
  })
  configured = true
}

// ── Validation (server-side authority) ────────────────────────────────────────

export function validateFile(file: File): FileValidationError | null {
  const maxBytes = UPLOAD_CONFIG.maxBytes()

  if (file.size === 0) {
    return { field: file.name, message: `"${file.name}" is empty.` }
  }
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0)
    return { field: file.name, message: `"${file.name}" exceeds the ${mb} MB limit.` }
  }
  if (!UPLOAD_CONFIG.allowedMimes.has(file.type)) {
    return {
      field:   file.name,
      message: `File type "${file.type || 'unknown'}" is not allowed. Use PDF, JPG, PNG, or DOCX.`,
    }
  }
  return null
}

// ── Persistence ───────────────────────────────────────────────────────────────

/**
 * Upload a file to Cloudinary and return its stored metadata.
 * `storedName` holds the absolute Cloudinary delivery URL.
 */
export async function saveFile(file: File): Promise<SavedFile> {
  configureCloudinary()

  const buffer = Buffer.from(await file.arrayBuffer())

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        CLOUDINARY_CONFIG.folder(),
        resource_type: 'auto',                 // images → image, pdf/docx → raw/image automatically
        use_filename:  true,
        unique_filename: true,                 // avoid collisions; Cloudinary appends a suffix
        overwrite:     false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Cloudinary upload returned no result'))
          return
        }
        resolve(uploadResult)
      },
    )
    stream.end(buffer)
  })

  return {
    originalName: file.name,
    storedName:   result.secure_url,
    mimeType:     file.type,
    sizeBytes:    file.size,
  }
}
