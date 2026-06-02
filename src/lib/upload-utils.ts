/**
 * Upload utilities — ISOMORPHIC (safe in both Client and Server Components).
 *
 * This module contains ONLY pure helpers and shared types. It must never import
 * `fs`, `path`, `crypto`, the Cloudinary SDK, or anything else Node-only —
 * otherwise it can no longer be imported from Client Components.
 *
 * Server-only file persistence lives in `@/lib/storage` (marked `server-only`).
 */

// ── Shared types ──────────────────────────────────────────────────────────────

export interface SavedFile {
  originalName: string
  /** For cloud storage this is the absolute delivery URL; legacy local files
   *  stored just the UUID filename. `getFileUrl()` handles both. */
  storedName:   string
  mimeType:     string
  sizeBytes:    number
}

export interface FileValidationError {
  field:   string
  message: string
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

/**
 * Publicly resolvable URL for a stored file.
 * - Cloud storage (Cloudinary/S3) returns absolute URLs → used as-is.
 * - Legacy local uploads stored a bare filename → served from `/uploads`.
 */
export function getFileUrl(storedName: string): string {
  if (/^https?:\/\//i.test(storedName)) return storedName
  return `/uploads/${storedName}`
}

/** Human-readable file size string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)      return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

/** Emoji icon for a MIME type */
export function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf')  return '📄'
  if (mimeType.startsWith('image/'))   return '🖼️'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  return '📎'
}
