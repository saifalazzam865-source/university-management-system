/**
 * Application-wide constants and enumerations.
 *
 * Centralising these eliminates scattered magic strings and ensures
 * consistency between validation schemas, DB models, and UI components.
 */

// ── User roles ────────────────────────────────────────────────────────────────

export const USER_ROLES = {
  ADMIN:   'admin',
  STUDENT: 'student',
} as const

export type UserRoleValue = typeof USER_ROLES[keyof typeof USER_ROLES]

// ── Application statuses ──────────────────────────────────────────────────────

export const APPLICATION_STATUS = {
  DRAFT:      'draft',
  SUBMITTED:  'submitted',
  REVIEWING:  'reviewing',
  ACCEPTED:   'accepted',
  REJECTED:   'rejected',
} as const

export type ApplicationStatusValue = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS]

/** Forward-only status ordering — higher number = more advanced */
export const APPLICATION_STATUS_ORDER: Record<string, number> = {
  [APPLICATION_STATUS.DRAFT]:      0,
  [APPLICATION_STATUS.SUBMITTED]:  1,
  [APPLICATION_STATUS.REVIEWING]:  2,
  [APPLICATION_STATUS.ACCEPTED]:   3,
  [APPLICATION_STATUS.REJECTED]:   3,
}

export const ALLOWED_REVIEW_STATUSES = [
  APPLICATION_STATUS.SUBMITTED,
  APPLICATION_STATUS.REVIEWING,
  APPLICATION_STATUS.ACCEPTED,
  APPLICATION_STATUS.REJECTED,
] as const

// ── News ──────────────────────────────────────────────────────────────────────

export const NEWS_STATUS = {
  DRAFT:     'draft',
  PUBLISHED: 'published',
  ARCHIVED:  'archived',
} as const

export const NEWS_CATEGORIES = [
  'research', 'campus', 'awards', 'events', 'academic', 'general',
] as const

export type NewsCategory = typeof NEWS_CATEGORIES[number]

// ── Announcements ─────────────────────────────────────────────────────────────

export const ANNOUNCEMENT_CATEGORIES = [
  'academic', 'general', 'event', 'urgent',
] as const

export type AnnouncementCategory = typeof ANNOUNCEMENT_CATEGORIES[number]

// ── Contact ───────────────────────────────────────────────────────────────────

export const CONTACT_STATUS = {
  NEW:     'new',
  READ:    'read',
  REPLIED: 'replied',
} as const

// ── Document upload fields ────────────────────────────────────────────────────

export const DOCUMENT_FIELDS: Record<string, string> = {
  transcript:           'Academic Transcript',
  nationalId:           'National ID / Passport',
  personalPhoto:        'Personal Photo',
  englishCertificate:   'English Proficiency Certificate',
  recommendationLetter: 'Recommendation Letter',
  cv:                   'Curriculum Vitae (CV)',
}

export const REQUIRED_DOCUMENT_FIELDS = [
  'transcript',
  'nationalId',
  'personalPhoto',
] as const

// ── Academic ──────────────────────────────────────────────────────────────────

export const PROGRAMS = ['undergraduate', 'postgraduate'] as const
export const ENGLISH_LEVELS = ['beginner', 'intermediate', 'advanced', 'native'] as const
export const GENDERS = ['male', 'female', 'other', 'prefer_not'] as const

export const FACULTIES_LIST = [
  'Science & Technology',
  'Law & Political Science',
  'Medicine & Health',
  'Engineering',
  'Arts & Humanities',
  'Business & Economics',
] as const
