import { type NextRequest }        from 'next/server'
import { connectDB }                from '@/lib/db'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession }       from '@/lib/auth'
import { listUsers, createStudent } from '@/lib/services'
import { CreateStudentSchema }      from '@/lib/schemas'

export const GET = withHandler('admin', async (req: NextRequest) => {
  const session         = await assertAdminSession()
  const { searchParams } = new URL(req.url)

  await connectDB()
  return apiSuccess(await listUsers(session.user.role, {
    role:    searchParams.get('role')    ?? 'student',
    faculty: searchParams.get('faculty') ?? undefined,
    search:  searchParams.get('search')  ?? undefined,
    page:    Number(searchParams.get('page')  || 1),
    limit:   Number(searchParams.get('limit') || 50),
  }))
})

export const POST = withHandler('admin', async (req: NextRequest) => {
  const session = await assertAdminSession()
  const parsed  = CreateStudentSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  return apiSuccess(await createStudent(session.user.role, parsed.data), 201)
})
