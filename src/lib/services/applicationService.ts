/**
 * ApplicationService — all admission application business logic.
 *
 * Separates domain logic from HTTP concerns.
 * All RBAC assertions and status-transition rules live here.
 */

import type { FilterQuery } from 'mongoose'
import { ApplicationModel, type IApplicationDocument } from '@/models/Application'
import { assertPermission, type UserRole }              from '@/lib/rbac'
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors'
import { logger }                                        from '@/lib/logger'
import {
  APPLICATION_STATUS_ORDER,
  ALLOWED_REVIEW_STATUSES,
  REQUIRED_DOCUMENT_FIELDS,
} from '@/constants'
import { PAGINATION_CONFIG } from '@/config/app.config'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ListApplicationsFilter {
  status?:  string
  faculty?: string
  search?:  string
  page?:    number
  limit?:   number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safePaginate(page?: number, limit?: number) {
  return {
    page:  Math.max(1, page ?? PAGINATION_CONFIG.defaultPage),
    limit: Math.min(Math.max(1, limit ?? PAGINATION_CONFIG.defaultLimit), PAGINATION_CONFIG.maxLimit),
  }
}

// ── List ──────────────────────────────────────────────────────────────────────

export async function listApplications(
  requesterRole: UserRole,
  _requesterId: string,
  filters: ListApplicationsFilter,
) {
  assertPermission(requesterRole, 'application:read:any')

  const { status, faculty, search } = filters
  const { page, limit } = safePaginate(filters.page, filters.limit)

  const query: FilterQuery<IApplicationDocument> = {}
  if (status && status !== 'all') query.status  = status
  if (faculty)                    query.faculty  = faculty
  if (search) {
    query.$or = [
      { firstName:      { $regex: search, $options: 'i' } },
      { lastName:       { $regex: search, $options: 'i' } },
      { email:          { $regex: search, $options: 'i' } },
      { applicationRef: { $regex: search, $options: 'i' } },
    ]
  }

  const [applications, total] = await Promise.all([
    ApplicationModel
      .find(query)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-documents.storedName')   // never expose internal storage paths
      .lean(),
    ApplicationModel.countDocuments(query),
  ])

  return { applications, total, page, limit }
}

// ── Get single ────────────────────────────────────────────────────────────────

export async function getApplicationById(
  requesterRole: UserRole,
  _requesterId: string,
  applicationId: string,
) {
  // Only admins may call this endpoint directly; students use /api/student/applications
  assertPermission(requesterRole, 'application:read:any')

  const app = await ApplicationModel.findById(applicationId).lean()
  if (!app) throw new NotFoundError('Application')
  return app
}

// ── Update status ─────────────────────────────────────────────────────────────

export async function updateApplicationStatus(
  requesterRole: UserRole,
  requesterName: string,
  applicationId: string,
  newStatus: string,
  note?: string,
) {
  assertPermission(requesterRole, 'application:update:status')

  if (!(ALLOWED_REVIEW_STATUSES as readonly string[]).includes(newStatus)) {
    throw new ValidationError(
      `Invalid status. Must be one of: ${ALLOWED_REVIEW_STATUSES.join(', ')}`
    )
  }

  const app = await ApplicationModel.findById(applicationId)
  if (!app) throw new NotFoundError('Application')

  // Enforce forward-only progression
  const current = APPLICATION_STATUS_ORDER[app.status] ?? 0
  const next    = APPLICATION_STATUS_ORDER[newStatus]  ?? 0
  if (next < current) {
    throw new ConflictError(
      `Cannot change status from '${app.status}' to '${newStatus}'`
    )
  }

  app.status     = newStatus as any
  app.reviewNote = note?.trim() || app.reviewNote
  app.reviewedBy = requesterName
  app.timeline.push({
    status:    newStatus,
    note:      note?.trim() ?? '',
    changedBy: requesterName,
    changedAt: new Date(),
  })

  await app.save()

  logger.info('Application status updated', {
    context: 'application',
    meta: { applicationRef: app.applicationRef, status: newStatus },
  })

  return { status: app.status, applicationRef: app.applicationRef }
}

// ── Submit ────────────────────────────────────────────────────────────────────

export async function submitApplication(applicationId: string) {
  const app = await ApplicationModel.findById(applicationId)
  if (!app) throw new NotFoundError('Application')

  if (app.status !== 'draft') {
    throw new ConflictError('Application already submitted')
  }

  const uploadedKeys = app.documents.map((d: any) => d.fieldKey)
  const missing = REQUIRED_DOCUMENT_FIELDS.filter(k => !uploadedKeys.includes(k))
  if (missing.length > 0) {
    throw new ValidationError(`Missing required documents: ${missing.join(', ')}`)
  }

  app.status      = 'submitted'
  app.submittedAt = new Date()
  app.timeline.push({
    status:    'submitted',
    note:      'Application submitted by applicant',
    changedBy: `${app.firstName} ${app.lastName}`,
    changedAt: new Date(),
  })

  await app.save()

  logger.info('Application submitted', {
    context: 'application',
    meta: { applicationRef: app.applicationRef },
  })

  return { applicationRef: app.applicationRef }
}
