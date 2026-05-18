import { type NextRequest } from 'next/server'
import { connectDB }         from '@/lib/db'
import { NewsModel }         from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession } from '@/lib/auth'
import { NewsUpdateSchema }   from '@/lib/schemas'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  return withHandler('public', async () => {
    await connectDB()
    const doc = await NewsModel.findById(params.id).lean()
    return doc ? apiSuccess(doc) : apiError('Article not found', 404)
  })(req)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async (r) => {
    await assertAdminSession()
    const parsed = NewsUpdateSchema.safeParse(await r.json())
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    await connectDB()
    const updates: Record<string, unknown> = { ...parsed.data }

    // Set publishedAt only on first-ever publish
    if (parsed.data.status === 'published') {
      const existing = await NewsModel.findById(params.id).select('publishedAt').lean() as { publishedAt: Date | null } | null
      if (existing && !existing.publishedAt) {
        updates.publishedAt = new Date()
      }
    }

    const doc = await NewsModel.findByIdAndUpdate(
      params.id, { $set: updates }, { new: true, runValidators: true }
    )
    return doc ? apiSuccess(doc) : apiError('Article not found', 404)
  })(req)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withHandler('admin', async () => {
    await assertAdminSession()
    await connectDB()
    const doc = await NewsModel.findByIdAndDelete(params.id)
    return doc ? apiSuccess({ deleted: true, id: params.id }) : apiError('Article not found', 404)
  })(req)
}
