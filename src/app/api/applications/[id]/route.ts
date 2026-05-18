import { type NextRequest } from 'next/server'
import { connectDB }         from '@/lib/db'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession } from '@/lib/auth'
import { getApplicationById } from '@/lib/services'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async () => {
    const session = await assertAdminSession()
    await connectDB()
    return apiSuccess(await getApplicationById(session.user.role, session.user.id, params.id))
  })(req)
}
