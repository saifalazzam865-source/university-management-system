/**
 * POST   /api/applications  — save step or submit (public)
 * GET    /api/applications  — list all (admin only)
 * PATCH  /api/applications  — update status (admin only)
 */

import { type NextRequest }     from 'next/server'
import { connectDB }             from '@/lib/db'
import { ApplicationModel }      from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession }    from '@/lib/auth'
import {
  listApplications,
  updateApplicationStatus,
  submitApplication,
} from '@/lib/services'
import {
  ApplicationStep1Schema,
  ApplicationStep2Schema,
  ApplicationStatusSchema,
} from '@/lib/schemas'

export const POST = withHandler('public', async (req: NextRequest) => {
  const body = await req.json()
  const { step, applicationId, ...data } = body

  if (step === undefined || step === null) return apiError('step is required', 422)

  await connectDB()

  if (step === 1) {
    const parsed = ApplicationStep1Schema.safeParse(data)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    if (applicationId) {
      const app = await ApplicationModel.findOne({ _id: applicationId, status: 'draft' })
      if (!app) return apiError('Draft application not found', 404)
      Object.assign(app, parsed.data)
      await app.save()
      return apiSuccess({ applicationId: app._id.toString(), applicationRef: app.applicationRef })
    }

    const app = await ApplicationModel.create({ ...parsed.data, status: 'draft' })
    return apiSuccess({ applicationId: app._id.toString(), applicationRef: app.applicationRef }, 201)
  }

  if (step === 2) {
    if (!applicationId) return apiError('applicationId is required for step 2', 422)
    const parsed = ApplicationStep2Schema.safeParse(data)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const app = await ApplicationModel.findOne({ _id: applicationId, status: 'draft' })
    if (!app) return apiError('Draft application not found', 404)
    Object.assign(app, parsed.data)
    await app.save()
    return apiSuccess({ applicationId: app._id.toString(), applicationRef: app.applicationRef })
  }

  if (step === 'submit') {
    if (!applicationId) return apiError('applicationId is required', 422)
    return apiSuccess(await submitApplication(applicationId))
  }

  return apiError('Invalid step — must be 1, 2, or "submit"', 422)
})

export const GET = withHandler('admin', async (req: NextRequest) => {
  const session         = await assertAdminSession()
  const { searchParams } = new URL(req.url)

  await connectDB()
  return apiSuccess(await listApplications(session.user.role, session.user.id, {
    status:  searchParams.get('status')  ?? undefined,
    faculty: searchParams.get('faculty') ?? undefined,
    search:  searchParams.get('search')  ?? undefined,
    page:    Number(searchParams.get('page')  || 1),
    limit:   Number(searchParams.get('limit') || 50),
  }))
})

export const PATCH = withHandler('admin', async (req: NextRequest) => {
  const session = await assertAdminSession()
  const parsed  = ApplicationStatusSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  return apiSuccess(await updateApplicationStatus(
    session.user.role,
    session.user.name ?? 'Admin',
    parsed.data.id,
    parsed.data.status,
    parsed.data.note,
  ))
})
