/**
 * File upload utilities.
 *
 * Saves files to public/uploads/<uuid>.<ext> (local, for development).
 * In production on Vercel, replace saveFile() with an S3/Cloudinary call —
 * only that function needs changing; the rest of the interface stays the same.
 */

import { writeFile, mkdir } from 'fs/promises'
import { existsSync }       from 'fs'
import path                 from 'path'
import { randomUUID }       from 'crypto'
import { UPLOAD_CONFIG }    from '@/config/app.config'

// ── Public types ──────────────────────────────────────────────────────────────

export interface SavedFile {
  originalName: string
  storedName:   string
  mimeType:     string
  sizeBytes:    number
}

export interface FileValidationError {
  field:   string
  message: string
}

// ── Internals ─────────────────────────────────────────────────────────────────

async function ensureUploadDir(): Promise<void> {
  const dir = UPLOAD_CONFIG.dir()
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

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

/**
 * Persist a file to disk.
 * Swap for S3 / Cloudinary in production — interface is identical.
 */
export async function saveFile(file: File): Promise<SavedFile> {
  await ensureUploadDir()

  const ext        = path.extname(file.name).toLowerCase()
  const storedName = `${randomUUID()}${ext}`
  const buffer     = Buffer.from(await file.arrayBuffer())

  await writeFile(path.join(UPLOAD_CONFIG.dir(), storedName), buffer)

  return { originalName: file.name, storedName, mimeType: file.type, sizeBytes: file.size }
}

/** Publicly accessible URL for a stored file */
export function getFileUrl(storedName: string): string {
  return `/uploads/${storedName}`
}

/** Human-readable file size string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1_048_576)   return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

/** Emoji icon for a MIME type */
export function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf')  return '📄'
  if (mimeType.startsWith('image/'))   return '🖼️'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  return '📎'
}
