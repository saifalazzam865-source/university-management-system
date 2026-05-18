import { type NextRequest } from 'next/server'
import { connectDB }         from '@/lib/db'
import { FacultyModel }      from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession } from '@/lib/auth'
import { FacultyUpdateSchema } from '@/lib/schemas'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  return withHandler('public', async () => {
    await connectDB()
    const doc = await FacultyModel.findById(params.id).lean()
    return doc ? apiSuccess(doc) : apiError('Faculty not found', 404)
  })(req)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async (r) => {
    await assertAdminSession()
    const parsed = FacultyUpdateSchema.safeParse(await r.json())
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    await connectDB()
    const doc = await FacultyModel.findByIdAndUpdate(
      params.id, { $set: parsed.data }, { new: true, runValidators: true }
    )
    return doc ? apiSuccess(doc) : apiError('Faculty not found', 404)
  })(req)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async () => {
    await assertAdminSession()
    await connectDB()
    const doc = await FacultyModel.findByIdAndDelete(params.id)
    return doc ? apiSuccess({ deleted: true, id: params.id }) : apiError('Faculty not found', 404)
  })(req)
}
