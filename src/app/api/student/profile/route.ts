import { type NextRequest }         from 'next/server'
import { connectDB }                 from '@/lib/db'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertStudentSession }      from '@/lib/auth'
import { getUserById, updateUser }   from '@/lib/services'
import { UpdateProfileSchema }       from '@/lib/schemas'

export const GET = withHandler('auth', async () => {
  const session = await assertStudentSession()
  await connectDB()
  const user = await getUserById(session.user.id, 'student', session.user.id)
  return user ? apiSuccess(user) : apiError('Profile not found', 404)
})

export const PATCH = withHandler('auth', async (req: NextRequest) => {
  const session = await assertStudentSession()
  const parsed  = UpdateProfileSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  return apiSuccess(await updateUser(session.user.id, 'student', session.user.id, parsed.data))
})
