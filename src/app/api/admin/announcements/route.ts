import { type NextRequest }          from 'next/server'
import { connectDB }                  from '@/lib/db'
import { AnnouncementModel }          from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession }         from '@/lib/auth'
import { AnnouncementCreateSchema }   from '@/lib/schemas'

export const GET = withHandler('public', async () => {
  await connectDB()
  return apiSuccess(await AnnouncementModel.find().sort({ createdAt: -1 }).limit(50).lean())
})

export const POST = withHandler('admin', async (req: NextRequest) => {
  const session = await assertAdminSession()
  const parsed  = AnnouncementCreateSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  const item = await AnnouncementModel.create({
    ...parsed.data,
    createdBy: session.user.name ?? 'Admin',
  })
  return apiSuccess(item, 201)
})

export const DELETE = withHandler('admin', async (req: NextRequest) => {
  await assertAdminSession()
  const { id } = await req.json()
  if (!id) return apiError('id is required', 422)

  await connectDB()
  const item = await AnnouncementModel.findByIdAndDelete(id)
  if (!item) return apiError('Announcement not found', 404)
  return apiSuccess({ deleted: true, id })
})
