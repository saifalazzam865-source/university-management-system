import { connectDB }          from '@/lib/db'
import { ApplicationModel }   from '@/models'
import { UserModel }          from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertStudentSession } from '@/lib/auth'

export const GET = withHandler('auth', async () => {
  const session = await assertStudentSession()
  await connectDB()

  // Re-fetch email from DB — JWT email may lag behind DB changes
  const user = await UserModel
    .findOne({ _id: session.user.id, isActive: true })
    .select('email')
    .lean() as { email: string } | null

  if (!user) return apiError('User not found', 404)

  const applications = await ApplicationModel
    .find({ email: user.email })
    .sort({ createdAt: -1 })
    .select('-documents.storedName')   // never expose internal storage paths
    .lean()

  return apiSuccess(applications)
})
