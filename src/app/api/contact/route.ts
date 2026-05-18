import { type NextRequest }          from 'next/server'
import { connectDB }                  from '@/lib/db'
import { ContactModel }               from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession }         from '@/lib/auth'
import { ContactCreateSchema, ContactUpdateSchema } from '@/lib/schemas'

export const POST = withHandler('public', async (req: NextRequest) => {
  const parsed = ContactCreateSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  const contact = await ContactModel.create(parsed.data)
  return apiSuccess({ id: contact._id.toString(), message: 'Your message has been received.' }, 201)
})

export const GET = withHandler('admin', async (req: NextRequest) => {
  await assertAdminSession()
  await connectDB()

  const status = new URL(req.url).searchParams.get('status')
  const query  = status && status !== 'all' ? { status } : {}
  return apiSuccess(await ContactModel.find(query).sort({ createdAt: -1 }).lean())
})

export const PATCH = withHandler('admin', async (req: NextRequest) => {
  await assertAdminSession()

  const parsed = ContactUpdateSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  const contact = await ContactModel.findByIdAndUpdate(
    parsed.data.id,
    { $set: { status: parsed.data.status } },
    { new: true }
  )
  if (!contact) return apiError('Message not found', 404)
  return apiSuccess(contact)
})
