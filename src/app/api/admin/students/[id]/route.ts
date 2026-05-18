import { type NextRequest }             from 'next/server'
import { connectDB }                     from '@/lib/db'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession }            from '@/lib/auth'
import { getUserById, updateUser, deleteUser } from '@/lib/services'
import { UpdateStudentSchema }           from '@/lib/schemas'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async () => {
    const session = await assertAdminSession()
    await connectDB()
    const user = await getUserById(session.user.id, session.user.role, params.id)
    return user ? apiSuccess(user) : apiError('Student not found', 404)
  })(req)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async (r) => {
    const session = await assertAdminSession()
    const parsed  = UpdateStudentSchema.safeParse(await r.json())
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    await connectDB()
    return apiSuccess(await updateUser(session.user.id, session.user.role, params.id, parsed.data))
  })(req)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async () => {
    const session = await assertAdminSession()
    await connectDB()
    return apiSuccess(await deleteUser(session.user.role, params.id))
  })(req)
}
