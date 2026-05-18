/**
 * Shared utility functions.
 * Pure functions with no side effects — safe to import anywhere.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge }               from 'tailwind-merge'

/** Merge Tailwind class names safely, resolving conflicts */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a Date or ISO string to long-form human-readable date */
export function formatDate(date: Date | string): string {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

/** Format a Date or ISO string to short-form date */
export function formatDateShort(date: Date | string): string {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

/** Generate a unique student ID: UMS-{YEAR}-{5-digit random} */
export function generateStudentId(): string {
  const year   = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `UMS-${year}-${random}`
}

/** Generate a URL-safe slug from a string */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Safely parse JSON — returns null on error instead of throwing */
export function safeJsonParse<T>(str: string): T | null {
  try { return JSON.parse(str) as T } catch { return null }
}

/** Truncate a string to maxLen characters, appending … if truncated */
export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '…'
}

/** Check if a value is a non-empty string */
export function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
