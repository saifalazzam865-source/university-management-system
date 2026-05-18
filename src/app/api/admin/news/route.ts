import { type NextRequest } from 'next/server'
import { connectDB }         from '@/lib/db'
import { NewsModel }         from '@/models'
import { withHandler, apiSuccess, apiError } from '@/lib/apiHandler'
import { assertAdminSession, getSession }    from '@/lib/auth'
import { NewsCreateSchema }  from '@/lib/schemas'
import { toSlug }            from '@/lib/utils'

export const GET = withHandler('public', async (req: NextRequest) => {
  const session = await getSession()
  const isAdmin = session?.user.role === 'admin'

  await connectDB()
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const category = searchParams.get('category')
  const search   = searchParams.get('search')

  const query: Record<string, unknown> = isAdmin
    ? (status && status !== 'all' ? { status } : {})
    : { status: 'published' }

  if (category) query.category = category
  if (search)   query.$or = [
    { title:   { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } },
  ]

  return apiSuccess(await NewsModel.find(query).sort({ publishedAt: -1, createdAt: -1 }).lean())
})

export const POST = withHandler('admin', async (req: NextRequest) => {
  const session = await assertAdminSession()
  const parsed  = NewsCreateSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  await connectDB()
  const article = await NewsModel.create({
    ...parsed.data,
    slug:        toSlug(parsed.data.title) + '-' + Date.now().toString(36),
    author:      session.user.name ?? 'Admin',
    publishedAt: parsed.data.status === 'published' ? new Date() : null,
  })
  return apiSuccess(article, 201)
})
