import { type NextRequest }          from 'next/server'
import { connectDB }                  from '@/lib/db'
import { FacultyModel }               from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession }         from '@/lib/auth'
import { FacultyCreateSchema }        from '@/lib/schemas'
import { toSlug }                     from '@/lib/utils'

export const GET = withHandler('public', async () => {
  await connectDB()
  return apiSuccess(await FacultyModel.find().sort({ order: 1, name: 1 }).lean())
})

export const POST = withHandler('admin', async (req: NextRequest) => {
  await assertAdminSession()
  const parsed = FacultyCreateSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  const slug   = toSlug(parsed.data.name)
  const exists = await FacultyModel.findOne({ slug }).lean()
  if (exists) return apiError('A faculty with this name already exists', 409)

  return apiSuccess(await FacultyModel.create({ ...parsed.data, slug }), 201)
})
