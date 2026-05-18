import { type NextRequest }          from 'next/server'
import { connectDB }                  from '@/lib/db'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { registerStudent }            from '@/lib/services'
import { RegisterSchema }             from '@/lib/schemas'

export const POST = withHandler('auth', async (req: NextRequest) => {
  const parsed = RegisterSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  return apiSuccess(await registerStudent(parsed.data), 201)
})
